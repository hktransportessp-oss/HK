export const ADMIN_JS_TEMPLATE = `
  // STATE MANAGEMENT
  const STATE = {
    token: null,
    refreshToken: null,
    user: null,
    currentView: 'dashboard',
    users: [],
    drivers: [],
    vehicles: [],
    trips: [],
    romaneios: [],
    invoices: [],
    selectedInvoiceIds: new Set(),
    tolls: [],
    occurrences: [],
    settlements: [],
    trackingLocations: [],
    erpLogs: [],
    auditLogs: [],
    systemConfig: null,
    stats: null,
    unlinkedDrivers: [],
    tripFormStops: [],
    tripFormStep: 1,
    tripDateQuickFilter: 'all'
  };

  // LUCIDE ICONS SVG MAPPING
  const ICONS = {
    truck: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>',
    user: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    users: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'user-plus': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>',
    'user-check': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>',
    'id-card': '<svg class="svg-icon" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M14 10h4"/><path d="M14 14h4"/><path d="M6 18h4"/></svg>',
    lock: '<svg class="svg-icon" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    eye: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
    'arrow-right': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
    'arrow-up': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>',
    'arrow-down': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>',
    send: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
    list: '<svg class="svg-icon" viewBox="0 0 24 24"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',
    plus: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
    'layout-dashboard': '<svg class="svg-icon" viewBox="0 0 24 24"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
    navigation: '<svg class="svg-icon" viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
    'log-out': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>',
    'refresh-cw': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
    'check-circle': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    'alert-triangle': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>',
    'shield-alert': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>',
    'link-2-off': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M9 17H7A5 5 0 0 1 7 7"/><path d="M15 7h2a5 5 0 0 1 4 8"/><line x1="8" x2="12" y1="12" y2="12"/><line x1="2" x2="22" y1="2" y2="22"/></svg>',
    clock: '<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    search: '<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    'plus-circle': '<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="16"/><line x1="8" x2="16" y1="12" y2="12"/></svg>',
    x: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    key: '<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>',
    'edit-2': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
    trash: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
    info: '<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    'file-text': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
    receipt: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v.5"/><path d="M12 6v.5"/></svg>',
    'credit-card': '<svg class="svg-icon" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>',
    'alert-octagon': '<svg class="svg-icon" viewBox="0 0 24 24"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>',
    'external-link': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
    check: '<svg class="svg-icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
    'x-circle': '<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
    file: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
    'dollar-sign': '<svg class="svg-icon" viewBox="0 0 24 24"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    'map-pin': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
    activity: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    database: '<svg class="svg-icon" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>',
    server: '<svg class="svg-icon" viewBox="0 0 24 24"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>',
    shield: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    settings: '<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    'arrow-up-right': '<svg class="svg-icon" viewBox="0 0 24 24"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>',
    'arrow-down-left': '<svg class="svg-icon" viewBox="0 0 24 24"><line x1="17" y1="7" x2="7" y2="17"/><polyline points="17 17 7 17 7 7"/></svg>',
    wifi: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/><line x1="12" x2="12.01" y1="20" y2="20"/></svg>',
    'wifi-off': '<svg class="svg-icon" viewBox="0 0 24 24"><line x1="2" x2="22" y1="2" y2="22"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 4.17-2.65"/><path d="M10.66 5c4.01-.36 8.14.9 11.34 3.82"/><path d="M16.85 11.25a10 10 0 0 1 2.22 1.75"/><path d="M5 13a10 10 0 0 1 5.24-2.59"/><line x1="12" x2="12.01" y1="20" y2="20"/></svg>'
  };

  function renderIcons() {
    document.querySelectorAll('[data-lucide]').forEach(el => {
      const iconName = el.getAttribute('data-lucide');
      if (ICONS[iconName]) {
        el.innerHTML = ICONS[iconName];
      }
    });
  }

  // DIAGNOSTICS & LOGGING
  function updateDiag(id, text, color) {
    const el = document.getElementById(id);
    if (el) {
      el.innerText = text;
      if (color) el.style.color = color;
    }
  }

  // TOAST NOTIFICATIONS
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    
    let icon = ICONS.info;
    if (type === 'success') icon = ICONS['check-circle'];
    if (type === 'error') icon = ICONS['alert-triangle'];

    toast.innerHTML = '<span style="flex-shrink:0;">' + icon + '</span><div style="flex:1;">' + message + '</div>';
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // MODAL CONTROLLER
  function openModal(id) {
    const m = document.getElementById(id);
    if (m) {
      m.classList.remove('hidden');
      renderIcons();
    }
  }

  function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('hidden');
  }

  // FORMATTERS
  function formatCPF(v) {
    if (!v) return '-';
    const c = v.replace(/\\D/g, '');
    if (c.length !== 11) return v;
    return c.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{2})/, '$1.$2.$3-$4');
  }

  function formatPhone(v) {
    if (!v) return '-';
    const p = v.replace(/\\D/g, '');
    if (p.length === 11) return p.replace(/(\\d{2})(\\d{5})(\\d{4})/, '($1) $2-$3');
    if (p.length === 10) return p.replace(/(\\d{2})(\\d{4})(\\d{4})/, '($1) $2-$3');
    return v;
  }

  function formatDate(d) {
    if (!d) return '-';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return '-';
      return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '-';
    }
  }

  function formatCurrency(val) {
    if (val === null || val === undefined || isNaN(val)) return 'R$ 0,00';
    return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // API FETCH WRAPPER
  async function apiFetch(endpoint, options = {}) {
    const headers = options.headers || {};
    if (STATE.token) {
      headers['Authorization'] = 'Bearer ' + STATE.token;
    }
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const res = await fetch(endpoint, { ...options, headers });
      
      if (res.status === 401) {
        showToast('Sessão expirada. Faça login novamente.', 'error');
        handleLogout();
        throw new Error('Não autorizado');
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorMsg = data.message || 'Erro na requisição (' + res.status + ')';
        const msg = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
        throw new Error(msg);
      }
      return data;
    } catch (err) {
      console.error('API Fetch Error:', err);
      throw err;
    }
  }

  // AUTHENTICATION
  async function handleLogin(event) {
    if (event) event.preventDefault();
    updateDiag('diag-submit', new Date().toLocaleTimeString(), 'var(--emerald-base)');
    updateDiag('diag-fetch', 'SIM', 'var(--brand-light)');

    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const submitBtn = document.getElementById('login-submit-btn');

    const phone_or_cpf = (usernameInput?.value || '').trim();
    const password = (passwordInput?.value || '').trim();

    if (!phone_or_cpf || !password) {
      showToast('Preencha o usuário e a senha', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span><span>Entrando...</span>';
    }

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_or_cpf, password })
      });

      updateDiag('diag-http', res.status.toString(), res.ok ? 'var(--emerald-base)' : 'var(--rose-base)');
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data.message || 'Credenciais inválidas';
        throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
      }

      if (data.user?.role !== 'ADMIN' && data.user?.role !== 'MANAGER') {
        throw new Error('Acesso negado: O painel requer perfil ADMIN ou MANAGER.');
      }

      STATE.token = data.access_token;
      STATE.refreshToken = data.refresh_token;
      STATE.user = data.user;

      localStorage.setItem('hk_access_token', data.access_token);
      localStorage.setItem('hk_refresh_token', data.refresh_token);
      localStorage.setItem('hk_user', JSON.stringify(data.user));

      showToast('Bem-vindo, ' + data.user.name + '!', 'success');
      showApp();
    } catch (err) {
      updateDiag('diag-error', err.message, 'var(--rose-base)');
      showToast(err.message, 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Entrar no Painel</span>' + ICONS['arrow-right'];
        renderIcons();
      }
    }
  }

  function handleLogout() {
    STATE.token = null;
    STATE.refreshToken = null;
    STATE.user = null;
    localStorage.removeItem('hk_access_token');
    localStorage.removeItem('hk_refresh_token');
    localStorage.removeItem('hk_user');

    document.getElementById('app-layout')?.classList.add('hidden');
    document.getElementById('auth-screen')?.classList.remove('hidden');
  }

  function showApp() {
    document.getElementById('auth-screen')?.classList.add('hidden');
    document.getElementById('app-layout')?.classList.remove('hidden');

    const nameEl = document.getElementById('user-display-name');
    const roleEl = document.getElementById('user-display-role');
    const avatarEl = document.getElementById('user-avatar');

    if (STATE.user) {
      if (nameEl) nameEl.innerText = STATE.user.name || 'Usuário';
      if (roleEl) roleEl.innerText = STATE.user.role || 'ADMIN';
      if (avatarEl) {
        const initials = (STATE.user.name || 'AD').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        avatarEl.innerText = initials;
      }
    }

    renderIcons();
    navigate(STATE.currentView || 'dashboard');
  }

  // NAVIGATION ROUTER
  function navigate(view) {
    STATE.currentView = view;

    ['dashboard', 'invoices', 'trips', 'romaneios', 'tolls', 'occurrences', 'tracking', 'drivers', 'vehicles', 'config'].forEach(v => {
      const navBtn = document.getElementById('nav-' + v);
      const viewSec = document.getElementById('view-' + v);
      if (navBtn) {
        if (v === view) navBtn.classList.add('active');
        else navBtn.classList.remove('active');
      }
      if (viewSec) {
        if (v === view) viewSec.classList.remove('hidden');
        else viewSec.classList.add('hidden');
      }
    });

    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
      const titles = {
        dashboard: 'Dashboard Operacional',
        invoices: 'Notas Fiscais (ERP HK Transportes)',
        trips: 'Viagens / Rotas',
        romaneios: 'Romaneios',
        tolls: 'Pedágios Operacionais',
        occurrences: 'Ocorrências',
        tracking: 'Rastreamento',
        drivers: 'Motoristas / Usuários',
        vehicles: 'Veículos',
        config: 'Administração do App HK Connect'
      };
      pageTitle.innerText = titles[view] || 'Dashboard Operacional';
    }

    renderIcons();

    if (view === 'dashboard') loadDashboard();
    else if (view === 'invoices') loadInvoices();
    else if (view === 'trips') loadTrips();
    else if (view === 'romaneios') loadRomaneios();
    else if (view === 'tolls') loadTolls();
    else if (view === 'occurrences') loadOccurrences();
    else if (view === 'tracking') loadTracking();
    else if (view === 'drivers') loadUsers();
    else if (view === 'vehicles') loadVehicles();
    else if (view === 'config') loadSystemConfig();
  }

  function refreshCurrentView() {
    navigate(STATE.currentView);
  }

  // ==============================================
  // 1. DASHBOARD CONTROLLER (OPERACIONAL)
  // ==============================================
  async function loadDashboard() {
    try {
      const stats = await apiFetch('/api/v1/admin/dashboard');
      STATE.stats = stats;

      // Update stat cards
      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = (val !== null && val !== undefined) ? val : '0';
      };

      setVal('stat-total-drivers', stats.totalDrivers);
      setVal('stat-active-drivers', stats.activeDrivers);
      setVal('stat-available-drivers', stats.availableDrivers);
      setVal('stat-in-trip-drivers', stats.inTripDrivers);
      setVal('stat-drivers-no-vehicle', stats.driversWithoutVehicle);
      setVal('stat-active-vehicles', stats.activeVehicles);
      setVal('stat-pending-trips', stats.pendingTrips);
      setVal('stat-in-progress-trips', stats.inProgressTrips);
      setVal('stat-completed-trips', stats.completedTrips);
      setVal('stat-pending-romaneios', stats.pendingRomaneiosCount);
      setVal('stat-pending-tolls-count', stats.pendingTollsCount);
      setVal('stat-open-occurrences', stats.openOccurrences);
      setVal('stat-drivers-no-signal', stats.driversNoSignalCount || 0);

      // Render recent trips table
      const tripsTbody = document.getElementById('dashboard-recent-trips');
      if (tripsTbody) {
        if (!stats.recentTrips || stats.recentTrips.length === 0) {
          tripsTbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding:1rem; color:var(--text-muted);">Nenhuma viagem recente registrada.</td></tr>';
        } else {
          tripsTbody.innerHTML = stats.recentTrips.map(t => {
            const driverName = t.driver?.user?.name || 'Não atribuído';
            const plate = t.vehicle?.plate || '-';
            const statusBadge = getTripStatusBadge(t.status);
            return '<tr>' +
              '<td><strong class="font-mono" style="color:var(--brand-light);">' + (t.tripCode || t.id.slice(0,8)) + '</strong></td>' +
              '<td class="text-xs truncate" style="max-width:180px;">' + (t.origin || 'Origem') + ' &rarr; ' + (t.destination || 'Destino') + '</td>' +
              '<td class="text-xs">' + driverName + ' <span class="font-mono text-muted">(' + plate + ')</span></td>' +
              '<td>' + statusBadge + '</td>' +
              '<td class="text-right"><button onclick="openTripDetailsModal(\\'' + t.id + '\\')" class="btn btn-secondary btn-sm">Detalhes</button></td>' +
            '</tr>';
          }).join('');
        }
      }

      // Render unassigned drivers
      const unassignedTbody = document.getElementById('dashboard-unassigned-drivers');
      if (unassignedTbody) {
        if (!stats.unassignedDrivers || stats.unassignedDrivers.length === 0) {
          unassignedTbody.innerHTML = '<tr><td colspan="4" class="text-center" style="padding:1rem; color:var(--emerald-base);">Todos os motoristas possuem veículo vinculado!</td></tr>';
        } else {
          unassignedTbody.innerHTML = stats.unassignedDrivers.map(d => {
            const name = d.user?.name || 'Motorista (' + (d.cnh || d.id.slice(0,6)) + ')';
            const phone = formatPhone(d.user?.phone);
            return '<tr>' +
              '<td><strong>' + name + '</strong></td>' +
              '<td class="text-xs font-mono">' + phone + '</td>' +
              '<td><span class="badge badge-danger">Sem Veículo</span></td>' +
              '<td class="text-right">' +
                '<button onclick="openAssignVehicleModal(\\'' + d.id + '\\', \\'' + name.replace(/'/g, "\\\\'") + '\\')" class="btn btn-cyan btn-sm">Vincular</button>' +
              '</td>' +
            '</tr>';
          }).join('');
        }
      }

      // Render recent romaneios
      const romaneiosDiv = document.getElementById('dashboard-recent-romaneios');
      if (romaneiosDiv) {
        if (!stats.recentRomaneios || stats.recentRomaneios.length === 0) {
          romaneiosDiv.innerHTML = '<p class="text-xs" style="color: var(--text-muted); font-style: italic; padding: 1rem 0;">Nenhum romaneio recente pendente de conferência.</p>';
        } else {
          romaneiosDiv.innerHTML = stats.recentRomaneios.map(r => {
            const driver = r.driver?.user?.name || 'Motorista';
            const code = r.romaneioNumber || r.id.slice(0, 8);
            const statusBadge = getRomaneioStatusBadge(r.status);
            return '<div style="padding:0.6rem; border-radius:0.5rem; background:var(--bg-surface-elevated); border:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:space-between;">' +
              '<div>' +
                '<strong class="text-xs font-mono" style="color:var(--purple-base);">#' + code + '</strong>' +
                '<p class="text-xs text-muted">' + driver + ' &bull; ' + (r.deliveriesCount || 0) + ' entregas</p>' +
              '</div>' +
              '<div class="flex items-center gap-2">' +
                statusBadge +
                '<button onclick="openRomaneioDetails(\\'' + r.id + '\\')" class="btn btn-secondary btn-xs">Conferir</button>' +
              '</div>' +
            '</div>';
          }).join('');
        }
      }

      // Render recent occurrences
      const occurrencesDiv = document.getElementById('dashboard-recent-occurrences');
      if (occurrencesDiv) {
        if (!stats.recentOccurrences || stats.recentOccurrences.length === 0) {
          occurrencesDiv.innerHTML = '<p class="text-xs" style="color: var(--text-muted); font-style: italic; padding: 1rem 0;">Nenhuma ocorrência recente registrada.</p>';
        } else {
          occurrencesDiv.innerHTML = stats.recentOccurrences.map(occ => {
            const driver = occ.driver?.user?.name || 'Motorista';
            const code = occ.trip?.tripCode || '-';
            return '<div style="padding:0.6rem; border-radius:0.5rem; background:var(--bg-surface-elevated); border:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:space-between;">' +
              '<div>' +
                '<strong class="text-xs" style="color:var(--amber-base);">' + (occ.title || occ.type) + '</strong>' +
                '<p class="text-xs text-muted">Viagem #' + code + ' &bull; ' + driver + '</p>' +
              '</div>' +
              '<div class="flex items-center gap-2">' +
                '<span class="badge badge-warning text-xs">' + occ.status + '</span>' +
                '<button onclick="openOccurrenceDetails(\\'' + occ.id + '\\')" class="btn btn-secondary btn-xs">Tratar</button>' +
              '</div>' +
            '</div>';
          }).join('');
        }
      }

      renderIcons();
    } catch (err) {
      showToast('Erro ao carregar Dashboard: ' + err.message, 'error');
    }
  }

  // ==============================================
  // 2. MOTORISTAS / USUÁRIOS CONTROLLER
  // ==============================================
  async function loadUsers() {
    try {
      const users = await apiFetch('/api/v1/admin/users');
      STATE.users = users;
      renderUsersTable();
    } catch (err) {
      showToast('Erro ao carregar motoristas: ' + err.message, 'error');
    }
  }

  function renderUsersTable() {
    const tbody = document.getElementById('drivers-table-body');
    if (!tbody) return;

    const searchTerm = (document.getElementById('driver-search-input')?.value || '').toLowerCase().trim();
    const roleFilter = document.getElementById('driver-role-filter')?.value || '';
    const statusFilter = document.getElementById('driver-status-filter')?.value || '';

    const filtered = STATE.users.filter(u => {
      const matchRole = !roleFilter || u.role === roleFilter;
      const matchStatus = !statusFilter || u.status === statusFilter;
      
      const searchStr = (u.name + ' ' + (u.cpf || '') + ' ' + (u.phone || '') + ' ' + (u.driver?.cnh || '') + ' ' + (u.driver?.rntrc || '')).toLowerCase();
      const matchSearch = !searchTerm || searchStr.includes(searchTerm);

      return matchRole && matchStatus && matchSearch;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 2rem; color: var(--text-muted);">Nenhum usuário ou motorista encontrado com os filtros aplicados.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(u => {
      const isDriver = u.role === 'DRIVER';
      const driver = u.driver;
      const currentAssignment = driver?.assignments?.find(a => a.isCurrent);
      const currentVehicle = currentAssignment?.vehicle;

      let vehicleBadge = '<span class="text-xs text-muted">Nenhum</span>';
      if (currentVehicle) {
        vehicleBadge = '<span class="badge badge-cyan font-mono">' + currentVehicle.plate + ' (' + (currentVehicle.model || 'Veículo') + ')</span>';
      } else if (isDriver) {
        vehicleBadge = '<span class="badge badge-danger">Sem Veículo</span>';
      }

      let roleBadge = '<span class="badge badge-muted">' + u.role + '</span>';
      if (u.role === 'ADMIN') roleBadge = '<span class="badge badge-danger">ADMIN</span>';
      if (u.role === 'MANAGER') roleBadge = '<span class="badge badge-warning">MANAGER</span>';
      if (u.role === 'DRIVER') roleBadge = '<span class="badge badge-brand">MOTORISTA</span>';

      let statusBadge = '<span class="badge badge-success">ATIVO</span>';
      if (u.status === 'INACTIVE') statusBadge = '<span class="badge badge-muted">INATIVO</span>';
      if (u.status === 'BLOCKED') statusBadge = '<span class="badge badge-danger">BLOQUEADO</span>';

      const cnhInfo = driver?.cnh ? (driver.cnh + (driver.cnhCategory ? ' (' + driver.cnhCategory + ')' : '')) : '-';
      const rntrcInfo = driver?.rntrc ? 'RNTRC: ' + driver.rntrc : '';

      return '<tr>' +
        '<td>' +
          '<strong>' + (u.name || '-') + '</strong>' +
          '<div style="margin-top:2px;">' + roleBadge + '</div>' +
        '</td>' +
        '<td>' +
          '<span class="font-mono text-xs">' + formatCPF(u.cpf) + '</span>' +
          '<div class="text-xs text-muted">' + formatPhone(u.phone) + '</div>' +
        '</td>' +
        '<td>' +
          '<span class="font-mono text-xs">' + cnhInfo + '</span>' +
          (rntrcInfo ? '<div class="text-xs text-muted">' + rntrcInfo + '</div>' : '') +
        '</td>' +
        '<td>' + vehicleBadge + '</td>' +
        '<td>' + statusBadge + '</td>' +
        '<td class="text-right">' +
          '<div class="flex items-center justify-end gap-1">' +
            (isDriver && driver ? '<button onclick="openDriverDetailsModal(\\'' + driver.id + '\\')" class="btn btn-secondary btn-sm" title="Ver Detalhes">Detalhes</button>' : '') +
            (isDriver && driver ? '<button onclick="openAssignVehicleModal(\\'' + driver.id + '\\', \\'' + u.name.replace(/'/g, "\\\\'") + '\\')" class="btn btn-cyan btn-sm" title="Alocar Veículo">Veículo</button>' : '') +
            '<button onclick="openEditUserModal(\\'' + u.id + '\\')" class="btn btn-secondary btn-icon" title="Editar Usuário"><span data-lucide="edit-2" class="icon-xs"></span></button>' +
            '<button onclick="openResetPasswordModal(\\'' + u.id + '\\', \\'' + u.name.replace(/'/g, "\\\\'") + '\\')" class="btn btn-ghost-warning btn-icon" title="Redefinir Senha"><span data-lucide="key" class="icon-xs"></span></button>' +
            '<button onclick="toggleUserStatus(\\'' + u.id + '\\', \\'' + u.status + '\\')" class="btn ' + (u.status === 'ACTIVE' ? 'btn-ghost-danger' : 'btn-ghost-success') + ' btn-icon" title="' + (u.status === 'ACTIVE' ? 'Desativar' : 'Ativar') + '">' +
              '<span data-lucide="' + (u.status === 'ACTIVE' ? 'x' : 'check-circle') + '" class="icon-xs"></span>' +
            '</button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join('');

    renderIcons();
  }

  // DETALHES DO MOTORISTA
  async function openDriverDetailsModal(driverId) {
    try {
      const data = await apiFetch('/api/v1/admin/users/drivers/' + driverId + '/details');
      const driver = data.driver;
      const user = driver.user;

      document.getElementById('driver-detail-name').innerText = user?.name || 'Motorista #' + driver.id.slice(0, 8);
      document.getElementById('driver-detail-sub').innerText = (user?.role || 'DRIVER') + ' &bull; Cadastrado em ' + formatDate(driver.createdAt);

      document.getElementById('driver-detail-cpf').innerText = formatCPF(user?.cpf);
      document.getElementById('driver-detail-phone').innerText = formatPhone(user?.phone);
      document.getElementById('driver-detail-cnh').innerText = (driver.cnh || '-') + (driver.cnhCategory ? ' (' + driver.cnhCategory + ')' : '');
      document.getElementById('driver-detail-rntrc').innerText = driver.rntrc || '-';

      const currentAssignment = driver.assignments?.find(a => a.isCurrent);
      const vehicleEl = document.getElementById('driver-detail-current-vehicle');
      const actionsEl = document.getElementById('driver-detail-vehicle-actions');

      if (currentAssignment?.vehicle) {
        vehicleEl.innerHTML = '<span class="font-mono">' + currentAssignment.vehicle.plate + '</span> &bull; ' + (currentAssignment.vehicle.brand || '') + ' ' + (currentAssignment.vehicle.model || '') + ' <span class="badge badge-success text-xs">Vinculado desde ' + formatDate(currentAssignment.startAt) + '</span>';
        actionsEl.innerHTML = '<button onclick="handleUnassignVehicle(\\'' + driver.id + '\\')" class="btn btn-ghost-danger btn-sm">Desvincular</button>' +
                              '<button onclick="openAssignVehicleModal(\\'' + driver.id + '\\', \\'' + (user?.name || '').replace(/'/g, "\\\\'") + '\\')" class="btn btn-cyan btn-sm">Trocar Veículo</button>';
      } else {
        vehicleEl.innerHTML = '<span style="color:var(--rose-base);">Nenhum veículo vinculado atualmente.</span>';
        actionsEl.innerHTML = '<button onclick="openAssignVehicleModal(\\'' + driver.id + '\\', \\'' + (user?.name || '').replace(/'/g, "\\\\'") + '\\')" class="btn btn-cyan btn-sm">Vincular Veículo</button>';
      }

      // Vehicle assignments history
      const assignTbody = document.getElementById('driver-detail-assignments-table');
      if (assignTbody) {
        const assignments = driver.assignments || [];
        if (assignments.length === 0) {
          assignTbody.innerHTML = '<tr><td colspan="5" class="text-center text-xs" style="padding:1rem; color:var(--text-muted);">Sem registros de vínculo de frota.</td></tr>';
        } else {
          assignTbody.innerHTML = assignments.map(a => {
            const v = a.vehicle;
            const status = a.isCurrent ? '<span class="badge badge-success text-xs">ATUAL</span>' : '<span class="badge badge-muted text-xs">ENCERRADO</span>';
            return '<tr>' +
              '<td><strong class="font-mono text-xs">' + (v?.plate || '-') + '</strong></td>' +
              '<td class="text-xs">' + (v?.model || '-') + '</td>' +
              '<td class="text-xs">' + formatDate(a.startAt) + '</td>' +
              '<td class="text-xs">' + formatDate(a.endAt) + '</td>' +
              '<td>' + status + '</td>' +
            '</tr>';
          }).join('');
        }
      }

      // Recent trips history
      const tripsTbody = document.getElementById('driver-detail-trips-table');
      if (tripsTbody) {
        const trips = driver.trips || [];
        if (trips.length === 0) {
          tripsTbody.innerHTML = '<tr><td colspan="4" class="text-center text-xs" style="padding:1rem; color:var(--text-muted);">Nenhuma viagem associada a este motorista.</td></tr>';
        } else {
          tripsTbody.innerHTML = trips.map(t => {
            return '<tr>' +
              '<td><strong class="font-mono text-xs" style="color:var(--brand-light);">' + (t.tripCode || t.id.slice(0,8)) + '</strong></td>' +
              '<td class="text-xs truncate" style="max-width:180px;">' + (t.origin || 'Origem') + ' &rarr; ' + (t.destination || 'Destino') + '</td>' +
              '<td>' + getTripStatusBadge(t.status) + '</td>' +
              '<td class="text-xs">' + formatDate(t.createdAt) + '</td>' +
            '</tr>';
          }).join('');
        }
      }

      openModal('modal-driver-details');
    } catch (err) {
      showToast('Erro ao abrir detalhes do motorista: ' + err.message, 'error');
    }
  }

  // ALOCAR VEÍCULO AO MOTORISTA
  async function openAssignVehicleModal(driverId, driverName) {
    document.getElementById('assign-driver-id').value = driverId;
    document.getElementById('assign-driver-name').innerText = driverName || 'Motorista';

    const select = document.getElementById('assign-vehicle-select');
    select.innerHTML = '<option value="">Carregando frota...</option>';

    try {
      const vehicles = await apiFetch('/api/v1/admin/vehicles');
      select.innerHTML = '<option value="">Selecione um veículo...</option>' +
        vehicles.map(v => {
          const currentDriver = v.assignments?.find(a => a.isCurrent)?.driver?.user?.name;
          const statusSuffix = currentDriver ? ' (Em uso por: ' + currentDriver + ')' : ' (' + v.status + ')';
          return '<option value="' + v.id + '">' + v.plate + ' - ' + (v.model || 'Veículo') + statusSuffix + '</option>';
        }).join('');

      openModal('modal-assign-vehicle');
    } catch (err) {
      showToast('Erro ao carregar veículos para alocação: ' + err.message, 'error');
    }
  }

  async function handleAssignVehicleSubmit(e) {
    if (e) e.preventDefault();
    const driverId = document.getElementById('assign-driver-id').value;
    const vehicleId = document.getElementById('assign-vehicle-select').value;

    if (!driverId || !vehicleId) {
      showToast('Selecione um veículo para continuar', 'error');
      return;
    }

    try {
      await apiFetch('/api/v1/admin/users/drivers/' + driverId + '/assign-vehicle', {
        method: 'POST',
        body: JSON.stringify({ vehicleId })
      });
      showToast('Veículo alocado com sucesso!', 'success');
      closeModal('modal-assign-vehicle');
      closeModal('modal-driver-details');
      refreshCurrentView();
    } catch (err) {
      showToast('Erro ao alocar veículo: ' + err.message, 'error');
    }
  }

  async function handleUnassignVehicle(driverId) {
    if (!confirm('Deseja realmente desvincular o veículo deste motorista?')) return;
    try {
      await apiFetch('/api/v1/admin/users/drivers/' + driverId + '/unassign-vehicle', {
        method: 'POST'
      });
      showToast('Veículo desvinculado com sucesso!', 'success');
      closeModal('modal-driver-details');
      refreshCurrentView();
    } catch (err) {
      showToast('Erro ao desvincular veículo: ' + err.message, 'error');
    }
  }

  // CRUD USUÁRIOS / MOTORISTAS
  function handleRoleChange() {
    const role = document.getElementById('user-form-role').value;
    const driverSection = document.getElementById('driver-fields-section');
    if (role === 'DRIVER') {
      driverSection.classList.remove('hidden');
    } else {
      driverSection.classList.add('hidden');
    }
  }

  async function openCreateUserModal(defaultRole = 'DRIVER') {
    document.getElementById('modal-user-title').innerText = 'Novo Usuário / Motorista';
    document.getElementById('user-form-id').value = '';
    document.getElementById('user-form-name').value = '';
    document.getElementById('user-form-cpf').value = '';
    document.getElementById('user-form-phone').value = '';
    document.getElementById('user-form-password').value = '';
    document.getElementById('user-form-role').value = defaultRole;
    document.getElementById('user-form-status').value = 'ACTIVE';
    document.getElementById('user-form-cnh').value = '';
    document.getElementById('user-form-cnh-cat').value = '';
    document.getElementById('user-form-rntrc').value = '';

    document.getElementById('user-form-pwd-container').classList.remove('hidden');
    document.getElementById('user-form-password').required = true;
    document.getElementById('erp-detection-alert').classList.add('hidden');

    handleRoleChange();
    await populateVehiclesDropdown('user-form-vehicle');
    openModal('modal-user');
  }

  async function openEditUserModal(userId) {
    const u = STATE.users.find(x => x.id === userId);
    if (!u) return;

    document.getElementById('modal-user-title').innerText = 'Editar Usuário';
    document.getElementById('user-form-id').value = u.id;
    document.getElementById('user-form-name').value = u.name || '';
    document.getElementById('user-form-cpf').value = u.cpf || '';
    document.getElementById('user-form-phone').value = u.phone || '';
    document.getElementById('user-form-role').value = u.role || 'DRIVER';
    document.getElementById('user-form-status').value = u.status || 'ACTIVE';

    document.getElementById('user-form-pwd-container').classList.add('hidden');
    document.getElementById('user-form-password').required = false;
    document.getElementById('erp-detection-alert').classList.add('hidden');

    if (u.driver) {
      document.getElementById('user-form-cnh').value = u.driver.cnh || '';
      document.getElementById('user-form-cnh-cat').value = u.driver.cnhCategory || '';
      document.getElementById('user-form-rntrc').value = u.driver.rntrc || '';
    }

    handleRoleChange();
    await populateVehiclesDropdown('user-form-vehicle', u.driver?.assignments?.find(a => a.isCurrent)?.vehicleId);
    openModal('modal-user');
  }

  async function populateVehiclesDropdown(selectId, selectedId = '') {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    try {
      const vehicles = await apiFetch('/api/v1/admin/vehicles');
      sel.innerHTML = '<option value="">Nenhum veículo vinculado</option>' +
        vehicles.map(v => '<option value="' + v.id + '" ' + (v.id === selectedId ? 'selected' : '') + '>' + v.plate + ' - ' + (v.model || 'Veículo') + ' (' + v.status + ')</option>').join('');
    } catch {
      sel.innerHTML = '<option value="">Erro ao carregar veículos</option>';
    }
  }

  async function handleUserSubmit(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('user-form-id').value;
    const name = document.getElementById('user-form-name').value.trim();
    const cpf = document.getElementById('user-form-cpf').value.trim();
    const phone = document.getElementById('user-form-phone').value.trim();
    const role = document.getElementById('user-form-role').value;
    const status = document.getElementById('user-form-status').value;
    const password = document.getElementById('user-form-password').value;

    const payload = { name, cpf, phone, role, status };

    if (role === 'DRIVER') {
      payload.cnh = document.getElementById('user-form-cnh').value.trim() || undefined;
      payload.cnhCategory = document.getElementById('user-form-cnh-cat').value || undefined;
      payload.rntrc = document.getElementById('user-form-rntrc').value.trim() || undefined;
      payload.vehicleId = document.getElementById('user-form-vehicle').value || undefined;
    }

    try {
      if (id) {
        await apiFetch('/api/v1/admin/users/' + id, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        showToast('Usuário atualizado com sucesso!', 'success');
      } else {
        if (!password) {
          showToast('A senha inicial é obrigatória', 'error');
          return;
        }
        payload.password = password;
        await apiFetch('/api/v1/admin/users', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast('Usuário cadastrado com sucesso!', 'success');
      }

      closeModal('modal-user');
      refreshCurrentView();
    } catch (err) {
      showToast('Erro ao salvar usuário: ' + err.message, 'error');
    }
  }

  async function toggleUserStatus(userId, currentStatus) {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const actionLabel = newStatus === 'ACTIVE' ? 'ativar' : 'desativar';
    if (!confirm('Deseja realmente ' + actionLabel + ' este usuário?')) return;

    try {
      await apiFetch('/api/v1/admin/users/' + userId + '/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      showToast('Status alterado para ' + newStatus, 'success');
      refreshCurrentView();
    } catch (err) {
      showToast('Erro ao alterar status: ' + err.message, 'error');
    }
  }

  function openResetPasswordModal(userId, userName) {
    document.getElementById('reset-pwd-user-id').value = userId;
    document.getElementById('reset-pwd-username').innerText = userName;
    document.getElementById('reset-new-password').value = '';
    document.getElementById('reset-confirm-password').value = '';
    openModal('modal-reset-pwd');
  }

  async function handleResetPasswordSubmit(e) {
    if (e) e.preventDefault();
    const userId = document.getElementById('reset-pwd-user-id').value;
    const newPassword = document.getElementById('reset-new-password').value;
    const confirmPwd = document.getElementById('reset-confirm-password').value;

    if (newPassword !== confirmPwd) {
      showToast('As senhas digitadas não coincidem!', 'error');
      return;
    }

    try {
      await apiFetch('/api/v1/admin/users/' + userId + '/reset-password', {
        method: 'POST',
        body: JSON.stringify({ newPassword })
      });
      showToast('Senha redefinida com sucesso!', 'success');
      closeModal('modal-reset-pwd');
    } catch (err) {
      showToast('Erro ao redefinir senha: ' + err.message, 'error');
    }
  }

  // ==============================================
  // 3. VEÍCULOS CONTROLLER
  // ==============================================
  async function loadVehicles() {
    try {
      const vehicles = await apiFetch('/api/v1/admin/vehicles');
      STATE.vehicles = vehicles;
      renderVehiclesTable();
    } catch (err) {
      showToast('Erro ao carregar veículos: ' + err.message, 'error');
    }
  }

  function renderVehiclesTable() {
    const tbody = document.getElementById('vehicles-table-body');
    if (!tbody) return;

    const searchTerm = (document.getElementById('vehicle-search-input')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('vehicle-status-filter')?.value || '';

    const filtered = STATE.vehicles.filter(v => {
      const matchStatus = !statusFilter || v.status === statusFilter;
      const searchStr = (v.plate + ' ' + (v.model || '') + ' ' + (v.brand || '')).toLowerCase();
      const matchSearch = !searchTerm || searchStr.includes(searchTerm);
      return matchStatus && matchSearch;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 2rem; color: var(--text-muted);">Nenhum veículo encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(v => {
      const currentAssignment = v.assignments?.find(a => a.isCurrent);
      const currentDriver = currentAssignment?.driver?.user;

      let statusBadge = '<span class="badge badge-success">DISPONÍVEL</span>';
      if (v.status === 'EM_USO') statusBadge = '<span class="badge badge-brand">EM USO</span>';
      if (v.status === 'EM_VIAGEM') statusBadge = '<span class="badge badge-cyan">EM VIAGEM</span>';
      if (v.status === 'MANUTENCAO') statusBadge = '<span class="badge badge-warning">MANUTENÇÃO</span>';
      if (v.status === 'INATIVO') statusBadge = '<span class="badge badge-danger">INATIVO</span>';

      let driverInfo = '<span class="text-xs text-muted">Sem motorista</span>';
      if (currentDriver) {
        driverInfo = '<strong>' + currentDriver.name + '</strong><div class="text-xs text-muted">' + formatPhone(currentDriver.phone) + '</div>';
      }

      return '<tr>' +
        '<td><strong class="font-mono text-sm" style="color:var(--cyan-base);">' + v.plate + '</strong></td>' +
        '<td><strong>' + (v.model || '-') + '</strong><div class="text-xs text-muted">' + (v.brand || '-') + '</div></td>' +
        '<td>' + (v.year || '-') + '</td>' +
        '<td>' + statusBadge + '</td>' +
        '<td>' + driverInfo + '</td>' +
        '<td class="text-right">' +
          '<div class="flex items-center justify-end gap-1">' +
            '<button onclick="openVehicleDetailsModal(\\'' + v.id + '\\')" class="btn btn-secondary btn-sm">Detalhes</button>' +
            '<button onclick="openEditVehicleModal(\\'' + v.id + '\\')" class="btn btn-secondary btn-icon" title="Editar"><span data-lucide="edit-2" class="icon-xs"></span></button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join('');

    renderIcons();
  }

  function openCreateVehicleModal() {
    document.getElementById('modal-vehicle-title').innerText = 'Novo Veículo';
    document.getElementById('vehicle-form-id').value = '';
    document.getElementById('vehicle-form-plate').value = '';
    document.getElementById('vehicle-form-model').value = '';
    document.getElementById('vehicle-form-brand').value = '';
    document.getElementById('vehicle-form-year').value = '';
    document.getElementById('vehicle-form-status').value = 'DISPONIVEL';
    openModal('modal-vehicle');
  }

  function openEditVehicleModal(vehicleId) {
    const v = STATE.vehicles.find(x => x.id === vehicleId);
    if (!v) return;

    document.getElementById('modal-vehicle-title').innerText = 'Editar Veículo';
    document.getElementById('vehicle-form-id').value = v.id;
    document.getElementById('vehicle-form-plate').value = v.plate;
    document.getElementById('vehicle-form-model').value = v.model || '';
    document.getElementById('vehicle-form-brand').value = v.brand || '';
    document.getElementById('vehicle-form-year').value = v.year || '';
    document.getElementById('vehicle-form-status').value = v.status || 'DISPONIVEL';
    openModal('modal-vehicle');
  }

  async function handleVehicleSubmit(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('vehicle-form-id').value;
    const plate = document.getElementById('vehicle-form-plate').value.trim().toUpperCase();
    const model = document.getElementById('vehicle-form-model').value.trim();
    const brand = document.getElementById('vehicle-form-brand').value.trim();
    const yearStr = document.getElementById('vehicle-form-year').value;
    const status = document.getElementById('vehicle-form-status').value;

    const payload = {
      plate,
      model,
      brand,
      year: yearStr ? parseInt(yearStr, 10) : undefined,
      status
    };

    try {
      if (id) {
        await apiFetch('/api/v1/admin/vehicles/' + id, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        showToast('Veículo atualizado com sucesso!', 'success');
      } else {
        await apiFetch('/api/v1/admin/vehicles', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast('Veículo cadastrado com sucesso!', 'success');
      }
      closeModal('modal-vehicle');
      refreshCurrentView();
    } catch (err) {
      showToast('Erro ao salvar veículo: ' + err.message, 'error');
    }
  }

  async function openVehicleDetailsModal(vehicleId) {
    try {
      const v = await apiFetch('/api/v1/admin/vehicles/' + vehicleId);
      document.getElementById('vehicle-detail-plate').innerText = v.plate;
      document.getElementById('vehicle-detail-model').innerText = (v.brand || '') + ' ' + (v.model || '');
      document.getElementById('vehicle-detail-brandmodel').innerText = (v.brand || '-') + ' / ' + (v.model || '-');
      document.getElementById('vehicle-detail-year').innerText = v.year || '-';
      document.getElementById('vehicle-detail-status').innerText = v.status;

      const assignTbody = document.getElementById('vehicle-detail-assignments-table');
      if (assignTbody) {
        const assignments = v.assignments || [];
        if (assignments.length === 0) {
          assignTbody.innerHTML = '<tr><td colspan="5" class="text-center text-xs" style="padding:1rem; color:var(--text-muted);">Sem registros de motoristas alocados.</td></tr>';
        } else {
          assignTbody.innerHTML = assignments.map(a => {
            const d = a.driver?.user;
            const status = a.isCurrent ? '<span class="badge badge-success text-xs">ATUAL</span>' : '<span class="badge badge-muted text-xs">ENCERRADO</span>';
            return '<tr>' +
              '<td><strong>' + (d?.name || 'Motorista #' + a.driverId.slice(0,6)) + '</strong></td>' +
              '<td class="text-xs">' + formatPhone(d?.phone) + '</td>' +
              '<td class="text-xs">' + formatDate(a.startAt) + '</td>' +
              '<td class="text-xs">' + formatDate(a.endAt) + '</td>' +
              '<td>' + status + '</td>' +
            '</tr>';
          }).join('');
        }
      }

      const tripsTbody = document.getElementById('vehicle-detail-trips-table');
      if (tripsTbody) {
        const trips = v.trips || [];
        if (trips.length === 0) {
          tripsTbody.innerHTML = '<tr><td colspan="4" class="text-center text-xs" style="padding:1rem; color:var(--text-muted);">Nenhuma viagem registrada com este veículo.</td></tr>';
        } else {
          tripsTbody.innerHTML = trips.map(t => {
            return '<tr>' +
              '<td><strong class="font-mono text-xs" style="color:var(--brand-light);">' + (t.tripCode || t.id.slice(0,8)) + '</strong></td>' +
              '<td class="text-xs">' + (t.driver?.user?.name || '-') + '</td>' +
              '<td class="text-xs truncate" style="max-width:180px;">' + (t.origin || 'Origem') + ' &rarr; ' + (t.destination || 'Destino') + '</td>' +
              '<td>' + getTripStatusBadge(t.status) + '</td>' +
            '</tr>';
          }).join('');
        }
      }

      openModal('modal-vehicle-details');
    } catch (err) {
      showToast('Erro ao carregar detalhes do veículo: ' + err.message, 'error');
    }
  }

  // ==============================================
  // 4. VIAGENS / ROTAS OPERACIONAIS CONTROLLER
  // ==============================================
  async function loadTrips() {
    try {
      const [trips, drivers, vehicles] = await Promise.all([
        apiFetch('/api/v1/admin/trips'),
        apiFetch('/api/v1/admin/drivers').catch(() => []),
        apiFetch('/api/v1/admin/vehicles').catch(() => [])
      ]);
      STATE.trips = Array.isArray(trips) ? trips : [];
      STATE.drivers = Array.isArray(drivers) ? drivers : [];
      STATE.vehicles = Array.isArray(vehicles) ? vehicles : [];

      // Populate driver filter select
      const driverFilterEl = document.getElementById('trip-driver-filter');
      if (driverFilterEl) {
        const currentVal = driverFilterEl.value;
        const driverOptions = STATE.drivers.map(d => {
          const name = d.user?.name || d.name || 'Motorista #' + d.id.slice(0, 5);
          return '<option value="' + d.id + '">' + name + '</option>';
        }).join('');
        driverFilterEl.innerHTML = '<option value="">Todos os Motoristas</option>' + driverOptions;
        driverFilterEl.value = currentVal;
      }

      renderTripsTable();
    } catch (err) {
      showToast('Erro ao carregar viagens: ' + err.message, 'error');
    }
  }

  function setTripDateQuickFilter(type) {
    STATE.tripDateQuickFilter = type;
    const today = new Date();
    const pad = n => String(n).padStart(2, '0');
    const todayStr = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.getFullYear() + '-' + pad(tomorrow.getMonth() + 1) + '-' + pad(tomorrow.getDate());

    const startInput = document.getElementById('trip-start-date');
    const endInput = document.getElementById('trip-end-date');

    document.querySelectorAll('#btn-quick-today, #btn-quick-tomorrow, #btn-quick-all').forEach(btn => btn.classList.remove('active'));

    if (type === 'today') {
      if (startInput) startInput.value = todayStr;
      if (endInput) endInput.value = todayStr;
      document.getElementById('btn-quick-today')?.classList.add('active');
    } else if (type === 'tomorrow') {
      if (startInput) startInput.value = tomorrowStr;
      if (endInput) endInput.value = tomorrowStr;
      document.getElementById('btn-quick-tomorrow')?.classList.add('active');
    } else {
      if (startInput) startInput.value = '';
      if (endInput) endInput.value = '';
      document.getElementById('btn-quick-all')?.classList.add('active');
    }

    renderTripsTable();
  }

  function getTripStatusBadge(status) {
    if (status === 'IN_PROGRESS') return '<span class="badge badge-brand"><span class="spinner" style="width:8px;height:8px;"></span> EM ANDAMENTO</span>';
    if (status === 'COMPLETED') return '<span class="badge badge-success">CONCLUÍDA</span>';
    if (status === 'ASSIGNED') return '<span class="badge badge-purple">ATRIBUÍDA</span>';
    if (status === 'PENDING') return '<span class="badge badge-warning">RASCUNHO / PENDENTE</span>';
    if (status === 'ACCEPTED') return '<span class="badge badge-cyan">ACEITA</span>';
    if (status === 'CANCELLED') return '<span class="badge badge-danger">CANCELADA</span>';
    return '<span class="badge badge-muted">' + (status || '-') + '</span>';
  }

  function renderTripsTable() {
    const tbody = document.getElementById('trips-table-body');
    if (!tbody) return;

    const searchTerm = (document.getElementById('trip-search-input')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('trip-status-filter')?.value || '';
    const driverFilter = document.getElementById('trip-driver-filter')?.value || '';
    const startDateFilter = document.getElementById('trip-start-date')?.value || '';
    const endDateFilter = document.getElementById('trip-end-date')?.value || '';

    const filtered = STATE.trips.filter(t => {
      const matchStatus = !statusFilter || t.status === statusFilter;
      const matchDriver = !driverFilter || t.driverId === driverFilter;
      
      const searchStr = (
        (t.tripCode || '') + ' ' + 
        (t.origin || '') + ' ' + 
        (t.destination || '') + ' ' + 
        (t.driver?.user?.name || t.driver?.name || '') + ' ' + 
        (t.vehicle?.plate || '')
      ).toLowerCase();
      const matchSearch = !searchTerm || searchStr.includes(searchTerm);

      // Date filtering
      let matchDate = true;
      if (startDateFilter || endDateFilter) {
        const tripDateStr = (t.startDate || t.createdAt || '').slice(0, 10);
        if (startDateFilter && tripDateStr < startDateFilter) matchDate = false;
        if (endDateFilter && tripDateStr > endDateFilter) matchDate = false;
      }

      return matchStatus && matchDriver && matchSearch && matchDate;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center" style="padding: 2.5rem; color: var(--text-muted);">' +
        '<div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🚚</div>' +
        '<strong>Nenhuma viagem encontrada com os filtros selecionados.</strong><br>' +
        '<span class="text-xs">Clique no botão superior <strong>+ NOVA VIAGEM / ROTA</strong> para criar e despachar uma rota.</span>' +
      '</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(t => {
      const driverName = t.driver?.user?.name || t.driver?.name || '<span class="text-xs" style="color:var(--text-muted); font-style:italic;">Não atribuído</span>';
      const plate = t.vehicle?.plate ? '<span class="font-mono badge badge-cyan">' + t.vehicle.plate + '</span>' : '<span class="text-xs text-muted">Sem veículo</span>';
      const totalDeliveries = Array.isArray(t.deliveries) ? t.deliveries.length : 0;
      const completedDeliveries = Array.isArray(t.deliveries) ? t.deliveries.filter(d => d.status === 'DELIVERED' || d.status === 'COMPLETED').length : 0;
      const deliveriesBadge = totalDeliveries > 0 
        ? '<span class="badge ' + (completedDeliveries === totalDeliveries ? 'badge-success' : 'badge-brand') + ' font-mono text-xs">' + completedDeliveries + '/' + totalDeliveries + ' entregas</span>' 
        : '<span class="text-xs text-muted">0 paradas</span>';

      const lastUpdated = t.updatedAt ? formatDate(t.updatedAt) : formatDate(t.createdAt);

      return '<tr>' +
        '<td>' +
          '<div class="flex items-center gap-1.5">' +
            '<strong class="font-mono text-sm" style="color:var(--brand-light);">' + (t.tripCode || t.id.slice(0,8)) + '</strong>' +
          '</div>' +
        '</td>' +
        '<td>' +
          '<div class="text-xs font-semibold">' + formatDate(t.startDate || t.createdAt) + '</div>' +
        '</td>' +
        '<td><strong>' + driverName + '</strong></td>' +
        '<td>' + plate + '</td>' +
        '<td>' +
          '<div class="text-xs"><strong>De:</strong> ' + (t.origin || 'CD Principal') + '</div>' +
          '<div class="text-xs text-muted"><strong>Para:</strong> ' + (t.destination || (totalDeliveries + ' Parada(s)')) + '</div>' +
        '</td>' +
        '<td>' + deliveriesBadge + '</td>' +
        '<td>' + getTripStatusBadge(t.status) + '</td>' +
        '<td class="text-xs font-mono text-muted">' + lastUpdated + '</td>' +
        '<td class="text-right">' +
          '<div class="flex items-center justify-end gap-1.5">' +
            '<button onclick="openTripDetailsModal(\\'' + t.id + '\\')" class="btn btn-secondary btn-sm" title="Ver Detalhes Completos">Detalhes</button>' +
            (t.status === 'PENDING' ? '<button onclick="handleQuickDispatchTrip(\\'' + t.id + '\\')" class="btn btn-primary btn-sm" title="Despachar para Motorista"><span data-lucide="send" class="icon-xs"></span> Despachar</button>' : '') +
            (t.status === 'PENDING' ? '<button onclick="openEditTripModal(\\'' + t.id + '\\')" class="btn btn-secondary btn-sm" title="Editar"><span data-lucide="edit-2" class="icon-xs"></span></button>' : '') +
            (t.status === 'ASSIGNED' || t.status === 'ACCEPTED' ? '<button onclick="openReassignTripModal(\\'' + t.id + '\\')" class="btn btn-secondary btn-sm" title="Trocar Motorista"><span data-lucide="refresh-cw" class="icon-xs"></span> Trocar</button>' : '') +
            (t.status === 'ASSIGNED' || t.status === 'ACCEPTED' ? '<button onclick="openUnassignTripModal(\\'' + t.id + '\\')" class="btn btn-ghost-danger btn-sm" title="Retirar Atribuição"><span data-lucide="link-2-off" class="icon-xs"></span></button>' : '') +
            (t.status !== 'COMPLETED' && t.status !== 'CANCELLED' ? '<button onclick="openCancelTripModal(\\'' + t.id + '\\')" class="btn btn-ghost-danger btn-sm" title="Cancelar Viagem"><span data-lucide="alert-octagon" class="icon-xs"></span></button>' : '') +
            (t.status === 'PENDING' ? '<button onclick="handleDeleteTripDraft(\\'' + t.id + '\\')" class="btn btn-ghost-danger btn-sm" title="Excluir Rascunho"><span data-lucide="trash" class="icon-xs"></span></button>' : '') +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join('');

    renderIcons();
  }

  // ==============================================
  // STEPPER & FORM CONTROLLER (NOVA / EDITAR VIAGEM)
  // ==============================================
  function switchTripStep(targetStep) {
    // Validate required fields before advancing
    if (targetStep > 1) {
      const driverVal = document.getElementById('trip-form-driver')?.value;
      const vehicleVal = document.getElementById('trip-form-vehicle')?.value;
      if (!driverVal) {
        showToast('Selecione um motorista operacional para continuar.', 'warning');
        return;
      }
      if (!vehicleVal) {
        showToast('Selecione o veículo alocado para a rota.', 'warning');
        return;
      }
    }

    if (targetStep > 2) {
      const codeVal = document.getElementById('trip-form-code')?.value.trim();
      const dateVal = document.getElementById('trip-form-date')?.value;
      const originName = document.getElementById('trip-form-origin-name')?.value.trim();
      const originAddress = document.getElementById('trip-form-origin-address')?.value.trim();
      const originCity = document.getElementById('trip-form-origin-city')?.value.trim();
      const originState = document.getElementById('trip-form-origin-state')?.value.trim();

      if (!codeVal || !dateVal || !originName || !originAddress || !originCity || !originState) {
        showToast('Preencha os campos obrigatórios da Identificação e Origem.', 'warning');
        return;
      }
    }

    STATE.tripFormStep = targetStep;

    // Toggle step panes
    [1, 2, 3].forEach(step => {
      const pane = document.getElementById('trip-step-' + step);
      const tab = document.getElementById('step-tab-' + step);
      if (pane) pane.classList.toggle('hidden', step !== targetStep);
      if (tab) {
        if (step === targetStep) {
          tab.style.borderBottomColor = 'var(--brand-light)';
          tab.style.color = 'var(--text-primary)';
        } else {
          tab.style.borderBottomColor = 'transparent';
          tab.style.color = 'var(--text-muted)';
        }
      }
    });

    renderIcons();
  }

  async function openCreateTripModal() {
    STATE.tripFormStops = [];
    document.getElementById('trip-form-id').value = '';
    document.getElementById('modal-trip-form-title').innerText = 'Nova Viagem / Rota Operacional';

    // Auto-generate trip code
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const dateCode = now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate());
    const randCode = Math.floor(1000 + Math.random() * 9000);
    document.getElementById('trip-form-code').value = 'TRP-' + dateCode + '-' + randCode;
    document.getElementById('trip-form-date').value = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
    document.getElementById('trip-form-time').value = '08:00';
    document.getElementById('trip-form-notes').value = '';

    // Populate drivers
    populateTripFormDrivers();
    populateTripFormVehicles();

    // Reset warnings and driver info
    document.getElementById('trip-driver-warning-banner')?.classList.add('hidden');
    document.getElementById('trip-driver-info-box')?.classList.add('hidden');

    resetStopSubForm();
    renderTripStopsTable();
    switchTripStep(1);

    openModal('modal-trip-create');
  }

  async function openEditTripModal(tripId) {
    try {
      const trip = await apiFetch('/api/v1/admin/trips/' + tripId);
      document.getElementById('trip-form-id').value = trip.id;
      document.getElementById('modal-trip-form-title').innerText = 'Editar Viagem #' + (trip.tripCode || trip.id.slice(0, 8));

      populateTripFormDrivers(trip.driverId);
      populateTripFormVehicles(trip.vehicleId);

      document.getElementById('trip-form-code').value = trip.tripCode || '';
      document.getElementById('trip-form-date').value = (trip.startDate || trip.createdAt || '').slice(0, 10);
      document.getElementById('trip-form-time').value = '08:00';
      document.getElementById('trip-form-notes').value = trip.notes || '';

      // Set origin
      if (trip.originAddress) {
        document.getElementById('trip-form-origin-address').value = trip.originAddress;
        document.getElementById('trip-form-origin-number').value = trip.originNumber || '';
        document.getElementById('trip-form-origin-neighborhood').value = trip.originNeighborhood || '';
        document.getElementById('trip-form-origin-city').value = trip.originCity || '';
        document.getElementById('trip-form-origin-state').value = trip.originState || 'SP';
        document.getElementById('trip-form-origin-cep').value = trip.originZipCode || '';
      }

      // Convert deliveries/stops to tripFormStops
      STATE.tripFormStops = (trip.deliveries || []).map((d, index) => ({
        id: d.id,
        recipient: d.recipient || d.customerName || 'Destinatário',
        phone: d.recipientPhone || d.customerPhone || '',
        address: d.address || '',
        numberAddress: d.numberAddress || '',
        complement: d.complement || '',
        neighborhood: d.neighborhood || '',
        city: d.city || '',
        state: d.state || 'SP',
        zipCode: d.zipCode || '',
        volumeCount: d.volumeCount || 1,
        weight: d.weight || null,
        invoiceNumber: d.invoiceNumber || '',
        invoiceKey: d.invoiceKey || '',
        notes: d.notes || '',
        sequence: d.sequence || (index + 1)
      }));

      resetStopSubForm();
      renderTripStopsTable();
      switchTripStep(1);

      openModal('modal-trip-create');
    } catch (err) {
      showToast('Erro ao carregar dados da viagem para edição: ' + err.message, 'error');
    }
  }

  function populateTripFormDrivers(selectedDriverId = '') {
    const select = document.getElementById('trip-form-driver');
    if (!select) return;

    // Filter to active drivers
    const activeDrivers = STATE.drivers.filter(d => d.status === 'ACTIVE' || d.id === selectedDriverId);
    
    select.innerHTML = '<option value="">Selecione o motorista operacional...</option>' +
      activeDrivers.map(d => {
        const name = d.user?.name || d.name || 'Motorista #' + d.id.slice(0, 5);
        const sel = d.id === selectedDriverId ? ' selected' : '';
        return '<option value="' + d.id + '"' + sel + '>' + name + ' (' + (d.cpf || d.user?.phone || 'Sem CPF') + ')</option>';
      }).join('');
  }

  function populateTripFormVehicles(selectedVehicleId = '') {
    const select = document.getElementById('trip-form-vehicle');
    if (!select) return;

    select.innerHTML = '<option value="">Selecione o veículo alocado...</option>' +
      STATE.vehicles.map(v => {
        const sel = v.id === selectedVehicleId ? ' selected' : '';
        const driverName = v.currentDriver?.user?.name ? ' - Vinculado a ' + v.currentDriver.user.name : '';
        return '<option value="' + v.id + '"' + sel + '>' + v.plate + ' (' + (v.model || v.brand || 'Veículo') + driverName + ')</option>';
      }).join('');
  }

  function handleTripDriverSelectChange() {
    const driverId = document.getElementById('trip-form-driver')?.value;
    const warningEl = document.getElementById('trip-driver-warning-banner');
    const infoBox = document.getElementById('trip-driver-info-box');

    if (!driverId) {
      warningEl?.classList.add('hidden');
      infoBox?.classList.add('hidden');
      return;
    }

    const driver = STATE.drivers.find(d => d.id === driverId);
    if (!driver) return;

    // Driver details
    if (infoBox) {
      document.getElementById('trip-driver-info-cpf').innerText = driver.cpf || '-';
      document.getElementById('trip-driver-info-phone').innerText = driver.user?.phone || driver.phone || '-';
      document.getElementById('trip-driver-info-cnh').innerText = driver.cnh || driver.cnhNumber || '-';
      document.getElementById('trip-driver-info-rntrc').innerText = driver.rntrc || '-';
      infoBox.classList.remove('hidden');
    }

    // Auto-select linked vehicle if available
    const linkedVehicle = STATE.vehicles.find(v => v.currentDriverId === driverId || v.driverId === driverId);
    if (linkedVehicle) {
      const vehSelect = document.getElementById('trip-form-vehicle');
      if (vehSelect) vehSelect.value = linkedVehicle.id;
    }

    // Check if driver has an active trip
    const activeTrip = STATE.trips.find(t => t.driverId === driverId && (t.status === 'IN_PROGRESS' || t.status === 'ACCEPTED' || t.status === 'ASSIGNED'));
    if (activeTrip) {
      if (warningEl) {
        document.getElementById('trip-driver-warning-text').innerText = 
          'Atenção Operacional: Este motorista já possui a rota #' + (activeTrip.tripCode || activeTrip.id.slice(0, 8)) + ' em status ' + activeTrip.status + '.';
        warningEl.classList.remove('hidden');
      }
    } else {
      warningEl?.classList.add('hidden');
    }
  }

  function handleTripVehicleSelectChange() {
    // Check if vehicle has an active trip
    const vehicleId = document.getElementById('trip-form-vehicle')?.value;
    if (!vehicleId) return;

    const activeTrip = STATE.trips.find(t => t.vehicleId === vehicleId && (t.status === 'IN_PROGRESS' || t.status === 'ACCEPTED'));
    const warningEl = document.getElementById('trip-driver-warning-banner');
    if (activeTrip && warningEl) {
      document.getElementById('trip-driver-warning-text').innerText = 
        'Atenção: Este veículo já está em rota ativa na viagem #' + (activeTrip.tripCode || activeTrip.id.slice(0, 8)) + '.';
      warningEl.classList.remove('hidden');
    }
  }

  // ==============================================
  // STOPS SUB-FORM MANAGEMENT
  // ==============================================
  function resetStopSubForm() {
    document.getElementById('stop-edit-index').value = '-1';
    document.getElementById('stop-form-title').innerHTML = '<span data-lucide="plus-circle" class="icon-sm"></span><span>Adicionar Parada / Entrega à Rota</span>';
    document.getElementById('btn-save-stop-label').innerText = 'Inserir Parada';
    document.getElementById('btn-cancel-stop-edit')?.classList.add('hidden');

    document.getElementById('stop-form-recipient').value = '';
    document.getElementById('stop-form-phone').value = '';
    document.getElementById('stop-form-address').value = '';
    document.getElementById('stop-form-number').value = '';
    document.getElementById('stop-form-complement').value = '';
    document.getElementById('stop-form-neighborhood').value = '';
    document.getElementById('stop-form-city').value = '';
    document.getElementById('stop-form-state').value = 'SP';
    document.getElementById('stop-form-cep').value = '';
    document.getElementById('stop-form-volumes').value = '1';
    document.getElementById('stop-form-weight').value = '';
    document.getElementById('stop-form-nf').value = '';
    document.getElementById('stop-form-nf-key').value = '';
    document.getElementById('stop-form-notes').value = '';

    renderIcons();
  }

  function handleAddOrUpdateStop() {
    const recipient = document.getElementById('stop-form-recipient')?.value.trim();
    const address = document.getElementById('stop-form-address')?.value.trim();
    const numberAddress = document.getElementById('stop-form-number')?.value.trim();
    const neighborhood = document.getElementById('stop-form-neighborhood')?.value.trim();
    const city = document.getElementById('stop-form-city')?.value.trim();
    const state = (document.getElementById('stop-form-state')?.value.trim() || 'SP').toUpperCase();

    if (!recipient || !address || !numberAddress || !neighborhood || !city || !state) {
      showToast('Preencha os campos obrigatórios da parada (Destinatário, Endereço, Número, Bairro, Cidade e UF).', 'warning');
      return;
    }

    const editIndex = parseInt(document.getElementById('stop-edit-index')?.value || '-1', 10);
    const stopData = {
      recipient,
      phone: document.getElementById('stop-form-phone')?.value.trim() || '',
      address,
      numberAddress,
      complement: document.getElementById('stop-form-complement')?.value.trim() || '',
      neighborhood,
      city,
      state,
      zipCode: document.getElementById('stop-form-cep')?.value.trim() || '',
      volumeCount: parseInt(document.getElementById('stop-form-volumes')?.value || '1', 10) || 1,
      weight: parseFloat(document.getElementById('stop-form-weight')?.value || '') || null,
      invoiceNumber: document.getElementById('stop-form-nf')?.value.trim() || '',
      invoiceKey: document.getElementById('stop-form-nf-key')?.value.trim() || '',
      notes: document.getElementById('stop-form-notes')?.value.trim() || ''
    };

    if (editIndex >= 0 && editIndex < STATE.tripFormStops.length) {
      STATE.tripFormStops[editIndex] = { ...STATE.tripFormStops[editIndex], ...stopData };
      showToast('Parada #' + (editIndex + 1) + ' atualizada.', 'success');
    } else {
      stopData.sequence = STATE.tripFormStops.length + 1;
      STATE.tripFormStops.push(stopData);
      showToast('Parada adicionada à rota.', 'success');
    }

    resetStopSubForm();
    renderTripStopsTable();
  }

  function editStopInList(index) {
    const stop = STATE.tripFormStops[index];
    if (!stop) return;

    document.getElementById('stop-edit-index').value = index;
    document.getElementById('stop-form-title').innerHTML = '<span data-lucide="edit-2" class="icon-sm"></span><span>Editando Parada #' + (index + 1) + '</span>';
    document.getElementById('btn-save-stop-label').innerText = 'Salvar Alterações';
    document.getElementById('btn-cancel-stop-edit')?.classList.remove('hidden');

    document.getElementById('stop-form-recipient').value = stop.recipient || '';
    document.getElementById('stop-form-phone').value = stop.phone || '';
    document.getElementById('stop-form-address').value = stop.address || '';
    document.getElementById('stop-form-number').value = stop.numberAddress || '';
    document.getElementById('stop-form-complement').value = stop.complement || '';
    document.getElementById('stop-form-neighborhood').value = stop.neighborhood || '';
    document.getElementById('stop-form-city').value = stop.city || '';
    document.getElementById('stop-form-state').value = stop.state || 'SP';
    document.getElementById('stop-form-cep').value = stop.zipCode || '';
    document.getElementById('stop-form-volumes').value = stop.volumeCount || 1;
    document.getElementById('stop-form-weight').value = stop.weight || '';
    document.getElementById('stop-form-nf').value = stop.invoiceNumber || '';
    document.getElementById('stop-form-nf-key').value = stop.invoiceKey || '';
    document.getElementById('stop-form-notes').value = stop.notes || '';

    renderIcons();
    document.getElementById('stop-form-recipient')?.focus();
  }

  function removeStopFromList(index) {
    if (confirm('Deseja remover a parada #' + (index + 1) + ' da rota?')) {
      STATE.tripFormStops.splice(index, 1);
      // Re-index sequences
      STATE.tripFormStops.forEach((s, idx) => s.sequence = idx + 1);
      resetStopSubForm();
      renderTripStopsTable();
      showToast('Parada removida.', 'info');
    }
  }

  function moveStopUp(index) {
    if (index <= 0) return;
    const temp = STATE.tripFormStops[index];
    STATE.tripFormStops[index] = STATE.tripFormStops[index - 1];
    STATE.tripFormStops[index - 1] = temp;
    STATE.tripFormStops.forEach((s, idx) => s.sequence = idx + 1);
    renderTripStopsTable();
  }

  function moveStopDown(index) {
    if (index >= STATE.tripFormStops.length - 1) return;
    const temp = STATE.tripFormStops[index];
    STATE.tripFormStops[index] = STATE.tripFormStops[index + 1];
    STATE.tripFormStops[index + 1] = temp;
    STATE.tripFormStops.forEach((s, idx) => s.sequence = idx + 1);
    renderTripStopsTable();
  }

  function renderTripStopsTable() {
    const tbody = document.getElementById('trip-stops-table-body');
    const badge = document.getElementById('stops-summary-badge');
    const stepBadge = document.getElementById('trip-step-stops-count');

    const count = STATE.tripFormStops.length;
    if (badge) badge.innerText = count + ' parada(s) configurada(s)';
    if (stepBadge) stepBadge.innerText = count;

    if (!tbody) return;

    if (count === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-xs" style="padding: 1.75rem; color: var(--text-muted);">' +
        'Nenhuma parada adicionada ainda. Preencha o formulário acima para inserir paradas na rota.' +
      '</td></tr>';
      return;
    }

    tbody.innerHTML = STATE.tripFormStops.map((s, index) => {
      const fullAddress = [s.address, s.numberAddress, s.complement, s.neighborhood].filter(Boolean).join(', ');
      const weightVol = (s.weight ? s.weight + ' kg' : '-') + ' / ' + (s.volumeCount || 1) + ' vol';
      const nfStr = s.invoiceNumber ? '<span class="badge badge-brand font-mono text-xs">NF ' + s.invoiceNumber + '</span>' : '<span class="text-xs text-muted">-</span>';

      return '<tr>' +
        '<td>' +
          '<div class="flex items-center gap-1">' +
            '<span class="badge badge-cyan font-mono" style="font-size:0.75rem; padding: 2px 6px;">#' + (index + 1) + '</span>' +
            '<div class="flex flex-col">' +
              (index > 0 ? '<button type="button" onclick="moveStopUp(' + index + ')" class="btn btn-secondary btn-icon" style="padding:1px; height:16px; width:16px;" title="Subir"><span data-lucide="arrow-up" style="width:10px;height:10px;"></span></button>' : '') +
              (index < count - 1 ? '<button type="button" onclick="moveStopDown(' + index + ')" class="btn btn-secondary btn-icon" style="padding:1px; height:16px; width:16px;" title="Descer"><span data-lucide="arrow-down" style="width:10px;height:10px;"></span></button>' : '') +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td><strong>' + (s.recipient || '-') + '</strong></td>' +
        '<td class="text-xs truncate" style="max-width: 220px;" title="' + fullAddress + '">' + fullAddress + '</td>' +
        '<td class="text-xs font-semibold">' + (s.city || '-') + '/' + (s.state || 'SP') + '</td>' +
        '<td class="text-xs font-mono">' + weightVol + '</td>' +
        '<td>' + nfStr + '</td>' +
        '<td class="text-right">' +
          '<div class="flex items-center justify-end gap-1">' +
            '<button type="button" onclick="editStopInList(' + index + ')" class="btn btn-secondary btn-sm" title="Editar Parada"><span data-lucide="edit-2" class="icon-xs"></span></button>' +
            '<button type="button" onclick="removeStopFromList(' + index + ')" class="btn btn-ghost-danger btn-sm" title="Remover Parada"><span data-lucide="trash" class="icon-xs"></span></button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join('');

    renderIcons();
  }

  // ==============================================
  // SUBMISSION: SALVAR RASCUNHO OU ATRIBUIR & DESPACHAR
  // ==============================================
  async function submitTripForm(desiredStatus = 'PENDING') {
    const tripId = document.getElementById('trip-form-id')?.value;
    const driverId = document.getElementById('trip-form-driver')?.value;
    const vehicleId = document.getElementById('trip-form-vehicle')?.value;
    const tripCode = document.getElementById('trip-form-code')?.value.trim();
    const dateStr = document.getElementById('trip-form-date')?.value;
    const timeStr = document.getElementById('trip-form-time')?.value || '08:00';
    const notes = document.getElementById('trip-form-notes')?.value.trim();

    // Origin
    const originName = document.getElementById('trip-form-origin-name')?.value.trim() || 'Centro de Distribuição HK';
    const originAddress = document.getElementById('trip-form-origin-address')?.value.trim();
    const originNumber = document.getElementById('trip-form-origin-number')?.value.trim();
    const originNeighborhood = document.getElementById('trip-form-origin-neighborhood')?.value.trim();
    const originCity = document.getElementById('trip-form-origin-city')?.value.trim();
    const originState = (document.getElementById('trip-form-origin-state')?.value.trim() || 'SP').toUpperCase();
    const originZipCode = document.getElementById('trip-form-origin-cep')?.value.trim();

    // Validation
    if (!tripCode) {
      showToast('Informe o código da viagem/rota.', 'warning');
      switchTripStep(2);
      return;
    }
    if (!dateStr) {
      showToast('Informe a data programada da viagem.', 'warning');
      switchTripStep(2);
      return;
    }

    if (desiredStatus === 'ASSIGNED') {
      if (!driverId) {
        showToast('Para despachar a rota, selecione o motorista na Etapa 1.', 'warning');
        switchTripStep(1);
        return;
      }
      if (!vehicleId) {
        showToast('Para despachar a rota, selecione o veículo na Etapa 1.', 'warning');
        switchTripStep(1);
        return;
      }
    }

    if (STATE.tripFormStops.length === 0) {
      showToast('Adicione pelo menos 1 parada/entrega na Etapa 3 antes de salvar.', 'warning');
      switchTripStep(3);
      return;
    }

    const payload = {
      tripCode,
      driverId: driverId || undefined,
      vehicleId: vehicleId || undefined,
      startDate: dateStr ? new Date(dateStr + 'T' + timeStr + ':00.000Z').toISOString() : undefined,
      origin: originName,
      originAddress,
      originNumber,
      originNeighborhood,
      originCity,
      originState,
      originZipCode,
      destination: STATE.tripFormStops.length > 0 ? (STATE.tripFormStops[STATE.tripFormStops.length - 1].city + '/' + STATE.tripFormStops[STATE.tripFormStops.length - 1].state) : undefined,
      notes: notes || undefined,
      status: desiredStatus,
      deliveries: STATE.tripFormStops.map((s, idx) => ({
        recipient: s.recipient,
        recipientPhone: s.phone || undefined,
        address: s.address,
        numberAddress: s.numberAddress,
        complement: s.complement || undefined,
        neighborhood: s.neighborhood,
        city: s.city,
        state: s.state,
        zipCode: s.zipCode || undefined,
        volumeCount: s.volumeCount || 1,
        weight: s.weight || undefined,
        invoiceNumber: s.invoiceNumber || undefined,
        invoiceKey: s.invoiceKey || undefined,
        notes: s.notes || undefined,
        sequence: idx + 1
      }))
    };

    try {
      if (tripId) {
        await apiFetch('/api/v1/admin/trips/' + tripId, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        showToast('Viagem #' + tripCode + ' atualizada com sucesso!', 'success');
      } else {
        await apiFetch('/api/v1/admin/trips', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const msg = desiredStatus === 'ASSIGNED' 
          ? 'Viagem #' + tripCode + ' criada e despachada para o motorista com sucesso!' 
          : 'Viagem #' + tripCode + ' salva como rascunho com sucesso!';
        showToast(msg, 'success');
      }

      closeModal('modal-trip-create');
      await loadTrips();
    } catch (err) {
      showToast('Erro ao salvar viagem: ' + err.message, 'error');
    }
  }

  // Quick Dispatch directly from table or details
  async function handleQuickDispatchTrip(tripId) {
    const trip = STATE.trips.find(t => t.id === tripId);
    if (!trip) return;

    if (!trip.driverId || !trip.vehicleId) {
      // Open edit modal on step 1 to assign
      openEditTripModal(tripId);
      showToast('Selecione o motorista e o veículo antes de despachar a rota.', 'info');
      return;
    }

    if (confirm('Deseja despachar a viagem #' + (trip.tripCode || trip.id.slice(0, 8)) + ' para o motorista ' + (trip.driver?.user?.name || 'atribuído') + '?')) {
      try {
        await apiFetch('/api/v1/admin/trips/' + tripId + '/assign', {
          method: 'POST',
          body: JSON.stringify({
            driverId: trip.driverId,
            vehicleId: trip.vehicleId
          })
        });
        showToast('Viagem despachada com sucesso! Notificação enviada ao motorista.', 'success');
        await loadTrips();
      } catch (err) {
        showToast('Erro ao despachar viagem: ' + err.message, 'error');
      }
    }
  }

  // ==============================================
  // UNASSIGN, REASSIGN, CANCEL & DELETE HANDLERS
  // ==============================================
  function openUnassignTripModal(tripId) {
    const trip = STATE.trips.find(t => t.id === tripId);
    if (!trip) return;

    document.getElementById('unassign-trip-id').value = trip.id;
    document.getElementById('unassign-trip-code').innerText = trip.tripCode || trip.id.slice(0, 8);
    document.getElementById('unassign-driver-name').innerText = trip.driver?.user?.name || trip.driver?.name || 'Motorista';
    document.getElementById('unassign-trip-reason').value = '';

    openModal('modal-unassign-trip');
  }

  async function handleUnassignTripSubmit(e) {
    if (e) e.preventDefault();
    const tripId = document.getElementById('unassign-trip-id')?.value;
    const reason = document.getElementById('unassign-trip-reason')?.value.trim();

    if (!tripId || !reason) {
      showToast('Informe o motivo da retirada de atribuição.', 'warning');
      return;
    }

    try {
      await apiFetch('/api/v1/admin/trips/' + tripId + '/unassign', {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      showToast('Atribuição da rota retirada com sucesso. A viagem voltou para PENDENTE.', 'success');
      closeModal('modal-unassign-trip');
      closeModal('modal-trip-details');
      await loadTrips();
    } catch (err) {
      showToast('Erro ao retirar atribuição: ' + err.message, 'error');
    }
  }

  function openReassignTripModal(tripId) {
    const trip = STATE.trips.find(t => t.id === tripId);
    if (!trip) return;

    document.getElementById('reassign-trip-id').value = trip.id;
    document.getElementById('reassign-trip-code').innerText = trip.tripCode || trip.id.slice(0, 8);
    document.getElementById('reassign-current-driver').innerText = trip.driver?.user?.name || trip.driver?.name || 'Não vinculado';
    document.getElementById('reassign-trip-reason').value = '';

    const driverSelect = document.getElementById('reassign-driver-select');
    const vehicleSelect = document.getElementById('reassign-vehicle-select');

    if (driverSelect) {
      const activeDrivers = STATE.drivers.filter(d => d.status === 'ACTIVE' && d.id !== trip.driverId);
      driverSelect.innerHTML = '<option value="">Selecione o novo motorista...</option>' +
        activeDrivers.map(d => '<option value="' + d.id + '">' + (d.user?.name || d.name) + ' (' + (d.cpf || 'Ativo') + ')</option>').join('');
    }

    if (vehicleSelect) {
      vehicleSelect.innerHTML = '<option value="">Selecione o veículo...</option>' +
        STATE.vehicles.map(v => {
          const sel = v.id === trip.vehicleId ? ' selected' : '';
          return '<option value="' + v.id + '"' + sel + '>' + v.plate + ' (' + (v.model || 'Veículo') + ')</option>';
        }).join('');
    }

    openModal('modal-reassign-trip');
  }

  function handleReassignDriverChange() {
    const driverId = document.getElementById('reassign-driver-select')?.value;
    if (!driverId) return;

    const linkedVeh = STATE.vehicles.find(v => v.currentDriverId === driverId || v.driverId === driverId);
    if (linkedVeh) {
      const vehSelect = document.getElementById('reassign-vehicle-select');
      if (vehSelect) vehSelect.value = linkedVeh.id;
    }
  }

  async function handleReassignTripSubmit(e) {
    if (e) e.preventDefault();
    const tripId = document.getElementById('reassign-trip-id')?.value;
    const newDriverId = document.getElementById('reassign-driver-select')?.value;
    const newVehicleId = document.getElementById('reassign-vehicle-select')?.value;
    const reason = document.getElementById('reassign-trip-reason')?.value.trim();

    if (!tripId || !newDriverId || !newVehicleId) {
      showToast('Selecione o novo motorista e o veículo.', 'warning');
      return;
    }

    try {
      await apiFetch('/api/v1/admin/trips/' + tripId + '/reassign', {
        method: 'POST',
        body: JSON.stringify({
          driverId: newDriverId,
          vehicleId: newVehicleId,
          reason: reason || undefined
        })
      });
      showToast('Motorista da rota substituído com sucesso!', 'success');
      closeModal('modal-reassign-trip');
      closeModal('modal-trip-details');
      await loadTrips();
    } catch (err) {
      showToast('Erro ao trocar motorista: ' + err.message, 'error');
    }
  }

  function openCancelTripModal(tripId) {
    const trip = STATE.trips.find(t => t.id === tripId);
    if (!trip) return;

    document.getElementById('cancel-trip-id').value = trip.id;
    document.getElementById('cancel-trip-code').innerText = trip.tripCode || trip.id.slice(0, 8);
    document.getElementById('cancel-trip-reason').value = '';

    openModal('modal-cancel-trip');
  }

  async function handleCancelTripSubmit(e) {
    if (e) e.preventDefault();
    const tripId = document.getElementById('cancel-trip-id')?.value;
    const reason = document.getElementById('cancel-trip-reason')?.value.trim();

    if (!tripId || !reason) {
      showToast('Informe o motivo do cancelamento da rota.', 'warning');
      return;
    }

    try {
      await apiFetch('/api/v1/admin/trips/' + tripId + '/cancel', {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      showToast('Viagem cancelada com sucesso.', 'info');
      closeModal('modal-cancel-trip');
      closeModal('modal-trip-details');
      await loadTrips();
    } catch (err) {
      showToast('Erro ao cancelar viagem: ' + err.message, 'error');
    }
  }

  async function handleDeleteTripDraft(tripId) {
    const trip = STATE.trips.find(t => t.id === tripId);
    if (!trip) return;

    if (confirm('Deseja excluir definitivamente este rascunho de viagem #' + (trip.tripCode || trip.id.slice(0, 8)) + '?')) {
      try {
        await apiFetch('/api/v1/admin/trips/' + tripId, {
          method: 'DELETE'
        });
        showToast('Rascunho de viagem excluído com sucesso.', 'info');
        await loadTrips();
      } catch (err) {
        showToast('Erro ao excluir rascunho: ' + err.message, 'error');
      }
    }
  }

  // ==============================================
  // DETALHES COMPLETOS DA VIAGEM
  // ==============================================
  function openTripDetails(tripId) {
    return openTripDetailsModal(tripId);
  }

  async function openTripDetailsModal(tripId) {
    try {
      const t = await apiFetch('/api/v1/admin/trips/' + tripId);
      document.getElementById('trip-detail-code').innerText = 'Viagem #' + (t.tripCode || t.id.slice(0, 8));
      document.getElementById('trip-detail-route').innerText = (t.origin || 'Origem') + ' \u2192 ' + (t.destination || 'Destino');
      document.getElementById('trip-detail-status-badge').innerHTML = getTripStatusBadge(t.status);

      // Status actions bar
      const actionsEl = document.getElementById('trip-detail-actions');
      const trackingBtnContainer = document.getElementById('trip-detail-tracking-btn-container');

      if (t.status === 'COMPLETED' || t.status === 'CANCELLED') {
        actionsEl.innerHTML = '<span class="text-xs text-muted">Viagem em estado final (' + t.status + '). Não permite alterações operacionais.</span>';
      } else if (t.status === 'PENDING') {
        actionsEl.innerHTML = 
          '<button onclick="handleQuickDispatchTrip(\\'' + t.id + '\\')" class="btn btn-primary btn-sm"><span data-lucide="send" class="icon-xs"></span> Despachar ao Motorista</button>' +
          '<button onclick="closeModal(\\'modal-trip-details\\'); openEditTripModal(\\'' + t.id + '\\')" class="btn btn-secondary btn-sm"><span data-lucide="edit-2" class="icon-xs"></span> Editar Rota</button>' +
          '<button onclick="openCancelTripModal(\\'' + t.id + '\\')" class="btn btn-ghost-danger btn-sm">Cancelar Viagem</button>';
      } else if (t.status === 'ASSIGNED' || t.status === 'ACCEPTED') {
        actionsEl.innerHTML = 
          '<button onclick="openReassignTripModal(\\'' + t.id + '\\')" class="btn btn-cyan btn-sm"><span data-lucide="refresh-cw" class="icon-xs"></span> Trocar Motorista</button>' +
          '<button onclick="openUnassignTripModal(\\'' + t.id + '\\')" class="btn btn-ghost-danger btn-sm"><span data-lucide="link-2-off" class="icon-xs"></span> Retirar Atribuição</button>' +
          '<button onclick="closeModal(\\'modal-trip-details\\'); openEditTripModal(\\'' + t.id + '\\')" class="btn btn-secondary btn-sm"><span data-lucide="edit-2" class="icon-xs"></span> Editar</button>' +
          '<button onclick="openCancelTripModal(\\'' + t.id + '\\')" class="btn btn-ghost-danger btn-sm">Cancelar</button>';
      } else if (t.status === 'IN_PROGRESS') {
        actionsEl.innerHTML = 
          '<button onclick="openUpdateTripStatusModal(\\'' + t.id + '\\', \\'' + (t.tripCode || '').replace(/'/g, "\\\\'") + '\\', \\'' + t.status + '\\')" class="btn btn-primary btn-sm">Finalizar / Concluir Viagem</button>' +
          '<button onclick="openCancelTripModal(\\'' + t.id + '\\')" class="btn btn-ghost-danger btn-sm">Cancelar</button>';
      }

      if (trackingBtnContainer) {
        if (t.vehicleId || t.driverId) {
          trackingBtnContainer.innerHTML = '<button onclick="closeModal(\\'modal-trip-details\\'); navigate(\\'tracking\\')" class="btn btn-secondary btn-sm" style="color:var(--cyan-base);"><span data-lucide="activity" class="icon-xs"></span> Ver no Mapa de Rastreamento</button>';
        } else {
          trackingBtnContainer.innerHTML = '';
        }
      }

      document.getElementById('trip-detail-driver').innerText = t.driver?.user?.name || t.driver?.name || 'Não vinculado';
      document.getElementById('trip-detail-vehicle').innerText = t.vehicle ? t.vehicle.plate + ' (' + (t.vehicle.model || '') + ')' : 'Não vinculado';
      document.getElementById('trip-detail-start').innerText = formatDate(t.startDate || t.acceptedAt || t.createdAt);
      document.getElementById('trip-detail-end').innerText = formatDate(t.endDate);

      // Full origin
      const originFullParts = [t.origin, t.originAddress, t.originNumber, t.originNeighborhood, t.originCity, t.originState].filter(Boolean);
      document.getElementById('trip-detail-origin-full').innerText = originFullParts.length > 0 ? originFullParts.join(', ') : (t.origin || 'Centro de Distribuição HK');

      // Notes
      const notesEl = document.getElementById('trip-detail-notes');
      if (notesEl) notesEl.innerText = t.notes || 'Nenhuma instrução específica informada.';

      // Deliveries table with individual statuses
      const delTbody = document.getElementById('trip-detail-deliveries-table');
      const deliveries = t.deliveries || [];
      const stopsCountEl = document.getElementById('trip-detail-stops-count');
      const progressBadge = document.getElementById('trip-detail-progress-badge');

      if (stopsCountEl) stopsCountEl.innerText = deliveries.length;
      if (progressBadge) {
        const completed = deliveries.filter(d => d.status === 'DELIVERED' || d.status === 'COMPLETED').length;
        progressBadge.innerText = 'Progresso: ' + completed + '/' + deliveries.length + ' entregas concluídas';
      }

      if (delTbody) {
        if (deliveries.length === 0) {
          delTbody.innerHTML = '<tr><td colspan="7" class="text-center text-xs" style="padding:1.5rem; color:var(--text-muted);">Nenhuma parada associada a esta rota.</td></tr>';
        } else {
          delTbody.innerHTML = deliveries.map((d, i) => {
            const seq = d.sequence || (i + 1);
            const address = [d.address, d.numberAddress, d.neighborhood, d.city, d.state].filter(Boolean).join(', ');
            const weightVol = (d.weight ? d.weight + ' kg' : '-') + ' / ' + (d.volumeCount || 1) + ' vol';
            const nfStr = d.invoiceNumber ? '<span class="badge badge-brand font-mono text-xs">NF ' + d.invoiceNumber + '</span>' : (d.invoiceKey ? '<span class="badge badge-brand font-mono text-xs">NF ' + d.invoiceKey.slice(-8) + '</span>' : '-');
            const contactStr = d.recipientPhone || d.customerPhone || '-';

            let statusBadge = '<span class="badge badge-warning text-xs">PENDENTE</span>';
            if (d.status === 'DELIVERED' || d.status === 'COMPLETED') {
              statusBadge = '<span class="badge badge-success text-xs">ENTREGUE</span>';
            } else if (d.status === 'IN_TRANSIT') {
              statusBadge = '<span class="badge badge-brand text-xs">EM TRÂNSITO</span>';
            } else if (d.status === 'FAILED' || d.status === 'OCCURRENCE') {
              statusBadge = '<span class="badge badge-danger text-xs">OCORRÊNCIA</span>';
            }

            return '<tr>' +
              '<td><strong class="font-mono text-xs badge badge-cyan">#' + seq + '</strong></td>' +
              '<td><strong>' + (d.recipient || d.customerName || 'Destinatário') + '</strong></td>' +
              '<td class="text-xs font-mono">' + contactStr + '</td>' +
              '<td class="text-xs truncate" style="max-width:200px;" title="' + address + '">' + address + '</td>' +
              '<td class="text-xs font-mono">' + weightVol + '</td>' +
              '<td class="text-xs">' + nfStr + '</td>' +
              '<td>' + statusBadge + '</td>' +
            '</tr>';
          }).join('');
        }
      }

      // Tracking info
      const trackingLocEl = document.getElementById('trip-detail-last-location');
      const trackingLinkEl = document.getElementById('trip-detail-tracking-link-container');
      if (trackingLocEl) {
        if (t.status === 'IN_PROGRESS') {
          trackingLocEl.innerText = 'Em trânsito com motorista ' + (t.driver?.user?.name || 'ativo') + '. Telemetria ativa via aplicativo HK Connect.';
          if (trackingLinkEl) {
            trackingLinkEl.innerHTML = '<button onclick="closeModal(\\'modal-trip-details\\'); navigate(\\'tracking\\')" class="btn btn-cyan btn-sm"><span data-lucide="map-pin" class="icon-xs"></span> Rastrear em Tempo Real</button>';
          }
        } else if (t.status === 'COMPLETED') {
          trackingLocEl.innerText = 'Viagem concluída em ' + formatDate(t.endDate) + '. Rastreamento finalizado.';
          if (trackingLinkEl) trackingLinkEl.innerHTML = '';
        } else {
          trackingLocEl.innerText = 'Status: ' + t.status + '. Aguardando início do deslocamento pelo motorista.';
          if (trackingLinkEl) trackingLinkEl.innerHTML = '';
        }
      }

      // Invoices
      const invDiv = document.getElementById('trip-detail-invoices');
      if (invDiv) {
        const invoices = t.invoices || [];
        const ctes = t.ctes || [];
        if (invoices.length === 0 && ctes.length === 0) {
          invDiv.innerHTML = '<span style="color:var(--text-muted); font-style:italic;">Nenhum documento fiscal associado.</span>';
        } else {
          let html = '';
          if (invoices.length > 0) {
            html += '<div><strong>Notas Fiscais:</strong> ' + invoices.map(inv => '<span class="badge badge-brand font-mono" style="margin:2px;">NF ' + inv.accessKey.slice(-8) + '</span>').join('') + '</div>';
          }
          if (ctes.length > 0) {
            html += '<div style="margin-top:4px;"><strong>CT-es:</strong> ' + ctes.map(c => '<span class="badge badge-cyan font-mono" style="margin:2px;">CT-e ' + c.accessKey.slice(-8) + '</span>').join('') + '</div>';
          }
          invDiv.innerHTML = html;
        }
      }

      // Romaneios & Tolls
      const romTollDiv = document.getElementById('trip-detail-romaneios-tolls');
      if (romTollDiv) {
        const romaneios = t.romaneios || [];
        const tolls = t.tolls || [];
        if (romaneios.length === 0 && tolls.length === 0) {
          romTollDiv.innerHTML = '<span style="color:var(--text-muted); font-style:italic;">Nenhum romaneio ou pedágio registrado.</span>';
        } else {
          let html = '';
          if (romaneios.length > 0) {
            html += '<div><strong>Romaneios:</strong> ' + romaneios.map(r => '<span class="badge badge-purple font-mono" style="margin:2px;">Romaneio #' + (r.code || r.id.slice(0,6)) + '</span>').join('') + '</div>';
          }
          if (tolls.length > 0) {
            html += '<div style="margin-top:4px;"><strong>Pedágios:</strong> ' + tolls.map(toll => '<span class="badge badge-warning font-mono" style="margin:2px;">' + (toll.plazaName || 'Praça') + ': ' + formatCurrency(toll.amount) + '</span>').join('') + '</div>';
          }
          romTollDiv.innerHTML = html;
        }
      }

      // Occurrences
      const occDiv = document.getElementById('trip-detail-occurrences');
      if (occDiv) {
        const occs = t.occurrences || [];
        if (occs.length === 0) {
          occDiv.innerHTML = '<span style="color:var(--text-muted); font-style:italic;">Nenhuma ocorrência registrada para esta viagem.</span>';
        } else {
          occDiv.innerHTML = occs.map(o => {
            return '<div style="padding:0.4rem; border-radius:0.4rem; background:rgba(245,158,11,0.1); border:1px solid var(--amber-border); margin-bottom:4px;">' +
              '<strong style="color:var(--amber-base);">' + o.title + '</strong> (' + o.status + ') - ' + (o.description || '') +
            '</div>';
          }).join('');
        }
      }

      openModal('modal-trip-details');
      renderIcons();
    } catch (err) {
      showToast('Erro ao carregar detalhes da viagem: ' + err.message, 'error');
    }
  }

  // ATUALIZAR STATUS DA VIAGEM
  function openUpdateTripStatusModal(tripId, tripCode, currentStatus) {
    document.getElementById('trip-status-id').value = tripId;
    document.getElementById('trip-status-code').innerText = tripCode || tripId.slice(0, 8);
    document.getElementById('trip-status-notes').value = '';

    const select = document.getElementById('trip-status-select');
    select.innerHTML = '';

    // Valid transitions
    if (currentStatus === 'ASSIGNED' || currentStatus === 'PENDING') {
      select.innerHTML = '<option value="ACCEPTED">ACEITA (ACCEPTED)</option>' +
                         '<option value="IN_PROGRESS">EM ANDAMENTO (IN_PROGRESS) - Iniciar Viagem</option>' +
                         '<option value="CANCELLED">CANCELADA (CANCELLED)</option>';
    } else if (currentStatus === 'ACCEPTED') {
      select.innerHTML = '<option value="IN_PROGRESS">EM ANDAMENTO (IN_PROGRESS) - Iniciar Viagem</option>' +
                         '<option value="CANCELLED">CANCELADA (CANCELLED)</option>';
    } else if (currentStatus === 'IN_PROGRESS') {
      select.innerHTML = '<option value="COMPLETED">CONCLUÍDA (COMPLETED) - Finalizar Viagem</option>' +
                         '<option value="CANCELLED">CANCELADA (CANCELLED)</option>';
    } else {
      showToast('Esta viagem já está no status ' + currentStatus + ' e não permite novas transições.', 'info');
      return;
    }

    openModal('modal-trip-status');
  }

  async function handleTripStatusSubmit(e) {
    if (e) e.preventDefault();
    const tripId = document.getElementById('trip-status-id').value;
    const status = document.getElementById('trip-status-select').value;
    const notes = document.getElementById('trip-status-notes').value.trim();

    if (!tripId || !status) {
      showToast('Selecione o novo status da viagem', 'error');
      return;
    }

    try {
      await apiFetch('/api/v1/admin/trips/' + tripId + '/status', {
        method: 'PATCH',
        body: JSON.stringify({ status, notes: notes || undefined })
      });
      showToast('Status da viagem atualizado para ' + status, 'success');
      closeModal('modal-trip-status');
      closeModal('modal-trip-details');
      await loadTrips();
    } catch (err) {
      showToast('Erro ao atualizar status da viagem: ' + err.message, 'error');
    }
  }

  // ==============================================
  // 5. ROMANEIOS CONTROLLER
  // ==============================================
  async function loadRomaneios() {
    const tbody = document.getElementById('romaneios-table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:2rem; color:var(--text-muted);">Carregando romaneios...</td></tr>';

    try {
      const search = document.getElementById('romaneio-search-input')?.value.trim() || '';
      const status = document.getElementById('romaneio-status-filter')?.value || '';
      const startDate = document.getElementById('romaneio-start-date')?.value || '';
      const endDate = document.getElementById('romaneio-end-date')?.value || '';

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const url = '/api/v1/admin/romaneios' + (params.toString() ? '?' + params.toString() : '');
      const romaneios = await apiFetch(url);
      STATE.romaneios = romaneios || [];
      renderRomaneiosTable();
    } catch (err) {
      showToast('Erro ao carregar romaneios: ' + err.message, 'error');
      if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:2rem; color:var(--rose-base);">Falha ao carregar romaneios</td></tr>';
    }
  }

  function renderRomaneiosTable() {
    const tbody = document.getElementById('romaneios-table-body');
    if (!tbody) return;

    if (!STATE.romaneios || STATE.romaneios.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:2.5rem; color:var(--text-muted);">Nenhum romaneio encontrado com os filtros aplicados.</td></tr>';
      return;
    }

    tbody.innerHTML = STATE.romaneios.map(r => {
      const driverName = r.driver?.user?.name || 'Motorista não vinculado';
      const driverPhone = r.driver?.user?.phone ? formatPhone(r.driver.user.phone) : '';
      const vehiclePlate = r.trip?.vehicle?.plate || '-';
      const vehicleModel = r.trip?.vehicle?.model || '';
      const tripCode = r.trip?.tripCode || '-';
      const docsCount = r.documents ? r.documents.length : 0;

      let statusBadge = '<span class="badge badge-muted">PENDENTE</span>';
      if (r.status === 'APPROVED') statusBadge = '<span class="badge badge-emerald">APROVADO</span>';
      else if (r.status === 'REJECTED') statusBadge = '<span class="badge badge-rose">REJEITADO</span>';

      return '<tr>' +
        '<td><span class="font-mono font-bold" style="color:var(--brand-light);">' + (r.romaneioCode || r.id.slice(0, 8)) + '</span></td>' +
        '<td>' + (r.trip ? '<span class="font-bold cursor-pointer" onclick="openTripDetails(\\'' + r.trip.id + '\\')" style="color:var(--brand-primary); text-decoration:underline;">' + tripCode + '</span><div class="text-xs text-muted">' + (r.trip.origin || '') + ' -> ' + (r.trip.destination || '') + '</div>' : '<span class="text-muted">-</span>') + '</td>' +
        '<td><div class="font-semibold">' + driverName + '</div><div class="text-xs text-muted">' + driverPhone + '</div></td>' +
        '<td><span class="font-mono font-semibold">' + vehiclePlate + '</span><div class="text-xs text-muted">' + vehicleModel + '</div></td>' +
        '<td><span class="badge badge-purple text-xs">' + docsCount + ' documento(s)</span></td>' +
        '<td><span class="text-xs">' + formatDate(r.createdAt) + '</span></td>' +
        '<td>' + statusBadge + '</td>' +
        '<td class="text-right">' +
          '<button onclick="openRomaneioDetails(\\'' + r.id + '\\')" class="btn btn-secondary btn-xs">' +
            '<span data-lucide="eye" class="icon-xs"></span>' +
            '<span>Detalhes</span>' +
          '</button>' +
        '</td>' +
      '</tr>';
    }).join('');

    renderIcons();
  }

  async function openRomaneioDetails(id) {
    try {
      const romaneio = await apiFetch('/api/v1/admin/romaneios/' + id);
      if (!romaneio) return;

      document.getElementById('romaneio-detail-code').innerText = 'Romaneio #' + (romaneio.romaneioCode || romaneio.id.slice(0, 8));
      document.getElementById('romaneio-detail-sub').innerText = 'ID: ' + romaneio.id;

      let statusBadge = '<span class="badge badge-muted">PENDENTE (PENDING)</span>';
      if (romaneio.status === 'APPROVED') statusBadge = '<span class="badge badge-emerald">APROVADO (APPROVED)</span>';
      else if (romaneio.status === 'REJECTED') statusBadge = '<span class="badge badge-rose">REJEITADO (REJECTED)</span>';
      document.getElementById('romaneio-detail-status-badge').innerHTML = statusBadge;

      const actionsDiv = document.getElementById('romaneio-detail-actions');
      if (actionsDiv) {
        if (romaneio.status === 'PENDING') {
          actionsDiv.innerHTML =
            '<button onclick="initiateRomaneioReview(\\'' + romaneio.id + '\\', \\'APPROVED\\')" class="btn btn-emerald btn-xs"><span data-lucide="check" class="icon-xs"></span><span>Aprovar</span></button>' +
            '<button onclick="initiateRomaneioReview(\\'' + romaneio.id + '\\', \\'REJECTED\\')" class="btn btn-rose btn-xs"><span data-lucide="x-circle" class="icon-xs"></span><span>Rejeitar</span></button>';
        } else {
          actionsDiv.innerHTML = '<span class="text-xs font-semibold" style="color:var(--text-muted);">Processado em ' + formatDate(romaneio.updatedAt) + '</span>';
        }
      }

      document.getElementById('romaneio-detail-driver').innerText = romaneio.driver?.user?.name || 'Motorista não vinculado';
      document.getElementById('romaneio-detail-vehicle').innerText = (romaneio.trip?.vehicle?.plate || '-') + ' ' + (romaneio.trip?.vehicle?.model || '');
      document.getElementById('romaneio-detail-trip').innerText = romaneio.trip ? (romaneio.trip.tripCode + ' (' + romaneio.trip.origin + ' -> ' + romaneio.trip.destination + ')') : 'Não associada';
      document.getElementById('romaneio-detail-date').innerText = formatDate(romaneio.createdAt);

      const notesCont = document.getElementById('romaneio-detail-notes-container');
      const notesEl = document.getElementById('romaneio-detail-notes');
      if (romaneio.notes) {
        notesCont.style.display = 'block';
        notesEl.innerText = romaneio.notes;
      } else {
        notesCont.style.display = 'none';
      }

      const docsDiv = document.getElementById('romaneio-detail-docs');
      const docs = romaneio.documents || [];
      if (docs.length === 0) {
        docsDiv.innerHTML = '<div class="text-xs text-muted" style="grid-column: 1/-1; padding: 1rem; text-align: center;">Nenhum documento ou foto anexado a este romaneio.</div>';
      } else {
        docsDiv.innerHTML = docs.map((doc, idx) => {
          const isImg = doc.fileUrl && (doc.fileUrl.match(/\\.(jpeg|jpg|gif|png|webp)/i) || doc.fileType?.includes('image'));
          return '<div class="card" style="padding: 0.75rem; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.5rem;">' +
            '<div class="flex items-center justify-between">' +
              '<span class="badge badge-purple text-xs font-mono">Doc #' + (idx + 1) + '</span>' +
              '<span class="text-xs text-muted">' + (doc.documentType || 'CANHOTO') + '</span>' +
            '</div>' +
            (isImg ? '<div style="height: 120px; border-radius: 0.4rem; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center;"><img src="' + doc.fileUrl + '" style="max-height: 100%; max-width: 100%; object-fit: contain;" alt="Comprovante"></div>' : '<div style="height: 60px; display: flex; align-items: center; justify-content: center; background: var(--bg-surface-elevated); border-radius: 0.4rem;"><span data-lucide="file-text" class="icon-md text-muted"></span></div>') +
            '<div class="flex items-center justify-between" style="margin-top: auto;">' +
              '<span class="text-xs text-muted truncate" style="max-width: 130px;">' + (doc.fileName || 'Arquivo') + '</span>' +
              (doc.fileUrl ? '<a href="' + doc.fileUrl + '" target="_blank" class="btn btn-secondary btn-xs" style="text-decoration:none;"><span data-lucide="external-link" class="icon-xs"></span><span>Ver</span></a>' : '') +
            '</div>' +
          '</div>';
        }).join('');
      }

      cancelRomaneioReview();
      openModal('modal-romaneio-details');
    } catch (err) {
      showToast('Erro ao carregar detalhes do romaneio: ' + err.message, 'error');
    }
  }

  function initiateRomaneioReview(id, targetStatus) {
    const formCont = document.getElementById('romaneio-review-form-container');
    const targetTitle = document.getElementById('romaneio-review-title');
    const reviewBtn = document.getElementById('romaneio-review-btn');
    document.getElementById('romaneio-review-id').value = id;
    document.getElementById('romaneio-review-target-status').value = targetStatus;
    document.getElementById('romaneio-review-notes').value = '';

    if (targetStatus === 'APPROVED') {
      targetTitle.innerText = 'Aprovação de Romaneio';
      targetTitle.style.color = 'var(--emerald-base)';
      reviewBtn.className = 'btn btn-emerald btn-sm';
      reviewBtn.innerText = 'Confirmar Aprovação';
    } else {
      targetTitle.innerText = 'Rejeição de Romaneio';
      targetTitle.style.color = 'var(--rose-base)';
      reviewBtn.className = 'btn btn-rose btn-sm';
      reviewBtn.innerText = 'Confirmar Rejeição';
    }

    formCont.style.display = 'block';
  }

  function cancelRomaneioReview() {
    const formCont = document.getElementById('romaneio-review-form-container');
    if (formCont) formCont.style.display = 'none';
  }

  async function submitRomaneioReview() {
    const id = document.getElementById('romaneio-review-id').value;
    const status = document.getElementById('romaneio-review-target-status').value;
    const notes = document.getElementById('romaneio-review-notes').value.trim();

    if (status === 'REJECTED' && !notes) {
      showToast('Por favor, informe uma justificativa para a rejeição.', 'error');
      return;
    }

    try {
      await apiFetch('/api/v1/admin/romaneios/' + id + '/status', {
        method: 'PATCH',
        body: JSON.stringify({ status, notes: notes || undefined })
      });
      showToast('Romaneio ' + (status === 'APPROVED' ? 'aprovado' : 'rejeitado') + ' com sucesso!', 'success');
      closeModal('modal-romaneio-details');
      loadRomaneios();
    } catch (err) {
      showToast('Erro ao atualizar romaneio: ' + err.message, 'error');
    }
  }

  // ==============================================
  // 6. NOTAS FISCAIS CONTROLLER (ERP HK TRANSPORTES)
  // ==============================================
  async function loadInvoices() {
    const tbody = document.getElementById('invoices-table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="9" class="text-center" style="padding:2rem; color:var(--text-muted);">Carregando Notas Fiscais sincronizadas do ERP...</td></tr>';

    try {
      const invoices = await apiFetch('/api/v1/admin/invoices');
      STATE.invoices = invoices || [];

      // Update Top Stats
      const total = STATE.invoices.length;
      const available = STATE.invoices.filter(i => i.operationalStatus === 'AVAILABLE' || (!i.tripId && i.fiscalStatus !== 'CANCELLED')).length;
      const inTransit = STATE.invoices.filter(i => i.operationalStatus === 'IN_TRANSIT' || (i.trip && i.trip.status !== 'PENDING' && i.trip.status !== 'CANCELLED')).length;
      const delivered = STATE.invoices.filter(i => i.operationalStatus === 'DELIVERED' || i.status === 'DELIVERED').length;

      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
      };
      setVal('stat-total-invoices', total);
      setVal('stat-available-invoices', available);
      setVal('stat-in-transit-invoices', inTransit);
      setVal('stat-delivered-invoices', delivered);

      renderInvoicesTable();
    } catch (err) {
      showToast('Erro ao carregar Notas Fiscais: ' + err.message, 'error');
      if (tbody) tbody.innerHTML = '<tr><td colspan="9" class="text-center" style="padding:2rem; color:var(--rose-base);">Falha ao carregar Notas Fiscais do ERP</td></tr>';
    }
  }

  function getFilteredInvoices() {
    const search = (document.getElementById('invoice-search-input')?.value || '').toLowerCase().trim();
    const opFilter = document.getElementById('invoice-operational-filter')?.value || 'AVAILABLE';
    const fiscalFilter = document.getElementById('invoice-fiscal-filter')?.value || '';
    const cityFilter = (document.getElementById('invoice-city-filter')?.value || '').toLowerCase().trim();

    return (STATE.invoices || []).filter(inv => {
      // 1. Search text
      if (search) {
        const num = (inv.number || '').toLowerCase();
        const key = (inv.accessKey || '').toLowerCase();
        const rec = (inv.recipient || inv.delivery?.recipient || '').toLowerCase();
        const addr = (inv.address || inv.delivery?.address || '').toLowerCase();
        const city = (inv.city || inv.delivery?.city || '').toLowerCase();
        if (!num.includes(search) && !key.includes(search) && !rec.includes(search) && !addr.includes(search) && !city.includes(search)) {
          return false;
        }
      }

      // 2. Operational filter
      const opStatus = inv.operationalStatus || (inv.tripId ? 'IN_TRANSIT' : 'AVAILABLE');
      if (opFilter === 'AVAILABLE') {
        if (opStatus !== 'AVAILABLE') return false;
      } else if (opFilter === 'ROUTED_DRAFT') {
        if (opStatus !== 'ROUTED_DRAFT') return false;
      } else if (opFilter === 'IN_TRANSIT') {
        if (opStatus !== 'IN_TRANSIT') return false;
      } else if (opFilter === 'DELIVERED') {
        if (opStatus !== 'DELIVERED' && inv.status !== 'DELIVERED') return false;
      } else if (opFilter === 'RETURNED') {
        if (opStatus !== 'RETURNED' && inv.status !== 'RETURNED') return false;
      } else if (opFilter === 'CANCELLED') {
        if (opStatus !== 'CANCELLED' && inv.fiscalStatus !== 'CANCELLED') return false;
      }

      // 3. Fiscal status filter
      if (fiscalFilter && inv.fiscalStatus !== fiscalFilter) {
        return false;
      }

      // 4. City filter
      if (cityFilter) {
        const city = (inv.city || inv.delivery?.city || '').toLowerCase();
        if (!city.includes(cityFilter)) return false;
      }

      return true;
    });
  }

  function renderInvoicesTable() {
    const tbody = document.getElementById('invoices-table-body');
    if (!tbody) return;

    const filtered = getFilteredInvoices();
    updateSelectedInvoicesCounter();

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center" style="padding:2.5rem; color:var(--text-muted);">Nenhuma Nota Fiscal encontrada com os filtros selecionados.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(inv => {
      const isSelected = STATE.selectedInvoiceIds.has(inv.id);
      const isAvailable = inv.isAvailableForRouting || inv.operationalStatus === 'AVAILABLE' || (!inv.tripId && inv.fiscalStatus !== 'CANCELLED');
      const tripCode = inv.trip?.tripCode || '-';
      const tripId = inv.trip?.id || null;
      const recipient = inv.recipient || inv.delivery?.recipient || 'Cliente';
      const doc = inv.recipientDocument || '-';
      const address = (inv.address || inv.delivery?.address || '-') + (inv.numberAddress ? ', ' + inv.numberAddress : '');
      const cityUf = (inv.city || inv.delivery?.city || 'São Paulo') + '/' + (inv.state || inv.delivery?.state || 'SP');
      const accessKey = inv.accessKey || '';
      const accessKeyShort = accessKey.length >= 16 ? (accessKey.slice(0, 6) + '...' + accessKey.slice(-6)) : (accessKey || '-');
      const formattedValue = formatCurrency(inv.value || inv.totalValue || 0);
      const volumes = inv.volumeCount || inv.volumes || 1;
      const weight = inv.weight || inv.weightKg || 0;

      // Status Badge
      let statusBadge = '<span class="badge badge-success">DISPONÍVEL P/ ROTA</span>';
      if (inv.fiscalStatus === 'CANCELLED') {
        statusBadge = '<span class="badge badge-rose">CANCELADA NO ERP</span>';
      } else if (inv.status === 'DELIVERED') {
        statusBadge = '<span class="badge badge-purple">ENTREGUE (POD)</span>';
      } else if (inv.status === 'RETURNED') {
        statusBadge = '<span class="badge badge-rose">DEVOLVIDA</span>';
      } else if (inv.trip) {
        if (inv.trip.status === 'PENDING') {
          statusBadge = '<span class="badge badge-amber">RASCUNHO DE ROTA</span>';
        } else {
          statusBadge = '<span class="badge badge-cyan">EM TRÂNSITO</span>';
        }
      }

      const checkboxHtml = isAvailable
        ? '<input type="checkbox" onchange="toggleInvoiceSelection(\\'' + inv.id + '\\', this.checked)" ' + (isSelected ? 'checked' : '') + ' style="cursor:pointer; width:16px; height:16px;">'
        : '<input type="checkbox" disabled title="NF já vinculada a viagem ou cancelada" style="opacity:0.3; cursor:not-allowed;">';

      const tripLinkHtml = tripId
        ? '<button onclick="openTripDetailsModal(\\'' + tripId + '\\')" class="btn btn-secondary btn-xs font-mono" style="color:var(--brand-light); font-weight:700;"><span data-lucide="navigation" class="icon-xs"></span><span>' + tripCode + '</span></button>'
        : '<span class="text-xs text-muted">-</span>';

      const canDetach = inv.trip && (inv.trip.status === 'PENDING' || inv.trip.status === 'ASSIGNED');
      const detachBtnHtml = canDetach
        ? '<button onclick="handleDetachInvoice(\\'' + inv.id + '\\', \\'' + (inv.number || '') + '\\')" class="btn btn-secondary btn-xs" title="Desvincular de Rota" style="color:var(--rose-base);"><span data-lucide="link-2-off" class="icon-xs"></span></button>'
        : '';

      return '<tr>' +
        '<td style="text-align:center;">' + checkboxHtml + '</td>' +
        '<td>' +
          '<div class="font-mono font-bold" style="color:var(--text-primary);">NF nº ' + (inv.number || '-') + '</div>' +
          '<div class="text-xs text-muted">Série ' + (inv.series || '1') + ' &bull; ' + (inv.source || 'ERP') + '</div>' +
        '</td>' +
        '<td>' +
          '<div class="flex items-center gap-1">' +
            '<span class="font-mono text-xs" style="color:var(--brand-light);" title="' + accessKey + '">' + accessKeyShort + '</span>' +
            (accessKey ? '<button onclick="copyToClipboard(\\'' + accessKey + '\\', \\'Chave de acesso copiada!\\')" class="btn btn-secondary btn-xs btn-icon" style="padding:2px 4px; border:none;" title="Copiar Chave"><span data-lucide="key" class="icon-xs"></span></button>' : '') +
          '</div>' +
        '</td>' +
        '<td>' +
          '<div class="font-semibold truncate" style="max-width:180px;" title="' + recipient + '">' + recipient + '</div>' +
          '<div class="text-xs font-mono text-muted">' + doc + '</div>' +
        '</td>' +
        '<td>' +
          '<div class="text-xs truncate" style="max-width:180px;" title="' + address + '">' + address + '</div>' +
          '<div class="text-xs font-semibold" style="color:var(--brand-light);">' + cityUf + '</div>' +
        '</td>' +
        '<td>' +
          '<div class="font-mono font-bold" style="color:var(--emerald-base);">' + formattedValue + '</div>' +
          '<div class="text-xs font-mono text-muted">' + volumes + ' vol &bull; ' + weight + ' kg</div>' +
        '</td>' +
        '<td>' + statusBadge + '</td>' +
        '<td>' + tripLinkHtml + '</td>' +
        '<td class="text-right">' +
          '<div class="flex items-center justify-end gap-1">' +
            '<button onclick="openInvoiceDetails(\\'' + inv.id + '\\')" class="btn btn-secondary btn-xs" title="Ver Detalhes">' +
              '<span data-lucide="eye" class="icon-xs"></span>' +
              '<span>Ver</span>' +
            '</button>' +
            detachBtnHtml +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join('');

    renderIcons();
  }

  function toggleInvoiceSelection(id, checked) {
    if (checked) {
      STATE.selectedInvoiceIds.add(id);
    } else {
      STATE.selectedInvoiceIds.delete(id);
    }
    updateSelectedInvoicesCounter();
  }

  function toggleSelectAllInvoices(checked) {
    const filtered = getFilteredInvoices();
    filtered.forEach(inv => {
      const isAvailable = inv.isAvailableForRouting || inv.operationalStatus === 'AVAILABLE' || (!inv.tripId && inv.fiscalStatus !== 'CANCELLED');
      if (isAvailable) {
        if (checked) STATE.selectedInvoiceIds.add(inv.id);
        else STATE.selectedInvoiceIds.delete(inv.id);
      }
    });
    renderInvoicesTable();
  }

  function selectAllAvailableInvoices(select) {
    const cb = document.getElementById('invoice-select-all-cb');
    if (cb) cb.checked = select;
    toggleSelectAllInvoices(select);
  }

  function updateSelectedInvoicesCounter() {
    const count = STATE.selectedInvoiceIds.size;
    const countSpan = document.getElementById('selected-invoices-count');
    if (countSpan) countSpan.innerText = count;

    const btn = document.getElementById('btn-create-trip-from-nfs');
    if (btn) {
      btn.disabled = count === 0;
      if (count > 0) {
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      } else {
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      }
    }
  }

  async function handleSyncErpInvoices() {
    const btn = document.getElementById('btn-sync-erp-nfs');
    if (btn) btn.disabled = true;

    try {
      showToast('Sincronizando Notas Fiscais com o ERP HK Transportes...', 'info');
      const res = await apiFetch('/api/v1/admin/invoices/sync-erp', { method: 'POST' });
      showToast('Sincronização concluída! ' + (res.newInvoicesImported || 0) + ' nova(s) NF(s) importada(s). ' + (res.totalAvailableForRouting || 0) + ' disponível(is) para rota.', 'success');
      loadInvoices();
    } catch (err) {
      showToast('Erro ao sincronizar com ERP: ' + err.message, 'error');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function handleDetachInvoice(invoiceId, invoiceNumber) {
    if (!confirm('Deseja realmente desvincular a NF nº ' + invoiceNumber + ' da viagem? Ela retornará à lista de NFs disponíveis para roteirização.')) {
      return;
    }

    try {
      await apiFetch('/api/v1/admin/invoices/' + invoiceId + '/detach', { method: 'POST' });
      showToast('NF nº ' + invoiceNumber + ' desvinculada com sucesso!', 'success');
      loadInvoices();
      if (STATE.currentView === 'trips') loadTrips();
    } catch (err) {
      showToast('Erro ao desvincular Nota Fiscal: ' + err.message, 'error');
    }
  }

  async function openInvoiceDetails(id) {
    try {
      const invoice = await apiFetch('/api/v1/admin/invoices/' + id);
      if (!invoice) return;

      document.getElementById('invoice-detail-title').innerText = 'NF-e nº ' + (invoice.number || '-') + ' (Série ' + (invoice.series || '1') + ')';
      document.getElementById('invoice-detail-sub').innerText = 'Fonte da Verdade: ERP HK Transportes &bull; Importado em ' + formatDate(invoice.createdAt);
      document.getElementById('invoice-detail-key').innerText = invoice.accessKey || 'Não informada';
      document.getElementById('invoice-detail-number').innerText = (invoice.number || '-') + ' / ' + (invoice.series || '1');
      document.getElementById('invoice-detail-value').innerText = formatCurrency(invoice.value || invoice.totalValue || 0);
      document.getElementById('invoice-detail-weight-vol').innerText = (invoice.volumeCount || invoice.volumes || 1) + ' vol | ' + (invoice.weight || invoice.weightKg || 0) + ' kg';

      let statusBadge = '<span class="badge badge-success">DISPONÍVEL P/ ROTA</span>';
      if (invoice.fiscalStatus === 'CANCELLED') statusBadge = '<span class="badge badge-rose">CANCELADA NO ERP</span>';
      else if (invoice.status === 'DELIVERED') statusBadge = '<span class="badge badge-purple">ENTREGUE (POD)</span>';
      else if (invoice.status === 'IN_TRANSIT') statusBadge = '<span class="badge badge-cyan">EM TRÂNSITO</span>';
      else if (invoice.trip) statusBadge = '<span class="badge badge-amber">RASCUNHO DE ROTA</span>';
      document.getElementById('invoice-detail-status-badge').innerHTML = statusBadge;

      document.getElementById('invoice-detail-recipient').innerText = (invoice.recipient || invoice.delivery?.recipient || 'Cliente') + (invoice.recipientDocument ? ' (' + invoice.recipientDocument + ')' : '');
      const fullAddr = [
        invoice.address || invoice.delivery?.address,
        invoice.numberAddress ? 'nº ' + invoice.numberAddress : '',
        invoice.neighborhood || invoice.delivery?.neighborhood,
        (invoice.city || invoice.delivery?.city || 'São Paulo') + ' - ' + (invoice.state || invoice.delivery?.state || 'SP'),
        invoice.postalCode ? 'CEP ' + invoice.postalCode : ''
      ].filter(Boolean).join(', ');
      document.getElementById('invoice-detail-address').innerText = fullAddr || 'Não informado';

      const tripInfo = document.getElementById('invoice-detail-trip-info');
      const tripAction = document.getElementById('invoice-detail-trip-action');
      if (invoice.trip) {
        tripInfo.innerHTML = '<span style="color:var(--brand-light);">' + invoice.trip.tripCode + '</span> &bull; ' + (invoice.trip.origin || '') + ' &rarr; ' + (invoice.trip.destination || '') + '<br><span class="text-xs font-normal text-muted">Motorista: ' + (invoice.trip.driver?.user?.name || 'Não atribuído') + ' &bull; Veículo: ' + (invoice.trip.vehicle?.plate || '-') + '</span>';
        tripAction.innerHTML = '<button onclick="closeModal(\\'modal-invoice-details\\'); openTripDetailsModal(\\'' + invoice.trip.id + '\\');" class="btn btn-secondary btn-xs"><span data-lucide="navigation" class="icon-xs"></span><span>Ver Viagem</span></button>';
      } else {
        tripInfo.innerHTML = '<span class="text-xs" style="color:var(--emerald-base); font-weight:600;">Disponível no ERP para montagem de rota operacional</span>';
        tripAction.innerHTML = '';
      }

      renderIcons();
      openModal('modal-invoice-details');
    } catch (err) {
      showToast('Erro ao carregar detalhes da Nota Fiscal: ' + err.message, 'error');
    }
  }

  // ==============================================
  // CRIAÇÃO DE ROTA A PARTIR DE NOTAS FISCAIS SELECIONADAS
  // ==============================================
  async function openCreateTripFromSelectedInvoicesModal() {
    const selectedIds = Array.from(STATE.selectedInvoiceIds);
    if (selectedIds.length === 0) {
      showToast('Selecione pelo menos uma Nota Fiscal para criar a rota.', 'error');
      return;
    }

    const selectedInvoices = (STATE.invoices || []).filter(i => selectedIds.includes(i.id));
    if (selectedInvoices.length === 0) {
      showToast('Nenhuma das Notas Fiscais selecionadas foi localizada.', 'error');
      return;
    }

    // Carregar Motoristas e Veículos para os selects se ainda não carregados
    try {
      if (!STATE.drivers || STATE.drivers.length === 0) {
        STATE.drivers = await apiFetch('/api/v1/admin/drivers');
      }
      if (!STATE.vehicles || STATE.vehicles.length === 0) {
        STATE.vehicles = await apiFetch('/api/v1/admin/vehicles');
      }
    } catch (e) {
      console.warn('Erro ao carregar motoristas/veículos para rota:', e);
    }

    // Preencher Select de Motoristas
    const driverSelect = document.getElementById('nf-modal-driver-select');
    if (driverSelect) {
      const activeDrivers = (STATE.drivers || []).filter(d => d.status === 'ATIVO' || d.status === 'DISPONIVEL' || !d.status);
      driverSelect.innerHTML = '<option value="">Selecione o motorista (ou deixe vazio p/ rascunho)...</option>' +
        activeDrivers.map(d => {
          const name = d.user?.name || ('Motorista ' + (d.cnh || d.id.slice(0, 6)));
          const cnh = d.cnh ? ' - CNH: ' + d.cnh : '';
          return '<option value="' + d.id + '">' + name + cnh + '</option>';
        }).join('');
    }

    // Preencher Select de Veículos
    const vehicleSelect = document.getElementById('nf-modal-vehicle-select');
    if (vehicleSelect) {
      const activeVehicles = (STATE.vehicles || []).filter(v => v.status !== 'INATIVO' && v.status !== 'MANUTENCAO');
      vehicleSelect.innerHTML = '<option value="">Selecione o veículo...</option>' +
        activeVehicles.map(v => {
          return '<option value="' + v.id + '">' + v.plate + ' - ' + v.model + ' (' + v.type + ')</option>';
        }).join('');
    }

    // Auto-preencher código da rota e data padrão (hoje + 1h)
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const codeEl = document.getElementById('nf-modal-trip-code');
    if (codeEl) codeEl.value = 'HK-' + dateStr + '-' + rand;

    const startDateEl = document.getElementById('nf-modal-start-date');
    if (startDateEl) {
      const plusOneHour = new Date(Date.now() + 60 * 60 * 1000);
      const iso = new Date(plusOneHour.getTime() - plusOneHour.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      startDateEl.value = iso;
    }

    // Agrupamento Inteligente por Destinatário + Endereço
    const stopMap = new Map();
    let totalVol = 0;
    let totalWeight = 0;
    let totalVal = 0;

    selectedInvoices.forEach(inv => {
      const recipient = (inv.recipient || 'Cliente').trim();
      const addr = (inv.address || '').trim();
      const city = (inv.city || 'São Paulo').trim();
      const key = (recipient + ':::' + addr + ':::' + city).toLowerCase();

      const vol = inv.volumeCount || inv.volumes || 1;
      const wt = inv.weight || inv.weightKg || 0;
      const val = inv.value || inv.totalValue || 0;

      totalVol += vol;
      totalWeight += wt;
      totalVal += val;

      if (!stopMap.has(key)) {
        stopMap.set(key, {
          recipient,
          recipientDocument: inv.recipientDocument,
          address: addr || 'Endereço de Entrega',
          numberAddress: inv.numberAddress,
          city,
          state: inv.state || 'SP',
          totalVol: 0,
          totalWeight: 0,
          totalVal: 0,
          invoices: []
        });
      }

      const grp = stopMap.get(key);
      grp.totalVol += vol;
      grp.totalWeight += wt;
      grp.totalVal += val;
      grp.invoices.push(inv);
    });

    const stops = Array.from(stopMap.values());

    // Atualizar Indicadores do Modal
    const setModalVal = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.innerText = text;
    };
    setModalVal('nf-modal-count', selectedInvoices.length + ' NFs');
    setModalVal('nf-modal-stops-count', stops.length + ' parada(s)');
    setModalVal('nf-modal-total-weight-vol', totalVol + ' vol | ' + totalWeight.toFixed(1) + ' kg');
    setModalVal('nf-modal-total-value', formatCurrency(totalVal));

    // Renderizar tabela de paradas
    const stopsTbody = document.getElementById('nf-modal-grouped-stops-table');
    if (stopsTbody) {
      stopsTbody.innerHTML = stops.map((stop, idx) => {
        const nfBadges = stop.invoices.map(i => '<span class="badge badge-purple font-mono" style="font-size:0.65rem;">NF ' + i.number + '</span>').join(' ');
        const fullAddr = [stop.address, stop.numberAddress ? 'nº ' + stop.numberAddress : '', stop.city + '/' + stop.state].filter(Boolean).join(', ');
        return '<tr>' +
          '<td class="font-bold text-center" style="color:var(--brand-light);">' + (idx + 1) + 'º</td>' +
          '<td><strong>' + stop.recipient + '</strong><br><span class="text-xs font-mono text-muted">' + (stop.recipientDocument || '') + '</span></td>' +
          '<td class="text-xs">' + fullAddr + '</td>' +
          '<td><strong class="font-mono text-xs" style="color:var(--emerald-base);">' + formatCurrency(stop.totalVal) + '</strong><br><span class="text-xs font-mono text-muted">' + stop.totalVol + ' vol &bull; ' + stop.totalWeight + ' kg</span></td>' +
          '<td><div class="flex items-center gap-1" style="flex-wrap:wrap;">' + nfBadges + '</div></td>' +
        '</tr>';
      }).join('');
    }

    renderIcons();
    openModal('modal-create-trip-from-invoices');
  }

  async function submitTripFromInvoices(action = 'DRAFT') {
    const selectedIds = Array.from(STATE.selectedInvoiceIds);
    if (selectedIds.length === 0) {
      showToast('Selecione pelo menos uma Nota Fiscal.', 'error');
      return;
    }

    const tripCode = document.getElementById('nf-modal-trip-code')?.value.trim();
    const startDate = document.getElementById('nf-modal-start-date')?.value;
    const driverId = document.getElementById('nf-modal-driver-select')?.value || undefined;
    const vehicleId = document.getElementById('nf-modal-vehicle-select')?.value || undefined;
    const origin = document.getElementById('nf-modal-origin')?.value.trim();
    const notes = document.getElementById('nf-modal-notes')?.value.trim();

    if (!tripCode) {
      showToast('Por favor, informe o código da viagem/rota.', 'error');
      return;
    }

    if (action === 'ASSIGN' && !driverId) {
      showToast('Para despachar imediatamente a rota, selecione o motorista responsável.', 'error');
      return;
    }

    try {
      showToast('Criando rota operacional a partir das Notas Fiscais...', 'info');

      const payload = {
        invoiceIds: selectedIds,
        tripCode,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        driverId: driverId || undefined,
        vehicleId: vehicleId || undefined,
        origin: origin || undefined,
        notes: notes || undefined,
        action: action
      };

      const result = await apiFetch('/api/v1/admin/invoices/create-trip', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showToast(
        action === 'ASSIGN'
          ? 'Rota ' + result.tripCode + ' criada e despachada para o motorista com sucesso!'
          : 'Rota ' + result.tripCode + ' salva como rascunho com sucesso!',
        'success'
      );

      // Limpar seleção
      STATE.selectedInvoiceIds.clear();
      closeModal('modal-create-trip-from-invoices');

      // Navegar para a visualização de viagens
      navigate('trips');
    } catch (err) {
      showToast('Erro ao criar rota a partir das NFs: ' + err.message, 'error');
    }
  }

  // ==============================================
  // 7. PEDÁGIOS CONTROLLER
  // ==============================================
  async function loadTolls() {
    const tbody = document.getElementById('tolls-table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:2rem; color:var(--text-muted);">Carregando pedágios...</td></tr>';

    try {
      const search = document.getElementById('toll-search-input')?.value.trim() || '';
      const status = document.getElementById('toll-status-filter')?.value || '';
      const startDate = document.getElementById('toll-start-date')?.value || '';
      const endDate = document.getElementById('toll-end-date')?.value || '';

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const url = '/api/v1/admin/tolls' + (params.toString() ? '?' + params.toString() : '');
      const tolls = await apiFetch(url);
      STATE.tolls = tolls || [];
      renderTollsTable();
    } catch (err) {
      showToast('Erro ao carregar pedágios: ' + err.message, 'error');
      if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:2rem; color:var(--rose-base);">Falha ao carregar pedágios</td></tr>';
    }
  }

  function renderTollsTable() {
    const tbody = document.getElementById('tolls-table-body');
    if (!tbody) return;

    if (!STATE.tolls || STATE.tolls.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:2.5rem; color:var(--text-muted);">Nenhum lançamento de pedágio encontrado com os filtros aplicados.</td></tr>';
      return;
    }

    tbody.innerHTML = STATE.tolls.map(toll => {
      const driverName = toll.driver?.user?.name || '-';
      const vehiclePlate = toll.trip?.vehicle?.plate || '-';
      const tripCode = toll.trip?.tripCode || '-';
      const receiptsCount = toll.receipts ? toll.receipts.length : 0;
      const formattedAmount = formatCurrency(toll.amount || 0);

      let statusBadge = '<span class="badge badge-muted">PENDENTE</span>';
      if (toll.status === 'APPROVED') statusBadge = '<span class="badge badge-emerald">APROVADO</span>';
      else if (toll.status === 'REJECTED') statusBadge = '<span class="badge badge-rose">REJEITADO</span>';

      return '<tr>' +
        '<td><div class="font-bold">' + (toll.plazaName || 'Praça de Pedágio') + '</div><div class="text-xs text-muted">' + (toll.concessionaire || '') + '</div></td>' +
        '<td><span class="font-semibold">' + (toll.highway || '-') + '</span>' + (toll.km ? ' <span class="text-xs text-muted">Km ' + toll.km + '</span>' : '') + '</td>' +
        '<td><strong class="font-mono text-base" style="color:var(--emerald-base);">' + formattedAmount + '</strong></td>' +
        '<td><div class="font-semibold">' + driverName + '</div><div class="text-xs text-muted font-mono">' + vehiclePlate + '</div></td>' +
        '<td>' + (toll.trip ? '<span class="font-bold cursor-pointer" onclick="openTripDetails(\\'' + toll.trip.id + '\\')" style="color:var(--brand-primary); text-decoration:underline;">' + tripCode + '</span>' : '<span class="text-muted">-</span>') + '</td>' +
        '<td><span class="badge badge-amber text-xs">' + receiptsCount + ' comprovante(s)</span></td>' +
        '<td>' + statusBadge + '</td>' +
        '<td class="text-right">' +
          '<button onclick="openTollDetails(\\'' + toll.id + '\\')" class="btn btn-secondary btn-xs">' +
            '<span data-lucide="eye" class="icon-xs"></span>' +
            '<span>Analisar</span>' +
          '</button>' +
        '</td>' +
      '</tr>';
    }).join('');

    renderIcons();
  }

  async function openTollDetails(id) {
    try {
      const toll = await apiFetch('/api/v1/admin/tolls/' + id);
      if (!toll) return;

      document.getElementById('toll-detail-title').innerText = 'Pedágio: ' + (toll.plazaName || 'Praça');
      document.getElementById('toll-detail-sub').innerText = 'Lançamento de Despesa de Viagem Operacional';

      let statusBadge = '<span class="badge badge-muted">PENDENTE (PENDING)</span>';
      if (toll.status === 'APPROVED') statusBadge = '<span class="badge badge-emerald">APROVADO (APPROVED)</span>';
      else if (toll.status === 'REJECTED') statusBadge = '<span class="badge badge-rose">REJEITADO (REJECTED)</span>';
      document.getElementById('toll-detail-status-badge').innerHTML = statusBadge;

      const actionsDiv = document.getElementById('toll-detail-actions');
      if (actionsDiv) {
        if (toll.status === 'PENDING') {
          actionsDiv.innerHTML =
            '<button onclick="initiateTollReview(\\'' + toll.id + '\\', \\'APPROVED\\')" class="btn btn-emerald btn-xs"><span data-lucide="check" class="icon-xs"></span><span>Aprovar Reembolso</span></button>' +
            '<button onclick="initiateTollReview(\\'' + toll.id + '\\', \\'REJECTED\\')" class="btn btn-rose btn-xs"><span data-lucide="x-circle" class="icon-xs"></span><span>Rejeitar Reembolso</span></button>';
        } else {
          actionsDiv.innerHTML = '<span class="text-xs font-semibold text-muted">Processado em ' + formatDate(toll.updatedAt) + '</span>';
        }
      }

      document.getElementById('toll-detail-amount').innerText = formatCurrency(toll.amount || 0);
      document.getElementById('toll-detail-plaza').innerText = (toll.plazaName || '-') + (toll.concessionaire ? ' (' + toll.concessionaire + ')' : '');
      document.getElementById('toll-detail-highway').innerText = (toll.highway || '-') + (toll.km ? ' Km ' + toll.km : '');
      document.getElementById('toll-detail-date').innerText = formatDate(toll.createdAt);

      const driverName = toll.driver?.user?.name || '-';
      const vehiclePlate = toll.trip?.vehicle?.plate || '-';
      document.getElementById('toll-detail-driver-vehicle').innerText = driverName + ' | Placa: ' + vehiclePlate;

      const tripInfo = document.getElementById('toll-detail-trip-info');
      if (toll.trip) {
        tripInfo.innerHTML = '<span style="color:var(--brand-primary);">' + toll.trip.tripCode + '</span> (' + (toll.trip.origin || '') + ' -> ' + (toll.trip.destination || '') + ')';
      } else {
        tripInfo.innerText = 'Sem viagem vinculada';
      }

      const receiptCont = document.getElementById('toll-detail-receipt-container');
      const receipts = toll.receipts || [];
      if (receipts.length === 0) {
        receiptCont.innerHTML = '<p class="text-xs text-muted" style="padding:1rem;">Nenhum comprovante fiscal em anexo.</p>';
      } else {
        receiptCont.innerHTML = receipts.map((rec, idx) => {
          return '<div style="display:flex; flex-direction:column; align-items:center; gap:0.5rem;">' +
            '<div style="max-height: 280px; width: 100%; overflow: hidden; border-radius: 0.5rem; background: #000; display:flex; align-items:center; justify-content:center;">' +
              '<img src="' + rec.receiptUrl + '" style="max-height:280px; max-width:100%; object-fit:contain;" alt="Cupom Fiscal">' +
            '</div>' +
            '<a href="' + rec.receiptUrl + '" target="_blank" class="btn btn-secondary btn-xs" style="text-decoration:none;"><span data-lucide="external-link" class="icon-xs"></span><span>Visualizar Imagem em Alta Resolução</span></a>' +
          '</div>';
        }).join('');
      }

      cancelTollReview();
      openModal('modal-toll-details');
    } catch (err) {
      showToast('Erro ao carregar detalhes do pedágio: ' + err.message, 'error');
    }
  }

  function initiateTollReview(id, targetStatus) {
    const formCont = document.getElementById('toll-review-form-container');
    const targetTitle = document.getElementById('toll-review-title');
    const reviewBtn = document.getElementById('toll-review-btn');
    document.getElementById('toll-review-id').value = id;
    document.getElementById('toll-review-target-status').value = targetStatus;
    document.getElementById('toll-review-notes').value = '';

    if (targetStatus === 'APPROVED') {
      targetTitle.innerText = 'Aprovação de Reembolso de Pedágio';
      targetTitle.style.color = 'var(--emerald-base)';
      reviewBtn.className = 'btn btn-emerald btn-sm';
      reviewBtn.innerText = 'Confirmar Aprovação';
    } else {
      targetTitle.innerText = 'Rejeição de Pedágio';
      targetTitle.style.color = 'var(--rose-base)';
      reviewBtn.className = 'btn btn-rose btn-sm';
      reviewBtn.innerText = 'Confirmar Rejeição';
    }

    formCont.style.display = 'block';
  }

  function cancelTollReview() {
    const formCont = document.getElementById('toll-review-form-container');
    if (formCont) formCont.style.display = 'none';
  }

  async function submitTollReview() {
    const id = document.getElementById('toll-review-id').value;
    const status = document.getElementById('toll-review-target-status').value;
    const notes = document.getElementById('toll-review-notes').value.trim();

    if (status === 'REJECTED' && !notes) {
      showToast('Por favor, informe a justificativa da rejeição do pedágio.', 'error');
      return;
    }

    try {
      await apiFetch('/api/v1/admin/tolls/' + id + '/status', {
        method: 'PATCH',
        body: JSON.stringify({ status, notes: notes || undefined })
      });
      showToast('Pedágio ' + (status === 'APPROVED' ? 'aprovado' : 'rejeitado') + ' com sucesso!', 'success');
      closeModal('modal-toll-details');
      loadTolls();
    } catch (err) {
      showToast('Erro ao atualizar pedágio: ' + err.message, 'error');
    }
  }

  // ==============================================
  // 8. OCORRÊNCIAS CONTROLLER
  // ==============================================
  async function loadOccurrences() {
    const tbody = document.getElementById('occurrences-table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding:2rem; color:var(--text-muted);">Carregando ocorrências...</td></tr>';

    try {
      const search = document.getElementById('occurrence-search-input')?.value.trim() || '';
      const type = document.getElementById('occurrence-type-filter')?.value || '';
      const status = document.getElementById('occurrence-status-filter')?.value || '';
      const startDate = document.getElementById('occurrence-start-date')?.value || '';
      const endDate = document.getElementById('occurrence-end-date')?.value || '';

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (type) params.append('type', type);
      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const url = '/api/v1/admin/occurrences' + (params.toString() ? '?' + params.toString() : '');
      const occurrences = await apiFetch(url);
      STATE.occurrences = occurrences || [];
      renderOccurrencesTable();
    } catch (err) {
      showToast('Erro ao carregar ocorrências: ' + err.message, 'error');
      if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding:2rem; color:var(--rose-base);">Falha ao carregar ocorrências</td></tr>';
    }
  }

  function renderOccurrencesTable() {
    const tbody = document.getElementById('occurrences-table-body');
    if (!tbody) return;

    if (!STATE.occurrences || STATE.occurrences.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding:2.5rem; color:var(--text-muted);">Nenhuma ocorrência encontrada com os filtros aplicados.</td></tr>';
      return;
    }

    tbody.innerHTML = STATE.occurrences.map(occ => {
      const driverName = occ.driver?.user?.name || '-';
      const tripCode = occ.trip?.tripCode || '-';
      const deliveryRecipient = occ.delivery?.recipient || '-';

      let statusBadge = '<span class="badge badge-rose">ABERTA</span>';
      if (occ.status === 'IN_ANALYSIS') statusBadge = '<span class="badge badge-amber">EM ANÁLISE</span>';
      else if (occ.status === 'RESOLVED') statusBadge = '<span class="badge badge-emerald">RESOLVIDA</span>';

      return '<tr>' +
        '<td><div class="font-bold" style="color:var(--rose-base);">' + occ.type + '</div><div class="text-xs text-muted truncate" style="max-width:220px;">' + occ.title + '</div></td>' +
        '<td>' + (occ.trip ? '<span class="font-bold cursor-pointer" onclick="openTripDetails(\\'' + occ.trip.id + '\\')" style="color:var(--brand-primary); text-decoration:underline;">' + tripCode + '</span>' : '<span class="text-muted">-</span>') + '</td>' +
        '<td><span class="font-semibold">' + driverName + '</span></td>' +
        '<td><span class="text-xs">' + deliveryRecipient + '</span></td>' +
        '<td><span class="text-xs">' + formatDate(occ.createdAt) + '</span></td>' +
        '<td>' + statusBadge + '</td>' +
        '<td class="text-right">' +
          '<button onclick="openOccurrenceDetails(\\'' + occ.id + '\\')" class="btn btn-secondary btn-xs">' +
            '<span data-lucide="edit-2" class="icon-xs"></span>' +
            '<span>Tratar</span>' +
          '</button>' +
        '</td>' +
      '</tr>';
    }).join('');

    renderIcons();
  }

  async function openOccurrenceDetails(id) {
    try {
      const occ = STATE.occurrences.find(o => o.id === id);
      if (!occ) return;

      document.getElementById('occ-detail-title').innerText = occ.title || ('Ocorrência ' + occ.type);
      document.getElementById('occ-detail-sub').innerText = 'ID: ' + occ.id;

      let statusBadge = '<span class="badge badge-rose">ABERTA (OPEN)</span>';
      if (occ.status === 'IN_ANALYSIS') statusBadge = '<span class="badge badge-amber">EM ANÁLISE (IN_ANALYSIS)</span>';
      else if (occ.status === 'RESOLVED') statusBadge = '<span class="badge badge-emerald">RESOLVIDA (RESOLVED)</span>';
      document.getElementById('occ-detail-status-badge').innerHTML = statusBadge;

      const actionsDiv = document.getElementById('occ-detail-actions');
      if (actionsDiv) {
        if (occ.status === 'OPEN') {
          actionsDiv.innerHTML =
            '<button onclick="initiateOccResolution(\\'' + occ.id + '\\', \\'IN_ANALYSIS\\')" class="btn btn-warning btn-xs"><span data-lucide="clock" class="icon-xs"></span><span>Colocar em Análise</span></button>' +
            '<button onclick="initiateOccResolution(\\'' + occ.id + '\\', \\'RESOLVED\\')" class="btn btn-emerald btn-xs"><span data-lucide="check" class="icon-xs"></span><span>Resolver Diretamente</span></button>';
        } else if (occ.status === 'IN_ANALYSIS') {
          actionsDiv.innerHTML =
            '<button onclick="initiateOccResolution(\\'' + occ.id + '\\', \\'RESOLVED\\')" class="btn btn-emerald btn-xs"><span data-lucide="check" class="icon-xs"></span><span>Concluir e Resolver</span></button>';
        } else {
          actionsDiv.innerHTML = '<span class="text-xs font-semibold text-muted">Resolvida em ' + formatDate(occ.updatedAt) + '</span>';
        }
      }

      document.getElementById('occ-detail-type').innerText = occ.type;
      document.getElementById('occ-detail-driver').innerText = occ.driver?.user?.name || '-';
      document.getElementById('occ-detail-trip').innerText = occ.trip ? (occ.trip.tripCode + ' (' + (occ.trip.origin || '') + ' -> ' + (occ.trip.destination || '') + ')') : '-';
      document.getElementById('occ-detail-date').innerText = formatDate(occ.createdAt);
      document.getElementById('occ-detail-desc').innerText = occ.description || 'Sem descrição informada.';

      cancelOccResolution();
      openModal('modal-occurrence-details');
    } catch (err) {
      showToast('Erro ao carregar detalhes da ocorrência: ' + err.message, 'error');
    }
  }

  function initiateOccResolution(id, targetStatus) {
    const formCont = document.getElementById('occ-resolution-form-container');
    const targetTitle = document.getElementById('occ-resolution-title');
    const resolutionBtn = document.getElementById('occ-resolution-btn');
    document.getElementById('occ-resolution-id').value = id;
    document.getElementById('occ-resolution-target-status').value = targetStatus;
    document.getElementById('occ-resolution-notes').value = '';

    if (targetStatus === 'IN_ANALYSIS') {
      targetTitle.innerText = 'Encaminhar Ocorrência para Análise';
      targetTitle.style.color = 'var(--amber-base)';
      resolutionBtn.className = 'btn btn-warning btn-sm';
      resolutionBtn.innerText = 'Iniciar Análise';
    } else {
      targetTitle.innerText = 'Resolução e Fechamento da Ocorrência';
      targetTitle.style.color = 'var(--emerald-base)';
      resolutionBtn.className = 'btn btn-emerald btn-sm';
      resolutionBtn.innerText = 'Concluir Ocorrência';
    }

    formCont.style.display = 'block';
  }

  function cancelOccResolution() {
    const formCont = document.getElementById('occ-resolution-form-container');
    if (formCont) formCont.style.display = 'none';
  }

  async function submitOccResolution() {
    const id = document.getElementById('occ-resolution-id').value;
    const status = document.getElementById('occ-resolution-target-status').value;
    const notes = document.getElementById('occ-resolution-notes').value.trim();

    try {
      await apiFetch('/api/v1/admin/occurrences/' + id + '/status', {
        method: 'PATCH',
        body: JSON.stringify({ status, resolutionNotes: notes || undefined })
      });
      showToast('Status da ocorrência atualizado com sucesso!', 'success');
      closeModal('modal-occurrence-details');
      loadOccurrences();
    } catch (err) {
      showToast('Erro ao atualizar ocorrência: ' + err.message, 'error');
    }
  }

  // ==============================================
  // 9. RASTREAMENTO & TELEMETRIA
  // ==============================================
  async function loadTracking() {
    try {
      const data = await apiFetch('/api/v1/admin/tracking');
      STATE.trackingLocations = data.drivers || [];

      // Update stat cards
      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = (val !== null && val !== undefined) ? val : '0';
      };

      setVal('tracking-stat-total', data.stats?.totalDrivers || 0);
      setVal('tracking-stat-recent', data.stats?.recentCount || 0);
      setVal('tracking-stat-outdated', data.stats?.outdatedCount || 0);
      setVal('tracking-stat-no-signal', data.stats?.noSignalCount || 0);
      setVal('tracking-stat-in-trip', data.stats?.inTripCount || 0);

      renderTrackingTable();
    } catch (err) {
      showToast('Erro ao carregar posições de rastreamento: ' + err.message, 'error');
    }
  }

  function getTelemetryStatusBadge(status, minutes) {
    if (status === 'RECENT') {
      const minText = minutes !== null ? (minutes === 0 ? ' (Agora)' : ' (' + minutes + ' min)') : '';
      return '<span class="badge badge-emerald"><span data-lucide="wifi" class="icon-xs"></span> RECENTE' + minText + '</span>';
    }
    if (status === 'OUTDATED') {
      const minText = minutes !== null ? ' (' + minutes + ' min)' : '';
      return '<span class="badge badge-amber"><span data-lucide="clock" class="icon-xs"></span> DESATUALIZADA' + minText + '</span>';
    }
    return '<span class="badge badge-rose"><span data-lucide="wifi-off" class="icon-xs"></span> SEM SINAL</span>';
  }

  function renderTrackingTable() {
    const tbody = document.getElementById('tracking-table-body');
    if (!tbody) return;

    if (!STATE.trackingLocations || STATE.trackingLocations.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center" style="padding: 2rem; color: var(--text-muted);">Nenhum motorista registrado no rastreamento.</td></tr>';
      return;
    }

    tbody.innerHTML = STATE.trackingLocations.map(d => {
      const phone = formatPhone(d.driverPhone);
      const vehicle = (d.vehiclePlate && d.vehiclePlate !== '-') ? (d.vehiclePlate + (d.vehicleModel ? ' - ' + d.vehicleModel : '')) : '<span class="badge badge-danger">Sem Veículo</span>';
      
      const trip = d.activeTrip
        ? '<strong class="font-mono text-xs" style="color:var(--brand-light);">' + d.activeTrip.tripCode + '</strong><br><span class="text-xs text-muted truncate" style="max-width:140px; display:inline-block;">' + (d.activeTrip.origin || '') + ' &rarr; ' + (d.activeTrip.destination || '') + '</span>'
        : '<span class="text-xs text-muted">Sem viagem ativa</span>';

      const coords = d.telemetry
        ? '<strong class="font-mono text-xs text-white">' + d.telemetry.latitude.toFixed(5) + ', ' + d.telemetry.longitude.toFixed(5) + '</strong>'
        : '<span class="text-xs text-muted font-mono">-</span>';

      const speed = d.telemetry && d.telemetry.speed !== null
        ? '<span class="font-mono text-xs font-bold" style="color:var(--cyan-base);">' + d.telemetry.speed + ' km/h</span>'
        : '<span class="text-xs text-muted">-</span>';

      const accuracy = d.telemetry && d.telemetry.accuracy !== null
        ? '<span class="font-mono text-xs text-muted">&plusmn; ' + d.telemetry.accuracy + ' m</span>'
        : '<span class="text-xs text-muted">-</span>';

      const lastSent = d.telemetry && d.telemetry.capturedAt ? formatDate(d.telemetry.capturedAt) : '<span class="text-xs text-muted">Nunca transmitido</span>';

      return '<tr>' +
        '<td><strong>' + d.driverName + '</strong></td>' +
        '<td class="font-mono text-xs">' + phone + '</td>' +
        '<td class="text-xs">' + vehicle + '</td>' +
        '<td>' + trip + '</td>' +
        '<td>' + coords + '</td>' +
        '<td>' + speed + '</td>' +
        '<td>' + accuracy + '</td>' +
        '<td class="text-xs">' + lastSent + '</td>' +
        '<td>' + getTelemetryStatusBadge(d.telemetryStatus, d.minutesSinceLastUpdate) + '</td>' +
      '</tr>';
    }).join('');

    renderIcons();
  }

  // ==============================================
  // 10. CONFIGURAÇÕES & STATUS DO SISTEMA
  // ==============================================
  async function loadSystemConfig() {
    try {
      const cfg = await apiFetch('/api/v1/admin/config');
      STATE.systemConfig = cfg;

      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = (val !== null && val !== undefined) ? val : '-';
      };

      setVal('config-db-engine', cfg.database?.engine);
      setVal('config-db-orm', cfg.database?.orm);
      setVal('config-health-status', cfg.health?.status);
      setVal('config-uptime', cfg.health?.uptime);

      const dbBadge = document.getElementById('config-db-badge');
      if (dbBadge) {
        if (cfg.database?.status === 'CONNECTED') {
          dbBadge.className = 'badge badge-success';
          dbBadge.innerText = 'CONECTADO';
        } else {
          dbBadge.className = 'badge badge-danger';
          dbBadge.innerText = 'DESCONECTADO';
        }
      }

      setVal('config-sec-hash', cfg.security?.passwordHashing);
      setVal('config-sec-token', cfg.security?.tokenStrategy);
      setVal('config-sec-webhook', cfg.security?.erpWebhookSecurity);
      setVal('config-sec-idemp', cfg.security?.idempotencyStore);

      setVal('config-env', cfg.environment);
      setVal('config-backend-ver', cfg.backendFramework);
      setVal('config-android-ver', cfg.androidVersion);
      setVal('config-telemetry-sla', cfg.integrations?.telemetryFrequency);

      showToast('Configurações operacionais validadas com sucesso!', 'success');
      renderIcons();
    } catch (err) {
      showToast('Erro ao carregar configurações do sistema: ' + err.message, 'error');
    }
  }

  // ==============================================
  // INITIALIZATION & EVENT LISTENERS
  // ==============================================
  document.addEventListener('DOMContentLoaded', () => {
    updateDiag('diag-js', 'SIM', 'var(--emerald-base)');
    updateDiag('diag-dom', 'SIM', 'var(--emerald-base)');

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      updateDiag('diag-form', 'SIM', 'var(--emerald-base)');
      loginForm.addEventListener('submit', handleLogin);
      updateDiag('diag-listener', 'SIM', 'var(--emerald-base)');
    }

    const togglePwdBtn = document.getElementById('toggle-pwd-btn');
    if (togglePwdBtn) {
      togglePwdBtn.addEventListener('click', () => {
        const pwdInput = document.getElementById('login-password');
        if (pwdInput) {
          pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
        }
      });
    }

    // Modal forms
    document.getElementById('form-user')?.addEventListener('submit', handleUserSubmit);
    document.getElementById('form-reset-pwd')?.addEventListener('submit', handleResetPasswordSubmit);
    document.getElementById('form-assign-vehicle')?.addEventListener('submit', handleAssignVehicleSubmit);
    document.getElementById('form-vehicle')?.addEventListener('submit', handleVehicleSubmit);
    document.getElementById('form-trip-status')?.addEventListener('submit', handleTripStatusSubmit);

    // Search and filter inputs
    document.getElementById('driver-search-input')?.addEventListener('input', renderUsersTable);
    document.getElementById('driver-role-filter')?.addEventListener('change', renderUsersTable);
    document.getElementById('driver-status-filter')?.addEventListener('change', renderUsersTable);

    document.getElementById('vehicle-search-input')?.addEventListener('input', renderVehiclesTable);
    document.getElementById('vehicle-status-filter')?.addEventListener('change', renderVehiclesTable);

    document.getElementById('trip-search-input')?.addEventListener('input', renderTripsTable);
    document.getElementById('trip-status-filter')?.addEventListener('change', renderTripsTable);

    // Romaneio search and filter inputs
    document.getElementById('romaneio-search-input')?.addEventListener('input', () => loadRomaneios());
    document.getElementById('romaneio-status-filter')?.addEventListener('change', () => loadRomaneios());
    document.getElementById('romaneio-start-date')?.addEventListener('change', () => loadRomaneios());
    document.getElementById('romaneio-end-date')?.addEventListener('change', () => loadRomaneios());

    // Toll search and filter inputs
    document.getElementById('toll-search-input')?.addEventListener('input', () => loadTolls());
    document.getElementById('toll-status-filter')?.addEventListener('change', () => loadTolls());
    document.getElementById('toll-start-date')?.addEventListener('change', () => loadTolls());
    document.getElementById('toll-end-date')?.addEventListener('change', () => loadTolls());

    // Occurrence search and filter inputs
    document.getElementById('occurrence-search-input')?.addEventListener('input', () => loadOccurrences());
    document.getElementById('occurrence-type-filter')?.addEventListener('change', () => loadOccurrences());
    document.getElementById('occurrence-status-filter')?.addEventListener('change', () => loadOccurrences());
    document.getElementById('occurrence-start-date')?.addEventListener('change', () => loadOccurrences());
    document.getElementById('occurrence-end-date')?.addEventListener('change', () => loadOccurrences());

    // Initial check for active session
    const savedToken = localStorage.getItem('hk_access_token');
    const savedUser = localStorage.getItem('hk_user');

    if (savedToken && savedUser) {
      try {
        STATE.token = savedToken;
        STATE.refreshToken = localStorage.getItem('hk_refresh_token');
        STATE.user = JSON.parse(savedUser);
        showApp();
      } catch {
        handleLogout();
      }
    } else {
      renderIcons();
    }
  });
`;
