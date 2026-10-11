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
  address: "Rua Lindolfo de Azevedo, 1518 - Jardim América, BH - MG",
  neighborhood: "Jardim América",
  coverage: "Jardim América e Região (BH)",
  averageTime: "35 - 50 min",
  deliveryFee: 6.00, // Taxa de entrega padrão em R$
  minOrder: 20.00,   // Pedido mínimo em R$
  openingHours: {
    days: "Quarta a Domingo",
    open: 18,        // 18:00
    openMinutes: 30,
    close: 23,       // 23:30
    closeMinutes: 30
  },
  instagram: "@cailuburger",
  instagramUrl: "https://www.instagram.com/cailuburger/",
  pixKey: "31982853457 (Celular / Luana Avelar)"
};

// Categorias do cardápio Cailu Burger
const CATEGORIES = [
  { id: "all", name: "Todos", icon: "⭐" },
  { id: "promocoes", name: "Promoções & Combos", icon: "🔥" },
  { id: "artesanais", name: "Burgers Artesanais", icon: "🍔" },
  { id: "smash", name: "Smash Burgers", icon: "⚡" },
  { id: "bebidas", name: "Bebidas Geladas", icon: "🥤" },
  { id: "acompanhamentos", name: "Acompanhamentos", icon: "🍟" }
];

// Lista oficial de produtos com fotos reais e opções inteligentes
const PRODUCTS = [
  // --- PROMOÇÕES & COMBOS ESPECIAIS ---
  {
    id: "promo-dose-dupla",
    category: "promocoes",
    name: "Promoção De Inauguração - Cailu Dose Dupla",
    subtitle: "2 smashs artesanais pelo preço de 1",
    description: "Por que escolher um se você pode ter dois? Garantia de satisfação em dose dupla. Levamos até você dois burgers artesanais montados no capricho: um clássico com muito cheddar e bacon, e outro sofisticado com o toque da nossa cebola caramelizada. Ambos acompanham o legítimo molho grill irresistível e pão brioche selado na manteiga.",
    price: 26.90,
    image: "img/cailu-dose-dupla.jpeg",
    badge: "Campeão de Vendas",
    serves: "Serve 2 pessoas"
  },
  {
    id: "combo-love-crispy",
    category: "promocoes",
    name: "Combo Cailu Love + Crispy",
    subtitle: "2 burgers artesanais + 2 refrigerantes 200ml",
    description: "1 Cailu Bacon Love + 1 Cailu Crispy + 2 Refrigerantes de 200ml à sua escolha. O combo perfeito para casal ou para quem ama uma explosão de crocância e queijo derretido!",
    price: 59.90,
    image: "img/combo-love-crispy.jpeg",
    badge: "Combo Casal",
    serves: "Serve 2 pessoas"
  },
  {
    id: "combo-duplo-tradicional",
    category: "promocoes",
    name: "Combo Cailu Love Duplo + Tradicional",
    subtitle: "2 burgers especiais + 2 refrigerantes 200ml",
    description: "1 Cailu Tradicional + 1 Cailu Love Duplo + 2 Refrigerantes de 200ml à sua escolha. A combinação consagrada para os verdadeiros apaixonados por burger artesanal na brasa.",
    price: 56.90,
    image: "img/combo-tradicional-duplo.jpg",
    badge: "Super Pedido",
    serves: "Serve 2 pessoas"
  },
  {
    id: "combo-trio-smash",
    category: "promocoes",
    name: "Trio Combo Smash Cailu",
    subtitle: "3 smash burgers artesanais completos",
    description: "3 deliciosos smash burgers artesanais da casa com queijo derretido, bacon crocante e molho grill especial. Ideal para dividir com a galera ou em família!",
    price: 49.90,
    image: "img/trio-combo-smash.jpeg",
    badge: "Para a Galera",
    serves: "Serve 2 a 3 pessoas"
  },

  // --- BURGERS ARTESANAIS (BLENDS EXCLUSIVOS NA BRASA) ---
  {
    id: "cailu-tradicional",
    category: "artesanais",
    name: "Cailu Tradicional",
    subtitle: "Blend 120g na brasa, queijo prato, bacon e brioche",
    description: "A essência do verdadeiro burger artesanal. Um suculento blend de 120g (in natura) grelhado no ponto, coberto com queijo prato derretido e fatias de bacon crocante. Para trazer o frescor ideal, finalizamos com alface americana selecionada, tudo isso abraçado pelo delicioso molho grill e um pão brioche macio e amanteigado. O clássico que nunca decepciona!",
    price: 22.90,
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
    price: 27.90,
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
    price: 33.90,
    image: "img/cailu-crispy.jpeg",
    badge: "Super Crocante",
    serves: "Individual"
  },
  {
    id: "cailu-love-duplo",
    category: "artesanais",
    name: "Cailu Love Duplo",
    subtitle: "2 Blends de 90g (180g carne), duplo queijo e bacon carnudo",
    description: "A união perfeita entre intensidade e cremosidade. São dois blends artesanais de 90g (180g de carne in natura) grelhados na medida certa, acompanhados por duas fatias de queijo prato e a explosão de sabor do nosso cheddar cremoso. Para completar essa experiência, adicionamos fatias de bacon carnudo e crocante, além do frescor da alface americana e do nosso molho grill irresistível, tudo isso servido em um pão brioche macio e selado na manteiga.",
    price: 35.90,
    image: "img/cailu-love-duplo.jpeg",
    badge: "Duplo Blend (180g)",
    serves: "Individual Grande"
  },

  // --- SMASH BURGERS INDIVIDUAIS ---
  {
    id: "smash-bacon-caramelizado",
    category: "smash",
    name: "Smash Bacon Caramelizado",
    subtitle: "Smash crocante, cheddar, bacon caramelizado e molho grill",
    description: "Pão brioche selado na manteiga, blend smash ultra prensado na chapa com crosta perfeita, queijo cheddar derretido, nosso exclusivo bacon caramelizado artesanal e molho grill da casa.",
    price: 18.90,
    image: "img/smash-bacon-caramelizado.jpeg",
    badge: "Smash Especial",
    serves: "Individual"
  },
  {
    id: "smash-cebola-caramelizada",
    category: "smash",
    name: "Smash Cebola Caramelizada",
    subtitle: "Smash tostadinho, queijo prato, cebola caramelizada e molho grill",
    description: "Pão brioche fofinho, blend smash grelhado na chapa bem tostadinho, queijo prato derretido, cebola caramelizada lentamente e molho grill especial Cailu.",
    price: 18.90,
    image: "img/smash-cebola-caramelizada.jpeg",
    badge: "Sabor Marcante",
    serves: "Individual"
  },
  {
    id: "smash-cheddar-bacon",
    category: "smash",
    name: "Smash Cheddar e Bacon",
    subtitle: "Smash com crosta dourada, muito cheddar e bacon crocante",
    description: "A combinação infalível: blend smash na chapa com crosta dourada, camada generosa de cheddar cremoso derretido, bacon crocante em tiras e molho da casa.",
    price: 18.90,
    image: "img/smash-cheddar-bacon.jpeg",
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
    image: "img/coca-zero-200ml.avif",
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
      { id: "Lata 350ml", name: "Lata 350ml", price: 6.50 },
      { id: "Garrafa 600ml", name: "Garrafa 600ml", price: 8.50 }
    ]
  },
  {
    id: "bebida-guarana-antarctica",
    category: "bebidas",
    name: "Guaraná Antarctica",
    subtitle: "Escolha Normal ou Zero Açúcar e o tamanho",
    description: "O autêntico sabor brasileiro do Guaraná Antarctica bem geladinho. Escolha entre a versão Tradicional ou Zero Açúcar no tamanho desejado.",
    price: 4.00,
    image: "img/guarana-zero-200ml.avif",
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
      { id: "Lata 350ml", name: "Lata 350ml", price: 6.00 },
      { id: "Garrafa 1 Litro", name: "Garrafa 1 Litro", price: 9.90 }
    ]
  },
  {
    id: "bebida-pepsi",
    category: "bebidas",
    name: "Pepsi",
    subtitle: "Escolha Normal ou Black/Zero e o tamanho",
    description: "Refrigerante Pepsi geladinho. Escolha entre a versão Normal ou Black/Zero e o tamanho ideal para refrescar seu pedido.",
    price: 4.00,
    image: "img/pepsi-200ml.avif",
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
      { id: "Lata 350ml", name: "Lata 350ml", price: 6.00 }
    ]
  },
  {
    id: "bebida-agua-mineral",
    category: "bebidas",
    name: "Água Mineral 500ml",
    subtitle: "Escolha Com Gás ou Sem Gás",
    description: "Água mineral gelada em garrafa pet de 500ml. Escolha se prefere com gás ou sem gás.",
    price: 4.00,
    image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=700&q=80",
    badge: "Gelada",
    serves: "500ml",
    hasOptions: true,
    optionTypeLabel: "Tipo de Água",
    types: [
      { id: "Sem Gás", name: "Sem Gás" },
      { id: "Com Gás", name: "Com Gás" }
    ],
    sizes: [
      { id: "Garrafa 500ml", name: "Garrafa 500ml", price: 4.00, default: true }
    ]
  },

  // --- ACOMPANHAMENTOS EXTRAS ---
  {
    id: "batata-frita-individual",
    category: "acompanhamentos",
    name: "Batata Frita Crocante Individual (150g)",
    subtitle: "Batatas sequinhas e crocantes com páprica",
    description: "Porção individual de batatas fritas palito sequinhas e crocantes, temperadas com sal refinado e toque suave de páprica especial.",
    price: 12.90,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80",
    badge: "Crocante",
    serves: "Individual"
  },
  {
    id: "molho-grill-extra",
    category: "acompanhamentos",
    name: "Pote Extra de Molho Grill da Casa (50ml)",
    subtitle: "O molho assinatura da Cailu Burger",
    description: "Nosso autêntico molho grill cremoso e aromático, feito artesanalmente para mergulhar seus burgers e batatas.",
    price: 4.00,
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=700&q=80",
    badge: "Molho da Casa",
    serves: "Pote 50ml"
  }
];
