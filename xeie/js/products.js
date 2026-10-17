/**
 * Xéie – default products & delivery zones
 * Used as fallback when remote catalog.json is unavailable.
 * Admin publish overwrites the live catalog on Cloudinary.
 */

window.XEIE_DEFAULT_PRODUCTS = [
  {
    id: "p-smartphone",
    name: "Smartphone Premium 128GB",
    price: 185000,
    category: "Electrónica",
    image: "",
    description: "Smartphone de gama alta com 128GB de armazenamento.",
    active: true,
  },
  {
    id: "p-headphones",
    name: "Auscultadores Bluetooth Noise Cancelling",
    price: 42500,
    category: "Electrónica",
    image: "",
    description: "Auscultadores com cancelamento activo de ruído.",
    active: true,
  },
  {
    id: "p-smartwatch",
    name: "Smartwatch Desportivo",
    price: 28900,
    category: "Electrónica",
    image: "",
    description: "Relógio inteligente com monitor de actividade.",
    active: true,
  },
  {
    id: "p-sneakers",
    name: "Sapatilhas Running Unissexo",
    price: 22000,
    category: "Moda & Acessórios",
    image: "",
    description: "Sapatilhas leves para corrida e uso diário.",
    active: true,
  },
  {
    id: "p-pans",
    name: "Conjunto de Panelas Antiaderentes",
    price: 35000,
    category: "Casa & Decoração",
    image: "",
    description: "Conjunto completo de panelas com revestimento antiaderente.",
    active: true,
  },
  {
    id: "p-skincare",
    name: "Kit Skincare Completo",
    price: 18500,
    category: "Beleza & Cuidados",
    image: "",
    description: "Kit de cuidados de pele com limpeza, sérum e hidratante.",
    active: true,
  },
  {
    id: "p-bike",
    name: "Bicicleta Estática Dobrável",
    price: 65000,
    category: "Desporto & Outdoor",
    image: "",
    description: "Bicicleta estática compacta e dobrável para casa.",
    active: true,
  },
  {
    id: "p-wine",
    name: "Vinho Tinto Reserva 750ml",
    price: 12800,
    category: "Gourmet & Bebidas",
    image: "",
    description: "Vinho tinto reserva de qualidade.",
    active: true,
  },
];

window.XEIE_DEFAULT_ZONES = [
  { name: "Talatona", price: 2000 },
  { name: "Miramar", price: 2500 },
  { name: "Maianga", price: 1500 },
  { name: "Ingombota", price: 1500 },
  { name: "Viana", price: 3000 },
  { name: "Cacuaco", price: 3500 },
  { name: "Belas", price: 2500 },
  { name: "Kilamba", price: 3000 },
];

window.XEIE_DEFAULT_TEXTS = {
  pt: {
    heroTitle: "O que precisa, nós encontramos.",
    heroSubtitle: "Peça qualquer produto. Receba a referência bancária por email. Nós tratamos do resto.",
  },
  en: {
    heroTitle: "Whatever you need, we find it.",
    heroSubtitle: "Request any product. Receive the bank reference by email. We take care of the rest.",
  },
};

window.XEIE_DEFAULT_IMAGES = {
  hero: "",
  promo: "",
};

window.XEIE_SITE_IMAGE_SLOTS = [
  { key: "hero", label: "Hero (homepage)" },
  { key: "promo", label: "Promoção / banner" },
];
