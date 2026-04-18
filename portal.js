// Antar Wealth Management — Shared Auth & Data Helper
// Include this script in every tool page that needs save/load

const SUPABASE_URL = 'https://sqbwwppfsyukemmzqyzn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CtE8hmFqQ35C5Ju3LOaLLQ_sOYPcsHC';

let _supabase = null;
let _session = null;

function getSupabase() {
  if (!_supabase) {
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return _supabase;
}

async function getSession() {
  const { data } = await getSupabase().auth.getSession();
  _session = data.session;
  return _session;
}

async function getCurrentUser() {
  const session = await getSession();
  return session ? session.user : null;
}

async function saveToolData(toolName, data) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not logged in' };
  const { error } = await getSupabase()
    .from('user_data')
    .upsert({ user_id: user.id, tool: toolName, data: data }, { onConflict: 'user_id,tool' });
  return { error };
}

async function loadToolData(toolName) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await getSupabase()
    .from('user_data')
    .select('data, updated_at')
    .eq('user_id', user.id)
    .eq('tool', toolName)
    .single();
  if (error || !data) return null;
  return data;
}

async function signOut() {
  await getSupabase().auth.signOut();
  window.location.href = 'login.html';
}

// Inject nav portal button — call this on page load
async function initPortalNav() {
  const user = await getCurrentUser();
  const navBack = document.querySelector('.nav-back');
  if (!navBack) return;

  const portalEl = document.createElement('div');
  portalEl.style.cssText = 'display:flex;align-items:center;gap:12px;';

  if (user) {
    const initials = (user.user_metadata?.first_name?.[0] || user.email?.[0] || '?').toUpperCase();
    portalEl.innerHTML = `
      <a href="dashboard.html" style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-mid);text-decoration:none;">Portal</a>
      <div style="width:30px;height:30px;border-radius:50%;background:rgba(184,149,42,0.15);border:1px solid rgba(184,149,42,0.4);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:500;color:var(--gold);cursor:pointer;" onclick="window.location.href='dashboard.html'">${initials}</div>
    `;
  } else {
    portalEl.innerHTML = `<a href="login.html" style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;padding:6px 14px;border:1px solid var(--green);color:var(--green);text-decoration:none;">Sign in</a>`;
  }

  navBack.parentNode.insertBefore(portalEl, navBack);
}

// Show a save button in the tool — call with toolName and a function that returns the data object
function injectSaveButton(containerId, toolName, getDataFn) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const btn = document.createElement('button');
  btn.id = 'saveBtn';
  btn.style.cssText = 'padding:9px 22px;border:1px solid var(--green);background:transparent;color:var(--green);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;font-family:inherit;transition:all 0.2s;';
  btn.textContent = 'Save progress';
  btn.onmouseover = () => { btn.style.background='var(--green)'; btn.style.color='var(--linen)'; };
  btn.onmouseout  = () => { btn.style.background='transparent'; btn.style.color='var(--green)'; };

  btn.onclick = async () => {
    const user = await getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return; }
    btn.textContent = 'Saving...';
    btn.disabled = true;
    const data = getDataFn();
    const { error } = await saveToolData(toolName, data);
    if (error) {
      btn.textContent = 'Error — try again';
      btn.style.borderColor = '#E24B4A';
      btn.style.color = '#E24B4A';
    } else {
      btn.textContent = 'Saved ✓';
      btn.style.borderColor = '#1D9E75';
      btn.style.color = '#1D9E75';
    }
    setTimeout(() => {
      btn.textContent = 'Save progress';
      btn.style.borderColor = 'var(--green)';
      btn.style.color = 'var(--green)';
      btn.disabled = false;
    }, 2500);
  };

  container.appendChild(btn);
}
