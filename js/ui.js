/* ===== LifeLink UI Controller & SPA Router Module ===== */

let currentPage = 'home';

function navigateTo(pageId) {
  currentPage = pageId;
  window.location.hash = pageId;

  // Update navbar active state
  document.querySelectorAll('.nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === pageId);
  });

  // Close mobile menu if open
  const nav = document.getElementById('main-nav');
  const toggle = document.getElementById('mobile-toggle');
  if (nav) nav.classList.remove('open');
  if (toggle) toggle.classList.remove('open');

  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderPage();
}

function renderPage() {
  const main = document.getElementById('main-content');
  if (!main) return;

  switch (currentPage) {
    case 'home': main.innerHTML = renderHome(); break;
    case 'register': main.innerHTML = renderRegister(); break;
    case 'find': main.innerHTML = renderFind(); break;
    case 'emergency': main.innerHTML = renderEmergency(); break;
    case 'compatibility': main.innerHTML = renderCompatibility(); break;
    case 'banks': main.innerHTML = renderBanks(); break;
    case 'awareness': main.innerHTML = renderAwareness(); break;
    case 'dashboard': main.innerHTML = renderDashboard(); break;
    case 'admin': main.innerHTML = renderAdmin(); break;
    case 'bank-portal': main.innerHTML = renderBloodBankPortal(); break;
    default: main.innerHTML = renderHome();
  }

  updateAuthHeader();

  requestAnimationFrame(() => {
    initScrollReveal();
    if (currentPage === 'find') filterDonors();
    if (currentPage === 'dashboard') animateDashboardBars();
    if (currentPage === 'compatibility') updateCompatibilityView();
  });
}

function updateAuthHeader() {
  const container = document.getElementById('header-auth-container');
  if (!container) return;

  if (typeof currentBloodBankSession !== 'undefined' && currentBloodBankSession) {
    container.innerHTML = `
      <button class="btn btn-primary btn-sm nav-login-btn glow-card" onclick="navigateTo('bank-portal')">🏥 ${currentBloodBankSession.name || 'Blood Bank Portal'}</button>
      <button class="btn btn-outline btn-sm" onclick="handleBankLogout()" style="border-color: var(--accent); color: var(--accent);">Logout Bank</button>
    `;
  } else if (isAdminLoggedIn) {
    container.innerHTML = `
      <button class="btn btn-primary btn-sm nav-login-btn glow-card" onclick="navigateTo('admin')">${SVG_ICONS.shield(14)} Admin Panel</button>
      <button class="btn btn-outline btn-sm" onclick="handleUserLogout()" style="border-color: var(--accent); color: var(--accent);">Log Out</button>
    `;
  } else if (currentUserAccount) {
    const displayName = currentUserAccount.name || (currentUserAccount.email ? currentUserAccount.email.split('@')[0] : 'User');
    const firstInitial = displayName.charAt(0).toUpperCase();

    container.innerHTML = `
      <div class="user-avatar-badge" onclick="openUserProfileModal()" title="View Profile (${displayName})">
        <span>${firstInitial}</span>
      </div>
      <button class="btn btn-outline btn-sm" onclick="handleUserLogout()" style="border-color: var(--accent); color: var(--accent);">Log Out</button>
    `;
  } else {
    container.innerHTML = `
      <button class="btn btn-outline btn-sm header-bank-btn" onclick="openBloodBankLoginModal()" style="border-color: var(--border-color);">🏥 Blood Bank</button>
      <button class="btn btn-primary btn-sm nav-login-btn glow-card" onclick="openAuthModal('login', 'user')">🚀 Login</button>
    `;
  }
}

function openNotificationCenterModal() {
  const sorted = (typeof notificationsList !== 'undefined' && notificationsList.length > 0)
    ? [...notificationsList].sort((a, b) => new Date(b.timestamp || b.createdAt || b.registeredAt || 0) - new Date(a.timestamp || a.createdAt || a.registeredAt || 0)).slice(0, 5)
    : [];

  const bodyHtml = `
    <div style="max-height: 400px; overflow-y: auto; text-align: left;">
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${sorted.length > 0 ? sorted.map(n => `
          <div style="background: var(--bg-muted); padding: 12px; border-radius: var(--radius-md); border-left: 4px solid var(--accent);">
            <strong style="color: var(--accent); font-size: 0.88rem;">${n.title || 'Notification'}</strong>
            <p style="margin: 2px 0 0; font-size: 0.82rem; color: var(--text-secondary);">${n.message}</p>
          </div>
        `).join('') : `
          <div style="background: var(--bg-muted); padding: 12px; border-radius: var(--radius-md); border-left: 4px solid var(--accent);">
            <strong style="color: var(--accent); font-size: 0.88rem;">🚨 Emergency Request Broadcast</strong>
            <p style="margin: 2px 0 0; font-size: 0.82rem; color: var(--text-secondary);">Urgent O+ Blood needed at Lilavati Hospital, Mumbai.</p>
          </div>
          <div style="background: var(--bg-muted); padding: 12px; border-radius: var(--radius-md); border-left: 4px solid #10b981;">
            <strong style="color: #10b981; font-size: 0.88rem;">✅ Request Accepted</strong>
            <p style="margin: 2px 0 0; font-size: 0.82rem; color: var(--text-secondary);">Apollo Blood Centre accepted Request #REQ-002.</p>
          </div>
          <div style="background: var(--bg-muted); padding: 12px; border-radius: var(--radius-md); border-left: 4px solid #3b82f6;">
            <strong style="color: #3b82f6; font-size: 0.88rem;">📢 National Grid Alert</strong>
            <p style="margin: 2px 0 0; font-size: 0.82rem; color: var(--text-secondary);">Low stock warning for B- and O- components in North Zone.</p>
          </div>
        `}
      </div>
    </div>
  `;
  showModal('🔔 Real-Time Notifications Center', bodyHtml, [
    { text: 'Mark All as Read', class: 'btn-primary', action: () => { closeModal(); showToast('Notifications cleared', 'success'); } }
  ]);
}

function toggleMobileMenu() {
  const nav = document.getElementById('main-nav');
  const toggle = document.getElementById('mobile-toggle');
  if (nav) nav.classList.toggle('open');
  if (toggle) toggle.classList.toggle('open');
}

function closeMobileMenu() {
  const nav = document.getElementById('main-nav');
  const toggle = document.getElementById('mobile-toggle');
  if (nav) nav.classList.remove('open');
  if (toggle) toggle.classList.remove('open');
}

function showModal(title, bodyHtml, actions = []) {
  closeModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h3>${title}</h3>
      <div>${bodyHtml}</div>
      <div class="modal-actions" style="margin-top: 24px; display: flex; align-items: center; justify-content: center; gap: 16px; width: 100%;">
        ${actions.map((a, i) => `<button class="btn ${a.class}" id="modal-btn-${i}" style="min-width: 120px; text-align: center; font-weight: 700; margin: 0;">${a.text}</button>`).join('')}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  actions.forEach((a, i) => {
    const btn = document.getElementById(`modal-btn-${i}`);
    if (btn && a.action) btn.addEventListener('click', a.action);
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  requestAnimationFrame(() => overlay.classList.add('active'));
}

function closeModal() {
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  }
}

function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible', 'active');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll, .reveal-up, .reveal-scale, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
}

/* ===== THEME ENGINE & TOGGLE CONTROLLER ===== */
function initTheme() {
  // Always default to light mode — ignore device dark mode preference
  const savedTheme = localStorage.getItem('lifelink_theme') || 'light';
  setTheme(savedTheme);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('lifelink_theme', theme);
  updateThemeToggleIcon(theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

function updateThemeToggleIcon(theme) {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;
  if (theme === 'dark') {
    btn.innerHTML = '☀️';
    btn.setAttribute('title', 'Switch to Light Mode');
    btn.setAttribute('aria-label', 'Switch to Light Mode');
  } else {
    btn.innerHTML = '🌙';
    btn.setAttribute('title', 'Switch to Dark Mode');
    btn.setAttribute('aria-label', 'Switch to Dark Mode');
  }
}

// Auto-run theme initialization right away
initTheme();
