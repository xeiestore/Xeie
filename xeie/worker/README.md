# Xéie API Worker

Cloudflare Worker that powers:

- **Publish** – signed upload of `catalog.json` to Cloudinary (admin only)
- **Orders** – store customer orders in KV + optional email to `xeieloja@gmail.com`

## One-time setup

```bash
cd worker

# 1. Create KV namespace for orders
npx wrangler kv namespace create ORDERS
npx wrangler kv namespace create ORDERS --preview

# Copy the two IDs into wrangler.toml (id + preview_id)

# 2. Deploy
npx wrangler deploy

# 3. Set secrets (never commit these)
npx wrangler secret put ADMIN_PASSWORD          # value: XNgola1648
npx wrangler secret put CLOUDINARY_CLOUD_NAME   # value: efvlvhce
npx wrangler secret put CLOUDINARY_API_KEY      # value: 452233115926395
npx wrangler secret put CLOUDINARY_API_SECRET   # value: Y6HVhXd3AytMJESSj7iMznZa-yQ

# Optional – email notifications (Resend free tier)
# npx wrangler secret put RESEND_API_KEY
```

After deploy the Worker URL will be something like:

```
https://xeie-api.<your-subdomain>.workers.dev
```

Put that URL into `js/admin.js` as `PUBLISH_URL` / `ORDERS_URL`.

## Endpoints

| Method | Path       | Auth              | Description                          |
|--------|------------|-------------------|--------------------------------------|
| POST   | /publish   | X-Admin-Password  | Upload catalog.json to Cloudinary    |
| POST   | /orders    | none              | Store a new customer order           |
| GET    | /orders    | X-Admin-Password  | List recent orders                   |
| GET    | /health    | none              | Health check                         |

## Catalog URL (public)

```
https://res.cloudinary.com/efvlvhce/raw/upload/xeie/catalog.json
```

(append `?t=` + Date.now() for cache-busting on the public site)
