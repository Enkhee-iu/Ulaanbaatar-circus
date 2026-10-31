# UB Circus API

The API stores site content, admin sessions, enquiries, and uploaded images in Neon PostgreSQL.

## Local setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to the Neon connection string.
2. Set `ADMIN_SETUP_CODE` to a private random value with at least 24 characters.
3. Keep `ADMIN_FRONTEND_ORIGINS` aligned with the frontend's local URL.
4. Run `npm install`, then `npm run dev`.

The frontend runs from the repository root and proxies `/api` requests to `http://127.0.0.1:8787` by default.
