# Xéie — Online Store (Luanda, Angola)

Sourcing & delivery store based in Luanda. Static site + staff admin panel.

**Live:** https://xeie.pages.dev  
**Admin:** https://xeie.pages.dev/admin.html  
**API:** https://xeie-api.xeieloja.workers.dev  

**Stack:** Pure HTML / CSS / JS (no framework) · Cloudflare Pages · Cloudflare Worker · Cloudinary  
**Language:** Portuguese first, English toggle  

---

## Architecture (Site + Admin Blueprint)

| Layer | Role |
|-------|------|
| **Cloudflare Pages** | Hosts static HTML/CSS/JS |
| **Cloudflare Worker** (`xeie-api`) | Publish API (signed Cloudinary upload) + orders (KV) |
| **Cloudinary** | Media uploads (unsigned preset `xeie_media`) + live `catalog.json` |
| **localStorage** | Admin drafts / same-browser preview |
| **Admin password** | Simple gate for `/admin.html` (not customer Google auth) |

**Flow**

1. Staff edits products / zones / texts / images in the admin panel  
2. Optional **Guardar rascunho** → draft only on this device  
3. **Publicar na loja** → Worker signs & uploads `catalog.json` to Cloudinary  
4. Public pages fetch that catalog on load (no site redeploy for catalog changes)

---

## Project structure

```
xeie/
├── index.html, produtos.html, produto.html, pedido.html, …
├── admin.html                 # Staff panel (password-gated)
├── css/
│   ├── styles.css             # Public site
│   └── admin.css              # Admin UI
├── js/
│   ├── products.js            # Default PRODUCTS + DELIVERY_ZONES (fallback)
│   ├── app.js                 # Loads live catalog.json → renders .products-grid
│   ├── main.js                # Header, drawer, i18n, pedido form, injects app.js
│   ├── admin.js               # Admin CRUD, media, publish, orders
│   └── i18n.js
├── worker/
│   ├── src/index.js           # /publish + /orders + /health
│   ├── wrangler.toml
│   └── README.md
├── assets/
└── README.md
```

---

## Important URLs

| What | URL |
|------|-----|
| Public catalog | `https://res.cloudinary.com/efvlvhce/raw/upload/xeie/catalog.json` |
| Publish API | `POST https://xeie-api.xeieloja.workers.dev/publish` |
| Orders API | `POST/GET https://xeie-api.xeieloja.workers.dev/orders` |
| Health | `GET https://xeie-api.xeieloja.workers.dev/health` |

Cloudinary cloud: `efvlvhce` · folder: `xeie` · unsigned preset: `xeie_media`

---

## Admin panel

- Password: set as Worker secret `ADMIN_PASSWORD` (and client check in `admin.js`)
- Tabs: Dashboard · Produtos · Zonas · Textos · Imagens do site · Mídia · Pedidos
- Product/image changes stay as **rascunho** until **Publicar na loja**
- Media uploads use the unsigned Cloudinary preset (browser → Cloudinary)
- Catalog publish is signed via the Worker (secrets never in the browser)

---

## Public catalog

`js/app.js` fetches the live catalog and replaces every `.products-grid` on the page.  
`main.js` injects `products.js` + `app.js` so all pages that load `main.js` get live data.  
If the remote catalog is unavailable, defaults from `products.js` are used.

---

## Orders

- `pedido.html` posts to the Worker `POST /orders`
- Orders are stored in Cloudflare KV (`ORDERS`)
- Admin **Pedidos** tab lists them (`GET /orders` + admin password)
- Optional later: Resend email to `xeieloja@gmail.com` (`RESEND_API_KEY` secret)

Customer Google sign-in is optional/later; orders are stored whether the customer is signed in or not.

---

## Delivery zones

Default zones (28 Luanda areas) live in `js/products.js` and are editable in admin **Zonas**.  
Publish writes them into `catalog.json` with products.

---

## Deploy

### Pages (site)

1. Repo: `xeiestore/Xeie` → Cloudflare Pages project `xeie`  
2. Auto-deploys on push to `main`

### Worker (API)

See `worker/README.md`. Summary:

```bash
cd worker
npx wrangler deploy
# secrets already set on xeieloja account:
#   ADMIN_PASSWORD, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
```

KV binding `ORDERS` must be present in `wrangler.toml`.

---

## Smoke test checklist

1. Open `/admin.html` → login  
2. Upload image in **Mídia** or assign product image  
3. Edit / remove a product → **Publicar na loja**  
4. Hard-refresh homepage → product list matches catalog  
5. Submit a test pedido → appears under **Pedidos**

---

## Design system

- **Palette:** Deep charcoal `#1C1917` · Soft ivory `#FAFAF9` · Terracotta accent `#9A3412`
- Thin borders, card radius 14px, button radius 10px
- Inter 300–500 · Mobile-first

---

## Contact

- Email: xeieloja@gmail.com  
- Instagram: [xeie_store](https://www.instagram.com/xeie_store/)  
- Facebook: [Xéie store](https://www.facebook.com/profile.php?id=61595218191453)  
- Location: Luanda, Angola  

---

## Changelog

### 2026-10-17
- Admin panel (`admin.html` + `admin.js` / `admin.css`)
- Worker API: `/publish`, `/orders`, `/health` + ORDERS KV
- Live catalog on Cloudinary; public site loads it via `app.js`
- 28 Luanda delivery zones as defaults
- Pedido form → Worker orders endpoint

### 2026-10-03
- Hero logo full-bleed; desktop mega menus; mobile drawer tabs
- Category pages; favicons; i18n PT/EN

### 2026-10-02
- Initial static site build
