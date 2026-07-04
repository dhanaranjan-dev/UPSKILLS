// ===================== PROMO SUGGESTIONS =====================
async function loadPromoSuggestions(subtotal) {
  try {
    const data = await call('GET', `/coupons/suggestions?subtotal=${subtotal}`);
    paintPromoSuggestions(data);
  } catch (e) { /* suggestions are optional, fail silently */ }
}

function paintPromoSuggestions({ applicable, nearlyEligible }) {
  const box = document.getElementById('rd-promo-suggestions');
  if (!box) return;
  if (!applicable.length && !nearlyEligible.length) { box.innerHTML = ''; return; }

  let html = '<div class="rd-promo-box"><div class="rd-promo-title">🎯 Promo Codes For You</div>';
  applicable.forEach(c => {
    html += `<div class="rd-promo-card rd-promo-ok">
      <div><span class="rd-promo-code">${c.code}</span><span class="rd-promo-desc">Save ${c.label} · You save ₹${c.savingAmount}</span></div>
      <button onclick="quickApplyPromo('${c.code}')">Apply</button>
    </div>`;
  });
  nearlyEligible.forEach(c => {
    html += `<div class="rd-promo-card rd-promo-near">
      <div><span class="rd-promo-code">${c.code}</span><span class="rd-promo-desc">Add ₹${c.amountNeeded} more to unlock ${c.label}</span></div>
      <button onclick="goTo('shop')">+ Add Items</button>
    </div>`;
  });
  html += '</div>';
  box.innerHTML = html;
}

async function quickApplyPromo(code) {
  try {
    const promo = await call('POST', '/coupons/validate', { code, subtotal: bagSubtotal() });
    rd.promo = promo;
    toast(`Promo "${promo.code}" engaged! 🎉`);
    paintPage();
  } catch (e) { toast(e.message, 'error'); }
}

// ===================== CART PAGE =====================
function paintCart(main) {
  if (rd.bag.length === 0) {
    main.innerHTML = `<div class="rd-empty-state">
      <div class="rd-empty-icon">🚀</div>
      <h2>Your cargo bay is empty</h2>
      <p>Load some fresh groceries to prepare for launch.</p>
      <button class="rd-btn rd-btn-primary" onclick="goTo('shop')">Browse the Shop</button>
    </div>`; return;
  }

  const subtotal = bagSubtotal();
  let discount = 0;
  if (rd.promo) {
    discount = rd.promo.type === 'percent' ? Math.round(subtotal * rd.promo.discount / 100) : rd.promo.discount;
  }
  const shippingFee = subtotal > 500 ? 0 : 30;
  const total = subtotal - discount + shippingFee;

  main.innerHTML = `<section class="rd-section rd-cart-layout">
    <div>
      <h2 class="rd-section-title">🚀 Cargo Bay (${bagCount()} items)</h2>
      <div id="rd-cart-items">
        ${rd.bag.map(item => `
          <div class="rd-cart-row">
            <div class="rd-cart-media">${item.image}</div>
            <div class="rd-cart-info">
              <div class="rd-cart-name">${item.name}</div>
              <div class="rd-cart-unit">${item.unit}</div>
              <div class="rd-cart-price">₹${item.price * item.qty}</div>
            </div>
            <div class="rd-stepper">
              <button onclick="setBagQty('${item._id}', ${item.qty - 1})">−</button>
              <span>${item.qty}</span>
              <button onclick="setBagQty('${item._id}', ${item.qty + 1})">+</button>
            </div>
            <button class="rd-remove-btn" onclick="setBagQty('${item._id}', 0)">✕</button>
          </div>`).join('')}
      </div>
    </div>

    <aside class="rd-summary-card">
      <h3>Launch Summary</h3>
      <div id="rd-promo-suggestions"><div class="rd-promo-loading">🎯 Scanning for promo codes…</div></div>
      <div class="rd-promo-input-row">
        <input type="text" id="rd-promo-input" placeholder="Enter promo code">
        <button class="rd-btn rd-btn-primary rd-btn-sm" onclick="applyPromoManual()">Apply</button>
      </div>
      ${rd.promo ? `<div class="rd-applied-promo"><span>✅ ${rd.promo.code}</span><span onclick="clearPromo()">✕</span></div>` : ''}
      <div class="rd-sum-row"><span>Subtotal</span><span>₹${subtotal}</span></div>
      ${discount > 0 ? `<div class="rd-sum-row rd-sum-discount"><span>Discount</span><span>−₹${discount}</span></div>` : ''}
      <div class="rd-sum-row"><span>Launch Fee</span><span class="${shippingFee === 0 ? 'rd-free' : ''}">${shippingFee === 0 ? 'FREE' : '₹' + shippingFee}</span></div>
      ${subtotal < 500 ? `<div class="rd-free-hint">Add ₹${500 - subtotal} more for a free launch 🚀</div>` : ''}
      <div class="rd-sum-total"><span>Total</span><span>₹${total}</span></div>
      <div id="rd-checkout-area">
        <button class="rd-btn rd-btn-primary" style="width:100%;margin-top:14px" onclick="beginCheckout()">Proceed to Launch →</button>
      </div>
    </aside>
  </section>`;

  if (rd.user) loadPromoSuggestions(subtotal);
}

async function applyPromoManual() {
  const code = document.getElementById('rd-promo-input').value.toUpperCase().trim();
  if (!code) return;
  try {
    const promo = await call('POST', '/coupons/validate', { code, subtotal: bagSubtotal() });
    rd.promo = promo;
    toast(`Promo "${promo.code}" applied!`);
    paintPage();
  } catch (e) { toast(e.message, 'error'); }
}

function clearPromo() { rd.promo = null; paintPage(); }

// ===================== CHECKOUT WIZARD =====================
let checkoutStep = 1;
function beginCheckout() {
  if (!rd.user) { goTo('login'); return; }
  checkoutStep = 1;
  renderCheckoutStep();
}

function renderCheckoutStep() {
  const area = document.getElementById('rd-checkout-area');
  if (checkoutStep === 1) {
    area.innerHTML = `
      <div class="rd-checkout-wizard">
        <div class="rd-wizard-steps">
          <span class="is-active">1. Coordinates</span><span>2. Review</span>
        </div>
        <textarea id="rd-address" placeholder="Enter your delivery address / landing coordinates..."></textarea>
        <button class="rd-btn rd-btn-primary" style="width:100%" onclick="goCheckoutStep2()">Continue →</button>
      </div>`;
  }
}

function goCheckoutStep2() {
  const address = document.getElementById('rd-address').value.trim();
  if (!address) { toast('Please enter a delivery address', 'error'); return; }
  checkoutStep = 2;
  const area = document.getElementById('rd-checkout-area');
  area.innerHTML = `
    <div class="rd-checkout-wizard">
      <div class="rd-wizard-steps">
        <span class="is-done">1. Coordinates ✓</span><span class="is-active">2. Review</span>
      </div>
      <div class="rd-review-address">📍 ${address}</div>
      <button class="rd-btn rd-btn-primary" style="width:100%" onclick="launchOrder('${address.replace(/'/g, "&#39;")}')">🚀 Confirm &amp; Launch Order</button>
      <button class="rd-link-btn" style="margin-top:8px" onclick="renderCheckoutStep()">← Back</button>
    </div>`;
}

async function launchOrder(address) {
  try {
    const order = await call('POST', '/orders', {
      items: rd.bag.map(i => ({ productId: i._id, name: i.name, image: i.image, unit: i.unit, price: i.price, qty: i.qty })),
      address,
      couponCode: rd.promo?.code || null
    });
    rd.bag = []; rd.promo = null; persist();
    toast('Order launched successfully! 🚀');
    goTo('tracking', { trackingId: order.orderId });
  } catch (e) { toast(e.message, 'error'); }
}

// ===================== LOGIN PAGE =====================
function paintLogin(main) {
  main.innerHTML = `<div class="rd-auth-page">
    <div class="rd-auth-card">
      <div class="rd-auth-brand">🚀<span>Rocket Delivery</span></div>
      <h2 class="rd-auth-title">Welcome back, astronaut</h2>
      <p class="rd-auth-sub">Sign in to continue your mission</p>
      <div class="rd-input-group"><label>Email address</label><input type="email" id="rd-login-email" placeholder="you@example.com"></div>
      <div class="rd-input-group"><label>Password</label><input type="password" id="rd-login-pass" placeholder="••••••••" onkeydown="if(event.key==='Enter')doLogin()"></div>
      <button class="rd-btn rd-btn-primary" style="width:100%" onclick="doLogin()">Sign In</button>
      <p class="rd-auth-switch">New to Rocket Delivery? <button class="rd-link-btn" onclick="goTo('register')">Join the crew</button></p>
      <div class="rd-demo-box"><strong>Demo accounts</strong><br>Admin: admin@rocketdelivery.com / admin123<br>User: priya@example.com / user123</div>
    </div>
  </div>`;
}

async function doLogin() {
  const email = document.getElementById('rd-login-email').value;
  const password = document.getElementById('rd-login-pass').value;
  try {
    const user = await call('POST', '/auth/login', { email, password });
    rd.user = user; rd.token = user.token;
    persist();
    toast(`Welcome back, ${user.name}! 🚀`);
    goTo(user.role === 'admin' ? 'mission-control' : 'home');
  } catch (e) { toast(e.message, 'error'); }
}

// ===================== REGISTER PAGE =====================
function paintRegister(main) {
  main.innerHTML = `<div class="rd-auth-page">
    <div class="rd-auth-card">
      <div class="rd-auth-brand">🚀<span>Rocket Delivery</span></div>
      <h2 class="rd-auth-title">Join the Crew</h2>
      <p class="rd-auth-sub">Create an account to start your first mission</p>
      <div class="rd-input-group"><label>Full name</label><input type="text" id="rd-reg-name" placeholder="Full name"></div>
      <div class="rd-input-group"><label>Email address</label><input type="email" id="rd-reg-email" placeholder="Email address"></div>
      <div class="rd-input-group"><label>Phone number</label><input type="tel" id="rd-reg-phone" placeholder="Phone number"></div>
      <div class="rd-input-group"><label>Password</label><input type="password" id="rd-reg-pass" placeholder="Password"></div>
      <button class="rd-btn rd-btn-primary" style="width:100%" onclick="doRegister()">Create Account</button>
      <p class="rd-auth-switch">Already a crew member? <button class="rd-link-btn" onclick="goTo('login')">Sign in</button></p>
    </div>
  </div>`;
}

async function doRegister() {
  const name = document.getElementById('rd-reg-name').value;
  const email = document.getElementById('rd-reg-email').value;
  const phone = document.getElementById('rd-reg-phone').value;
  const password = document.getElementById('rd-reg-pass').value;
  try {
    const user = await call('POST', '/auth/register', { name, email, phone, password });
    rd.user = user; rd.token = user.token;
    persist();
    toast('Account created! Welcome aboard 🚀');
    goTo('home');
  } catch (e) { toast(e.message, 'error'); }
}

// ===================== ORDERS PAGE =====================
async function paintOrders(main) {
  if (!rd.user) {
    main.innerHTML = `<div class="rd-empty-state"><div class="rd-empty-icon">📦</div><h2>Sign in to view your missions</h2>
      <button class="rd-btn rd-btn-primary" onclick="goTo('login')">Sign In</button></div>`; return;
  }
  main.innerHTML = `<section class="rd-section"><h2 class="rd-section-title">📦 My Orders</h2><div class="rd-loading"><span class="rd-spinner"></span>Loading your missions...</div></section>`;
  try {
    const orders = await call('GET', '/orders/my');
    rd.myOrders = orders;
    if (!orders.length) {
      main.innerHTML = `<div class="rd-empty-state"><div class="rd-empty-icon">📦</div><h2>No missions yet</h2><p>Start shopping to launch your first order.</p>
        <button class="rd-btn rd-btn-primary" onclick="goTo('shop')">Shop Now</button></div>`;
      return;
    }
    main.innerHTML = `<section class="rd-section"><h2 class="rd-section-title">📦 My Orders</h2>${orders.map(orderCardHTML).join('')}</section>`;
  } catch (e) {
    main.innerHTML = `<section class="rd-section"><p class="rd-error">Failed to load your orders.</p></section>`;
  }
}

function orderCardHTML(order) {
  const delivered = order.status === 'Delivered';
  return `<div class="rd-order-card">
    <div class="rd-order-head">
      <div>
        <div class="rd-order-id">Mission #${order.orderId}</div>
        <div class="rd-order-meta">${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        <div class="rd-order-meta">${order.items.length} items · ₹${order.total}</div>
      </div>
      <div class="rd-order-actions">
        <span class="rd-status-badge ${delivered ? 'rd-status-done' : 'rd-status-active'}">${order.status}</span>
        <button class="rd-track-btn" onclick="goTo('tracking', {trackingId:'${order.orderId}'})">Track Mission</button>
      </div>
    </div>
    <div class="rd-order-items">${order.items.map(i => `<span class="rd-order-tag">${i.image} ${i.name} ×${i.qty}</span>`).join('')}</div>
    ${delivered && !order.rating ? ratingWidgetHTML(order.orderId) : ''}
    ${order.rating ? `<div class="rd-rated-box">⭐ Your rating: ${order.rating}/5 — "${order.review}"</div>` : ''}
  </div>`;
}

function ratingWidgetHTML(orderId) {
  return `<div class="rd-rating-widget" id="rd-rating-${orderId}">
    <div class="rd-rating-label">How was this mission?</div>
    <div class="rd-stars" id="rd-stars-${orderId}">
      ${[1,2,3,4,5].map(n => `<span class="rd-star" onclick="setStarRating('${orderId}',${n})" onmouseover="hoverStars('${orderId}',${n})" onmouseout="resetStars('${orderId}')">★</span>`).join('')}
    </div>
    <input class="rd-review-input" id="rd-review-${orderId}" type="text" placeholder="Write a review (optional)">
    <button class="rd-btn rd-btn-primary rd-btn-sm" onclick="submitStarRating('${orderId}')">Submit</button>
  </div>`;
}

let chosenRatings = {};
function setStarRating(orderId, n) { chosenRatings[orderId] = n; hoverStars(orderId, n); }
function hoverStars(orderId, n) {
  document.querySelectorAll(`#rd-stars-${orderId} .rd-star`).forEach((s, i) => s.classList.toggle('is-active', i < n));
}
function resetStars(orderId) {
  const r = chosenRatings[orderId] || 0;
  document.querySelectorAll(`#rd-stars-${orderId} .rd-star`).forEach((s, i) => s.classList.toggle('is-active', i < r));
}

async function submitStarRating(orderId) {
  const rating = chosenRatings[orderId];
  if (!rating) { toast('Please select a star rating', 'error'); return; }
  const review = document.getElementById(`rd-review-${orderId}`).value;
  try {
    await call('PUT', `/orders/${orderId}/rate`, { rating, review });
    toast('Thanks for your feedback! 🚀');
    paintPage();
  } catch (e) { toast(e.message, 'error'); }
}

// ===================== TRACKING PAGE =====================
const MISSION_STAGES = ['Launch Confirmed', 'Preparing Payload', 'Packed', 'In Transit', 'Delivered'];
const STAGE_ICONS = ['🚀', '📦', '🏷️', '🛰️', '🏠'];

async function paintTracking(main) {
  const orderId = rd.trackingId;
  if (!orderId) { goTo('orders'); return; }
  main.innerHTML = `<div class="rd-tracking-page"><div class="rd-loading"><span class="rd-spinner"></span>Contacting mission control...</div></div>`;
  try {
    const order = await call('GET', `/orders/${orderId}`);
    const progressPct = (order.statusIndex / (MISSION_STAGES.length - 1)) * 100;
    main.innerHTML = `<div class="rd-tracking-page">
      <h2 class="rd-section-title" style="margin-bottom:4px">📍 Live Mission Tracking</h2>
      <p class="rd-tracking-sub">Mission #${order.orderId}</p>

      <div class="rd-tracking-card">
        <div class="rd-hstepper">
          <div class="rd-hstepper-track"><div class="rd-hstepper-fill" style="width:${progressPct}%"></div>
            <div class="rd-hstepper-rocket" style="left:${progressPct}%">🚀</div>
          </div>
          <div class="rd-hstepper-labels">
            ${MISSION_STAGES.map((s, idx) => `
              <div class="rd-hstepper-label ${idx <= order.statusIndex ? 'is-done' : ''}">
                <div class="rd-hstepper-icon">${STAGE_ICONS[idx]}</div>${s}
              </div>`).join('')}
          </div>
        </div>

        <div class="rd-pilot-card">
          <div class="rd-pilot-avatar">${order.pilot.avatar}</div>
          <div>
            <div class="rd-pilot-name">${order.pilot.name}</div>
            <a href="tel:${order.pilot.phone}" class="rd-pilot-phone">${order.pilot.phone}</a>
            <div class="rd-pilot-meta">⭐ ${order.pilot.rating} · ${order.pilot.vehicle}</div>
          </div>
        </div>

        <div class="rd-order-detail-box">
          <div class="rd-order-detail-title">📦 Cargo Manifest</div>
          ${order.items.map(i => `<div class="rd-order-detail-row"><span>${i.image} ${i.name} × ${i.qty}</span><span>₹${i.price * i.qty}</span></div>`).join('')}
          <div class="rd-order-detail-divider">
            ${order.discount > 0 ? `<div class="rd-order-detail-row rd-free"><span>Discount (${order.coupon})</span><span>−₹${order.discount}</span></div>` : ''}
            <div class="rd-order-detail-row"><span>Launch Fee</span><span>${order.deliveryFee === 0 ? 'FREE' : '₹' + order.deliveryFee}</span></div>
            <div class="rd-order-detail-total"><span>Total</span><span>₹${order.total}</span></div>
          </div>
        </div>

        <div class="rd-landing-coords">📍 Landing coordinates: ${order.address}</div>

        <div class="rd-tracking-actions">
          <button class="rd-btn rd-btn-primary" onclick="goTo('orders')">← My Orders</button>
          <button class="rd-btn rd-btn-ghost" onclick="goTo('shop')">Continue Shopping</button>
        </div>
      </div>
    </div>`;
  } catch (e) {
    main.innerHTML = `<section class="rd-section"><p class="rd-error">Mission not found.</p>
      <button class="rd-btn rd-btn-primary" onclick="goTo('orders')">← Back to Orders</button></section>`;
  }
}
