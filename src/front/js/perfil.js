if (!DB.isLoggedIn()) {
  location.href = 'login.html';
}

function $(id) { return document.getElementById(id); }

function showToast(msg, ok = true) {
  const t = $('toast');
  t.textContent = msg;
  t.style.borderColor = ok ? 'var(--green-badge)' : '#ef4444';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

function openModal(id)  { $(id).classList.add('open'); }
function closeModal(id) { $(id).classList.remove('open'); }

$('btnLogout').addEventListener('click', () => {
  DB.logout();
  location.href = 'login.html';
});

function renderProfile() {
  const u = DB.getUser();
  if (!u) return;

  $('displayName').textContent  = u.name;
  $('displayEmail').textContent = u.email;
  $('displayRole').textContent  = u.role;
  $('displayJoin').textContent  = `Membro desde ${u.joinMonth} de ${u.joinYear}`;
  $('displayCity').textContent  = `${u.city}, ${u.state}`;

  if (u.isAdmin) {
    $('adminBadge').style.display = 'inline-flex';
    $('avatarInner').textContent  = '⚙️';
  }
}

function renderStats() {
  const dens = DB.getDenuncias();
  $('statDenuncias').textContent = dens.length;
  $('statApoios').textContent    = DB.totalApoios();
}

const BADGE_LABELS = {
  'badge-red':    'Urgente',
  'badge-yellow': 'Em Andamento',
  'badge-green':  'Resolvido',
  'badge-cyan':   'Novo',
};

function renderDenuncias() {
  const grid = $('denunciasGrid');
  const list = DB.getDenuncias().slice(0, 4);

  if (!list.length) {
    grid.innerHTML = '<p style="color:var(--text-muted);font-size:13px;grid-column:1/-1;padding:.5rem 0">Nenhuma denúncia ainda.</p>';
    return;
  }

  grid.innerHTML = list.map(d => `
    <div class="denuncia-card">
      <div class="denuncia-img">
        <div class="img-placeholder ${d.imgClass}">${d.imgEmoji}</div>
        <span class="badge ${d.badgeClass}">${BADGE_LABELS[d.badgeClass] || ''}</span>
      </div>
      <div class="denuncia-body">
        <div class="denuncia-title">${d.title}</div>
        <div class="denuncia-desc">${d.desc}</div>
        <div class="denuncia-footer">
          <span class="denuncia-date">${d.date}</span>
          <span class="apoio-count">👍 ${d.apoios}</span>
        </div>
      </div>
    </div>
  `).join('');
}

const ICON_MAP = {
  report:  { cls: 'icon-report',  emoji: '⚠' },
  support: { cls: 'icon-support', emoji: '👍' },
  update:  { cls: 'icon-update',  emoji: '🔔' },
};

function renderActivities() {
  const list = $('activityList');
  const acts = DB.getActivities();

  if (!acts.length) {
    list.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:.5rem 0">Nenhuma atividade ainda.</p>';
    return;
  }

  list.innerHTML = acts.map(a => {
    const ic = ICON_MAP[a.type] || ICON_MAP.update;
    return `
      <div class="activity-item">
        <div class="activity-icon ${ic.cls}">${ic.emoji}</div>
        <div class="activity-text">
          <strong>${a.text}</strong>
          <span>${a.sub}</span>
          <span class="activity-time">${a.time}</span>
        </div>
      </div>`;
  }).join('');
}

$('btnEditProfile').addEventListener('click', () => {
  const u = DB.getUser();
  $('editName').value  = u.name;
  $('editEmail').value = u.email;
  $('editCity').value  = u.city;
  $('editState').value = u.state;
  openModal('editModal');
});

$('btnSaveProfile').addEventListener('click', () => {
  DB.updateUser({
    name:  $('editName').value.trim()  || DB.getUser().name,
    email: $('editEmail').value.trim() || DB.getUser().email,
    city:  $('editCity').value.trim()  || DB.getUser().city,
    state: $('editState').value.trim() || DB.getUser().state,
  });
  closeModal('editModal');
  renderProfile();
  showToast('✅ Perfil atualizado!');
});

$('btnNewReport').addEventListener('click', () => openModal('reportModal'));

$('btnSubmitReport').addEventListener('click', () => {
  const title    = $('reportTitle').value.trim();
  const category = $('reportCategory').value;
  const address  = $('reportAddress').value.trim();
  const desc     = $('reportDesc').value.trim();

  if (!title || !category || !desc) {
    showToast('⚠ Preencha título, categoria e descrição.', false);
    return;
  }

  const catMap = {
    'Buraco na via':      { imgClass: 'img-road',  imgEmoji: '🕳️', badgeClass: 'badge-red' },
    'Iluminação pública': { imgClass: 'img-light', imgEmoji: '💡', badgeClass: 'badge-yellow' },
    'Acúmulo de lixo':    { imgClass: 'img-trash', imgEmoji: '🗑️', badgeClass: 'badge-green' },
    'Sinalização':        { imgClass: 'img-sign',  imgEmoji: '🛑', badgeClass: 'badge-cyan' },
  };
  const cat = catMap[category] || { imgClass: 'img-road', imgEmoji: '📍', badgeClass: 'badge-cyan' };

  DB.addDenuncia({
    id:         DB.gerarId(),
    title,
    desc:       `${address ? address + ' — ' : ''}${desc}`,
    category,
    badgeClass: cat.badgeClass,
    date:       DB.dataHoje(),
    apoios:     0,
    imgClass:   cat.imgClass,
    imgEmoji:   cat.imgEmoji,
  });

  DB.addActivity({ type: 'report', text: 'Você reportou um novo problema', sub: title, time: 'Agora' });

  closeModal('reportModal');
  $('reportTitle').value    = '';
  $('reportCategory').value = '';
  $('reportAddress').value  = '';
  $('reportDesc').value     = '';

  renderDenuncias();
  renderStats();
  renderActivities();
  showToast('✅ Denúncia publicada!');
});

document.querySelectorAll('[data-modal]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.modal));
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

renderProfile();
renderStats();
renderDenuncias();
renderActivities();
