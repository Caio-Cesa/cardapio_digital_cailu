/**
 * ==============================================================================
 * CARDÁPIO DIGITAL CAILU BURGER - LÓGICA PRINCIPAL & UX
 * ==============================================================================
 * Gerenciamento do catálogo, busca dinâmica, carrinho de compras interativo,
 * persistência em LocalStorage e integração com WhatsApp (100% sem emojis na URL).
 */

// Estado da Aplicação
const AppState = {
  cart: [],
  activeCategory: "all",
  searchQuery: "",
  appliedCoupon: null, // { code: 'CAILU10', discountPercent: 10 }
  selectedProductForModal: null,
  modalQuantity: 1
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

  const cfg = RESTAURANT_CONFIG.openingHours;
  const openTime = cfg.open * 60 + cfg.openMinutes;
  const closeTime = cfg.close * 60 + cfg.closeMinutes;

  // Fechado Segunda e Terça
  const isClosedDay = day === 1 || day === 2;
  const isOpenHours = currentTime >= openTime && currentTime <= closeTime;
  const isOpen = !isClosedDay && isOpenHours;

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
      ${RESTAURANT_CONFIG.address}
    `;
  }
  
  const hoursText = `${String(RESTAURANT_CONFIG.openingHours.open).padStart(2, '0')}:${String(RESTAURANT_CONFIG.openingHours.openMinutes).padStart(2, '0')} às ${String(RESTAURANT_CONFIG.openingHours.close).padStart(2, '0')}:${String(RESTAURANT_CONFIG.openingHours.closeMinutes).padStart(2, '0')}`;
  document.getElementById("statHours").textContent = hoursText;
  
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
    });

    li.appendChild(btn);
    container.appendChild(li);
  });
}

// ==============================================================================
// RENDERIZAÇÃO DOS PRODUTOS
// ==============================================================================
function renderProducts() {
  const menuContainer = document.getElementById("menuSections");
  const emptyState = document.getElementById("emptyState");
  const resultFeedback = document.getElementById("searchResultFeedback");
  const resultCount = document.getElementById("searchResultCount");

  if (!menuContainer) return;

  menuContainer.innerHTML = "";

  // Filtragem por busca e por categoria
  let filtered = PRODUCTS.filter(prod => {
    const matchCategory = AppState.activeCategory === "all" || prod.category === AppState.activeCategory;
    const matchSearch = AppState.searchQuery === "" || 
      prod.name.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(AppState.searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Feedback de busca
  if (AppState.searchQuery.trim() !== "") {
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

  // Agrupamento por Categoria
  const categoriesToDisplay = AppState.activeCategory === "all" 
    ? CATEGORIES.filter(c => c.id !== "all") 
    : CATEGORIES.filter(c => c.id === AppState.activeCategory);

  categoriesToDisplay.forEach(cat => {
    const catProducts = filtered.filter(p => p.category === cat.id);
    if (catProducts.length === 0) return;

    const section = document.createElement("section");
    section.className = "category-section";
    section.id = `cat-section-${cat.id}`;

    // Título da Seção
    const sectionHeader = document.createElement("div");
    sectionHeader.className = "category-header-title";
    sectionHeader.innerHTML = `
      <span class="section-icon">${cat.icon}</span>
      <h2>${cat.name}</h2>
      <span class="item-count-badge">${catProducts.length} itens</span>
    `;
    section.appendChild(sectionHeader);

    // Grid de Cards
    const grid = document.createElement("div");
    grid.className = "products-grid";

    catProducts.forEach(prod => {
      const card = createProductCard(prod);
      grid.appendChild(card);
    });

    section.appendChild(grid);
    menuContainer.appendChild(section);
  });
}

/**
 * Cria o elemento DOM para o card do produto com seletor de quantidade direto
 */
function createProductCard(prod) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.id = prod.id;

  // Verifica quantidade atual no carrinho
  const cartItem = AppState.cart.find(item => item.id === prod.id);
  const currentQty = cartItem ? cartItem.quantity : 0;

  const badgeHtml = prod.badge ? `<span class="product-badge-flag">${prod.badge}</span>` : "";
  const servesHtml = prod.serves ? `<span class="product-serves-flag">${prod.serves}</span>` : "";

  card.innerHTML = `
    <div class="product-image-container" onclick="openProductModal('${prod.id}')" title="Clique para detalhes e observações">
      <img src="${prod.image}" alt="${prod.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80'">
      ${badgeHtml}
      ${servesHtml}
    </div>
    <div class="product-details">
      <h3 class="product-title" onclick="openProductModal('${prod.id}')">${prod.name}</h3>
      <p class="product-desc">${prod.description}</p>
      
      <div class="product-footer-row">
        <div class="product-price-wrapper">
          <span class="product-price-currency">A partir de</span>
          <span class="product-price-value">${formatMoney(prod.price)}</span>
        </div>

        <div class="product-action-wrapper" id="cardAction-${prod.id}">
          ${renderCardActionButtons(prod.id, currentQty)}
        </div>
      </div>
    </div>
  `;

  return card;
}

/**
 * Renderiza o botão "+ Adicionar" ou o seletor "[-] Qtd [+]" no card
 */
function renderCardActionButtons(productId, quantity) {
  if (quantity > 0) {
    return `
      <div class="quantity-controller">
        <button type="button" class="qty-btn" onclick="updateItemQuantityById('${productId}', -1)" aria-label="Diminuir">-</button>
        <span class="qty-display">${quantity}</span>
        <button type="button" class="qty-btn" onclick="updateItemQuantityById('${productId}', 1)" aria-label="Aumentar">+</button>
      </div>
    `;
  } else {
    return `
      <button type="button" class="btn-add-product" onclick="quickAddToCart('${productId}')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Adicionar
      </button>
    `;
  }
}

// ==============================================================================
// MODAL DE DETALHES DO PRODUTO (FOTO MAIOR & OBSERVAÇÃO)
// ==============================================================================
window.openProductModal = function(productId) {
  const prod = PRODUCTS.find(p => p.id === productId);
  if (!prod) return;

  AppState.selectedProductForModal = prod;
  AppState.modalQuantity = 1;

  document.getElementById("modalProductTitle").textContent = prod.name;
  document.getElementById("modalProductDesc").textContent = prod.description;
  document.getElementById("modalProductImage").src = prod.image;
  document.getElementById("modalProductServes").textContent = prod.serves || "";
  document.getElementById("modalProductNotes").value = "";
  
  const badgeEl = document.getElementById("modalProductBadge");
  if (prod.badge) {
    badgeEl.textContent = prod.badge;
    badgeEl.style.display = "inline-block";
  } else {
    badgeEl.style.display = "none";
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

  const total = prod.price * AppState.modalQuantity;
  document.getElementById("modalQtyDisplay").textContent = AppState.modalQuantity;
  document.getElementById("modalAddBtnPrice").textContent = formatMoney(total);
}

// ==============================================================================
// GESTÃO DO CARRINHO DE COMPRAS
// ==============================================================================

/**
 * Adiciona rapidamente 1 unidade a partir do botão do card
 */
window.quickAddToCart = function(productId) {
  const prod = PRODUCTS.find(p => p.id === productId);
  if (!prod) return;

  addToCart(prod, 1, "");
  showToast(`Adicionado: ${prod.name}`);
};

/**
 * Atualiza quantidade diretamente a partir dos botões do card
 */
window.updateItemQuantityById = function(productId, delta) {
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
 * Adiciona ao carrinho com suporte a observação
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
 * Atualiza quantidade de um item na lista do Drawer
 */
window.updateDrawerItemQuantity = function(index, delta) {
  if (!AppState.cart[index]) return;

  const newQty = AppState.cart[index].quantity + delta;
  const prodId = AppState.cart[index].id;

  if (newQty <= 0) {
    AppState.cart.splice(index, 1);
  } else {
    AppState.cart[index].quantity = newQty;
  }

  saveCart();
  updateCartUI();
  refreshCardButtons(prodId);
};

/**
 * Remove item específico do carrinho
 */
window.removeCartItem = function(index) {
  if (!AppState.cart[index]) return;
  const prodId = AppState.cart[index].id;
  AppState.cart.splice(index, 1);
  saveCart();
  updateCartUI();
  refreshCardButtons(prodId);
  showToast("Item removido da sacola", "info");
};

/**
 * Atualiza visual do card de um produto específico
 */
function refreshCardButtons(productId) {
  const container = document.getElementById(`cardAction-${productId}`);
  if (!container) return;

  const item = AppState.cart.find(i => i.id === productId);
  const qty = item ? item.quantity : 0;
  container.innerHTML = renderCardActionButtons(productId, qty);
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
  const deliveryFee = isDelivery && totalItems > 0 ? RESTAURANT_CONFIG.deliveryFee : 0;

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
  deliveryFeeEl.textContent = isDelivery ? formatMoney(deliveryFee) : "Grátis (Retirada)";
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
        <small>Adicione burgers artesanais, smash, fritas e bebidas para continuar!</small>
      </div>
    `;
  } else {
    drawerList.innerHTML = AppState.cart.map((item, index) => {
      const itemSubtotal = item.price * item.quantity;
      const notesHtml = item.notes ? `<div class="cart-item-notes">Obs: ${item.notes}</div>` : "";

      return `
        <div class="cart-item-row">
          <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
          <div class="cart-item-info">
            <h4 class="cart-item-title">${item.name}</h4>
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
  const data = {
    name: document.getElementById("customerName").value.trim(),
    phone: document.getElementById("customerPhone").value.trim(),
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
      if (data.street) document.getElementById("customerStreet").value = data.street;
      if (data.number) document.getElementById("customerNumber").value = data.number;
      if (data.neighborhood) document.getElementById("customerNeighborhood").value = data.neighborhood;
      if (data.complement) document.getElementById("customerComplement").value = data.complement;
      if (data.reference) document.getElementById("customerReference").value = data.reference;
    }
  } catch (e) {
    console.error("Erro ao carregar dados salvos do cliente", e);
  }
}

// ==============================================================================
// FINALIZAÇÃO DE PEDIDO & INTEGRAÇÃO COM WHATSAPP (100% SEM EMOJIS NA URL)
// ==============================================================================
function finishOrderWhatsApp() {
  // 1. Validar se há itens na sacola
  if (AppState.cart.length === 0) {
    showToast("Adicione pelo menos um item à sacola para pedir!", "error");
    return;
  }

  // 2. Coletar dados
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

  // Validação do Nome
  if (!nameInput.value.trim()) {
    nameInput.classList.add("field-error");
    nameInput.focus();
    showToast("Por favor, digite seu nome completo.", "error");
    return;
  }
  nameInput.classList.remove("field-error");

  // Validação do Telefone
  if (!phoneInput.value.trim()) {
    phoneInput.classList.add("field-error");
    phoneInput.focus();
    showToast("Por favor, informe seu número de WhatsApp.", "error");
    return;
  }
  phoneInput.classList.remove("field-error");

  // Se for Delivery, validar campos de endereço
  if (isDelivery) {
    if (!streetInput.value.trim()) {
      streetInput.classList.add("field-error");
      streetInput.focus();
      showToast("Informe a rua/avenida para entrega.", "error");
      return;
    }
    streetInput.classList.remove("field-error");

    if (!numberInput.value.trim()) {
      numberInput.classList.add("field-error");
      numberInput.focus();
      showToast("Informe o número do endereço.", "error");
      return;
    }
    numberInput.classList.remove("field-error");

    if (!neighborhoodInput.value.trim()) {
      neighborhoodInput.classList.add("field-error");
      neighborhoodInput.focus();
      showToast("Informe o seu bairro.", "error");
      return;
    }
    neighborhoodInput.classList.remove("field-error");
  }

  // Cálculos Finais
  const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = isDelivery ? RESTAURANT_CONFIG.deliveryFee : 0;
  let discountAmount = 0;
  if (AppState.appliedCoupon) {
    discountAmount = (subtotal * AppState.appliedCoupon.discountPercent) / 100;
  }
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  // Salvar no LocalStorage para visitas futuras
  saveCustomerData();

  // 3. Montagem da Mensagem Textual Limpa (SEM NENHUM EMOJI)
  // Utiliza separadores textuais seguros para não truncar na URL do navegador ou do WhatsApp
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
    message += `\n`;
  } else {
    message += `*LOCAL DE RETIRADA:* ${RESTAURANT_CONFIG.address}\n\n`;
  }

  message += `*ITENS DO PEDIDO:*\n`;
  AppState.cart.forEach((item, idx) => {
    const itemTotal = item.price * item.quantity;
    message += `${idx + 1}. ${item.quantity}x ${stripEmojis(item.name)} - ${formatMoney(itemTotal)}\n`;
    if (item.notes) {
      message += `   Obs: ${stripEmojis(item.notes)}\n`;
    }
  });
  message += `\n`;

  message += `*RESUMO FINANCEIRO:*\n`;
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
    message += `- Chave PIX: ${RESTAURANT_CONFIG.pixKey}\n`;
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

  document.getElementById("btnModalAddToCart").addEventListener("click", () => {
    if (!AppState.selectedProductForModal) return;
    const notes = document.getElementById("modalProductNotes").value;
    addToCart(AppState.selectedProductForModal, AppState.modalQuantity, notes);
    showToast(`Adicionado: ${AppState.selectedProductForModal.name}`);
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

  btnCoupon.addEventListener("click", () => {
    const code = couponInput.value.trim().toUpperCase();
    if (code === "CAILU10" || code === "PRIMEIRACOMPRA") {
      AppState.appliedCoupon = { code: code, discountPercent: 10 };
      couponFeedback.className = "coupon-feedback success";
      couponFeedback.textContent = "✓ Cupom de 10% de desconto ativado!";
      showToast("Cupom de 10% aplicado com sucesso!");
    } else if (code === "") {
      AppState.appliedCoupon = null;
      couponFeedback.textContent = "";
    } else {
      couponFeedback.className = "coupon-feedback error";
      couponFeedback.textContent = "Cupom inválido ou expirado.";
    }
    updateCartUI();
  });

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
      navigator.clipboard.writeText(RESTAURANT_CONFIG.pixKey).then(() => {
        showToast("Chave PIX copiada para a área de transferência!");
      }).catch(() => {
        showToast("Selecione e copie a chave manualmente.", "info");
      });
    });
  }

  // 9. Botão Finalizar no WhatsApp
  document.getElementById("btnFinishOrder").addEventListener("click", finishOrderWhatsApp);
}
