# CDS Car Intermediações

Site institucional e catálogo de veículos da CDS Car, criado com foco em uma experiência profissional, responsiva e pronta para Cloudflare.

## Conteúdo incluído

- estoque atual com 25 veículos, fotos oficiais, busca, filtros e ordenação;
- compra, venda, financiamento e seguros;
- formulário de avaliação encaminhado ao WhatsApp;
- informações institucionais, contatos, horários, mapa e redes sociais;
- política de privacidade e aviso de cookies;
- metadados de compartilhamento e imagem social própria.
- carrossel automático do estoque na abertura do site;
- painel administrativo protegido em `/admin` para editar os veículos e publicar novas fotos;
- persistência do catálogo e das imagens no Cloudflare D1.

## Requisitos

- Node.js `>=22.13.0`
- npm

## Executar localmente

```bash
npm ci
npm run dev
```

## Validar a versão de produção

```bash
npm run build
```

A saída é gerada em `dist/` no formato ESM compatível com Cloudflare Workers. O projeto usa vinext, Vite e o plugin oficial de Cloudflare presente em `vite.config.ts`.

## Estrutura principal

- `app/page.tsx`: conteúdo e interações do site;
- `app/globals.css`: identidade visual e responsividade;
- `app/layout.tsx`: SEO e metadados sociais;
- `app/admin/`: painel privado de gestão do estoque;
- `app/api/` e `db/`: APIs e persistência no Cloudflare D1;
- `public/images/`: logotipo, estoque e imagem de compartilhamento;
- `.openai/hosting.json`: configuração de publicação do projeto.

Os contatos, preços e dados do estoque representam o levantamento feito no site da CDS Car em 31/07/2026. Depois da primeira inicialização, o estoque pode ser atualizado pelo painel administrativo sem alterar o código.

## Configuração no Cloudflare

O projeto espera o binding D1 `DB`, a variável de build `CDS_D1_DATABASE_ID` e as variáveis de execução `ADMIN_EMAILS`, `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET`. As duas últimas devem ser cadastradas como **Secret** no painel da Cloudflare. O acesso em `/admin` usa cookie seguro, com duração máxima de oito horas, e nunca envia a senha administrativa ao navegador.
