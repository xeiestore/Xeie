/**
 * Xéie API Worker
 * - POST /publish          → signed Cloudinary upload of catalog.json (admin password)
 * - POST /orders           → store customer order in KV + optional email
 * - GET  /orders           → list orders (admin password required)
 * - OPTIONS                → CORS preflight
 *
 * Secrets (wrangler secret put):
 *   ADMIN_PASSWORD
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 * Optional:
 *   RESEND_API_KEY
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Password",
  "Access-Control-Max-Age": "86400",
};

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS, ...extraHeaders },
  });
}

function unauthorized(msg = "Unauthorized") {
  return json({ ok: false, error: msg }, 401);
}

function badRequest(msg) {
  return json({ ok: false, error: msg }, 400);
}

async function sha1(message) {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest("SHA-1", data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Signed raw upload of catalog.json to Cloudinary
 * Final path: xeie/catalog (overwrites on each publish)
 */
async function publishCatalog(catalog, env) {
  const cloud = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  if (!cloud || !apiKey || !apiSecret) {
    return json({ ok: false, error: "Cloudinary secrets not configured" }, 500);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  // Final asset path on Cloudinary: xeie/catalog
  const publicId = "catalog";
  const folder = "xeie";

  // Cloudinary signature: all params except file, api_key, resource_type, signature
  // must be sorted alphabetically and appended with the API secret
  const toSign =
    `folder=${folder}&invalidate=true&overwrite=true&public_id=${publicId}&timestamp=${timestamp}` +
    apiSecret;
  const signature = await sha1(toSign);

  const form = new FormData();
  form.append("file", new Blob([JSON.stringify(catalog, null, 2)], { type: "application/json" }), "catalog.json");
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("public_id", publicId);
  form.append("folder", folder);
  form.append("resource_type", "raw");
  form.append("overwrite", "true");
  form.append("invalidate", "true");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/raw/upload`, {
    method: "POST",
    body: form,
  });

  const body = await res.json();
  if (!res.ok) {
    return json({ ok: false, error: "Cloudinary upload failed", details: body }, 502);
  }

  return json({
    ok: true,
    url: body.secure_url || body.url,
    public_id: body.public_id,
    version: body.version,
    updatedAt: catalog.updatedAt || new Date().toISOString(),
  });
}

/**
 * Store order in KV. Key = order:{timestamp}-{random}
 */
async function storeOrder(order, env) {
  if (!env.ORDERS) {
    return json({ ok: false, error: "ORDERS KV not bound. Run wrangler kv namespace create ORDERS" }, 500);
  }

  const id = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const record = {
    id,
    createdAt: new Date().toISOString(),
    status: "new",
    ...order,
  };

  await env.ORDERS.put(id, JSON.stringify(record), {
    metadata: { createdAt: record.createdAt, status: "new" },
  });

  // Optional email notification via Resend (if secret present)
  if (env.RESEND_API_KEY) {
    try {
      await sendOrderEmail(record, env);
    } catch (e) {
      // non-fatal
      console.error("Email failed", e);
    }
  }

  return json({ ok: true, id, message: "Pedido recebido" });
}

async function sendOrderEmail(order, env) {
  const lines = [
    `Novo pedido Xéie — ${order.id}`,
    `Data: ${order.createdAt}`,
    ``,
    `Nome: ${order.nome || "-"}`,
    `Telefone: ${order.telefone || "-"}`,
    `Email: ${order.email || "-"}`,
    `Produto: ${order.produto || "-"}`,
    `Quantidade: ${order.quantidade || "-"}`,
    `Orçamento: ${order.orcamento || "-"}`,
    `Morada: ${order.morada || "-"}`,
    `Município: ${order.municipio || "-"}`,
    `Província: ${order.provincia || "-"}`,
    `Observações: ${order.observacoes || "-"}`,
  ];

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Xéie <onboarding@resend.dev>", // change after domain verification
      to: ["xeieloja@gmail.com"],
      subject: `Novo pedido Xéie — ${order.nome || order.id}`,
      text: lines.join("\n"),
    }),
  });
}

/**
 * List recent orders (admin only)
 */
async function listOrders(env, limit = 50) {
  if (!env.ORDERS) {
    return json({ ok: false, error: "ORDERS KV not bound" }, 500);
  }

  const list = await env.ORDERS.list({ limit: Math.min(limit, 100), prefix: "ord_" });
  const orders = [];

  for (const key of list.keys) {
    const val = await env.ORDERS.get(key.name, "json");
    if (val) orders.push(val);
  }

  // newest first
  orders.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  return json({ ok: true, count: orders.length, orders });
}

function checkAdmin(request, env) {
  const pwd =
    request.headers.get("X-Admin-Password") ||
    request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ||
    "";
  return pwd && env.ADMIN_PASSWORD && pwd === env.ADMIN_PASSWORD;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    try {
      // ---------- PUBLISH catalog ----------
      if (path === "/publish" && request.method === "POST") {
        if (!checkAdmin(request, env)) return unauthorized();
        const body = await request.json();
        if (!body || !body.catalog) return badRequest("Missing catalog");
        const catalog = {
          updatedAt: new Date().toISOString(),
          products: body.catalog.products || [],
          zones: body.catalog.zones || [],
          texts: body.catalog.texts || {},
          images: body.catalog.images || {},
        };
        return await publishCatalog(catalog, env);
      }

      // ---------- ORDERS ----------
      if (path === "/orders" && request.method === "POST") {
        const body = await request.json();
        if (!body || (!body.nome && !body.telefone && !body.email)) {
          return badRequest("Nome, telefone ou email é obrigatório");
        }
        return await storeOrder(body, env);
      }

      if (path === "/orders" && request.method === "GET") {
        if (!checkAdmin(request, env)) return unauthorized();
        const limit = parseInt(url.searchParams.get("limit") || "50", 10);
        return await listOrders(env, limit);
      }

      // health
      if (path === "/" || path === "/health") {
        return json({ ok: true, service: "xeie-api", time: new Date().toISOString() });
      }

      return json({ ok: false, error: "Not found" }, 404);
    } catch (err) {
      console.error(err);
      return json({ ok: false, error: err.message || "Internal error" }, 500);
    }
  },
};
