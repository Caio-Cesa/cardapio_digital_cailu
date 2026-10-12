/**
 * ==============================================================================
 * PRODUTOS E CONFIGURAÇÕES OFICIAIS - CAILU BURGER ARTESANAL
 * ==============================================================================
 * Instagram: https://www.instagram.com/cailuburger/
 * Endereço: Rua Lindolfo de Azevedo, 1518 - Jardim América, Belo Horizonte - MG
 * "Um casal, um sonho e o melhor burger de BH!"
 */

const RESTAURANT_CONFIG = {
  name: "Cailu Burger",
  shortName: "Cailu Burger",
  slogan: "Um casal, um sonho e o melhor burger de BH!",
  logo: "img/logo.jpeg",
  logo3d: "img/logo-3d.jpeg",
  cnpj: "64.875.012/0001-42",
  whatsapp: "5531982853457", // Telefone sem caracteres especiais
  phoneDisplay: "(31) 98285-3457",
  address: "Rua Domingos Rocha, 765 - Salgado Filho, Belo Horizonte - MG",
  neighborhood: "Salgado Filho",
  coverage: "Salgado Filho e Região (BH)",
  coordinates: {
    lat: -19.9402136,
    lng: -43.9809866
  },
  averageTime: "40 - 50 min",
  deliveryFee: 5.00, // Taxa de entrega base inicial em R$
  minOrder: 20.00,   // Pedido mínimo em R$
  openingHours: {
    days: "Terça a Domingo",
    open: 18,        // 18:00
    openMinutes: 30, // 18:30
    close: 23,       // 23:00
    closeMinutes: 30, // 23:30

    // Dias normais da semana em que a loja NÃO abre:
    // 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
    closedDays: [1], // Padrão: Segunda (1)

    // =========================================================================
    // CASOS ESPECIAIS / FERIADOS:
    // Para ABRIR em um dia que normalmente estaria fechado (como feriado na segunda):
    // Defina 'forceOpenToday: true'. Quando voltar ao normal, altere para 'false'.
    // =========================================================================
    forceOpenToday: true,

    // Para FORÇAR FECHADO em um dia normal de funcionamento (ex: folga/reforma):
    // Defina 'forceClosedToday: true'. Padrão: false
    forceClosedToday: false
  },
  instagram: "@cailuburger",
  instagramUrl: "https://www.instagram.com/cailuburger/",
  pixKey: "64875012000142",
  pixBeneficiary: "CNPJ / Luana Fátima"
};

// Tabela Oficial de Taxas e Tempos por Raio de Distância (km)
const DELIVERY_TIERS = [
  { maxKm: 0.5, fee: 5.00, time: "40 min" },
  { maxKm: 1.0, fee: 5.00, time: "40 min" },
  { maxKm: 1.5, fee: 5.00, time: "40 min" },
  { maxKm: 2.0, fee: 6.00, time: "40 min" },
  { maxKm: 2.5, fee: 7.00, time: "42 min" },
  { maxKm: 3.0, fee: 7.00, time: "42 min" },
  { maxKm: 3.5, fee: 8.00, time: "42 min" },
  { maxKm: 4.0, fee: 10.00, time: "45 min" },
  { maxKm: 5.0, fee: 11.00, time: "45 min" },
  { maxKm: 6.0, fee: 12.00, time: "50 min" },
  { maxKm: 7.0, fee: 14.00, time: "50 min" },
  { maxKm: 10.0, fee: 20.00, time: "60 min" }
];

const MAX_DELIVERY_RADIUS_KM = 10.0;

function calculateDeliveryTier(distanceKm) {
  if (distanceKm == null || isNaN(distanceKm)) {
    return {
      distanceKm: null,
      fee: RESTAURANT_CONFIG.deliveryFee,
      time: RESTAURANT_CONFIG.averageTime,
      exceedsMaxRadius: false
    };
  }

  const roundedDistance = Math.round(distanceKm * 10) / 10;

  if (roundedDistance > MAX_DELIVERY_RADIUS_KM) {
    return {
      distanceKm: roundedDistance,
      fee: 20.00, // Base para > 10 km
      time: "60+ min",
      exceedsMaxRadius: true
    };
  }

  for (const tier of DELIVERY_TIERS) {
    if (roundedDistance <= tier.maxKm) {
      return {
        distanceKm: roundedDistance,
        fee: tier.fee,
        time: tier.time,
        exceedsMaxRadius: false
      };
    }
  }

  return {
    distanceKm: roundedDistance,
    fee: 20.00,
    time: "60 min",
    exceedsMaxRadius: false
  };
}

// Categorias do cardápio Cailu Burger
const CATEGORIES = [
  { id: "all", name: "Todos", icon: "⭐" },
  { id: "promocoes", name: "Combos Artesanais", icon: "🔥" },
  { id: "artesanais", name: "Burgers Artesanais", icon: "🍔" },
  { id: "smash", name: "Smash Burgers", icon: "⚡" },
  { id: "bebidas", name: "Bebidas Geladas", icon: "🥤" },
  { id: "acompanhamentos", name: "Acompanhamentos", icon: "🍟" }
];

// Acréscimos oficiais para burgers individuais (Artesanais e Smash)
const BURGER_ADDONS = [
  { id: "addon-carne-120g", name: "Carne 120g (Blend Artesanal)", price: 9.90, icon: "🥩", description: "Blend bovino 120g grelhado no ponto" },
  { id: "addon-bacon", name: "Bacon Crocante", price: 3.90, icon: "🥓", description: "Fatias crocantes e sequinhas" },
  { id: "addon-cheddar", name: "Cheddar Cremoso", price: 5.00, icon: "🧀", description: "Cheddar cremoso derretido" },
  { id: "addon-queijo", name: "Queijo Prato Derretido", price: 3.00, icon: "🧀", description: "Fatia generosa derretida" },
  { id: "addon-cebola-caramelizada", name: "Cebola Caramelizada", price: 8.90, icon: "🧅", description: "Caramelizada na chapa" },
  { id: "addon-aneis-cebola", name: "Anéis de Cebola Empanada", price: 3.90, icon: "🧅", description: "Crocantes e dourados" }
];

// Limite máximo compartilhado entre TODOS os acréscimos de um mesmo burger
const MAX_ADDONS_TOTAL = 6;

// Opções compartilhadas para seleção estilo iFood nos combos
const COMBO_BEVERAGE_OPTIONS = [
  {
    id: "coca-600-normal",
    name: "Coca-Cola 600ml (Normal)",
    description: "Garrafa 600ml estupidamente gelada",
    image: "img/logo-coca-cola.jpg",
    priceDelta: 0,
    default: true
  },
  {
    id: "coca-600-zero",
    name: "Coca-Cola 600ml (Zero Açúcar)",
    description: "Garrafa 600ml estupidamente gelada",
    image: "img/logo-coca-cola.jpg",
    priceDelta: 0
  },
  {
    id: "guarana-1l",
    name: "Guaraná Antarctica 1 Litro",
    description: "Garrafa 1 Litro bem geladinha",
    image: "img/logo-guarana.jpg",
    priceDelta: 0
  }/*,
  {
    id: "2x-coca-lata",
    name: "2x Coca-Cola Lata 350ml (Normal)",
    description: "Duas latas de 350ml estupidamente geladas",
    image: "img/logo-coca-cola.jpg",
    priceDelta: 0
  },
  {
    id: "2x-coca-zero-lata",
    name: "2x Coca-Cola Lata 350ml (Zero)",
    description: "Duas latas zero açúcar bem geladas",
    image: "img/logo-coca-cola.jpg",
    priceDelta: 0
  },
  {
    id: "2x-guarana-lata",
    name: "2x Guaraná Antarctica Lata 350ml",
    description: "Duas latas de guaraná bem geladinhas",
    image: "img/logo-guarana.jpg",
    priceDelta: 0
  },
  {
    id: "2x-fanta-lata",
    name: "2x Fanta Guaraná Lata 350ml",
    description: "Duas latas de Fanta Guaraná geladinhas",
    image: "img/logo-fanta.jpg",
    priceDelta: 0
  }*/
];

const SMASH_BURGER_OPTIONS_1 = [
  {
    id: "smash-classico-1",
    name: "Smash Clássico Irresistível",
    description: "Smash, queijo prato derretido, alface, tomate e molho grill",
    image: "img/smash-classico-irresistivel.jpeg",
    priceDelta: 0,
    default: true
  },
  {
    id: "smash-bacon-melt-1",
    name: "Smash Bacon Melt",
    description: "Smash crocante, cheddar, bacon caramelizado e molho grill",
    image: "img/smash-bacon-melt.jpeg",
    priceDelta: 0
  },
  {
    id: "smash-crispy-1",
    name: "Smash Crispy",
    description: "Smash, muito cheddar cremoso e cebolas empanadas",
    image: "img/smash-crispy.jpeg",
    priceDelta: 0
  },
  {
    id: "smash-cebola-caramelizada-1",
    name: "Smash Cebola Caramelizada",
    description: "Smash, queijo prato, cebola caramelizada e molho grill",
    image: "img/smash-cebola-caramelizada.jpeg",
    priceDelta: 0
  }
];

const SMASH_BURGER_OPTIONS_2 = [
  {
    id: "smash-classico-2",
    name: "Smash Clássico Irresistível",
    description: "Smash, queijo prato derretido, alface, tomate e molho grill",
    image: "img/smash-classico-irresistivel.jpeg",
    priceDelta: 0
  },
  {
    id: "smash-bacon-melt-2",
    name: "Smash Bacon Melt",
    description: "Smash crocante, cheddar, bacon caramelizado e molho grill",
    image: "img/smash-bacon-melt.jpeg",
    priceDelta: 0,
    default: true
  },
  {
    id: "smash-crispy-2",
    name: "Smash Crispy",
    description: "Smash, muito cheddar cremoso e cebolas empanadas",
    image: "img/smash-crispy.jpeg",
    priceDelta: 0
  },
  {
    id: "smash-cebola-caramelizada-2",
    name: "Smash Cebola Caramelizada",
    description: "Smash, queijo prato, cebola caramelizada e molho grill",
    image: "img/smash-cebola-caramelizada.jpeg",
    priceDelta: 0
  }
];

const SMASH_ECONOMICO_DRINK_OPTIONS = [
  {
    id: "coca-200-normal",
    name: "Coca-Cola Pet 200ml (Normal)",
    description: "Garrafinha 200ml estupidamente gelada",
    image: "img/logo-coca-cola.jpg",
    priceDelta: 0,
    default: true
  },
  {
    id: "coca-200-zero",
    name: "Coca-Cola Pet 200ml (Zero Açúcar)",
    description: "Garrafinha 200ml zero açúcar bem gelada",
    image: "img/logo-coca-cola.jpg",
    priceDelta: 0
  },
  {
    id: "guarana-200",
    name: "Guaraná Antarctica Pet 200ml",
    description: "Garrafinha 200ml bem geladinha",
    image: "img/logo-guarana.jpg",
    priceDelta: 0
  },
  {
    id: "pepsi-200",
    name: "Pepsi Pet 200ml",
    description: "Garrafinha 200ml bem gelada",
    image: "img/logo-pepsi.jpg",
    priceDelta: 0
  }
];

// Lista oficial de produtos com fotos reais e opções inteligentes
const PRODUCTS = [
  // --- COMBOS ARTESANAIS OFICIAIS (SEU ARTESANAL DE VERDADE!) ---
  {
    id: "combo-duplo",
    category: "promocoes",
    name: "Combo Duplo",
    subtitle: "2x Cailu Love Duplo + 1x Batata Grande 300g + Bebida à sua escolha",
    composition: "2x Cailu Love Duplo + 1x Batata Frita Grande 300g + Bebida à sua escolha (Coca 600ml ou Guaraná 1L).",
    description: "COMPOSIÇÃO: 2x Cailu Love Duplo + 1x Batata Frita Grande 300g + Bebida à sua escolha.\n\nA FOME TÁ GIGANTE POR AÍ? Para os casais ou amigos que não brincam em serviço quando o assunto é hambúrguer de verdade. São 4 blends de carne grelhados na chapa esperando por vocês!",
    price: 87.90,
    originalPrice: 107.70,
    image: "img/combo-duplo.jpeg",
    badge: "Super Combo Duplo",
    serves: "Serve 2 pessoas",
    hasOptions: true,
    optionGroups: [
      {
        id: "bebida_combo",
        title: "Escolha a Bebida do Combo",
        subtitle: "Escolha 1 opção inclusa",
        required: true,
        options: COMBO_BEVERAGE_OPTIONS
      }
    ]
  },
  {
    id: "combo-misto",
    category: "promocoes",
    name: "Combo Misto",
    subtitle: "Duplo & Tradicional + 1x Batata Grande 300g + Bebida à sua escolha",
    composition: "1x Cailu Love Duplo + 1x Cailu Tradicional + 1x Batata Frita Grande 300g + Bebida à sua escolha (Coca 600ml ou Guaraná 1L).",
    description: "COMPOSIÇÃO: 1x Cailu Love Duplo + 1x Cailu Tradicional + 1x Batata Frita Grande 300g + Bebida à sua escolha.\n\nO COMBO PERFEITO NÃO EXIS... PERA, EXISTE SIM! Aquele empasse clássico: um quer um burger monstro e o outro quer um clássico perfeito? O Combo Misto resolve a indecisão do casal com o melhor dos dois mundos.",
    price: 74.90,
    originalPrice: 94.70,
    image: "img/combo-misto.jpeg",
    badge: "O Mais Pedido",
    serves: "Serve 2 pessoas",
    hasOptions: true,
    optionGroups: [
      {
        id: "bebida_combo",
        title: "Escolha a Bebida do Combo",
        subtitle: "Escolha 1 opção inclusa",
        required: true,
        options: COMBO_BEVERAGE_OPTIONS
      }
    ]
  },
  {
    id: "combo-mix-premium",
    category: "promocoes",
    name: "Combo Mix Premium",
    subtitle: "Bacon Love & Cailu Crispy + 1x Batata Grande + Bebida à sua escolha",
    composition: "1x Bacon Love + 1x Cailu Crispy + 1x Batata Frita Grande + Bebida à sua escolha (Coca 600ml ou Guaraná 1L).",
    description: "COMPOSIÇÃO: 1x Bacon Love + 1x Cailu Crispy + 1x Batata Frita Grande + Bebida à sua escolha.\n\nSESSÃO PREMIUM NA CAILU BURGER! Se você ama texturas marcantes, a crocância perfeita do bacon e cebola crispy, esse combo foi feito sob medida para a sua noite.",
    price: 74.90,
    originalPrice: 95.70,
    image: "img/combo-mix-premium.jpeg",
    badge: "Sessão Premium",
    serves: "Serve 2 pessoas",
    hasOptions: true,
    optionGroups: [
      {
        id: "bebida_combo",
        title: "Escolha a Bebida do Combo",
        subtitle: "Escolha 1 opção inclusa",
        required: true,
        options: COMBO_BEVERAGE_OPTIONS
      }
    ]
  },
  {
    id: "combo-smash-prime-80g",
    category: "promocoes",
    name: "Combo Smash Prime - 80g",
    subtitle: "2x Burgers Smash + 1x Batata Grande + Bebida à sua escolha",
    composition: "02 Burgers Smash à sua escolha (Clássico, Bacon Melt ou Crispy!) + 1x Batata Frita Grande + Bebida à sua escolha.",
    description: "COMPOSIÇÃO: 02 Burgers Smash à sua escolha (Clássico, Bacon Melt ou Crispy!) + 1x Batata Frita Grande + Bebida à sua escolha.\n\nA DUPLA DINÂMICA DOS SMASHES! Aquela combinação perfeita que só a nossa chapa sabe fazer. Monte o combo do seu jeito escolhendo os seus dois Smashes favoritos de 80g!",
    price: 57.90,
    originalPrice: 71.90,
    image: "img/combo-smash-prime.jpeg",
    badge: "Dupla Smash",
    serves: "Serve 2 pessoas",
    hasOptions: true,
    optionGroups: [
      {
        id: "smash_1",
        title: "Escolha o 1º Burger Smash",
        subtitle: "Escolha 1 opção inclusa",
        required: true,
        options: SMASH_BURGER_OPTIONS_1
      },
      {
        id: "smash_2",
        title: "Escolha o 2º Burger Smash",
        subtitle: "Escolha 1 opção inclusa",
        required: true,
        options: SMASH_BURGER_OPTIONS_2
      },
      {
        id: "bebida_combo",
        title: "Escolha a Bebida do Combo",
        subtitle: "Escolha 1 opção inclusa",
        required: true,
        options: COMBO_BEVERAGE_OPTIONS
      }
    ]
  },
  {
    id: "combo-smash-economico",
    category: "promocoes",
    name: "Combo Smash Econômico (O Queridinho do Bolso!)",
    subtitle: "1x Burger Smash + 1x Batata Pequena + 1x Refrigerante 200ml",
    composition: "1x Burger Smash à escolha + 1x Batata Frita Pequena + 1x Refrigerante 200ml à escolha.",
    description: "COMPOSIÇÃO: 1x Burger Smash à escolha + 1x Batata Frita Pequena + 1x Refrigerante 200ml à escolha.\n\nBateu aquela vontade de Cailu Burger mas a grana tá curta? Criamos o combo perfeito para salvar a sua noite sem pesar no bolso. O sabor incomparável do nosso Smash de 80g com um preço imbatível!",
    price: 27.90,
    originalPrice: 32.90,
    image: "img/combo-smash-economico.jpeg",
    badge: "Queridinho do Bolso",
    serves: "Individual",
    hasOptions: true,
    optionGroups: [
      {
        id: "smash_economico",
        title: "Escolha seu Burger Smash",
        subtitle: "Escolha 1 opção inclusa",
        required: true,
        options: SMASH_BURGER_OPTIONS_1
      },
      {
        id: "bebida_economica",
        title: "Escolha seu Refrigerante 200ml",
        subtitle: "Escolha 1 opção inclusa",
        required: true,
        options: SMASH_ECONOMICO_DRINK_OPTIONS
      }
    ]
  },

  // --- BURGERS ARTESANAIS (BLENDS EXCLUSIVOS NA BRASA) ---
  {
    id: "cailu-tradicional",
    category: "artesanais",
    name: "Cailu Tradicional",
    subtitle: "Blend 120g na brasa, queijo prato, bacon e brioche",
    description: "A essência do verdadeiro burger artesanal. Um suculento blend de 120g (in natura) grelhado no ponto, coberto com queijo prato derretido e fatias de bacon crocante. Para trazer o frescor ideal, finalizamos com alface americana selecionada, tudo isso abraçado pelo delicioso molho grill e um pão brioche macio e amanteigado. O clássico que nunca decepciona!",
    price: 24.90,
    image: "img/cailu-tradicional.jpeg",
    badge: "O Clássico",
    serves: "Individual",
    hasAddons: true,
    addons: BURGER_ADDONS
  },
  {
    id: "cailu-bacon-love",
    category: "artesanais",
    name: "Cailu Bacon Love",
    subtitle: "Blend 120g, mix de queijos e bacon caramelizado exclusivo",
    description: "Prepare-se para uma explosão de sabores! Imagine um burger de 120g (in natura) grelhado no ponto, abraçado por um mix de queijo prato e cheddar cremoso. Agora adicione o toque exclusivo do nosso bacon caramelizado, que traz aquele sabor defumado e levemente adocicado. Tudo isso no pão brioche que derrete na boca, com o frescor da alface americana e o nosso saboroso molho grill. É impossível comer um só!",
    price: 28.90,
    image: "img/cailu-bacon-love.jpeg",
    badge: "Mais Pedido",
    serves: "Individual",
    hasAddons: true,
    addons: BURGER_ADDONS
  },
  {
    id: "cailu-crispy",
    category: "artesanais",
    name: "Cailu Crispy",
    subtitle: "Blend 120g, cheddar, bacon e cebolas empanadas ultra crocantes",
    description: "O mestre das texturas! Um suculento hambúrguer artesanal de 120g (in natura), coberto com queijo cheddar derretido e fatias de bacon crocante. O grande destaque fica por conta das nossas generosas e douradas cebolas empanadas, que trazem o 'crunch' perfeito a cada mordida. Tudo isso no pão brioche macio com o frescor da alface americana e pra finalizar o nosso molho grill de dar água na boca. Prepare os ouvidos para a crocância!",
    price: 35.90,
    image: "img/cailu-crispy.jpeg",
    badge: "Super Crocante",
    serves: "Individual",
    hasAddons: true,
    addons: BURGER_ADDONS
  },
  {
    id: "cailu-love-duplo",
    category: "artesanais",
    name: "Cailu Love Duplo",
    subtitle: "2 Blends de 120g (240g carne), duplo queijo e bacon carnudo",
    description: "A união perfeita entre intensidade e cremosidade. São dois blends artesanais de 120g (240g de carne in natura) grelhados na medida certa, acompanhados por duas fatias de queijo prato e a explosão de sabor do nosso cheddar cremoso. Para completar essa experiência, adicionamos fatias de bacon carnudo e crocante, além do frescor da alface americana e do nosso molho grill irresistível, tudo isso servido em um pão brioche macio e selado na manteiga.",
    price: 37.90,
    image: "img/cailu-duplo.jpeg",
    badge: "Duplo Blend (240g)",
    serves: "Individual Grande",
    hasAddons: true,
    addons: BURGER_ADDONS
  },

  // --- SMASH BURGERS INDIVIDUAIS ---
  {
    id: "smash-bacon-melt",
    category: "smash",
    name: "Smash Bacon Melt",
    subtitle: "Smash crocante, cheddar, bacon caramelizado e molho grill",
    description: "Pão brioche selado na manteiga, blend smash ultra prensado na chapa com crosta perfeita, queijo cheddar derretido, nosso exclusivo bacon caramelizado artesanal e molho grill da casa.",
    price: 20.00,
    image: "img/smash-bacon-melt.jpeg",
    badge: "Smash Especial",
    serves: "Individual",
    hasAddons: true,
    addons: BURGER_ADDONS
  },
  {
    id: "smash-cebola-caramelizada",
    category: "smash",
    name: "Smash Cebola Caramelizada",
    subtitle: "Smash tostadinho, queijo prato, cebola caramelizada e molho grill",
    description: "Pão brioche fofinho, blend smash grelhado na chapa bem tostadinho, queijo prato derretido, cebola caramelizada lentamente e molho grill especial Cailu.",
    price: 20.00,
    image: "img/smash-cebola-caramelizada.jpeg",
    badge: "Sabor Marcante",
    serves: "Individual",
    hasAddons: true,
    addons: BURGER_ADDONS
  },
  {
    id: "smash-classico-irresistivel",
    category: "smash",
    name: "Smash Clássico Irresistível",
    subtitle: "Smash com crosta dourada, queijo prato, alface, tomate e molho grill",
    description: "A combinação infalível: blend smash na chapa com crosta dourada, camada generosa de queijo prato derretido, alface americana, tomate cereja e molho grill da casa.",
    price: 20.00,
    image: "img/smash-classico-irresistivel.jpeg",
    badge: "Clássico Smash",
    serves: "Individual",
    hasAddons: true,
    addons: BURGER_ADDONS
  },
  {
    id: "smash-crispy",
    category: "smash",
    name: "Smash Crispy",
    subtitle: "Smash com crosta dourada, muito cheddar e cebolas empanadas",
    description: "A combinação infalível: blend smash na chapa com crosta dourada, camada generosa de cheddar cremoso derretido, cebolas empanadas em tiras e molho da casa.",
    price: 20.00,
    image: "img/smash-crispy.jpeg",
    badge: "Clássico Smash",
    serves: "Individual",
    hasAddons: true,
    addons: BURGER_ADDONS
  },

  // --- BEBIDAS COM ESCOLHA DE TAMANHO E NORMAL/ZERO ---
  {
    id: "bebida-coca-cola",
    category: "bebidas",
    name: "Coca-Cola",
    subtitle: "Escolha Normal ou Zero Açúcar e o tamanho desejado",
    description: "Refrigerante Coca-Cola estupidamente gelado. Personalize escolhendo a sua versão favorita (Normal ou Zero Açúcar) e o volume ideal.",
    price: 4.00, // Preço a partir de
    image: "img/logo-coca-cola.jpg",
    badge: "Super Gelada",
    serves: "A partir de 200ml",
    hasOptions: true,
    optionTypeLabel: "Versão da Coca-Cola",
    types: [
      { id: "Normal", name: "Normal (Original)" },
      { id: "Zero Açúcar", name: "Zero Açúcar" }
    ],
    sizes: [
      { id: "Pet 200ml", name: "Pet 200ml", price: 4.00, default: true },
      { id: "Lata 350ml", name: "Lata 350ml", price: 8.00 },
      { id: "Garrafa 600ml", name: "Garrafa 600ml", price: 10.00 }
    ]
  },
  {
    id: "bebida-guarana-antarctica",
    category: "bebidas",
    name: "Guaraná Antarctica",
    subtitle: "Escolha Normal ou Zero Açúcar e o tamanho",
    description: "O autêntico sabor brasileiro do Guaraná Antarctica bem geladinho. Escolha entre a versão Tradicional ou Zero Açúcar no tamanho desejado.",
    price: 4.00,
    image: "img/logo-guarana.jpg",
    badge: "Gelada",
    serves: "A partir de 200ml",
    hasOptions: true,
    optionTypeLabel: "Versão do Guaraná",
    types: [
      { id: "Normal", name: "Normal (Original)" },
      { id: "Zero Açúcar", name: "Zero Açúcar" }
    ],
    sizes: [
      { id: "Pet 200ml", name: "Pet 200ml", price: 4.00, default: true },
      { id: "Lata 350ml", name: "Lata 350ml", price: 8.00 },
      { id: "Garrafa 1 Litro", name: "Garrafa 1 Litro", price: 10.00 }
    ]
  },
  {
    id: "bebida-pepsi",
    category: "bebidas",
    name: "Pepsi",
    subtitle: "Escolha Normal ou Black/Zero e o tamanho",
    description: "Refrigerante Pepsi geladinho. Escolha entre a versão Normal ou Black/Zero e o tamanho ideal para refrescar seu pedido.",
    price: 4.00,
    image: "img/logo-pepsi.jpg",
    badge: "Gelada",
    serves: "A partir de 200ml",
    hasOptions: true,
    optionTypeLabel: "Versão da Pepsi",
    types: [
      { id: "Normal", name: "Normal (Original)" },
      { id: "Black / Zero", name: "Black / Zero" }
    ],
    sizes: [
      { id: "Pet 200ml", name: "Pet 200ml", price: 4.00, default: true },
      { id: "Lata 350ml", name: "Lata 350ml", price: 8.00 }
    ]
  },
  {
    id: "bebida-fanta",
    category: "bebidas",
    name: "Fanta Guaraná",
    subtitle: "Escolha Normal ou Black/Zero e o tamanho",
    description: "Refrigerante Fanta geladinho. Escolha entre a versão Normal ou Black/Zero e o tamanho ideal para refrescar seu pedido.",
    price: 8.00,
    image: "img/logo-fanta.jpg",
    badge: "Gelada",
    serves: "A partir de 200ml",
    hasOptions: true,
    optionTypeLabel: "Versão da Fanta",
    types: [
      { id: "Guaraná", name: "Guaraná" }
    ],
    sizes: [
      { id: "Lata 350ml", name: "Lata 350ml", price: 8.00, default: true }
    ]
  },

  // --- ACOMPANHAMENTOS EXTRAS ---
  {
    id: "batata-frita-individual",
    category: "acompanhamentos",
    name: "Batata Frita Crocante",
    subtitle: "Batatas sequinhas e crocantes com tempero da casa",
    description: "Porção de batatas fritas palito sequinhas e crocantes, temperadas com tempero da casa. Escolha o tamanho ideal.",
    price: 8.90,
    image: "img/batata-frita.jpg",
    badge: "Crocante",
    serves: "Pequena ou Grande",
    hasOptions: true,
    optionTypeLabel: "Tamanho da Batata",
    sizes: [
      { id: "Pequena", name: "Pequena", price: 8.90, default: true },
      { id: "Grande", name: "Grande", price: 15.90 }
    ]
  },
  {
    id: "frango-frito",
    category: "acompanhamentos",
    name: "Frango Frito",
    subtitle: "Pedaços crocantes e suculentos com tempero especial",
    description: "Porção de frango frito crocante e suculento, preparado com tempero artesanal exclusivo da casa. Escolha o tamanho ideal.",
    price: 28.90,
    image: "img/frango-frito.jpeg",
    badge: "Super Crocante",
    serves: "Pequena ou Grande",
    hasOptions: true,
    optionTypeLabel: "Tamanho da Porção",
    sizes: [
      { id: "Pequena", name: "Pequena (5 uni)", price: 28.90, default: true },
      { id: "Grande", name: "Grande (10 uni)", price: 49.90 }
    ]
  }
];
