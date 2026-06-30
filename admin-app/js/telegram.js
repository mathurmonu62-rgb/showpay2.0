// ============================================================
// SHOWPAY 2.0 — ADMIN TELEGRAM.JS
// ============================================================
import supabase from './supabase.js';
import { requireAdminAuth, getAdminSession, clearAdminSession, showToast, showLoader, hideLoader } from './auth.js';

requireAdminAuth();
const admin = getAdminSession();
if (admin) { const n = document.getElementById('admin-name'); if (n) n.textContent = admin.email?.split('@')[0]; }
document.getElementById('logout-link')?.addEventListener('click', (e) => { e.preventDefault(); clearAdminSession(); window.location.href = '/admin-app/pages/login.html'; });

const toggle   = document.getElementById('tg-enabled-toggle');
const titleEl  = document.getElementById('tg-title');
const descEl   = document.getElementById('tg-desc');
const imgEl    = document.getElementById('tg-image-url');
const linkEl   = document.getElementById('tg-link');
const saveBtn  = document.getElementById('save-tg-btn');
// Preview els
const prevImg  = document.getElementById('tg-preview-img');
const prevTitle = document.getElementById('tg-preview-title');
const prevDesc = document.getElementById('tg-preview-desc');

let recordId = null;

async function load() {
  showLoader();
  const { data } = await supabase.from('telegram_popup').select('*').limit(1).maybeSingle();
  hideLoader();
  if (data) {
    recordId = data.id;
    if (toggle)  toggle.checked   = data.is_enabled;
    if (titleEl) titleEl.value    = data.title || '';
    if (descEl)  descEl.value     = data.description || '';
    if (imgEl)   imgEl.value      = data.image_url || '';
    if (linkEl)  linkEl.value     = data.telegram_link || '';
    updatePreview();
  }
}

[titleEl, descEl, imgEl].forEach(el => el?.addEventListener('input', updatePreview));

function updatePreview() {
  if (prevTitle) prevTitle.textContent = titleEl?.value || '';
  if (prevDesc)  prevDesc.textContent  = descEl?.value  || '';
  if (prevImg && imgEl?.value) {
    prevImg.src = imgEl.value;
    prevImg.style.display = 'block';
  }
}

saveBtn?.addEventListener('click', async () => {
  const payload = {
    title: titleEl.value.trim(),
    description: descEl.value.trim(),
    image_url: imgEl.value.trim(),
    telegram_link: linkEl.value.trim(),
    is_enabled: toggle.checked,
  };
  if (!payload.title || !payload.telegram_link) { showToast('Fill required fields', 'error'); return; }

  showLoader();
  try {
    let error;
    if (recordId) {
      ({ error } = await supabase.from('telegram_popup').update(payload).eq('id', recordId));
    } else {
      ({ error } = await supabase.from('telegram_popup').insert(payload));
    }
    if (error) throw error;

    await supabase.from('activity_logs').insert({
      action_type: 'Telegram Popup Updated',
      description: `Telegram popup ${payload.is_enabled ? 'enabled' : 'disabled'}`,
      performed_by: admin?.email || 'Admin',
    }).catch(() => {});

    showToast('Telegram settings saved!', 'success');
    load();
  } catch (err) {
    console.error(err); showToast('Save failed', 'error');
  } finally { hideLoader(); }
});

load();
