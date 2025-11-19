Flow-Launchpad is a Next.js app deployed to Heroku using Upstash Redis. It lets users create a presale for a token launch. Each presale generates a dedicated Solana wallet; contributors send SOL to that wallet and are tracked on-chain by verifying their transfer signature.

## Getting Started

First, set environment variables, then run the development server:

```bash
NEXT_PUBLIC_SOLANA_CLUSTER=devnet \
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com \
UPSTASH_REDIS_REST_URL=... \
UPSTASH_REDIS_REST_TOKEN=... \
ENCRYPTION_KEY=32_byte_hex_key \
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

Environment variables

Set these in Heroku Config Vars and `.env.local` for local dev:

- NEXT_PUBLIC_SOLANA_CLUSTER
- NEXT_PUBLIC_SOLANA_RPC
- UPSTASH_REDIS_REST_URL
- UPSTASH_REDIS_REST_TOKEN
- ENCRYPTION_KEY

Deploy to Heroku

- heroku create flow-launchpad
- heroku buildpacks:add heroku/nodejs
- heroku config:set NEXT_PUBLIC_SOLANA_CLUSTER=devnet NEXT_PUBLIC_SOLANA_RPC=... UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... ENCRYPTION_KEY=...
- git push heroku main

Notes

- Max presale cap is 30 SOL and enforced on contributions.
- The presale creator can claim the sealed private key at `/api/presales/[id]/claim-key`.
