export const ADMIN_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="pt-BR" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="hk-admin-build" content="HK-ADMIN-ROUTE-WIZARD-01">
  <title>HK Connect — Painel Operacional Central</title>
  <style>
    /* CSS RESET & THEME VARIABLES */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg-base: #020617;
      --bg-surface: #0f172a;
      --bg-surface-elevated: #1e293b;
      --bg-surface-hover: #334155;
      --border-color: #334155;
      --border-subtle: rgba(51, 65, 85, 0.6);
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --brand-primary: #2563eb;
      --brand-hover: #1d4ed8;
      --brand-light: #3b82f6;
      --emerald-base: #10b981;
      --emerald-bg: rgba(16, 185, 129, 0.12);
      --emerald-border: rgba(16, 185, 129, 0.3);
      --rose-base: #f43f5e;
      --rose-bg: rgba(244, 63, 94, 0.12);
      --rose-border: rgba(244, 63, 94, 0.3);
      --amber-base: #f59e0b;
      --amber-bg: rgba(245, 158, 11, 0.12);
      --amber-border: rgba(245, 158, 11, 0.3);
      --purple-base: #a855f7;
      --purple-bg: rgba(168, 85, 247, 0.12);
      --purple-border: rgba(168, 85, 247, 0.3);
      --cyan-base: #06b6d4;
      --cyan-bg: rgba(6, 182, 212, 0.12);
      --cyan-border: rgba(6, 182, 212, 0.3);
    }
    
    html, body {
      height: 100%;
      background-color: var(--bg-base);
      color: var(--text-primary);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* SCROLLBAR */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg-base); }
    ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

    /* UTILITY HELPERS */
    .hidden { display: none !important; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .flex-row { flex-direction: row; }
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .justify-between { justify-content: space-between; }
    .justify-center { justify-content: center; }
    .justify-end { justify-content: flex-end; }
    .flex-1 { flex: 1 1 0%; }
    .shrink-0 { flex-shrink: 0; }
    .gap-1 { gap: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .w-full { width: 100%; }
    .h-full { height: 100%; }
    .min-h-full { min-height: 100%; }
    .relative { position: relative; }
    .absolute { position: absolute; }
    .fixed { position: fixed; }
    .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
    .z-10 { z-index: 10; }
    .z-50 { z-index: 50; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
    .uppercase { text-transform: uppercase; }
    .text-xs { font-size: 0.75rem; }
    .text-sm { font-size: 0.875rem; }
    .text-base { font-size: 1rem; }
    .text-lg { font-size: 1.125rem; }
    .text-xl { font-size: 1.25rem; }
    .text-2xl { font-size: 1.5rem; }
    .tracking-tight { letter-spacing: -0.025em; }
    .tracking-wider { letter-spacing: 0.05em; }

    /* SVG ICONS */
    .svg-icon {
      display: inline-block;
      width: 1.25rem;
      height: 1.25rem;
      stroke-width: 2;
      stroke: currentColor;
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
      vertical-align: middle;
    }
    .icon-xs { width: 0.875rem; height: 0.875rem; }
    .icon-sm { width: 1rem; height: 1rem; }
    .icon-md { width: 1.25rem; height: 1.25rem; }
    .icon-lg { width: 1.5rem; height: 1.5rem; }
    .icon-xl { width: 2rem; height: 2rem; }

    /* GLASS CARD & BOXES */
    .card {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid var(--border-color);
      border-radius: 1rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      line-height: 1;
      border: 1px solid transparent;
    }
    .badge-brand { background: rgba(37, 99, 235, 0.15); color: var(--brand-light); border-color: rgba(37, 99, 235, 0.3); }
    .badge-success { background: var(--emerald-bg); color: var(--emerald-base); border-color: var(--emerald-border); }
    .badge-danger { background: var(--rose-bg); color: var(--rose-base); border-color: var(--rose-border); }
    .badge-warning { background: var(--amber-bg); color: var(--amber-base); border-color: var(--amber-border); }
    .badge-purple { background: var(--purple-bg); color: var(--purple-base); border-color: var(--purple-border); }
    .badge-cyan { background: var(--cyan-bg); color: var(--cyan-base); border-color: var(--cyan-border); }
    .badge-muted { background: var(--bg-surface-elevated); color: var(--text-secondary); border-color: var(--border-color); }

    /* BUTTONS */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.6rem 1.1rem;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: 0.75rem;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.15s ease;
      text-decoration: none;
      color: #fff;
    }
    .btn-sm { padding: 0.35rem 0.7rem; font-size: 0.75rem; border-radius: 0.5rem; }
    .btn-icon { padding: 0.45rem; border-radius: 0.5rem; }
    .btn-primary {
      background: linear-gradient(135deg, var(--brand-light), var(--brand-primary));
      border-color: var(--brand-hover);
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
    }
    .btn-primary:hover { background: var(--brand-hover); }
    .btn-cyan {
      background: linear-gradient(135deg, #06b6d4, #0891b2);
      border-color: #0e7490;
      box-shadow: 0 4px 14px rgba(6, 182, 212, 0.25);
    }
    .btn-cyan:hover { background: #0891b2; }
    .btn-warning {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-color: #b45309;
      box-shadow: 0 4px 14px rgba(245, 158, 11, 0.25);
    }
    .btn-warning:hover { background: #d97706; }
    .btn-secondary {
      background: var(--bg-surface-elevated);
      color: var(--text-primary);
      border-color: var(--border-color);
    }
    .btn-secondary:hover { background: var(--bg-surface-hover); }
    .btn-ghost-danger {
      background: var(--rose-bg);
      color: var(--rose-base);
      border-color: var(--rose-border);
    }
    .btn-ghost-danger:hover { background: rgba(244, 63, 94, 0.25); }
    .btn-ghost-warning {
      background: var(--amber-bg);
      color: var(--amber-base);
      border-color: var(--amber-border);
    }
    .btn-ghost-warning:hover { background: rgba(245, 158, 11, 0.25); }
    .btn-ghost-success {
      background: var(--emerald-bg);
      color: var(--emerald-base);
      border-color: var(--emerald-border);
    }
    .btn-ghost-success:hover { background: rgba(16, 185, 129, 0.25); }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }

    /* FORMS & INPUTS */
    label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      margin-bottom: 0.4rem;
    }
    .input-control, select.input-control {
      width: 100%;
      padding: 0.65rem 0.9rem;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 0.75rem;
      color: var(--text-primary);
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .input-control:focus {
      border-color: var(--brand-light);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
    }
    .input-with-icon { position: relative; }
    .input-with-icon .input-icon {
      position: absolute;
      top: 50%;
      left: 0.85rem;
      transform: translateY(-50%);
      color: var(--text-muted);
      pointer-events: none;
    }
    .input-with-icon .input-control { padding-left: 2.5rem; }
    .input-with-icon .input-toggle-btn {
      position: absolute;
      top: 50%;
      right: 0.85rem;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
    }
    .input-with-icon .input-toggle-btn:hover { color: var(--text-primary); }

    /* TABLES */
    .table-container { width: 100%; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem; }
    thead { background-color: rgba(15, 23, 42, 0.95); border-bottom: 1px solid var(--border-color); }
    th {
      padding: 0.85rem 1.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      white-space: nowrap;
    }
    td {
      padding: 0.85rem 1.25rem;
      border-bottom: 1px solid rgba(51, 65, 85, 0.4);
      color: var(--text-primary);
    }
    tr:hover td { background-color: rgba(30, 41, 59, 0.4); }

    /* GRIDS & LAYOUT */
    .grid-stats {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
      gap: 1rem;
    }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    @media (max-width: 1024px) {
      .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
    }

    /* AUTH & LOGIN */
    #auth-screen {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: radial-gradient(circle at top center, #1e293b 0%, #020617 70%);
    }
    .login-box {
      width: 100%;
      max-width: 440px;
      padding: 2.5rem;
      border-color: rgba(59, 130, 246, 0.3);
    }
    .logo-badge {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 1rem;
      background: linear-gradient(135deg, var(--brand-light), var(--brand-primary));
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
      box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4);
    }

    /* MAIN APP LAYOUT */
    #app-layout { display: flex; height: 100vh; width: 100vw; overflow: hidden; }
    .sidebar {
      width: 260px;
      background: var(--bg-surface);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }
    .topbar {
      height: 4rem;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 20;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 600;
      border: none;
      background: transparent;
      cursor: pointer;
      width: 100%;
      text-align: left;
      transition: all 0.15s ease;
    }
    .nav-item:hover { background: var(--bg-surface-hover); color: var(--text-primary); }
    .nav-item.active { background: var(--brand-primary); color: #fff; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); }

    /* MODALS */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.8);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      z-index: 50;
    }
    .modal-content {
      width: 100%;
      max-width: 680px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border-color: rgba(59, 130, 246, 0.4);
    }
    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
    }
    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      background: rgba(15, 23, 42, 0.6);
    }

    /* TOASTS */
    #toast-container {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
      max-width: 380px;
      width: calc(100vw - 3rem);
    }
    .toast {
      padding: 0.85rem 1.25rem;
      border-radius: 0.75rem;
      border: 1px solid;
      box-shadow: 0 10px 25px rgba(0,0,0,0.6);
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      pointer-events: auto;
      transition: all 0.25s ease;
      font-size: 0.8125rem;
    }
    .toast-success { background: #064e3b; border-color: #059669; color: #a7f3d0; }
    .toast-error { background: #4c0519; border-color: #e11d48; color: #fecdd3; }
    .toast-info { background: #0f172a; border-color: #334155; color: #e2e8f0; }

    .spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body class="min-h-full">

  <!-- TOAST CONTAINER -->
  <div id="toast-container"></div>

  <!-- AUTH SCREEN (LOGIN) -->
  <div id="auth-screen">
    <div class="card login-box">
      <div class="text-center" style="margin-bottom: 2rem;">
        <div class="logo-badge">
          <span data-lucide="truck" class="icon-xl"></span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight">HK CONNECT</h1>
        <p class="text-sm" style="color: var(--text-secondary); margin-top: 0.25rem;">Painel de Gestão e Operações</p>
        <div style="margin-top: 0.75rem;">
          <span class="badge badge-brand">Acesso Restrito: ADMIN & MANAGER</span>
        </div>
      </div>

      <form id="login-form" onsubmit="handleLogin(event); return false;" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div>
          <label for="login-username">CPF ou Telefone</label>
          <div class="input-with-icon">
            <span class="input-icon" data-lucide="user"></span>
            <input type="text" id="login-username" name="phone_or_cpf" class="input-control" required placeholder="000.000.000-00" autocomplete="username">
          </div>
        </div>

        <div>
          <label for="login-password">Senha</label>
          <div class="input-with-icon">
            <span class="input-icon" data-lucide="lock"></span>
            <input type="password" id="login-password" name="password" class="input-control" required placeholder="••••••••" autocomplete="current-password">
            <button type="button" id="toggle-pwd-btn" class="input-toggle-btn" title="Mostrar/Ocultar Senha">
              <span data-lucide="eye" class="icon-sm"></span>
            </button>
          </div>
        </div>

        <button type="submit" id="login-submit-btn" onclick="handleLogin(event);" class="btn btn-primary" style="padding: 0.85rem; margin-top: 0.5rem;">
          <span>Entrar no Painel</span>
          <span data-lucide="arrow-right" class="icon-sm"></span>
        </button>
      </form>

      <!-- PAINEL DE DIAGNÓSTICO -->
      <div id="admin-diagnostics" style="margin-top: 1.5rem; padding: 0.85rem; border-radius: 0.6rem; background: rgba(2, 6, 23, 0.95); border: 1px solid var(--border-color); font-size: 0.72rem; color: var(--text-secondary); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
        <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.35rem;">
          <span>DIAGNÓSTICO DO PAINEL</span>
          <span style="font-size: 0.62rem; padding: 2px 6px; border-radius: 4px; background: rgba(37,99,235,0.25); color: var(--brand-light); font-weight: 600;">FASE 1</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.35rem; line-height: 1.3;">
          <div>JS Carregado: <strong id="diag-js" style="color: var(--rose-base);">NÃO</strong></div>
          <div>DOM Pronto: <strong id="diag-dom" style="color: var(--rose-base);">NÃO</strong></div>
          <div>Formulário: <strong id="diag-form" style="color: var(--rose-base);">NÃO</strong></div>
          <div>Listener: <strong id="diag-listener" style="color: var(--rose-base);">NÃO</strong></div>
          <div>Último Submit: <strong id="diag-submit" style="color: var(--text-primary);">nenhum</strong></div>
          <div>Fetch Iniciado: <strong id="diag-fetch" style="color: var(--text-primary);">NÃO</strong></div>
          <div style="grid-column: span 2;">Status HTTP: <strong id="diag-http" style="color: var(--text-primary);">nenhum</strong></div>
          <div style="grid-column: span 2; word-break: break-all;">Último Erro JS: <strong id="diag-error" style="color: var(--emerald-base);">nenhum</strong></div>
        </div>
      </div>
    </div>
  </div>

  <!-- MAIN APP LAYOUT -->
  <div id="app-layout" class="hidden">
    
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div style="height: 4rem; padding: 0 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
        <div class="flex items-center gap-3">
          <div style="width: 2.25rem; height: 2.25rem; border-radius: 0.6rem; background: var(--brand-primary); display: flex; align-items: center; justify-content: center; color: #fff;">
            <span data-lucide="truck" class="icon-md"></span>
          </div>
          <div>
            <div class="font-bold text-sm tracking-tight">HK CONNECT</div>
            <div class="text-xs font-semibold" style="color: var(--brand-light);">Painel Operacional</div>
          </div>
        </div>
      </div>

      <!-- User Info Badge -->
      <div style="padding: 1rem; margin: 0.75rem; border-radius: 0.75rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 0.75rem;">
        <div id="user-avatar" style="width: 2.25rem; height: 2.25rem; border-radius: 50%; background: linear-gradient(135deg, var(--brand-light), var(--brand-primary)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.875rem;">
          AD
        </div>
        <div class="flex-1" style="min-width: 0;">
          <p id="user-display-name" class="text-sm font-semibold truncate">Administrador</p>
          <p id="user-display-role" class="text-xs" style="color: var(--brand-light); font-weight: 600;">ADMIN</p>
        </div>
      </div>

      <!-- Nav Links -->
      <nav style="flex: 1; padding: 0.5rem 0.75rem; display: flex; flex-direction: column; gap: 0.35rem; overflow-y: auto;">
        <button onclick="navigate('dashboard')" id="nav-dashboard" class="nav-item active">
          <span data-lucide="layout-dashboard" class="icon-sm"></span>
          <span>Dashboard</span>
        </button>

        <div style="height: 1px; background: var(--border-color); margin: 0.25rem 0.5rem;"></div>
        <div style="padding: 0.25rem 0.5rem; font-size: 0.65rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Operação</div>

        <button onclick="navigate('invoices')" id="nav-invoices" class="nav-item">
          <span data-lucide="receipt" class="icon-sm"></span>
          <span>Notas Fiscais</span>
        </button>

        <button onclick="navigate('trips')" id="nav-trips" class="nav-item">
          <span data-lucide="navigation" class="icon-sm"></span>
          <span>Viagens / Rotas</span>
        </button>

        <button onclick="navigate('romaneios')" id="nav-romaneios" class="nav-item">
          <span data-lucide="file-text" class="icon-sm"></span>
          <span>Romaneios</span>
        </button>

        <button onclick="navigate('tolls')" id="nav-tolls" class="nav-item">
          <span data-lucide="credit-card" class="icon-sm"></span>
          <span>Pedágios</span>
        </button>

        <button onclick="navigate('occurrences')" id="nav-occurrences" class="nav-item">
          <span data-lucide="alert-octagon" class="icon-sm"></span>
          <span>Ocorrências</span>
        </button>

        <button onclick="navigate('tracking')" id="nav-tracking" class="nav-item">
          <span data-lucide="map-pin" class="icon-sm"></span>
          <span>Rastreamento</span>
        </button>

        <div style="height: 1px; background: var(--border-color); margin: 0.25rem 0.5rem;"></div>
        <div style="padding: 0.25rem 0.5rem; font-size: 0.65rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Cadastros</div>

        <button onclick="navigate('drivers')" id="nav-drivers" class="nav-item">
          <span data-lucide="users" class="icon-sm"></span>
          <span>Motoristas / Usuários</span>
        </button>

        <button onclick="navigate('vehicles')" id="nav-vehicles" class="nav-item">
          <span data-lucide="truck" class="icon-sm"></span>
          <span>Veículos</span>
        </button>

        <div style="height: 1px; background: var(--border-color); margin: 0.25rem 0.5rem;"></div>
        <div style="padding: 0.25rem 0.5rem; font-size: 0.65rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">App HK Connect</div>

        <button onclick="navigate('config')" id="nav-config" class="nav-item">
          <span data-lucide="settings" class="icon-sm"></span>
          <span>Administração do App</span>
        </button>
      </nav>

      <!-- Logout Button -->
      <div style="padding: 0.75rem; border-top: 1px solid var(--border-color);">
        <button onclick="handleLogout()" class="nav-item" style="color: var(--rose-base);">
          <span data-lucide="log-out" class="icon-sm"></span>
          <span>Sair da Conta</span>
        </button>
        <div style="margin-top: 0.5rem; text-align: center; font-size: 0.65rem; color: var(--text-muted); font-family: monospace;">
          BUILD: HK-ADMIN-ROUTE-WIZARD-01
        </div>
      </div>
    </aside>

    <!-- MAIN CONTENT AREA -->
    <main class="flex-1 flex flex-col" style="min-width: 0; overflow-y: auto;">
      
      <!-- TOPBAR -->
      <header class="topbar">
        <h2 id="page-title" class="text-lg font-bold">Dashboard</h2>
        <div class="flex items-center gap-3">
          <button onclick="refreshCurrentView()" title="Recarregar Dados" class="btn btn-secondary btn-sm">
            <span data-lucide="refresh-cw" class="icon-xs"></span>
            <span>Atualizar</span>
          </button>
          <span class="badge badge-success">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--emerald-base);"></span>
            API Conectada
          </span>
        </div>
      </header>

      <!-- ============================================== -->
      <!-- VIEW 1: DASHBOARD OPERACIONAL -->
      <!-- ============================================== -->
      <section id="view-dashboard" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem;">
        
        <!-- Indicators Grid -->
        <div class="grid-stats">
          <div class="card" style="padding: 1.1rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Motoristas Ativos</span>
              <span class="badge badge-success"><span data-lucide="check-circle" class="icon-xs"></span></span>
            </div>
            <p id="stat-active-drivers" class="text-2xl font-bold" style="color: var(--emerald-base);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.2rem; display: block;">Status ATIVO na base</span>
          </div>

          <div class="card" style="padding: 1.1rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Motoristas Disponíveis</span>
              <span class="badge badge-cyan"><span data-lucide="user-check" class="icon-xs"></span></span>
            </div>
            <p id="stat-available-drivers" class="text-2xl font-bold" style="color: var(--cyan-base);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.2rem; display: block;">Prontos p/ viagem</span>
          </div>

          <div class="card" style="padding: 1.1rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Motoristas em Viagem</span>
              <span class="badge badge-brand"><span data-lucide="navigation" class="icon-xs"></span></span>
            </div>
            <p id="stat-in-trip-drivers" class="text-2xl font-bold" style="color: var(--brand-light);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.2rem; display: block;">Em rota operacional</span>
          </div>

          <div class="card" style="padding: 1.1rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Sem Veículo</span>
              <span class="badge badge-danger"><span data-lucide="alert-triangle" class="icon-xs"></span></span>
            </div>
            <p id="stat-drivers-no-vehicle" class="text-2xl font-bold" style="color: var(--rose-base);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.2rem; display: block;">Pendente de vínculo</span>
          </div>

          <div class="card" style="padding: 1.1rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Veículos Operacionais</span>
              <span class="badge badge-success"><span data-lucide="truck" class="icon-xs"></span></span>
            </div>
            <p id="stat-active-vehicles" class="text-2xl font-bold" style="color: var(--emerald-base);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.2rem; display: block;">Frota disponível/em uso</span>
          </div>

          <div class="card" style="padding: 1.1rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Viagens Pendentes</span>
              <span class="badge badge-warning"><span data-lucide="clock" class="icon-xs"></span></span>
            </div>
            <p id="stat-pending-trips" class="text-2xl font-bold" style="color: var(--amber-base);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.2rem; display: block;">Aguardando início</span>
          </div>

          <div class="card" style="padding: 1.1rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Viagens em Andamento</span>
              <span class="badge badge-brand"><span data-lucide="navigation" class="icon-xs"></span></span>
            </div>
            <p id="stat-in-progress-trips" class="text-2xl font-bold" style="color: var(--brand-light);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.2rem; display: block;">Em trânsito ativo</span>
          </div>

          <div class="card" style="padding: 1.1rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Viagens Concluídas</span>
              <span class="badge badge-success"><span data-lucide="check-circle" class="icon-xs"></span></span>
            </div>
            <p id="stat-completed-trips" class="text-2xl font-bold" style="color: var(--emerald-base);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.2rem; display: block;">Total finalizadas</span>
          </div>

          <div class="card" style="padding: 1.1rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Romaneios Pendentes</span>
              <span class="badge badge-purple"><span data-lucide="file-text" class="icon-xs"></span></span>
            </div>
            <p id="stat-pending-romaneios" class="text-2xl font-bold" style="color: var(--purple-base);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.2rem; display: block;">Aguardando conferência</span>
          </div>

          <div class="card" style="padding: 1.1rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Pedágios Pendentes</span>
              <span class="badge badge-cyan"><span data-lucide="credit-card" class="icon-xs"></span></span>
            </div>
            <p id="stat-pending-tolls-count" class="text-2xl font-bold" style="color: var(--cyan-base);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.2rem; display: block;">Comprovantes a analisar</span>
          </div>

          <div class="card" style="padding: 1.1rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Ocorrências Abertas</span>
              <span class="badge badge-warning"><span data-lucide="alert-octagon" class="icon-xs"></span></span>
            </div>
            <p id="stat-open-occurrences" class="text-2xl font-bold" style="color: var(--amber-base);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.2rem; display: block;">Incidentes em tratamento</span>
          </div>

          <div class="card" style="padding: 1.1rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Sem Sinal Telemetria</span>
              <span class="badge badge-danger"><span data-lucide="wifi-off" class="icon-xs"></span></span>
            </div>
            <p id="stat-drivers-no-signal" class="text-2xl font-bold" style="color: var(--rose-base);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.2rem; display: block;">Sem GPS recente (&gt;15 min)</span>
          </div>
        </div>

        <!-- Quick Tables Grid 1: Últimas Viagens & Motoristas sem Veículo -->
        <div class="grid-2">
          <!-- 1. ÚLTIMAS VIAGENS -->
          <div class="card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem;">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold flex items-center gap-2">
                  <span data-lucide="navigation" class="icon-sm" style="color: var(--brand-light);"></span>
                  <span>Últimas Viagens</span>
                </h3>
                <p class="text-xs" style="color: var(--text-secondary); margin-top: 0.15rem;">Atividades recentes registradas no sistema</p>
              </div>
              <button onclick="navigate('trips')" class="btn btn-secondary btn-sm">Ver Todas</button>
            </div>
            <div class="table-container" style="max-height: 250px;">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Rota</th>
                    <th>Motorista / Placa</th>
                    <th>Status</th>
                    <th class="text-right">Ação</th>
                  </tr>
                </thead>
                <tbody id="dashboard-recent-trips">
                  <tr><td colspan="5" class="text-center" style="padding: 1rem; color: var(--text-muted);">Carregando viagens...</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 2. MOTORISTAS SEM VEÍCULO -->
          <div class="card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem;">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold flex items-center gap-2">
                  <span data-lucide="alert-triangle" class="icon-sm" style="color: var(--rose-base);"></span>
                  <span>Motoristas sem Veículo</span>
                </h3>
                <p class="text-xs" style="color: var(--text-secondary); margin-top: 0.15rem;">Motoristas que precisam de veículo alocado para operar</p>
              </div>
              <button onclick="navigate('drivers')" class="btn btn-secondary btn-sm">Ver Motoristas</button>
            </div>
            <div class="table-container" style="max-height: 250px;">
              <table>
                <thead>
                  <tr>
                    <th>Motorista</th>
                    <th>Telefone</th>
                    <th>Status</th>
                    <th class="text-right">Ação</th>
                  </tr>
                </thead>
                <tbody id="dashboard-unassigned-drivers">
                  <tr><td colspan="4" class="text-center" style="padding: 1rem; color: var(--text-muted);">Carregando motoristas...</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Quick Tables Grid 2: Romaneios Recebidos & Ocorrências Recentes -->
        <div class="grid-2">
          <!-- 3. ROMANEIOS RECEBIDOS DO APP -->
          <div class="card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem;">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold flex items-center gap-2">
                  <span data-lucide="file-text" class="icon-sm" style="color: var(--purple-base);"></span>
                  <span>Romaneios Recebidos do App</span>
                </h3>
                <p class="text-xs" style="color: var(--text-secondary); margin-top: 0.15rem;">Documentos enviados pelos motoristas aguardando conferência</p>
              </div>
              <button onclick="navigate('romaneios')" class="btn btn-secondary btn-sm">Ver Romaneios</button>
            </div>
            <div id="dashboard-recent-romaneios" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 220px; overflow-y: auto;">
              <p class="text-xs" style="color: var(--text-muted); font-style: italic; padding: 1rem 0;">Nenhum romaneio pendente.</p>
            </div>
          </div>

          <!-- 4. OCORRÊNCIAS OPERACIONAIS -->
          <div class="card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem;">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold flex items-center gap-2">
                  <span data-lucide="alert-octagon" class="icon-sm" style="color: var(--amber-base);"></span>
                  <span>Alertas e Ocorrências Recentes</span>
                </h3>
                <p class="text-xs" style="color: var(--text-secondary); margin-top: 0.15rem;">Incidentes em trânsito reportados pelo motorista</p>
              </div>
              <button onclick="navigate('occurrences')" class="btn btn-secondary btn-sm">Ver Ocorrências</button>
            </div>
            <div id="dashboard-recent-occurrences" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 220px; overflow-y: auto;">
              <p class="text-xs" style="color: var(--text-muted); font-style: italic; padding: 1rem 0;">Nenhuma ocorrência pendente.</p>
            </div>
          </div>
        </div>

        <!-- Quick Tables Grid 3: Pedágios Aguardando Análise & Motoristas ERP Pendentes de Login -->
        <div class="grid-2">
          <!-- 5. PEDÁGIOS OPERACIONAIS -->
          <div class="card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem;">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold flex items-center gap-2">
                  <span data-lucide="credit-card" class="icon-sm" style="color: var(--cyan-base);"></span>
                  <span>Pedágios Aguardando Análise</span>
                </h3>
                <p class="text-xs" style="color: var(--text-secondary); margin-top: 0.15rem;">Comprovantes de pedágio lançados pelo app</p>
              </div>
              <button onclick="navigate('tolls')" class="btn btn-secondary btn-sm">Ver Pedágios</button>
            </div>
            <div id="dashboard-recent-tolls" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 220px; overflow-y: auto;">
              <p class="text-xs" style="color: var(--text-muted); font-style: italic; padding: 1rem 0;">Nenhum pedágio pendente de análise.</p>
            </div>
          </div>

          <!-- 6. SINCRONIZAÇÃO ERP_ONLY -->
          <div class="card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem;">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold flex items-center gap-2">
                  <span data-lucide="users" class="icon-sm" style="color: var(--purple-base);"></span>
                  <span>Motoristas Pendentes de Login</span>
                </h3>
                <p class="text-xs" style="color: var(--text-secondary); margin-top: 0.15rem;">Cadastros recebidos do ERP sem conta de login criada no app</p>
              </div>
              <span id="erp-badge" class="badge badge-purple">0 pendentes</span>
            </div>
            <div id="unlinked-drivers-list" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 220px; overflow-y: auto;">
              <p class="text-xs" style="color: var(--text-muted); font-style: italic; padding: 1rem 0;">Nenhum motorista pendente de vínculo.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================== -->
      <!-- VIEW 2: MOTORISTAS -->
      <!-- ============================================== -->
      <section id="view-drivers" class="hidden" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
        <!-- Filters & Action -->
        <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 0.75rem;">
          <div class="flex items-center gap-3" style="flex: 1; flex-wrap: wrap; min-width: 280px;">
            <div class="input-with-icon" style="flex: 1; min-width: 220px;">
              <span class="input-icon" data-lucide="search"></span>
              <input type="text" id="driver-search-input" class="input-control" placeholder="Buscar por Nome, CPF, Telefone ou CNH...">
            </div>

            <select id="driver-role-filter" class="input-control" style="width: auto; min-width: 170px;">
              <option value="">Todos os Perfis</option>
              <option value="DRIVER">Motorista (DRIVER)</option>
              <option value="MANAGER">Gerente (MANAGER)</option>
              <option value="ADMIN">Administrador (ADMIN)</option>
              <option value="OPERATOR">Operador (OPERATOR)</option>
            </select>

            <select id="driver-status-filter" class="input-control" style="width: auto; min-width: 150px;">
              <option value="">Todos os Status</option>
              <option value="ACTIVE">Ativo (ACTIVE)</option>
              <option value="INACTIVE">Inativo (INACTIVE)</option>
              <option value="BLOCKED">Bloqueado (BLOCKED)</option>
            </select>
          </div>

          <button onclick="openCreateUserModal('DRIVER')" class="btn btn-primary">
            <span data-lucide="user-plus" class="icon-sm"></span>
            <span>Novo Motorista / Usuário</span>
          </button>
        </div>

        <!-- Table -->
        <div class="card table-container">
          <table>
            <thead>
              <tr>
                <th>Motorista / Usuário</th>
                <th>CPF / Telefone</th>
                <th>CNH / Categoria / RNTRC</th>
                <th>Veículo Atual</th>
                <th>Status</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody id="drivers-table-body">
              <tr>
                <td colspan="6" class="text-center" style="padding: 2rem; color: var(--text-muted);">Carregando motoristas...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ============================================== -->
      <!-- VIEW 3: VEÍCULOS -->
      <!-- ============================================== -->
      <section id="view-vehicles" class="hidden" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
        <!-- Filters & Action -->
        <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 0.75rem;">
          <div class="flex items-center gap-3" style="flex: 1; flex-wrap: wrap; min-width: 280px;">
            <div class="input-with-icon" style="flex: 1; min-width: 220px;">
              <span class="input-icon" data-lucide="search"></span>
              <input type="text" id="vehicle-search-input" class="input-control" placeholder="Buscar por Placa, Modelo ou Marca...">
            </div>

            <select id="vehicle-status-filter" class="input-control" style="width: auto; min-width: 160px;">
              <option value="">Todos os Status</option>
              <option value="DISPONIVEL">Disponível</option>
              <option value="EM_USO">Em Uso</option>
              <option value="EM_VIAGEM">Em Viagem</option>
              <option value="MANUTENCAO">Manutenção</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </div>

          <button onclick="openCreateVehicleModal()" class="btn btn-cyan">
            <span data-lucide="plus-circle" class="icon-sm"></span>
            <span>Novo Veículo</span>
          </button>
        </div>

        <!-- Table -->
        <div class="card table-container">
          <table>
            <thead>
              <tr>
                <th>Placa</th>
                <th>Modelo / Marca</th>
                <th>Ano</th>
                <th>Status</th>
                <th>Motorista Alocado</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody id="vehicles-table-body">
              <tr>
                <td colspan="6" class="text-center" style="padding: 2rem; color: var(--text-muted);">Carregando veículos...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ============================================== -->
      <!-- VIEW: NOTAS FISCAIS (ERP / HK CONNECT) -->
      <!-- ============================================== -->
      <section id="view-invoices" class="hidden" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
        <!-- Header Banner & Top Actions -->
        <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 1rem;">
          <div>
            <div class="flex items-center gap-2">
              <span data-lucide="receipt" class="icon-md" style="color: var(--brand-light);"></span>
              <h2 class="text-lg font-bold">Notas Fiscais (ERP HK Transportes)</h2>
              <span class="badge badge-purple" style="font-size: 0.7rem;">FONTE DA VERDADE: ERP</span>
            </div>
            <p class="text-xs" style="color: var(--text-secondary); margin-top: 0.2rem;">
              Selecione as Notas Fiscais sincronizadas do ERP ou cadastradas manualmente para agrupar por destinatário e montar rotas operacionais de entrega.
            </p>
          </div>

          <div class="flex items-center gap-2" style="flex-wrap: wrap;">
            <button onclick="handleSyncErpInvoices()" id="btn-sync-erp-nfs" class="btn btn-secondary" title="Sincronizar NFs recebidas no ERP">
              <span data-lucide="refresh-cw" class="icon-xs"></span>
              <span>SINCRONIZAR ERP</span>
            </button>

            <button onclick="openCreateManualInvoiceModal()" id="btn-create-manual-nf" class="btn btn-secondary" style="border-color: var(--emerald-base); color: var(--emerald-base);" title="Cadastrar NF manualmente em contingência">
              <span data-lucide="plus-circle" class="icon-xs"></span>
              <span>+ NOVA NOTA FISCAL</span>
            </button>

            <button onclick="openRouteDispatchWizard()" id="btn-create-trip-from-nfs" class="btn btn-primary" style="padding: 0.75rem 1.4rem; font-size: 0.9rem; font-weight: 700; box-shadow: 0 4px 18px rgba(37, 99, 235, 0.4);">
              <span data-lucide="navigation" class="icon-sm"></span>
              <span>CRIAR ROTA COM NFs SELECIONADAS (<span id="selected-invoices-count">0</span>)</span>
            </button>
          </div>
        </div>

        <!-- Indicators Grid -->
        <div class="grid-stats">
          <div class="card" style="padding: 1.1rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Total de NFs</span>
              <span class="badge badge-brand"><span data-lucide="receipt" class="icon-xs"></span></span>
            </div>
            <p id="stat-total-invoices" class="text-2xl font-bold" style="color: var(--text-primary);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.2rem; display: block;">Base HK Connect / ERP</span>
          </div>

          <div class="card" style="padding: 1.1rem; border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.05);">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider" style="color: var(--emerald-base);">Disponíveis p/ Rota</span>
              <span class="badge badge-success"><span data-lucide="check-circle" class="icon-xs"></span></span>
            </div>
            <p id="stat-available-invoices" class="text-2xl font-bold" style="color: var(--emerald-base);">-</p>
            <span class="text-xs" style="color: var(--emerald-base); margin-top: 0.2rem; display: block; opacity: 0.85;">Prontas para roteirização</span>
          </div>

          <div class="card" style="padding: 1.1rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Em Rota / Trânsito</span>
              <span class="badge badge-cyan"><span data-lucide="truck" class="icon-xs"></span></span>
            </div>
            <p id="stat-in-transit-invoices" class="text-2xl font-bold" style="color: var(--cyan-base);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.2rem; display: block;">Vinculadas a viagens ativas</span>
          </div>

          <div class="card" style="padding: 1.1rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Entregues</span>
              <span class="badge badge-brand"><span data-lucide="check" class="icon-xs"></span></span>
            </div>
            <p id="stat-delivered-invoices" class="text-2xl font-bold" style="color: var(--brand-light);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.2rem; display: block;">Comprovante POD registrado</span>
          </div>
        </div>

        <!-- Filters Bar -->
        <div class="card" style="padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
          <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 0.75rem;">
            <div class="flex items-center gap-3" style="flex: 1; flex-wrap: wrap; min-width: 280px;">
              <div class="input-with-icon" style="flex: 1; min-width: 220px;">
                <span class="input-icon" data-lucide="search"></span>
                <input type="text" id="invoice-search-input" class="input-control" placeholder="Buscar por Número NF, Chave, Destinatário, Endereço ou Cidade..." oninput="renderInvoicesTable()">
              </div>

              <select id="invoice-operational-filter" class="input-control" style="width: auto; min-width: 200px;" onchange="renderInvoicesTable()">
                <option value="AVAILABLE" selected>Disponíveis p/ Rota (Sem Viagem)</option>
                <option value="ALL">Todas as NFs</option>
                <option value="ROUTED_DRAFT">Em Rascunho de Rota (PENDING)</option>
                <option value="IN_TRANSIT">Em Trânsito / Em Rota</option>
                <option value="DELIVERED">Entregues</option>
                <option value="RETURNED">Devolvidas</option>
                <option value="CANCELLED">Canceladas no ERP</option>
              </select>

              <select id="invoice-source-filter" class="input-control" style="width: auto; min-width: 140px;" onchange="renderInvoicesTable()">
                <option value="">Origem: Todas</option>
                <option value="ERP">ERP Integrado</option>
                <option value="MANUAL">MANUAL (Contingência)</option>
              </select>

              <select id="invoice-fiscal-filter" class="input-control" style="width: auto; min-width: 140px;" onchange="renderInvoicesTable()">
                <option value="">Fiscal: Todos</option>
                <option value="ACTIVE">Ativas</option>
                <option value="CANCELLED">Canceladas</option>
              </select>

              <input type="text" id="invoice-city-filter" class="input-control" style="width: auto; min-width: 140px;" placeholder="Filtrar Cidade..." oninput="renderInvoicesTable()">
            </div>

            <!-- Action & Refresh -->
            <div class="flex items-center gap-2">
              <button type="button" onclick="selectAllAvailableInvoices(true)" class="btn btn-secondary btn-sm">Selecionar Todas</button>
              <button type="button" onclick="selectAllAvailableInvoices(false)" class="btn btn-secondary btn-sm">Limpar Seleção</button>
              <button onclick="loadInvoices()" class="btn btn-secondary btn-sm" title="Atualizar">
                <span data-lucide="refresh-cw" class="icon-xs"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="card table-container">
          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">
                  <input type="checkbox" id="invoice-select-all-cb" onchange="toggleSelectAllInvoices(this.checked)" title="Selecionar todas as disponíveis">
                </th>
                <th>Número / Série</th>
                <th>Chave de Acesso NF-e</th>
                <th>Destinatário</th>
                <th>Endereço / Cidade</th>
                <th>Volumes / Peso / Valor</th>
                <th>Situação Operacional</th>
                <th>Viagem / Rota</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody id="invoices-table-body">
              <tr>
                <td colspan="9" class="text-center" style="padding: 2rem; color: var(--text-muted);">Carregando Notas Fiscais do ERP...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ============================================== -->
      <!-- VIEW 4: VIAGENS / ROTAS -->
      <!-- ============================================== -->
      <section id="view-trips" class="hidden" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
        <!-- Header Banner & Action -->
        <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 class="text-lg font-bold flex items-center gap-2">
              <span data-lucide="navigation" class="icon-md" style="color: var(--brand-light);"></span>
              <span>Gestão de Viagens / Rotas Operacionais</span>
            </h2>
            <p class="text-xs" style="color: var(--text-secondary); margin-top: 0.15rem;">
              Criação, montagem de paradas, despacho para motoristas e acompanhamento operacional em tempo real.
            </p>
          </div>

          <button onclick="openRouteDispatchWizard()" class="btn btn-primary" style="padding: 0.75rem 1.4rem; font-size: 0.95rem; font-weight: 700; box-shadow: 0 4px 18px rgba(37, 99, 235, 0.4);">
            <span data-lucide="plus-circle" class="icon-sm"></span>
            <span>+ NOVA ROTA</span>
          </button>
        </div>

        <!-- Filters Bar -->
        <div class="card" style="padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
          <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 0.75rem;">
            <div class="flex items-center gap-3" style="flex: 1; flex-wrap: wrap; min-width: 280px;">
              <div class="input-with-icon" style="flex: 1; min-width: 220px;">
                <span class="input-icon" data-lucide="search"></span>
                <input type="text" id="trip-search-input" class="input-control" placeholder="Buscar por Código, Origem, Destino, Motorista ou Placa..." oninput="renderTripsTable()">
              </div>

              <select id="trip-status-filter" class="input-control" style="width: auto; min-width: 170px;" onchange="renderTripsTable()">
                <option value="">Todos os Status</option>
                <option value="ASSIGNED">Atribuída / Despachada (ASSIGNED)</option>
                <option value="PENDING">Rascunho / Pendente (PENDING)</option>
                <option value="ACCEPTED">Aceita pelo Motorista (ACCEPTED)</option>
                <option value="IN_PROGRESS">Em Andamento / Em Rota (IN_PROGRESS)</option>
                <option value="COMPLETED">Concluída (COMPLETED)</option>
                <option value="CANCELLED">Cancelada (CANCELLED)</option>
              </select>

              <select id="trip-driver-filter" class="input-control" style="width: auto; min-width: 160px;" onchange="renderTripsTable()">
                <option value="">Todos os Motoristas</option>
              </select>
            </div>

            <!-- Quick Date Filters -->
            <div class="flex items-center gap-2">
              <button type="button" onclick="setTripDateQuickFilter('today')" class="btn btn-secondary btn-sm" id="btn-quick-today">Hoje</button>
              <button type="button" onclick="setTripDateQuickFilter('tomorrow')" class="btn btn-secondary btn-sm" id="btn-quick-tomorrow">Amanhã</button>
              <button type="button" onclick="setTripDateQuickFilter('all')" class="btn btn-secondary btn-sm active" id="btn-quick-all">Todas</button>
              
              <div class="flex items-center gap-1" style="font-size: 0.75rem; color: var(--text-muted); margin-left: 0.5rem;">
                <input type="date" id="trip-start-date" class="input-control" style="width: auto; padding: 0.35rem 0.5rem;" onchange="renderTripsTable()">
                <span>até</span>
                <input type="date" id="trip-end-date" class="input-control" style="width: auto; padding: 0.35rem 0.5rem;" onchange="renderTripsTable()">
              </div>

              <button onclick="loadTrips()" class="btn btn-secondary btn-sm" title="Atualizar">
                <span data-lucide="refresh-cw" class="icon-xs"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="card table-container">
          <table>
            <thead>
              <tr>
                <th>Código Rota</th>
                <th>Data Programada</th>
                <th>Motorista</th>
                <th>Veículo</th>
                <th>Origem / Destino</th>
                <th>Paradas / Entregas</th>
                <th>Status</th>
                <th>Última Atualização</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody id="trips-table-body">
              <tr>
                <td colspan="9" class="text-center" style="padding: 2rem; color: var(--text-muted);">Carregando viagens operacionais...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ============================================== -->
      <!-- VIEW 5: ROMANEIOS -->
      <!-- ============================================== -->
      <section id="view-romaneios" class="hidden" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
        <!-- Filters -->
        <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 0.75rem;">
          <div class="flex items-center gap-3" style="flex: 1; flex-wrap: wrap; min-width: 280px;">
            <div class="input-with-icon" style="flex: 1; min-width: 220px;">
              <span class="input-icon" data-lucide="search"></span>
              <input type="text" id="romaneio-search-input" class="input-control" placeholder="Buscar por Código do Romaneio, Motorista ou Viagem...">
            </div>

            <select id="romaneio-status-filter" class="input-control" style="width: auto; min-width: 160px;">
              <option value="">Todos os Status</option>
              <option value="PENDING">Pendente (PENDING)</option>
              <option value="APPROVED">Aprovado (APPROVED)</option>
              <option value="REJECTED">Rejeitado (REJECTED)</option>
            </select>

            <div class="flex items-center gap-2" style="font-size: 0.75rem; color: var(--text-muted);">
              <span>De:</span>
              <input type="date" id="romaneio-start-date" class="input-control" style="width: auto; padding: 0.4rem 0.6rem;">
              <span>Até:</span>
              <input type="date" id="romaneio-end-date" class="input-control" style="width: auto; padding: 0.4rem 0.6rem;">
            </div>
          </div>

          <button onclick="loadRomaneios()" class="btn btn-secondary btn-sm">
            <span data-lucide="refresh-cw" class="icon-xs"></span>
            <span>Filtrar</span>
          </button>
        </div>

        <!-- Table -->
        <div class="card table-container">
          <table>
            <thead>
              <tr>
                <th>Código Romaneio</th>
                <th>Viagem Relacionada</th>
                <th>Motorista</th>
                <th>Veículo</th>
                <th>Documentos Anexados</th>
                <th>Data Envio</th>
                <th>Status</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody id="romaneios-table-body">
              <tr>
                <td colspan="8" class="text-center" style="padding: 2rem; color: var(--text-muted);">Carregando romaneios...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ============================================== -->
      <!-- VIEW 6: PEDÁGIOS OPERACIONAIS -->
      <!-- ============================================== -->
      <section id="view-tolls" class="hidden" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
        <!-- Filters -->
        <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 0.75rem;">
          <div class="flex items-center gap-3" style="flex: 1; flex-wrap: wrap; min-width: 280px;">
            <div class="input-with-icon" style="flex: 1; min-width: 220px;">
              <span class="input-icon" data-lucide="search"></span>
              <input type="text" id="toll-search-input" class="input-control" placeholder="Buscar por Praça, Rodovia, Motorista ou Viagem...">
            </div>

            <select id="toll-status-filter" class="input-control" style="width: auto; min-width: 160px;">
              <option value="">Todos os Status</option>
              <option value="PENDING">Pendente (PENDING)</option>
              <option value="APPROVED">Aprovado (APPROVED)</option>
              <option value="REJECTED">Rejeitado (REJECTED)</option>
            </select>

            <div class="flex items-center gap-2" style="font-size: 0.75rem; color: var(--text-muted);">
              <span>De:</span>
              <input type="date" id="toll-start-date" class="input-control" style="width: auto; padding: 0.4rem 0.6rem;">
              <span>Até:</span>
              <input type="date" id="toll-end-date" class="input-control" style="width: auto; padding: 0.4rem 0.6rem;">
            </div>
          </div>

          <button onclick="loadTolls()" class="btn btn-secondary btn-sm">
            <span data-lucide="refresh-cw" class="icon-xs"></span>
            <span>Filtrar</span>
          </button>
        </div>

        <!-- Table -->
        <div class="card table-container">
          <table>
            <thead>
              <tr>
                <th>Praça / Concessionária</th>
                <th>Rodovia / Km</th>
                <th>Valor Lançado</th>
                <th>Motorista / Veículo</th>
                <th>Viagem Relacionada</th>
                <th>Comprovante</th>
                <th>Status Reembolso</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody id="tolls-table-body">
              <tr>
                <td colspan="8" class="text-center" style="padding: 2rem; color: var(--text-muted);">Carregando pedágios...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ============================================== -->
      <!-- VIEW 7: OCORRÊNCIAS OPERACIONAIS -->
      <!-- ============================================== -->
      <section id="view-occurrences" class="hidden" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
        <!-- Filters -->
        <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 0.75rem;">
          <div class="flex items-center gap-3" style="flex: 1; flex-wrap: wrap; min-width: 280px;">
            <div class="input-with-icon" style="flex: 1; min-width: 220px;">
              <span class="input-icon" data-lucide="search"></span>
              <input type="text" id="occurrence-search-input" class="input-control" placeholder="Buscar por Título, Descrição, Motorista ou Viagem...">
            </div>

            <select id="occurrence-type-filter" class="input-control" style="width: auto; min-width: 150px;">
              <option value="">Todos os Tipos</option>
              <option value="ATRASO">Atraso</option>
              <option value="AVARIA">Avaria</option>
              <option value="RECUSA">Recusa</option>
              <option value="ACIDENTE">Acidente</option>
              <option value="OUTROS">Outros</option>
            </select>

            <select id="occurrence-status-filter" class="input-control" style="width: auto; min-width: 160px;">
              <option value="">Todos os Status</option>
              <option value="OPEN">Aberta (OPEN)</option>
              <option value="IN_ANALYSIS">Em Análise (IN_ANALYSIS)</option>
              <option value="RESOLVED">Resolvida (RESOLVED)</option>
            </select>

            <div class="flex items-center gap-2" style="font-size: 0.75rem; color: var(--text-muted);">
              <span>De:</span>
              <input type="date" id="occurrence-start-date" class="input-control" style="width: auto; padding: 0.4rem 0.6rem;">
              <span>Até:</span>
              <input type="date" id="occurrence-end-date" class="input-control" style="width: auto; padding: 0.4rem 0.6rem;">
            </div>
          </div>

          <button onclick="loadOccurrences()" class="btn btn-secondary btn-sm">
            <span data-lucide="refresh-cw" class="icon-xs"></span>
            <span>Filtrar</span>
          </button>
        </div>

        <!-- Table -->
        <div class="card table-container">
          <table>
            <thead>
              <tr>
                <th>Tipo / Título</th>
                <th>Viagem Relacionada</th>
                <th>Motorista Responsável</th>
                <th>Entrega Afetada</th>
                <th>Data Registro</th>
                <th>Status Operacional</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody id="occurrences-table-body">
              <tr>
                <td colspan="7" class="text-center" style="padding: 2rem; color: var(--text-muted);">Carregando ocorrências...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ============================================== -->
      <!-- VIEW 8: RASTREAMENTO & TELEMETRIA OPERACIONAL -->
      <!-- ============================================== -->
      <section id="view-tracking" class="hidden" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
        <!-- Telemetry Indicators -->
        <div class="grid-stats">
          <div class="card" style="padding: 1.1rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Total Monitorados</span>
              <span class="badge badge-brand"><span data-lucide="users" class="icon-xs"></span></span>
            </div>
            <p id="tracking-stat-total" class="text-2xl font-bold">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.2rem; display: block;">Motoristas cadastrados</span>
          </div>

          <div class="card" style="padding: 1.1rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Sinal Recente (&le; 15 min)</span>
              <span class="badge badge-success"><span data-lucide="wifi" class="icon-xs"></span></span>
            </div>
            <p id="tracking-stat-recent" class="text-2xl font-bold" style="color: var(--emerald-base);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.2rem; display: block;">GPS ativo e sincronizado</span>
          </div>

          <div class="card" style="padding: 1.1rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Desatualizado (15 min a 2h)</span>
              <span class="badge badge-warning"><span data-lucide="clock" class="icon-xs"></span></span>
            </div>
            <p id="tracking-stat-outdated" class="text-2xl font-bold" style="color: var(--amber-base);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.2rem; display: block;">Sem update recente</span>
          </div>

          <div class="card" style="padding: 1.1rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Sem Sinal (&gt; 2h / Nunca)</span>
              <span class="badge badge-danger"><span data-lucide="wifi-off" class="icon-xs"></span></span>
            </div>
            <p id="tracking-stat-no-signal" class="text-2xl font-bold" style="color: var(--rose-base);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.2rem; display: block;">Aparelho offline / sem GPS</span>
          </div>

          <div class="card" style="padding: 1.1rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.35rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Em Trânsito Ativo</span>
              <span class="badge badge-cyan"><span data-lucide="navigation" class="icon-xs"></span></span>
            </div>
            <p id="tracking-stat-in-trip" class="text-2xl font-bold" style="color: var(--cyan-base);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.2rem; display: block;">Viagem IN_PROGRESS</span>
          </div>
        </div>

        <!-- Telemetry Header & SLA info -->
        <div class="card" style="padding: 1rem; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
          <div class="flex items-center gap-3">
            <span class="badge badge-cyan" style="padding: 0.5rem;"><span data-lucide="map-pin" class="icon-md"></span></span>
            <div>
              <h3 class="text-sm font-bold">Painel de Telemetria e Localização em Tempo Real</h3>
              <p class="text-xs" style="color: var(--text-secondary); margin-top: 0.15rem;">
                Os dados são transmitidos automaticamente pelo app Android do motorista via background service. SLA de sincronismo: 15 minutos.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="loadTracking()" class="btn btn-primary btn-sm">
              <span data-lucide="refresh-cw" class="icon-xs"></span>
              <span>Atualizar Posições</span>
            </button>
          </div>
        </div>

        <!-- Tracking Table -->
        <div class="card table-container">
          <table>
            <thead>
              <tr>
                <th>Motorista</th>
                <th>Telefone</th>
                <th>Veículo</th>
                <th>Viagem Atual</th>
                <th>Latitude / Longitude</th>
                <th>Velocidade</th>
                <th>Precisão</th>
                <th>Último Envio</th>
                <th>Status Telemetria</th>
              </tr>
            </thead>
            <tbody id="tracking-table-body">
              <tr>
                <td colspan="9" class="text-center" style="padding: 2rem; color: var(--text-muted);">Carregando telemetria da frota...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ============================================== -->
      <!-- VIEW 9: ADMINISTRAÇÃO & STATUS DO APP -->
      <!-- ============================================== -->
      <section id="view-config" class="hidden" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem;">
        <div class="card" style="padding: 1.25rem; border: 1px solid var(--border-color);">
          <div class="flex items-center justify-between" style="margin-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem;">
            <div class="flex items-center gap-3">
              <span class="badge badge-brand" style="padding: 0.5rem;"><span data-lucide="settings" class="icon-md"></span></span>
              <div>
                <h3 class="text-base font-bold">Parâmetros e Configurações Reais do HK Connect</h3>
                <p class="text-xs" style="color: var(--text-secondary);">Diagnóstico em tempo real da arquitetura operacional e de segurança</p>
              </div>
            </div>
            <button onclick="loadSystemConfig()" class="btn btn-secondary btn-sm">
              <span data-lucide="refresh-cw" class="icon-xs"></span>
              <span>Verificar Conexões</span>
            </button>
          </div>

          <div class="grid-3" style="gap: 1.25rem;">
            <!-- Database & Engine -->
            <div class="card" style="padding: 1rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-color);">
              <div class="flex items-center justify-between" style="margin-bottom: 0.75rem;">
                <span class="text-xs font-bold uppercase tracking-wider" style="color: var(--brand-light);">Banco de Dados</span>
                <span id="config-db-badge" class="badge badge-success">CONECTADO</span>
              </div>
              <p class="text-xs" style="color: var(--text-muted);">Motor: <strong id="config-db-engine" class="text-white" style="font-family: ui-monospace;">PostgreSQL 16</strong></p>
              <p class="text-xs" style="color: var(--text-muted); margin-top: 0.25rem;">ORM: <strong id="config-db-orm" class="text-white">Prisma 5.x</strong></p>
              <p class="text-xs" style="color: var(--text-muted); margin-top: 0.25rem;">Health: <strong id="config-health-status" class="text-white">HEALTHY</strong></p>
              <p class="text-xs" style="color: var(--text-muted); margin-top: 0.25rem;">Uptime: <strong id="config-uptime" class="text-white">-</strong></p>
            </div>

            <!-- Security & Tokens -->
            <div class="card" style="padding: 1rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-color);">
              <div class="flex items-center justify-between" style="margin-bottom: 0.75rem;">
                <span class="text-xs font-bold uppercase tracking-wider" style="color: var(--emerald-base);">Segurança & Criptografia</span>
                <span class="badge badge-success">ATIVO</span>
              </div>
              <p class="text-xs" style="color: var(--text-muted);">Hashing: <strong id="config-sec-hash" class="text-white">Argon2id (RFC 9106)</strong></p>
              <p class="text-xs" style="color: var(--text-muted); margin-top: 0.25rem;">Tokens: <strong id="config-sec-token" class="text-white">Dual JWT + Refresh Rotation</strong></p>
              <p class="text-xs" style="color: var(--text-muted); margin-top: 0.25rem;">Webhooks: <strong id="config-sec-webhook" class="text-white">HMAC-SHA256 Signature</strong></p>
              <p class="text-xs" style="color: var(--text-muted); margin-top: 0.25rem;">Idempotência: <strong id="config-sec-idemp" class="text-white">Chaves com Índice Único</strong></p>
            </div>

            <!-- Versions & Runtime -->
            <div class="card" style="padding: 1rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-color);">
              <div class="flex items-center justify-between" style="margin-bottom: 0.75rem;">
                <span class="text-xs font-bold uppercase tracking-wider" style="color: var(--purple-base);">Versões & Ecossistema</span>
                <span class="badge badge-purple">v1.0.0</span>
              </div>
              <p class="text-xs" style="color: var(--text-muted);">Ambiente: <strong id="config-env" class="text-white">production</strong></p>
              <p class="text-xs" style="color: var(--text-muted); margin-top: 0.25rem;">Backend: <strong id="config-backend-ver" class="text-white">NestJS 10 / Node.js</strong></p>
              <p class="text-xs" style="color: var(--text-muted); margin-top: 0.25rem;">Android Target: <strong id="config-android-ver" class="text-white">SDK 34 (Android 14)</strong></p>
              <p class="text-xs" style="color: var(--text-muted); margin-top: 0.25rem;">Telemetria SLA: <strong id="config-telemetry-sla" class="text-white">15 minutos</strong></p>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>

  <!-- ============================================== -->
  <!-- MODALS -->
  <!-- ============================================== -->

  <!-- MODAL: USUÁRIO / MOTORISTA (CRIAÇÃO E EDIÇÃO) -->
  <div id="modal-user" class="modal-overlay hidden">
    <div class="card modal-content">
      <div class="modal-header">
        <h3 id="modal-user-title" class="text-base font-bold">Novo Usuário</h3>
        <button type="button" onclick="closeModal('modal-user')" class="btn btn-secondary btn-icon" title="Fechar">
          <span data-lucide="x" class="icon-sm"></span>
        </button>
      </div>

      <form id="form-user">
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <input type="hidden" id="user-form-id">

          <div>
            <label>Nome Completo *</label>
            <input type="text" id="user-form-name" class="input-control" required placeholder="Ex: Carlos Eduardo de Souza">
          </div>

          <div class="grid-2">
            <div>
              <label>CPF *</label>
              <input type="text" id="user-form-cpf" class="input-control" required placeholder="000.000.000-00" maxlength="14">
            </div>

            <div>
              <label>Telefone</label>
              <input type="text" id="user-form-phone" class="input-control" placeholder="(11) 99999-8888">
            </div>
          </div>

          <div id="user-form-pwd-container">
            <label>Senha Inicial *</label>
            <input type="password" id="user-form-password" class="input-control" placeholder="Mínimo 6 caracteres" minlength="6">
          </div>

          <div class="grid-2">
            <div>
              <label>Perfil de Acesso *</label>
              <select id="user-form-role" onchange="handleRoleChange()" class="input-control" required>
                <option value="DRIVER">Motorista (DRIVER)</option>
                <option value="MANAGER">Gerente (MANAGER)</option>
                <option value="ADMIN">Administrador (ADMIN)</option>
                <option value="OPERATOR">Operador (OPERATOR)</option>
              </select>
            </div>

            <div>
              <label>Status *</label>
              <select id="user-form-status" class="input-control" required>
                <option value="ACTIVE">Ativo (ACTIVE)</option>
                <option value="INACTIVE">Inativo (INACTIVE)</option>
                <option value="BLOCKED">Bloqueado (BLOCKED)</option>
              </select>
            </div>
          </div>

          <!-- SEÇÃO MOTORISTA -->
          <div id="driver-fields-section" style="padding-top: 1rem; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 1rem;">
            <div class="flex items-center gap-2" style="color: var(--brand-light); font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
              <span data-lucide="id-card" class="icon-sm"></span>
              <span>Dados Operacionais do Motorista</span>
            </div>

            <div id="erp-detection-alert" class="badge badge-purple hidden" style="border-radius: 0.75rem; padding: 0.85rem; font-weight: normal; text-align: left; line-height: 1.4;">
              <span data-lucide="info" class="icon-md" style="margin-right: 0.5rem; float: left;"></span>
              <div>
                <strong>Motorista compatível encontrado no ERP!</strong><br>
                Este cadastro será automaticamente vinculado ao registro existente para preservar o histórico.
              </div>
            </div>

            <div class="grid-3">
              <div>
                <label>CNH</label>
                <input type="text" id="user-form-cnh" class="input-control" placeholder="Número CNH">
              </div>

              <div>
                <label>Categoria</label>
                <select id="user-form-cnh-cat" class="input-control">
                  <option value="">Selecione...</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="AB">AB</option>
                  <option value="AC">AC</option>
                  <option value="AD">AD</option>
                  <option value="AE">AE</option>
                </select>
              </div>

              <div>
                <label>RNTRC</label>
                <input type="text" id="user-form-rntrc" class="input-control" placeholder="Registro RNTRC">
              </div>
            </div>

            <div>
              <label>Veículo Atual Alocado</label>
              <select id="user-form-vehicle" class="input-control">
                <option value="">Nenhum veículo vinculado (alocar depois)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" onclick="closeModal('modal-user')" class="btn btn-secondary">Cancelar</button>
          <button type="submit" id="user-submit-btn" class="btn btn-primary">Salvar Usuário</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: DETALHES COMPLETOS DO MOTORISTA -->
  <div id="modal-driver-details" class="modal-overlay hidden">
    <div class="card modal-content" style="max-width: 780px;">
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div style="width: 2.25rem; height: 2.25rem; border-radius: 50%; background: var(--brand-primary); display: flex; align-items: center; justify-content: center;">
            <span data-lucide="user" class="icon-md"></span>
          </div>
          <div>
            <h3 id="driver-detail-name" class="text-base font-bold">Detalhes do Motorista</h3>
            <p id="driver-detail-sub" class="text-xs" style="color: var(--text-secondary);"></p>
          </div>
        </div>
        <button type="button" onclick="closeModal('modal-driver-details')" class="btn btn-secondary btn-icon" title="Fechar">
          <span data-lucide="x" class="icon-sm"></span>
        </button>
      </div>

      <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <!-- General Info Grid -->
        <div class="grid-4" style="background: var(--bg-surface-elevated); padding: 1rem; border-radius: 0.75rem; border: 1px solid var(--border-color);">
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">CPF</span>
            <strong id="driver-detail-cpf" class="text-sm font-mono">-</strong>
          </div>
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Telefone</span>
            <strong id="driver-detail-phone" class="text-sm">-</strong>
          </div>
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">CNH / Categoria</span>
            <strong id="driver-detail-cnh" class="text-sm">-</strong>
          </div>
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">RNTRC</span>
            <strong id="driver-detail-rntrc" class="text-sm">-</strong>
          </div>
        </div>

        <!-- Veículo Atual Alocado -->
        <div class="card" style="padding: 1rem; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
          <div class="flex items-center gap-3">
            <span class="badge badge-cyan" style="padding: 0.5rem;"><span data-lucide="truck" class="icon-md"></span></span>
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider" style="color: var(--text-muted);">Veículo Vinculado Atual</span>
              <p id="driver-detail-current-vehicle" class="text-sm font-bold">-</p>
            </div>
          </div>
          <div id="driver-detail-vehicle-actions" class="flex items-center gap-2">
            <!-- Dynamic Actions (Vincular / Desvincular) -->
          </div>
        </div>

        <!-- Histórico de Vínculos com Veículos -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted); margin-bottom: 0.5rem;">Histórico de Veículos</h4>
          <div class="table-container" style="max-height: 150px; background: var(--bg-surface-elevated); border-radius: 0.75rem; border: 1px solid var(--border-color);">
            <table>
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Modelo</th>
                  <th>Início</th>
                  <th>Término</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="driver-detail-assignments-table">
                <tr><td colspan="5" class="text-center text-xs" style="padding: 1rem; color: var(--text-muted);">Sem registros de vínculo.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Histórico de Viagens Recentes -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted); margin-bottom: 0.5rem;">Viagens Recentes do Motorista</h4>
          <div class="table-container" style="max-height: 160px; background: var(--bg-surface-elevated); border-radius: 0.75rem; border: 1px solid var(--border-color);">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Origem / Destino</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody id="driver-detail-trips-table">
                <tr><td colspan="4" class="text-center text-xs" style="padding: 1rem; color: var(--text-muted);">Nenhuma viagem encontrada.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" onclick="closeModal('modal-driver-details')" class="btn btn-secondary">Fechar</button>
      </div>
    </div>
  </div>

  <!-- MODAL: VINCULAR VEÍCULO AO MOTORISTA -->
  <div id="modal-assign-vehicle" class="modal-overlay hidden">
    <div class="card modal-content" style="max-width: 460px;">
      <div class="modal-header">
        <h3 class="text-base font-bold flex items-center gap-2">
          <span data-lucide="truck" class="icon-sm" style="color: var(--cyan-base);"></span>
          <span>Alocar Veículo ao Motorista</span>
        </h3>
        <button type="button" onclick="closeModal('modal-assign-vehicle')" class="btn btn-secondary btn-icon" title="Fechar">
          <span data-lucide="x" class="icon-sm"></span>
        </button>
      </div>

      <form id="form-assign-vehicle">
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <input type="hidden" id="assign-driver-id">
          <p class="text-xs" style="color: var(--text-secondary);">
            Selecione o veículo da frota a ser atribuído para <strong id="assign-driver-name" style="color: #fff;"></strong>. Se o veículo já estiver em uso, o vínculo anterior será encerrado automaticamente.
          </p>

          <div>
            <label>Veículo Disponível *</label>
            <select id="assign-vehicle-select" class="input-control" required>
              <option value="">Carregando frota...</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" onclick="closeModal('modal-assign-vehicle')" class="btn btn-secondary">Cancelar</button>
          <button type="submit" class="btn btn-cyan">Confirmar Alocação</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: VEÍCULO (CRIAÇÃO / EDIÇÃO) -->
  <div id="modal-vehicle" class="modal-overlay hidden">
    <div class="card modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <h3 id="modal-vehicle-title" class="text-base font-bold flex items-center gap-2">
          <span data-lucide="truck" class="icon-sm" style="color: var(--cyan-base);"></span>
          <span>Novo Veículo</span>
        </h3>
        <button type="button" onclick="closeModal('modal-vehicle')" class="btn btn-secondary btn-icon" title="Fechar">
          <span data-lucide="x" class="icon-sm"></span>
        </button>
      </div>

      <form id="form-vehicle">
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <input type="hidden" id="vehicle-form-id">

          <div>
            <label>Placa do Veículo *</label>
            <input type="text" id="vehicle-form-plate" class="input-control font-mono" required placeholder="ABC-1234 ou ABC1D23" maxlength="8" style="text-transform: uppercase;">
          </div>

          <div class="grid-2">
            <div>
              <label>Modelo *</label>
              <input type="text" id="vehicle-form-model" class="input-control" required placeholder="Ex: FH 540">
            </div>
            <div>
              <label>Marca *</label>
              <input type="text" id="vehicle-form-brand" class="input-control" required placeholder="Ex: Volvo">
            </div>
          </div>

          <div class="grid-2">
            <div>
              <label>Ano</label>
              <input type="number" id="vehicle-form-year" class="input-control" placeholder="2023" min="1990" max="2030">
            </div>
            <div>
              <label>Status Operacional</label>
              <select id="vehicle-form-status" class="input-control">
                <option value="DISPONIVEL">Disponível</option>
                <option value="EM_USO">Em Uso</option>
                <option value="EM_VIAGEM">Em Viagem</option>
                <option value="MANUTENCAO">Manutenção</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" onclick="closeModal('modal-vehicle')" class="btn btn-secondary">Cancelar</button>
          <button type="submit" class="btn btn-cyan">Salvar Veículo</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: DETALHES DO VEÍCULO -->
  <div id="modal-vehicle-details" class="modal-overlay hidden">
    <div class="card modal-content" style="max-width: 720px;">
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div style="width: 2.25rem; height: 2.25rem; border-radius: 0.6rem; background: var(--cyan-base); display: flex; align-items: center; justify-content: center; color: #fff;">
            <span data-lucide="truck" class="icon-md"></span>
          </div>
          <div>
            <h3 id="vehicle-detail-plate" class="text-base font-bold font-mono">PLACA</h3>
            <p id="vehicle-detail-model" class="text-xs" style="color: var(--text-secondary);"></p>
          </div>
        </div>
        <button type="button" onclick="closeModal('modal-vehicle-details')" class="btn btn-secondary btn-icon" title="Fechar">
          <span data-lucide="x" class="icon-sm"></span>
        </button>
      </div>

      <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div class="grid-3" style="background: var(--bg-surface-elevated); padding: 1rem; border-radius: 0.75rem; border: 1px solid var(--border-color);">
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Marca / Modelo</span>
            <strong id="vehicle-detail-brandmodel" class="text-sm">-</strong>
          </div>
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Ano</span>
            <strong id="vehicle-detail-year" class="text-sm">-</strong>
          </div>
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Status Atual</span>
            <span id="vehicle-detail-status" class="badge badge-cyan">-</span>
          </div>
        </div>

        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted); margin-bottom: 0.5rem;">Histórico de Motoristas Vinculados</h4>
          <div class="table-container" style="max-height: 160px; background: var(--bg-surface-elevated); border-radius: 0.75rem; border: 1px solid var(--border-color);">
            <table>
              <thead>
                <tr>
                  <th>Motorista</th>
                  <th>Telefone</th>
                  <th>Início</th>
                  <th>Término</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="vehicle-detail-assignments-table">
                <tr><td colspan="5" class="text-center text-xs" style="padding: 1rem; color: var(--text-muted);">Sem registros.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted); margin-bottom: 0.5rem;">Viagens Realizadas pelo Veículo</h4>
          <div class="table-container" style="max-height: 160px; background: var(--bg-surface-elevated); border-radius: 0.75rem; border: 1px solid var(--border-color);">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Motorista</th>
                  <th>Origem / Destino</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="vehicle-detail-trips-table">
                <tr><td colspan="4" class="text-center text-xs" style="padding: 1rem; color: var(--text-muted);">Nenhuma viagem encontrada.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" onclick="closeModal('modal-vehicle-details')" class="btn btn-secondary">Fechar</button>
      </div>
    </div>
  </div>

  <!-- MODAL: DETALHES COMPLETOS DA VIAGEM -->
  <div id="modal-trip-details" class="modal-overlay hidden">
    <div class="card modal-content" style="max-width: 920px; max-height: 90vh; display: flex; flex-direction: column;">
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div style="width: 2.5rem; height: 2.5rem; border-radius: 0.75rem; background: var(--brand-primary); display: flex; align-items: center; justify-content: center; color: #fff;">
            <span data-lucide="navigation" class="icon-md"></span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 id="trip-detail-code" class="text-base font-bold font-mono">Viagem #</h3>
              <span id="trip-detail-status-badge"></span>
            </div>
            <p id="trip-detail-route" class="text-xs" style="color: var(--text-secondary); margin-top: 0.15rem;"></p>
          </div>
        </div>
        <button type="button" onclick="closeModal('modal-trip-details')" class="btn btn-secondary btn-icon" title="Fechar">
          <span data-lucide="x" class="icon-sm"></span>
        </button>
      </div>

      <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.25rem; overflow-y: auto; flex: 1;">
        
        <!-- Action Toolbar / Quick Dispatch / Swap Buttons -->
        <div class="card" style="padding: 0.85rem 1.25rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold uppercase tracking-wider" style="color: var(--text-muted);">Ações Operacionais:</span>
            <div id="trip-detail-actions" class="flex items-center gap-2">
              <!-- Dynamic Transition Buttons -->
            </div>
          </div>
          <div id="trip-detail-tracking-btn-container">
            <!-- Tracking button -->
          </div>
        </div>

        <!-- Info Grid (Motorista, Veículo, Datas, Origem) -->
        <div class="grid-4" style="background: var(--bg-surface-elevated); padding: 1rem; border-radius: 0.75rem; border: 1px solid var(--border-color);">
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Motorista</span>
            <strong id="trip-detail-driver" class="text-sm">-</strong>
          </div>
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Veículo</span>
            <strong id="trip-detail-vehicle" class="text-sm font-mono">-</strong>
          </div>
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Data Programada / Início</span>
            <strong id="trip-detail-start" class="text-sm">-</strong>
          </div>
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Conclusão / Término</span>
            <strong id="trip-detail-end" class="text-sm">-</strong>
          </div>
        </div>

        <!-- Origem & Observações -->
        <div class="card" style="padding: 0.85rem 1rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.35rem;">
          <div class="flex items-center gap-2">
            <span data-lucide="map-pin" class="icon-xs" style="color: var(--emerald-base);"></span>
            <span class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Origem da Rota:</span>
            <span id="trip-detail-origin-full" class="text-xs font-semibold text-white">-</span>
          </div>
          <div id="trip-detail-notes-container" class="text-xs" style="color: var(--text-secondary); margin-top: 0.25rem;">
            <strong>Observações:</strong> <span id="trip-detail-notes">-</span>
          </div>
        </div>

        <!-- Paradas e Entregas com Status Individual -->
        <div>
          <div class="flex items-center justify-between" style="margin-bottom: 0.5rem;">
            <h4 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style="color: var(--text-muted);">
              <span data-lucide="map-pin" class="icon-xs"></span>
              <span>Paradas / Entregas da Rota (<span id="trip-detail-stops-count">0</span>)</span>
            </h4>
            <span id="trip-detail-progress-badge" class="badge badge-brand text-xs">Progresso: 0/0 entregas</span>
          </div>
          <div class="table-container" style="max-height: 220px; background: var(--bg-surface-elevated); border-radius: 0.75rem; border: 1px solid var(--border-color);">
            <table>
              <thead>
                <tr>
                  <th>Seq.</th>
                  <th>Destinatário</th>
                  <th>Contato</th>
                  <th>Endereço / Cidade</th>
                  <th>Volumes / Peso</th>
                  <th>Documento / NF</th>
                  <th>Status Entrega</th>
                </tr>
              </thead>
              <tbody id="trip-detail-deliveries-table">
                <tr><td colspan="7" class="text-center text-xs" style="padding: 1rem; color: var(--text-muted);">Nenhuma parada vinculada.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Rastreamento & Telemetria em Tempo Real -->
        <div id="trip-detail-tracking-card" class="card" style="padding: 1rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
          <div class="flex items-center gap-3">
            <div style="width: 2rem; height: 2rem; border-radius: 0.5rem; background: rgba(6, 182, 212, 0.15); color: var(--cyan-base); display: flex; align-items: center; justify-content: center;">
              <span data-lucide="activity" class="icon-sm"></span>
            </div>
            <div>
              <span class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Rastreamento & Telemetria</span>
              <p id="trip-detail-last-location" class="text-xs font-semibold" style="margin-top: 2px;">Localização: Aguardando sinal do aplicativo do motorista...</p>
            </div>
          </div>
          <div id="trip-detail-tracking-link-container"></div>
        </div>

        <!-- Documentos Fiscais & Romaneios -->
        <div class="grid-2">
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted); margin-bottom: 0.5rem;">Notas Fiscais & CT-es</h4>
            <div id="trip-detail-invoices" style="padding: 0.85rem; border-radius: 0.75rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-color); max-height: 130px; overflow-y: auto; font-size: 0.75rem;">
              <span style="color: var(--text-muted); font-style: italic;">Nenhum documento fiscal associado.</span>
            </div>
          </div>

          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted); margin-bottom: 0.5rem;">Romaneios & Pedágios</h4>
            <div id="trip-detail-romaneios-tolls" style="padding: 0.85rem; border-radius: 0.75rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-color); max-height: 130px; overflow-y: auto; font-size: 0.75rem;">
              <span style="color: var(--text-muted); font-style: italic;">Nenhum romaneio ou pedágio registrado.</span>
            </div>
          </div>
        </div>

        <!-- Ocorrências da Viagem -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted); margin-bottom: 0.5rem;">Ocorrências da Viagem</h4>
          <div id="trip-detail-occurrences" style="padding: 0.85rem; border-radius: 0.75rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-color); max-height: 130px; overflow-y: auto; font-size: 0.75rem;">
            <span style="color: var(--text-muted); font-style: italic;">Nenhuma ocorrência registrada para esta viagem.</span>
          </div>
        </div>

      </div>

      <div class="modal-footer">
        <button type="button" onclick="closeModal('modal-trip-details')" class="btn btn-secondary">Fechar</button>
      </div>
    </div>
  </div>

  <!-- MODAL: NOVA / EDITAR VIAGEM / ROTA (3 ETAPAS) -->
  <div id="modal-trip-create" class="modal-overlay hidden">
    <div class="card modal-content" style="max-width: 960px; max-height: 92vh; display: flex; flex-direction: column;">
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div style="width: 2.5rem; height: 2.5rem; border-radius: 0.75rem; background: linear-gradient(135deg, var(--brand-light), var(--brand-primary)); display: flex; align-items: center; justify-content: center; color: #fff;">
            <span data-lucide="navigation" class="icon-md"></span>
          </div>
          <div>
            <h3 id="modal-trip-form-title" class="text-base font-bold">Nova Viagem / Rota Operacional</h3>
            <p class="text-xs" style="color: var(--text-secondary);">Monte as paradas, atribua motorista/veículo e despache para o app HK Connect.</p>
          </div>
        </div>
        <button type="button" onclick="closeModal('modal-trip-create')" class="btn btn-secondary btn-icon" title="Fechar">
          <span data-lucide="x" class="icon-sm"></span>
        </button>
      </div>

      <!-- Stepper Navigation -->
      <div style="display: flex; border-bottom: 1px solid var(--border-color); background: var(--bg-surface-elevated);">
        <button type="button" id="step-tab-1" onclick="switchTripStep(1)" class="btn" style="flex: 1; border-radius: 0; border-bottom: 2px solid var(--brand-light); background: transparent; color: var(--text-primary); font-size: 0.8rem; font-weight: 700; padding: 0.75rem;">
          1. Motorista & Veículo
        </button>
        <button type="button" id="step-tab-2" onclick="switchTripStep(2)" class="btn" style="flex: 1; border-radius: 0; border-bottom: 2px solid transparent; background: transparent; color: var(--text-muted); font-size: 0.8rem; font-weight: 700; padding: 0.75rem;">
          2. Identificação & Origem
        </button>
        <button type="button" id="step-tab-3" onclick="switchTripStep(3)" class="btn" style="flex: 1; border-radius: 0; border-bottom: 2px solid transparent; background: transparent; color: var(--text-muted); font-size: 0.8rem; font-weight: 700; padding: 0.75rem;">
          3. Paradas & Documentos (<span id="trip-step-stops-count">0</span>)
        </button>
      </div>

      <form id="form-trip-create" onsubmit="return false;" style="display: flex; flex-direction: column; flex: 1; overflow: hidden;">
        <input type="hidden" id="trip-form-id">

        <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- ============================================== -->
          <!-- ETAPA 1: MOTORISTA & VEÍCULO -->
          <!-- ============================================== -->
          <div id="trip-step-1" style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div class="card" style="padding: 1rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-color);">
              <h4 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style="color: var(--text-muted); margin-bottom: 0.75rem;">
                <span data-lucide="user-check" class="icon-sm" style="color: var(--brand-light);"></span>
                <span>Seleção do Motorista e Validação Operacional</span>
              </h4>

              <div class="grid-2">
                <div>
                  <label>Motorista Operacional *</label>
                  <select id="trip-form-driver" class="input-control" required onchange="handleTripDriverSelectChange()">
                    <option value="">Selecione o motorista...</option>
                  </select>
                  <span class="text-xs" style="color: var(--text-muted); display: block; margin-top: 0.25rem;">
                    Apenas motoristas ATIVOS e cadastrados no sistema.
                  </span>
                </div>

                <div>
                  <label>Veículo Alocado *</label>
                  <select id="trip-form-vehicle" class="input-control" required onchange="handleTripVehicleSelectChange()">
                    <option value="">Selecione o veículo...</option>
                  </select>
                  <span class="text-xs" style="color: var(--text-muted); display: block; margin-top: 0.25rem;">
                    Preenchido automaticamente com o veículo atual do motorista.
                  </span>
                </div>
              </div>

              <!-- Driver Status / Warning Banner -->
              <div id="trip-driver-warning-banner" class="hidden" style="margin-top: 1rem; padding: 0.85rem 1rem; border-radius: 0.75rem; background: var(--amber-bg); border: 1px solid var(--amber-border); color: var(--amber-base); font-size: 0.8rem; display: flex; items-center gap-2;">
                <span data-lucide="alert-triangle" class="icon-sm" style="flex-shrink:0;"></span>
                <span id="trip-driver-warning-text">Atenção: Motorista já possui uma viagem em andamento.</span>
              </div>

              <div id="trip-driver-info-box" class="hidden" style="margin-top: 1rem; padding: 0.85rem 1rem; border-radius: 0.75rem; background: var(--bg-surface); border: 1px solid var(--border-color); font-size: 0.8rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
                <div><strong>CPF:</strong> <span id="trip-driver-info-cpf">-</span></div>
                <div><strong>Telefone:</strong> <span id="trip-driver-info-phone">-</span></div>
                <div><strong>CNH:</strong> <span id="trip-driver-info-cnh">-</span></div>
                <div><strong>RNTRC:</strong> <span id="trip-driver-info-rntrc">-</span></div>
              </div>
            </div>

            <div class="flex justify-end">
              <button type="button" onclick="switchTripStep(2)" class="btn btn-primary">
                <span>Avançar para Identificação & Origem</span>
                <span data-lucide="arrow-right" class="icon-sm"></span>
              </button>
            </div>
          </div>

          <!-- ============================================== -->
          <!-- ETAPA 2: IDENTIFICAÇÃO & ORIGEM -->
          <!-- ============================================== -->
          <div id="trip-step-2" class="hidden" style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div class="card" style="padding: 1rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-color);">
              <h4 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style="color: var(--text-muted); margin-bottom: 0.75rem;">
                <span data-lucide="navigation" class="icon-sm" style="color: var(--brand-light);"></span>
                <span>Dados de Identificação da Viagem</span>
              </h4>

              <div class="grid-3">
                <div>
                  <label>Código da Viagem / Rota *</label>
                  <input type="text" id="trip-form-code" class="input-control font-mono" required placeholder="Ex: TRP-20260829-001">
                </div>
                <div>
                  <label>Data Programada *</label>
                  <input type="date" id="trip-form-date" class="input-control" required>
                </div>
                <div>
                  <label>Horário Previsto</label>
                  <input type="time" id="trip-form-time" class="input-control">
                </div>
              </div>
            </div>

            <!-- Origem Completa -->
            <div class="card" style="padding: 1rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-color);">
              <h4 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style="color: var(--text-muted); margin-bottom: 0.75rem;">
                <span data-lucide="map-pin" class="icon-sm" style="color: var(--emerald-base);"></span>
                <span>Local de Origem / Ponto de Partida</span>
              </h4>

              <div class="grid-2" style="margin-bottom: 0.75rem;">
                <div>
                  <label>Nome / Identificação do Local de Origem *</label>
                  <input type="text" id="trip-form-origin-name" class="input-control" required placeholder="Ex: CD Principal HK Connect ou Matriz SP" value="Centro de Distribuição HK">
                </div>
                <div>
                  <label>CEP de Origem</label>
                  <input type="text" id="trip-form-origin-cep" class="input-control font-mono" placeholder="01001-000" maxlength="9">
                </div>
              </div>

              <div class="grid-3" style="margin-bottom: 0.75rem;">
                <div style="grid-column: span 2;">
                  <label>Endereço / Logradouro de Origem *</label>
                  <input type="text" id="trip-form-origin-address" class="input-control" required placeholder="Ex: Av. das Nações Unidas" value="Av. das Indústrias">
                </div>
                <div>
                  <label>Número *</label>
                  <input type="text" id="trip-form-origin-number" class="input-control" required placeholder="1000" value="1000">
                </div>
              </div>

              <div class="grid-3">
                <div>
                  <label>Bairro *</label>
                  <input type="text" id="trip-form-origin-neighborhood" class="input-control" required placeholder="Distrito Industrial" value="Distrito Industrial">
                </div>
                <div>
                  <label>Cidade *</label>
                  <input type="text" id="trip-form-origin-city" class="input-control" required placeholder="São Paulo" value="São Paulo">
                </div>
                <div>
                  <label>UF *</label>
                  <input type="text" id="trip-form-origin-state" class="input-control" required placeholder="SP" maxlength="2" style="text-transform: uppercase;" value="SP">
                </div>
              </div>
            </div>

            <!-- Observações Gerais -->
            <div>
              <label>Observações Operacionais / Instruções para o Motorista</label>
              <textarea id="trip-form-notes" class="input-control" rows="2" placeholder="Ex: Conferir lacre no carregamento, apresentar documento na portaria..."></textarea>
            </div>

            <div class="flex justify-between items-center">
              <button type="button" onclick="switchTripStep(1)" class="btn btn-secondary">
                <span data-lucide="arrow-right" class="icon-sm" style="transform: rotate(180deg);"></span>
                <span>Voltar</span>
              </button>
              <button type="button" onclick="switchTripStep(3)" class="btn btn-primary">
                <span>Avançar para Montar Paradas</span>
                <span data-lucide="arrow-right" class="icon-sm"></span>
              </button>
            </div>
          </div>

          <!-- ============================================== -->
          <!-- ETAPA 3: PARADAS & ENTREGAS -->
          <!-- ============================================== -->
          <div id="trip-step-3" class="hidden" style="display: flex; flex-direction: column; gap: 1.25rem;">
            <!-- Stop Sub-Form (Insert / Edit Stop) -->
            <div class="card" style="padding: 1rem; background: var(--bg-surface-elevated); border: 1px solid var(--brand-hover);">
              <div class="flex items-center justify-between" style="margin-bottom: 0.75rem;">
                <h4 id="stop-form-title" class="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style="color: var(--brand-light);">
                  <span data-lucide="plus-circle" class="icon-sm"></span>
                  <span>Adicionar Parada / Entrega à Rota</span>
                </h4>
                <button type="button" id="btn-cancel-stop-edit" onclick="resetStopSubForm()" class="btn btn-secondary btn-sm hidden">Cancelar Edição</button>
              </div>

              <input type="hidden" id="stop-edit-index" value="-1">

              <div class="grid-3" style="margin-bottom: 0.75rem;">
                <div style="grid-column: span 2;">
                  <label>Destinatário / Razão Social *</label>
                  <input type="text" id="stop-form-recipient" class="input-control" placeholder="Ex: Supermercados Estrela Ltda">
                </div>
                <div>
                  <label>Telefone / Contato do Recebedor</label>
                  <input type="text" id="stop-form-phone" class="input-control" placeholder="(11) 98765-4321">
                </div>
              </div>

              <div class="grid-4" style="margin-bottom: 0.75rem;">
                <div style="grid-column: span 2;">
                  <label>Endereço / Logradouro *</label>
                  <input type="text" id="stop-form-address" class="input-control" placeholder="Ex: Rua das Flores">
                </div>
                <div>
                  <label>Número *</label>
                  <input type="text" id="stop-form-number" class="input-control" placeholder="123">
                </div>
                <div>
                  <label>Complemento</label>
                  <input type="text" id="stop-form-complement" class="input-control" placeholder="Galpão 4">
                </div>
              </div>

              <div class="grid-4" style="margin-bottom: 0.75rem;">
                <div>
                  <label>Bairro *</label>
                  <input type="text" id="stop-form-neighborhood" class="input-control" placeholder="Centro">
                </div>
                <div>
                  <label>Cidade *</label>
                  <input type="text" id="stop-form-city" class="input-control" placeholder="Campinas">
                </div>
                <div>
                  <label>UF *</label>
                  <input type="text" id="stop-form-state" class="input-control" placeholder="SP" maxlength="2" style="text-transform: uppercase;">
                </div>
                <div>
                  <label>CEP</label>
                  <input type="text" id="stop-form-cep" class="input-control font-mono" placeholder="13000-000" maxlength="9">
                </div>
              </div>

              <div class="grid-4" style="margin-bottom: 0.75rem;">
                <div>
                  <label>Volumes</label>
                  <input type="number" id="stop-form-volumes" class="input-control" placeholder="1" min="1" value="1">
                </div>
                <div>
                  <label>Peso Total (kg)</label>
                  <input type="number" id="stop-form-weight" class="input-control" placeholder="Ex: 250.5" step="0.1">
                </div>
                <div>
                  <label>Número da NF / Pedido</label>
                  <input type="text" id="stop-form-nf" class="input-control font-mono" placeholder="Ex: 001234">
                </div>
                <div>
                  <label>Chave NF-e (44 dígitos)</label>
                  <input type="text" id="stop-form-nf-key" class="input-control font-mono text-xs" placeholder="352308..." maxlength="44">
                </div>
              </div>

              <div class="flex items-center justify-between">
                <input type="text" id="stop-form-notes" class="input-control" placeholder="Instruções desta parada (ex: descarga das 08h às 12h)" style="flex: 1; margin-right: 1rem;">
                <button type="button" id="btn-save-stop" onclick="handleAddOrUpdateStop()" class="btn btn-cyan" style="white-space: nowrap;">
                  <span data-lucide="plus" class="icon-sm"></span>
                  <span id="btn-save-stop-label">Inserir Parada</span>
                </button>
              </div>
            </div>

            <!-- Interactive Stops Sequence Table -->
            <div>
              <div class="flex items-center justify-between" style="margin-bottom: 0.5rem;">
                <h4 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style="color: var(--text-muted);">
                  <span data-lucide="list" class="icon-xs"></span>
                  <span>Sequência Ordenada de Paradas da Viagem</span>
                </h4>
                <span id="stops-summary-badge" class="badge badge-purple text-xs">0 paradas configuradas</span>
              </div>

              <div class="table-container" style="max-height: 250px; background: var(--bg-surface-elevated); border-radius: 0.75rem; border: 1px solid var(--border-color);">
                <table>
                  <thead>
                    <tr>
                      <th style="width: 50px;">Ordem</th>
                      <th>Destinatário</th>
                      <th>Endereço Completo</th>
                      <th>Cidade/UF</th>
                      <th>Volumes / Peso</th>
                      <th>NF-e</th>
                      <th class="text-right" style="width: 140px;">Ações</th>
                    </tr>
                  </thead>
                  <tbody id="trip-stops-table-body">
                    <tr>
                      <td colspan="7" class="text-center text-xs" style="padding: 1.5rem; color: var(--text-muted);">
                        Nenhuma parada adicionada ainda. Preencha o formulário acima para inserir paradas na rota.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <button type="button" onclick="switchTripStep(2)" class="btn btn-secondary">
                <span data-lucide="arrow-right" class="icon-sm" style="transform: rotate(180deg);"></span>
                <span>Voltar</span>
              </button>
            </div>
          </div>

        </div>

        <!-- Footer with Actions: Salvar Rascunho / Atribuir e Despachar -->
        <div class="modal-footer" style="display: flex; align-items: center; justify-content: space-between;">
          <button type="button" onclick="closeModal('modal-trip-create')" class="btn btn-secondary">Cancelar</button>

          <div class="flex items-center gap-2">
            <button type="button" onclick="submitTripForm('PENDING')" class="btn btn-secondary" id="btn-save-draft" style="border-color: var(--brand-hover);">
              <span data-lucide="file-text" class="icon-sm"></span>
              <span>Salvar como Rascunho</span>
            </button>
            <button type="button" onclick="submitTripForm('ASSIGNED')" class="btn btn-primary" id="btn-assign-dispatch" style="box-shadow: 0 4px 14px rgba(37,99,235,0.4);">
              <span data-lucide="send" class="icon-sm"></span>
              <span>Atribuir & Despachar ao Motorista</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: RETIRAR ATRIBUIÇÃO DA ROTA -->
  <div id="modal-unassign-trip" class="modal-overlay hidden">
    <div class="card modal-content" style="max-width: 480px;">
      <div class="modal-header">
        <h3 class="text-base font-bold flex items-center gap-2">
          <span data-lucide="link-2-off" class="icon-sm" style="color: var(--rose-base);"></span>
          <span>Retirar Atribuição da Rota</span>
        </h3>
        <button type="button" onclick="closeModal('modal-unassign-trip')" class="btn btn-secondary btn-icon" title="Fechar">
          <span data-lucide="x" class="icon-sm"></span>
        </button>
      </div>

      <form id="form-unassign-trip" onsubmit="handleUnassignTripSubmit(event)">
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <input type="hidden" id="unassign-trip-id">

          <p class="text-xs" style="color: var(--text-secondary);">
            A viagem <strong id="unassign-trip-code" style="color: #fff;"></strong> voltará para o status <strong>PENDENTE</strong> e deixará de aparecer na lista do motorista <strong id="unassign-driver-name" style="color: #fff;"></strong>.
          </p>

          <div>
            <label>Motivo da Retirada de Atribuição *</label>
            <textarea id="unassign-trip-reason" class="input-control" rows="3" required placeholder="Ex: Ajuste na escala, indisponibilidade do motorista ou manutenção do veículo..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" onclick="closeModal('modal-unassign-trip')" class="btn btn-secondary">Cancelar</button>
          <button type="submit" class="btn btn-ghost-danger">Confirmar Retirada</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: TROCAR MOTORISTA DA ROTA -->
  <div id="modal-reassign-trip" class="modal-overlay hidden">
    <div class="card modal-content" style="max-width: 520px;">
      <div class="modal-header">
        <h3 class="text-base font-bold flex items-center gap-2">
          <span data-lucide="refresh-cw" class="icon-sm" style="color: var(--cyan-base);"></span>
          <span>Trocar Motorista da Rota</span>
        </h3>
        <button type="button" onclick="closeModal('modal-reassign-trip')" class="btn btn-secondary btn-icon" title="Fechar">
          <span data-lucide="x" class="icon-sm"></span>
        </button>
      </div>

      <form id="form-reassign-trip" onsubmit="handleReassignTripSubmit(event)">
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <input type="hidden" id="reassign-trip-id">

          <p class="text-xs" style="color: var(--text-secondary);">
            Transferindo a viagem <strong id="reassign-trip-code" style="color: #fff;"></strong> do motorista atual (<span id="reassign-current-driver" style="color: #fff;">-</span>) para um novo motorista.
          </p>

          <div>
            <label>Novo Motorista *</label>
            <select id="reassign-driver-select" class="input-control" required onchange="handleReassignDriverChange()">
              <option value="">Selecione o novo motorista...</option>
            </select>
          </div>

          <div>
            <label>Veículo *</label>
            <select id="reassign-vehicle-select" class="input-control" required>
              <option value="">Selecione o veículo...</option>
            </select>
          </div>

          <div>
            <label>Motivo da Substituição</label>
            <textarea id="reassign-trip-reason" class="input-control" rows="2" placeholder="Ex: Substituição por motivo de escala ou solicitação da filial..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" onclick="closeModal('modal-reassign-trip')" class="btn btn-secondary">Cancelar</button>
          <button type="submit" class="btn btn-cyan">Confirmar Substituição</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: CANCELAR ROTA -->
  <div id="modal-cancel-trip" class="modal-overlay hidden">
    <div class="card modal-content" style="max-width: 480px;">
      <div class="modal-header">
        <h3 class="text-base font-bold flex items-center gap-2">
          <span data-lucide="alert-octagon" class="icon-sm" style="color: var(--rose-base);"></span>
          <span>Cancelar Rota / Viagem</span>
        </h3>
        <button type="button" onclick="closeModal('modal-cancel-trip')" class="btn btn-secondary btn-icon" title="Fechar">
          <span data-lucide="x" class="icon-sm"></span>
        </button>
      </div>

      <form id="form-cancel-trip" onsubmit="handleCancelTripSubmit(event)">
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <input type="hidden" id="cancel-trip-id">

          <p class="text-xs" style="color: var(--text-secondary);">
            A viagem <strong id="cancel-trip-code" style="color: #fff;"></strong> será cancelada definitivamente. O motorista será notificado e as entregas serão canceladas.
          </p>

          <div>
            <label>Motivo do Cancelamento *</label>
            <textarea id="cancel-trip-reason" class="input-control" rows="3" required placeholder="Ex: Carga cancelada pelo cliente, problema operacional no CD, etc."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" onclick="closeModal('modal-cancel-trip')" class="btn btn-secondary">Fechar</button>
          <button type="submit" class="btn btn-ghost-danger">Confirmar Cancelamento</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: ATUALIZAR STATUS DA VIAGEM -->
  <div id="modal-trip-status" class="modal-overlay hidden">
    <div class="card modal-content" style="max-width: 480px;">
      <div class="modal-header">
        <h3 class="text-base font-bold flex items-center gap-2">
          <span data-lucide="edit-2" class="icon-sm" style="color: var(--brand-light);"></span>
          <span>Alterar Status da Viagem</span>
        </h3>
        <button type="button" onclick="closeModal('modal-trip-status')" class="btn btn-secondary btn-icon" title="Fechar">
          <span data-lucide="x" class="icon-sm"></span>
        </button>
      </div>

      <form id="form-trip-status">
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <input type="hidden" id="trip-status-id">

          <p class="text-xs" style="color: var(--text-secondary);">
            Alterando o status da viagem <strong id="trip-status-code" style="color: #fff;"></strong>. As transições respeitam o fluxo operacional: PENDENTE → EM ANDAMENTO → CONCLUÍDA.
          </p>

          <div>
            <label>Novo Status *</label>
            <select id="trip-status-select" class="input-control" required>
              <!-- Options populated dynamically based on current status -->
            </select>
          </div>

          <div>
            <label>Observação / Justificativa (Opcional)</label>
            <textarea id="trip-status-notes" class="input-control" rows="3" placeholder="Ex: Viagem iniciada após conferência do manifesto..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" onclick="closeModal('modal-trip-status')" class="btn btn-secondary">Cancelar</button>
          <button type="submit" class="btn btn-primary">Confirmar Transição</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: RESET SENHA -->
  <div id="modal-reset-pwd" class="modal-overlay hidden">
    <div class="card modal-content" style="max-width: 440px;">
      <div class="modal-header">
        <h3 class="text-base font-bold flex items-center gap-2">
          <span data-lucide="key" class="icon-sm" style="color: var(--amber-base);"></span>
          <span>Redefinir Senha</span>
        </h3>
        <button type="button" onclick="closeModal('modal-reset-pwd')" class="btn btn-secondary btn-icon" title="Fechar">
          <span data-lucide="x" class="icon-sm"></span>
        </button>
      </div>

      <form id="form-reset-pwd">
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
          <input type="hidden" id="reset-pwd-user-id">

          <p class="text-xs" style="color: var(--text-secondary);">
            Defina a nova senha para o usuário <strong id="reset-pwd-username" style="color: #fff;"></strong>. As sessões ativas serão invalidadas.
          </p>

          <div>
            <label>Nova Senha *</label>
            <input type="password" id="reset-new-password" class="input-control" required minlength="6" placeholder="Mínimo 6 caracteres">
          </div>

          <div>
            <label>Confirmar Nova Senha *</label>
            <input type="password" id="reset-confirm-password" class="input-control" required minlength="6" placeholder="Repita a nova senha">
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" onclick="closeModal('modal-reset-pwd')" class="btn btn-secondary">Cancelar</button>
          <button type="submit" class="btn btn-warning">Confirmar Redefinição</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: DETALHES DO ROMANEIO -->
  <div id="modal-romaneio-details" class="modal-overlay hidden">
    <div class="card modal-content" style="max-width: 820px;">
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div style="width: 2.25rem; height: 2.25rem; border-radius: 0.6rem; background: var(--purple-base); display: flex; align-items: center; justify-content: center; color: #fff;">
            <span data-lucide="file-text" class="icon-md"></span>
          </div>
          <div>
            <h3 id="romaneio-detail-code" class="text-base font-bold">Romaneio #</h3>
            <p id="romaneio-detail-sub" class="text-xs" style="color: var(--text-secondary);"></p>
          </div>
        </div>
        <button type="button" onclick="closeModal('modal-romaneio-details')" class="btn btn-secondary btn-icon" title="Fechar">
          <span data-lucide="x" class="icon-sm"></span>
        </button>
      </div>

      <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <!-- Status & Approvals Bar -->
        <div class="card" style="padding: 1rem; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider" style="color: var(--text-muted); display: block;">Status do Romaneio</span>
            <div id="romaneio-detail-status-badge" style="margin-top: 0.25rem;"></div>
          </div>
          <div id="romaneio-detail-actions" class="flex items-center gap-2">
            <!-- Dynamic Actions -->
          </div>
        </div>

        <!-- Info Grid -->
        <div class="grid-4" style="background: var(--bg-surface-elevated); padding: 1rem; border-radius: 0.75rem; border: 1px solid var(--border-color);">
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Motorista</span>
            <strong id="romaneio-detail-driver" class="text-sm">-</strong>
          </div>
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Veículo</span>
            <strong id="romaneio-detail-vehicle" class="text-sm font-mono">-</strong>
          </div>
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Viagem</span>
            <div id="romaneio-detail-trip" class="text-sm font-bold">-</div>
          </div>
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Data de Envio</span>
            <strong id="romaneio-detail-date" class="text-sm">-</strong>
          </div>
        </div>

        <!-- Observações -->
        <div id="romaneio-detail-notes-container" class="card" style="padding: 0.85rem; border: 1px solid var(--border-color); display: none;">
          <span class="text-xs font-semibold uppercase tracking-wider" style="color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Parecer / Observações:</span>
          <p id="romaneio-detail-notes" class="text-xs" style="color: var(--text-secondary);"></p>
        </div>

        <!-- Documentos e Canhotos Anexados -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted); margin-bottom: 0.5rem;">Documentos & Canhotos Anexados</h4>
          <div id="romaneio-detail-docs" class="grid-3" style="gap: 0.75rem;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- Justificativa Form (Aprovação / Rejeição) -->
        <div id="romaneio-review-form-container" class="card" style="padding: 1rem; border: 1px dashed var(--brand-light); background: rgba(59, 130, 246, 0.05); display: none;">
          <h4 id="romaneio-review-title" class="text-xs font-bold uppercase tracking-wider" style="color: var(--brand-light); margin-bottom: 0.5rem;">Análise Administrativa</h4>
          <input type="hidden" id="romaneio-review-id">
          <input type="hidden" id="romaneio-review-target-status">
          <div style="margin-bottom: 0.75rem;">
            <label class="text-xs">Observação / Justificativa:</label>
            <textarea id="romaneio-review-notes" class="input-control" rows="2" placeholder="Informe o motivo da decisão..."></textarea>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" onclick="cancelRomaneioReview()" class="btn btn-secondary btn-sm">Cancelar</button>
            <button type="button" onclick="submitRomaneioReview()" id="romaneio-review-btn" class="btn btn-primary btn-sm">Confirmar</button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" onclick="closeModal('modal-romaneio-details')" class="btn btn-secondary">Fechar</button>
      </div>
    </div>
  </div>

  <!-- MODAL: DETALHES DA NOTA FISCAL -->
  <div id="modal-invoice-details" class="modal-overlay hidden">
    <div class="card modal-content" style="max-width: 820px;">
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div style="width: 2.25rem; height: 2.25rem; border-radius: 0.6rem; background: var(--emerald-base); display: flex; align-items: center; justify-content: center; color: #fff;">
            <span data-lucide="receipt" class="icon-md"></span>
          </div>
          <div>
            <h3 id="invoice-detail-title" class="text-base font-bold">Nota Fiscal Eletrônica</h3>
            <p id="invoice-detail-sub" class="text-xs" style="color: var(--text-secondary);"></p>
          </div>
        </div>
        <button type="button" onclick="closeModal('modal-invoice-details')" class="btn btn-secondary btn-icon" title="Fechar">
          <span data-lucide="x" class="icon-sm"></span>
        </button>
      </div>

      <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <!-- Chave de Acesso -->
        <div class="card" style="padding: 1rem; border: 1px solid var(--border-color); background: var(--bg-surface-elevated);">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider" style="color: var(--text-muted);">Chave de Acesso (44 Dígitos)</span>
            <span class="badge badge-purple text-xs">Fonte da Verdade: HK ERP</span>
          </div>
          <p id="invoice-detail-key" class="font-mono text-sm font-bold break-all" style="color: var(--brand-light); margin-top: 0.35rem; user-select: all;">-</p>
        </div>

        <!-- Info Grid -->
        <div class="grid-4" style="background: var(--bg-surface-elevated); padding: 1rem; border-radius: 0.75rem; border: 1px solid var(--border-color);">
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Número / Série</span>
            <strong id="invoice-detail-number" class="text-sm font-mono">-</strong>
          </div>
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Valor da Carga (ERP)</span>
            <strong id="invoice-detail-value" class="text-sm font-mono" style="color: var(--emerald-base);">-</strong>
          </div>
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Volumes / Peso</span>
            <strong id="invoice-detail-weight-vol" class="text-sm font-mono">-</strong>
          </div>
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Status</span>
            <div id="invoice-detail-status-badge" style="margin-top: 0.15rem;">-</div>
          </div>
        </div>

        <!-- Destinatário & Endereço -->
        <div class="card" style="padding: 1rem; border: 1px solid var(--border-color);">
          <h4 class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted); margin-bottom: 0.5rem;">Destinatário & Local de Entrega</h4>
          <div class="grid-2">
            <div>
              <span class="text-xs" style="color: var(--text-muted); display: block;">Razão Social / Nome</span>
              <strong id="invoice-detail-recipient" class="text-sm">-</strong>
            </div>
            <div>
              <span class="text-xs" style="color: var(--text-muted); display: block;">Endereço Completo</span>
              <p id="invoice-detail-address" class="text-xs text-muted">-</p>
            </div>
          </div>
        </div>

        <!-- Viagem e Motorista Vinculados -->
        <div class="card" style="padding: 1rem; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider" style="color: var(--text-muted); display: block;">Viagem Operacional</span>
            <div id="invoice-detail-trip-info" class="text-sm font-bold" style="margin-top: 0.25rem;">-</div>
          </div>
          <div id="invoice-detail-trip-action">
            <!-- Link to trip details -->
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" onclick="closeModal('modal-invoice-details')" class="btn btn-secondary">Fechar</button>
      </div>
    </div>
  </div>

  <!-- MODAL: WIZARD OPERACIONAL DE DESPACHO DE ROTAS (4 ETAPAS COMPLETAS) -->
  <div id="modal-dispatch-route-wizard" class="modal-overlay hidden">
    <div class="card modal-content" style="max-width: 960px; max-height: 92vh; display: flex; flex-direction: column;">
      <!-- Header -->
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div style="width: 2.5rem; height: 2.5rem; border-radius: 0.75rem; background: linear-gradient(135deg, var(--brand-light), var(--brand-primary)); display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
            <span data-lucide="navigation" class="icon-md"></span>
          </div>
          <div>
            <h3 class="text-base font-bold">Montagem e Despacho de Rota Operacional</h3>
            <p class="text-xs" style="color: var(--text-secondary);">Fluxo ponta a ponta: Seleção de NFs &rarr; Agrupamento de Paradas &rarr; Motorista/Veículo &rarr; Despacho ao Android.</p>
          </div>
        </div>
        <button type="button" onclick="closeModal('modal-dispatch-route-wizard')" class="btn btn-secondary btn-icon" title="Fechar">
          <span data-lucide="x" class="icon-sm"></span>
        </button>
      </div>

      <!-- Stepper Navigation (4 Etapas) -->
      <div style="display: flex; border-bottom: 1px solid var(--border-color); background: var(--bg-surface-elevated);">
        <button type="button" id="wiz-tab-1" onclick="switchWizStep(1)" class="btn" style="flex: 1; border-radius: 0; border-bottom: 2px solid var(--brand-light); background: transparent; color: var(--text-primary); font-size: 0.8rem; font-weight: 700; padding: 0.75rem;">
          1. Selecionar NFs (<span id="wiz-tab1-count">0</span>)
        </button>
        <button type="button" id="wiz-tab-2" onclick="switchWizStep(2)" class="btn" style="flex: 1; border-radius: 0; border-bottom: 2px solid transparent; background: transparent; color: var(--text-muted); font-size: 0.8rem; font-weight: 700; padding: 0.75rem;">
          2. Gerar Paradas (<span id="wiz-tab2-count">0</span>)
        </button>
        <button type="button" id="wiz-tab-3" onclick="switchWizStep(3)" class="btn" style="flex: 1; border-radius: 0; border-bottom: 2px solid transparent; background: transparent; color: var(--text-muted); font-size: 0.8rem; font-weight: 700; padding: 0.75rem;">
          3. Motorista &amp; Veículo
        </button>
        <button type="button" id="wiz-tab-4" onclick="switchWizStep(4)" class="btn" style="flex: 1; border-radius: 0; border-bottom: 2px solid transparent; background: transparent; color: var(--text-muted); font-size: 0.8rem; font-weight: 700; padding: 0.75rem;">
          4. Dados da Rota &amp; Despacho
        </button>
      </div>

      <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem;">

        <!-- ============================================== -->
        <!-- ETAPA 1: SELECIONAR NOTAS FISCAIS -->
        <!-- ============================================== -->
        <div id="wiz-step-1" style="display: flex; flex-direction: column; gap: 1rem;">
          <!-- Top Resumo Bar -->
          <div class="grid-4" style="background: var(--bg-surface-elevated); padding: 0.85rem 1rem; border-radius: 0.75rem; border: 1px solid var(--border-color);">
            <div>
              <span class="text-xs" style="color: var(--text-muted); display: block;">NFs Selecionadas</span>
              <strong id="wiz-nfs-summary-count" class="text-base font-mono" style="color: var(--brand-light);">0 NFs</strong>
            </div>
            <div>
              <span class="text-xs" style="color: var(--text-muted); display: block;">Total Volumes</span>
              <strong id="wiz-nfs-summary-vol" class="text-base font-mono">0 vol</strong>
            </div>
            <div>
              <span class="text-xs" style="color: var(--text-muted); display: block;">Peso Estimado</span>
              <strong id="wiz-nfs-summary-wt" class="text-base font-mono">0.0 kg</strong>
            </div>
            <div>
              <span class="text-xs" style="color: var(--text-muted); display: block;">Valor Total das Cargas</span>
              <strong id="wiz-nfs-summary-val" class="text-base font-mono" style="color: var(--emerald-base);">R$ 0,00</strong>
            </div>
          </div>

          <!-- Filtros de Busca & Ações Rápidas de NFs -->
          <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 0.75rem;">
            <div class="flex items-center gap-2" style="flex: 1; min-width: 260px;">
              <div class="input-with-icon" style="flex: 1;">
                <span class="input-icon" data-lucide="search"></span>
                <input type="text" id="wiz-nfs-search-input" class="input-control" placeholder="Buscar por NF, Destinatário, Cidade..." oninput="renderWizNfsTable()">
              </div>

              <select id="wiz-nfs-origin-filter" class="input-control" style="width: auto; min-width: 140px;" onchange="renderWizNfsTable()">
                <option value="">Todas Origens</option>
                <option value="ERP">Apenas ERP</option>
                <option value="MANUAL">Apenas Manual</option>
              </select>
            </div>

            <div class="flex items-center gap-2">
              <button type="button" onclick="wizSelectAllAvailableNfs()" class="btn btn-secondary btn-sm" title="Marcar todas as NFs disponíveis para roteirização">
                <span data-lucide="check-square" class="icon-xs"></span>
                <span>Marcar Todas</span>
              </button>
              <button type="button" onclick="wizDeselectAllNfs()" class="btn btn-secondary btn-sm" title="Limpar seleção de NFs">
                <span data-lucide="square" class="icon-xs"></span>
                <span>Desmarcar</span>
              </button>
              <button type="button" onclick="openCreateManualInvoiceModal()" class="btn btn-secondary btn-sm" style="border-color: var(--emerald-base); color: var(--emerald-base);" title="Cadastrar nova NF avulsa">
                <span data-lucide="plus-circle" class="icon-xs"></span>
                <span>+ NF Manual</span>
              </button>
            </div>
          </div>

          <!-- Tabela de NFs Disponíveis -->
          <div class="table-container" style="max-height: 280px; background: var(--bg-surface-elevated); border-radius: 0.75rem; border: 1px solid var(--border-color);">
            <table>
              <thead>
                <tr>
                  <th style="width: 40px; text-align: center;">
                    <input type="checkbox" id="wiz-nfs-master-checkbox" onchange="handleWizMasterCheckboxChange(this)">
                  </th>
                  <th>NF-e / Série</th>
                  <th>Destinatário / Doc</th>
                  <th>Endereço de Entrega</th>
                  <th>Cidade/UF</th>
                  <th>Vol / Peso</th>
                  <th>Valor</th>
                  <th>Origem</th>
                </tr>
              </thead>
              <tbody id="wiz-nfs-table-body">
                <tr><td colspan="8" class="text-center text-xs" style="padding: 1.5rem; color: var(--text-muted);">Carregando Notas Fiscais disponíveis...</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Step 1 Footer -->
          <div class="flex items-center justify-between" style="padding-top: 0.5rem; border-top: 1px solid var(--border-color);">
            <button type="button" onclick="closeModal('modal-dispatch-route-wizard')" class="btn btn-secondary">Cancelar</button>
            <button type="button" onclick="switchWizStep(2)" class="btn btn-primary">
              <span>Avançar para Gerar Paradas</span>
              <span data-lucide="arrow-right" class="icon-sm"></span>
            </button>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- ETAPA 2: GERAR & REORGANIZAR PARADAS -->
        <!-- ============================================== -->
        <div id="wiz-step-2" class="hidden" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="card" style="padding: 0.85rem 1rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-color); display: flex; items-center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <span class="text-xs" style="color: var(--text-muted); display: block;">Agrupamento Inteligente da Rota</span>
              <strong id="wiz-stops-summary-badge" class="text-sm font-bold" style="color: var(--brand-light);">0 paradas agrupadas a partir de 0 NFs</strong>
            </div>
            <div class="flex items-center gap-3 text-xs">
              <div>Total Carga: <strong id="wiz-stops-total-vol-wt" class="font-mono">-</strong></div>
              <div>Valor Carga: <strong id="wiz-stops-total-val" class="font-mono" style="color: var(--emerald-base);">-</strong></div>
            </div>
          </div>

          <p class="text-xs" style="color: var(--text-secondary);">
            As Notas Fiscais foram agrupadas por destinatário e endereço. Utilize os botões de subir (<span data-lucide="arrow-up" style="width:12px;height:12px;display:inline-block;"></span>) e descer (<span data-lucide="arrow-down" style="width:12px;height:12px;display:inline-block;"></span>) para reorganizar a sequência de entrega da viagem.
          </p>

          <!-- Tabela de Paradas Agrupadas com Reordenação -->
          <div class="table-container" style="max-height: 300px; background: var(--bg-surface-elevated); border-radius: 0.75rem; border: 1px solid var(--border-color);">
            <table>
              <thead>
                <tr>
                  <th style="width: 70px; text-align: center;">Sequência</th>
                  <th>Destinatário / Razão Social</th>
                  <th>Endereço Completo de Entrega</th>
                  <th>Cidade/UF</th>
                  <th>Volumes / Peso / Valor</th>
                  <th>NFs Vinculadas à Parada</th>
                </tr>
              </thead>
              <tbody id="wiz-stops-table-body">
                <tr><td colspan="6" class="text-center text-xs" style="padding: 1.5rem; color: var(--text-muted);">Nenhuma parada configurada.</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Step 2 Footer -->
          <div class="flex items-center justify-between" style="padding-top: 0.5rem; border-top: 1px solid var(--border-color);">
            <button type="button" onclick="switchWizStep(1)" class="btn btn-secondary">
              <span data-lucide="arrow-right" class="icon-sm" style="transform: rotate(180deg);"></span>
              <span>Voltar para Seleção de NFs</span>
            </button>
            <button type="button" onclick="switchWizStep(3)" class="btn btn-primary">
              <span>Avançar para Motorista &amp; Veículo</span>
              <span data-lucide="arrow-right" class="icon-sm"></span>
            </button>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- ETAPA 3: MOTORISTA & VEÍCULO -->
        <!-- ============================================== -->
        <div id="wiz-step-3" class="hidden" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div class="card" style="padding: 1.25rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 1rem;">
            <h4 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style="color: var(--brand-light);">
              <span data-lucide="user-check" class="icon-sm"></span>
              <span>Atribuição Operacional do Motorista e Veículo</span>
            </h4>

            <div class="grid-2">
              <div>
                <label>Motorista Operacional *</label>
                <select id="wiz-driver-select" class="input-control" onchange="handleWizDriverChange()">
                  <option value="">Selecione o motorista (ou deixe vazio para rascunho)...</option>
                </select>
                <span class="text-xs" style="color: var(--text-muted); display: block; margin-top: 0.25rem;">
                  Apenas motoristas ativos e habilitados no sistema.
                </span>
              </div>

              <div>
                <label>Veículo da Frota *</label>
                <select id="wiz-vehicle-select" class="input-control" onchange="handleWizVehicleChange()">
                  <option value="">Selecione o veículo...</option>
                </select>
                <span class="text-xs" style="color: var(--text-muted); display: block; margin-top: 0.25rem;">
                  Preenchido automaticamente com o veículo do motorista.
                </span>
              </div>
            </div>

            <!-- Driver Conflict Banner -->
            <div id="wiz-driver-warning-banner" class="hidden" style="padding: 0.85rem 1rem; border-radius: 0.75rem; background: var(--amber-bg); border: 1px solid var(--amber-border); color: var(--amber-base); font-size: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
              <span data-lucide="alert-triangle" class="icon-sm" style="flex-shrink:0;"></span>
              <span id="wiz-driver-warning-text">Atenção: Motorista já possui uma viagem ativa em andamento.</span>
            </div>

            <!-- Driver Details Box -->
            <div id="wiz-driver-info-box" class="hidden" style="padding: 0.85rem 1rem; border-radius: 0.75rem; background: var(--bg-surface); border: 1px solid var(--border-color); font-size: 0.8rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
              <div><span class="text-xs text-muted block">Nome:</span> <strong id="wiz-driver-info-name">-</strong></div>
              <div><span class="text-xs text-muted block">CPF:</span> <strong id="wiz-driver-info-cpf">-</strong></div>
              <div><span class="text-xs text-muted block">Telefone:</span> <strong id="wiz-driver-info-phone">-</strong></div>
              <div><span class="text-xs text-muted block">CNH:</span> <strong id="wiz-driver-info-cnh">-</strong></div>
            </div>
          </div>

          <!-- Step 3 Footer -->
          <div class="flex items-center justify-between" style="padding-top: 0.5rem; border-top: 1px solid var(--border-color);">
            <button type="button" onclick="switchWizStep(2)" class="btn btn-secondary">
              <span data-lucide="arrow-right" class="icon-sm" style="transform: rotate(180deg);"></span>
              <span>Voltar para Paradas</span>
            </button>
            <button type="button" onclick="switchWizStep(4)" class="btn btn-primary">
              <span>Avançar para Dados da Rota</span>
              <span data-lucide="arrow-right" class="icon-sm"></span>
            </button>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- ETAPA 4: DADOS DA ROTA & CONFIRMAÇÃO / DESPACHO -->
        <!-- ============================================== -->
        <div id="wiz-step-4" class="hidden" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div class="card" style="padding: 1.25rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 1rem;">
            <h4 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style="color: var(--brand-light);">
              <span data-lucide="file-check" class="icon-sm"></span>
              <span>Identificação e Programação da Viagem</span>
            </h4>

            <div class="grid-2">
              <div>
                <label>Código da Viagem / Rota *</label>
                <input type="text" id="wiz-trip-code" class="input-control font-mono font-bold" required placeholder="HK-2026-0001">
              </div>

              <div>
                <label>Data / Hora Programada de Saída *</label>
                <input type="datetime-local" id="wiz-start-date" class="input-control" required>
              </div>
            </div>

            <div>
              <label>Origem da Viagem (CD / Hub Logístico) *</label>
              <input type="text" id="wiz-origin" class="input-control" value="CD HK Transportes - Av. dos Autonomistas, 1200, Osasco - SP">
            </div>

            <div>
              <label>Observações Operacionais para o Motorista</label>
              <textarea id="wiz-notes" class="input-control" rows="2" placeholder="Instruções de carregamento, conferência de lacre, orientações de entrega..."></textarea>
            </div>
          </div>

          <!-- Resumo Consolidado Pré-Despacho -->
          <div class="card" style="padding: 1rem; background: linear-gradient(135deg, rgba(37,99,235,0.08), rgba(16,185,129,0.05)); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.75rem;">
            <h4 class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Resumo de Fechamento do Despacho</h4>
            <div class="grid-4 text-xs">
              <div><span class="text-muted block">Motorista:</span> <strong id="wiz-final-driver">-</strong></div>
              <div><span class="text-muted block">Veículo:</span> <strong id="wiz-final-vehicle">-</strong></div>
              <div><span class="text-muted block">Paradas &amp; NFs:</span> <strong id="wiz-final-stops-nfs">-</strong></div>
              <div><span class="text-muted block">Destino Final:</span> <strong id="wiz-final-destination">-</strong></div>
            </div>
          </div>

          <!-- Step 4 Footer / Main Submit Actions -->
          <div class="modal-footer" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0 0 0; margin-top: 0;">
            <button type="button" onclick="switchWizStep(3)" class="btn btn-secondary">
              <span data-lucide="arrow-right" class="icon-sm" style="transform: rotate(180deg);"></span>
              <span>Voltar</span>
            </button>

            <div class="flex items-center gap-2">
              <button type="button" onclick="submitWizTrip('DRAFT')" class="btn btn-secondary" style="border-color: var(--brand-light); color: var(--brand-light);" title="Salvar rota com status PENDING para despacho posterior">
                <span data-lucide="file-text" class="icon-sm"></span>
                <span>Salvar Rascunho</span>
              </button>

              <button type="button" onclick="submitWizTrip('ASSIGN')" class="btn btn-primary" style="padding: 0.75rem 1.4rem; font-weight: 700; box-shadow: 0 4px 16px rgba(37,99,235,0.4);" title="Criar a viagem, vincular paradas/NFs e despachar imediatamente para o Android">
                <span data-lucide="send" class="icon-sm"></span>
                <span>Enviar Rota ao Motorista</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- MODAL: CADASTRAR NOTA FISCAL MANUAL (CONTINGÊNCIA) -->
  <div id="modal-create-manual-invoice" class="modal-overlay hidden">
    <div class="card modal-content" style="max-width: 820px; max-height: 92vh; display: flex; flex-direction: column;">
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div style="width: 2.5rem; height: 2.5rem; border-radius: 0.75rem; background: linear-gradient(135deg, var(--emerald-base), #059669); display: flex; align-items: center; justify-content: center; color: #fff;">
            <span data-lucide="receipt" class="icon-md"></span>
          </div>
          <div>
            <h3 class="text-base font-bold">Cadastrar Nota Fiscal (Contingência / Manual)</h3>
            <p class="text-xs" style="color: var(--text-secondary);">Cadastre uma NF avulsa para incluir imediatamente em viagens e rotas operacionais.</p>
          </div>
        </div>
        <button type="button" onclick="closeModal('modal-create-manual-invoice')" class="btn btn-secondary btn-icon" title="Fechar">
          <span data-lucide="x" class="icon-sm"></span>
        </button>
      </div>

      <form id="form-create-manual-invoice" onsubmit="submitManualInvoice(event)" style="display: flex; flex-direction: column; flex: 1; overflow: hidden;">
        <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- Dados Fiscais -->
          <div class="card" style="padding: 1rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-color);">
            <h4 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style="color: var(--emerald-base); margin-bottom: 0.75rem;">
              <span data-lucide="file-check" class="icon-sm"></span>
              <span>Identificação Fiscal do Documento</span>
            </h4>

            <div class="grid-3" style="margin-bottom: 0.75rem;">
              <div>
                <label>Número da NF-e *</label>
                <input type="text" id="manual-nf-number" class="input-control font-mono font-bold" required placeholder="Ex: 004821">
              </div>
              <div>
                <label>Série</label>
                <input type="text" id="manual-nf-series" class="input-control font-mono" value="1" placeholder="1">
              </div>
              <div>
                <label>Remetente / Embarcador</label>
                <input type="text" id="manual-nf-customer" class="input-control" placeholder="HK Distribuidora Ltda" value="HK Logística & Cargas">
              </div>
            </div>

            <div>
              <label>Chave de Acesso NF-e (Opcional p/ cadastro MANUAL)</label>
              <input type="text" id="manual-nf-key" class="input-control font-mono text-xs" placeholder="Opcional — informe apenas se possuir chave de 44 dígitos da NF-e" maxlength="44">
            </div>
          </div>

          <!-- Destinatário -->
          <div class="card" style="padding: 1rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-color);">
            <h4 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style="color: var(--brand-light); margin-bottom: 0.75rem;">
              <span data-lucide="user" class="icon-sm"></span>
              <span>Destinatário & Documentos</span>
            </h4>

            <div class="grid-2">
              <div>
                <label>Razão Social / Nome do Destinatário *</label>
                <input type="text" id="manual-nf-recipient" class="input-control" required placeholder="Ex: Supermercados Estrela Ltda">
              </div>
              <div>
                <label>CNPJ / CPF do Destinatário</label>
                <input type="text" id="manual-nf-doc" class="input-control font-mono" placeholder="Ex: 12.345.678/0001-90">
              </div>
            </div>
          </div>

          <!-- Endereço de Entrega -->
          <div class="card" style="padding: 1rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-color);">
            <h4 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style="color: var(--cyan-base); margin-bottom: 0.75rem;">
              <span data-lucide="map-pin" class="icon-sm"></span>
              <span>Endereço de Entrega / Descarregamento</span>
            </h4>

            <div class="grid-3" style="margin-bottom: 0.75rem;">
              <div style="grid-column: span 2;">
                <label>Logradouro / Rua / Avenida *</label>
                <input type="text" id="manual-nf-address" class="input-control" required placeholder="Ex: Rua das Indústrias">
              </div>
              <div>
                <label>Número *</label>
                <input type="text" id="manual-nf-number-address" class="input-control" required placeholder="Ex: 500" value="S/N">
              </div>
            </div>

            <div class="grid-4">
              <div>
                <label>Complemento</label>
                <input type="text" id="manual-nf-complement" class="input-control" placeholder="Ex: Galpão 2">
              </div>
              <div>
                <label>Bairro *</label>
                <input type="text" id="manual-nf-neighborhood" class="input-control" required placeholder="Ex: Industrial" value="Centro">
              </div>
              <div>
                <label>Cidade *</label>
                <input type="text" id="manual-nf-city" class="input-control" required placeholder="Ex: São Paulo">
              </div>
              <div>
                <label>UF *</label>
                <input type="text" id="manual-nf-state" class="input-control font-mono uppercase" required placeholder="SP" maxlength="2" value="SP">
              </div>
            </div>

            <div style="margin-top: 0.75rem;">
              <label>CEP</label>
              <input type="text" id="manual-nf-cep" class="input-control font-mono" placeholder="01001-000" maxlength="9" style="max-width: 200px;">
            </div>
          </div>

          <!-- Carga e Valores -->
          <div class="card" style="padding: 1rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-color);">
            <h4 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style="color: var(--amber-base); margin-bottom: 0.75rem;">
              <span data-lucide="package" class="icon-sm"></span>
              <span>Volumes, Peso e Valor</span>
            </h4>

            <div class="grid-3">
              <div>
                <label>Quantidade de Volumes *</label>
                <input type="number" id="manual-nf-volumes" class="input-control font-mono" required min="1" value="1">
              </div>
              <div>
                <label>Peso Total (kg) *</label>
                <input type="number" id="manual-nf-weight" class="input-control font-mono" required min="0.1" step="0.1" value="10.0">
              </div>
              <div>
                <label>Valor da Mercadoria (R$) *</label>
                <input type="number" id="manual-nf-value" class="input-control font-mono" required min="0.01" step="0.01" value="500.00">
              </div>
            </div>

            <div style="margin-top: 0.75rem;">
              <label>Observações / Instruções Operacionais</label>
              <textarea id="manual-nf-notes" class="input-control" rows="2" placeholder="Ex: Recebimento das 08h às 17h. Conferir canhoto assinado."></textarea>
            </div>
          </div>

        </div>

        <div class="modal-footer" style="display: flex; align-items: center; justify-content: space-between;">
          <button type="button" onclick="closeModal('modal-create-manual-invoice')" class="btn btn-secondary">Cancelar</button>
          
          <button type="submit" id="btn-submit-manual-nf" class="btn btn-primary" style="background: var(--emerald-base); border-color: var(--emerald-base);">
            <span data-lucide="check" class="icon-xs"></span>
            <span>Salvar Nota Fiscal</span>
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: ADICIONAR NOTAS FISCAIS À ROTA EXISTENTE -->
  <div id="modal-add-invoices-to-trip" class="modal-overlay hidden">
    <div class="card modal-content" style="max-width: 860px; max-height: 90vh; display: flex; flex-direction: column;">
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div style="width: 2.5rem; height: 2.5rem; border-radius: 0.75rem; background: linear-gradient(135deg, var(--brand-light), var(--brand-primary)); display: flex; align-items: center; justify-content: center; color: #fff;">
            <span data-lucide="plus-circle" class="icon-md"></span>
          </div>
          <div>
            <h3 class="text-base font-bold">Adicionar Notas Fiscais à Viagem <span id="add-nf-trip-code" class="text-primary font-mono font-bold"></span></h3>
            <p class="text-xs" style="color: var(--text-secondary);">Selecione Notas Fiscais disponíveis para incluir como novas paradas de entrega nesta rota.</p>
          </div>
        </div>
        <button type="button" onclick="closeModal('modal-add-invoices-to-trip')" class="btn btn-secondary btn-icon" title="Fechar">
          <span data-lucide="x" class="icon-sm"></span>
        </button>
      </div>

      <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.25rem; overflow-y: auto; flex: 1; padding: 1.5rem;">
        <input type="hidden" id="add-nf-target-trip-id">

        <!-- Trip Status Warning / Info -->
        <div class="card" style="padding: 0.85rem 1rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div><strong>Motorista:</strong> <span id="add-nf-trip-driver" style="color: #fff;">-</span></div>
          <div><strong>Veículo:</strong> <span id="add-nf-trip-vehicle" style="color: #fff;">-</span></div>
          <div><strong>Status:</strong> <span id="add-nf-trip-status" class="badge badge-brand">-</span></div>
        </div>

        <!-- Available Invoices Table -->
        <div>
          <div class="flex items-center justify-between" style="margin-bottom: 0.5rem;">
            <h4 class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Notas Fiscais Disponíveis (Sem Viagem)</h4>
            <span id="add-nf-available-count" class="badge badge-emerald text-xs">0 NFs disponíveis</span>
          </div>

          <div class="table-container" style="max-height: 280px; background: var(--bg-surface-elevated); border-radius: 0.75rem; border: 1px solid var(--border-color);">
            <table>
              <thead>
                <tr>
                  <th style="width: 40px; text-align: center;">
                    <input type="checkbox" id="add-nf-select-all-cb" onchange="toggleSelectAllAddToTripInvoices(this.checked)">
                  </th>
                  <th>NF / Série</th>
                  <th>Destinatário</th>
                  <th>Endereço / Cidade</th>
                  <th>Volumes / Peso</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody id="add-nf-available-table-body">
                <tr><td colspan="6" class="text-center text-xs" style="padding: 1.5rem; color: var(--text-muted);">Carregando Notas Fiscais disponíveis...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Selected Summary -->
        <div class="card" style="padding: 0.85rem 1rem; background: rgba(37,99,235,0.08); border: 1px solid rgba(37,99,235,0.3); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <span class="text-xs font-bold" style="color: var(--brand-light);">
            Selecionadas para adicionar: <strong id="add-nf-selected-count">0</strong> NFs
          </span>
          <span class="text-xs" id="add-nf-selected-summary" style="color: var(--text-secondary);">-</span>
        </div>
      </div>

      <div class="modal-footer" style="display: flex; align-items: center; justify-content: space-between;">
        <button type="button" onclick="closeModal('modal-add-invoices-to-trip')" class="btn btn-secondary">Cancelar</button>
        
        <button type="button" id="btn-confirm-add-invoices-to-trip" onclick="submitAddInvoicesToTrip()" class="btn btn-primary" disabled>
          <span data-lucide="plus" class="icon-xs"></span>
          <span>Adicionar NFs à Viagem</span>
        </button>
      </div>
    </div>
  </div>

  <!-- MODAL: DETALHES DO PEDÁGIO -->
  <div id="modal-toll-details" class="modal-overlay hidden">
    <div class="card modal-content" style="max-width: 760px;">
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div style="width: 2.25rem; height: 2.25rem; border-radius: 0.6rem; background: var(--amber-base); display: flex; align-items: center; justify-content: center; color: #fff;">
            <span data-lucide="credit-card" class="icon-md"></span>
          </div>
          <div>
            <h3 id="toll-detail-title" class="text-base font-bold">Lançamento de Pedágio</h3>
            <p id="toll-detail-sub" class="text-xs" style="color: var(--text-secondary);"></p>
          </div>
        </div>
        <button type="button" onclick="closeModal('modal-toll-details')" class="btn btn-secondary btn-icon" title="Fechar">
          <span data-lucide="x" class="icon-sm"></span>
        </button>
      </div>

      <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <!-- Status Bar -->
        <div class="card" style="padding: 1rem; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider" style="color: var(--text-muted); display: block;">Status do Reembolso</span>
            <div id="toll-detail-status-badge" style="margin-top: 0.25rem;"></div>
          </div>
          <div id="toll-detail-actions" class="flex items-center gap-2">
            <!-- Dynamic Actions -->
          </div>
        </div>

        <!-- Info Grid -->
        <div class="grid-4" style="background: var(--bg-surface-elevated); padding: 1rem; border-radius: 0.75rem; border: 1px solid var(--border-color);">
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Valor Pago</span>
            <strong id="toll-detail-amount" class="text-base font-mono" style="color: var(--emerald-base);">-</strong>
          </div>
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Praça / Concessionária</span>
            <strong id="toll-detail-plaza" class="text-sm">-</strong>
          </div>
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Rodovia / Km</span>
            <strong id="toll-detail-highway" class="text-sm">-</strong>
          </div>
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Data / Hora</span>
            <strong id="toll-detail-date" class="text-sm">-</strong>
          </div>
        </div>

        <!-- Motorista & Viagem -->
        <div class="grid-2">
          <div class="card" style="padding: 0.85rem; border: 1px solid var(--border-color);">
            <span class="text-xs" style="color: var(--text-muted); display: block;">Motorista & Veículo</span>
            <p id="toll-detail-driver-vehicle" class="text-sm font-bold" style="margin-top: 0.25rem;">-</p>
          </div>
          <div class="card" style="padding: 0.85rem; border: 1px solid var(--border-color);">
            <span class="text-xs" style="color: var(--text-muted); display: block;">Viagem Vinculada</span>
            <div id="toll-detail-trip-info" class="text-sm font-bold" style="margin-top: 0.25rem;">-</div>
          </div>
        </div>

        <!-- Comprovante Foto/Recibo -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted); margin-bottom: 0.5rem;">Comprovante Fiscal Anexado</h4>
          <div id="toll-detail-receipt-container" style="background: var(--bg-surface-elevated); border-radius: 0.75rem; border: 1px solid var(--border-color); padding: 1rem; text-align: center;">
            <p class="text-xs text-muted">Carregando comprovante...</p>
          </div>
        </div>

        <!-- Justificativa Form (Aprovação / Rejeição) -->
        <div id="toll-review-form-container" class="card" style="padding: 1rem; border: 1px dashed var(--amber-base); background: rgba(245, 158, 11, 0.05); display: none;">
          <h4 id="toll-review-title" class="text-xs font-bold uppercase tracking-wider" style="color: var(--amber-base); margin-bottom: 0.5rem;">Parecer de Reembolso</h4>
          <input type="hidden" id="toll-review-id">
          <input type="hidden" id="toll-review-target-status">
          <div style="margin-bottom: 0.75rem;">
            <label class="text-xs">Observação / Justificativa:</label>
            <textarea id="toll-review-notes" class="input-control" rows="2" placeholder="Observações sobre o cupom fiscal..."></textarea>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" onclick="cancelTollReview()" class="btn btn-secondary btn-sm">Cancelar</button>
            <button type="button" onclick="submitTollReview()" id="toll-review-btn" class="btn btn-primary btn-sm">Confirmar</button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" onclick="closeModal('modal-toll-details')" class="btn btn-secondary">Fechar</button>
      </div>
    </div>
  </div>

  <!-- MODAL: DETALHES E TRATAMENTO DA OCORRÊNCIA -->
  <div id="modal-occurrence-details" class="modal-overlay hidden">
    <div class="card modal-content" style="max-width: 800px;">
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div style="width: 2.25rem; height: 2.25rem; border-radius: 0.6rem; background: var(--rose-base); display: flex; align-items: center; justify-content: center; color: #fff;">
            <span data-lucide="alert-octagon" class="icon-md"></span>
          </div>
          <div>
            <h3 id="occ-detail-title" class="text-base font-bold">Ocorrência Operacional</h3>
            <p id="occ-detail-sub" class="text-xs" style="color: var(--text-secondary);"></p>
          </div>
        </div>
        <button type="button" onclick="closeModal('modal-occurrence-details')" class="btn btn-secondary btn-icon" title="Fechar">
          <span data-lucide="x" class="icon-sm"></span>
        </button>
      </div>

      <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <!-- Status Bar -->
        <div class="card" style="padding: 1rem; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider" style="color: var(--text-muted); display: block;">Status Operacional</span>
            <div id="occ-detail-status-badge" style="margin-top: 0.25rem;"></div>
          </div>
          <div id="occ-detail-actions" class="flex items-center gap-2">
            <!-- Dynamic Status Progression Buttons -->
          </div>
        </div>

        <!-- Info Grid -->
        <div class="grid-4" style="background: var(--bg-surface-elevated); padding: 1rem; border-radius: 0.75rem; border: 1px solid var(--border-color);">
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Tipo</span>
            <strong id="occ-detail-type" class="text-sm font-bold" style="color: var(--amber-base);">-</strong>
          </div>
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Motorista</span>
            <strong id="occ-detail-driver" class="text-sm">-</strong>
          </div>
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Viagem</span>
            <div id="occ-detail-trip" class="text-sm font-bold">-</div>
          </div>
          <div>
            <span class="text-xs" style="color: var(--text-muted); display: block;">Data Registro</span>
            <strong id="occ-detail-date" class="text-sm">-</strong>
          </div>
        </div>

        <!-- Descrição e Histórico -->
        <div class="card" style="padding: 1rem; border: 1px solid var(--border-color);">
          <h4 class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted); margin-bottom: 0.5rem;">Relato do Incidente & Histórico</h4>
          <p id="occ-detail-desc" class="text-xs" style="line-height: 1.6; white-space: pre-wrap; color: var(--text-primary);">-</p>
        </div>

        <!-- Tratamento Form -->
        <div id="occ-resolution-form-container" class="card" style="padding: 1rem; border: 1px dashed var(--rose-base); background: rgba(244, 63, 94, 0.05); display: none;">
          <h4 id="occ-resolution-title" class="text-xs font-bold uppercase tracking-wider" style="color: var(--rose-base); margin-bottom: 0.5rem;">Tratamento / Atualização</h4>
          <input type="hidden" id="occ-resolution-id">
          <input type="hidden" id="occ-resolution-target-status">
          <div style="margin-bottom: 0.75rem;">
            <label class="text-xs">Parecer Operacional / Instruções:</label>
            <textarea id="occ-resolution-notes" class="input-control" rows="3" placeholder="Descreva a ação tomada ou o despacho com o motorista/cliente..."></textarea>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" onclick="cancelOccResolution()" class="btn btn-secondary btn-sm">Cancelar</button>
            <button type="button" onclick="submitOccResolution()" id="occ-resolution-btn" class="btn btn-primary btn-sm">Salvar Atualização</button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" onclick="closeModal('modal-occurrence-details')" class="btn btn-secondary">Fechar</button>
      </div>
    </div>
  </div>
`;
