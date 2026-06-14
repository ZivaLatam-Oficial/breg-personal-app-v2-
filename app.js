const API = 'https://ziva-core-backend-production-fb94.up.railway.app';
const ZID = 'test-zid-001';
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
    dashboardData = await fetch(`${API}/breg/dashboard/${ZID}`).then(r => r.json());
    historyData = await fetch(`${API}/breg/history/${ZID}`).then(r => r.json());
    vaultData = await fetch(`${API}/breg/vault/${ZID}`).then(r => r.json());

    // ✅ ESTA ES LA LÍNEA QUE PREGUNTAS
    profileData = await fetch(`${API}/breg/profile/${ZID}`).then(r => r.json());

  } catch (err) {
    console.error('LOAD DATA ERROR:', err);
  }
}

    
    profileData = await fetch(`${API}/breg/profile/${ZID}`).then(r => r.json());

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
      <h2>Ingreso diario</h2>
      <p>$${d.dailyIncome || 0}</p>
    </div>

    <div class="card">
      <h2>Ingreso mensual</h2>
      <p>$${d.monthlyIncome || 0}</p>
    </div>

    <div class="card">
      <h2>Vault</h2>
      <p>$${d.vaultSavings || 0}</p>
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

    btn.onclick = () => {
      btn.classList.toggle('active');
    };

    container.appendChild(btn);
  });

  // 🔥 ESTA PARTE ES LA CLAVE
  document.getElementById('saveBtn').addEventListener('click', saveLog);
        }

async function saveLog() {
  console.log('CLICK DETECTADO'); // 👈 DEBUG

  const selected = Array.from(document.querySelectorAll('.chip.active'))
    .map(el => el.innerText);

  const kilos = parseFloat(document.getElementById('kilos').value);
  const price = parseFloat(document.getElementById('price').value);

  if (!selected.length) {
    alert('Selecciona material');
    return;
  }

  if (!kilos || !price) {
    alert('Datos inválidos');
    return;
  }

  const total = kilos * price;

  console.log('ENVIANDO:', {
    zid: ZID,
    materials: selected,
    kilos,
    price,
    total
  });

  try {
    const res = await fetch(`${API}/breg/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zid: ZID,
        materials: selected,
        kilos,
        price,
        total
      })
    });

    const data = await res.json();

    console.log('RESPUESTA:', data);

    alert('Guardado OK');

    await loadData();

  } catch (err) {
    console.error(err);
    alert('Error real');
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
