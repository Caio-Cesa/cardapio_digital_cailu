/**
 * ==============================================================================
 * CARDÁPIO DIGITAL CAILU BURGER - LÓGICA PRINCIPAL & UX
 * ==============================================================================
 * Gerenciamento do catálogo com exibição em Carrossel por Categoria,
 * personalização inteligente de bebidas (Versão Normal/Zero e Tamanhos),
 * carrinho de compras interativo, persistência em LocalStorage e integração WhatsApp (100% sem emojis na URL).
 */

// Estado Global da Aplicação
const AppState = {
  cart: [],
  activeCategory: "all",
  searchQuery: "",
  appliedCoupon: null, // { code: 'CAILU10', discountPercent: 10 }
  selectedProductForModal: null,
  modalQuantity: 1,
  selectedOptionType: null, // Ex: "Zero Açúcar" ou "Normal (Original)"
  selectedOptionSize: null,  // Ex: { id: "Lata 350ml", name: "Lata 350ml", price: 6.50 }
  selectedCustomGroupOptions: {}, // Ex: { "bebida_combo": optionObj }
  selectedAddons: {},         // Ex: { "addon-bacon": 2, "addon-carne-120g": 1 } — total compartilhado (max MAX_ADDONS_TOTAL)
  deliveryDistanceKm: null,
  deliveryFee: RESTAURANT_CONFIG.deliveryFee,
  deliveryTime: RESTAURANT_CONFIG.averageTime,
  deliveryExceedsMax: false,
  deliveryCoords: null,
  isCalculatingDelivery: false
};

// Chaves do LocalStorage
const STORAGE_KEYS = {
  CUSTOMER: "cailu_customer_data_v1",
  CART: "cailu_cart_items_v1"
};

// ==============================================================================
// UTILITÁRIOS E FORMATADORES
// ==============================================================================

/**
 * Remove qualquer caractere emoji ou símbolo de 4 bytes de uma string
 * para garantir que o link wa.me/?text=... não seja rejeitado por nenhum navegador
 */
function stripEmojis(str) {
  if (!str) return "";
  return str
    .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, "")
    .trim();
}

/**
 * Formata um número para o padrão monetário brasileiro (R$ 0,00)
 */
function formatMoney(value) {
  const num = Number(value) || 0;
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

/**
 * Exibe notificação temporária no topo da tela (Toast)
 */
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icon = type === "success" ? "✓" : (type === "error" ? "!" : "i");

  toast.innerHTML = `
    <span class="toast-icon-badge">${icon}</span>
    <span class="toast-text">${message}</span>
  `;

  container.appendChild(toast);

  // Remove o elemento após a animação (3 segundos)
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
}

/**
 * Rola a esteira de carrossel para esquerda ou direita com animação suave
 */
window.scrollCarousel = function (carouselId, direction) {
  const container = document.getElementById(carouselId);
  if (!container) return;

  const card = container.querySelector(".product-card");
  const scrollAmount = card ? card.offsetWidth + 14 : 300;

  container.scrollBy({
    left: direction * scrollAmount,
    behavior: "smooth"
  });
};

// ==============================================================================
// VERIFICAÇÃO DE HORÁRIO DE ATENDIMENTO
// ==============================================================================
function checkStoreStatus() {
  const badge = document.getElementById("storeStatusBadge");
  const statusText = document.getElementById("storeStatusText");
  const banner = document.getElementById("closedStoreBanner");

  if (!badge || !statusText) return;

  const now = new Date();
  const day = now.getDay(); // 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta...
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour * 60 + minute;

  const cfg = RESTAURANT_CONFIG.openingHours || {};
  const openTime = (cfg.open ?? 18) * 60 + (cfg.openMinutes ?? 30);
  const closeTime = (cfg.close ?? 23) * 60 + (cfg.closeMinutes ?? 30);

  // Lista de dias da semana normalmente fechados (padrão: 1 = Segunda, 2 = Terça)
  const closedDaysList = Array.isArray(cfg.closedDays) ? cfg.closedDays : [1, 2];
  let isClosedDay = closedDaysList.includes(day);

  // CASOS ESPECIAIS / FERIADOS:
  // Se forceOpenToday estiver ativo, ignora o dia fechado
  if (cfg.forceOpenToday === true) {
    isClosedDay = false;
  }

  const isOpenHours = currentTime >= openTime && currentTime <= closeTime;
  let isOpen = !isClosedDay && isOpenHours;

  // Se forceClosedToday estiver ativo, força como fechado
  if (cfg.forceClosedToday === true) {
    isOpen = false;
  }

  if (isOpen) {
    badge.classList.remove("closed");
    statusText.textContent = "Aberto Agora";
    if (banner) banner.style.display = "none";
  } else {
    badge.classList.add("closed");
    statusText.textContent = "Fechado Agora";
    if (banner) banner.style.display = "block";
  }
}

// ==============================================================================
// INICIALIZAÇÃO E CARREGAMENTO DE DADOS
// ==============================================================================
document.addEventListener("DOMContentLoaded", () => {
  initRestaurantInfo();
  checkStoreStatus();
  setInterval(checkStoreStatus, 60000); // Atualiza o status automaticamente a cada 1 minuto
  renderCategories();
  renderProducts();
  loadSavedCustomerData();
  loadSavedCart();
  setupEventListeners();
  updateCartUI();
});

/**
 * Preenche cabeçalho e estatísticas a partir do RESTAURANT_CONFIG
 */
function initRestaurantInfo() {
  document.getElementById("restaurantName").textContent = RESTAURANT_CONFIG.name;
  document.getElementById("restaurantSlogan").textContent = RESTAURANT_CONFIG.slogan;
  document.getElementById("statTime").textContent = RESTAURANT_CONFIG.averageTime;
  document.getElementById("statCoverage").textContent = RESTAURANT_CONFIG.coverage;
  document.getElementById("statMinOrder").textContent = formatMoney(RESTAURANT_CONFIG.minOrder);
  document.getElementById("pixKeyValue").textContent = RESTAURANT_CONFIG.pixKey;

  // Imagem da Logo Oficial
  const logoImg = document.getElementById("restaurantLogoImg");
  if (logoImg && RESTAURANT_CONFIG.logo) {
    logoImg.src = RESTAURANT_CONFIG.logo;
  }

  // Link e identificador do Instagram
  const instagramLink = document.getElementById("instagramLink");
  if (instagramLink) {
    instagramLink.href = RESTAURANT_CONFIG.instagramUrl;
    const spanText = instagramLink.querySelector("span");
    if (spanText) spanText.textContent = RESTAURANT_CONFIG.instagram;
  }

  // Endereço / Bairro
  const addressEl = document.getElementById("restaurantAddress");
  if (addressEl) {
    addressEl.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      ${RESTAURANT_CONFIG.neighborhood} - BH
    `;
  }

  const hoursText = `${String(RESTAURANT_CONFIG.openingHours.open).padStart(2, '0')}:${String(RESTAURANT_CONFIG.openingHours.openMinutes).padStart(2, '0')} às ${String(RESTAURANT_CONFIG.openingHours.close).padStart(2, '0')}:${String(RESTAURANT_CONFIG.openingHours.closeMinutes).padStart(2, '0')}`;
  const statHoursEl = document.getElementById("statHours");
  if (statHoursEl) statHoursEl.textContent = hoursText;

  const footerHoursEl = document.getElementById("footerHours");
  if (footerHoursEl && RESTAURANT_CONFIG.openingHours.days) {
    footerHoursEl.textContent = `${RESTAURANT_CONFIG.openingHours.days} das ${hoursText}`;
  }

  const deliveryFeeLabel = document.getElementById("deliveryFeeLabel");
  if (deliveryFeeLabel) {
    deliveryFeeLabel.textContent = `Taxa: ${formatMoney(RESTAURANT_CONFIG.deliveryFee)}`;
  }

  const currentYearSpan = document.getElementById("currentYear");
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }
}

// ==============================================================================
// RENDERIZAÇÃO DE CATEGORIAS
// ==============================================================================
function renderCategories() {
  const container = document.getElementById("categoriesContainer");
  if (!container) return;

  container.innerHTML = "";

  CATEGORIES.forEach(category => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `category-pill-btn ${AppState.activeCategory === category.id ? "active" : ""}`;
    btn.dataset.category = category.id;
    btn.innerHTML = `
      <span class="pill-icon">${category.icon}</span>
      <span>${category.name}</span>
    `;

    btn.addEventListener("click", () => {
      AppState.activeCategory = category.id;

      document.querySelectorAll(".category-pill-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });

      renderProducts();

      // Rola suavemente até a seção correspondente
      if (category.id !== "all") {
        const targetSection = document.getElementById(`cat-section-${category.id}`);
        if (targetSection) {
          const navOffset = 110;
          const sectionPos = targetSection.getBoundingClientRect().top + window.pageYOffset - navOffset;
          window.scrollTo({ top: sectionPos, behavior: "smooth" });
        }
      } else {
        const mainContent = document.getElementById("mainContent");
        if (mainContent) {
          window.scrollTo({ top: mainContent.offsetTop - 120, behavior: "smooth" });
        }
      }
    });

    li.appendChild(btn);
    container.appendChild(li);
  });
}

// ==============================================================================
// RENDERIZAÇÃO DOS PRODUTOS (MODO CARROSSEL POR CATEGORIA)
// ==============================================================================
function renderProducts() {
  const menuContainer = document.getElementById("menuSections");
  const emptyState = document.getElementById("emptyState");
  const resultFeedback = document.getElementById("searchResultFeedback");
  const resultCount = document.getElementById("searchResultCount");

  if (!menuContainer) return;

  menuContainer.innerHTML = "";

  const isSearchActive = AppState.searchQuery.trim() !== "";

  // Filtragem
  let filtered = PRODUCTS.filter(prod => {
    const matchCategory = AppState.activeCategory === "all" || prod.category === AppState.activeCategory;
    const matchSearch = !isSearchActive ||
      prod.name.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(AppState.searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Feedback de busca
  if (isSearchActive) {
    resultFeedback.style.display = "flex";
    resultCount.textContent = `${filtered.length} item(ns) encontrado(s) para "${AppState.searchQuery}"`;
  } else {
    resultFeedback.style.display = "none";
  }

  // Estado Vazio
  if (filtered.length === 0) {
    emptyState.style.display = "block";
    return;
  } else {
    emptyState.style.display = "none";
  }

  // Se a busca textual estiver ativa, exibe em grade adaptável para escanear com facilidade
  if (isSearchActive) {
    const searchSection = document.createElement("section");
    searchSection.className = "category-section";

    const grid = document.createElement("div");
    grid.className = "products-grid-search";

    filtered.forEach(prod => {
      const card = createProductCard(prod, false);
      grid.appendChild(card);
    });

    searchSection.appendChild(grid);
    menuContainer.appendChild(searchSection);
    return;
  }

  // MODO CARROSSEL: Agrupa por categorias e cria esteiras horizontais deslizantes
  const categoriesToDisplay = AppState.activeCategory === "all"
    ? CATEGORIES.filter(c => c.id !== "all")
    : CATEGORIES.filter(c => c.id === AppState.activeCategory);

  categoriesToDisplay.forEach(cat => {
    const catProducts = filtered.filter(p => p.category === cat.id);
    if (catProducts.length === 0) return;

    const section = document.createElement("section");
    section.className = "category-section";
    section.id = `cat-section-${cat.id}`;

    // Cabeçalho da Seção com Título e Botões de Navegação do Carrossel
    const sectionHeader = document.createElement("div");
    sectionHeader.className = "category-header-title";
    sectionHeader.innerHTML = `
      <div class="category-header-left">
        <span class="section-icon">${cat.icon}</span>
        <h2>${cat.name}</h2>
        <span class="item-count-badge">${catProducts.length} itens</span>
      </div>
      <div class="carousel-nav-arrows">
        <button type="button" class="carousel-arrow-btn" onclick="scrollCarousel('carousel-${cat.id}', -1)" aria-label="Rolar para esquerda" title="Anterior">‹</button>
        <button type="button" class="carousel-arrow-btn" onclick="scrollCarousel('carousel-${cat.id}', 1)" aria-label="Rolar para direita" title="Próximo">›</button>
      </div>
    `;
    section.appendChild(sectionHeader);

    // Esteira Carrossel
    const carouselWrapper = document.createElement("div");
    carouselWrapper.className = "category-carousel-wrapper";

    const carousel = document.createElement("div");
    carousel.className = "category-carousel";
    carousel.id = `carousel-${cat.id}`;

    catProducts.forEach(prod => {
      const card = createProductCard(prod, true); // true = modo carrossel
      carousel.appendChild(card);
    });

    carouselWrapper.appendChild(carousel);
    section.appendChild(carouselWrapper);
    menuContainer.appendChild(section);
  });
}

/**
 * Cria o elemento DOM para o card do produto
 */
function createProductCard(prod, isCarousel = false) {
  const card = document.createElement("article");
  card.className = `product-card ${isCarousel ? "carousel-card" : ""}`;
  card.dataset.id = prod.id;

  // Verifica quantidade no carrinho (para produtos diretos sem opções)
  const cartItem = AppState.cart.find(item => item.id === prod.id);
  const currentQty = cartItem ? cartItem.quantity : 0;

  const badgeHtml = prod.badge ? `<span class="product-badge-flag">${prod.badge}</span>` : "";
  const servesHtml = prod.serves ? `<span class="product-serves-flag">${prod.serves}</span>` : "";
  const subtitleHtml = prod.subtitle ? `<p class="product-subtitle">${prod.subtitle}</p>` : "";

  const pricePrefix = prod.hasOptions ? "A partir de" : "Valor";

  card.innerHTML = `
    <div class="product-image-container" onclick="openProductModal('${prod.id}')" title="Clique para detalhes e opções">
      <img src="${prod.image || 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=700&q=80'}" alt="${prod.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80'">
      ${badgeHtml}
      ${servesHtml}
    </div>
    <div class="product-details">
      <h3 class="product-title" onclick="openProductModal('${prod.id}')">${prod.name}</h3>
      ${subtitleHtml}
      <p class="product-desc">${prod.description}</p>
      
      <div class="product-footer-row">
        <div class="product-price-wrapper">
          ${prod.originalPrice ? `<span class="product-price-old">De ${formatMoney(prod.originalPrice)}</span>` : `<span class="product-price-currency">${pricePrefix}</span>`}
          <span class="product-price-value">${formatMoney(prod.price)}</span>
        </div>

        <div class="product-action-wrapper" id="cardAction-${prod.id}">
          ${renderCardAction(prod, currentQty)}
        </div>
      </div>
    </div>
  `;

  return card;
}

/**
 * Renderiza o botão no card:
 * Se tiver opções (bebidas), mostra botão "Escolher".
 * Se não tiver, mostra botão "Adicionar" ou o seletor [- Qtd +].
 */
function renderCardAction(prod, quantity) {
  if (prod.hasOptions) {
    return `
      <button type="button" class="btn-choose-options" onclick="openProductModal('${prod.id}')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Escolher
      </button>
    `;
  }

  if (quantity > 0) {
    return `
      <div class="quantity-controller">
        <button type="button" class="qty-btn" onclick="updateItemQuantityById('${prod.id}', -1)" aria-label="Diminuir">-</button>
        <span class="qty-display">${quantity}</span>
        <button type="button" class="qty-btn" onclick="updateItemQuantityById('${prod.id}', 1)" aria-label="Aumentar">+</button>
      </div>
    `;
  } else {
    return `
      <button type="button" class="btn-add-product" onclick="quickAddToCart('${prod.id}')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Adicionar
      </button>
    `;
  }
}

// ==============================================================================
// MODAL DE DETALHES & OPÇÕES DO PRODUTO (BEBIDAS: NORMAL/ZERO & TAMANHO)
// ==============================================================================
window.openProductModal = function (productId) {
  const prod = PRODUCTS.find(p => p.id === productId);
  if (!prod) return;

  AppState.selectedProductForModal = prod;
  AppState.modalQuantity = 1;
  AppState.selectedAddons = {}; // Limpa acréscimos anteriores

  document.getElementById("modalProductTitle").textContent = prod.name;
  document.getElementById("modalProductDesc").textContent = prod.description;
  document.getElementById("modalProductImage").src = prod.image || 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=700&q=80';
  document.getElementById("modalProductServes").textContent = prod.serves || "";

  // Preço De / Por no Modal
  const oldPriceEl = document.getElementById("modalProductOldPrice");
  const currentPriceEl = document.getElementById("modalProductCurrentPrice");
  if (oldPriceEl && currentPriceEl) {
    if (prod.originalPrice) {
      oldPriceEl.textContent = `De ${formatMoney(prod.originalPrice)}`;
      oldPriceEl.style.display = "inline-block";
      currentPriceEl.textContent = `Por ${formatMoney(prod.price)}`;
    } else {
      oldPriceEl.style.display = "none";
      currentPriceEl.textContent = `${formatMoney(prod.price)}`;
    }
  }

  // Placeholder inteligente e aviso de observações
  const notesInput = document.getElementById("modalProductNotes");
  const notesNotice = document.getElementById("modalProductNotesNotice");
  const notesLabel = document.getElementById("modalProductNotesLabel");

  if (notesInput) {
    notesInput.value = "";
    if (prod.category === "bebidas") {
      if (notesLabel) {
        notesLabel.textContent = "Observação sobre a bebida:";
      }
      if (notesNotice) {
        notesNotice.textContent = "Mediante disponibilidade do estoque, em caso de opção indisponível nossa equipe entrará em contato para troca do item.";
        notesNotice.style.display = "block";
      }
      notesInput.style.display = "none";
    } else {
      if (notesLabel) {
        notesLabel.textContent = "Observações para este item (opcional):";
      }
      if (notesNotice) {
        notesNotice.textContent = "";
        notesNotice.style.display = "none";
      }
      notesInput.style.display = "block";
      if (prod.id === "combo-smash-prime-80g") {
        notesInput.placeholder = "Ex: 1 Clássico + 1 Bacon Melt, 2 Cocas lata bem geladas...";
      } else if (prod.id === "combo-smash-economico") {
        notesInput.placeholder = "Ex: Smash Bacon Melt, Coca 200ml bem geladinha...";
      } else if (prod.category === "promocoes") {
        notesInput.placeholder = "Ex: Sabores dos refrigerantes lata, ponto dos burgers...";
      } else {
        notesInput.placeholder = "Ex: Carne ao ponto, sem picles, molho grill à parte...";
      }
    }
  }

  const badgeEl = document.getElementById("modalProductBadge");
  if (prod.badge) {
    badgeEl.textContent = prod.badge;
    badgeEl.style.display = "inline-block";
  } else {
    badgeEl.style.display = "none";
  }

  // Configuração das Opções Customizáveis (Bebidas)
  const optionsWrapper = document.getElementById("modalCustomOptionsWrapper");
  const typeGroup = document.getElementById("modalTypeGroup");
  const typeChips = document.getElementById("modalTypeChips");
  const sizeGroup = document.getElementById("modalSizeGroup");
  const sizeChips = document.getElementById("modalSizeChips");
  const typeTitle = document.getElementById("modalTypeGroupTitle");
  const customGroupsContainer = document.getElementById("modalCustomGroupsContainer");

  // Limpar grupos customizados anteriores
  customGroupsContainer.innerHTML = "";
  AppState.selectedCustomGroupOptions = {};

  if (prod.hasOptions) {
    optionsWrapper.style.display = "flex";

    // Verifica se é combo com optionGroups (estilo iFood)
    if (prod.optionGroups && prod.optionGroups.length > 0) {
      // Esconder chips tradicionais para combos com optionGroups
      typeGroup.style.display = "none";
      sizeGroup.style.display = "none";
      AppState.selectedOptionType = null;
      AppState.selectedOptionSize = null;

      // Renderizar cada grupo de opções estilo iFood
      prod.optionGroups.forEach(group => {
        const defaultOpt = group.options.find(o => o.default) || group.options[0];
        AppState.selectedCustomGroupOptions[group.id] = defaultOpt;

        const groupEl = document.createElement("div");
        groupEl.className = "ifood-option-group";
        groupEl.innerHTML = `
          <div class="ifood-group-header">
            <div>
              <span class="ifood-group-title">${group.title}</span>
              <span class="ifood-group-subtitle">${group.subtitle || ""}</span>
            </div>
            ${group.required ? '<span class="required-badge">Obrigatório</span>' : ''}
          </div>
          <div class="ifood-options-list" data-group-id="${group.id}"></div>
        `;

        const listEl = groupEl.querySelector(".ifood-options-list");

        group.options.forEach(opt => {
          const card = document.createElement("div");
          card.className = `ifood-option-card ${opt.id === defaultOpt.id ? "selected" : ""}`;
          card.dataset.optionId = opt.id;

          const priceTag = (opt.priceDelta && opt.priceDelta > 0)
            ? `<span class="ifood-option-price-tag">+ ${formatMoney(opt.priceDelta)}</span>`
            : `<span class="ifood-option-price-tag free">Incluso</span>`;

          card.innerHTML = `
            <div class="ifood-option-left">
              <div class="ifood-option-thumb-wrapper">
                <img class="ifood-option-thumb" src="${opt.image}" alt="${opt.name}" loading="lazy">
              </div>
              <div class="ifood-option-info">
                <span class="ifood-option-name">${opt.name}</span>
                <span class="ifood-option-desc">${opt.description || ""}</span>
              </div>
            </div>
            <div class="ifood-option-right">
              ${priceTag}
              <div class="ifood-radio-circle">
                <div class="ifood-radio-dot"></div>
              </div>
            </div>
          `;

          card.addEventListener("click", () => {
            listEl.querySelectorAll(".ifood-option-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            AppState.selectedCustomGroupOptions[group.id] = opt;
            updateModalPrice();
          });

          listEl.appendChild(card);
        });

        customGroupsContainer.appendChild(groupEl);
      });

    } else {
      // Produtos com opções tradicionais (Bebidas individuais, Batata, etc.)

      // 1. Grupo de Versão (Normal / Zero Açúcar / Com ou Sem Gás)
      if (prod.types && prod.types.length > 0) {
        typeGroup.style.display = "flex";
        typeTitle.textContent = prod.optionTypeLabel || "Escolha a Versão";
        typeChips.innerHTML = "";

        AppState.selectedOptionType = prod.types[0].name;

        prod.types.forEach((typeObj, index) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = `option-chip-btn ${index === 0 ? "selected" : ""}`;
          btn.textContent = typeObj.name;

          btn.addEventListener("click", () => {
            typeChips.querySelectorAll(".option-chip-btn").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            AppState.selectedOptionType = typeObj.name;
          });

          typeChips.appendChild(btn);
        });
      } else {
        typeGroup.style.display = "none";
        AppState.selectedOptionType = null;
      }

      // 2. Grupo de Tamanho / Opções (Bebidas, Porções de Batata, etc.)
      const availableSizes = prod.sizes || prod.options;
      if (availableSizes && availableSizes.length > 0) {
        sizeGroup.style.display = "flex";
        const sizeTitleEl = document.getElementById("modalSizeGroupTitle");
        if (sizeTitleEl) {
          sizeTitleEl.textContent = prod.optionSizeLabel || (!prod.types ? prod.optionTypeLabel : "Escolha o Tamanho") || "Escolha o Tamanho";
        }
        sizeChips.innerHTML = "";

        const defaultSize = availableSizes.find(s => s.default) || availableSizes[0];
        AppState.selectedOptionSize = defaultSize;

        availableSizes.forEach(sizeObj => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = `option-chip-btn ${sizeObj.id === defaultSize.id ? "selected" : ""}`;
          btn.innerHTML = `
            <span>${sizeObj.name}</span>
            <span class="chip-price-tag">${formatMoney(sizeObj.price)}</span>
          `;

          btn.addEventListener("click", () => {
            sizeChips.querySelectorAll(".option-chip-btn").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            AppState.selectedOptionSize = sizeObj;
            updateModalPrice();
          });

          sizeChips.appendChild(btn);
        });
      } else {
        sizeGroup.style.display = "none";
        AppState.selectedOptionSize = null;
      }
    }


  } else {
    optionsWrapper.style.display = "none";
    AppState.selectedOptionType = null;
    AppState.selectedOptionSize = null;
  }

  // Seção de Acréscimos para Burgers Individuais (artesanais e smash)
  const addonsContainer = document.getElementById("modalAddonsContainer");
  const isBurgerIndividual = prod.category === "artesanais" || prod.category === "smash";
  if (addonsContainer) {
    if (isBurgerIndividual && BURGER_ADDONS && BURGER_ADDONS.length > 0) {
      addonsContainer.style.display = "block";
      renderAddonsUI();
    } else {
      addonsContainer.style.display = "none";
      addonsContainer.innerHTML = "";
    }
  }

  updateModalPrice();

  const backdrop = document.getElementById("productModalBackdrop");
  backdrop.classList.add("active");
  backdrop.setAttribute("aria-hidden", "false");
};


function closeProductModal() {
  const backdrop = document.getElementById("productModalBackdrop");
  backdrop.classList.remove("active");
  backdrop.setAttribute("aria-hidden", "true");
  AppState.selectedProductForModal = null;
}

function updateModalPrice() {
  const prod = AppState.selectedProductForModal;
  if (!prod) return;

  let unitPrice = AppState.selectedOptionSize ? AppState.selectedOptionSize.price : prod.price;

  // Soma priceDelta de optionGroups selecionados (combos estilo iFood)
  if (prod.optionGroups && prod.optionGroups.length > 0) {
    Object.values(AppState.selectedCustomGroupOptions).forEach(opt => {
      if (opt && opt.priceDelta) {
        unitPrice += opt.priceDelta;
      }
    });
  }

  // Soma acréscimos selecionados (objeto { addonId: qty })
  const addonsTotal = getAddonsTotalPrice();
  const total = (unitPrice + addonsTotal) * AppState.modalQuantity;

  document.getElementById("modalQtyDisplay").textContent = AppState.modalQuantity;
  document.getElementById("modalAddBtnPrice").textContent = formatMoney(total);

  const currentPriceEl = document.getElementById("modalProductCurrentPrice");
  if (currentPriceEl && !prod.originalPrice) {
    currentPriceEl.textContent = formatMoney(unitPrice + addonsTotal);
  }
}

/**
 * Retorna o total em R$ de todos os acréscimos selecionados
 */
function getAddonsTotalPrice() {
  let total = 0;
  for (const [addonId, qty] of Object.entries(AppState.selectedAddons)) {
    if (qty <= 0) continue;
    const addonObj = BURGER_ADDONS.find(a => a.id === addonId);
    if (addonObj) total += addonObj.price * qty;
  }
  return total;
}

/**
 * Retorna a quantidade total de acréscimos (soma de todas as quantidades)
 */
function getAddonsTotalCount() {
  return Object.values(AppState.selectedAddons).reduce((sum, qty) => sum + qty, 0);
}

/**
 * Renderiza a seção de acréscimos no modal com controles de quantidade por addon
 */
function renderAddonsUI() {
  const container = document.getElementById("modalAddonsContainer");
  if (!container) return;

  const totalCount = getAddonsTotalCount();
  const atLimit = totalCount >= MAX_ADDONS_TOTAL;

  container.innerHTML = `
    <div class="addons-section-header">
      <div class="addons-header-left">
        <span class="addons-section-title">Acréscimos</span>
        <span class="addons-section-hint">Opcional</span>
      </div>
      <div class="addons-counter-badge ${atLimit ? 'at-limit' : ''}" id="addonsCounterBadge">
        <span id="addonsCounterText">${totalCount}/${MAX_ADDONS_TOTAL}</span>
      </div>
    </div>
    <div class="addons-list" id="addonsList">
      ${BURGER_ADDONS.map(addon => {
    const qty = AppState.selectedAddons[addon.id] || 0;
    const plusDisabled = atLimit && qty === 0 ? 'disabled' : (atLimit ? 'disabled' : '');
    const hasQty = qty > 0;
    return `
          <div class="addon-row ${hasQty ? 'has-qty' : ''}" data-addon-id="${addon.id}">
            <div class="addon-row-left">
              <span class="addon-chip-icon">${addon.icon || '+'}</span>
              <div class="addon-chip-info">
                <span class="addon-chip-name">${addon.name}</span>
                <span class="addon-chip-price">+ ${formatMoney(addon.price)} / un.</span>
              </div>
            </div>
            <div class="addon-row-qty">
              <button type="button" class="addon-qty-btn minus" data-addon-id="${addon.id}" ${qty === 0 ? 'disabled' : ''} aria-label="Remover ${addon.name}">−</button>
              <span class="addon-qty-num">${qty}</span>
              <button type="button" class="addon-qty-btn plus" data-addon-id="${addon.id}" ${atLimit ? 'disabled' : ''} aria-label="Adicionar ${addon.name}">+</button>
            </div>
          </div>
        `;
  }).join('')}
    </div>
    ${atLimit ? `<div class="addons-limit-notice">Limite de ${MAX_ADDONS_TOTAL} acréscimos atingido.</div>` : ''}
  `;

  // Listeners dos botões de quantidade
  container.querySelectorAll(".addon-qty-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const addonId = btn.dataset.addonId;
      const isMinus = btn.classList.contains("minus");

      const currentQty = AppState.selectedAddons[addonId] || 0;
      const currentTotal = getAddonsTotalCount();

      if (isMinus) {
        if (currentQty > 0) {
          AppState.selectedAddons[addonId] = currentQty - 1;
          if (AppState.selectedAddons[addonId] === 0) {
            delete AppState.selectedAddons[addonId];
          }
        }
      } else {
        if (currentTotal < MAX_ADDONS_TOTAL) {
          AppState.selectedAddons[addonId] = currentQty + 1;
        } else {
          showToast(`Máximo de ${MAX_ADDONS_TOTAL} acréscimos por burger atingido.`, "info");
          return;
        }
      }

      updateModalPrice();
      renderAddonsUI(); // Rerenderiza para refletir novos estados de limite
    });
  });
}

// ==============================================================================
// GESTÃO DO CARRINHO DE COMPRAS
// ==============================================================================

/**
 * Adiciona rapidamente 1 unidade a partir do botão do card
 */
window.quickAddToCart = function (productId) {
  const prod = PRODUCTS.find(p => p.id === productId);
  if (!prod) return;

  // Se tiver opções, abre o modal para o cliente escolher
  if (prod.hasOptions) {
    openProductModal(productId);
    return;
  }

  addToCart(prod, 1, "");
  showToast(`Adicionado: ${prod.name}`);
};

/**
 * Atualiza quantidade diretamente a partir dos botões do card
 */
window.updateItemQuantityById = function (productId, delta) {
  const itemIndex = AppState.cart.findIndex(i => i.id === productId);
  if (itemIndex > -1) {
    const newQty = AppState.cart[itemIndex].quantity + delta;
    if (newQty <= 0) {
      const removedName = AppState.cart[itemIndex].name;
      AppState.cart.splice(itemIndex, 1);
      showToast(`Removido: ${removedName}`, "info");
    } else {
      AppState.cart[itemIndex].quantity = newQty;
    }
    saveCart();
    updateCartUI();
    refreshCardButtons(productId);
  } else if (delta > 0) {
    quickAddToCart(productId);
  }
};

/**
 * Adiciona ao carrinho produto simples
 */
function addToCart(product, quantity = 1, notes = "") {
  const existingIndex = AppState.cart.findIndex(i => i.id === product.id && i.notes === notes);

  if (existingIndex > -1) {
    AppState.cart[existingIndex].quantity += quantity;
  } else {
    AppState.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image,
      notes: notes.trim()
    });
  }

  saveCart();
  updateCartUI();
  refreshCardButtons(product.id);
}

/**
 * Adiciona ao carrinho produto customizado (Bebidas com Versão e Tamanho)
 */
function addCustomItemToCart(itemObj) {
  const existingIndex = AppState.cart.findIndex(i => i.id === itemObj.id && i.notes === itemObj.notes);

  if (existingIndex > -1) {
    AppState.cart[existingIndex].quantity += itemObj.quantity;
  } else {
    AppState.cart.push({
      id: itemObj.id,
      originalId: itemObj.originalId,
      name: itemObj.name,
      price: itemObj.price,
      quantity: itemObj.quantity,
      image: itemObj.image,
      notes: itemObj.notes.trim(),
      optionsSummary: itemObj.optionsSummary || []
    });
  }

  saveCart();
  updateCartUI();
}

/**
 * Atualiza quantidade de um item na lista do Drawer
 */
window.updateDrawerItemQuantity = function (index, delta) {
  if (!AppState.cart[index]) return;

  const newQty = AppState.cart[index].quantity + delta;
  const originalId = AppState.cart[index].originalId || AppState.cart[index].id;

  if (newQty <= 0) {
    AppState.cart.splice(index, 1);
  } else {
    AppState.cart[index].quantity = newQty;
  }

  saveCart();
  updateCartUI();
  refreshCardButtons(originalId);
};

/**
 * Remove item específico do carrinho
 */
window.removeCartItem = function (index) {
  if (!AppState.cart[index]) return;
  const originalId = AppState.cart[index].originalId || AppState.cart[index].id;
  AppState.cart.splice(index, 1);
  saveCart();
  updateCartUI();
  refreshCardButtons(originalId);
  showToast("Item removido da sacola", "info");
};

/**
 * Atualiza visual do card de um produto específico
 */
function refreshCardButtons(productId) {
  const prod = PRODUCTS.find(p => p.id === productId);
  if (!prod) return;

  const container = document.getElementById(`cardAction-${productId}`);
  if (!container) return;

  const item = AppState.cart.find(i => i.id === productId);
  const qty = item ? item.quantity : 0;
  container.innerHTML = renderCardAction(prod, qty);
}

/**
 * Atualiza a interface da barra flutuante e do drawer
 */
function updateCartUI() {
  const floatingBar = document.getElementById("floatingCartBar");
  const floatingCount = document.getElementById("floatingCartCount");
  const floatingLabel = document.getElementById("floatingCartItemsLabel");
  const floatingTotal = document.getElementById("floatingCartTotal");

  const drawerCount = document.getElementById("cartModalItemCount");
  const drawerList = document.getElementById("cartItemsList");
  const subtotalEl = document.getElementById("modalSubtotal");
  const deliveryFeeEl = document.getElementById("modalDeliveryFee");
  const discountLine = document.getElementById("discountLine");
  const discountEl = document.getElementById("modalDiscount");
  const grandTotalEl = document.getElementById("modalGrandTotal");
  const minOrderWarning = document.getElementById("minOrderWarning");

  // Cálculos
  const totalItems = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Tipo de entrega
  const isDelivery = document.getElementById("orderTypeDelivery").checked;
  const currentFee = (AppState.deliveryFee != null) ? AppState.deliveryFee : RESTAURANT_CONFIG.deliveryFee;
  const deliveryFee = isDelivery && totalItems > 0 ? currentFee : 0;

  // Desconto por cupom
  let discountAmount = 0;
  if (AppState.appliedCoupon) {
    discountAmount = (subtotal * AppState.appliedCoupon.discountPercent) / 100;
    discountLine.style.display = "flex";
    discountEl.textContent = `- ${formatMoney(discountAmount)}`;
  } else {
    discountLine.style.display = "none";
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  // Barra Flutuante
  if (totalItems > 0) {
    floatingBar.style.display = "block";
    floatingCount.textContent = totalItems;
    floatingLabel.textContent = `${totalItems} ${totalItems === 1 ? 'item adicionado' : 'itens adicionados'}`;
    floatingTotal.textContent = formatMoney(grandTotal);
  } else {
    floatingBar.style.display = "none";
  }

  // Drawer
  drawerCount.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`;
  subtotalEl.textContent = formatMoney(subtotal);

  if (isDelivery) {
    if (AppState.deliveryDistanceKm != null) {
      deliveryFeeEl.innerHTML = `${formatMoney(deliveryFee)} <small style="font-size: 0.74rem; color: var(--color-accent); font-weight: 700;">(${AppState.deliveryDistanceKm} km)</small>`;
    } else {
      deliveryFeeEl.innerHTML = `${formatMoney(deliveryFee)} <small style="font-size: 0.7rem; color: var(--text-dim); font-weight: normal;">(A calcular)</small>`;
    }
  } else {
    deliveryFeeEl.textContent = "Grátis (Retirada)";
  }

  // Atualiza etiqueta no seletor de rádio
  const deliveryFeeLabel = document.getElementById("deliveryFeeLabel");
  if (deliveryFeeLabel) {
    if (AppState.deliveryDistanceKm != null) {
      deliveryFeeLabel.textContent = `Taxa: ${formatMoney(currentFee)} (${AppState.deliveryDistanceKm} km)`;
    } else {
      deliveryFeeLabel.textContent = `A partir de ${formatMoney(RESTAURANT_CONFIG.deliveryFee)}`;
    }
  }

  grandTotalEl.textContent = formatMoney(grandTotal);

  // Alerta de Pedido Mínimo
  if (subtotal > 0 && subtotal < RESTAURANT_CONFIG.minOrder) {
    minOrderWarning.style.display = "block";
  } else {
    minOrderWarning.style.display = "none";
  }

  // Renderiza a lista de itens no drawer
  if (totalItems === 0) {
    drawerList.innerHTML = `
      <div style="text-align: center; padding: 28px 10px; color: var(--text-dim);">
        <p style="font-weight: 700; color: var(--text-muted); font-size: 1.05rem; margin-bottom: 4px;">Sua sacola está vazia.</p>
        <small>Adicione burgers artesanais, smash, combos e bebidas para continuar!</small>
      </div>
    `;
  } else {
    drawerList.innerHTML = AppState.cart.map((item, index) => {
      const itemSubtotal = item.price * item.quantity;
      const notesHtml = item.notes ? `<div class="cart-item-notes">Obs: ${item.notes}</div>` : "";

      // Badges de opções customizadas (combos com optionGroups)
      let optionsBadgesHtml = "";
      if (item.optionsSummary && item.optionsSummary.length > 0) {
        optionsBadgesHtml = `<div class="cart-item-options-list">${item.optionsSummary.map(s => `<span class="cart-item-option-badge">${s}</span>`).join("")}</div>`;
      }

      return `
        <div class="cart-item-row">
          <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
          <div class="cart-item-info">
            <h4 class="cart-item-title">${item.name}</h4>
            ${optionsBadgesHtml}
            ${notesHtml}
            <span class="cart-item-price-each">${item.quantity}x ${formatMoney(item.price)}</span>
          </div>
          <div class="cart-item-right">
            <strong class="cart-item-subtotal">${formatMoney(itemSubtotal)}</strong>
            <div class="quantity-controller">
              <button type="button" class="qty-btn" onclick="updateDrawerItemQuantity(${index}, -1)" aria-label="Diminuir">-</button>
              <span class="qty-display">${item.quantity}</span>
              <button type="button" class="qty-btn" onclick="updateDrawerItemQuantity(${index}, 1)" aria-label="Aumentar">+</button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }
}

// ==============================================================================
// PERSISTÊNCIA NO LOCALSTORAGE
// ==============================================================================
function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(AppState.cart));
  } catch (e) {
    console.error("Erro ao salvar carrinho no localStorage", e);
  }
}

function loadSavedCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    if (raw) {
      AppState.cart = JSON.parse(raw);
    }
  } catch (e) {
    AppState.cart = [];
  }
}

function saveCustomerData() {
  const cepInput = document.getElementById("customerCep");
  const data = {
    name: document.getElementById("customerName").value.trim(),
    phone: document.getElementById("customerPhone").value.trim(),
    cep: cepInput ? cepInput.value.trim() : "",
    street: document.getElementById("customerStreet").value.trim(),
    number: document.getElementById("customerNumber").value.trim(),
    neighborhood: document.getElementById("customerNeighborhood").value.trim(),
    complement: document.getElementById("customerComplement").value.trim(),
    reference: document.getElementById("customerReference").value.trim()
  };

  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(data));
  } catch (e) {
    console.error("Erro ao salvar dados do cliente", e);
  }
}

function loadSavedCustomerData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMER);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.name) document.getElementById("customerName").value = data.name;
      if (data.phone) document.getElementById("customerPhone").value = data.phone;
      const cepInput = document.getElementById("customerCep");
      if (cepInput && data.cep) cepInput.value = data.cep;
      if (data.street) document.getElementById("customerStreet").value = data.street;
      if (data.number) document.getElementById("customerNumber").value = data.number;
      if (data.neighborhood) document.getElementById("customerNeighborhood").value = data.neighborhood;
      if (data.complement) document.getElementById("customerComplement").value = data.complement;
      if (data.reference) document.getElementById("customerReference").value = data.reference;

      // Se já temos endereço completo gravado, calcula a distância em background
      if (data.street && data.neighborhood) {
        setTimeout(() => {
          calculateDeliveryFeeFromForm(false);
        }, 600);
      }
    }
  } catch (e) {
    console.error("Erro ao carregar dados salvos do cliente", e);
  }
}

// ==============================================================================
// MOTOR DE GEOLOCALIZAÇÃO E CÁLCULO DE TAXA POR DISTÂNCIA (100% NO GITHUB PAGES)
// ==============================================================================

/**
 * Fórmula de Haversine: calcula a distância em linha reta entre duas coordenadas (em km)
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Geocodifica um endereço usando OpenStreetMap / Nominatim (100% gratuito)
 */
async function geocodeAddress(street, number, neighborhood, city = "Belo Horizonte", state = "MG") {
  const cleanStreet = street.replace(/^(rua|avenida|av\.|alameda|r\.)\s+/i, "").trim();
  const queries = [];

  if (number) {
    queries.push(`${cleanStreet}, ${number}, ${neighborhood}, ${city}, ${state}, Brasil`);
    queries.push(`${street}, ${number}, ${neighborhood}, ${city}, Brasil`);
  }
  queries.push(`${cleanStreet}, ${neighborhood}, ${city}, ${state}, Brasil`);
  queries.push(`${street}, ${neighborhood}, ${city}, Brasil`);
  queries.push(`${neighborhood}, ${city}, ${state}, Brasil`);

  for (const q of queries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=pt-BR&email=cailuburger@gmail.com&q=${encodeURIComponent(q)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) continue;
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name
        };
      }
    } catch (e) {
      // Tenta a próxima consulta
    }
  }
  return null;
}

/**
 * Calcula a distância de condução pelas vias de BH usando OSRM com fallback seguro
 */
async function getDrivingDistanceKm(originCoords, destCoords) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}?overview=false`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.routes && data.routes.length > 0) {
        const distanceKm = data.routes[0].distance / 1000;
        return distanceKm;
      }
    }
  } catch (e) {
    console.warn("OSRM em fallback local de trânsito urbano:", e);
  }

  // Fallback: Haversine com fator de 1.30 para curvas das vias urbanas em BH
  const directKm = haversineDistance(originCoords.lat, originCoords.lng, destCoords.lat, destCoords.lng);
  return directKm * 1.30;
}

/**
 * Renderiza o card visual com o resultado da distância e taxa
 */
function renderDeliveryCalcCard(state, data = {}) {
  const card = document.getElementById("deliveryCalcCard");
  if (!card) return;

  if (state === "idle") {
    card.innerHTML = `
      <div class="calc-card-idle">
        <span class="calc-icon">📍</span>
        <div class="calc-text">
          <strong>Taxa calculada por distância real</strong>
          <small>Informe sua rua, número e bairro para consultar o valor exato até a Cailu Burger (Salgado Filho).</small>
        </div>
      </div>
    `;
  } else if (state === "loading") {
    card.innerHTML = `
      <div class="calc-card-loading">
        <div class="calc-spinner"></div>
        <div class="calc-card-loading-text">
          <strong>Calculando trajeto até sua residência...</strong>
          <small>Consultando rotas e distância da Cailu Burger (Rua Domingos Rocha, 765)</small>
        </div>
      </div>
    `;
  } else if (state === "success") {
    card.innerHTML = `
      <div class="calc-card-success">
        <div class="calc-success-header">
          <span class="calc-success-title">✓ Trajeto verificado com sucesso</span>
          <span class="calc-origin-tag">Salgado Filho → ${data.neighborhood || 'Seu Bairro'}</span>
        </div>
        <div class="calc-grid-stats">
          <div class="calc-stat-pill">
            <span class="calc-stat-label">Distância</span>
            <strong class="calc-stat-value">${data.distanceKm} km</strong>
          </div>
          <div class="calc-stat-pill">
            <span class="calc-stat-label">Previsão</span>
            <strong class="calc-stat-value">${data.time}</strong>
          </div>
          <div class="calc-stat-pill highlight">
            <span class="calc-stat-label">Taxa</span>
            <strong class="calc-stat-value">${formatMoney(data.fee)}</strong>
          </div>
        </div>
        <div class="calc-route-note">
          Rota calculada pelas vias de BH. Taxa e tempo atualizados no seu pedido.
        </div>
      </div>
    `;
  } else if (state === "warning") {
    card.innerHTML = `
      <div class="calc-card-warning">
        <div class="calc-warning-text">
          <strong>⚠️ Distância de ${data.distanceKm} km (Acima do raio de 10 km)</strong>
          <p>Seu endereço fica a mais de 10 km da loja. A taxa base é de ${formatMoney(data.fee)} e a entrega poderá ser combinada e confirmada diretamente com nossa equipe no WhatsApp.</p>
        </div>
      </div>
    `;
  } else if (state === "error") {
    card.innerHTML = `
      <div class="calc-card-error">
        <div class="calc-error-text">
          <strong>⚠️ Não localizamos o endereço exato</strong>
          <small>${data.message || 'Confira o nome da rua, número e bairro ou utilize o botão "Usar meu GPS".'}</small>
        </div>
      </div>
    `;
  }
}

/**
 * Executa a verificação e cálculo de taxa pelo formulário
 */
async function calculateDeliveryFeeFromForm(notifyOnSuccess = false) {
  const streetInput = document.getElementById("customerStreet");
  const numberInput = document.getElementById("customerNumber");
  const neighborhoodInput = document.getElementById("customerNeighborhood");
  const btnCalc = document.getElementById("btnCalculateDistance");

  const street = streetInput ? streetInput.value.trim() : "";
  const number = numberInput ? numberInput.value.trim() : "";
  const neighborhood = neighborhoodInput ? neighborhoodInput.value.trim() : "";

  if (!street || !neighborhood) {
    if (notifyOnSuccess) {
      showToast("Informe pelo menos a Rua e o Bairro para calcular o frete.", "error");
      if (!street && streetInput) streetInput.focus();
      else if (!neighborhood && neighborhoodInput) neighborhoodInput.focus();
    }
    return;
  }

  AppState.isCalculatingDelivery = true;
  if (btnCalc) btnCalc.disabled = true;
  renderDeliveryCalcCard("loading");

  try {
    const coords = await geocodeAddress(street, number, neighborhood);

    if (!coords) {
      renderDeliveryCalcCard("error", {
        message: "Não encontramos as vias deste endereço em BH. Verifique se o nome da rua ou bairro possuem erros de digitação."
      });
      if (notifyOnSuccess) {
        showToast("Endereço não localizado no mapa. Confira a digitação.", "error");
      }
      return;
    }

    AppState.deliveryCoords = coords;
    const distanceKm = await getDrivingDistanceKm(RESTAURANT_CONFIG.coordinates, coords);
    const tier = calculateDeliveryTier(distanceKm);

    AppState.deliveryDistanceKm = tier.distanceKm;
    AppState.deliveryFee = tier.fee;
    AppState.deliveryTime = tier.time;
    AppState.deliveryExceedsMax = tier.exceedsMaxRadius;

    if (tier.exceedsMaxRadius) {
      renderDeliveryCalcCard("warning", {
        distanceKm: tier.distanceKm,
        fee: tier.fee,
        time: tier.time
      });
      if (notifyOnSuccess) {
        showToast(`Distância de ${tier.distanceKm} km excede 10 km. Taxa base: ${formatMoney(tier.fee)}.`, "info");
      }
    } else {
      renderDeliveryCalcCard("success", {
        distanceKm: tier.distanceKm,
        fee: tier.fee,
        time: tier.time,
        neighborhood: neighborhood
      });
      if (notifyOnSuccess) {
        showToast(`Distância: ${tier.distanceKm} km | Taxa: ${formatMoney(tier.fee)} (${tier.time})`);
      }
    }

    updateCartUI();
  } catch (err) {
    console.error("Erro no cálculo de entrega:", err);
    renderDeliveryCalcCard("error", {
      message: "Falha na conexão ao consultar o mapa. Tente novamente em instantes."
    });
  } finally {
    AppState.isCalculatingDelivery = false;
    if (btnCalc) btnCalc.disabled = false;
  }
}

/**
 * Busca de endereço por CEP através da API pública do ViaCEP
 */
async function searchCep() {
  const cepInput = document.getElementById("customerCep");
  if (!cepInput) return;

  const rawCep = cepInput.value.replace(/\D/g, "");
  if (rawCep.length !== 8) {
    showToast("Digite um CEP válido com 8 dígitos.", "error");
    cepInput.focus();
    return;
  }

  showToast("Buscando endereço pelo CEP...", "info");

  try {
    const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
    if (!res.ok) throw new Error("Erro na requisição do CEP");
    const data = await res.json();

    if (data.erro) {
      showToast("CEP não encontrado.", "error");
      return;
    }

    const streetInput = document.getElementById("customerStreet");
    const neighborhoodInput = document.getElementById("customerNeighborhood");
    const numberInput = document.getElementById("customerNumber");

    if (streetInput && data.logradouro) streetInput.value = data.logradouro;
    if (neighborhoodInput && data.bairro) neighborhoodInput.value = data.bairro;

    showToast("Endereço preenchido com sucesso!");

    if (numberInput && !numberInput.value.trim()) {
      numberInput.focus();
    } else {
      calculateDeliveryFeeFromForm(false);
    }
  } catch (e) {
    console.error("Erro ao buscar CEP:", e);
    showToast("Não foi possível buscar o CEP automaticamente.", "error");
  }
}

/**
 * Obtém a localização atual pelo GPS do celular do cliente
 */
/**
 * Converte coordenadas (lat/lng) no endereço físico (Rua, Bairro, CEP, Número)
 * com fallback inteligente para garantir funcionamento liso no navegador
 */
async function reverseGeocodeCoords(lat, lng) {
  const result = {
    street: "",
    neighborhood: "",
    cep: "",
    number: "",
    city: "Belo Horizonte"
  };

  // 1. Consulta Nominatim com GET puro (sem cabeçalhos customizados para evitar 403 de CORS preflight)
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=pt-BR&email=cailuburger@gmail.com`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      result.street = addr.road || addr.pedestrian || addr.street || addr.footway || addr.path || addr.residential || "";
      if (!result.street && data.name) result.street = data.name;

      result.neighborhood = addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter || addr.residential || "";
      result.number = addr.house_number || "";
      result.cep = addr.postcode || "";
      if (addr.city) result.city = addr.city;

      if (result.street || result.neighborhood) {
        return result;
      }
    }
  } catch (e) {
    console.warn("Nominatim reverse falhou, tentando fallback:", e);
  }

  // 2. Fallback: BigDataCloud (Client-side API gratuita para navegadores)
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=pt`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (!result.neighborhood && data.localityInfo && data.localityInfo.administrative) {
        const admin = data.localityInfo.administrative;
        const dist = admin.find(a => a.adminLevel === 9 || a.order === 11 || a.adminLevel === 10);
        if (dist) result.neighborhood = dist.name;
      }
      if (!result.neighborhood && data.locality) {
        result.neighborhood = data.locality;
      }
      if (data.postcode && !result.cep) {
        result.cep = data.postcode;
      }
    }
  } catch (e) {
    console.warn("Fallback BigDataCloud falhou:", e);
  }

  return result;
}

/**
 * Obtém a localização atual pelo GPS do celular do cliente e preenche o modal
 */
function handleGpsLocation() {
  if (!navigator.geolocation) {
    showToast("Geolocalização não suportada pelo seu navegador.", "error");
    return;
  }

  const btnGps = document.getElementById("btnUseGpsLocation");
  if (btnGps) {
    btnGps.classList.add("loading");
    btnGps.innerHTML = `
      <svg class="calc-spinner" style="width:12px;height:12px;border-width:1.5px;display:inline-block;" viewBox="0 0 24 24"></svg>
      Obtendo GPS...
    `;
  }

  showToast("Obtendo localização pelo GPS...", "info");
  renderDeliveryCalcCard("loading");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const userCoords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      AppState.deliveryCoords = userCoords;

      try {
        // 1. Obter endereço físico reverso a partir das coordenadas do GPS
        const addressData = await reverseGeocodeCoords(userCoords.lat, userCoords.lng);

        const streetInput = document.getElementById("customerStreet");
        const neighborhoodInput = document.getElementById("customerNeighborhood");
        const numberInput = document.getElementById("customerNumber");
        const cepInput = document.getElementById("customerCep");

        // PREENCHIMENTO DIRETO E VISÍVEL DOS CAMPOS NO MODAL
        if (streetInput) {
          if (addressData.street) {
            streetInput.value = addressData.street;
          } else if (!streetInput.value.trim()) {
            streetInput.value = "Localização obtida via GPS";
          }
          streetInput.classList.remove("input-gps-highlight");
          void streetInput.offsetWidth; // Força repaint
          streetInput.classList.add("input-gps-highlight");
        }

        if (neighborhoodInput) {
          if (addressData.neighborhood) {
            neighborhoodInput.value = addressData.neighborhood;
          } else if (!neighborhoodInput.value.trim()) {
            neighborhoodInput.value = "Belo Horizonte";
          }
          neighborhoodInput.classList.remove("input-gps-highlight");
          void neighborhoodInput.offsetWidth;
          neighborhoodInput.classList.add("input-gps-highlight");
        }

        if (cepInput && addressData.cep) {
          cepInput.value = addressData.cep;
          cepInput.classList.remove("input-gps-highlight");
          void cepInput.offsetWidth;
          cepInput.classList.add("input-gps-highlight");
        }

        if (numberInput) {
          if (addressData.number) {
            numberInput.value = addressData.number;
          } else {
            // Se o GPS não souber o número exato da residência, foca no campo número
            setTimeout(() => {
              numberInput.focus();
            }, 300);
          }
        }

        // Salvar os dados atualizados no LocalStorage
        saveCustomerData();

        // 2. Calcular rota de condução pelas vias de trânsito
        const distanceKm = await getDrivingDistanceKm(RESTAURANT_CONFIG.coordinates, userCoords);
        const tier = calculateDeliveryTier(distanceKm);

        AppState.deliveryDistanceKm = tier.distanceKm;
        AppState.deliveryFee = tier.fee;
        AppState.deliveryTime = tier.time;
        AppState.deliveryExceedsMax = tier.exceedsMaxRadius;

        const currentNeighborhood = (neighborhoodInput && neighborhoodInput.value.trim()) || addressData.neighborhood || "Sua Localização";

        if (tier.exceedsMaxRadius) {
          renderDeliveryCalcCard("warning", {
            distanceKm: tier.distanceKm,
            fee: tier.fee,
            time: tier.time
          });
        } else {
          renderDeliveryCalcCard("success", {
            distanceKm: tier.distanceKm,
            fee: tier.fee,
            time: tier.time,
            neighborhood: currentNeighborhood
          });
        }

        updateCartUI();

        if (numberInput && !numberInput.value.trim()) {
          showToast(`GPS detectado! Rua preenchida. Informe o número da residência.`);
        } else {
          showToast(`Endereço e taxa calculados pelo GPS: ${formatMoney(tier.fee)} (${tier.distanceKm} km)`);
        }
      } catch (e) {
        console.error("Erro ao processar GPS:", e);
        renderDeliveryCalcCard("error", { message: "Erro ao traçar rota a partir do GPS." });
      } finally {
        if (btnGps) {
          btnGps.classList.remove("loading");
          btnGps.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
            Usar meu GPS
          `;
        }
      }
    },
    (err) => {
      console.warn("Permissão de GPS negada ou indisponível:", err);
      showToast("Permissão de GPS não concedida. Preencha rua e bairro.", "info");
      renderDeliveryCalcCard("idle");
      if (btnGps) {
        btnGps.classList.remove("loading");
        btnGps.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          Usar meu GPS
        `;
      }
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
  );
}

// ==============================================================================
// FINALIZAÇÃO DE PEDIDO & INTEGRAÇÃO COM WHATSAPP (100% SEM EMOJIS NA URL)
// ==============================================================================
function finishOrderWhatsApp() {
  // 1. Validar se há itens na sacola
  if (!AppState.cart || AppState.cart.length === 0) {
    showToast("Adicione pelo menos um item à sacola para pedir!", "error");
    return;
  }

  // 2. Coletar dados dos campos
  const nameInput = document.getElementById("customerName");
  const phoneInput = document.getElementById("customerPhone");
  const streetInput = document.getElementById("customerStreet");
  const numberInput = document.getElementById("customerNumber");
  const neighborhoodInput = document.getElementById("customerNeighborhood");
  const complementInput = document.getElementById("customerComplement");
  const referenceInput = document.getElementById("customerReference");
  const notesInput = document.getElementById("orderNotes");

  const isDelivery = document.getElementById("orderTypeDelivery").checked;
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  const changeInput = document.getElementById("customerChange");

  // Cálculos prévios
  const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Validação de Pedido Mínimo da Hambúrgueria (R$ 20,00)
  if (subtotal < (RESTAURANT_CONFIG.minOrder || 0)) {
    showToast(`O valor mínimo para pedidos é de ${formatMoney(RESTAURANT_CONFIG.minOrder)}. Adicione mais itens!`, "error");
    return;
  }

  // Array para coletar todos os campos que falharem na validação
  const invalidFields = [];

  // Validação do Nome Completo (Obrigatório - no mínimo 2 nomes / nome e sobrenome)
  const nameVal = nameInput ? nameInput.value.trim() : "";
  const nameParts = nameVal.split(/\s+/).filter(part => part.length >= 2);
  if (!nameVal || nameParts.length < 2 || nameVal.length < 5) {
    invalidFields.push({ el: nameInput, msg: "Por favor, informe seu nome e sobrenome (mínimo 2 nomes)." });
  } else if (nameInput) {
    nameInput.classList.remove("field-error");
  }

  // Validação do WhatsApp com DDD (Obrigatório - mínimo 10 dígitos numéricos)
  const cleanPhone = phoneInput ? phoneInput.value.replace(/\D/g, "") : "";
  if (!cleanPhone || cleanPhone.length < 10) {
    invalidFields.push({ el: phoneInput, msg: "Informe seu WhatsApp com DDD completo (ex: 31 99999-9999)." });
  } else if (phoneInput) {
    phoneInput.classList.remove("field-error");
  }

  // Se for Entrega (Delivery), validar campos de endereço obrigatórios
  if (isDelivery) {
    if (!streetInput || !streetInput.value.trim()) {
      invalidFields.push({ el: streetInput, msg: "Informe a rua ou avenida para entrega." });
    } else {
      streetInput.classList.remove("field-error");
    }

    if (!numberInput || !numberInput.value.trim()) {
      invalidFields.push({ el: numberInput, msg: "Informe o número do endereço de entrega." });
    } else {
      numberInput.classList.remove("field-error");
    }

    if (!neighborhoodInput || !neighborhoodInput.value.trim()) {
      invalidFields.push({ el: neighborhoodInput, msg: "Informe o seu bairro para entrega." });
    } else {
      neighborhoodInput.classList.remove("field-error");
    }

    // Bloquear se o raio máximo tiver sido excedido (> 10 km)
    if (AppState.deliveryExceedsMax) {
      showToast("Endereço fora do raio de entrega de 10 km da Cailu Burger. Escolha 'Retirada no Balcão'.", "error");
      return;
    }
  }

  // Calcular valor final para validação de troco
  const activeFee = (AppState.deliveryFee != null) ? AppState.deliveryFee : RESTAURANT_CONFIG.deliveryFee;
  const deliveryFee = isDelivery ? activeFee : 0;
  let discountAmount = 0;
  if (AppState.appliedCoupon) {
    discountAmount = (subtotal * AppState.appliedCoupon.discountPercent) / 100;
  }
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  // Se a forma for Dinheiro e foi preenchido valor de troco, validar se é suficiente
  if (paymentMethod === "Dinheiro" && changeInput && changeInput.value.trim()) {
    const changeVal = parseFloat(changeInput.value);
    if (isNaN(changeVal) || changeVal < grandTotal) {
      invalidFields.push({ el: changeInput, msg: `O valor para troco deve ser maior que o total do pedido (${formatMoney(grandTotal)}).` });
    } else {
      changeInput.classList.remove("field-error");
    }
  }

  // Se houver qualquer campo obrigatório pendente: BLOQUEIA TOTALMENTE O ENVIO
  if (invalidFields.length > 0) {
    // 1. Destaca todos os campos faltantes com borda vermelha e tremor
    invalidFields.forEach(item => {
      if (item.el) item.el.classList.add("field-error");
    });

    // 2. Rola suavemente a sacola até o primeiro campo obrigatório pendente e dá foco
    if (invalidFields[0].el) {
      invalidFields[0].el.scrollIntoView({ behavior: "smooth", block: "center" });
      invalidFields[0].el.focus();
    }

    // 3. Notifica o cliente do erro
    showToast(invalidFields[0].msg, "error");
    return; // IMPEDE A MENSAGEM PARA O WHATSAPP
  }

  // Salvar no LocalStorage para visitas futuras
  saveCustomerData();

  // 3. Montagem da Mensagem Textual Limpa (SEM NENHUM EMOJI)
  const separator = "----------------------------------------";
  let message = `*NOVO PEDIDO - ${RESTAURANT_CONFIG.shortName.toUpperCase()}*\n`;
  message += `${separator}\n\n`;

  message += `*DADOS DO CLIENTE:*\n`;
  message += `- Nome: ${stripEmojis(nameInput.value)}\n`;
  message += `- Telefone: ${stripEmojis(phoneInput.value)}\n\n`;

  message += `*TIPO DE PEDIDO:* ${isDelivery ? "ENTREGA (DELIVERY)" : "RETIRADA NO BALCAO"}\n`;

  if (isDelivery) {
    message += `*ENDERECO DE ENTREGA:*\n`;
    message += `- Rua: ${stripEmojis(streetInput.value)}, No ${stripEmojis(numberInput.value)}\n`;
    message += `- Bairro: ${stripEmojis(neighborhoodInput.value)}\n`;
    if (complementInput.value.trim()) {
      message += `- Complemento: ${stripEmojis(complementInput.value)}\n`;
    }
    if (referenceInput.value.trim()) {
      message += `- Referencia: ${stripEmojis(referenceInput.value)}\n`;
    }
    if (AppState.deliveryTime || RESTAURANT_CONFIG.averageTime) {
      message += `- Previsao: ${AppState.deliveryTime || RESTAURANT_CONFIG.averageTime}\n`;
    }
    const destClean = `${stripEmojis(streetInput.value)}, ${stripEmojis(numberInput.value)}, ${stripEmojis(neighborhoodInput.value)}, Belo Horizonte - MG`;
    message += `- Rota Maps: https://www.google.com/maps/dir/?api=1&origin=-19.9402136,-43.9809866&destination=${encodeURIComponent(destClean)}\n`;
    message += `\n`;
  } else {
    message += `*LOCAL DE RETIRADA:* ${RESTAURANT_CONFIG.address}\n\n`;
  }

  message += `*ITENS DO PEDIDO:*\n`;
  AppState.cart.forEach((item, idx) => {
    const itemTotal = item.price * item.quantity;
    message += `${idx + 1}. ${item.quantity}x ${stripEmojis(item.name)} - ${formatMoney(itemTotal)}\n`;
    if (item.optionsSummary && item.optionsSummary.length > 0) {
      item.optionsSummary.forEach(summary => {
        message += `   - ${stripEmojis(summary)}\n`;
      });
    }
    if (item.notes) {
      message += `   Obs: ${stripEmojis(item.notes)}\n`;
    }
  });
  message += `\n`;

  message += `*TOTAL DO PEDIDO:*\n`;
  message += `- Subtotal dos itens: ${formatMoney(subtotal)}\n`;
  if (AppState.appliedCoupon) {
    message += `- Desconto Cupom (${AppState.appliedCoupon.code}): - ${formatMoney(discountAmount)}\n`;
  }
  if (isDelivery) {
    message += `- Taxa de entrega: ${formatMoney(deliveryFee)}\n`;
  } else {
    message += `- Taxa de entrega: Gratis (Retirada)\n`;
  }
  message += `- *VALOR TOTAL: ${formatMoney(grandTotal)}*\n\n`;

  message += `*FORMA DE PAGAMENTO:*\n`;
  message += `- ${paymentMethod}\n`;
  if (paymentMethod === "Dinheiro" && changeInput.value.trim()) {
    message += `- Precisa de troco para: ${formatMoney(changeInput.value)}\n`;
  }
  if (paymentMethod === "PIX") {
    const pixRawNumber = (RESTAURANT_CONFIG.pixKey || "").replace(/\D/g, "");
    message += `- Chave PIX: ${pixRawNumber || RESTAURANT_CONFIG.pixKey}\n`;
  }

  if (notesInput.value.trim()) {
    message += `\n*OBSERVACOES GERAIS:*\n`;
    message += `${stripEmojis(notesInput.value)}\n`;
  }

  message += `\n${separator}\n`;
  message += `Pedido enviado via Cardapio Digital Web`;

  // 4. Criação do Link e Redirecionamento
  const encodedText = encodeURIComponent(message);
  const waUrl = `https://wa.me/${RESTAURANT_CONFIG.whatsapp}?text=${encodedText}`;

  // Abre o WhatsApp
  window.open(waUrl, "_blank");

  showToast("Pedido gerado! Abrindo seu WhatsApp...", "success");
}

// ==============================================================================
// CONFIGURAÇÃO DE EVENT LISTENERS GERAIS
// ==============================================================================
function setupEventListeners() {
  // 1. Busca em tempo real com limpeza
  const searchInput = document.getElementById("searchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");

  searchInput.addEventListener("input", (e) => {
    AppState.searchQuery = e.target.value;
    clearSearchBtn.style.display = e.target.value.length > 0 ? "flex" : "none";
    renderProducts();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    AppState.searchQuery = "";
    clearSearchBtn.style.display = "none";
    renderProducts();
    searchInput.focus();
  });

  const resetBtn = document.getElementById("resetSearchFilter");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      searchInput.value = "";
      AppState.searchQuery = "";
      clearSearchBtn.style.display = "none";
      AppState.activeCategory = "all";
      document.querySelectorAll(".category-pill-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.category === "all");
      });
      renderProducts();
    });
  }

  const emptyResetBtn = document.getElementById("btnResetEmptySearch");
  if (emptyResetBtn) {
    emptyResetBtn.addEventListener("click", () => {
      searchInput.value = "";
      AppState.searchQuery = "";
      clearSearchBtn.style.display = "none";
      renderProducts();
    });
  }

  // 2. Abertura e Fechamento da Gaveta/Modal da Sacola
  const openCartBtn = document.getElementById("openCartBtn");
  const closeCartBtn = document.getElementById("btnCloseCart");
  const cartBackdrop = document.getElementById("cartModalBackdrop");
  const addMoreBtn = document.getElementById("btnAddMoreItems");

  function openCartDrawer() {
    cartBackdrop.classList.add("active");
    cartBackdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeCartDrawer() {
    cartBackdrop.classList.remove("active");
    cartBackdrop.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openCartBtn.addEventListener("click", openCartDrawer);
  closeCartBtn.addEventListener("click", closeCartDrawer);
  addMoreBtn.addEventListener("click", closeCartDrawer);

  cartBackdrop.addEventListener("click", (e) => {
    if (e.target === cartBackdrop) closeCartDrawer();
  });

  // 3. Modal de Produto (Fechar)
  const productBackdrop = document.getElementById("productModalBackdrop");
  const closeProdBtn = document.getElementById("btnCloseProductModal");

  closeProdBtn.addEventListener("click", closeProductModal);
  productBackdrop.addEventListener("click", (e) => {
    if (e.target === productBackdrop) closeProductModal();
  });

  // Fechar com tecla ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCartDrawer();
      closeProductModal();
    }
  });

  // Controles de quantidade no Modal de Produto
  document.getElementById("modalQtyMinus").addEventListener("click", () => {
    if (AppState.modalQuantity > 1) {
      AppState.modalQuantity--;
      updateModalPrice();
    }
  });

  document.getElementById("modalQtyPlus").addEventListener("click", () => {
    AppState.modalQuantity++;
    updateModalPrice();
  });

  // Botão Adicionar à Sacola no Modal (Suporta produtos simples, bebidas com opções e combos com optionGroups)
  document.getElementById("btnModalAddToCart").addEventListener("click", () => {
    const prod = AppState.selectedProductForModal;
    if (!prod) return;

    const notes = document.getElementById("modalProductNotes").value;

    if (prod.hasOptions && prod.optionGroups && prod.optionGroups.length > 0) {
      // Combo com optionGroups estilo iFood
      const optionsSummary = [];
      let extraDelta = 0;
      let uniqueIdParts = [prod.id];

      prod.optionGroups.forEach(group => {
        const selectedOpt = AppState.selectedCustomGroupOptions[group.id];
        if (selectedOpt) {
          optionsSummary.push(`${group.title}: ${selectedOpt.name}`);
          uniqueIdParts.push(selectedOpt.id);
          if (selectedOpt.priceDelta) {
            extraDelta += selectedOpt.priceDelta;
          }
        }
      });

      const unitPrice = prod.price + extraDelta;
      const uniqueId = uniqueIdParts.join("_");

      addCustomItemToCart({
        id: uniqueId,
        originalId: prod.id,
        name: prod.name,
        price: unitPrice,
        quantity: AppState.modalQuantity,
        image: prod.image,
        notes: notes,
        optionsSummary: optionsSummary
      });

      showToast(`Adicionado: ${prod.name}`);

    } else if (prod.hasOptions) {
      // Produto com opções tradicionais (Bebidas individuais)
      const typePart = AppState.selectedOptionType ? AppState.selectedOptionType : "";
      const sizePart = AppState.selectedOptionSize ? AppState.selectedOptionSize.name : "";
      const optionsText = [typePart, sizePart].filter(Boolean).join(" - ");

      const customName = optionsText ? `${prod.name} (${optionsText})` : prod.name;
      const unitPrice = AppState.selectedOptionSize ? AppState.selectedOptionSize.price : prod.price;
      const uniqueId = `${prod.id}_${AppState.selectedOptionType || "padrao"}_${AppState.selectedOptionSize ? AppState.selectedOptionSize.id : "padrao"}`;

      addCustomItemToCart({
        id: uniqueId,
        originalId: prod.id,
        name: customName,
        price: unitPrice,
        quantity: AppState.modalQuantity,
        image: prod.image,
        notes: notes
      });

      showToast(`Adicionado: ${customName}`);
    } else {
      // Produto normal (Burgers individuais com possíveis acréscimos)
      const addonsTotal = getAddonsTotalPrice();
      const totalAddonCount = getAddonsTotalCount();

      if (totalAddonCount > 0) {
        // Tem acréscimos: cria item customizado com resumo de qtd por addon
        const addonsSummary = Object.entries(AppState.selectedAddons)
          .filter(([, qty]) => qty > 0)
          .map(([addonId, qty]) => {
            const a = BURGER_ADDONS.find(x => x.id === addonId);
            if (!a) return null;
            return `${a.icon || ''} ${qty}x ${a.name} (+${formatMoney(a.price * qty)})`.trim();
          })
          .filter(Boolean);

        const addonsIdPart = Object.entries(AppState.selectedAddons)
          .filter(([, qty]) => qty > 0)
          .map(([id, qty]) => `${id}x${qty}`)
          .join("_");

        const uniqueId = `${prod.id}_${addonsIdPart}_${notes ? 'n' + notes.length : 'n0'}`;

        addCustomItemToCart({
          id: uniqueId,
          originalId: prod.id,
          name: prod.name,
          price: prod.price + addonsTotal,
          quantity: AppState.modalQuantity,
          image: prod.image,
          notes: notes,
          optionsSummary: addonsSummary
        });
        showToast(`Adicionado: ${prod.name} + ${totalAddonCount} acréscimo(s)`);
      } else {
        addToCart(prod, AppState.modalQuantity, notes);
        showToast(`Adicionado: ${prod.name}`);
      }
    }

    closeProductModal();
  });

  // 4. Limpar Sacola
  document.getElementById("btnClearCart").addEventListener("click", () => {
    if (AppState.cart.length === 0) return;
    if (confirm("Tem certeza que deseja esvaziar sua sacola de pedidos?")) {
      AppState.cart = [];
      saveCart();
      updateCartUI();
      renderProducts();
      showToast("Sacola esvaziada!", "info");
    }
  });

  // 5. Cupom de Desconto
  const couponInput = document.getElementById("couponInput");
  const btnCoupon = document.getElementById("btnApplyCoupon");
  const couponFeedback = document.getElementById("couponFeedback");

  if (btnCoupon) {
    btnCoupon.addEventListener("click", () => {
      const code = couponInput ? couponInput.value.trim().toUpperCase() : "";
      if (code === "CAILU10" || code === "PRIMEIRACOMPRA") {
        AppState.appliedCoupon = { code: code, discountPercent: 10 };
        if (couponFeedback) {
          couponFeedback.className = "coupon-feedback success";
          couponFeedback.textContent = "✓ Cupom de 10% de desconto ativado!";
        }
        showToast("Cupom de 10% aplicado com sucesso!");
      } else if (code === "") {
        AppState.appliedCoupon = null;
        if (couponFeedback) couponFeedback.textContent = "";
      } else {
        if (couponFeedback) {
          couponFeedback.className = "coupon-feedback error";
          couponFeedback.textContent = "Cupom inválido ou expirado.";
        }
      }
      updateCartUI();
    });
  }

  // 6. Alternância de Tipo de Pedido (Delivery x Retirada)
  const deliveryRadios = document.querySelectorAll('input[name="orderType"]');
  const addressContainer = document.getElementById("addressFieldsContainer");

  deliveryRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      const isDelivery = e.target.value === "delivery";
      addressContainer.style.display = isDelivery ? "block" : "none";
      updateCartUI();
    });
  });

  // 7. Alternância de Forma de Pagamento
  const payRadios = document.querySelectorAll('input[name="paymentMethod"]');
  const changeContainer = document.getElementById("changeFieldContainer");
  const pixAlert = document.getElementById("pixAlertBox");

  payRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      const val = e.target.value;
      changeContainer.style.display = val === "Dinheiro" ? "block" : "none";
      pixAlert.style.display = val === "PIX" ? "block" : "none";
    });
  });

  // 8. Botão Copiar Chave PIX
  const btnCopyPix = document.getElementById("btnCopyPix");
  if (btnCopyPix) {
    btnCopyPix.addEventListener("click", () => {
      const pixOnlyNumber = (RESTAURANT_CONFIG.pixKey || "").replace(/\D/g, "");
      navigator.clipboard.writeText(pixOnlyNumber || RESTAURANT_CONFIG.pixKey).then(() => {
        showToast("Chave PIX (apenas números) copiada com sucesso!");
      }).catch(() => {
        showToast("Selecione e copie a chave manualmente.", "info");
      });
    });
  }

  // 9. Cálculo Dinâmico de Entrega por Distância & Geocodificação
  const btnCalcDistance = document.getElementById("btnCalculateDistance");
  if (btnCalcDistance) {
    btnCalcDistance.addEventListener("click", () => {
      calculateDeliveryFeeFromForm(true);
    });
  }

  const btnGps = document.getElementById("btnUseGpsLocation");
  if (btnGps) {
    btnGps.addEventListener("click", () => {
      handleGpsLocation();
    });
  }

  const btnSearchCep = document.getElementById("btnSearchCep");
  if (btnSearchCep) {
    btnSearchCep.addEventListener("click", () => {
      searchCep();
    });
  }

  const cepInput = document.getElementById("customerCep");
  if (cepInput) {
    cepInput.addEventListener("input", (e) => {
      let v = e.target.value.replace(/\D/g, "");
      if (v.length > 5) {
        v = v.slice(0, 5) + "-" + v.slice(5, 8);
      }
      e.target.value = v;

      if (v.replace(/\D/g, "").length === 8) {
        searchCep();
      }
    });

    cepInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        searchCep();
      }
    });
  }

  // Cálculo automático suave ao terminar de preencher endereço (Debounce de 900ms)
  let autoCalcTimeout = null;
  const addressInputs = ["customerStreet", "customerNumber", "customerNeighborhood"];
  addressInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => {
        clearTimeout(autoCalcTimeout);
        autoCalcTimeout = setTimeout(() => {
          const street = document.getElementById("customerStreet").value.trim();
          const neighborhood = document.getElementById("customerNeighborhood").value.trim();
          if (street && neighborhood) {
            calculateDeliveryFeeFromForm(false);
          }
        }, 900);
      });
    }
  });

  // 10. Limpeza imediata de erros nos campos obrigatórios ao digitar
  const requiredInputs = ["customerName", "customerPhone", "customerStreet", "customerNumber", "customerNeighborhood", "customerChange"];
  requiredInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => {
        el.classList.remove("field-error");
      });
    }
  });

  // 11. Máscara amigável e automática para WhatsApp: (31) 99999-9999
  const phoneField = document.getElementById("customerPhone");
  if (phoneField) {
    phoneField.addEventListener("input", (e) => {
      let v = e.target.value.replace(/\D/g, "");
      if (v.length > 11) v = v.slice(0, 11);
      if (v.length > 6) {
        v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
      } else if (v.length > 2) {
        v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
      } else if (v.length > 0) {
        v = `(${v}`;
      }
      e.target.value = v;
    });
  }

  // 12. Botão Finalizar no WhatsApp
  document.getElementById("btnFinishOrder").addEventListener("click", finishOrderWhatsApp);
}
