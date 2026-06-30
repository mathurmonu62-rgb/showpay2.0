// ============================================================
// SHOWPAY 2.0 — ADMIN SLIDER.JS
// ============================================================
import supabase from './supabase.js';
import { requireAdminAuth, getAdminSession, clearAdminSession, showToast, showLoader, hideLoader } from './auth.js';

requireAdminAuth();
const admin = getAdminSession();
if (admin) { const n = document.getElementById('admin-name'); if (n) n.textContent = admin.email?.split('@')[0]; }
document.getElementById('logout-link')?.addEventListener('click', (e) => { e.preventDefault(); clearAdminSession(); window.location.href = '/admin-app/pages/login.html'; });

const addForm    = document.getElementById('add-form');
const addBtn     = document.getElementById('add-slide-btn');
const cancelBtn  = document.getElementById('cancel-slide-btn');
const saveBtn    = document.getElementById('save-slide-btn');

addBtn?.addEventListener('click', () => { addForm.style.display = 'block'; });
cancelBtn?.addEventListener('click', () => { addForm.style.display = 'none'; clearForm(); });

function clearForm() {
  ['slide-title','slide-image-url','slide-link-url'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  const o = document.getElementById('slide-order'); if (o) o.value = 1;
}

async function loadSlides() {
  showLoader();
  const { data } = await supabase.from('slider_images').select('*').order('display_order');
  hideLoader();
  const tbody = document.getElementById('slider-tbody');
  if (!tbody) return;
  if (!data?.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:#94a3b8;">No slides yet. Add one!</td></tr>'; return; }
  tbody.innerHTML = data.map(s => `
    <tr>
      <td style="font-weight:700;text-align:center;">${s.display_order}</td>
      <td><img class="img-preview" src="${s.image_url}" alt="${s.title}" onerror="this.style.display='none'"/></td>
      <td style="font-weight:500;">${s.title}</td>
      <td>
        <label class="toggle">
          <input type="checkbox" ${s.is_enabled ? 'checked' : ''} onchange="toggleSlide('${s.id}', this.checked)"/>
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteSlide('${s.id}')">Delete</button></td>
    </tr>
  `).join('');
}

saveBtn?.addEventListener('click', async () => {
  const title     = document.getElementById('slide-title').value.trim();
  const image_url = document.getElementById('slide-image-url').value.trim();
  const link_url  = document.getElementById('slide-link-url').value.trim() || null;
  const display_order = parseInt(document.getElementById('slide-order').value) || 1;

  if (!title || !image_url) { showToast('Title and Image URL required', 'error'); return; }
  showLoader();
  try {
    const { error } = await supabase.from('slider_images').insert({ title, image_url, link_url, display_order, is_enabled: true });
    if (error) throw error;
    showToast('Slide added!', 'success');
    addForm.style.display = 'none';
    clearForm();
    loadSlides();
  } catch (err) { console.error(err); showToast('Failed to add slide', 'error'); }
  finally { hideLoader(); }
});

window.toggleSlide = async (id, enabled) => {
  await supabase.from('slider_images').update({ is_enabled: enabled }).eq('id', id);
  showToast(enabled ? 'Slide enabled' : 'Slide disabled', 'success');
};

window.deleteSlide = async (id) => {
  if (!confirm('Delete this slide?')) return;
  showLoader();
  await supabase.from('slider_images').delete().eq('id', id);
  hideLoader();
  showToast('Slide deleted', 'success');
  loadSlides();
};

loadSlides();
