# Traqueamento e captação de leads — Ipioca Beach Residence

Documento operacional. Trilha Performance Digital.

## Como funciona

```
navegador  ──POST (JSON)──►  webhook do Make  ──►  Kommo
```

O formulário chama o webhook do Make direto do navegador. Confirmado que funciona:
o Make responde `access-control-allow-origin: *` e aceita `POST` com
`content-type: application/json`, então não há bloqueio de CORS.

### A URL do webhook fica visível — e tudo bem, com ressalva

Ela está em `assets/js/traqueamento.js`, então qualquer pessoa que abrir o
código-fonte da página consegue lê-la. Decisão consciente: um relay no servidor
seria mais uma peça para manter, e o volume da LP não justifica.

O que isso significa na prática:

- **Não vaza lead nenhum.** O webhook só aceita escrita. Ninguém lê o que já entrou.
- **O risco é entrada de lixo.** Alguém poderia despejar leads falsos, e no Make
  cada um consome operação. Poluiria o Kommo e estragaria seu CPL.

As defesas estão descritas abaixo. **Se um dia aparecer spam**, há duas saídas, nesta ordem:

1. **Gerar uma URL nova no Make** e trocar em `assets/js/traqueamento.js`. Leva 2 minutos.
2. Se voltar a acontecer, publicar o `worker/lead-relay.js` — já está pronto e testado,
   esconde a URL de vez. Passo a passo no fim deste documento.

## Arquivos

| Arquivo | O que é |
|---|---|
| `assets/js/traqueamento.js` | Atribuição, validação, envio ao Make e eventos |
| `scripts/aplica-traqueamento.py` | Reaplica GTM, Pixel e integração depois que a Ana commitar ajustes no HTML: `git pull` e depois `python3 scripts/aplica-traqueamento.py` |
| `index.html` e `hero-v-a.html` | GTM, Pixel, campo-isca no form e a tag do script — nos dois, porque ainda não está definido qual vai ao ar |
| `worker/` | **Plano B, não está no ar.** Relay que esconde a URL |

---

## 1. Subir a landing page

Mandar o TI republicar com os arquivos alterados: `index.html` e a pasta `assets/js/`.
Sem build, sem dependência — é copiar por cima.

## 2. GTM — instalado (`GTM-NL6VZ5HQ`)

Instalado no `index.html` e no `hero-v-a.html`: script no topo do `<head>` e
`noscript` logo após o `<body>`. As tags, acionadores e variáveis ainda precisam ser
criados **dentro do container**, a partir dos eventos da tabela abaixo.

> ⚠️ **Meta Pixel:** o código base está direto na página e já dispara `PageView` e
> `Lead` sozinho. Tags de `ViewContent` e `Contact` no GTM podem ser criadas
> normalmente. **Se criarem a tag de `Lead` no GTM**, troquem `pixelViaGTM` para
> `true` em `assets/js/traqueamento.js` — senão o `Lead` conta em dobro.

## 3. Testar sem sujar o Kommo

Preencha o formulário usando um e-mail com sufixo de teste:

```
joao+teste@trilha.com.br
```

E no cenário do Make, logo depois do webhook, coloque um **filtro** que desvia
qualquer `email` contendo `+teste` para um caminho que não cria negócio no Kommo.
Assim vocês testam à vontade, inclusive depois de estar no ar.

No navegador, abra o **DevTools → Network**, envie o form e confirme:
`hook.us2.make.com` com status **200**. Se vier erro, a página mostra aviso com o
WhatsApp em vez de "Recebemos!" — nunca um falso sucesso.

---

## Proteção contra lead falso

Como não há servidor no meio, a barreira tem duas camadas.

**No site (`assets/js/traqueamento.js`)**

- **Campo-isca (honeypot)** — um input escondido chamado `campo_extra`. Humano
  nunca vê; robô que preenche formulário automaticamente cai nele.
- **Tempo mínimo** — submit em menos de 3 segundos contados do carregamento da
  página é robô. Ninguém carrega, rola até o formulário e envia nesse tempo, então
  não há risco de barrar lead real, nem com autofill.
- **Validação real** — nome, e-mail, telefone (10–11 dígitos) e o aceite de contato.

Quando cai numa dessas, a página **mostra "sucesso" de propósito** e não chama o
Make. O robô vai embora achando que funcionou, em vez de ficar tentando variações,
e nenhuma operação é gasta.

**No cenário do Make (façam isso — é a última linha de defesa)**

Um filtro logo após o webhook, deixando passar só o que tiver:

- `tag` igual a `landing-page-tp`
- `nome` com 2 caracteres ou mais
- `email` com formato válido
- `telefone_e164` começando com `+55` e com 13 ou 14 caracteres
- `consentimento` verdadeiro

Vale também um **dedupe por telefone**, para o mesmo lead enviando duas vezes não
virar dois negócios.

> O webhook do Make expõe os headers da requisição se vocês ativarem nas
> configurações avançadas. Dá para pegar o IP do visitante no `x-forwarded-for`,
> caso queiram registrar ou bloquear repetição.

---

## Parametrização das campanhas

Aqui mora a diferença entre o Kommo receber nomes legíveis ou números soltos.

### Meta — resolve sozinho

No campo **Parâmetros de URL** do anúncio:

```
utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{adset.name}}&utm_term={{ad.name}}&utm_id={{campaign.id}}
```

O Meta substitui pelos nomes reais no clique. Nada a fazer depois.

> ⚠️ Evitem `&`, `#` e `?` nos nomes de campanha/conjunto/anúncio — quebram a URL.
> `|`, hífen e espaço funcionam normalmente.

### Google Ads — tem uma limitação real

**O Google Ads não tem ValueTrack de nome.** Só existe `{campaignid}`,
`{adgroupid}` e `{creative}`, que são IDs numéricos. Não dá para puxar
"Campanha Institucional" automaticamente como no Meta.

Duas saídas:

**A. Nome fixo por campanha (recomendado para começar)**
No **Sufixo do URL final**, no nível da campanha:

```
utm_source=google&utm_medium=cpc&utm_campaign=NOME-DESTA-CAMPANHA&utm_content={adgroupid}&utm_term={creative}
```

Campanha vira nome legível; grupo e anúncio ficam como ID e vocês resolvem o
de-para no relatório. Custo: lembrar de editar o sufixo em cada campanha nova.

**B. Parâmetros personalizados**
Definir `{_campanha}`, `{_conjunto}` e `{_anuncio}` em cada nível e usar:

```
utm_source=google&utm_medium=cpc&utm_campaign={_campanha}&utm_content={_conjunto}&utm_term={_anuncio}
```

Fica completo, mas exige preencher em cada grupo e cada anúncio. Só compensa se a
conta for enxuta.

**Manter o auto-tagging ligado** nos dois casos — é ele que traz o `gclid`, e o
`gclid` é o que permite importar a venda de volta como conversão offline quando o
lead fechar no Kommo.

---

## O que o Make recebe

```json
{
  "tag": "landing-page-tp",

  "nome": "Joao Vincent",
  "email": "joao.vincent@example.com",
  "telefone": "(82) 98788-4755",
  "telefone_e164": "+5582987884755",

  "origem": "meta",
  "campanha": "IBR | Conversao | Frio",
  "conjunto": "Casais 35-55 | AL+PE",
  "anuncio": "Video Faro 30s | v2",

  "quer_parceiro": true,

  "consentimento": true,
  "consentimento_texto": "Aceito receber contato do time comercial...",
  "consentimento_em": "2026-09-10T06:12:00.000Z",

  "utm": { "source": "meta", "medium": "paid", "campaign": "...", "content": "...", "term": "...", "id": "..." },
  "click_ids": { "gclid": "", "wbraid": "", "gbraid": "", "fbclid": "IwAR...", "fbp": "fb.1...", "fbc": "fb.1..." },

  "pagina": "https://lp.ipiocabeachresidence.com.br/?utm_source=meta...",
  "referrer": "",
  "enviado_em": "2026-09-10T06:12:00.000Z",
  "event_id": "uuid-para-deduplicar-com-a-CAPI"
}
```

`origem` sai normalizada como `meta`, `google`, `organico_google`, `organico_meta`,
`referral` ou `direto` — nunca em branco. Ela é deduzida do `utm_source`; se não
houver, do `gclid`/`fbclid`; se não houver, do referrer.

A atribuição fica guardada na sessão do navegador. Se o visitante der F5 e a URL
perder os parâmetros, o lead **continua** saindo como `meta`/`google` em vez de
virar `direto` — que é o erro clássico que faz campanha paga sumir do relatório.

**Guardem `gclid`, `fbclid`, `fbp` e `fbc` num campo do Kommo.** São eles que
permitem mandar a venda de volta para o Meta (CAPI) e para o Google (importação de
conversão offline) quando o negócio fechar. Sem isso, as plataformas otimizam para
"quem preenche formulário" em vez de "quem compra" — que é o que interessa num
funil de venda por telefone.

---

## Eventos no dataLayer

| Evento | Quando | Serve para |
|---|---|---|
| `atribuicao_pronta` | Carregamento | Origem, campanha, conjunto, anúncio |
| `cta_click` | Clique em qualquer um dos 7 CTAs | Qual CTA puxa lead |
| `lead_form_start` | Primeira digitação no form | Início x conclusão |
| `lead_form_submit` | Submit (válido ou não) | Atrito de validação |
| `generate_lead` | **Conversão confirmada** | GA4 e Google Ads |
| `lead_form_erro` | Falha no envio | Alarme de integração quebrada |
| `lead_form_bot` | Isca ou tempo barrou o envio | Medir volume de robô |
| `whatsapp_click` | Clique no botão de WhatsApp (com origem/campanha) | Lead que pulou o formulário |
| `faq_open` | Abertura de FAQ | Objeção mais consultada |

`generate_lead` é o único que deve virar conversão. Ele **só dispara depois** de o
Make responder 200 — nunca em falso positivo.

O Pixel do Meta dispara `Lead` com `eventID` igual ao `event_id` do payload. Isso é
de propósito: quando ligarem a CAPI, o Meta deduplica sozinho e não conta a
conversão duas vezes.

> Se um dia moverem o Pixel para dentro do GTM, trocar `pixelViaGTM: false` para
> `true` em `assets/js/traqueamento.js`. Senão o `Lead` conta em dobro.

---

## Também foi corrigido

O formulário original tinha `novalidate` e nenhuma validação em JS — **submit
totalmente vazio exibia "Recebemos!"**. Agora valida de verdade, e só mostra
sucesso se o Make confirmou o recebimento. Se a integração cair, o usuário vê uma
mensagem com o WhatsApp em vez de um falso "deu certo".

---

## Plano B: esconder a URL do webhook

Só se aparecer spam. O código está em `worker/` e já passou nos testes.

```bash
cd worker
npx wrangler login
npx wrangler secret put MAKE_WEBHOOK_URL     # cola a URL do Make quando pedir
npx wrangler deploy
```

Depois, em `assets/js/traqueamento.js`, trocar o `endpoint` para `/api/lead`.
Precisa de acesso ao Cloudflare da zona `ipiocabeachresidence.com.br` — é por lá
que o subdomínio já passa hoje.

---

## Pendências

- [ ] Criar tags/acionadores no container `GTM-NL6VZ5HQ` (GA4 + conversão do Ads em `generate_lead`)
- [ ] Conta Google: GA4 + ID de conversão do Ads
- [ ] Definir qual arquivo vai ao ar: `index.html` ou `hero-v-a.html`
- [ ] Filtro de validação e dedupe no cenário do Make
- [ ] Política de Privacidade e Termos — hoje apontam para `href="#"`, e a página coleta dado pessoal
