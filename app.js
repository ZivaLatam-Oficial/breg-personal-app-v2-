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
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  return res.json();
}

async function loadData() {
  state.dashboard = await api(`/breg/dashboard/${ZID}`);
  state.history = (await api(`/breg/history/${ZID}`)).logs;
  state.vault = await api(`/breg/vault/${ZID}`);
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

async function save() {
  const kilos = Number(document.getElementById('kilos').value);
  const price = Number(document.getElementById('price').value);
  const total = kilos * price;

  await api('/breg/log', {
    method: 'POST',
    body: JSON.stringify({
      zid: ZID,
      materials: ['Aluminum'],
      kilos,
      price,
      total,
      zone: 'Santiago'
    })
  });

  await loadData();
  state.view = 'dashboard';
  render();
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
