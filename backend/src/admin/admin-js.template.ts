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
    tolls: [],
    occurrences: [],
    settlements: [],
    trackingLocations: [],
    erpLogs: [],
    auditLogs: [],
    systemConfig: null,
    stats: null,
    unlinkedDrivers: []
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

    ['dashboard', 'drivers', 'vehicles', 'trips', 'romaneios', 'invoices', 'tolls', 'occurrences', 'finance', 'tracking', 'erp', 'audit', 'config'].forEach(v => {
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
        dashboard: 'Dashboard Geral',
        drivers: 'Gestão de Motoristas e Usuários',
        vehicles: 'Frota de Veículos',
        trips: 'Operação de Viagens',
        romaneios: 'Gestão de Romaneios',
        invoices: 'Notas Fiscais de Transporte',
        tolls: 'Controle de Pedágios & Reembolsos',
        occurrences: 'Tratamento de Ocorrências',
        finance: 'Gestão Financeira & Fechamentos',
        tracking: 'Rastreamento & Telemetria em Tempo Real',
        erp: 'Integração ERP (Inbound & Outbound)',
        audit: 'Auditoria de Ações & Segurança',
        config: 'Configurações & Status do Sistema'
      };
      pageTitle.innerText = titles[view] || 'Dashboard';
    }

    renderIcons();

    if (view === 'dashboard') loadDashboard();
    else if (view === 'drivers') loadUsers();
    else if (view === 'vehicles') loadVehicles();
    else if (view === 'trips') loadTrips();
    else if (view === 'romaneios') loadRomaneios();
    else if (view === 'invoices') loadInvoices();
    else if (view === 'tolls') loadTolls();
    else if (view === 'occurrences') loadOccurrences();
    else if (view === 'finance') loadSettlements();
    else if (view === 'tracking') loadTracking();
    else if (view === 'erp') loadErpLogs();
    else if (view === 'audit') loadAuditLogs();
    else if (view === 'config') loadSystemConfig();
  }

  function refreshCurrentView() {
    navigate(STATE.currentView);
  }

  // ==============================================
  // 1. DASHBOARD CONTROLLER
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

      setVal('stat-total-users', stats.totalUsers);
      setVal('stat-active-users', stats.activeUsers);
      setVal('stat-total-drivers', stats.totalDrivers);
      setVal('stat-active-drivers', stats.activeDrivers);
      setVal('stat-available-drivers', stats.availableDrivers);
      setVal('stat-in-trip-drivers', stats.inTripDrivers);
      setVal('stat-drivers-no-vehicle', stats.driversWithoutVehicle);
      setVal('stat-erp-drivers', stats.erpOnlyDrivers);
      setVal('stat-total-vehicles', stats.totalVehicles);
      setVal('stat-active-vehicles', stats.activeVehicles);
      setVal('stat-pending-trips', stats.pendingTrips);
      setVal('stat-in-progress-trips', stats.inProgressTrips);
      setVal('stat-completed-trips', stats.completedTrips);

      // New FASE 3 Dashboard Stats
      setVal('stat-pending-settlements-amount', formatCurrency(stats.pendingSettlementsAmount || 0));
      const pendingSettlementsCountEl = document.getElementById('stat-pending-settlements-count');
      if (pendingSettlementsCountEl) {
        pendingSettlementsCountEl.innerText = (stats.pendingSettlementsCount || 0) + ' fechamentos a pagar';
      }
      setVal('stat-drivers-no-signal', stats.driversNoSignalCount || 0);
      setVal('stat-erp-failures', stats.erpFailuresCount || 0);
      setVal('stat-open-occurrences', stats.openOccurrences || 0);
      setVal('stat-pending-tolls', formatCurrency(stats.pendingTollsAmount || 0));

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
            const name = d.user?.name || 'Motorista ERP (' + (d.cnh || d.id.slice(0,6)) + ')';
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
              '<span class="badge badge-warning text-xs">' + occ.status + '</span>' +
            '</div>';
          }).join('');
        }
      }

      // Render ERP unlinked drivers
      const erpDiv = document.getElementById('unlinked-drivers-list');
      const erpBadge = document.getElementById('erp-badge');
      if (erpDiv) {
        const unlinked = stats.unlinkedDriversList || [];
        if (erpBadge) erpBadge.innerText = unlinked.length + ' pendentes';
        if (unlinked.length === 0) {
          erpDiv.innerHTML = '<p class="text-xs" style="color: var(--emerald-base); font-style: italic; padding: 1rem 0;">Nenhum motorista pendente de vínculo.</p>';
        } else {
          erpDiv.innerHTML = unlinked.map(d => {
            const desc = d.cnh ? 'CNH: ' + d.cnh : 'ID: ' + d.id.slice(0, 8);
            return '<div style="padding:0.6rem; border-radius:0.5rem; background:var(--bg-surface-elevated); border:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:space-between;">' +
              '<div>' +
                '<strong class="text-xs" style="color:var(--purple-base);">' + desc + '</strong>' +
                '<p class="text-xs text-muted">Importado via ERP &bull; ' + formatDate(d.createdAt) + '</p>' +
              '</div>' +
              '<button onclick="openCreateUserModal(\\'DRIVER\\')" class="btn btn-primary btn-sm">Criar Login</button>' +
            '</div>';
          }).join('');
        }
      }

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
  // 4. VIAGENS CONTROLLER
  // ==============================================
  async function loadTrips() {
    try {
      const trips = await apiFetch('/api/v1/admin/trips');
      STATE.trips = trips;
      renderTripsTable();
    } catch (err) {
      showToast('Erro ao carregar viagens: ' + err.message, 'error');
    }
  }

  function getTripStatusBadge(status) {
    if (status === 'IN_PROGRESS') return '<span class="badge badge-brand"><span class="spinner" style="width:8px;height:8px;"></span> EM ANDAMENTO</span>';
    if (status === 'COMPLETED') return '<span class="badge badge-success">CONCLUÍDA</span>';
    if (status === 'ASSIGNED') return '<span class="badge badge-warning">ATRIBUÍDA</span>';
    if (status === 'PENDING') return '<span class="badge badge-warning">PENDENTE</span>';
    if (status === 'ACCEPTED') return '<span class="badge badge-cyan">ACEITA</span>';
    if (status === 'CANCELLED') return '<span class="badge badge-danger">CANCELADA</span>';
    return '<span class="badge badge-muted">' + (status || '-') + '</span>';
  }

  function renderTripsTable() {
    const tbody = document.getElementById('trips-table-body');
    if (!tbody) return;

    const searchTerm = (document.getElementById('trip-search-input')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('trip-status-filter')?.value || '';

    const filtered = STATE.trips.filter(t => {
      const matchStatus = !statusFilter || t.status === statusFilter;
      const searchStr = (t.tripCode + ' ' + (t.origin || '') + ' ' + (t.destination || '') + ' ' + (t.driver?.user?.name || '') + ' ' + (t.vehicle?.plate || '')).toLowerCase();
      const matchSearch = !searchTerm || searchStr.includes(searchTerm);
      return matchStatus && matchSearch;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 2rem; color: var(--text-muted);">Nenhuma viagem encontrada.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(t => {
      const driverName = t.driver?.user?.name || 'Não atribuído';
      const plate = t.vehicle?.plate ? '<span class="font-mono badge badge-cyan">' + t.vehicle.plate + '</span>' : '<span class="text-xs text-muted">Sem veículo</span>';

      return '<tr>' +
        '<td><strong class="font-mono text-sm" style="color:var(--brand-light);">' + (t.tripCode || t.id.slice(0,8)) + '</strong></td>' +
        '<td><strong>' + driverName + '</strong></td>' +
        '<td>' + plate + '</td>' +
        '<td>' +
          '<div class="text-xs"><strong>De:</strong> ' + (t.origin || '-') + '</div>' +
          '<div class="text-xs text-muted"><strong>Para:</strong> ' + (t.destination || '-') + '</div>' +
        '</td>' +
        '<td>' + getTripStatusBadge(t.status) + '</td>' +
        '<td>' +
          '<div class="text-xs">' + formatDate(t.startDate || t.createdAt) + '</div>' +
          (t.endDate ? '<div class="text-xs text-muted">Fim: ' + formatDate(t.endDate) + '</div>' : '') +
        '</td>' +
        '<td class="text-right">' +
          '<div class="flex items-center justify-end gap-1">' +
            '<button onclick="openTripDetailsModal(\\'' + t.id + '\\')" class="btn btn-secondary btn-sm">Detalhes</button>' +
            (t.status !== 'COMPLETED' && t.status !== 'CANCELLED' ? '<button onclick="openUpdateTripStatusModal(\\'' + t.id + '\\', \\'' + (t.tripCode || '').replace(/'/g, "\\\\'") + '\\', \\'' + t.status + '\\')" class="btn btn-primary btn-sm">Status</button>' : '') +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join('');

    renderIcons();
  }

  // DETALHES COMPLETOS DA VIAGEM
  async function openTripDetailsModal(tripId) {
    try {
      const t = await apiFetch('/api/v1/admin/trips/' + tripId);
      document.getElementById('trip-detail-code').innerText = 'Viagem #' + (t.tripCode || t.id.slice(0, 8));
      document.getElementById('trip-detail-route').innerText = (t.origin || 'Origem') + ' &rarr; ' + (t.destination || 'Destino');
      document.getElementById('trip-detail-status-badge').innerHTML = getTripStatusBadge(t.status);

      // Status actions bar
      const actionsEl = document.getElementById('trip-detail-actions');
      if (t.status === 'COMPLETED' || t.status === 'CANCELLED') {
        actionsEl.innerHTML = '<span class="text-xs text-muted">Viagem em estado final (' + t.status + '). Não permite alterações.</span>';
      } else {
        actionsEl.innerHTML = '<button onclick="openUpdateTripStatusModal(\\'' + t.id + '\\', \\'' + (t.tripCode || '').replace(/'/g, "\\\\'") + '\\', \\'' + t.status + '\\')" class="btn btn-primary btn-sm">Alterar Status Operacional</button>';
      }

      document.getElementById('trip-detail-driver').innerText = t.driver?.user?.name || 'Não vinculado';
      document.getElementById('trip-detail-vehicle').innerText = t.vehicle ? t.vehicle.plate + ' (' + (t.vehicle.model || '') + ')' : 'Não vinculado';
      document.getElementById('trip-detail-start').innerText = formatDate(t.startDate || t.acceptedAt);
      document.getElementById('trip-detail-end').innerText = formatDate(t.endDate);

      // Deliveries table
      const delTbody = document.getElementById('trip-detail-deliveries-table');
      if (delTbody) {
        const deliveries = t.deliveries || [];
        if (deliveries.length === 0) {
          delTbody.innerHTML = '<tr><td colspan="6" class="text-center text-xs" style="padding:1rem; color:var(--text-muted);">Nenhuma entrega associada no manifesto.</td></tr>';
        } else {
          delTbody.innerHTML = deliveries.map((d, i) => {
            const seq = d.sequence || (i + 1);
            const address = [d.address, d.numberAddress, d.neighborhood, d.city, d.state].filter(Boolean).join(', ');
            const weightVol = (d.weight ? d.weight + ' kg' : '-') + ' / ' + (d.volumeCount || 1) + ' vol';
            const valueStr = formatCurrency(d.value);
            return '<tr>' +
              '<td><strong class="font-mono text-xs">#' + seq + '</strong></td>' +
              '<td><strong>' + (d.recipient || d.customerName || 'Cliente') + '</strong></td>' +
              '<td class="text-xs truncate" style="max-width:200px;" title="' + address + '">' + address + '</td>' +
              '<td class="text-xs font-mono">' + weightVol + '</td>' +
              '<td class="text-xs font-mono" style="color:var(--emerald-base);">' + valueStr + '</td>' +
              '<td><span class="badge badge-muted text-xs">' + d.status + '</span></td>' +
            '</tr>';
          }).join('');
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
      refreshCurrentView();
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
  // 6. NOTAS FISCAIS CONTROLLER
  // ==============================================
  async function loadInvoices() {
    const tbody = document.getElementById('invoices-table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:2rem; color:var(--text-muted);">Carregando notas fiscais...</td></tr>';

    try {
      const search = document.getElementById('invoice-search-input')?.value.trim() || '';
      const status = document.getElementById('invoice-status-filter')?.value || '';
      const startDate = document.getElementById('invoice-start-date')?.value || '';
      const endDate = document.getElementById('invoice-end-date')?.value || '';

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const url = '/api/v1/admin/invoices' + (params.toString() ? '?' + params.toString() : '');
      const invoices = await apiFetch(url);
      STATE.invoices = invoices || [];
      renderInvoicesTable();
    } catch (err) {
      showToast('Erro ao carregar notas fiscais: ' + err.message, 'error');
      if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:2rem; color:var(--rose-base);">Falha ao carregar notas fiscais</td></tr>';
    }
  }

  function renderInvoicesTable() {
    const tbody = document.getElementById('invoices-table-body');
    if (!tbody) return;

    if (!STATE.invoices || STATE.invoices.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:2.5rem; color:var(--text-muted);">Nenhuma nota fiscal encontrada com os filtros aplicados.</td></tr>';
      return;
    }

    tbody.innerHTML = STATE.invoices.map(inv => {
      const tripCode = inv.trip?.tripCode || '-';
      const driverName = inv.trip?.driver?.user?.name || '-';
      const recipient = inv.recipient || inv.delivery?.recipient || '-';
      const location = (inv.delivery?.city && inv.delivery?.state) ? (inv.delivery.city + '/' + inv.delivery.state) : '-';
      const accessKeyShort = inv.accessKey ? (inv.accessKey.slice(0, 6) + '...' + inv.accessKey.slice(-6)) : '-';
      const formattedValue = inv.totalValue ? formatCurrency(inv.totalValue) : (inv.value ? formatCurrency(inv.value) : 'R$ 0,00');

      let statusBadge = '<span class="badge badge-muted">' + inv.status + '</span>';
      if (inv.status === 'DELIVERED') statusBadge = '<span class="badge badge-emerald">ENTREGUE</span>';
      else if (inv.status === 'IN_TRANSIT') statusBadge = '<span class="badge badge-cyan">EM TRÂNSITO</span>';
      else if (inv.status === 'RETURNED' || inv.status === 'CANCELLED') statusBadge = '<span class="badge badge-rose">' + inv.status + '</span>';

      return '<tr>' +
        '<td><span class="font-mono font-bold">' + (inv.number || '-') + (inv.series ? ' / ' + inv.series : '') + '</span></td>' +
        '<td><span class="font-mono text-xs" title="' + (inv.accessKey || '') + '" style="color:var(--brand-light);">' + accessKeyShort + '</span></td>' +
        '<td><div class="font-semibold truncate" style="max-width:200px;">' + recipient + '</div><div class="text-xs text-muted">' + location + '</div></td>' +
        '<td><div class="font-bold">' + tripCode + '</div><div class="text-xs text-muted">' + driverName + '</div></td>' +
        '<td><span class="font-mono text-xs">' + (inv.volumes || 0) + ' vol | ' + (inv.weightKg || 0) + ' kg</span></td>' +
        '<td><strong class="font-mono" style="color:var(--emerald-base);">' + formattedValue + '</strong></td>' +
        '<td>' + statusBadge + '</td>' +
        '<td class="text-right">' +
          '<button onclick="openInvoiceDetails(\\'' + inv.id + '\\')" class="btn btn-secondary btn-xs">' +
            '<span data-lucide="eye" class="icon-xs"></span>' +
            '<span>Detalhes</span>' +
          '</button>' +
        '</td>' +
      '</tr>';
    }).join('');

    renderIcons();
  }

  async function openInvoiceDetails(id) {
    try {
      const invoice = await apiFetch('/api/v1/admin/invoices/' + id);
      if (!invoice) return;

      document.getElementById('invoice-detail-title').innerText = 'NF-e nº ' + (invoice.number || '-') + (invoice.series ? ' (Série ' + invoice.series + ')' : '');
      document.getElementById('invoice-detail-sub').innerText = 'Cadastrada no HK Connect via ERP Integrado';
      document.getElementById('invoice-detail-key').innerText = invoice.accessKey || 'Não informada';
      document.getElementById('invoice-detail-number').innerText = (invoice.number || '-') + ' / ' + (invoice.series || '1');
      document.getElementById('invoice-detail-value').innerText = invoice.totalValue ? formatCurrency(invoice.totalValue) : (invoice.value ? formatCurrency(invoice.value) : 'R$ 0,00');
      document.getElementById('invoice-detail-weight-vol').innerText = (invoice.volumes || 0) + ' volumes | ' + (invoice.weightKg || 0) + ' kg';

      let statusBadge = '<span class="badge badge-muted">' + invoice.status + '</span>';
      if (invoice.status === 'DELIVERED') statusBadge = '<span class="badge badge-emerald">ENTREGUE</span>';
      else if (invoice.status === 'IN_TRANSIT') statusBadge = '<span class="badge badge-cyan">EM TRÂNSITO</span>';
      else if (invoice.status === 'RETURNED' || invoice.status === 'CANCELLED') statusBadge = '<span class="badge badge-rose">' + invoice.status + '</span>';
      document.getElementById('invoice-detail-status-badge').innerHTML = statusBadge;

      document.getElementById('invoice-detail-recipient').innerText = invoice.recipient || invoice.delivery?.recipient || 'Não informado';
      const address = invoice.delivery?.address || (invoice.delivery?.city ? (invoice.delivery.city + '/' + (invoice.delivery.state || '')) : 'Não informado');
      document.getElementById('invoice-detail-address').innerText = address;

      const tripInfo = document.getElementById('invoice-detail-trip-info');
      const tripAction = document.getElementById('invoice-detail-trip-action');
      if (invoice.trip) {
        tripInfo.innerHTML = 'Viagem: <span style="color:var(--brand-primary);">' + invoice.trip.tripCode + '</span> (' + (invoice.trip.origin || '') + ' -> ' + (invoice.trip.destination || '') + ') - Motorista: ' + (invoice.trip.driver?.user?.name || '-');
        tripAction.innerHTML = '<button onclick="closeModal(\\'modal-invoice-details\\'); openTripDetails(\\'' + invoice.trip.id + '\\');" class="btn btn-secondary btn-xs"><span data-lucide="navigation" class="icon-xs"></span><span>Ver Viagem</span></button>';
      } else {
        tripInfo.innerText = 'Sem viagem associada no momento';
        tripAction.innerHTML = '';
      }

      openModal('modal-invoice-details');
    } catch (err) {
      showToast('Erro ao carregar detalhes da nota fiscal: ' + err.message, 'error');
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
  // 9. FINANCEIRO (FECHAMENTOS & LIQUIDAÇÃO)
  // ==============================================
  async function loadSettlements() {
    try {
      const search = document.getElementById('finance-search-input')?.value || '';
      const status = document.getElementById('finance-status-filter')?.value || '';
      const driverId = document.getElementById('finance-driver-filter')?.value || '';
      const startDate = document.getElementById('finance-start-date')?.value || '';
      const endDate = document.getElementById('finance-end-date')?.value || '';

      let queryUrl = '/api/v1/admin/settlements?';
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (driverId) params.append('driverId', driverId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const settlements = await apiFetch(queryUrl + params.toString());
      STATE.settlements = settlements;

      // Populate driver filter dropdown if not populated
      const driverSelect = document.getElementById('finance-driver-filter');
      if (driverSelect && driverSelect.options.length <= 1) {
        try {
          const drivers = await apiFetch('/api/v1/admin/drivers');
          drivers.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.innerText = d.user?.name ? (d.user.name + ' (' + (d.user.cpf || d.cnh || d.id.slice(0,6)) + ')') : ('Motorista ERP (' + (d.cnh || d.id.slice(0,6)) + ')');
            driverSelect.appendChild(opt);
          });
        } catch (e) {
          console.error('Erro ao carregar lista de motoristas para filtro:', e);
        }
      }

      // Calculate totals
      let totalCount = settlements.length;
      let pendingCount = 0;
      let pendingAmount = 0;
      let paidCount = 0;
      let paidAmount = 0;

      settlements.forEach(s => {
        if (s.status === 'PAID') {
          paidCount++;
          paidAmount += s.netAmount || 0;
        } else if (s.status === 'PENDING') {
          pendingCount++;
          pendingAmount += s.netAmount || 0;
        }
      });

      const countEl = document.getElementById('finance-total-count');
      if (countEl) countEl.innerText = totalCount;

      const pendAmtEl = document.getElementById('finance-pending-amount');
      if (pendAmtEl) pendAmtEl.innerText = formatCurrency(pendingAmount);
      const pendSubEl = document.getElementById('finance-pending-sub');
      if (pendSubEl) pendSubEl.innerText = pendingCount + ' a liquidar';

      const paidAmtEl = document.getElementById('finance-paid-amount');
      if (paidAmtEl) paidAmtEl.innerText = formatCurrency(paidAmount);
      const paidSubEl = document.getElementById('finance-paid-sub');
      if (paidSubEl) paidSubEl.innerText = paidCount + ' liquidados';

      renderSettlementsTable();
    } catch (err) {
      showToast('Erro ao carregar fechamentos financeiros: ' + err.message, 'error');
    }
  }

  function getSettlementStatusBadge(status) {
    if (status === 'PAID') return '<span class="badge badge-emerald">PAGO (PAID)</span>';
    if (status === 'PENDING') return '<span class="badge badge-amber">PENDENTE (PENDING)</span>';
    if (status === 'CANCELLED') return '<span class="badge badge-rose">CANCELADO (CANCELLED)</span>';
    return '<span class="badge badge-purple">' + (status || '-') + '</span>';
  }

  function renderSettlementsTable() {
    const tbody = document.getElementById('settlements-table-body');
    if (!tbody) return;

    if (!STATE.settlements || STATE.settlements.length === 0) {
      tbody.innerHTML = '<tr><td colspan="11" class="text-center" style="padding: 2rem; color: var(--text-muted);">Nenhum fechamento financeiro encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = STATE.settlements.map(s => {
      const driverName = s.driver?.user?.name || 'Motorista ERP (' + (s.driver?.cnh || s.driverId.slice(0,6)) + ')';
      const period = (s.periodStart ? formatDate(s.periodStart) : '-') + ' &agrave; ' + (s.periodEnd ? formatDate(s.periodEnd) : '-');
      const paidDate = s.paidAt ? formatDate(s.paidAt) : (s.payments && s.payments.length > 0 ? formatDate(s.payments[0].paymentDate) : '-');

      return '<tr>' +
        '<td><strong class="font-mono" style="color: var(--brand-light);">' + (s.settlementCode || s.id.slice(0,8)) + '</strong></td>' +
        '<td><strong>' + driverName + '</strong></td>' +
        '<td class="text-xs text-muted font-mono">' + period + '</td>' +
        '<td class="font-mono text-xs text-right" style="color: var(--emerald-base);">' + formatCurrency(s.grossFreight || 0) + '</td>' +
        '<td class="font-mono text-xs text-right" style="color: var(--cyan-base);">' + formatCurrency(s.tollsTotal || 0) + '</td>' +
        '<td class="font-mono text-xs text-right" style="color: var(--rose-base);">' + formatCurrency(s.deductionsTotal || 0) + '</td>' +
        '<td class="font-mono text-xs text-right" style="color: var(--brand-light);">' + formatCurrency(s.additionsTotal || 0) + '</td>' +
        '<td class="font-mono text-xs font-bold text-right" style="color: var(--emerald-base);">' + formatCurrency(s.netAmount || 0) + '</td>' +
        '<td>' + getSettlementStatusBadge(s.status) + '</td>' +
        '<td class="text-xs text-muted">' + paidDate + '</td>' +
        '<td class="text-right">' +
          '<button onclick="openSettlementDetails(\\'' + s.id + '\\')" class="btn btn-secondary btn-sm"><span data-lucide="file-text" class="icon-xs"></span><span>Ver Detalhes</span></button>' +
        '</td>' +
      '</tr>';
    }).join('');

    renderIcons();
  }

  async function openSettlementDetails(id) {
    try {
      const s = await apiFetch('/api/v1/admin/settlements/' + id);
      if (!s) return;

      document.getElementById('settlement-detail-code').innerText = 'Fechamento #' + (s.settlementCode || s.id.slice(0,8));
      document.getElementById('settlement-detail-sub').innerText = 'ID: ' + s.id;
      document.getElementById('settlement-detail-status-badge').innerHTML = getSettlementStatusBadge(s.status);

      const driverName = s.driver?.user?.name || 'Motorista ERP (' + (s.driver?.cnh || s.driverId?.slice(0,6)) + ')';
      document.getElementById('settlement-detail-driver').innerText = driverName;
      document.getElementById('settlement-detail-period').innerText = (s.periodStart ? formatDate(s.periodStart) : '-') + ' até ' + (s.periodEnd ? formatDate(s.periodEnd) : '-');
      document.getElementById('settlement-detail-created-at').innerText = formatDate(s.createdAt);
      
      const paidDate = s.paidAt ? formatDate(s.paidAt) : (s.payments && s.payments.length > 0 ? formatDate(s.payments[0].paymentDate) : '-');
      document.getElementById('settlement-detail-paid-at').innerText = paidDate;

      // Values breakdown
      document.getElementById('settlement-detail-gross').innerText = formatCurrency(s.grossFreight || 0);
      document.getElementById('settlement-detail-tolls').innerText = formatCurrency(s.tollsTotal || 0);
      document.getElementById('settlement-detail-additions').innerText = formatCurrency(s.additionsTotal || 0);
      document.getElementById('settlement-detail-advances').innerText = formatCurrency(s.advancesTotal || 0);
      document.getElementById('settlement-detail-deductions').innerText = formatCurrency(s.deductionsTotal || 0);
      document.getElementById('settlement-detail-net').innerText = formatCurrency(s.netAmount || 0);

      // Items breakdown table
      const itemsBody = document.getElementById('settlement-detail-items-body');
      if (itemsBody) {
        if (!s.items || s.items.length === 0) {
          itemsBody.innerHTML = '<tr><td colspan="4" class="text-center" style="padding:1rem; color:var(--text-muted);">Nenhum item discriminado neste fechamento.</td></tr>';
        } else {
          itemsBody.innerHTML = s.items.map(item => {
            const isCredit = item.type === 'FREIGHT' || item.type === 'TOLL_REIMBURSEMENT' || item.type === 'ADDITION';
            const color = isCredit ? 'var(--emerald-base)' : 'var(--rose-base)';
            const sign = isCredit ? '+' : '-';
            return '<tr>' +
              '<td><strong class="text-xs">' + (item.description || item.type) + '</strong> <span class="badge badge-purple text-xs" style="margin-left:0.4rem;">' + item.type + '</span></td>' +
              '<td class="text-xs font-mono text-muted">' + (s.trip?.tripCode || item.tripId || '-') + '</td>' +
              '<td class="text-xs text-muted">' + formatDate(item.createdAt) + '</td>' +
              '<td class="text-right font-mono text-xs font-bold" style="color:' + color + ';">' + sign + ' ' + formatCurrency(item.amount || 0) + '</td>' +
            '</tr>';
          }).join('');
        }
      }

      // Payments list
      const paymentsDiv = document.getElementById('settlement-detail-payments-container');
      if (paymentsDiv) {
        if (!s.payments || s.payments.length === 0) {
          paymentsDiv.innerHTML = '<p class="text-xs text-muted" style="font-style:italic;">Nenhum pagamento registrado.</p>';
        } else {
          paymentsDiv.innerHTML = s.payments.map(p => {
            return '<div style="padding:0.6rem 0.8rem; background:var(--bg-surface-elevated); border:1px solid var(--border-subtle); border-radius:0.5rem; display:flex; align-items:center; justify-content:space-between;">' +
              '<div>' +
                '<strong class="text-xs" style="color:var(--emerald-base);">' + formatCurrency(p.amount) + '</strong> ' +
                '<span class="badge badge-cyan text-xs" style="margin-left:0.4rem;">' + (p.paymentMethod || 'PIX') + '</span>' +
                '<p class="text-xs text-muted">ID Transação: <span class="font-mono text-white">' + (p.transactionId || '-') + '</span> &bull; ' + formatDate(p.paymentDate) + '</p>' +
              '</div>' +
              (p.receiptUrl ? '<a href="' + p.receiptUrl + '" target="_blank" class="btn btn-secondary btn-xs"><span data-lucide="external-link" class="icon-xs"></span><span>Comprovante</span></a>' : '') +
            '</div>';
          }).join('');
        }
      }

      document.getElementById('settlement-detail-notes').innerText = s.notes || 'Sem observações registradas.';

      // Action buttons
      const actionsDiv = document.getElementById('settlement-detail-action-buttons');
      if (actionsDiv) {
        if (s.status === 'PENDING') {
          actionsDiv.innerHTML =
            '<button onclick="openPaySettlementForm(\\'' + s.id + '\\', \\'PAID\\', ' + s.netAmount + ')" class="btn btn-primary btn-sm"><span data-lucide="dollar-sign" class="icon-xs"></span><span>Registrar Pagamento (PAID)</span></button>' +
            '<button onclick="openPaySettlementForm(\\'' + s.id + '\\', \\'CANCELLED\\', ' + s.netAmount + ')" class="btn btn-danger btn-sm"><span data-lucide="x-circle" class="icon-xs"></span><span>Cancelar Fechamento</span></button>';
        } else if (s.status === 'PAID') {
          actionsDiv.innerHTML = '<span class="badge badge-emerald" style="padding:0.4rem 0.8rem; font-size:0.8rem;"><span data-lucide="check-circle" class="icon-xs" style="margin-right:0.3rem;"></span>Fechamento Liquidado e Pago</span>';
        } else {
          actionsDiv.innerHTML = '<button onclick="openPaySettlementForm(\\'' + s.id + '\\', \\'PENDING\\', ' + s.netAmount + ')" class="btn btn-secondary btn-sm"><span data-lucide="refresh-cw" class="icon-xs"></span><span>Reabrir Fechamento (PENDING)</span></button>';
        }
      }

      cancelSettlementForm();
      openModal('modal-settlement-details');
      renderIcons();
    } catch (err) {
      showToast('Erro ao carregar detalhes do fechamento: ' + err.message, 'error');
    }
  }

  function openPaySettlementForm(id, targetStatus, netAmount) {
    const formCont = document.getElementById('settlement-pay-form-container');
    const titleEl = document.getElementById('settlement-form-title');
    const submitBtn = document.getElementById('settlement-form-submit-btn');
    document.getElementById('settlement-form-id').value = id;
    document.getElementById('settlement-form-target-status').value = targetStatus;
    document.getElementById('settlement-form-receipt').value = '';
    document.getElementById('settlement-form-notes').value = '';

    if (targetStatus === 'PAID') {
      titleEl.innerText = 'Registrar Liquidação / Pagamento no Valor de ' + formatCurrency(netAmount);
      titleEl.style.color = 'var(--emerald-base)';
      submitBtn.className = 'btn btn-primary btn-sm';
      submitBtn.innerText = 'Confirmar Liquidação (PAID)';
    } else if (targetStatus === 'CANCELLED') {
      titleEl.innerText = 'Cancelar este Fechamento Financeiro';
      titleEl.style.color = 'var(--rose-base)';
      submitBtn.className = 'btn btn-danger btn-sm';
      submitBtn.innerText = 'Confirmar Cancelamento (CANCELLED)';
    } else {
      titleEl.innerText = 'Reabrir Fechamento para PENDENTE';
      titleEl.style.color = 'var(--amber-base)';
      submitBtn.className = 'btn btn-warning btn-sm';
      submitBtn.innerText = 'Reabrir Fechamento';
    }

    formCont.style.display = 'block';
  }

  function cancelSettlementForm() {
    const formCont = document.getElementById('settlement-pay-form-container');
    if (formCont) formCont.style.display = 'none';
  }

  async function submitSettlementStatusUpdate() {
    const id = document.getElementById('settlement-form-id').value;
    const status = document.getElementById('settlement-form-target-status').value;
    const method = document.getElementById('settlement-form-method').value;
    const receipt = document.getElementById('settlement-form-receipt').value.trim();
    const notes = document.getElementById('settlement-form-notes').value.trim();

    try {
      await apiFetch('/api/v1/admin/settlements/' + id + '/status', {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          paymentMethod: method || undefined,
          receiptUrl: receipt || undefined,
          transactionId: receipt || undefined,
          notes: notes || undefined,
        })
      });

      showToast('Fechamento financeiro atualizado com sucesso!', 'success');
      closeModal('modal-settlement-details');
      loadSettlements();
    } catch (err) {
      showToast('Erro ao atualizar fechamento: ' + err.message, 'error');
    }
  }

  // ==============================================
  // 10. RASTREAMENTO & TELEMETRIA
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
  // 11. INTEGRAÇÃO ERP (INBOUND & OUTBOUND)
  // ==============================================
  async function loadErpLogs() {
    try {
      const search = document.getElementById('erp-search-input')?.value || '';
      const direction = document.getElementById('erp-direction-filter')?.value || '';
      const status = document.getElementById('erp-status-filter')?.value || '';
      const startDate = document.getElementById('erp-start-date')?.value || '';
      const endDate = document.getElementById('erp-end-date')?.value || '';

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (direction) params.append('direction', direction);
      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const data = await apiFetch('/api/v1/admin/erp-logs?' + params.toString());
      STATE.erpLogs = data.events || [];

      // Update stat cards
      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = (val !== null && val !== undefined) ? val : '0';
      };

      setVal('erp-stat-total', data.stats?.totalEvents || 0);
      setVal('erp-stat-inbound', data.stats?.inboundCount || 0);
      setVal('erp-stat-outbound', data.stats?.outboundCount || 0);
      setVal('erp-stat-errors', data.stats?.errorCount || 0);

      renderErpLogsTable();
    } catch (err) {
      showToast('Erro ao carregar logs de integração ERP: ' + err.message, 'error');
    }
  }

  function getErpDirectionBadge(direction) {
    if (direction === 'INBOUND') {
      return '<span class="badge badge-purple"><span data-lucide="arrow-down-left" class="icon-xs"></span> ERP &rarr; HK</span>';
    }
    return '<span class="badge badge-cyan"><span data-lucide="arrow-up-right" class="icon-xs"></span> HK &rarr; ERP</span>';
  }

  function getErpStatusBadge(status, statusCode) {
    if (status === 'ERROR' || statusCode >= 400) {
      return '<span class="badge badge-rose">' + (statusCode || '500') + ' ERROR</span>';
    }
    return '<span class="badge badge-emerald">' + (statusCode || '200') + ' OK</span>';
  }

  function renderErpLogsTable() {
    const tbody = document.getElementById('erp-table-body');
    if (!tbody) return;

    if (!STATE.erpLogs || STATE.erpLogs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 2rem; color: var(--text-muted);">Nenhum evento de integração ERP encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = STATE.erpLogs.map(e => {
      return '<tr>' +
        '<td>' + getErpDirectionBadge(e.direction) + '</td>' +
        '<td><strong class="text-xs font-mono" style="color:var(--brand-light);">' + (e.event || e.endpoint) + '</strong><br><span class="text-xs text-muted truncate" style="max-width:180px; display:inline-block;">' + (e.summary || '-') + '</span></td>' +
        '<td class="font-mono text-xs">' + (e.externalId || '-') + '</td>' +
        '<td class="font-mono text-xs text-muted truncate" style="max-width:140px;">' + (e.idempotencyKey || '-') + '</td>' +
        '<td>' + getErpStatusBadge(e.status, e.statusCode) + '</td>' +
        '<td class="text-xs text-muted">' + formatDate(e.receivedAt) + '</td>' +
        '<td class="text-right">' +
          '<button onclick="openErpEventDetails(\\'' + e.id + '\\')" class="btn btn-secondary btn-sm"><span data-lucide="file-text" class="icon-xs"></span><span>Ver Payload</span></button>' +
        '</td>' +
      '</tr>';
    }).join('');

    renderIcons();
  }

  function openErpEventDetails(id) {
    const event = STATE.erpLogs.find(e => e.id === id);
    if (!event) return;

    document.getElementById('erp-detail-title').innerText = event.directionLabel + ' - ' + (event.event || 'Evento');
    document.getElementById('erp-detail-sub').innerText = 'Endpoint: ' + (event.endpoint || '-') + ' | Ref: ' + (event.externalId || '-');
    document.getElementById('erp-detail-direction').innerHTML = getErpDirectionBadge(event.direction);
    document.getElementById('erp-detail-status').innerHTML = getErpStatusBadge(event.status, event.statusCode);
    document.getElementById('erp-detail-date').innerText = formatDate(event.receivedAt);
    document.getElementById('erp-detail-idemp').innerText = event.idempotencyKey || '-';
    document.getElementById('erp-detail-json').innerText = JSON.stringify(event.payloadSummary || {}, null, 2);

    openModal('modal-erp-event-details');
    renderIcons();
  }

  // ==============================================
  // 12. AUDITORIA & SEGURANÇA
  // ==============================================
  async function loadAuditLogs() {
    try {
      const search = document.getElementById('audit-search-input')?.value || '';
      const action = document.getElementById('audit-action-filter')?.value || '';
      const startDate = document.getElementById('audit-start-date')?.value || '';
      const endDate = document.getElementById('audit-end-date')?.value || '';

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (action) params.append('action', action);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const logs = await apiFetch('/api/v1/admin/audit-logs?' + params.toString());
      STATE.auditLogs = logs || [];

      renderAuditLogsTable();
    } catch (err) {
      showToast('Erro ao carregar registros de auditoria: ' + err.message, 'error');
    }
  }

  function getAuditActionBadge(action) {
    if (action.startsWith('USER_')) return '<span class="badge badge-brand">' + action + '</span>';
    if (action.startsWith('TRIP_')) return '<span class="badge badge-cyan">' + action + '</span>';
    if (action.startsWith('ROMANEIO_')) return '<span class="badge badge-purple">' + action + '</span>';
    if (action.startsWith('TOLL_')) return '<span class="badge badge-warning">' + action + '</span>';
    if (action.startsWith('SETTLEMENT_')) return '<span class="badge badge-emerald">' + action + '</span>';
    if (action.startsWith('OCCURRENCE_')) return '<span class="badge badge-rose">' + action + '</span>';
    return '<span class="badge badge-purple">' + action + '</span>';
  }

  function renderAuditLogsTable() {
    const tbody = document.getElementById('audit-table-body');
    if (!tbody) return;

    if (!STATE.auditLogs || STATE.auditLogs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 2rem; color: var(--text-muted);">Nenhum registro de auditoria encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = STATE.auditLogs.map(l => {
      const actorName = l.actor?.name || 'SISTEMA AUTOMÁTICO';
      const actorRole = l.actor?.role ? '<span class="badge badge-purple text-xs">' + l.actor.role + '</span>' : '';
      const target = l.target?.name ? (l.target.name + ' (' + (l.target.role || '') + ')') : '-';

      return '<tr>' +
        '<td class="text-xs text-muted font-mono">' + formatDate(l.createdAt) + '</td>' +
        '<td><strong>' + actorName + '</strong></td>' +
        '<td>' + actorRole + '</td>' +
        '<td>' + getAuditActionBadge(l.action) + '</td>' +
        '<td class="text-xs font-mono">' + target + '</td>' +
        '<td class="text-right">' +
          '<button onclick="openAuditDetails(\\'' + l.id + '\\')" class="btn btn-secondary btn-sm"><span data-lucide="shield" class="icon-xs"></span><span>Ver Dados</span></button>' +
        '</td>' +
      '</tr>';
    }).join('');

    renderIcons();
  }

  function openAuditDetails(id) {
    const log = STATE.auditLogs.find(l => l.id === id);
    if (!log) return;

    document.getElementById('audit-detail-title').innerText = 'Auditoria: ' + log.action;
    document.getElementById('audit-detail-sub').innerText = 'ID: ' + log.id;
    document.getElementById('audit-detail-user').innerText = (log.actor?.name || 'SISTEMA') + ' [' + (log.actor?.role || 'SYSTEM') + ']';
    document.getElementById('audit-detail-action').innerHTML = getAuditActionBadge(log.action);
    document.getElementById('audit-detail-date').innerText = formatDate(log.createdAt);
    document.getElementById('audit-detail-json').innerText = JSON.stringify(log.metadata || {}, null, 2);

    openModal('modal-audit-details');
    renderIcons();
  }

  // ==============================================
  // 13. CONFIGURAÇÕES & STATUS DO SISTEMA
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

      showToast('Configurações e conexões operacionais validadas com sucesso!', 'success');
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

    // Invoice search and filter inputs
    document.getElementById('invoice-search-input')?.addEventListener('input', () => loadInvoices());
    document.getElementById('invoice-status-filter')?.addEventListener('change', () => loadInvoices());
    document.getElementById('invoice-start-date')?.addEventListener('change', () => loadInvoices());
    document.getElementById('invoice-end-date')?.addEventListener('change', () => loadInvoices());

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

    // Finance search and filter inputs
    document.getElementById('finance-search-input')?.addEventListener('input', () => loadSettlements());
    document.getElementById('finance-status-filter')?.addEventListener('change', () => loadSettlements());
    document.getElementById('finance-driver-filter')?.addEventListener('change', () => loadSettlements());
    document.getElementById('finance-start-date')?.addEventListener('change', () => loadSettlements());
    document.getElementById('finance-end-date')?.addEventListener('change', () => loadSettlements());

    // ERP search and filter inputs
    document.getElementById('erp-search-input')?.addEventListener('input', () => loadErpLogs());
    document.getElementById('erp-direction-filter')?.addEventListener('change', () => loadErpLogs());
    document.getElementById('erp-status-filter')?.addEventListener('change', () => loadErpLogs());
    document.getElementById('erp-start-date')?.addEventListener('change', () => loadErpLogs());
    document.getElementById('erp-end-date')?.addEventListener('change', () => loadErpLogs());

    // Audit search and filter inputs
    document.getElementById('audit-search-input')?.addEventListener('input', () => loadAuditLogs());
    document.getElementById('audit-action-filter')?.addEventListener('change', () => loadAuditLogs());
    document.getElementById('audit-start-date')?.addEventListener('change', () => loadAuditLogs());
    document.getElementById('audit-end-date')?.addEventListener('change', () => loadAuditLogs());

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
