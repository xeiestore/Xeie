# Xéie API Worker

Cloudflare Worker that powers:

- **Publish** – signed upload of `catalog.json` to Cloudinary (admin only)
- **Orders** – store customer orders in KV (+ optional email)

**Live URL:** https://xeie-api.xeieloja.workers.dev  

---

## Endpoints

| Method | Path       | Auth              | Description                       |
|--------|------------|-------------------|-----------------------------------|
| POST   | /publish   | X-Admin-Password  | Upload catalog.json to Cloudinary |
| POST   | /orders    | none              | Store a new customer order        |
| GET    | /orders    | X-Admin-Password  | List recent orders                |
| GET    | /health    | none              | Health check                      |

---

## One-time setup (already done on xeieloja account)

```bash
cd worker

# KV
npx wrangler kv namespace create ORDERS
npx wrangler kv namespace create ORDERS --preview
# → put id + preview_id into wrangler.toml

# Deploy
npx wrangler deploy

# Secrets
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put CLOUDINARY_CLOUD_NAME
npx wrangler secret put CLOUDINARY_API_KEY
npx wrangler secret put CLOUDINARY_API_SECRET

# Optional – email notifications
# npx wrangler secret put RESEND_API_KEY
```

Current KV IDs are in `wrangler.toml`. Secrets are set on the **xeieloja** Cloudflare account (not educationgola).

---

## Catalog on Cloudinary

After a successful publish:

```
https://res.cloudinary.com/efvlvhce/raw/upload/xeie/catalog.json
```

Signed upload uses `folder=xeie`, `public_id=catalog`, `overwrite=true`, `invalidate=true`.

---

## Local / redeploy

```bash
cd worker
git pull
npx wrangler deploy
```

After code changes to `src/index.js`, always redeploy the Worker (Pages deploy does **not** update the Worker).

---

## Frontend wiring

- `js/admin.js` → `PUBLISH_URL` / `ORDERS_URL` → `https://xeie-api.xeieloja.workers.dev/...`
- `js/main.js` → pedido form → same `/orders`
- `js/app.js` → public product grids from catalog.json
