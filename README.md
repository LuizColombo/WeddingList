# WeddingList

Lista de presentes de casamento com login (CPF + senha), Pix estático e admin pra confirmar pagamentos.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Framer Motion
- SQLite via `better-sqlite3` (1 arquivo)
- Sessão em cookie cifrado via `iron-session`
- `qrcode.react` pro QR Code
- Deploy: **Fly.io** (Docker, volume persistente pro SQLite)

## Setup local

```bash
cp .env.example .env
# Gere um SESSION_PASSWORD forte (>= 32 chars):
openssl rand -base64 48

npm install
npm run dev
```

App em `http://localhost:3000`. O DB é criado automaticamente em `./data/wedding.db` no primeiro request.

### Variáveis de ambiente

| Var | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_PATH` | sim | Caminho do SQLite. Local: `./data/wedding.db`. Fly: `/data/wedding.db`. |
| `SESSION_PASSWORD` | sim | Segredo do cookie de sessão (mínimo 32 chars). |
| `ADMIN_CPF` | sim | CPF (somente números) que tem acesso ao `/admin`. |
| `PIX_KEY` | sim | Sua chave Pix (CPF, e-mail, telefone ou aleatória). |
| `PIX_RECEIVER_NAME` | sim | Nome do recebedor (até 25 chars, sem acento). |
| `PIX_RECEIVER_CITY` | sim | Cidade (até 15 chars, sem acento). |

## Como administrar

1. Cadastre-se em `/register` usando o **mesmo CPF** que está em `ADMIN_CPF`.
2. O link **Admin** aparece na navbar.
3. Em `/admin` você vê todas as transações ordenadas (pendentes primeiro).
4. Confira o pagamento no extrato do seu banco e clique em **Confirmar**.

## Deploy no Fly.io

Pré-requisito: [`flyctl`](https://fly.io/docs/flyctl/install/) instalado e logado (`fly auth login`).

```bash
# 1. Cria o app sem fazer deploy (vai detectar o fly.toml e o Dockerfile)
fly launch --no-deploy --copy-config

# 2. Cria o volume persistente pro SQLite
fly volumes create data --region gru --size 1

# 3. Configura os segredos
fly secrets set \
  SESSION_PASSWORD="$(openssl rand -base64 48)" \
  ADMIN_CPF="00000000000" \
  PIX_KEY="sua-chave-pix" \
  PIX_RECEIVER_NAME="NOIVOS DA SILVA" \
  PIX_RECEIVER_CITY="SAO PAULO"

# 4. Deploy
fly deploy
```

App vai estar em `https://<nome-do-app>.fly.dev`. Configure um domínio custom em **Settings → Certificates** se quiser.

### Backup do banco

```bash
fly ssh console -C "sqlite3 /data/wedding.db .dump" > backup-$(date +%F).sql
```

### Logs

```bash
fly logs
```

## Build Docker local (opcional)

```bash
docker build -t wedding-list .
docker run --rm -p 3000:3000 \
  -v "$(pwd)/data:/data" \
  -e SESSION_PASSWORD="$(openssl rand -base64 48)" \
  -e ADMIN_CPF=00000000000 \
  -e PIX_KEY=teste@email.com \
  -e PIX_RECEIVER_NAME="NOIVOS" \
  -e PIX_RECEIVER_CITY="SAO PAULO" \
  wedding-list
```

## O que personalizar antes de publicar

- `src/components/sections/Hero.tsx` — nomes, data e local do casamento
- `src/content/gifts.ts` — sua lista real de presentes (slug, título, valor, emoji)
- `src/app/layout.tsx` — metadata SEO (title/description)
- `public/` — favicon e imagens

## Limitações conhecidas

- **Pix estático não tem conciliação automática.** Você precisa abrir o app do banco, conferir os pagamentos pendentes e confirmar manualmente em `/admin`.
- **SQLite num volume único:** sem replica. Pra escala maior trocaria por Postgres (`fly postgres`), mas pra lista de casamento é mais que suficiente.
- **Backups manuais.** Configure um `cron` no seu próprio servidor pra rodar o comando de dump regularmente, se quiser segurança extra.

## Estrutura

```
src/
├── app/
│   ├── api/                # rotas auth + transactions
│   ├── admin/              # painel admin
│   ├── list/               # lista de presentes (auth)
│   ├── login/  register/   # auth
│   ├── layout.tsx, page.tsx, globals.css
├── components/
│   ├── layout/Navbar.tsx
│   ├── sections/{Hero,GiftList}.tsx
│   └── ui/{Button,Input,PixModal}.tsx
├── content/gifts.ts        # lista estática de presentes
├── lib/
│   ├── db.ts               # SQLite
│   ├── session.ts          # iron-session
│   ├── cpf.ts              # validador
│   ├── pix.ts              # BR Code EMV + CRC16
│   └── utils.ts
└── types/index.ts
```
