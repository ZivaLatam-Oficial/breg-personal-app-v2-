const API = 'https://ziva-core-backend-production-fb94.up.railway.app';
const ZID = localStorage.getItem('zid') || 'test-zid-001';

let state = {
  dashboard: null,
  history: [],
  vault: null
};

let current = 'dashboard';

init();

// ================= INIT =================
function init() {
  loadData();
}

// ================= NAV =================
function navigate(view) {
  current = view;
  render();
}

// ================= API =================
async function loadData() {
  try {
    state.dashboard = await fetch(`${API}/breg/dashboard/${ZID}`).then(r=>r.json());
    state.history = await fetch(`${API}/breg/history/${ZID}`).then(r=>r.json()).then(r=>r.logs);
    state.vault = await fetch(`${API}/breg/vault/${ZID}`).then(r=>r.json());
  } catch(e) {
    console.error(e);
  }

  render();
}

// ================= RENDER =================
function render() {
  if(current==='dashboard') return dashboard();
  if(current==='register') return register();
  if(current==='history') return history();
  if(current==='vault') return vault();
}

// ================= DASHBOARD =================
function dashboard() {
  document.getElementById('app').innerHTML = `
    <div class="card">
      <h3>Hoy generaste</h3>
      <h1>$${state.dashboard?.dailyIncome || 0}</h1>
    </div>

    <div class="card">
      <h3>Tu capital</h3>
      <h1>$${state.vault?.totalSaved || 0}</h1>
    </div>

    <div class="card">
      <p>
        Cada ingreso que generas construye estabilidad.
      </p>
    </div>
  `;
}

// ================= REGISTER =================
function register() {
  document.getElementById('app').innerHTML = `
    <div class="card">
      <h3>Nuevo ingreso</h3>

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

  await fetch(`${API}/breg/log`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      zid: ZID,
      materials:['Aluminum'],
      kilos,
      price,
      total,
      zone:'Santiago'
    })
  });

  alert('Guardado');
  loadData();
}

// ================= HISTORY =================
function history() {
  document.getElementById('app').innerHTML = state.history.map(h=>`
    <div class="card">
      <strong>$${h.total}</strong>
      <p>${h.materials.join(', ')}</p>
    </div>
  `).join('');
}

// ================= VAULT =================
function vault() {
  document.getElementById('app').innerHTML = `
    <div class="card">
      <h3>Total acumulado</h3>
      <h1>$${state.vault?.totalSaved || 0}</h1>
    </div>

    <div class="card">
      <p>
        El 15% de cada ingreso se guarda automáticamente.
      </p>
    </div>
  `;
    }
