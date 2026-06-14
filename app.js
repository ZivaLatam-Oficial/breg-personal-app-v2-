const API = 'https://ziva-core-backend-production-fb94.up.railway.app';
const ZID = 'test-zid-001';

let state = {
  dashboard: null,
  history: [],
  vault: null,
  profile: null,
  view: 'dashboard'
};

const app = document.getElementById('app');

// ================= INIT =================
document.addEventListener('DOMContentLoaded', init);

async function init() {
  bindNav();
  await loadData();
  render();
}

// ================= API =================
async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!res.ok) {
    console.error('[API ERROR]', await res.text());
    throw new Error('API error');
  }

  return res.json();
}

// ================= LOAD DATA =================
async function loadData() {
  try {
    state.dashboard = await api(`/breg/dashboard/${ZID}`);
    state.history = (await api(`/breg/history/${ZID}`)).logs || [];
    state.vault = await api(`/breg/vault/${ZID}`);
    state.profile = await api(`/breg/profile/${ZID}`);

    console.log('[STATE]', state);

  } catch (err) {
    console.error('LOAD DATA ERROR:', err);
  }
}

// ================= NAV =================
function bindNav() {
  const buttons = document.querySelectorAll('.nav button');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      state.view = btn.dataset.view;

      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      render();
    });
  });
}

// ================= RENDER =================
function render() {
  if (state.view === 'dashboard') return dashboard();
  if (state.view === 'register') return register();
  if (state.view === 'wallet') return wallet();
}

// ================= DASHBOARD =================
function dashboard() {
  const d = state.dashboard || {};
  const p = state.profile || {};
  const v = state.vault || {};

  app.innerHTML = `
    <div class="card">
      <h2>Ingreso diario</h2>
      <p>$${d.dailyIncome || 0}</p>
    </div>

    <div class="card">
      <h2>Ingreso mensual</h2>
      <p>$${d.monthlyIncome || 0}</p>
    </div>

    <div class="card">
      <h2>Total generado</h2>
      <p>$${p.totalIncome || 0}</p>
    </div>

    <div class="card">
      <h2>Gastos</h2>
      <p>$${p.totalExpenses || 0}</p>
    </div>

    <div class="card">
      <h2>Vault</h2>
      <p>$${v.totalSaved || 0}</p>
    </div>
  `;
}

// ================= REGISTER =================
function register() {
  app.innerHTML = `
    <div class="card">
      <h2>Registrar ingreso</h2>

      <div id="materials"></div>

      <input id="kilos" placeholder="Kilos" type="number"/>
      <input id="price" placeholder="Precio" type="number"/>

      <button id="saveBtn">Guardar</button>
    </div>
  `;

  const container = document.getElementById('materials');
  const options = ['Aluminum','Copper','PET'];

  options.forEach(m => {
    const btn = document.createElement('button');
    btn.innerText = m;
    btn.className = 'chip';

    btn.onclick = () => btn.classList.toggle('active');
    container.appendChild(btn);
  });

  document.getElementById('saveBtn').addEventListener('click', saveLog);
}

// ================= SAVE LOG =================
async function saveLog() {
  console.log('CLICK DETECTADO');

  const selected = Array.from(document.querySelectorAll('.chip.active'))
    .map(el => el.innerText);

  const kilos = parseFloat(document.getElementById('kilos').value);
  const price = parseFloat(document.getElementById('price').value);

  if (!selected.length) return alert('Selecciona material');
  if (!kilos || !price) return alert('Datos inválidos');

  const total = kilos * price;

  try {
    await api('/breg/log', {
      method: 'POST',
      body: JSON.stringify({
        zid: ZID,
        materials: selected,
        kilos,
        price,
        total
      })
    });

    alert('Guardado OK');

    await loadData();
    state.view = 'dashboard';
    render();

  } catch (err) {
    console.error(err);
    alert('Error real');
  }
}

// ================= WALLET =================
function wallet() {
  const v = state.vault || {};

  app.innerHTML = `
    <div class="card">
      <h2>Tu capital</h2>
      <div>$${v.totalSaved || 0}</div>
    </div>
  `;
}
