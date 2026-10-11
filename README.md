# 🍔 Cailu Burger Artesanal - Cardápio Digital & Delivery SPA

Aplicação web moderna, rápida e responsiva (Single Page Application - SPA) desenvolvida para a **Cailu Burger** (Jardim América, Belo Horizonte - MG), com fotos reais dos produtos, modo carrossel por categoria e seletor inteligente de bebidas.

🔗 **Instagram Oficial:** [@cailuburger](https://www.instagram.com/cailuburger/)  
📱 **WhatsApp Delivery:** (31) 98285-3457  
📍 **Endereço Oficial:** Rua Lindolfo de Azevedo, 1518 - Jardim América, Belo Horizonte - MG  
📄 **CNPJ:** 64.875.012/0001-42 (Luana Fátima Ribeiro Avelar)  
✨ *"Um casal, um sonho e o melhor burger de BH!"*

---

## 🌟 Principais Recursos e Novidades de UX

### 1. 🎠 Navegação em Modo Carrossel por Categoria
- Os itens de cada categoria agora são apresentados em **esteiras de carrossel horizontais deslizantes**, eliminando listas verticais longas e cansativas.
- **No celular (Mobile):** Arraste por toque (*touch swipe*) com alinhamento magnético suave (*scroll snap*), permitindo visualizar o catálogo rapidamente com o polegar.
- **No computador (Desktop):** Botões de navegação lateral (`‹` e `›`) no cabeçalho de cada seção e suporte a rolagem horizontal suave.
- **Busca em tempo real:** Ao pesquisar por texto, a interface adapta-se dinamicamente para exibir todos os resultados encontrados.

### 2. 🥤 Personalização Inteligente de Bebidas (Tamanho & Versão Normal/Zero)
- Em vez de dezenas de cards repetidos para cada variação de refrigerante, as bebidas são agrupadas por marca (**Coca-Cola**, **Guaraná Antarctica**, **Pepsi**, **Água Mineral**).
- Ao clicar no botão **"Escolher"**, o cliente seleciona com um toque:
  - **Versão:** `Normal (Original)` ou `Zero Açúcar` (ou `Com Gás` / `Sem Gás`).
  - **Tamanho:** `Pet 200ml`, `Lata 350ml`, `Garrafa 600ml` ou `Garrafa 1 Litro`, com os valores atualizados em tempo real no botão.
- O item é adicionado à sacola e à mensagem do WhatsApp com a especificação exata (ex: *Coca-Cola (Zero Açúcar - Lata 350ml)*).

### 3. 🍔 Cardápio Completo com Fotos Reais e Logo Oficial
- **Combos Artesanais Oficiais (Seu Artesanal de Verdade!):**
  - *Combo Duplo* (2x Cailu Love Duplo + 1x Batata Grande 300g + 2x Refris Lata 350ml) — De R$ 107,70 por **R$ 87,90**
  - *Combo Misto* (1x Cailu Love Duplo + 1x Cailu Tradicional + 1x Batata Grande 300g + 2x Refris Lata 350ml) — De R$ 94,70 por **R$ 74,90**
  - *Combo Mix Premium* (1x Bacon Love + 1x Cailu Crispy + 1x Batata Grande + 2x Refris Lata 350ml) — De R$ 95,70 por **R$ 74,90**
  - *Combo Smash Prime - 80g* (2x Burgers Smash à escolha + 1x Batata Grande + 2x Refris Lata 350ml) — De R$ 71,90 por **R$ 57,90**
  - *Combo Smash Econômico (O Queridinho do Bolso!)* (1x Burger Smash + 1x Batata Pequena + 1x Refri 200ml) — De R$ 32,90 por **R$ 27,90**
- **Burgers Artesanais (Blend na Brasa):**
  - *Cailu Tradicional* (Blend 120g, queijo prato, bacon crocante, molho grill, brioche) — R$ 22,90
  - *Cailu Bacon Love* (Blend 120g, mix de queijos, bacon caramelizado exclusivo) — R$ 27,90
  - *Cailu Crispy* (Blend 120g, cheddar, bacon e cebolas empanadas crocantes) — R$ 33,90
  - *Cailu Love Duplo* (2 Blends de 90g = 180g de carne, duplo queijo prato, cheddar cremoso, bacon) — R$ 35,90
- **Smash Burgers:**
  - *Smash Bacon Caramelizado* — R$ 18,90
  - *Smash Cebola Caramelizada* — R$ 18,90
  - *Smash Cheddar e Bacon* — R$ 18,90
- **Acompanhamentos:**
  - *Batata Frita Crocante Individual (150g)* — R$ 12,90
  - *Pote Extra de Molho Grill da Casa (50ml)* — R$ 4,00

### 4. 🛡️ Integração WhatsApp 100% Segura (Sem Emojis na URL)
- Geração da mensagem textual pura e limpa para envio via `wa.me/?text=...`, garantindo compatibilidade total em qualquer smartphone ou navegador web sem cortes ou erros de codificação.

---

## 📂 Arquitetura dos Arquivos

```
cardapio_digital_cailu/
│
├── index.html        # Estrutura SPA com logotipo oficial e modal de opções
├── styles.css        # Sistema visual com modo carrossel e chips de bebidas
├── script.js         # Lógica do catálogo, carrossel e seletor de bebidas
├── products.js       # Base de dados oficial da Cailu Burger com opções
├── img/              # Fotos dos produtos e logotipo oficial
├── .gitignore        # Ignora a pasta original Fotos/ e arquivos PDF
└── README.md         # Documentação e instruções de publicação
```

---

## 🚀 Publicação no GitHub Pages

Para publicar seu cardápio no ar:

```bash
git init
git add .
git commit -m "feat: Modo carrossel por categoria e seletor inteligente de bebidas"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/cailu-burger.git
git push -u origin main
```

No GitHub: **Settings** > **Pages** > **Deploy from a branch** > branch `main` / `/(root)` > **Save**.  
Em 1 a 2 minutos seu cardápio estará acessível publicamente em `https://seu-usuario.github.io/cailu-burger/`.
