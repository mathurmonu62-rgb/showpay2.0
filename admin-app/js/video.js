// ============================================================
// SHOWPAY 2.0 — ADMIN VIDEO.JS
// ============================================================
import supabase from './supabase.js';
import { requireAdminAuth, getAdminSession, clearAdminSession, showToast, showLoader, hideLoader } from './auth.js';

requireAdminAuth();
const admin = getAdminSession();
if (admin) { const n = document.getElementById('admin-name'); if (n) n.textContent = admin.email?.split('@')[0]; }
document.getElementById('logout-link')?.addEventListener('click', (e) => { e.preventDefault(); clearAdminSession(); window.location.href = '/admin-app/pages/login.html'; });

const toggle  = document.getElementById('video-enabled-toggle');
const titleEl = document.getElementById('video-title');
const urlEl   = document.getElementById('video-url');
const saveBtn = document.getElementById('save-video-btn');
const preview = document.getElementById('video-preview');
const previewWrap = document.getElementById('video-preview-wrap');

let recordId = null;

async function load() {
  showLoader();
  const { data } = await supabase.from('popup_video').select('*').limit(1).maybeSingle();
  hideLoader();
  if (data) {
    recordId = data.id;
    if (toggle)  toggle.checked      = data.is_enabled;
    if (titleEl) titleEl.value       = data.title || '';
    if (urlEl)   urlEl.value         = data.video_url || '';
    updatePreview(data.video_url);
  }
}

urlEl?.addEventListener('input', () => updatePreview(urlEl.value));

function updatePreview(url) {
  if (!url) { if (previewWrap) previewWrap.style.display = 'none'; return; }
  if (preview) { preview.src = url; }
  if (previewWrap) previewWrap.style.display = 'block';
}

saveBtn?.addEventListener('click', async () => {
  const payload = {
    title: titleEl.value.trim(),
    video_url: urlEl.value.trim(),
    is_enabled: toggle.checked,
    autoplay: true,
  };

  if (!payload.title || !payload.video_url) { showToast('Fill in all fields', 'error'); return; }

  showLoader();
  try {
    let error;
    if (recordId) {
      ({ error } = await supabase.from('popup_video').update(payload).eq('id', recordId));
    } else {
      ({ error } = await supabase.from('popup_video').insert(payload));
    }
    if (error) throw error;

    await supabase.from('activity_logs').insert({
      action_type: 'Video Popup Updated',
      description: `Video popup ${payload.is_enabled ? 'enabled' : 'disabled'}: ${payload.title}`,
      performed_by: admin?.email || 'Admin',
    }).catch(() => {});

    showToast('Video settings saved!', 'success');
    load();
  } catch (err) {
    console.error(err); showToast('Save failed', 'error');
  } finally { hideLoader(); }
});

load();
