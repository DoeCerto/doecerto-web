# Relatório de Varredura Pré-Deploy — DoeCerto

**Atualizado em:** 11/11/2026  
**Repositórios e Commits Atuais:**
- **Backend (`doecerto-api`):** branch `feat/authors/Vini` (`211b544`)
- **Frontend (`doecerto-web`):** branch `feat/update/Vini` (`fd21e82`)

---

## 1. Resumo Executivo de Prontidão

| Dimensão Auditada | Backend (`doecerto-api`) | Frontend (`doecerto-web`) | Status |
| :--- | :--- | :--- | :--- |
| **Vulnerabilidades de Dependências (`npm audit --omit=dev`)** | `0 vulnerabilities` | `0 vulnerabilities` | ✅ Aprovado |
| **Checagem de Tipos (`tsc --noEmit`)** | `0 erros` | `0 erros` | ✅ Aprovado |
| **Build de Produção (`nest build` / `next build`)** | Compilado com sucesso | 32/32 rotas geradas | ✅ Aprovado |
| **Migrations & Banco de Dados** | Migration consolidada c/ backfill SQL | N/A | ✅ Aprovado |
| **Segurança (CSP, CORS, Auth, Criptografia, Uploads)** | Hardened (OWASP) | Hardened (CSP Nonce + Headers) | ✅ Aprovado |

---

## 2. Correções Aplicadas Nesta Varredura Final (11/11/2026)

Durante a revisão minuciosa de código (Segurança, Lógica, UX/Design e Deploy), identificamos e já corrigimos os seguintes pontos antes da subida para produção:

### 🔴 Backend (`doecerto-api` — commit `211b544`)

| ID | Categoria | Arquivo | Problema Encontrado | Correção Aplicada |
| :--- | :--- | :--- | :--- | :--- |
| **BE-01** | Lógica / Fluxo de Auth | `src/common/services/mailer.service.ts` | `sendPasswordResetEmail` montava o link de redefinição usando `APP_URL` (porta `3001` da API) em vez de `FRONTEND_URL` (porta `3000` do Web). O usuário clicava no e-mail e caía em `404 Not Found` na API. | Alterado para priorizar `FRONTEND_URL` (com remoção de barra final duplicada e `encodeURIComponent(token)`). |
| **BE-02** | Segurança (Logs) | `src/common/services/mailer.service.ts` | O link completo contendo o `token` secreto de recuperação de senha era gravado em texto puro no `logger.log` mesmo com `NODE_ENV=production`. | Em produção (`isProd`), o log registra apenas o evento e destinatário sem expor o token (`[PASSWORD_RESET] Solicitação gerada para target=...`). |
| **BE-03** | Segurança (HTML Injection) | `src/common/services/mailer.service.ts` | `userName`, `title` e `message` eram concatenados diretamente no template HTML de e-mail sem sanitização de entidades (`<`, `>`, `&`, `"`). | Adicionado método `escapeHtml()` aplicado a todas as variáveis interpoladas nos templates de e-mail. |
| **BE-04** | Infraestrutura / Docker | `docker-entrypoint.sh` | O script de entrypoint aguardava exclusivamente o host fixo `nc -z mysql 3306`, enquanto no `docker-compose.yml` o serviço se chama `db` (e em nuvem pode ser RDS/Railway). | O entrypoint agora extrai dinamicamente `DB_HOST` e `DB_PORT` da variável `DATABASE_URL` (com fallback para `db:3306`). |
| **BE-05** | Pagamentos / Asaas | `src/modules/asaas/asaas.service.ts` | Quando uma subconta de ONG estava com chave revogada/inválida (`401 / invalid_access_token`), o erro caía em fallback genérico (*"Não foi possível registrar o doador"*). | Mapeado `status === 401` e `invalid_access_token` para mensagem clara sobre as credenciais da subconta da instituição. |

---

### 🟣 Frontend (`doecerto-web` — commits `fd374fc` & `fd21e82`)

| ID | Categoria | Arquivo | Problema Encontrado | Correção Aplicada |
| :--- | :--- | :--- | :--- | :--- |
| **FE-01** | Segurança / CSP & Design | `src/middleware.ts` | O player de animações `@lottiefiles/dotlottie-web` (usado em `/splash` e `404`) falhava ao baixar o binário `.wasm` porque a CSP bloqueava `cdn.jsdelivr.net`/`unpkg.com` e compilação WebAssembly. | Adicionado `'wasm-unsafe-eval'` em `script-src` e `https://cdn.jsdelivr.net https://unpkg.com` em `connect-src`. |
| **FE-02** | Segurança (Exposição no Console) | `src/components/specific/Adm-Dashboard/OngTable.tsx`, `src/services/admin.service.ts`, `src/services/wishlist.service.ts` | `console.log` de depuração despejavam o objeto completo da ONG (incluindo CPF do presidente, CNPJ e dados de auditoria) e o perfil do admin no DevTools do navegador. | Removidos todos os `console.log` de debug em componentes e serviços de produção. |
| **FE-03** | Design / UX (Resiliência) | `src/app/error.tsx` | Ausência de Error Boundary de rota no App Router: qualquer falha inesperada de renderização no cliente exibiria a tela branca padrão em inglês do Next.js. | Criado `src/app/error.tsx` seguindo a identidade visual (`#4A2675`), com botão de recuperação (*"Tentar novamente"*) e retorno seguro para `/home`. |
| **FE-04** | Design / SEO | `src/app/layout.tsx` | `metadata` da aplicação continha apenas `title: "DoeCerto"` e `description: "App de Doação"`, prejudicando indexação e pré-visualização de links (WhatsApp/redes sociais). | Configurado título estruturado (`template: "%s \| DoeCerto"`), descrição institucional e tags `openGraph` (`pt_BR`). |

---

## 3. Histórico de Itens Críticos Já Resolvidos Anteriormente

Todos os bloqueadores levantados nas auditorias anteriores permanecem resolvidos e verificados:

- **[B1 / B2] Migrations e Backfill SQL:** Migration `20261104120000_asaas_pix_security_and_public_id` criada com backfill em SQL puro (`UUID()`) e validada em banco limpo (`0 drift`).
- **[B3] Diretórios de Upload no Container:** Criados com permissão `node:node` no `docker-entrypoint.sh`.
- **[H1–H3] Segredos e CVEs:** Segredos hardcoded removidos de scripts de teste; `multer`, `follow-redirects`, `zod` e `fast-uri` atualizados (`0 vulnerabilities` em ambos os projetos).
- **[PIX-01 / PIX-02] Gorjeta Composta no F5 e `AbortError`:** Corrigidos em `src/app/pix/page.tsx`, travando `baseAmount` e `tipAmount` na cobrança ativa e eliminando o `AbortController` que acionava o overlay de erro no React.

---

## 4. Checklist de Variáveis de Ambiente para o Deploy em Produção

> [!IMPORTANT]
> Antes de subir os containers em produção, certifique-se de que as variáveis abaixo estejam definidas no ambiente do servidor:

### Backend (`doecerto-api/.env`)
- `NODE_ENV=production`
- `APP_URL=https://api.<seu-dominio>`
- `FRONTEND_URL=https://<seu-dominio>` *(usado pelo CORS e pelos links de recuperação de senha)*
- `DATABASE_URL=mysql://doecerto_app:<senha-forte>@<host-db>:3306/doecerto`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD=<senha-forte>`
- `JWT_SECRET=<hex-64-bytes-unico-de-producao>`
- `ASAAS_ENVIRONMENT=production`
- `ASAAS_API_KEY=<chave-$aact_prod_...>`
- `ASAAS_WEBHOOK_SECRET=<token-secreto-configurado-no-painel-asaas>`
- `ASAAS_KEY_ENCRYPTION_SECRET=<64-hex-chars-unico-de-producao>` *(guardar backup seguro!)*
- `ASAAS_MASTER_WALLET_ID=<wallet-id-da-conta-mestre-doecerto>`
- `TURNSTILE_SECRET_KEY=<chave-secreta-cloudflare-turnstile>`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`
- `TRUST_PROXY=1`

### Frontend (`doecerto-web/.env.production`)
- `NODE_ENV=production`
- `NEXT_PUBLIC_API_URL=https://api.<seu-dominio>` *(obrigatório no momento do `next build`)*
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site-key-cloudflare-turnstile>`

