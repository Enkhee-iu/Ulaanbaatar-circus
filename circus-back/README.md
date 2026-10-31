# UB Circus API

The API stores content, admin sessions, enquiries, and image metadata in Neon PostgreSQL. Uploaded image files are stored in Cloudinary.

## Local setup

1. Copy `.env.example` to `.env` and set the Neon `DATABASE_URL`.
2. Set `ADMIN_SETUP_CODE` to a private random value with at least 24 characters.
3. Set `CLOUDINARY_URL` to the Cloudinary URL from your Cloudinary dashboard.
4. Keep `ADMIN_FRONTEND_ORIGINS` aligned with the frontend URL.
5. Run `npm install`, then `npm run dev` from this folder.

For Render, also add `CLOUDINARY_URL` as a secret environment variable on the backend service.

The sibling `circus-front/` website proxies `/api` requests to `http://127.0.0.1:8787` by default.
