const RWF_PER_KWH = 182;
let devices = JSON.parse(localStorage.getItem('ww_devices') || '[]');



const pageTitles = {
  home: 'Dashboard',
  devices: 'My Devices',
  suggestions: 'AI Insights',
  account: 'Account',
};


function show(id, btn) {

  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.getElementById('pageTitle').textContent = pageTitles[id] || id;

  if (id === 'home') renderHome();
  if (id === 'suggestions') renderQuickTips();
  if (id === 'account') updateProfileStats();

}


function toggleMode() {

  document.body.classList.toggle('light');
  const icon = document.getElementById('modeIcon');

  if (document.body.classList.contains('light')) {
    icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
  } else {
    icon.innerHTML = `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`;
  }

}



function addDevice() {

  const nameEl  = document.getElementById('name');
  const wattsEl = document.getElementById('watts');
  const hoursEl = document.getElementById('hours');
  const errEl   = document.getElementById('formError');

  const name  = nameEl.value.trim();
  const watts = parseFloat(wattsEl.value);
  const hours = parseFloat(hoursEl.value);

  
  if (!name) return showError(errEl, 'Please enter a device name.');
  if (isNaN(watts) || watts <= 0) return showError(errEl, 'Please enter a valid wattage.');
  if (isNaN(hours) || hours <= 0 || hours > 24) return showError(errEl, 'Hours must be between 0 and 24.');

  errEl.textContent = '';

  const kwh = (watts * hours) / 1000;
  devices.push({ id: Date.now(), name, watts, hours, kwh });

  saveDevices();
  renderDevicesTable();
  renderResultsBar();
  renderHome();

  
  nameEl.value = '';
  wattsEl.value = '';
  hoursEl.value = '';
  nameEl.focus();


}



function removeDevice(id) {

  devices = devices.filter(d => d.id !== id);
  saveDevices();
  renderDevicesTable();
  renderResultsBar();
  renderHome();

}

function saveDevices() {
  localStorage.setItem('ww_devices', JSON.stringify(devices));
}

function getSorted() {
  return [...devices].sort((a, b) => b.kwh - a.kwh);
}

function totalKwh() {
  return devices.reduce((s, d) => s + d.kwh, 0);
}


function renderDevicesTable() {

  const container = document.getElementById('list');
  const emptyEl   = document.getElementById('devicesEmpty');
  const sorted    = getSorted();


  if (sorted.length === 0) {
    container.innerHTML = '';
    container.appendChild(emptyEl);
    emptyEl.style.display = 'block';
    return;
  }


  const header = `
    <div class="device-row device-row-header">
      <div>Device</div>
      <div>kWh / day</div>
      <div>Hours</div>
      <div>Cost / day</div>
      <div></div>
    </div>`;

  const rows = sorted.map(d => {
    const cost = (d.kwh * RWF_PER_KWH).toFixed(0);
    return `
      <div class="device-row">
        <div class="device-name-cell">${escHtml(d.name)}</div>
        <div class="device-kwh-cell">${d.kwh.toFixed(3)}</div>
        <div class="device-hrs-cell">${d.hours}h</div>
        <div class="device-cost-cell">${Number(cost).toLocaleString()} RWF</div>
        <button class="remove-btn" onclick="removeDevice(${d.id})" title="Remove">✕</button>
      </div>`;
  }).join('');

  container.innerHTML = header + rows;

}





function renderResultsBar() {

  const total = totalKwh();
  const cost  = total * RWF_PER_KWH;
  const el    = document.getElementById('results');

  if (devices.length === 0) { el.innerHTML = ''; return; }

  el.innerHTML = `
    <div class="r-item">
      <span class="r-label">Total Usage</span>
      <span class="r-val">${total.toFixed(2)} <span style="font-size:0.8rem;color:var(--text3)">kWh/day</span></span>
    </div>
    <div class="r-item">
      <span class="r-label">Estim Daily Cost</span>
      <span class="r-val" style="color:var(--neon2)">${Math.round(cost).toLocaleString()} <span style="font-size:0.8rem;color:var(--text3)">RWF</span></span>
    </div>
    <div class="r-item">
      <span class="r-label">Estim Monthly Cost</span>
      <span class="r-val" style="color:var(--neon2)">${Math.round(cost * 30).toLocaleString()} <span style="font-size:0.8rem;color:var(--text3)">RWF</span></span>
    </div>`;

}



function renderHome() {

  const total = totalKwh();
  const cost  = total * RWF_PER_KWH;
  const sorted = getSorted();
  const maxKwh = sorted.length ? sorted[0].kwh : 1;

 
  document.getElementById('heroKwh').innerHTML     = `${total.toFixed(2)} <span>kWh/day</span>`;
  document.getElementById('heroCost').innerHTML    = `${Math.round(cost).toLocaleString()} <span>RWF/day</span>`;
  document.getElementById('heroMonthly').innerHTML = `${Math.round(cost * 30).toLocaleString()} <span>RWF/mo</span>`;
  document.getElementById('heroDevices').innerHTML = `${devices.length} <span>active</span>`;
  document.getElementById('heroTop').textContent   = sorted.length ? sorted[0].name : '—';

  
  const pct = Math.min((total / 20) * 100, 100);
  document.getElementById('kwhBar').style.width = pct + '%';

  
  const gridEl  = document.getElementById('homeDeviceList');
  const emptyEl = document.getElementById('homeEmpty');


  if (devices.length === 0) {
    gridEl.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }


  emptyEl.style.display = 'none';
  gridEl.innerHTML = sorted.slice(0, 8).map(d => {
    const barPct = maxKwh > 0 ? (d.kwh / maxKwh) * 100 : 0;
    return `
      <div class="device-mini-card">
        <div class="device-mini-name">${escHtml(d.name)}</div>
        <div class="device-mini-kwh">${d.kwh.toFixed(3)} <span>kWh</span></div>
        <div class="device-mini-bar">
          <div class="device-mini-bar-fill" style="width:${barPct}%"></div>
        </div>
      </div>`;
  }).join('');

}



function compareUsage() {

  const purchased  = parseFloat(document.getElementById('purchasedUnits').value);
  const daysLasted = parseFloat(document.getElementById('purchasedDays').value);
  const resultEl   = document.getElementById('compareResult');
  const dailyUsage = totalKwh();

  if (isNaN(purchased) || purchased <= 0)
    return setCompareResult(resultEl, 'warn', ' Please enter the number of kWh you purchased.');
  if (isNaN(daysLasted) || daysLasted <= 0)
    return setCompareResult(resultEl, 'warn', 'Please enter how many days the token lasted.');
  if (devices.length === 0)
    return setCompareResult(resultEl, 'warn', 'Add your devices first so we can estimate your usage.');

  
  const expectedDays   = dailyUsage > 0 ? purchased / dailyUsage : 0;
  const actualDaysPct  = (daysLasted / expectedDays) * 100;
  const diffDays       = daysLasted - expectedDays;
  const diffKwh        = purchased - (dailyUsage * daysLasted); // kWh unaccounted for
  const sign           = diffDays >= 0 ? '+' : '';

  let cls, msg;

  if (actualDaysPct >= 85 && actualDaysPct <= 115) {
    cls = 'ok';
    msg = ` Token looks accurate! At your estimated usage of ${dailyUsage.toFixed(2)} kWh/day, ${purchased} kWh should last ~${expectedDays.toFixed(1)} days. It actually lasted ${daysLasted} days (${sign}${diffDays.toFixed(1)} days from expected). No significant discrepancy detected.`;
  } else if (daysLasted < expectedDays * 0.7) {
    cls = 'danger';
    msg = `Token ran out much faster than expected! ${purchased} kWh should have lasted ~${expectedDays.toFixed(1)} days at your usage, but only lasted ${daysLasted} days. That's ~${Math.abs(diffKwh).toFixed(1)} kWh unaccounted for — possible shared connection, meter issue, or unreported devices.`;
  } else if (daysLasted < expectedDays * 0.85) {
    cls = 'warn';
    msg = ` Token ran out a bit faster than expected. Estimated duration was ~${expectedDays.toFixed(1)} days but lasted ${daysLasted} days. About ${Math.abs(diffKwh).toFixed(1)} kWh is unaccounted for — double-check if any devices were left running unnoticed.`;
  } else {
    cls = 'ok';
    msg = ` Token lasted longer than expected! At ${dailyUsage.toFixed(2)} kWh/day it should last ~${expectedDays.toFixed(1)} days — yours went ${daysLasted} days. You may have used some devices less than estimated, which is great news.`;
  }

  setCompareResult(resultEl, cls, msg);
}

function setCompareResult(el, cls, msg) {
  el.className = `compare-result ${cls}`;
  el.textContent = msg;
}



const STATIC_TIPS = [
  'Unplug chargers Sand appliances when not in use — standby power adds up.',
  'Set your refrigerator between 3–5°C; colder than needed wastes power.',
  'Switch to LED bulbs — they use up to 80% less energy than incandescent.',
  'Run washing machines with full loads only and use cold water when possible.',
  'Use power strips to cut power to multiple devices at once when idle.',
  'Natural ventilation can reduce fan/AC usage during cooler parts of the day.',
];


function renderQuickTips() {
  const tips = [...STATIC_TIPS];

  

  devices.forEach(d => {
    if (d.watts > 1000) tips.unshift(`${d.name} uses ${d.watts}W — try reducing its daily hours to save significantly.`);
    if (d.hours > 8)    tips.unshift(`${d.name} runs ${d.hours}h/day — scheduling it during off-peak hours can help.`);
  });

  document.getElementById('quickTips').innerHTML =
    tips.slice(0, 6).map(t => `<div class="tip-item">${escHtml(t)}</div>`).join('');
}


const GROQ_API_KEY = 'Paste_Your_Groq_API_Key';

function saveApiKey() {} 

async function getAISuggestions() {

  const key   = GROQ_API_KEY;
  const outEl = document.getElementById('aiOutput');
  const btn   = document.getElementById('aiBtn');

  if (!key || key === 'YOUR_GROQ_API_KEY_HERE') {
    outEl.className = 'ai-output';
    outEl.innerHTML = '<div class="ai-tip"> API key not set. Open app.js and replace YOUR_GROQ_API_KEY_HERE with your actual key.</div>';
    return;
  }

  if (devices.length === 0) {
    outEl.className = 'ai-output';
    outEl.innerHTML = '<div class="ai-tip">Add some devices first so the AI can analyze your usage.</div>';
    return;
  }

  const sorted = getSorted();
  const total  = totalKwh();
  const cost   = (total * RWF_PER_KWH).toFixed(0);

  const deviceSummary = sorted.map(d =>
    `- ${d.name}: ${d.watts}W, ${d.hours}h/day, ${d.kwh.toFixed(3)} kWh/day`
  ).join('\n');

  const prompt = `You are an electricity efficiency advisor in Rwanda. The user has the following home devices:

${deviceSummary}

Total estimated usage: ${total.toFixed(2)} kWh/day
Estimated daily cost: ${cost} RWF (at 182 RWF/kWh)
Estimated monthly cost: ${Math.round(total * RWF_PER_KWH * 30).toLocaleString()} RWF

Give 4 specific, practical, numbered tips to reduce their electricity usage and save money. Be concise. Focus on their highest-consuming devices. Keep each tip to 1-2 sentences.`;

  outEl.className = 'ai-output loading';
  outEl.innerHTML = '';
  btn.disabled = true;
  btn.textContent = 'Analyzing...';

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 600,
        messages: [
          { role: 'system', content: 'You are a helpful electricity efficiency advisor.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }

    const text = data.choices?.[0]?.message?.content || 'No response received.';

    outEl.className = 'ai-output';
    outEl.innerHTML = text
      .split('\n')
      .filter(l => l.trim())
      .map(l => `<div class="ai-tip">${escHtml(l)}</div>`)
      .join('');

  } catch (err) {
    outEl.className = 'ai-output';
    outEl.innerHTML = `<div class="ai-tip" style="border-left-color:var(--neon3);color:var(--neon3)">
      Error: ${escHtml(err.message)}. Check your API key and try again.
    </div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Analyze My Usage`;
  }
}




function signup() {
  const name     = document.getElementById('signupName').value.trim();
  const age      = document.getElementById('signupAge').value.trim();
  const email    = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const errEl    = document.getElementById('signupError');

  if (!name)     return showError(errEl, 'Please enter your name.');
  if (!age)      return showError(errEl, 'Please enter your age.');
  if (!email || !email.includes('@')) return showError(errEl, 'Please enter a valid email.');
  if (password.length < 6) return showError(errEl, 'Password must be at least 6 characters.');

  const user = { name, age, email, passwordHash: simpleHash(password) };
  localStorage.setItem('ww_user', JSON.stringify(user));
  errEl.textContent = '';
  loadUser();
}



function login() {
  const name     = document.getElementById('loginName').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('loginError');
  const stored   = JSON.parse(localStorage.getItem('ww_user') || 'null');

  if (!stored)                           return showError(errEl, 'No account found. Please sign up first.');
  if (stored.name !== name)              return showError(errEl, 'Name does not match our records.');
  if (stored.passwordHash !== simpleHash(password)) return showError(errEl, 'Incorrect password.');

  errEl.textContent = '';
  loadUser();
}



function logout() {
  document.getElementById('profile').style.display = 'none';
  document.getElementById('auth').style.display = 'block';
  document.getElementById('topbarUser').style.display = 'none';
  document.getElementById('topbarUser').textContent = '';
}




function loadUser() {
  const user = JSON.parse(localStorage.getItem('ww_user') || 'null');
  if (!user) return;

  document.getElementById('auth').style.display = 'none';
  document.getElementById('profile').style.display = 'flex';

  const initial = user.name.charAt(0).toUpperCase();
  document.getElementById('avatarInitial').textContent = initial;
  document.getElementById('userInfo').innerHTML =
    `<strong>${escHtml(user.name)}</strong>Age ${escHtml(user.age)} · ${escHtml(user.email)}`;

  const chip = document.getElementById('topbarUser');
  chip.textContent = user.name;
  chip.style.display = 'block';

  updateProfileStats();
}




function updateProfileStats() {
  const total = totalKwh();
  document.getElementById('profileDevices').textContent = devices.length;
  document.getElementById('profileKwh').textContent = total.toFixed(2);
  document.getElementById('profileCost').textContent = Math.round(total * RWF_PER_KWH).toLocaleString();
}




function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');

  const activeTab = document.querySelector(`.auth-tab[onclick="switchTab('${tab}')"]`);
  if (activeTab) activeTab.classList.add('active');
  document.getElementById(tab + 'Form').style.display = 'flex';
}




function showError(el, msg) {
  el.textContent = msg;
  setTimeout(() => { el.textContent = ''; }, 4000);
}



function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}



function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}




renderHome();
renderDevicesTable();
renderResultsBar();
loadUser();