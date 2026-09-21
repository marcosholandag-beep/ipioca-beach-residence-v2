/* =============================================================================
 * Traqueamento + envio de leads — Ipioca Beach Residence
 * Trilha Performance Digital
 *
 * O que este arquivo faz:
 *   1. Captura a atribuição (utm_*, gclid, fbclid) e guarda na sessão
 *   2. Deriva os 4 campos que o Kommo precisa: origem, campanha, conjunto, anúncio
 *   3. Valida o formulário de verdade (o original aceitava submit vazio)
 *   4. Posta direto no webhook do Make
 *   5. Dispara eventos no dataLayer (GTM) e o evento Lead do Meta
 * ========================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    // Webhook do Make, chamado direto do navegador.
    //
    // Escolha consciente: esta URL fica VISÍVEL no código-fonte da página.
    // Ninguém consegue ler leads por ela (o webhook só aceita escrita), mas
    // alguém poderia despejar leads falsos, e no Make cada um custa operação.
    // As defesas contra isso estão logo abaixo (honeypot + tempo) e dentro do
    // cenário do Make. Se um dia aparecer spam, é só gerar uma URL nova no
    // Make e trocar aqui — leva 2 minutos. Ver TRAQUEAMENTO.md.
    endpoint: 'https://hook.us2.make.com/h837oil6ltgdc1bnaoq88jl0s31qfgqd',

    // Se um dia o Pixel migrar para dentro do GTM, troque para true.
    // Evita o evento Lead disparar duas vezes.
    pixelViaGTM: false,

    chaveSessao: 'ibr_atrib',

    // Submit mais rápido que isto, contado do carregamento da página, é robô.
    tempoMinimoMs: 3000,

    tag: 'landing-page-tp',

    // ViewContent = "o lead chegou nesta etapa do site".
    // Hoje aponta para a seção "Como funciona": quem chega aí entendeu o
    // produto, é visita qualificada. Para mudar a etapa, basta trocar o id
    // (opções: topo, ipioca, mme, empreendimento, funciona, depoimentos,
    //  vale, rci, donos, socios, form, faq).
    etapaViewContent: 'funciona',

    // Marcos de rolagem, em %, que viram evento.
    marcosScroll: [25, 50, 75, 90],

    // Cidade e região do visitante.
    // O /cdn-cgi/trace do Cloudflare entrega IP, país e datacenter, mas NÃO
    // cidade/região. Para isso é preciso publicar o Worker (worker/), que
    // lê request.cf. Depois de publicado, aponte aqui:  '/api/geo'
    // Vazio = não busca, e os campos ficam em branco.
    geoEndpoint: '',
  };

  // ---------------------------------------------------------------------------
  // dataLayer
  // ---------------------------------------------------------------------------
  window.dataLayer = window.dataLayer || [];
  function push(evento, dados) {
    window.dataLayer.push(Object.assign({ event: evento }, dados || {}));
  }

  // ---------------------------------------------------------------------------
  // Atribuição
  // ---------------------------------------------------------------------------
  function param(nome) {
    try {
      return new URLSearchParams(window.location.search).get(nome) || '';
    } catch (e) {
      return '';
    }
  }

  function cookie(nome) {
    var m = document.cookie.match('(^|;)\\s*' + nome + '\\s*=\\s*([^;]+)');
    return m ? m.pop() : '';
  }

  function guarda(obj) {
    try {
      sessionStorage.setItem(CONFIG.chaveSessao, JSON.stringify(obj));
    } catch (e) {
      /* modo privado / storage bloqueado — segue sem persistir */
    }
  }

  function recupera() {
    try {
      return JSON.parse(sessionStorage.getItem(CONFIG.chaveSessao) || 'null');
    } catch (e) {
      return null;
    }
  }

  /** meta | google | organico_* | direto */
  function normalizaOrigem(source, medium, clickIds) {
    var s = (source || '').toLowerCase();

    if (/facebook|fb|instagram|^ig$|meta/.test(s)) return 'meta';
    if (/google|gads|adwords|youtube|gdn/.test(s)) return 'google';
    if (s) return s;

    // Sem utm_source? Os click IDs entregam a origem.
    if (clickIds.fbclid) return 'meta';
    if (clickIds.gclid || clickIds.wbraid || clickIds.gbraid) return 'google';

    // Nem isso? Cai para o referrer.
    var ref = (document.referrer || '').toLowerCase();
    if (!ref || ref.indexOf(location.hostname) > -1) return 'direto';
    if (/google\./.test(ref)) return 'organico_google';
    if (/facebook\.|instagram\./.test(ref)) return 'organico_meta';
    return 'referral';
  }

  function montaAtribuicao() {
    var utm = {
      source: param('utm_source'),
      medium: param('utm_medium'),
      campaign: param('utm_campaign'),
      content: param('utm_content'),
      term: param('utm_term'),
      id: param('utm_id'),
    };

    var clickIds = {
      gclid: param('gclid'),
      wbraid: param('wbraid'),
      gbraid: param('gbraid'),
      fbclid: param('fbclid'),
    };

    var temAlgo =
      utm.source || utm.campaign || clickIds.gclid || clickIds.fbclid ||
      clickIds.wbraid || clickIds.gbraid;

    // Chegou com parâmetros novos = clique novo = atribuição nova.
    // Sem parâmetros (refresh, voltar), mantém o que já estava na sessão.
    if (!temAlgo) {
      var salvo = recupera();
      if (salvo) return salvo;
    }

    var atrib = {
      origem: normalizaOrigem(utm.source, utm.medium, clickIds),
      campanha: utm.campaign || '',
      conjunto: utm.content || '', // Meta: {{adset.name}}
      anuncio: utm.term || '', // Meta: {{ad.name}}
      utm: utm,
      click_ids: clickIds,
      landing: window.location.href.slice(0, 500),
      referrer: (document.referrer || '').slice(0, 500),
      em: new Date().toISOString(),
    };

    guarda(atrib);
    return atrib;
  }

  var ATRIB = montaAtribuicao();

  push('atribuicao_pronta', {
    origem: ATRIB.origem,
    campanha: ATRIB.campanha,
    conjunto: ATRIB.conjunto,
    anuncio: ATRIB.anuncio,
  });

  // ---------------------------------------------------------------------------
  // Perfil do visitante (o "VisitorAPI" próprio)
  //
  // Tudo de graça e de primeira mão, sem serviço de terceiro:
  //   - navegador, SO, dispositivo, tela, idioma, fuso: puro JavaScript
  //   - IP e país: /cdn-cgi/trace, que o Cloudflare já serve no próprio
  //     domínio (mesma origem, sem chave, sem CORS). Em localhost dá 404 e
  //     a parte de rede simplesmente não vem — a página não quebra.
  //
  // LGPD: IP é dado pessoal. Se for parar no Kommo, precisa estar na
  // política de privacidade.
  // ---------------------------------------------------------------------------
  var VISITANTE = (function () {
    var d = {};
    try {
      var ua = navigator.userAgent || '';
      d.user_agent = ua.slice(0, 400);

      var nav = [
        ['Edge', /Edg(?:e|A|iOS)?\/([\d.]+)/],
        ['Opera', /(?:OPR|Opera)\/([\d.]+)/],
        ['Samsung', /SamsungBrowser\/([\d.]+)/],
        ['Chrome', /Chrome\/([\d.]+)/],
        ['Firefox', /Firefox\/([\d.]+)/],
        ['Safari', /Version\/([\d.]+).*Safari/],
      ];
      d.navegador = 'outro';
      d.navegador_versao = '';
      for (var i = 0; i < nav.length; i++) {
        var m = ua.match(nav[i][1]);
        if (m) { d.navegador = nav[i][0]; d.navegador_versao = m[1].split('.')[0]; break; }
      }

      // Ordem importa: Android também contém "Linux", e iPadOS recente se
      // apresenta como "Macintosh". Por isso os casos específicos vêm antes.
      d.so = /Windows/.test(ua) ? 'Windows'
        : /Android/.test(ua) ? 'Android'
        : /iPhone|iPad|iPod/.test(ua) ? 'iOS'
        : /Mac OS X|Macintosh/.test(ua) ? 'macOS'
        : /Linux|X11/.test(ua) ? 'Linux' : 'outro';

      d.dispositivo = /iPad|Tablet/.test(ua) ? 'tablet'
        : /Mobi|Android|iPhone/.test(ua) ? 'mobile' : 'desktop';

      if (window.screen) {
        d.tela = screen.width + 'x' + screen.height;
        d.dpr = window.devicePixelRatio || 1;
      }
      d.viewport = (window.innerWidth || 0) + 'x' + (window.innerHeight || 0);
      d.idioma = navigator.language || '';

      if (window.Intl && Intl.DateTimeFormat) {
        d.fuso = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      }

      if (navigator.connection) d.conexao = navigator.connection.effectiveType || '';
      if (navigator.hardwareConcurrency) d.nucleos = navigator.hardwareConcurrency;
      if (navigator.deviceMemory) d.memoria_gb = navigator.deviceMemory;
    } catch (e) {}
    return d;
  })();

  push('visitante_pronto', VISITANTE);

  // Parte de rede: assíncrona, e pode não vir (localhost, bloqueio, offline).
  var REDE = {};
  (function () {
    if (typeof fetch !== 'function') return;
    try {
      fetch('/cdn-cgi/trace', { credentials: 'omit' })
        .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
        .then(function (txt) {
          txt.split('\n').forEach(function (linha) {
            var i = linha.indexOf('=');
            if (i < 0) return;
            var k = linha.slice(0, i);
            var v = linha.slice(i + 1);
            if (k === 'ip') REDE.ip = v;
            else if (k === 'loc') REDE.pais = v;
            else if (k === 'colo') REDE.datacenter = v;
            else if (k === 'http') REDE.protocolo = v;
            else if (k === 'tls') REDE.tls = v;
          });
          if (REDE.ip) push('visitante_rede', REDE);
        })
        .catch(function () { /* sem Cloudflare na frente: segue sem isso */ });
    } catch (e) {}

    // Cidade/região: só existe se o Worker estiver publicado.
    if (!CONFIG.geoEndpoint) return;
    try {
      fetch(CONFIG.geoEndpoint, { credentials: 'omit' })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function (g) {
          if (g.cidade) REDE.cidade = g.cidade;
          if (g.regiao) REDE.regiao = g.regiao;
          if (g.pais && !REDE.pais) REDE.pais = g.pais;
          if (g.ip && !REDE.ip) REDE.ip = g.ip;
          push('visitante_geo', REDE);
        })
        .catch(function () {});
    } catch (e) {}
  })();

  // Exposto para o GTM ler direto numa variável de JavaScript personalizado,
  // sem precisar varrer o dataLayer. Ver gtm/js_personalizado_visitorapi.js
  window.IBR = window.IBR || {};
  window.IBR.visitante = VISITANTE;
  window.IBR.rede = REDE;
  window.IBR.atribuicao = ATRIB;

  function idEvento() {
    try {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) {}
    return 'evt-' + Date.now() + '-' + Math.random().toString(16).slice(2, 10);
  }

  // ---------------------------------------------------------------------------
  // Eventos de engajamento
  // ---------------------------------------------------------------------------
  document.querySelectorAll('a[href="#form"]').forEach(function (a) {
    a.addEventListener('click', function () {
      push('cta_click', {
        texto: (a.textContent || '').trim().slice(0, 60),
        local: a.className || 'sem-classe',
      });
    });
  });

  // WhatsApp pula o formulário: sem este evento, o clique some da medição.
  document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"]').forEach(function (a) {
    a.addEventListener('click', function () {
      push('whatsapp_click', {
        local: a.className || 'sem-classe',
        origem: ATRIB.origem,
        campanha: ATRIB.campanha,
        conjunto: ATRIB.conjunto,
        anuncio: ATRIB.anuncio,
      });
    });
  });

  document.querySelectorAll('.faq-q').forEach(function (b) {
    b.addEventListener('click', function () {
      push('faq_open', { pergunta: (b.textContent || '').trim().slice(0, 100) });
    });
  });

  // --- Etapas do site --------------------------------------------------------
  // Cada seção vira um evento quando entra na tela (uma vez só por visita).
  // A seção escolhida em CONFIG.etapaViewContent dispara também o view_content.
  if (typeof window.IntersectionObserver === 'function') {
    var secoes = document.querySelectorAll('section[id]');
    if (secoes.length) {
      var vistas = {};
      var obs = new window.IntersectionObserver(
        function (entradas) {
          for (var i = 0; i < entradas.length; i++) {
            var e = entradas[i];
            if (!e.isIntersecting) continue;

            // "Vista" = metade da seção OU metade da tela ocupada por ela, o
            // que vier primeiro. Só "50% da seção" falharia em seção mais alta
            // que duas telas (comum no celular): nunca chegaria a 50%.
            var alturaVisivel = e.intersectionRect ? e.intersectionRect.height : 0;
            var alturaSecao = e.boundingClientRect ? e.boundingClientRect.height : 0;
            var alturaTela = window.innerHeight || 0;
            var exigido = Math.min(alturaSecao * 0.5, alturaTela * 0.5);
            if (exigido > 0 && alturaVisivel < exigido) continue;

            var id = e.target.id;
            if (vistas[id]) continue;
            vistas[id] = true;
            obs.unobserve(e.target);

            push('secao_view', { secao: id });

            if (id === CONFIG.etapaViewContent) {
              push('view_content', {
                secao: id,
                origem: ATRIB.origem,
                campanha: ATRIB.campanha,
                conjunto: ATRIB.conjunto,
                anuncio: ATRIB.anuncio,
              });
            }
          }
        },
        // Vários pontos de corte para o callback rodar enquanto a seção entra
        // na tela; a decisão de "vista" é feita acima.
        { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
      );
      for (var s = 0; s < secoes.length; s++) obs.observe(secoes[s]);
    }
  }

  // --- Profundidade de rolagem ----------------------------------------------
  (function () {
    var marcos = CONFIG.marcosScroll.slice().sort(function (a, b) { return a - b; });
    var idx = 0;
    if (!marcos.length) return;

    function confere() {
      var doc = document.documentElement;
      var alturaTotal = doc.scrollHeight - window.innerHeight;
      if (alturaTotal <= 0) return;
      var pct = ((window.pageYOffset || doc.scrollTop) / alturaTotal) * 100;

      while (idx < marcos.length && pct >= marcos[idx]) {
        push('scroll_depth', { percentual: marcos[idx] });
        idx++;
      }
      if (idx >= marcos.length) window.removeEventListener('scroll', confere);
    }

    window.addEventListener('scroll', confere, { passive: true });
    confere();
  })();

  // ---------------------------------------------------------------------------
  // Formulário
  // ---------------------------------------------------------------------------
  var form = document.getElementById('lp-form');
  var sucesso = document.getElementById('form-success');
  if (!form) return;

  var abertoEm = Date.now();
  var jaComecou = false;
  var enviando = false;

  form.addEventListener(
    'input',
    function () {
      if (jaComecou) return;
      jaComecou = true;
      push('lead_form_start');
    },
    { once: false }
  );

  // --- validação -------------------------------------------------------------
  function erroDoCampo(campo) {
    var caixa = campo.closest('.form-field');
    var rotulo = campo.closest('.form-check'); // este é um <label>

    // Dentro de .form-field pode anexar. Dentro de um <label> não:
    // <p> não é conteúdo válido ali, e clicar no erro marcaria o checkbox.
    var anexar = caixa
      ? function (el) { caixa.appendChild(el); }
      : rotulo
      ? function (el) { rotulo.insertAdjacentElement('afterend', el); }
      : function (el) { campo.parentElement.appendChild(el); };

    var referencia = caixa || rotulo || campo.parentElement;
    var el = caixa
      ? caixa.querySelector('.campo-erro')
      : referencia.nextElementSibling &&
        referencia.nextElementSibling.classList.contains('campo-erro')
      ? referencia.nextElementSibling
      : null;

    if (!el) {
      el = document.createElement('span');
      el.className = 'campo-erro';
      el.setAttribute('role', 'alert');
      anexar(el);
    }
    return el;
  }

  function marca(campo, mensagem) {
    var el = erroDoCampo(campo);
    if (mensagem) {
      el.textContent = mensagem;
      el.style.display = 'block';
      campo.setAttribute('aria-invalid', 'true');
    } else {
      el.textContent = '';
      el.style.display = 'none';
      campo.removeAttribute('aria-invalid');
    }
  }

  function valida() {
    var nome = form.querySelector('#f-nome');
    var email = form.querySelector('#f-email');
    var tel = form.querySelector('#f-tel');
    var consent = form.querySelector('[name="consentimento"]');
    var falhas = [];

    marca(nome, '');
    marca(email, '');
    marca(tel, '');
    marca(consent, '');

    if (nome.value.trim().length < 2) {
      marca(nome, 'Escreva seu nome.');
      falhas.push('nome');
    }
    if (!/^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$/.test(email.value.trim())) {
      marca(email, 'Confira o e-mail.');
      falhas.push('email');
    }
    var digitos = tel.value.replace(/\D/g, '');
    if (digitos.length < 10 || digitos.length > 11) {
      marca(tel, 'Informe DDD + número.');
      falhas.push('telefone');
    }
    if (!consent.checked) {
      marca(consent, 'Precisamos do seu aceite para entrar em contato.');
      falhas.push('consentimento');
    }

    if (falhas.length) {
      var primeiro = form.querySelector('[aria-invalid="true"]');
      if (primeiro) {
        primeiro.focus({ preventScroll: true });
        primeiro.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    return falhas;
  }

  // --- envio -----------------------------------------------------------------
  function avisoGeral(mensagem) {
    var el = form.querySelector('.form-aviso');
    if (!el) {
      el = document.createElement('p');
      el.className = 'form-aviso';
      el.setAttribute('role', 'alert');
      form.appendChild(el);
    }
    el.textContent = mensagem || '';
    el.style.display = mensagem ? 'block' : 'none';
  }

  function mostraSucesso() {
    form.style.display = 'none';
    if (!sucesso) return;
    sucesso.classList.add('show');
    setTimeout(function () {
      sucesso.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (enviando) return;

    // --- Anti-bot ------------------------------------------------------------
    // Sem servidor no meio, esta é a única barreira antes do Make. Quando cai
    // aqui, mostramos "sucesso" de propósito: o robô vai embora achando que
    // funcionou, em vez de ficar tentando variações — e nenhuma operação do
    // Make é gasta. O tempo é contado do carregamento da página, então nem
    // autofill dispara falso positivo (ninguém carrega, rola até o form e
    // envia em menos de 3s).
    var isca = form.querySelector('[name="campo_extra"]');
    if ((isca && isca.value) || Date.now() - abertoEm < CONFIG.tempoMinimoMs) {
      push('lead_form_bot');
      mostraSucesso();
      return;
    }

    var falhas = valida();
    push('lead_form_submit', { valido: falhas.length === 0, erros: falhas.join(',') || null });
    if (falhas.length) return;

    var botao = form.querySelector('button[type="submit"]');
    var textoOriginal = botao ? botao.textContent : '';
    enviando = true;
    if (botao) {
      botao.disabled = true;
      botao.textContent = 'Enviando...';
    }
    avisoGeral('');

    var eventId = idEvento();
    var digitos = form.querySelector('#f-tel').value.replace(/\D/g, '');

    var corpo = {
      tag: CONFIG.tag,

      nome: form.querySelector('#f-nome').value.trim(),
      email: form.querySelector('#f-email').value.trim().toLowerCase(),
      telefone: form.querySelector('#f-tel').value.trim(),
      telefone_e164: '+55' + digitos,

      // Os 4 campos que o Kommo precisa
      origem: ATRIB.origem,
      campanha: ATRIB.campanha || null,
      conjunto: ATRIB.conjunto || null,
      anuncio: ATRIB.anuncio || null,

      quer_parceiro: !!form.querySelector('[name="parceiro"]').checked,

      // Trilha de consentimento (LGPD)
      consentimento: true,
      consentimento_texto:
        'Aceito receber contato do time comercial do Ipioca Beach Residence.',
      consentimento_em: new Date().toISOString(),

      utm: ATRIB.utm,
      click_ids: Object.assign({}, ATRIB.click_ids, {
        fbp: cookie('_fbp'),
        fbc: cookie('_fbc'),
      }),

      pagina: window.location.href,
      referrer: ATRIB.referrer,
      enviado_em: new Date().toISOString(),

      // Perfil do visitante. "rede" pode vir vazio se o /cdn-cgi/trace
      // não respondeu a tempo — o envio do lead nunca espera por ele.
      visitante: VISITANTE,
      rede: REDE,

      // Dedup com a CAPI do Meta, quando vocês ligarem a conversão offline
      event_id: eventId,
    };

    fetch(CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
      keepalive: true,
    })
      .then(function (r) {
        // O Make responde "Accepted" em texto puro, não JSON.
        // Então quem manda é o status HTTP.
        if (!r.ok) throw new Error('http_' + r.status);

        var partes = corpo.nome.split(/\s+/);

        push('generate_lead', {
          origem: ATRIB.origem,
          campanha: ATRIB.campanha,
          conjunto: ATRIB.conjunto,
          anuncio: ATRIB.anuncio,
          event_id: eventId,

          // Dados do lead para correspondência avançada do Meta/Google.
          // Ficam aqui para o GTM ler da camada de dados em vez de raspar o
          // DOM — não quebra quando o HTML da página muda.
          nome: corpo.nome,
          primeiro_nome: partes[0] || '',
          ultimo_nome: partes.length > 1 ? partes.slice(1).join(' ') : '',
          email: corpo.email,
          telefone_digitos: '55' + digitos, // sem "+", como o Meta espera
        });

        if (!CONFIG.pixelViaGTM && typeof window.fbq === 'function') {
          window.fbq('track', 'Lead', {
            content_name: 'Ipioca Beach Residence — LP',
          }, { eventID: eventId });
        }

        mostraSucesso();
      })
      .catch(function (err) {
        enviando = false;
        if (botao) {
          botao.disabled = false;
          botao.textContent = textoOriginal;
        }
        avisoGeral(
          'Não conseguimos enviar agora. Tente de novo em instantes ou chame no WhatsApp (82) 8788-4755.'
        );
        push('lead_form_erro', { motivo: String((err && err.message) || 'desconhecido') });
      });
  });

})();
