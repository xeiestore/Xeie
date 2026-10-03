# Xéie — Online Store (Luanda, Angola)

Luxury e-commerce website for **Xéie**, a sourcing & delivery store based in Luanda.

**Stack:** Pure HTML / CSS / JS · Ready for Cloudflare Pages + Workers  
**Language:** Portuguese first, with English toggle  

---

## Project structure

```
xeie/
├── index.html              # Homepage
├── produtos.html           # All products
├── produto.html            # Single product template
├── pedido.html             # Custom request form
├── como-funciona.html
├── sobre.html
├── contacto.html
├── novidades.html
├── mais-vendidos.html
├── perfumes.html
├── cosmeticos.html
├── joias.html
├── oculos-de-sol.html
├── pastas-mochilas.html
├── promocao.html
├── css/styles.css
├── js/main.js
├── js/i18n.js
├── assets/
│   ├── hero-logo.jpeg
│   └── favicon/
└── README.md
```

---

## Navigation

### Desktop
- **Novidades** · **Mais Vendidos** · **Mulher** (mega menu on hover) · **Homem** (mega menu on hover) · **Promoção**
- Mega menus are full-width panels with image placeholders + labels (Kylie-style)

**Mulher mega:** Perfumes, Cosméticos, Joias, Acessórios, Bolsas  
**Homem mega:** Perfumes, Joias, Acessórios, Pastas & Mochila

### Mobile drawer (full-page, Zara-style tabs)
- Tabs: **Mulher | Homem**
- Mulher → Perfumes, Cosméticos, Joias, Acessórios, Bolsas  
- Homem → Perfumes, Joias, Acessórios, Pastas & Mochila

Footer keeps: Produtos, Fazer Pedido, Como Funciona, Sobre, Contacto

---

## Design system

- **Palette:** Deep charcoal `#1C1917` · Soft ivory `#FAFAF9` · Terracotta accent `#9A3412`
- Thin borders (1–1.5px), card radius 14px, button radius 10px
- Light typography (Inter 300–500)
- Mobile-first, fully responsive

---

## Form

Custom request form on `pedido.html` posts to `/api/pedido` (Cloudflare Workers).  
Fields: Nome, Telefone, Email, Produto, Quantidade, Orçamento, Morada, Município*, Província*, Observações

---

## Changelog

### 2026-10-03
- Hero logo set to full-bleed
- Desktop nav: more space under brand; Mulher/Homem mega menus open on **hover**
- Desktop nav gap increased; header height adjusted
- Mobile drawer: removed Novidades / Mais Vendidos / Promoção from drawer
- Mobile drawer now full-page width when open
- Nav restructure: Mulher / Homem with Zara-style mobile tabs + Kylie-style desktop mega menus
- Sale renamed to **Promoção** (PT) / Sale (EN)
- Dedicated category pages created
- Pastas & Mochila label updated
- Brand name enlarged in header
- Favicons added
- CTA band for future product on homepage (replaced “Como funciona” teaser)
- Logo-only hero on homepage

### 2026-10-02
- Initial site build: luxury theme, product catalog placeholders, request form, i18n PT/EN, search, header with announcement bar + drawer
- Logo and brand identity established

---

## Deploy

1. Push this folder to GitHub  
2. Connect to Cloudflare Pages  
3. Add a Worker at `/api/pedido` for form handling  
4. Replace product image placeholders with real assets  

---

## Contact

- Email: xeieloja@gmail.com  
- Instagram: [xeie_store](https://www.instagram.com/xeie_store/)  
- Facebook: [Xéie store](https://www.facebook.com/profile.php?id=61595218191453)  
- Location: Luanda, Angola  
