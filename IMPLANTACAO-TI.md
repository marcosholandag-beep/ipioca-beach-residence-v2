# Guia de Implantação: Landing Page Ipioca Beach Residence

Documento para o time de TI publicar a landing page no domínio da empresa.

## O que é

Landing page estática de captação de leads. Feita em **HTML + CSS + JavaScript puro**, sem framework e **sem etapa de build**. Basta servir os arquivos.

## Código-fonte

Repositório público no GitHub:
https://github.com/marcosholandag-beep/ipioca-beach-residence

- Clonar: `git clone https://github.com/marcosholandag-beep/ipioca-beach-residence.git`
- Ou baixar o ZIP: botão verde **Code** > **Download ZIP**

Arquivo principal: `index.html` (HTML, CSS e JS estão todos embutidos nele). Imagens e logos em `assets/`.

## Como publicar no domínio de vocês

Por ser 100% estático, é só disponibilizar os arquivos. Três caminhos possíveis:

### Opção A: Servidor web próprio (Apache / Nginx / IIS)
Copiar todo o conteúdo do repositório para a raiz pública do site (ex.: `/var/www/html`, `public_html`, `wwwroot`). Nenhum backend é necessário. Garantir que `index.html` seja o documento padrão do diretório.

### Opção B: GitHub Pages com domínio customizado
O deploy automático já está ativo. Para apontar o domínio de vocês:
1. No repositório: **Settings > Pages > Custom domain**, informar o domínio (ex.: `www.seudominio.com.br`).
2. No DNS do domínio:
   - Subdomínio (`www`): registro **CNAME** apontando para `marcosholandag-beep.github.io`
   - Domínio raiz (apex): registros **A** para os IPs do GitHub Pages:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
3. Marcar **Enforce HTTPS**.

### Opção C: Netlify / Vercel / Cloudflare Pages
Conectar o repositório, deixar o comando de build vazio e o diretório de publicação como raiz (`/`). Apontar o domínio pelo painel do serviço.

## Checklist antes de ir ao ar

1. **Formulário:** hoje o envio está simulado (apenas `console.log`). Plugar um endpoint real no bloco `<script>` no fim do `index.html`. Opções: Formspree, webhook do Kommo (CRM já usado), ou n8n / Zapier / Make.
2. **Rodapé:** conferir e-mail, telefone e endereço comerciais.
3. **Jurídico:** número de Registro de Incorporação (RI) e links de Política de Privacidade e Termos de Uso.
4. **Depoimentos:** trocar os ilustrativos pelos oficiais autorizados.
5. **Rastreamento (opcional):** Meta Pixel, Google Analytics / GTM.
6. **Selo Tripadvisor:** confirmar o direito de uso (prêmio 2025 do empreendimento).

## Observações técnicas

- **Recursos externos:** Google Fonts (Barlow Condensed, Open Sans, Playfair Display) e vídeos via iframe do YouTube. Exigem que o servidor tenha saída para a internet e que o domínio não bloqueie esses hosts por CSP.
- **Responsivo:** testado em desktop e mobile.
- **Sem cookies ou rastreadores** por padrão.
- **Compatibilidade:** navegadores modernos (Chrome, Safari, Firefox, Edge).

## Contato

Dúvidas sobre o código ou ajustes de conteúdo: falar com a equipe responsável pela landing page (Trilha Performance Digital).
