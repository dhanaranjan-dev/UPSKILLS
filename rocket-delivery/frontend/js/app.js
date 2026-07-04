// ===================== CONFIG =====================
const API_ROOT = 'http://localhost:5050/api';

// ===================== STATE =====================
const rd = {
  user: JSON.parse(localStorage.getItem('rd_user') || 'null'),
  token: localStorage.getItem('rd_token') || null,
  bag: JSON.parse(localStorage.getItem('rd_bag') || '[]'),
  catalog: [],
  allCatalog: [],
  categories: [],
  myOrders: [],
  promo: null,
  route: 'home',
  activeCategory: 'All',
  query: '',
  trackingId: null,
  _toastTimer: null,
};

const CATEGORY_ICONS = {
  All: '🧺', Fruits: '🍎', Vegetables: '🥦', Dairy: '🥛', Bakery: '🥐',
  Grains: '🌾', Meat: '🍗', Eggs: '🥚', Beverages: '🧃', Pantry: '🍯', Snacks: '🥜'
};

// ===================== PERSISTENCE =====================
function persist() {
  localStorage.setItem('rd_user', JSON.stringify(rd.user));
  localStorage.setItem('rd_token', rd.token || '');
  localStorage.setItem('rd_bag', JSON.stringify(rd.bag));
}

// ===================== API HELPER =====================
async function call(method, path, payload = null) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (rd.token) options.headers['Authorization'] = `Bearer ${rd.token}`;
  if (payload) options.body = JSON.stringify(payload);
  const res = await fetch(`${API_ROOT}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong. Please try again.');
  return data;
}

// ===================== TOAST =====================
function toast(msg, kind = 'success') {
  const el = document.getElementById('rd-toast');
  el.textContent = msg;
  el.className = `rd-toast rd-toast-${kind}`;
  el.style.display = 'flex';
  clearTimeout(rd._toastTimer);
  rd._toastTimer = setTimeout(() => { el.style.display = 'none'; }, 3200);
}

// ===================== ROUTING =====================
function goTo(route, extra = {}) {
  rd.route = route;
  Object.assign(rd, extra);
  paint();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================== BAG (CART) HELPERS =====================
function bagCount() { return rd.bag.reduce((sum, i) => sum + i.qty, 0); }
function bagSubtotal() { return rd.bag.reduce((sum, i) => sum + i.price * i.qty, 0); }

function addToBag(product) {
  const found = rd.bag.find(i => i._id === product._id);
  if (found) {
    rd.bag = rd.bag.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i);
  } else {
    rd.bag = [...rd.bag, { ...product, qty: 1 }];
  }
  persist();
  toast(`${product.name} loaded into cargo bay 🚀`);
  paintTopbar();
  paintBottomNav();
  // If the product grid is currently visible, refresh the qty-stepper in place
  if (rd.route === 'home' || rd.route === 'shop') refreshQtyBadges();
}

function bagQtyFor(id) {
  const item = rd.bag.find(i => i._id === id);
  return item ? item.qty : 0;
}

function setBagQty(id, qty, product = null) {
  if (qty < 1) {
    rd.bag = rd.bag.filter(i => i._id !== id);
  } else {
    const exists = rd.bag.find(i => i._id === id);
    if (exists) {
      rd.bag = rd.bag.map(i => i._id === id ? { ...i, qty } : i);
    } else if (product) {
      rd.bag = [...rd.bag, { ...product, qty }];
    }
  }
  persist();
  paintTopbar();
  paintBottomNav();
  if (rd.route === 'cart') paintPage();
  else refreshQtyBadges();
}

function refreshQtyBadges() {
  document.querySelectorAll('[data-qty-widget]').forEach(el => {
    const id = el.getAttribute('data-qty-widget');
    el.innerHTML = qtyWidgetHTML(id, rd.allCatalog.find(p => p._id === id) || rd.catalog.find(p => p._id === id));
  });
}

// ===================== LOGO =====================
function rocketLogoHTML(compact = false) {
  return `<div class="rd-logo" onclick="goTo('home')">
    <span class="rd-logo-badge">🚀</span>
    ${compact ? '' : `<span class="rd-logo-text">Rocket<b>Delivery</b></span>`}
  </div>`;
}

// ===================== SIDEBAR =====================
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'shop', label: 'Shop', icon: '🛍️' },
  { id: 'orders', label: 'My Orders', icon: '📦', authOnly: true },
  { id: 'cart', label: 'Cargo Bay', icon: '🚀' },
];

function paintSidebar() {
  const isAdmin = rd.user && rd.user.role === 'admin';
  document.getElementById('rd-sidebar').innerHTML = `
    ${rocketLogoHTML()}
    <div class="rd-sidebar-nav">
      ${NAV_ITEMS.filter(n => !n.authOnly || rd.user).map(n => `
        <button class="rd-navitem ${rd.route === n.id ? 'is-active' : ''}" onclick="goTo('${n.id}')">
          <span class="rd-navicon">${n.icon}</span> ${n.label}
          ${n.id === 'cart' && bagCount() > 0 ? `<span class="rd-navbadge">${bagCount()}</span>` : ''}
        </button>`).join('')}
      ${isAdmin ? `<button class="rd-navitem ${rd.route === 'mission-control' ? 'is-active' : ''}" onclick="goTo('mission-control')">
        <span class="rd-navicon">🛰️</span> Mission Control</button>` : ''}
    </div>
    <div class="rd-sidebar-foot">
      ${rd.user ? `
        <div class="rd-mini-profile">
          <div class="rd-mini-avatar">${rd.user.name.charAt(0)}</div>
          <div>
            <div class="rd-mini-name">${rd.user.name.split(' ')[0]}</div>
            <span class="rd-mini-logout" onclick="signOut()">Sign out</span>
          </div>
        </div>` : `
        <button class="rd-btn rd-btn-ghost" style="width:100%;margin-bottom:8px" onclick="goTo('login')">Sign In</button>
        <button class="rd-btn rd-btn-primary" style="width:100%" onclick="goTo('register')">Join the Crew</button>`}
    </div>`;
}

// ===================== TOPBAR =====================
function paintTopbar() {
  const titles = {
    home: 'Mission Home', shop: 'Shop the Galaxy of Groceries', cart: 'Your Cargo Bay',
    orders: 'My Orders', login: 'Welcome Back', register: 'Join the Crew',
    tracking: 'Live Order Tracking', 'mission-control': 'Mission Control'
  };
  document.getElementById('rd-topbar').innerHTML = `
    <div class="rd-topbar-left">
      ${rocketLogoHTML(true)}
      <span class="rd-page-title">${titles[rd.route] || 'Rocket Delivery'}</span>
    </div>
    <div class="rd-topbar-search">
      <input type="text" id="rd-quick-search" placeholder="Search groceries, e.g. mangoes, milk..." value="${rd.query}"
        oninput="rd.query=this.value" onkeydown="if(event.key==='Enter'){goTo('shop'); quickFilterFromTopbar();}">
      <button onclick="goTo('shop'); quickFilterFromTopbar();">🔍</button>
    </div>
    <div class="rd-topbar-right">
      <button class="rd-cart-pill" onclick="goTo('cart')">🚀 <span>${bagCount()}</span></button>
      ${rd.user ? `<div class="rd-mini-avatar rd-mini-avatar-top" title="${rd.user.name}">${rd.user.name.charAt(0)}</div>` : ''}
    </div>`;
}

function quickFilterFromTopbar() {
  setTimeout(() => { if (typeof paintProductGrid === 'function') paintProductGrid(); }, 50);
}

// ===================== BOTTOM NAV (mobile) =====================
function paintBottomNav() {
  document.getElementById('rd-bottomnav').innerHTML = `
    ${NAV_ITEMS.filter(n => !n.authOnly || rd.user).map(n => `
      <button class="rd-bnitem ${rd.route === n.id ? 'is-active' : ''}" onclick="goTo('${n.id}')">
        <span>${n.icon}</span>
        <label>${n.label}</label>
        ${n.id === 'cart' && bagCount() > 0 ? `<span class="rd-navbadge rd-navbadge-mobile">${bagCount()}</span>` : ''}
      </button>`).join('')}
    ${rd.user ? `<button class="rd-bnitem" onclick="signOut()"><span>👋</span><label>Exit</label></button>` :
      `<button class="rd-bnitem ${rd.route === 'login' ? 'is-active' : ''}" onclick="goTo('login')"><span>🔑</span><label>Sign In</label></button>`}`;
}

// ===================== SIGN OUT =====================
async function signOut() {
  rd.user = null; rd.token = null; rd.bag = []; rd.promo = null;
  persist();
  toast('Signed out. Safe travels, astronaut! 👋');
  goTo('home');
}

// ===================== PAINT =====================
function paint() {
  paintSidebar();
  paintTopbar();
  paintBottomNav();
  paintPage();
}

function paintPage() {
  const main = document.getElementById('rd-main');
  switch (rd.route) {
    case 'home': paintHome(main); break;
    case 'shop': paintShop(main); break;
    case 'cart': paintCart(main); break;
    case 'login': paintLogin(main); break;
    case 'register': paintRegister(main); break;
    case 'orders': paintOrders(main); break;
    case 'tracking': paintTracking(main); break;
    case 'mission-control': paintMissionControl(main); break;
    default: paintHome(main);
  }
}

window.onload = () => paint();
