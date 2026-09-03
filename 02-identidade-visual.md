# Identidade Visual — Landing Page Ipioca Beach Residence

> Base: logo oficial + site ipiocabeachresidence.com.br + 3 criativos de anúncio já em rodagem.
> Diretriz: **respeitar a IDV existente**, aumentar o "peso visual" do Brasil (praia, coqueiro, pôr do sol) e da promessa "casa de férias vitalícia".

---

## 1. Paleta oficial (extraída do site + anúncios)

| Cor | Hex | RGB | Uso |
|---|---|---|---|
| 🟧 **Laranja Ipioca** | `#EA8036` | `234, 128, 54` | Cor primária. CTAs, destaques, tags, ícone do logo, "IPIOCA BEACH RESIDENCE" quando isolado |
| ⬜ **Branco puro** | `#FFFFFF` | `255, 255, 255` | Texto sobre foto, fundos de cards |
| 🟫 **Cinza-bege Logo** | `#B8B0A0` | `184, 176, 160` | Cor do texto "IPIOCA BEACH" no logo colorido (nunca usar para body text) |
| 🟫 **Cinza texto** | `#666666` | `102, 102, 102` | Body text, formulário escuro |
| 🟨 **Bege areia** | `#F1F0EB` | `241, 240, 235` | Fundo neutro (seções claras) |
| ⬛ **Preto profundo** | `#111111` | `17, 17, 17` | Rodapé, texto quando precisa de contraste máximo |

### Paleta de apoio (para gradientes e emoções da região)
| Cor | Hex | Uso |
|---|---|---|
| 🟦 **Turquesa mar** | `#2FB5B0` | Gradientes sobre foto, ícones "praia" |
| 🟦 **Azul profundo** | `#0D5A6E` | Contraste do turquesa em backgrounds |
| 🟨 **Dourado pôr-do-sol** | `#F5B04A` | Gradient overlay em fotos, apenas decorativo |

**Regra de uso:** o laranja `#EA8036` é a assinatura da marca. Nunca substituir por outra cor de CTA. Nas seções claras, ele contrasta sobre o bege `#F1F0EB`; nas seções escuras/foto, ele contrasta sobre azul-profundo ou preto.

---

## 2. Tipografia

Fontes idênticas ao site oficial:

| Uso | Fonte | Peso | Observação |
|---|---|---|---|
| **Títulos (H1, H2, H3)** | **Bahnschrift** | 700 (bold) | Fonte da Microsoft/Windows. **Fallback web:** `Barlow Condensed` ou `Oswald` (Google Fonts) que preservam a estética condensada e forte |
| **Body / parágrafos** | **Open Sans** | 400 / 700 / 800 | Disponível no Google Fonts, universal |
| **Números e valores** | **Bahnschrift** | 700 | Preço grande deve usar a mesma fonte-título |

**Decisão para a LP:**
- Usar `Barlow Condensed` (Google Fonts) para títulos — reproduz o peso do Bahnschrift e é livre para web.
- `Open Sans` para body (mesmo do site).
- Tudo em MAIÚSCULAS nos títulos, como no site e nos anúncios.

**Hierarquia tipográfica sugerida:**
- H1 hero: 64–80px desktop / 40px mobile — peso 800 — line-height 0.95
- H2 seção: 40–48px desktop / 28px mobile — peso 700
- H3 subseção: 24–28px — peso 700
- Body: 16–18px — peso 400 — line-height 1.6
- Small/legal: 13px — peso 400

---

## 3. Elementos gráficos da marca

### Logo (arquivos oficiais em `assets/logos/`)
- `logo-colorido.png` — versão principal (ícone laranja + "IPIOCA BEACH" cinza-bege + "RESIDENCE" laranja) — usar em fundos claros/brancos
- `logo-branco-em-laranja.png` — versão toda branca aplicada sobre bloco laranja — usar em selos/tags
- `logo-branco.png` — versão toda branca com transparência — usar em fotos escuras (hero)
- `logo-simbolo-laranja.png` — só o símbolo (sol + folhas) — usar como favicon, watermark, ícone isolado

**Observação sobre a tipografia do logo:** o "IPIOCA BEACH RESIDENCE" usa uma fonte **serif chunky/display** (aparência artesanal, nordestina). Essa fonte é **exclusiva do logo** — não usar em títulos ou body text da LP. Para tudo o resto, seguir tipografia da seção 2 (Bahnschrift/Barlow Condensed + Open Sans).

**Sobre o ícone:** um sol estilizado dentro de círculo com duas folhas de palmeira/coqueiro laterais — remete à natureza local. Pode ser aplicado isolado (watermark, favicon, ícone de seção).

### Selos e badges (herdados dos anúncios)
- **Selo "JÁ MOBILIADO"** circular laranja com ícone de sofá — usar no hero.
- **Selo "MULTIPROPRIEDADE"** pill/tag laranja com texto branco — sempre próximo ao logo ou headline (crítico para não confundir com flat).
- **Selo "VITALÍCIO & HEREDITÁRIO"** — bloco de texto pill em fundo laranja.

### Padrões visuais
- **Highlight marca-texto**: fundo laranja arredondado atrás de palavras-chave (como nos anúncios: "GARANTIDAS", "FÉRIAS")
- **Botões**: pill totalmente arredondado (`border-radius: 999px`), fundo laranja, texto branco maiúsculo bold
- **Cards**: cantos arredondados médios (`border-radius: 16-20px`)
- **Divisores**: linha fina laranja de 3-4px, curta (60-80px), usada como acento entre título e subtítulo

---

## 4. Direção fotográfica (Key Visual)

**Mood:** **"Caribe brasileiro, mas com alma nordestina"**. Luz dourada, água turquesa, coqueiral denso, arquitetura moderna integrada à natureza.

### Hierarquia de imagens na LP

| Tipo de foto | Onde usar | Referência |
|---|---|---|
| **Aérea da praia + empreendimento** | HERO principal | Anúncio 1 (praia com o resort ao fundo, pôr do sol) |
| **Piscina em uso** (pessoas ao fundo, luz de fim de tarde) | Bloco "O empreendimento" | Anúncio 2 e 3 |
| **Fachada moderna** com céu | Bloco "Sobre" | Foto do site |
| **Praia deserta com coqueiro** | Bloco "Por que Ipioca" | Estilo Caribe brasileiro |
| **Interior de apartamento mobiliado** | Bloco "Já mobiliado" | Fotos do apto (Drive) |
| **Detalhe: mesa da varanda com vista para o mar** | Prova social / depoimentos | Foto quente, aconchegante |

### Tratamento das fotos
- Manter cores naturais (nada de filtros pesados)
- Leve aumento de saturação nos azuis/turquesa
- **Sempre aplicar gradient overlay** por cima (do azul-profundo `#0D5A6E` transparente na parte de cima para escuro no fundo) para o texto branco ler bem
- Nunca cortar o horizonte — respirar a paisagem

### O que NÃO fazer
- ❌ Nada de pessoas em pose de "modelo de catálogo"
- ❌ Nada de foto de sala de vendas / consultor apertando mão
- ❌ Nada de gráficos genéricos de "família feliz"
- ❌ Nada de arte 3D genérica — usar fotos reais do empreendimento

---

## 5. Sistema de componentes da LP

### Botão primário (CTA)
```
background: #EA8036
color: #FFFFFF
padding: 18px 40px
font: Barlow Condensed 700, 18px, maiúsculas, letter-spacing 0.05em
border-radius: 999px
hover: background #D66B22, elevação sutil
```

### Botão secundário
```
background: transparent
color: #EA8036
border: 2px solid #EA8036
demais especs iguais ao primário
hover: background #EA8036, color #FFFFFF
```

### Tag/pill (ex: "MULTIPROPRIEDADE")
```
background: #EA8036
color: #FFFFFF
padding: 6px 14px
font: Barlow Condensed 700, 13px, maiúsculas
border-radius: 999px
```

### Cards de benefício
```
background: #FFFFFF
padding: 32px
border-radius: 20px
box-shadow: 0 10px 40px rgba(0,0,0,0.08)
título: Barlow Condensed 700, 22px, maiúsculas, cor #111111
body: Open Sans 400, 16px, cor #666666
```

### Formulário (dark, como no site)
```
container: fundo #111111 ou #333333, padding 40px, border-radius 20px
label: Open Sans 700, 13px, maiúsculas, cor #FFFFFF
input: fundo #FFFFFF, padding 14px 18px, border-radius 8px
CTA: botão primário laranja
```

---

## 6. Key Visual — proposta de hero

Estrutura visual do topo da LP (o que o lead vê antes de rolar):

```
┌────────────────────────────────────────────────────────────┐
│  [LOGO IPIOCA]              PAGE menu (âncoras)            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│      [Foto aérea da praia de Ipioca ao pôr do sol,         │
│       com o empreendimento visível — mesma pegada do       │
│       Anúncio 1, mas em formato landscape]                 │
│                                                            │
│  [Selo laranja "MULTIPROPRIEDADE"]                         │
│                                                            │
│  SUA CASA DE FÉRIAS NO                                     │
│  CARIBE BRASILEIRO,                                        │
│  TODO ANO NO SEU NOME.                                     │
│                                                            │
│  Ipioca Beach Residence · Litoral Norte de Maceió/AL       │
│  Apto mobiliado · Vitalício & hereditário                  │
│                                                            │
│  [ QUERO CONHECER AS CONDIÇÕES ▶ ]                         │
│                                                            │
│                                             [Selo "JÁ      │
│                                             MOBILIADO"]    │
└────────────────────────────────────────────────────────────┘
```

O mockup HTML está em `03-key-visual-mockup.html` — abre no navegador pra você ver.

---

## 7. Direção narrativa e ritmo (referência: Bossa Eco Luxury Villa)

Referência editorial: [beatriz-moraes082.github.io/bossa-site](https://beatriz-moraes082.github.io/bossa-site/). Não vamos copiar — mas vamos **importar o ritmo** editorial dela para deixar a LP menos "anúncio pesado" e mais **narrativa que vende**.

### O que trazer da Bossa
- **Respiração generosa** entre blocos (padding vertical 120–160px entre seções)
- **Coluna central estreita** para leitura (max-width 720–840px de texto)
- **Fotos "cinematográficas"** ocupando 100% da largura do container, com bordas arredondadas suaves
- **Ritmo narrativo alternado**: título → foto grande → parágrafo curto → ícone linear + subtítulo → foto → parágrafo. O usuário rola como quem folheia uma revista.
- **Coordenadas / dados factuais** como micro-tipografia decorativa acima dos títulos ("PRAIA DE IPIOCA · MACEIÓ · ALAGOAS · 09° 26' S")
- **Palavras-chave em itálico serifado** (usar `Playfair Display italic`) para dar acento poético dentro do texto — ex: *piscinas naturais*, *coqueirais*, *seu refúgio*
- **Ícones lineares** desenhados à mão para cada seção — cria personalidade
- **Selo/prova social discreta** (ex: menções na imprensa)
- **Botão secundário outline** minimalista com seta ("→")
- **Nome do lugar em display grande** como assinatura no início — "IPIOCA" quase como uma capa de revista

### O que NÃO trazer (manter o Ipioca)
- ❌ Tipografia principal serif — a marca Ipioca é sans bold (Bahnschrift/Barlow Condensed)
- ❌ Paleta desaturada / verde-oliva — o laranja `#EA8036` é a assinatura
- ❌ Menu hambúrguer minimalista sem CTA — a LP precisa ter CTA visível
- ❌ Tempo lento de scroll sem gatilhos de conversão — a LP intercala respiração com CTAs

### Estrutura híbrida proposta
```
HERO impactante (Ipioca)
    ↓  ~150px respiração
FAIXA DE ATRIBUTOS densa (Ipioca)
    ↓  ~150px respiração
CAPÍTULO 1: "IPIOCA" (Bossa) — narrativa sobre o destino
    Micro-tipografia coordenadas + título display + foto aérea + parágrafo curto
    ↓  respiração
CAPÍTULO 2: "O EMPREENDIMENTO" (Bossa) — ícones lineares + subtítulos + fotos
    Piscina · Restaurante · Áreas de convívio · Serviço de resort
    ↓  respiração
CAPÍTULO 3: "COMO FUNCIONA" (Ipioca) — 3 passos visuais + tag Multipropriedade
    ↓  respiração
CAPÍTULO 4: "VALE A PENA?" (Ipioca) — bloco comparativo de preço/gasto
    ↓  respiração
CAPÍTULO 5: "REDE RCI" (Bossa) — mapa + narrativa
    ↓  respiração
FAQ (Ipioca)
    ↓  respiração
FORMULÁRIO (Ipioca, dark, forte CTA laranja)
    ↓
RODAPÉ (Ipioca)
```

O híbrido: **narrativa Bossa** (respira, conta uma história) + **conversão Ipioca** (formulário forte, CTAs em pontos-chave, faixa de atributos densa).

### Detalhes tipográficos adicionais
- Adicionar `Playfair Display` (Google Fonts) para uso **exclusivamente decorativo**: palavras em itálico dentro do body, "assinaturas" no início de capítulos.
- Micro-tipografia (coordenadas, tags): `Barlow Condensed` peso 600, letter-spacing 0.15em, maiúsculas, 12px, cor cinza-texto ou laranja.

---

## 8. Referências dos anúncios existentes

Os 3 anúncios em rodagem já estabeleceram um padrão. A LP **respeita** esse padrão para o lead ter continuidade visual:

- **Anúncio 1**: aérea da praia + headline "Garanta a sua casa de praia no Caribe brasileiro" + selo mobiliado + preço 66x R$ 620
- **Anúncio 2**: piscina + "Suas férias em família, garantidas todo ano" + tag Multipropriedade
- **Anúncio 3**: pôr do sol no resort + "Seu refúgio de férias" + "Vitalício & hereditário"

**Linguagem visual comum aos 3:**
- Headlines gigantes em Bahnschrift bold branco
- Selo laranja circular "JÁ MOBILIADO"
- Preço "66x R$ 620" em destaque com "A PARTIR DE" pill
- CTA laranja pill: "QUERO SABER COMO FUNCIONA" / "QUERO GARANTIR MINHA COTA"

**A LP deve espelhar exatamente isso** — porque o lead que clicou no anúncio precisa sentir que chegou no "mesmo lugar".

---

## 9. Próximos passos

- [x] 1. Análise de produto e público
- [x] 2. **Identidade visual e Key Visual** — este documento + mockup
- [ ] 3. Copy da LP — headlines, textos de cada bloco, FAQ, formulário
- [ ] 4. Montagem HTML/CSS
- [ ] 5. Publicação no GitHub Pages
