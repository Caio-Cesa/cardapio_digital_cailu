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
  address: "Rua Domingos Rocha - Salgado Filho, BH - MG",
  neighborhood: "Salgado Filho",
  coverage: "Salgado Filho e Região (BH)",
  averageTime: "35 - 50 min",
  deliveryFee: 6.00, // Taxa de entrega padrão em R$
  minOrder: 20.00,   // Pedido mínimo em R$
  openingHours: {
    days: "Terça a Domingo",
    open: 18,        // 18:00
    openMinutes: 30,
    close: 23,       // 23:30
    closeMinutes: 30
  },
  instagram: "@cailuburger",
  instagramUrl: "https://www.instagram.com/cailuburger/",
  pixKey: "64875012000142 (CNPJ / Luana Fátima)"
};

// Categorias do cardápio Cailu Burger
const CATEGORIES = [
  { id: "all", name: "Todos", icon: "⭐" },
  { id: "promocoes", name: "Combos Artesanais", icon: "🔥" },
  { id: "artesanais", name: "Burgers Artesanais", icon: "🍔" },
  { id: "smash", name: "Smash Burgers", icon: "⚡" },
  { id: "bebidas", name: "Bebidas Geladas", icon: "🥤" },
  { id: "acompanhamentos", name: "Acompanhamentos", icon: "🍟" }
];

// Lista oficial de produtos com fotos reais e opções inteligentes
const PRODUCTS = [
  // --- COMBOS ARTESANAIS OFICIAIS (SEU ARTESANAL DE VERDADE!) ---
  {
    id: "combo-duplo",
    category: "promocoes",
    name: "Combo Duplo",
    subtitle: "2x Cailu Love Duplo + 1x Batata Grande 300g + 2x Refris Lata 350ml",
    composition: "2x Cailu Love Duplo + 1x Batata Frita Grande 300g + 2x Refrigerantes Lata 350ml.",
    description: "COMPOSIÇÃO: 2x Cailu Love Duplo + 1x Batata Frita Grande 300g + 2x Refrigerantes Lata 350ml.\n\nA FOME TÁ GIGANTE POR AÍ? Para os casais ou amigos que não brincam em serviço quando o assunto é hambúrguer de verdade. São 4 blends de carne grelhados na chapa esperando por vocês!",
    price: 87.90,
    originalPrice: 107.70,
    image: "img/combo-duplo.jpeg",
    badge: "Super Combo Duplo",
    serves: "Serve 2 pessoas"
  },
  {
    id: "combo-misto",
    category: "promocoes",
    name: "Combo Misto",
    subtitle: "Duplo & Tradicional + 1x Batata Grande 300g + 2x Refris Lata 350ml",
    composition: "1x Cailu Love Duplo + 1x Cailu Tradicional + 1x Batata Frita Grande 300g + 2x Refrigerantes Lata 350ml.",
    description: "COMPOSIÇÃO: 1x Cailu Love Duplo + 1x Cailu Tradicional + 1x Batata Frita Grande 300g + 2x Refrigerantes Lata 350ml.\n\nO COMBO PERFEITO NÃO EXIS... PERA, EXISTE SIM! Aquele empasse clássico: um quer um burger monstro e o outro quer um clássico perfeito? O Combo Misto resolve a indecisão do casal com o melhor dos dois mundos.",
    price: 74.90,
    originalPrice: 94.70,
    image: "img/combo-misto.jpeg",
    badge: "O Mais Pedido",
    serves: "Serve 2 pessoas"
  },
  {
    id: "combo-mix-premium",
    category: "promocoes",
    name: "Combo Mix Premium",
    subtitle: "Bacon Love & Cailu Crispy + 1x Batata Grande + 2x Refris Lata 350ml",
    composition: "1x Bacon Love + 1x Cailu Crispy + 1x Batata Frita Grande + 2x Refrigerantes Lata 350ml.",
    description: "COMPOSIÇÃO: 1x Bacon Love + 1x Cailu Crispy + 1x Batata Frita Grande + 2x Refrigerantes Lata 350ml.\n\nSESSÃO PREMIUM NA CAILU BURGER! Se você ama texturas marcantes, a crocância perfeita do bacon e cebola crispy, esse combo foi feito sob medida para a sua noite.",
    price: 74.90,
    originalPrice: 95.70,
    image: "img/combo-mix-premium.jpeg",
    badge: "Sessão Premium",
    serves: "Serve 2 pessoas"
  },
  {
    id: "combo-smash-prime-80g",
    category: "promocoes",
    name: "Combo Smash Prime - 80g",
    subtitle: "2x Burgers Smash + 1x Batata Grande + 2x Refris Lata 350ml",
    composition: "02 Burgers Smash à sua escolha (Clássico, Bacon Melt ou Crispy!) + 1x Batata Frita Grande + 2x Refrigerantes Lata 350ml.",
    description: "COMPOSIÇÃO: 02 Burgers Smash à sua escolha (Clássico, Bacon Melt ou Crispy!) + 1x Batata Frita Grande + 2x Refrigerantes Lata 350ml.\n\nA DUPLA DINÂMICA DOS SMASHES! Aquela combinação perfeita que só a nossa chapa sabe fazer. Monte o combo do seu jeito escolhendo os seus dois Smashes favoritos de 80g! (Vale repetir o sabor, hein?).",
    price: 57.90,
    originalPrice: 71.90,
    image: "img/combo-smash-prime.jpeg",
    badge: "Dupla Smash",
    serves: "Serve 2 pessoas"
  },
  {
    id: "combo-smash-economico",
    category: "promocoes",
    name: "Combo Smash Econômico (O Queridinho do Bolso!)",
    subtitle: "1x Burger Smash + 1x Batata Pequena + 1x Refrigerante 200ml",
    composition: "1x Burger Smash (escolha a opção: Clássico, Bacon Melt ou Crispy) + 1x Batata Frita Pequena + 1x Refrigerante 200ml.",
    description: "COMPOSIÇÃO: 1x Burger Smash (escolha a opção: Clássico, Bacon Melt ou Crispy) + 1x Batata Frita Pequena + 1x Refrigerante 200ml.\n\nBateu aquela vontade de Cailu Burger mas a grana tá curta? Criamos o combo perfeito para salvar a sua noite sem pesar no bolso. O sabor incomparável do nosso Smash de 80g com um preço imbatível!",
    price: 27.90,
    originalPrice: 32.90,
    image: "img/combo-smash-economico.jpeg",
    badge: "Queridinho do Bolso",
    serves: "Individual"
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
    serves: "Individual"
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
    serves: "Individual"
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
    serves: "Individual"
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
    serves: "Individual Grande"
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
    serves: "Individual"
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
    serves: "Individual"
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
    serves: "Individual"
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
    serves: "Individual"
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
    id: "molho-grill-extra",
    category: "acompanhamentos",
    name: "Pote Extra de Molho Grill da Casa (50ml)",
    subtitle: "O molho assinatura da Cailu Burger",
    description: "Nosso autêntico molho grill cremoso e aromático, feito artesanalmente para mergulhar seus burgers e batatas.",
    price: 4.00,
    image: "",
    badge: "Molho da Casa",
    serves: "Pote 50ml"
  }
];
