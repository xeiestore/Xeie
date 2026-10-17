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
  { name: "Ilha de Luanda", price: 3500 },
  { name: "Marginal", price: 3000 },
  { name: "Cassenda", price: 3000 },
  { name: "Aeroporto 4 de Fevereiro", price: 3000 },
  { name: "Marteres", price: 3000 },
  { name: "Kinaxixi", price: 3000 },
  { name: "Golf2", price: 2500 },
  { name: "Bairro Popular", price: 3000 },
  { name: "Cazenga", price: 4500 },
  { name: "Kifica", price: 1500 },
  { name: "Patriota", price: 1500 },
  { name: "Benfica", price: 1500 },
  { name: "KK-5000", price: 2500 },
  { name: "Vila de Viana", price: 4000 },
  { name: "Luanda Sul", price: 4000 },
  { name: "Capalanga", price: 5500 },
  { name: "Zango 0", price: 3500 },
  { name: "Zango 1,2,3", price: 4500 },
  { name: "Sequele", price: 6500 },
  { name: "Cacuaco", price: 7500 },
  { name: "Talatona", price: 2000 },
  { name: "Camama", price: 2000 },
  { name: "Kilamba", price: 2000 },
  { name: "Nova Vida", price: 2500 },
  { name: "Morro Bento", price: 2500 },
  { name: "Samba", price: 3000 },
  { name: "Mutamba", price: 3000 },
  { name: "Maianga", price: 3000 },
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
