// ===================== MISSION CONTROL (ADMIN) =====================
let mcTab = 'dashboard';
const MC_TABS = [
  ['dashboard', '📊', 'Dashboard'],
  ['orders', '📦', 'Orders'],
  ['users', '👥', 'Crew'],
  ['coupons', '🎟️', 'Promo Codes'],
  ['pilots', '🛰️', 'Delivery Pilots']
];

async function paintMissionControl(main) {
  if (!rd.user || rd.user.role !== 'admin') {
    main.innerHTML = `<div class="rd-empty-state"><div class="rd-empty-icon">🔒</div><h2>Access restricted to Mission Control staff</h2></div>`;
    return;
  }
  main.innerHTML = `<div class="rd-mc-layout">
    <div class="rd-mc-tabbar">
      ${MC_TABS.map(([id, icon, label]) => `
        <button class="rd-mc-tab ${mcTab === id ? 'is-active' : ''}" onclick="switchMcTab('${id}')">
          <span>${icon}</span> ${label}
        </button>`).join('')}
    </div>
    <div class="rd-mc-content" id="rd-mc-content">
      <div class="rd-loading"><span class="rd-spinner"></span>Loading mission data...</div>
    </div>
  </div>`;
  loadMcTab();
}

function switchMcTab(tab) {
  mcTab = tab;
  document.querySelectorAll('.rd-mc-tab').forEach(el => {
    el.classList.toggle('is-active', el.getAttribute('onclick') === `switchMcTab('${tab}')`);
  });
  loadMcTab();
}

async function loadMcTab() {
  const c = document.getElementById('rd-mc-content');
  c.innerHTML = `<div class="rd-loading"><span class="rd-spinner"></span>Loading...</div>`;
  try {
    if (mcTab === 'dashboard') await paintMcDashboard(c);
    else if (mcTab === 'orders') await paintMcOrders(c);
    else if (mcTab === 'users') await paintMcUsers(c);
    else if (mcTab === 'coupons') await paintMcCoupons(c);
    else if (mcTab === 'pilots') await paintMcPilots(c);
  } catch (e) {
    c.innerHTML = `<p class="rd-error">Error: ${e.message}</p>`;
  }
}

async function paintMcDashboard(c) {
  const [stats, orders] = await Promise.all([call('GET', '/admin/stats'), call('GET', '/orders')]);
  c.innerHTML = `
    <h2 class="rd-mc-heading">Mission Overview</h2>
    <div class="rd-stat-grid">
      ${[
        ['💰', '₹' + stats.totalRevenue.toLocaleString(), 'Total Revenue'],
        ['📦', stats.totalOrders, 'Total Missions'],
        ['👥', stats.totalCustomers, 'Crew Members'],
        ['✅', stats.deliveredOrders, 'Landed Safely']
      ].map(([icon, n, l]) => `<div class="rd-stat-card"><div class="rd-stat-icon">${icon}</div><div class="rd-stat-num">${n}</div><div class="rd-stat-label">${l}</div></div>`).join('')}
    </div>
    <h3 class="rd-mc-subheading">Recent Missions</h3>
    <div class="rd-mc-table-wrap"><table class="rd-mc-table">
      <thead><tr><th>Mission ID</th><th>Crew Member</th><th>Amount</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
      <tbody>${orders.slice(0, 5).map(o => `<tr>
        <td>${o.orderId}</td><td>${o.userName}</td><td class="rd-mc-amount">₹${o.total}</td>
        <td><span class="rd-status-badge ${o.status === 'Delivered' ? 'rd-status-done' : 'rd-status-active'}">${o.status}</span></td>
        <td>${new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
        <td>${o.statusIndex < 4 ? `<button class="rd-mc-advance" onclick="advanceMission('${o.orderId}')">Advance →</button>` : '—'}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

async function paintMcOrders(c) {
  const orders = await call('GET', '/orders');
  c.innerHTML = `
    <h2 class="rd-mc-heading">All Missions (${orders.length})</h2>
    <div class="rd-mc-table-wrap"><table class="rd-mc-table">
      <thead><tr><th>Mission ID</th><th>Crew Member</th><th>Phone</th><th>Items</th><th>Total</th><th>Pilot</th><th>Status</th><th>Rating</th><th>Action</th></tr></thead>
      <tbody>${orders.map(o => `<tr>
        <td>${o.orderId}</td>
        <td><div class="rd-mc-strong">${o.userName}</div><div class="rd-mc-sub">${o.userEmail}</div></td>
        <td>${o.userPhone || '—'}</td>
        <td>${o.items.length} items</td>
        <td class="rd-mc-amount">₹${o.total}</td>
        <td>${o.pilot.name}</td>
        <td><span class="rd-status-badge ${o.status === 'Delivered' ? 'rd-status-done' : 'rd-status-active'}">${o.status}</span></td>
        <td>${o.rating ? `⭐ ${o.rating}/5` : '—'}</td>
        <td>${o.statusIndex < 4 ? `<button class="rd-mc-advance" onclick="advanceMission('${o.orderId}')">Next →</button>` : '—'}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

async function paintMcUsers(c) {
  const users = await call('GET', '/admin/users');
  const orders = await call('GET', '/orders');
  c.innerHTML = `
    <h2 class="rd-mc-heading">Crew Roster (${users.filter(u => u.role === 'user').length} customers)</h2>
    <div class="rd-mc-table-wrap"><table class="rd-mc-table">
      <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Missions</th></tr></thead>
      <tbody>${users.map(u => `<tr>
        <td class="rd-mc-strong">${u.name}</td>
        <td>${u.email}</td><td>${u.phone || '—'}</td>
        <td><span class="rd-role-chip ${u.role === 'admin' ? 'rd-role-admin' : ''}">${u.role}</span></td>
        <td>${new Date(u.joined || u.createdAt).toLocaleDateString('en-IN')}</td>
        <td>${orders.filter(o => o.userEmail === u.email).length}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

async function paintMcCoupons(c) {
  const coupons = await call('GET', '/coupons');
  c.innerHTML = `
    <h2 class="rd-mc-heading">Promo Code Management</h2>
    <div class="rd-mc-form">
      <h3>🎟️ Generate New Promo Code</h3>
      <div class="rd-mc-form-grid">
        <div><label>Promo Code</label>
          <div class="rd-mc-inline">
            <input type="text" id="rd-c-code" placeholder="e.g. SAVE20" oninput="this.value=this.value.toUpperCase()">
            <button class="rd-mc-gen" onclick="generatePromoCode()" title="Generate random">🎲</button>
          </div>
        </div>
        <div><label>Discount Value</label><input type="number" id="rd-c-discount" placeholder="e.g. 20"></div>
        <div><label>Type</label><select id="rd-c-type"><option value="percent">Percent (%)</option><option value="flat">Flat (₹)</option></select></div>
        <div><label>Min Order (₹)</label><input type="number" id="rd-c-minorder" placeholder="e.g. 200"></div>
      </div>
      <button class="rd-btn rd-btn-primary" onclick="createPromoCode()">➕ Create Promo Code</button>
    </div>
    <div class="rd-mc-table-wrap"><table class="rd-mc-table">
      <thead><tr><th>Code</th><th>Discount</th><th>Min Order</th><th>Used</th><th>Status</th><th>Toggle</th></tr></thead>
      <tbody>${coupons.map(c => `<tr>
        <td><span class="rd-mc-code">${c.code}</span></td>
        <td>${c.discount}${c.type === 'percent' ? '%' : '₹'} off</td>
        <td>₹${c.minOrder}+</td>
        <td>${c.used} times</td>
        <td><span class="rd-status-badge ${c.active ? 'rd-status-done' : 'rd-status-active'}">${c.active ? 'Active' : 'Inactive'}</span></td>
        <td><button class="${c.active ? 'rd-toggle-off' : 'rd-toggle-on'}" onclick="togglePromoCode('${c._id}')">${c.active ? 'Deactivate' : 'Activate'}</button></td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

function generatePromoCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'ROCKET';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  document.getElementById('rd-c-code').value = code;
}

async function createPromoCode() {
  const code = document.getElementById('rd-c-code').value;
  const discount = document.getElementById('rd-c-discount').value;
  const type = document.getElementById('rd-c-type').value;
  const minOrder = document.getElementById('rd-c-minorder').value;
  if (!code || !discount || !minOrder) { toast('Please fill all fields', 'error'); return; }
  try {
    await call('POST', '/coupons', { code, discount: Number(discount), type, minOrder: Number(minOrder) });
    toast('Promo code created!');
    loadMcTab();
  } catch (e) { toast(e.message, 'error'); }
}

async function togglePromoCode(id) {
  try { await call('PUT', `/coupons/${id}/toggle`); loadMcTab(); } catch (e) { toast(e.message, 'error'); }
}

async function advanceMission(orderId) {
  try { await call('PUT', `/orders/${orderId}/status`); toast('Mission status advanced!'); loadMcTab(); } catch (e) { toast(e.message, 'error'); }
}

async function paintMcPilots(c) {
  const orders = await call('GET', '/orders');
  const PILOTS = [
    { id: 1, name: 'Vikram Rathore', phone: '+91 98765 43210', rating: 4.9, avatar: 'VR', vehicle: 'Rocket Bike #21' },
    { id: 2, name: 'Ananya Deshmukh', phone: '+91 87654 32109', rating: 4.7, avatar: 'AD', vehicle: 'Rocket Bike #07' },
    { id: 3, name: 'Farhan Sheikh', phone: '+91 76543 21098', rating: 4.8, avatar: 'FS', vehicle: 'Rocket Van #14' }
  ];
  c.innerHTML = `
    <h2 class="rd-mc-heading">Delivery Pilot Fleet</h2>
    <div class="rd-pilot-grid">
      ${PILOTS.map(p => {
        const assigned = orders.filter(o => o.pilot.id === p.id);
        const delivered = assigned.filter(o => o.status === 'Delivered').length;
        return `<div class="rd-pilot-fleet-card">
          <div class="rd-pilot-fleet-head">
            <div class="rd-pilot-avatar rd-pilot-avatar-lg">${p.avatar}</div>
            <div>
              <div class="rd-mc-strong">${p.name}</div>
              <a href="tel:${p.phone}" class="rd-pilot-phone">${p.phone}</a>
              <div class="rd-pilot-meta">⭐ ${p.rating} · ${p.vehicle}</div>
            </div>
          </div>
          <div class="rd-pilot-stats">
            ${[['Assigned', assigned.length], ['Delivered', delivered], ['In Progress', assigned.length - delivered], ['Success Rate', assigned.length ? Math.round(delivered / assigned.length * 100) + '%' : 'N/A']].map(([l, v]) =>
              `<div class="rd-pilot-stat"><div class="rd-pilot-stat-num">${v}</div><div class="rd-pilot-stat-label">${l}</div></div>`).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>`;
}
