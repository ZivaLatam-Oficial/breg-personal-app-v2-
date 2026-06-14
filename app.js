const API = 'https://ziva-core-backend-production-fb94.up.railway.app';
const ZID = localStorage.getItem('zid') || 'test-zid-001';

let state = {
  dashboard: null,
  history: [],
  vault: null,
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
  const url = `${API}${path}`;

  console.log('[API CALL]', url); // 👈 DEBUG

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!res.ok) {
    console.error('[API ERROR]', await res.text());
    throw new Error('API error');
  }

  const data = await res.json();
  console.log('[API RESPONSE]', data); // 👈 DEBUG

  return data;
}

async function loadData() {
  try {
    state.dashboard = await api(`/breg/dashboard/${ZID}`);
    state.history = await api(`/breg/history/${ZID}`);
    state.vault = await api(`/breg/vault/${ZID}`);

    console.log('[DATA LOADED]', {
      dashboard: state.dashboard,
      history: state.history,
      vault: state.vault
    });

    render();

  } catch (err) {
    console.error('[LOAD DATA ERROR]', err);
  }
}
// ================= NAV =================
function bindNav() {
  const buttons = document.querySelectorAll('.nav button');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      state.view = btn.dataset.view;

      // feedback visual
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

  app.innerHTML = `
    <div class="card">
      <h2>Hoy generaste</h2>
      <div class="big">$${d.dailyIncome || 0}</div>
      <div class="sub">Ingreso diario</div>
    </div>

    <div class="card">
      <h2>Capital acumulado</h2>
      <div class="big">$${state.vault?.totalSaved || 0}</div>
      <div class="sub">15% protegido</div>
    </div>

    <div class="card">
      <p>
        No estás trabajando por dinero.  
        Estás construyendo un sistema.
      </p>
    </div>
  `;
}

// ================= REGISTER =================
function register() {
  app.innerHTML = `
    <div class="card">
      <h2>Registrar ingreso</h2>

      <input id="kilos" placeholder="Kilos"/>
      <input id="price" placeholder="Precio"/>

      <button onclick="save()">Guardar</button>
    </div>
  `;
}

async function saveLog() {
  const materials = Array.from(document.querySelectorAll('.chip.active')).map(el => el.innerText);
  const kilos = parseFloat(document.getElementById('kilos').value);
  const price = parseFloat(document.getElementById('price').value);

  if (!materials.length || !kilos || !price) {
    alert('Datos inválidos');
    return;
  }

  const total = kilos * price;

  try {
    await api('/breg/log', {
      method: 'POST',
      body: JSON.stringify({
        zid: ZID,
        materials,
        kilos,
        price,
        total
      })
    });

    alert('Guardado correctamente');

    // 🔥 IMPORTANTE
    await loadData(); // 👈 RECARGA DESPUÉS DE GUARDAR

  } catch (err) {
    alert('Error al guardar');
    console.error(err);
  }
}

// ================= WALLET =================
function wallet() {
  app.innerHTML = `
    <div class="card">
      <h2>Tu capital</h2>
      <div class="big">$${state.vault?.totalSaved || 0}</div>
      <div class="sub">Fondo protegido</div>
    </div>

    <div class="card">
      <p>
        Este dinero no se toca.  
        Este dinero te construye.
      </p>
    </div>
  `;
}
