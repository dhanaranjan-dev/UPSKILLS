// ===================== HOME PAGE =====================
async function paintHome(main) {
  main.innerHTML = `
    <section class="rd-hero">
      <div class="rd-hero-copy">
        <span class="rd-hero-kicker">🚀 30-MINUTE LAUNCH WINDOW</span>
        <h1>Groceries delivered<br><span class="rd-hero-accent">at rocket speed.</span></h1>
        <p>Fresh fruits, vegetables, dairy & pantry staples — packed into cargo and delivered to your doorstep before you know it.</p>
        <div class="rd-hero-search">
          <input type="text" id="rd-hero-search" placeholder="What are you craving today?" value="${rd.query}"
            oninput="rd.query=this.value" onkeydown="if(event.key==='Enter'){goTo('shop')}">
          <button onclick="goTo('shop')">Launch Search 🚀</button>
        </div>
        <div class="rd-hero-stats">
          <div><b>30 min</b><span>Avg. delivery</span></div>
          <div><b>500+</b><span>Fresh items</span></div>
          <div><b>4.8★</b><span>Crew rating</span></div>
        </div>
      </div>
      <div class="rd-hero-art">
        <div class="rd-rocket-scene">
          <div class="rd-rocket">🚀</div>
          <div class="rd-rocket-trail"></div>
          <div class="rd-planet">🪐</div>
          <div class="rd-star rd-star-1">✦</div>
          <div class="rd-star rd-star-2">✦</div>
          <div class="rd-star rd-star-3">✦</div>
        </div>
      </div>
    </section>

    <section class="rd-section" id="rd-featured">
      <div class="rd-loading"><span class="rd-spinner"></span>Fueling up the featured picks...</div>
    </section>

    <section class="rd-howitworks">
      <h2>Mission Steps</h2>
      <p>Three simple steps from cart to countertop</p>
      <div class="rd-steps">
        <div class="rd-step"><div class="rd-step-num">01</div><div class="rd-step-icon">🛒</div><h3>Load Cargo</h3><p>Browse the galaxy of groceries and load your cart.</p></div>
        <div class="rd-step"><div class="rd-step-num">02</div><div class="rd-step-icon">📍</div><h3>Set Coordinates</h3><p>Drop your delivery address and pick a launch time.</p></div>
        <div class="rd-step"><div class="rd-step-num">03</div><div class="rd-step-icon">🚀</div><h3>Touchdown</h3><p>Track your pilot in real time until it lands at your door.</p></div>
      </div>
    </section>`;

  try {
    const products = await call('GET', '/products');
    rd.allCatalog = products;
    const featured = products.filter(p => p.tag).slice(0, 8).concat(products.filter(p => !p.tag)).slice(0, 8);
    document.getElementById('rd-featured').innerHTML = `
      <div class="rd-section-head">
        <h2>🌟 Featured Cargo</h2>
        <button class="rd-link-btn" onclick="goTo('shop')">Browse full shop →</button>
      </div>
      <div class="rd-grid">${featured.map(productCardHTML).join('')}</div>`;
  } catch (e) {
    document.getElementById('rd-featured').innerHTML = `<p class="rd-error">Mission control couldn't reach the server. Is the backend running on port 5050?</p>`;
  }
}

// ===================== PRODUCT CARD =====================
function productCardHTML(product) {
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  return `<div class="rd-card">
    ${product.tag ? `<span class="rd-ribbon">${product.tag}</span>` : ''}
    <span class="rd-discount-chip">-${discount}%</span>
    <div class="rd-card-media">${product.image}</div>
    <div class="rd-card-body">
      <div class="rd-card-cat">${product.category}</div>
      <div class="rd-card-name">${product.name}</div>
      <div class="rd-card-unit">${product.unit}</div>
      <div class="rd-card-price-row">
        <span class="rd-card-price">₹${product.price}</span>
        <span class="rd-card-orig">₹${product.originalPrice}</span>
      </div>
      <div class="rd-card-action" data-qty-widget="${product._id}">
        ${qtyWidgetHTML(product._id, product)}
      </div>
    </div>
  </div>`;
}

function qtyWidgetHTML(id, product) {
  const qty = bagQtyFor(id);
  const safeProduct = JSON.stringify(product || {}).replace(/'/g, "&#39;");
  if (qty > 0) {
    return `<div class="rd-stepper">
      <button onclick='bumpQty("${id}", -1, ${safeProduct})'>−</button>
      <span>${qty}</span>
      <button onclick='bumpQty("${id}", 1, ${safeProduct})'>+</button>
    </div>`;
  }
  return `<button class="rd-add-btn" onclick='addToBag(${safeProduct})'>+ Add to Cargo</button>`;
}

function bumpQty(id, delta, product) {
  setBagQty(id, bagQtyFor(id) + delta, product);
}

// ===================== SHOP PAGE =====================
async function paintShop(main) {
  main.innerHTML = `<section class="rd-section">
    <div class="rd-shop-toolbar">
      <h2>🛍️ Shop the Full Galaxy</h2>
      <div class="rd-mini-search">
        <input type="text" id="rd-shop-search" placeholder="Search products..." value="${rd.query}"
          oninput="rd.query=this.value;paintProductGrid()">
      </div>
    </div>
    <div class="rd-cat-rail" id="rd-cat-rail"><div class="rd-loading"><span class="rd-spinner"></span></div></div>
    <div class="rd-grid" id="rd-product-grid"><div class="rd-loading"><span class="rd-spinner"></span>Loading cargo...</div></div>
  </section>`;

  try {
    const [categories, products] = await Promise.all([
      call('GET', '/products/categories'),
      call('GET', '/products')
    ]);
    rd.allCatalog = products;
    rd.categories = categories;

    document.getElementById('rd-cat-rail').innerHTML = categories.map(cat => `
      <button class="rd-cat-chip ${rd.activeCategory === cat ? 'is-active' : ''}" onclick="pickCategory('${cat}')">
        <span>${CATEGORY_ICONS[cat] || '🛒'}</span> ${cat}
      </button>`).join('');

    paintProductGrid();
  } catch (e) {
    main.innerHTML = `<section class="rd-section"><p class="rd-error">Couldn't load the shop. Make sure the backend is running on port 5050.</p></section>`;
  }
}

function pickCategory(cat) {
  rd.activeCategory = cat;
  document.querySelectorAll('.rd-cat-chip').forEach(b => b.classList.remove('is-active'));
  if (event && event.target) event.target.closest('.rd-cat-chip').classList.add('is-active');
  paintProductGrid();
}

function paintProductGrid() {
  const grid = document.getElementById('rd-product-grid');
  if (!grid) return;
  const filtered = (rd.allCatalog || []).filter(p => {
    const inCat = rd.activeCategory === 'All' || p.category === rd.activeCategory;
    const inQuery = p.name.toLowerCase().includes((rd.query || '').toLowerCase());
    return inCat && inQuery;
  });
  grid.innerHTML = filtered.length
    ? filtered.map(productCardHTML).join('')
    : `<div class="rd-empty-inline">🛰️ No cargo matched your search. Try a different keyword.</div>`;
}
