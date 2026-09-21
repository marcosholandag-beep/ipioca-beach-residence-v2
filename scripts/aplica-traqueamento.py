#!/usr/bin/env python3
"""
Reaplica GTM + Meta Pixel + integracao do formulario nas paginas da LP.

Fluxo combinado com a Ana: ela edita o hero-v-a.html e commita. Depois:

    git pull
    python3 scripts/aplica-traqueamento.py

E idempotente: rodar duas vezes nao duplica nada. Se um trecho ja existe, ele
e pulado. Se a Ana mexer no formulario ou no fim do arquivo, o script avisa em
vez de aplicar errado.

Uso:
    python3 scripts/aplica-traqueamento.py                 # arquivos padrao
    python3 scripts/aplica-traqueamento.py outra-pagina.html
"""
import re
import sys

GTM_ID = 'GTM-NL6VZ5HQ'
PIXEL_ID = '586420452079899'
PADRAO = ['hero-v-a.html', 'index.html']

GTM_HEAD = """<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','%s');</script>
<!-- End Google Tag Manager -->""" % GTM_ID

GTM_BODY = """<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=%s"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->""" % GTM_ID

PIXEL = """<!-- Meta Pixel — Ipioca Beach Residence — %(id)s -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '%(id)s');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none" alt=""
src="https://www.facebook.com/tr?id=%(id)s&ev=PageView&noscript=1"></noscript>
""" % {'id': PIXEL_ID}

CSS = """
/* --- Traqueamento: mensagens de validacao + honeypot --------------------- */
.campo-erro {
  display: none;
  margin-top: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #C0392B;
  line-height: 1.4;
}
.form-check + .campo-erro { margin-top: -12px; }
.form-aviso {
  display: none;
  margin-top: 4px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #FDECEA;
  color: #8E2A21;
  font-size: 13px;
  line-height: 1.5;
}
.form-field input[aria-invalid="true"] { border-color: #C0392B; }
.form button[type="submit"][disabled] { opacity: .6; cursor: progress; }
.hp-campo {
  position: absolute !important;
  left: -9999px !important;
  width: 1px; height: 1px;
  overflow: hidden;
}
"""

HONEYPOT = """      <div class="hp-campo" aria-hidden="true">
        <label for="f-campo-extra">Nao preencha este campo</label>
        <input id="f-campo-extra" name="campo_extra" type="text" tabindex="-1" autocomplete="off">
      </div>
"""

BOTAO = '      <button type="submit" class="btn btn-primary form-cta">'
SCRIPT = '<script src="assets/js/traqueamento.js" defer></script>'

HANDLER_ANTIGO = re.compile(
    r'\n// Formulário\n// TODO: substituir.*?'
    r'setTimeout\(\(\) => \{ success\.scrollIntoView.*?\n\}\);\n',
    re.S,
)
PLACEHOLDER = re.compile(
    r'\n<!-- ============ TRAQUEAMENTO ============ -->\n'
    r'<!-- GTM: assim que.*?GTM-XXXXXXX\'\);</script>\n-->\n',
    re.S,
)


def aplica(caminho):
    try:
        h = open(caminho, encoding='utf-8').read()
    except FileNotFoundError:
        return ['ARQUIVO NAO ENCONTRADO'], False

    feito, alertas = [], []

    if PLACEHOLDER.search(h):
        h = PLACEHOLDER.sub('\n', h)
        feito.append('placeholder GTM antigo removido')

    if '</head>' not in h or '<body' not in h:
        return ['ESTRUTURA INESPERADA: falta <head> ou <body>'], False

    # GTM no topo do head, logo depois do viewport
    if GTM_ID not in h[:h.index('</head>')]:
        vp = re.search(r'<meta name="viewport"[^>]*>\n', h)
        if not vp:
            alertas.append('sem <meta viewport>: GTM do head NAO aplicado')
        else:
            h = h[:vp.end()] + GTM_HEAD + '\n' + h[vp.end():]
            feito.append('GTM no <head>')

    # noscript logo depois do <body>
    if 'ns.html?id=' + GTM_ID not in h:
        b = re.search(r'<body[^>]*>\n', h)
        if not b:
            alertas.append('sem <body> em linha propria: noscript NAO aplicado')
        else:
            h = h[:b.end()] + GTM_BODY + '\n' + h[b.end():]
            feito.append('GTM noscript')

    if "fbq('init', '%s')" % PIXEL_ID not in h:
        i = h.index('</head>')
        h = h[:i] + PIXEL + h[i:]
        feito.append('Meta Pixel')

    if '.campo-erro' not in h:
        fim_head = h.index('</head>')
        if '</style>' not in h[:fim_head]:
            alertas.append('sem <style> no head: CSS NAO aplicado')
        else:
            i = h.rindex('</style>', 0, fim_head)
            h = h[:i] + CSS + h[i:]
            feito.append('CSS validacao/honeypot')

    if 'name="campo_extra"' not in h:
        n = h.count(BOTAO)
        if n != 1:
            alertas.append('botao de submit encontrado %d vez(es): honeypot NAO aplicado' % n)
        else:
            h = h.replace(BOTAO, HONEYPOT + BOTAO, 1)
            feito.append('honeypot')

    if HANDLER_ANTIGO.search(h):
        h = HANDLER_ANTIGO.sub(
            '\n// O envio do formulario agora vive em assets/js/traqueamento.js\n', h)
        feito.append('handler console.log removido')
    elif 'Lead capturado' in h:
        alertas.append('sobrou "Lead capturado" no arquivo: confira o handler antigo a mao')

    if SCRIPT not in h:
        if '</body>' not in h:
            alertas.append('sem </body>: script NAO aplicado')
        else:
            i = h.rindex('</body>')
            h = h[:i] + SCRIPT + '\n\n' + h[i:]
            feito.append('<script traqueamento.js>')

    if not h.count('id="lp-form"'):
        alertas.append('esta pagina nao tem o formulario (id="lp-form")')

    open(caminho, 'w', encoding='utf-8').write(h)
    return feito, alertas


def main():
    arquivos = sys.argv[1:] or PADRAO
    problemas = False
    for f in arquivos:
        feito, alertas = aplica(f)
        print(f + ':')
        for x in feito:
            print('  + ' + x)
        for x in (alertas or []):
            print('  ! ' + x)
            problemas = True
        if not feito and not alertas:
            print('  (ja estava tudo aplicado)')
    print('\nDepois de rodar, confira no navegador: DevTools > Network > envie o form')
    print('e veja hook.us2.make.com retornando 200.')
    sys.exit(1 if problemas else 0)


if __name__ == '__main__':
    main()
