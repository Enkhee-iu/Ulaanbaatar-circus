# Ulaanbaatar Circus

- `circus-front/` — TanStack Start website
- `circus-back/` — Express API backed by Neon PostgreSQL

Start the API from `circus-back/` with `npm install` and `npm run dev`. Copy its `.env.example` to `.env` and set the Neon connection string and private admin setup code first.

Start the website from `circus-front/` with `npm install` and `npm run dev`. The frontend proxies API requests to `http://127.0.0.1:8787` by default.
