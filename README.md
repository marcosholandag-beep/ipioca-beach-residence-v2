# Ipioca Beach Residence · Landing Page

Landing page de captação de leads para o empreendimento Ipioca Beach Residence (multipropriedade em Ipioca, Maceió/AL).

Publicada via GitHub Pages para aprovação da incorporadora.

## Estrutura

```
.
├── index.html                          # Landing page completa
├── assets/
│   ├── logos/                          # Logos oficiais em 4 versões
│   └── fotos/                          # Imagens do empreendimento e da praia
├── 01-brief-estrategico.md             # Análise de público + objeções
├── 02-identidade-visual.md             # Guia de IDV (paleta, tipografia, componentes)
├── 03-key-visual-mockup.html           # Mockup preliminar
└── 04-copy-completa.md                 # Copy de todas as seções
```

## Para editar a LP

Basta editar `index.html`. Assets estão em `assets/`. Sem build, sem framework.

## Formulário

O formulário está com envio simulado (só imprime no `console.log`). Para plugar num destino real, no `<script>` do fim do HTML, substitua a linha comentada:

```js
// await fetch('https://formspree.io/f/SEU_ID', { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } });
```

Opções:
- **Formspree** (grátis até 50 envios/mês): https://formspree.io
- **Webhook Kommo** (que já é usado): endpoint interno do CRM
- **n8n / Zapier / Make** (recomendado): recebe o POST e dispara integrações

## Placeholders pendentes

Trocar antes de subir versão final:
- Depoimentos ilustrativos (seção "Quem já é dono") → oficiais autorizados
- E-mail, telefone comercial e endereço no rodapé
- Nº de registro de incorporação (RI)
- Política de privacidade e Termos de uso (links)

## Créditos

Feito para aprovação — versão de trabalho.
