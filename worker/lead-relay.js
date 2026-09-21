/**
 * Relay de leads — Ipioca Beach Residence
 *
 * ┌───────────────────────────────────────────────────────────────────────┐
 * │  PLANO B — NÃO ESTÁ NO AR.                                            │
 * │                                                                       │
 * │  Hoje a landing page chama o webhook do Make direto, e a URL fica     │
 * │  visível no código-fonte. Foi decisão consciente: menos peça para     │
 * │  manter, e o volume da LP não justifica.                              │
 * │                                                                       │
 * │  Este arquivo existe para o dia em que aparecer spam de lead falso    │
 * │  queimando operação do Make. Está pronto e testado — publicar leva    │
 * │  uns 15 minutos (passo a passo em TRAQUEAMENTO.md).                   │
 * └───────────────────────────────────────────────────────────────────────┘
 *
 * O navegador posta em https://lp.ipiocabeachresidence.com.br/api/lead
 * Este Worker valida, enriquece e repassa para o webhook do Make.
 *
 * A URL do Make NUNCA aparece no front-end. Ela vive como secret:
 *   npx wrangler secret put MAKE_WEBHOOK_URL
 *
 * Variáveis:
 *   MAKE_WEBHOOK_URL   (secret)  URL do webhook do Make
 *   TURNSTILE_SECRET   (secret)  opcional — só se ativar o Turnstile
 *   ALLOWED_ORIGINS    (var)     lista separada por vírgula
 */

const TAG = 'landing-page-tp';
const TEMPO_MINIMO_MS = 3000; // submit mais rápido que isso é bot

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const permitidas = (env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const origemOk = permitidas.length === 0 || permitidas.includes(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(origin, origemOk) });
    }

    // GET /api/geo — cidade, regiao e pais do visitante.
    // O /cdn-cgi/trace do Cloudflare nao entrega cidade; request.cf entrega.
    // Nao devolve nada alem da localizacao, e nao grava nada.
    if (request.method === 'GET' && new URL(request.url).pathname.endsWith('/geo')) {
      const cf = request.cf || {};
      return json(
        {
          ip: request.headers.get('CF-Connecting-IP') || '',
          pais: request.headers.get('CF-IPCountry') || cf.country || '',
          regiao: cf.region || '',
          cidade: cf.city || '',
          fuso: cf.timezone || '',
        },
        200,
        origin,
        origemOk
      );
    }

    if (request.method !== 'POST') {
      return json({ ok: false, erro: 'method_not_allowed' }, 405, origin, origemOk);
    }
    if (!origemOk) {
      return json({ ok: false, erro: 'origin_not_allowed' }, 403, origin, origemOk);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, erro: 'json_invalido' }, 400, origin, origemOk);
    }

    // --- Anti-bot -----------------------------------------------------------
    // Descarte SILENCIOSO: responde 200 para o bot achar que funcionou e não
    // ficar tentando variações. Nada é enviado ao Make (não queima operação).
    if (body.website) return json({ ok: true }, 200, origin, origemOk);
    if (typeof body._dt === 'number' && body._dt < TEMPO_MINIMO_MS) {
      return json({ ok: true }, 200, origin, origemOk);
    }

    // --- Turnstile (opcional) ----------------------------------------------
    if (env.TURNSTILE_SECRET) {
      const ok = await validaTurnstile(env.TURNSTILE_SECRET, body.turnstile_token, request);
      if (!ok) return json({ ok: true }, 200, origin, origemOk);
    }

    // --- Validação real -----------------------------------------------------
    const nome = limpa(body.nome, 120);
    const email = limpa(body.email, 160).toLowerCase();
    const digitos = String(body.telefone || '').replace(/\D/g, '');
    const erros = [];

    if (nome.length < 2) erros.push('nome');
    if (!/^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$/.test(email)) erros.push('email');
    if (digitos.length < 10 || digitos.length > 11) erros.push('telefone');
    if (body.consentimento !== true) erros.push('consentimento');

    if (erros.length) {
      return json({ ok: false, erro: 'validacao', campos: erros }, 422, origin, origemOk);
    }

    // --- Payload para o Make / Kommo ----------------------------------------
    const cf = request.cf || {};
    const payload = {
      tag: TAG,

      nome,
      email,
      telefone: formataBR(digitos),
      telefone_e164: '+55' + digitos,

      // Os 4 campos que o Kommo precisa
      origem: body.origem || 'direto',
      campanha: limpa(body.campanha, 200) || null,
      conjunto: limpa(body.conjunto, 200) || null,
      anuncio: limpa(body.anuncio, 200) || null,

      quer_parceiro: body.parceiro === true,

      // Trilha de consentimento (LGPD)
      consentimento: true,
      consentimento_texto:
        'Aceito receber contato do time comercial do Ipioca Beach Residence.',
      consentimento_em: new Date().toISOString(),

      utm: body.utm || {},
      click_ids: body.click_ids || {},

      pagina: limpa(body.pagina, 500),
      referrer: limpa(body.referrer, 500),
      enviado_em: new Date().toISOString(),

      // Enriquecimento do lado do servidor (o navegador não controla isso)
      ip: request.headers.get('CF-Connecting-IP') || null,
      pais: request.headers.get('CF-IPCountry') || null,
      cidade: cf.city || null,
      regiao: cf.region || null,
      user_agent: limpa(request.headers.get('User-Agent'), 400),
    };

    try {
      const r = await fetch(env.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        console.error('Make respondeu', r.status, await r.text().catch(() => ''));
        return json({ ok: false, erro: 'upstream' }, 502, origin, origemOk);
      }
    } catch (e) {
      console.error('Falha ao chamar o Make:', e.message);
      return json({ ok: false, erro: 'upstream' }, 502, origin, origemOk);
    }

    return json({ ok: true }, 200, origin, origemOk);
  },
};

// --- helpers ---------------------------------------------------------------

function limpa(v, max) {
  return String(v == null ? '' : v)
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .slice(0, max);
}

function formataBR(d) {
  return d.length === 11
    ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
    : `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
}

function cors(origin, ok) {
  return {
    'Access-Control-Allow-Origin': ok && origin ? origin : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(obj, status, origin, ok) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors(origin, ok) },
  });
}

async function validaTurnstile(secret, token, request) {
  if (!token) return false;
  const fd = new FormData();
  fd.append('secret', secret);
  fd.append('response', token);
  fd.append('remoteip', request.headers.get('CF-Connecting-IP') || '');
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: fd,
  });
  const d = await r.json().catch(() => ({}));
  return d.success === true;
}
