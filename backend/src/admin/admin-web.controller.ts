import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Response } from 'express';

@Controller('admin')
export class AdminWebController {
  @Get(['', '/', 'dashboard', 'users', 'vehicles'])
  @ApiExcludeEndpoint()
  serveAdminApp(@Res() res: Response) {
    const html = `<!DOCTYPE html>
<html lang="pt-BR" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HK Connect — Painel Administrativo</title>
  <style>
    /* CSS RESET & VARIABLES */
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
      padding: 0.2rem 0.65rem;
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
    .input-with-icon {
      position: relative;
    }
    .input-with-icon .input-icon {
      position: absolute;
      top: 50%;
      left: 0.85rem;
      transform: translateY(-50%);
      color: var(--text-muted);
      pointer-events: none;
    }
    .input-with-icon .input-control {
      padding-left: 2.5rem;
    }
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
    .table-container {
      width: 100%;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;
    }
    thead {
      background-color: rgba(15, 23, 42, 0.95);
      border-bottom: 1px solid var(--border-color);
    }
    th {
      padding: 0.85rem 1.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }
    td {
      padding: 0.85rem 1.25rem;
      border-bottom: 1px solid rgba(51, 65, 85, 0.4);
      color: var(--text-primary);
    }
    tr:hover td { background-color: rgba(30, 41, 59, 0.4); }

    /* GRIDS */
    .grid-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
    @media (max-width: 768px) {
      .grid-2, .grid-3 { grid-template-columns: 1fr; }
    }

    /* AUTH LOGIN SCREEN */
    #auth-screen {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: radial-gradient(circle at top right, rgba(37, 99, 235, 0.12), transparent 40%),
                  radial-gradient(circle at bottom left, rgba(245, 158, 11, 0.08), transparent 40%),
                  var(--bg-base);
    }
    .login-box {
      width: 100%;
      max-width: 420px;
      padding: 2.25rem;
    }
    .logo-badge {
      width: 4rem;
      height: 4rem;
      border-radius: 1rem;
      background: linear-gradient(135deg, var(--brand-light), var(--brand-primary));
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      margin-bottom: 1rem;
      box-shadow: 0 10px 20px rgba(37, 99, 235, 0.35);
    }

    /* MAIN APP LAYOUT */
    #app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: row;
    }
    @media (max-width: 860px) {
      #app-layout { flex-direction: column; }
    }
    aside.sidebar {
      width: 260px;
      background-color: var(--bg-surface);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }
    @media (max-width: 860px) {
      aside.sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--border-color); }
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.7rem 1rem;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: left;
    }
    .nav-item:hover { background-color: var(--bg-surface-elevated); color: #fff; }
    .nav-item.active { background-color: var(--brand-primary); color: #fff; font-weight: 600; }
    
    .topbar {
      height: 4rem;
      padding: 0 1.5rem;
      border-bottom: 1px solid var(--border-color);
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 20;
    }

    /* MODAL */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.85);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-content {
      width: 100%;
      max-width: 580px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
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
    }
    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    /* TOAST */
    #toast-container {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 200;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 380px;
      pointer-events: none;
    }
    .toast {
      padding: 0.85rem 1.1rem;
      border-radius: 0.75rem;
      border: 1px solid;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
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

      <!-- PAINEL DE DIAGNÓSTICO VISUAL TEMPORÁRIO (HOMOLOGAÇÃO) -->
      <div id="admin-diagnostics" style="margin-top: 1.5rem; padding: 0.85rem; border-radius: 0.6rem; background: rgba(2, 6, 23, 0.95); border: 1px solid var(--border-color); font-size: 0.72rem; color: var(--text-secondary); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
        <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.35rem;">
          <span>DIAGNÓSTICO DO PAINEL</span>
          <span style="font-size: 0.62rem; padding: 2px 6px; border-radius: 4px; background: rgba(37,99,235,0.25); color: var(--brand-light); font-weight: 600;">HOMOLOGAÇÃO</span>
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

  <!-- MAIN APP LAYOUT (HIDDEN UNTIL AUTH) -->
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
            <div class="text-xs font-semibold" style="color: var(--brand-light);">Painel Admin</div>
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
      <nav style="flex: 1; padding: 0.5rem 0.75rem; display: flex; flex-direction: column; gap: 0.35rem;">
        <button onclick="navigate('dashboard')" id="nav-dashboard" class="nav-item active">
          <span data-lucide="layout-dashboard" class="icon-sm"></span>
          <span>Dashboard</span>
        </button>

        <button onclick="navigate('users')" id="nav-users" class="nav-item">
          <span data-lucide="users" class="icon-sm"></span>
          <span>Usuários e Motoristas</span>
        </button>

        <button onclick="navigate('vehicles')" id="nav-vehicles" class="nav-item">
          <span data-lucide="truck" class="icon-sm"></span>
          <span>Frota de Veículos</span>
        </button>
      </nav>

      <!-- Logout Button -->
      <div style="padding: 0.75rem; border-top: 1px solid var(--border-color);">
        <button onclick="handleLogout()" class="nav-item" style="color: var(--rose-base);">
          <span data-lucide="log-out" class="icon-sm"></span>
          <span>Sair da Conta</span>
        </button>
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

      <!-- VIEW: DASHBOARD -->
      <section id="view-dashboard" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- Stats Cards Grid -->
        <div class="grid-stats">
          
          <div class="card" style="padding: 1.25rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.5rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Total Usuários</span>
              <span class="badge badge-brand"><span data-lucide="users" class="icon-xs"></span></span>
            </div>
            <p id="stat-total-users" class="text-2xl font-bold">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.25rem; display: block;">HK Central</span>
          </div>

          <div class="card" style="padding: 1.25rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.5rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Usuários Ativos</span>
              <span class="badge badge-success"><span data-lucide="check-circle" class="icon-xs"></span></span>
            </div>
            <p id="stat-active-users" class="text-2xl font-bold" style="color: var(--emerald-base);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.25rem; display: block;">Acesso liberado</span>
          </div>

          <div class="card" style="padding: 1.25rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.5rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Inativos / Bloq.</span>
              <span class="badge badge-danger"><span data-lucide="shield-alert" class="icon-xs"></span></span>
            </div>
            <p id="stat-inactive-users" class="text-2xl font-bold" style="color: var(--rose-base);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.25rem; display: block;">Acesso negado</span>
          </div>

          <div class="card" style="padding: 1.25rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.5rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Motoristas</span>
              <span class="badge badge-warning"><span data-lucide="user-check" class="icon-xs"></span></span>
            </div>
            <p id="stat-total-drivers" class="text-2xl font-bold" style="color: var(--amber-base);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.25rem; display: block;">Perfis operacionais</span>
          </div>

          <div class="card" style="padding: 1.25rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.5rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">ERP_ONLY</span>
              <span class="badge badge-purple"><span data-lucide="link-2-off" class="icon-xs"></span></span>
            </div>
            <p id="stat-erp-drivers" class="text-2xl font-bold" style="color: var(--purple-base);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.25rem; display: block;">Aguardando login</span>
          </div>

          <div class="card" style="padding: 1.25rem;">
            <div class="flex items-center justify-between" style="color: var(--text-muted); margin-bottom: 0.5rem;">
              <span class="text-xs font-semibold uppercase tracking-wider">Veículos</span>
              <span class="badge badge-cyan"><span data-lucide="truck" class="icon-xs"></span></span>
            </div>
            <p id="stat-total-vehicles" class="text-2xl font-bold" style="color: var(--cyan-base);">-</p>
            <span class="text-xs" style="color: var(--text-muted); margin-top: 0.25rem; display: block;">Frota registrada</span>
          </div>
        </div>

        <!-- Quick Actions & Unlinked ERP Drivers -->
        <div class="grid-2">
          <div class="card" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <h3 class="text-base font-bold">Atalhos Operacionais</h3>
              <p class="text-xs" style="color: var(--text-secondary); margin-top: 0.25rem;">Gerencie os cadastros rápidos para liberação de acesso ao app</p>
            </div>
            <div class="grid-2" style="margin-top: 0.5rem;">
              <button onclick="openCreateUserModal('DRIVER')" class="btn btn-secondary" style="padding: 1.25rem; display: flex; align-items: flex-start; justify-content: flex-start; text-align: left;">
                <span class="badge badge-brand" style="padding: 0.5rem; margin-top: 0.25rem;"><span data-lucide="user-plus" class="icon-md"></span></span>
                <div>
                  <span class="font-semibold text-sm block">Criar Motorista</span>
                  <span class="text-xs" style="color: var(--text-muted); margin-top: 0.25rem; display: block;">Cadastre o login e vincule veículo para teste no APK</span>
                </div>
              </button>

              <button onclick="openCreateVehicleModal()" class="btn btn-secondary" style="padding: 1.25rem; display: flex; align-items: flex-start; justify-content: flex-start; text-align: left;">
                <span class="badge badge-cyan" style="padding: 0.5rem; margin-top: 0.25rem;"><span data-lucide="plus-circle" class="icon-md"></span></span>
                <div>
                  <span class="font-semibold text-sm block">Cadastrar Veículo</span>
                  <span class="text-xs" style="color: var(--text-muted); margin-top: 0.25rem; display: block;">Adicione placas e modelos à frota</span>
                </div>
              </button>
            </div>
          </div>

          <!-- ERP Pending Linking -->
          <div class="card" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold">Sincronização ERP</h3>
              <span id="erp-badge" class="badge badge-purple">0 pendentes</span>
            </div>
            <p class="text-xs" style="color: var(--text-secondary);">Motoristas criados pelo ERP que ainda não possuem usuário para login no APK.</p>
            <div id="unlinked-drivers-list" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 180px; overflow-y: auto;">
              <p class="text-xs" style="color: var(--text-muted); font-style: italic;">Nenhum motorista pendente de vínculo.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- VIEW: USERS -->
      <section id="view-users" class="hidden" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
        <!-- Filters & Action -->
        <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 0.75rem;">
          <div class="flex items-center gap-3" style="flex: 1; flex-wrap: wrap; min-width: 280px;">
            <div class="input-with-icon" style="flex: 1; min-width: 220px;">
              <span class="input-icon" data-lucide="search"></span>
              <input type="text" id="user-search-input" class="input-control" placeholder="Buscar por Nome, CPF ou Telefone...">
            </div>

            <select id="user-role-filter" class="input-control" style="width: auto; min-width: 170px;">
              <option value="">Todos os Perfis</option>
              <option value="DRIVER">Motorista (DRIVER)</option>
              <option value="MANAGER">Gerente (MANAGER)</option>
              <option value="ADMIN">Administrador (ADMIN)</option>
              <option value="OPERATOR">Operador (OPERATOR)</option>
            </select>

            <select id="user-status-filter" class="input-control" style="width: auto; min-width: 150px;">
              <option value="">Todos os Status</option>
              <option value="ACTIVE">Ativo (ACTIVE)</option>
              <option value="INACTIVE">Inativo (INACTIVE)</option>
              <option value="BLOCKED">Bloqueado (BLOCKED)</option>
            </select>
          </div>

          <button onclick="openCreateUserModal()" class="btn btn-primary">
            <span data-lucide="user-plus" class="icon-sm"></span>
            <span>Novo Usuário</span>
          </button>
        </div>

        <!-- Table -->
        <div class="card table-container">
          <table>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>CPF / Telefone</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Motorista / Veículo</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody id="users-table-body">
              <tr>
                <td colspan="6" class="text-center" style="padding: 2rem; color: var(--text-muted);">Carregando usuários...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- VIEW: VEHICLES -->
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
              <option value="EM_VIAGEM">Em Viagem</option>
              <option value="MANUTENCAO">Manutenção</option>
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
                <th>Motorista Vinculado</th>
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

    </main>
  </div>

  <!-- MODAL: USUÁRIO -->
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

  <!-- MODAL: VEÍCULO -->
  <div id="modal-vehicle" class="modal-overlay hidden">
    <div class="card modal-content" style="max-width: 480px;">
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
              <label>Status</label>
              <select id="vehicle-form-status" class="input-control">
                <option value="DISPONIVEL">Disponível</option>
                <option value="EM_VIAGEM">Em Viagem</option>
                <option value="MANUTENCAO">Manutenção</option>
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

  <!-- JAVASCRIPT CORE & EMBEDDED ICONS -->
  <script>
    // INLINE SVG ICONS DICTIONARY (ZERO EXTERNAL CALLS)
    const SVG_ICONS = {
      'truck': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18.5" r="2.5"/><circle cx="7" cy="18.5" r="2.5"/></svg>',
      'user': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      'lock': '<svg class="svg-icon" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
      'eye': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
      'arrow-right': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
      'layout-dashboard': '<svg class="svg-icon" viewBox="0 0 24 24"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
      'users': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      'log-out': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>',
      'refresh-cw': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
      'check-circle': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      'shield-alert': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      'user-check': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>',
      'link-2-off': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M9 17H7A5 5 0 0 1 7 7"/><path d="M15 7h2a5 5 0 0 1 4 8"/><line x1="8" x2="12" y1="12" y2="12"/><line x1="2" x2="22" y1="2" y2="22"/></svg>',
      'user-plus': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>',
      'plus-circle': '<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="16"/><line x1="8" x2="16" y1="12" y2="12"/></svg>',
      'search': '<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>',
      'x': '<svg class="svg-icon" viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>',
      'id-card': '<svg class="svg-icon" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M14 10h4"/><path d="M14 14h4"/></svg>',
      'info': '<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>',
      'key': '<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>',
      'edit-2': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
      'pause-circle': '<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="15" y2="9"/><line x1="14" x2="14" y1="15" y2="9"/></svg>',
      'play-circle': '<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>',
      'trash-2': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>',
      'alert-triangle': '<svg class="svg-icon" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>'
    };

    // DIAGNOSTIC CARD HELPER
    function updateDiag(id, text, color) {
      try {
        const el = document.getElementById(id);
        if (el) {
          el.innerText = text;
          if (color) el.style.color = color;
        }
      } catch (e) {}
    }

    // GLOBAL ERROR CATCHERS (SANITIZE LOGS)
    window.addEventListener('error', (event) => {
      const msg = (event && event.message ? event.message : 'Erro JS desconhecido').substring(0, 90);
      console.error('[ADMIN] Erro JS capturado:', msg);
      updateDiag('diag-error', msg, 'var(--rose-base)');
    });

    window.addEventListener('unhandledrejection', (event) => {
      const reason = event && event.reason ? (event.reason.message || event.reason) : 'Promise rejeitada';
      const msg = String(reason).substring(0, 90);
      console.error('[ADMIN] Rejeição não tratada:', msg);
      updateDiag('diag-error', msg, 'var(--rose-base)');
    });

    function renderIcons(container = document) {
      try {
        container.querySelectorAll('[data-lucide]').forEach(el => {
          const iconName = el.getAttribute('data-lucide');
          if (SVG_ICONS[iconName]) {
            el.innerHTML = SVG_ICONS[iconName];
          }
        });
      } catch (e) {
        console.warn('[ADMIN] Falha ao renderizar ícones:', e);
      }
    }

    // SAFE LOCALSTORAGE HELPERS
    function getStoredItem(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    }

    function getStoredJson(key) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        return null;
      }
    }

    // STATE
    const STATE = {
      token: getStoredItem('hk_access_token'),
      refreshToken: getStoredItem('hk_refresh_token'),
      user: getStoredJson('hk_user'),
      currentView: 'dashboard',
      users: [],
      vehicles: [],
      stats: null,
      unlinkedDrivers: [],
    };

    function formatCPF(cpf) {
      if (!cpf) return '-';
      const clean = cpf.replace(/\\D/g, '');
      if (clean.length !== 11) return cpf;
      return clean.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{2})/, '$1.$2.$3-$4');
    }

    function formatPhone(phone) {
      return phone || '-';
    }

    // TOAST NOTIFICATIONS
    function showToast(msg, type = 'info') {
      try {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        
        const typeClasses = {
          success: 'toast-success',
          error: 'toast-error',
          info: 'toast-info',
        };

        const iconName = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-triangle' : 'info';

        toast.className = \`toast \${typeClasses[type] || 'toast-info'}\`;
        toast.innerHTML = \`
          <span data-lucide="\${iconName}" class="icon-md" style="flex-shrink: 0; margin-top: 2px;"></span>
          <div style="flex: 1; line-height: 1.4;">\${msg}</div>
        \`;

        container.appendChild(toast);
        renderIcons(toast);

        setTimeout(() => {
          toast.style.opacity = '0';
          toast.style.transform = 'translateY(-10px)';
          setTimeout(() => toast.remove(), 250);
        }, 4000);
      } catch (e) {
        console.error('[ADMIN] Erro ao exibir toast:', e);
      }
    }

    // API REQUESTS
    async function apiFetch(endpoint, options = {}) {
      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      };

      if (STATE.token) {
        headers['Authorization'] = \`Bearer \${STATE.token}\`;
      }

      try {
        const res = await fetch(endpoint, { ...options, headers });

        if (res.status === 401) {
          handleLogout();
          showToast('Sessão expirada. Faça login novamente.', 'error');
          throw new Error('Sessão expirada');
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ message: 'Erro na requisição' }));
          throw new Error(errData.message || \`Erro HTTP \${res.status}\`);
        }

        return await res.json();
      } catch (err) {
        console.error('API Error:', err);
        throw err;
      }
    }

    // NAVIGATION
    function navigate(viewName) {
      STATE.currentView = viewName;
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

      const activeNav = document.getElementById(\`nav-\${viewName}\`);
      if (activeNav) activeNav.classList.add('active');

      const vDashboard = document.getElementById('view-dashboard');
      const vUsers = document.getElementById('view-users');
      const vVehicles = document.getElementById('view-vehicles');

      if (vDashboard) vDashboard.classList.add('hidden');
      if (vUsers) vUsers.classList.add('hidden');
      if (vVehicles) vVehicles.classList.add('hidden');

      const target = document.getElementById(\`view-\${viewName}\`);
      if (target) target.classList.remove('hidden');

      const titles = {
        dashboard: 'Dashboard e Indicadores',
        users: 'Gestão de Usuários e Motoristas',
        vehicles: 'Gestão da Frota de Veículos',
      };
      const pTitle = document.getElementById('page-title');
      if (pTitle) pTitle.innerText = titles[viewName] || 'Painel';

      refreshCurrentView();
    }

    async function refreshCurrentView() {
      try {
        if (STATE.currentView === 'dashboard') {
          await loadDashboard();
        } else if (STATE.currentView === 'users') {
          await loadUsers();
        } else if (STATE.currentView === 'vehicles') {
          await loadVehicles();
        }
      } catch (e) {
        console.error('[ADMIN] Erro ao recarregar view:', e);
      }
    }

    // AUTH & LOGIN
    async function handleLogin(e) {
      if (e) e.preventDefault();
      
      const now = new Date().toLocaleTimeString('pt-BR');
      updateDiag('diag-submit', now, 'var(--text-primary)');
      console.log('[ADMIN] submit disparado');

      const submitBtn = document.getElementById('login-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span><span>Autenticando...</span>';
      }

      const username = (document.getElementById('login-username')?.value || '').trim();
      const password = (document.getElementById('login-password')?.value || '').trim();

      if (!username || !password) {
        showToast('Informe o CPF/Telefone e a senha.', 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Entrar no Painel</span><span data-lucide="arrow-right" class="icon-sm"></span>';
          renderIcons(submitBtn);
        }
        return;
      }

      console.log('[ADMIN] enviando POST /api/v1/auth/login');
      updateDiag('diag-fetch', 'SIM', 'var(--emerald-base)');

      try {
        const res = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone_or_cpf: username,
            password: password,
          }),
        });

        updateDiag('diag-http', String(res.status), res.ok ? 'var(--emerald-base)' : 'var(--rose-base)');

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const errMsg = Array.isArray(data.message)
            ? data.message.join(', ')
            : (data.message || \`Erro na autenticação (HTTP \${res.status})\`);
          showToast(errMsg, 'error');
          return;
        }

        if (data.access_token && data.user) {
          if (data.user.role !== 'ADMIN' && data.user.role !== 'MANAGER') {
            showToast('Acesso negado: Apenas administradores e gerentes podem acessar este painel.', 'error');
            return;
          }

          STATE.token = data.access_token;
          STATE.refreshToken = data.refresh_token;
          STATE.user = data.user;

          try {
            localStorage.setItem('hk_access_token', data.access_token);
            localStorage.setItem('hk_refresh_token', data.refresh_token);
            localStorage.setItem('hk_user', JSON.stringify(data.user));
          } catch (storageErr) {
            console.warn('[ADMIN] Falha ao persistir no localStorage:', storageErr);
          }

          showApp();
          showToast(\`Bem-vindo(a), \${data.user.name}!\`, 'success');
        } else {
          showToast(data.message || 'Credenciais inválidas ou resposta inesperada da API.', 'error');
        }
      } catch (err) {
        console.error('[ADMIN] Erro no login:', err);
        updateDiag('diag-http', 'Erro de Rede', 'var(--rose-base)');
        updateDiag('diag-error', (err.message || 'Falha de conexão').substring(0, 80), 'var(--rose-base)');
        showToast(err.message || 'Falha na comunicação com o servidor HK Central.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Entrar no Painel</span><span data-lucide="arrow-right" class="icon-sm"></span>';
          renderIcons(submitBtn);
        }
      }
    }

    window.handleLogin = handleLogin;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.navigate = navigate;
    window.handleLogout = handleLogout;
    window.openCreateUserModal = openCreateUserModal;
    window.openCreateUserForErpDriver = openCreateUserForErpDriver;
    window.openEditUserModal = openEditUserModal;
    window.openResetPasswordModal = openResetPasswordModal;
    window.openCreateVehicleModal = openCreateVehicleModal;
    window.openEditVehicleModal = openEditVehicleModal;

    function showApp() {
      const authScreen = document.getElementById('auth-screen');
      const appLayout = document.getElementById('app-layout');

      if (authScreen) authScreen.classList.add('hidden');
      if (appLayout) appLayout.classList.remove('hidden');

      if (STATE.user) {
        const uName = document.getElementById('user-display-name');
        const uRole = document.getElementById('user-display-role');
        const uAvatar = document.getElementById('user-avatar');

        if (uName) uName.innerText = STATE.user.name;
        if (uRole) uRole.innerText = STATE.user.role;
        if (uAvatar) {
          const initials = STATE.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
          uAvatar.innerText = initials || 'AD';
        }
      }

      navigate('dashboard');
    }

    function handleLogout() {
      if (STATE.token) {
        fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': \`Bearer \${STATE.token}\` }
        }).catch(() => {});
      }

      try {
        localStorage.removeItem('hk_access_token');
        localStorage.removeItem('hk_refresh_token');
        localStorage.removeItem('hk_user');
      } catch (e) {}

      STATE.token = null;
      STATE.user = null;

      const appLayout = document.getElementById('app-layout');
      const authScreen = document.getElementById('auth-screen');
      if (appLayout) appLayout.classList.add('hidden');
      if (authScreen) authScreen.classList.remove('hidden');
    }

    // DASHBOARD
    async function loadDashboard() {
      try {
        const stats = await apiFetch('/api/v1/admin/dashboard');
        STATE.stats = stats;

        const elTotalUsers = document.getElementById('stat-total-users');
        const elActiveUsers = document.getElementById('stat-active-users');
        const elInactiveUsers = document.getElementById('stat-inactive-users');
        const elTotalDrivers = document.getElementById('stat-total-drivers');
        const elErpDrivers = document.getElementById('stat-erp-drivers');
        const elTotalVehicles = document.getElementById('stat-total-vehicles');

        if (elTotalUsers) elTotalUsers.innerText = stats.totalUsers ?? 0;
        if (elActiveUsers) elActiveUsers.innerText = stats.activeUsers ?? 0;
        if (elInactiveUsers) elInactiveUsers.innerText = stats.inactiveUsers ?? 0;
        if (elTotalDrivers) elTotalDrivers.innerText = stats.totalDrivers ?? 0;
        if (elErpDrivers) elErpDrivers.innerText = stats.erpOnlyDrivers ?? 0;
        if (elTotalVehicles) elTotalVehicles.innerText = stats.totalVehicles ?? 0;

        const unlinked = await apiFetch('/api/v1/admin/drivers/unlinked');
        STATE.unlinkedDrivers = unlinked;
        const unlinkedContainer = document.getElementById('unlinked-drivers-list');
        const erpBadge = document.getElementById('erp-badge');
        if (erpBadge) erpBadge.innerText = \`\${unlinked.length} pendentes\`;

        if (unlinkedContainer) {
          if (!unlinked.length) {
            unlinkedContainer.innerHTML = '<p class="text-xs" style="color: var(--text-muted); font-style: italic;">Nenhum motorista pendente de vínculo.</p>';
          } else {
            unlinkedContainer.innerHTML = unlinked.map(d => \`
              <div style="padding: 0.65rem 0.85rem; border-radius: 0.75rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <span class="text-xs font-semibold block">CNH: \${d.cnh || 'Não inf.'} (Cat \${d.cnhCategory || '-'})</span>
                  <span class="text-xs" style="color: var(--purple-base); font-size: 11px;">RNTRC: \${d.rntrc || '-'}</span>
                </div>
                <button onclick="openCreateUserForErpDriver('\${d.id}', '\${d.cnh || ''}', '\${d.cnhCategory || ''}', '\${d.rntrc || ''}')" class="btn btn-sm btn-secondary" style="color: var(--purple-base); border-color: var(--purple-border);">
                  Vincular Login
                </button>
              </div>
            \`).join('');
          }
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      }
    }

    // USERS
    async function loadUsers() {
      const search = document.getElementById('user-search-input')?.value || '';
      const role = document.getElementById('user-role-filter')?.value || '';
      const status = document.getElementById('user-status-filter')?.value || '';

      const queryParams = new URLSearchParams();
      if (search) queryParams.set('search', search);
      if (role) queryParams.set('role', role);
      if (status) queryParams.set('status', status);

      try {
        const users = await apiFetch(\`/api/v1/admin/users?\${queryParams.toString()}\`);
        STATE.users = users;
        renderUsersTable(users);
      } catch (err) {
        const tbody = document.getElementById('users-table-body');
        if (tbody) {
          tbody.innerHTML = \`
            <tr><td colspan="6" class="text-center" style="padding: 1.5rem; color: var(--rose-base);">Erro ao carregar usuários: \${err.message}</td></tr>
          \`;
        }
      }
    }

    function renderUsersTable(users) {
      const tbody = document.getElementById('users-table-body');
      if (!tbody) return;

      if (!users.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 2rem; color: var(--text-muted);">Nenhum usuário encontrado.</td></tr>';
        return;
      }

      tbody.innerHTML = users.map(user => {
        const roleBadges = {
          ADMIN: 'badge-danger',
          MANAGER: 'badge-warning',
          DRIVER: 'badge-brand',
          OPERATOR: 'badge-muted',
        };

        const statusBadges = {
          ACTIVE: 'badge-success',
          INACTIVE: 'badge-muted',
          BLOCKED: 'badge-danger',
        };

        const driverInfo = user.driver ? \`
          <div>
            <span class="text-xs font-semibold block">CNH: \${user.driver.cnh || '-'} (Cat \${user.driver.cnhCategory || '-'})</span>
            <span class="text-xs" style="color: var(--text-secondary); font-size: 11px;">Veículo: \${user.driver.assignments?.[0]?.vehicle?.plate || 'Sem veículo'}</span>
          </div>
        \` : '<span class="text-xs" style="color: var(--text-muted);">-</span>';

        return \`
          <tr>
            <td>
              <div class="font-semibold text-sm">\${user.name}</div>
              <div class="text-xs" style="color: var(--text-muted);">ID: \${user.id.substring(0, 8)}...</div>
            </td>
            <td>
              <div class="text-xs font-mono">\${formatCPF(user.cpf)}</div>
              <div class="text-xs" style="color: var(--text-secondary);">\${formatPhone(user.phone)}</div>
            </td>
            <td>
              <span class="badge \${roleBadges[user.role] || 'badge-muted'}">\${user.role}</span>
            </td>
            <td>
              <span class="badge \${statusBadges[user.status] || 'badge-muted'}">\${user.status}</span>
            </td>
            <td>\${driverInfo}</td>
            <td class="text-right">
              <div class="flex items-center justify-end gap-1">
                <button onclick="openEditUserModal('\${user.id}')" title="Editar" class="btn btn-secondary btn-icon">
                  <span data-lucide="edit-2" class="icon-xs"></span>
                </button>
                <button onclick="toggleUserStatus('\${user.id}', '\${user.status}')" title="\${user.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}" class="btn \${user.status === 'ACTIVE' ? 'btn-ghost-warning' : 'btn-ghost-success'} btn-icon">
                  <span data-lucide="\${user.status === 'ACTIVE' ? 'pause-circle' : 'play-circle'}" class="icon-xs"></span>
                </button>
                <button onclick="openResetPasswordModal('\${user.id}', '\${user.name}')" title="Redefinir Senha" class="btn btn-secondary btn-icon" style="color: var(--amber-base);">
                  <span data-lucide="key" class="icon-xs"></span>
                </button>
                <button onclick="deleteUserSafely('\${user.id}', '\${user.name}')" title="Excluir / Desativar" class="btn btn-ghost-danger btn-icon">
                  <span data-lucide="trash-2" class="icon-xs"></span>
                </button>
              </div>
            </td>
          </tr>
        \`;
      }).join('');
      renderIcons(tbody);
    }

    // VEHICLES
    async function loadVehicles() {
      const search = document.getElementById('vehicle-search-input')?.value || '';
      const status = document.getElementById('vehicle-status-filter')?.value || '';

      const queryParams = new URLSearchParams();
      if (search) queryParams.set('search', search);
      if (status) queryParams.set('status', status);

      try {
        const vehicles = await apiFetch(\`/api/v1/admin/vehicles?\${queryParams.toString()}\`);
        STATE.vehicles = vehicles;
        renderVehiclesTable(vehicles);
      } catch (err) {
        const tbody = document.getElementById('vehicles-table-body');
        if (tbody) {
          tbody.innerHTML = \`
            <tr><td colspan="6" class="text-center" style="padding: 1.5rem; color: var(--rose-base);">Erro ao carregar veículos: \${err.message}</td></tr>
          \`;
        }
      }
    }

    function renderVehiclesTable(vehicles) {
      const tbody = document.getElementById('vehicles-table-body');
      if (!tbody) return;

      if (!vehicles.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 2rem; color: var(--text-muted);">Nenhum veículo cadastrado.</td></tr>';
        return;
      }

      tbody.innerHTML = vehicles.map(v => {
        const driverName = v.assignments?.[0]?.driver?.user?.name || (v.assignments?.[0]?.driver ? 'Motorista sem nome' : 'Nenhum');
        return \`
          <tr>
            <td class="font-mono font-bold text-sm" style="letter-spacing: 0.05em;">\${v.plate}</td>
            <td class="text-sm">\${v.brand} \${v.model}</td>
            <td class="text-xs" style="color: var(--text-secondary);">\${v.year || '-'}</td>
            <td>
              <span class="badge badge-cyan">\${v.status}</span>
            </td>
            <td class="text-xs" style="color: var(--text-secondary);">\${driverName}</td>
            <td class="text-right">
              <button onclick="openEditVehicleModal('\${v.id}')" title="Editar" class="btn btn-secondary btn-icon">
                <span data-lucide="edit-2" class="icon-xs"></span>
              </button>
            </td>
          </tr>
        \`;
      }).join('');
      renderIcons(tbody);
    }

    // MODAL HELPERS
    function openModal(id) {
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.remove('hidden');
        renderIcons(modal);
      }
    }

    function closeModal(id) {
      const modal = document.getElementById(id);
      if (modal) modal.classList.add('hidden');
    }

    async function populateVehiclesDropdown(selectedVehicleId = '') {
      try {
        const vehicles = await apiFetch('/api/v1/admin/vehicles');
        const select = document.getElementById('user-form-vehicle');
        if (select) {
          select.innerHTML = '<option value="">Nenhum veículo vinculado (alocar depois)</option>' +
            vehicles.map(v => \`
              <option value="\${v.id}" \${v.id === selectedVehicleId ? 'selected' : ''}>
                \${v.plate} — \${v.brand} \${v.model} (\${v.status})
              </option>
            \`).join('');
        }
      } catch (err) {
        console.error('Failed to load vehicles dropdown:', err);
      }
    }

    function handleRoleChange() {
      const roleEl = document.getElementById('user-form-role');
      const driverSection = document.getElementById('driver-fields-section');
      if (!roleEl || !driverSection) return;

      if (roleEl.value === 'DRIVER') {
        driverSection.classList.remove('hidden');
      } else {
        driverSection.classList.add('hidden');
      }
    }

    async function openCreateUserModal(defaultRole = 'DRIVER') {
      const title = document.getElementById('modal-user-title');
      const form = document.getElementById('form-user');
      const idInput = document.getElementById('user-form-id');
      const cpfInput = document.getElementById('user-form-cpf');
      const pwdContainer = document.getElementById('user-form-pwd-container');
      const pwdInput = document.getElementById('user-form-password');
      const roleInput = document.getElementById('user-form-role');
      const erpAlert = document.getElementById('erp-detection-alert');

      if (title) title.innerText = 'Novo Usuário';
      if (form) form.reset();
      if (idInput) idInput.value = '';
      if (cpfInput) cpfInput.disabled = false;
      if (pwdContainer) pwdContainer.classList.remove('hidden');
      if (pwdInput) pwdInput.required = true;
      if (roleInput) roleInput.value = defaultRole;
      if (erpAlert) erpAlert.classList.add('hidden');

      handleRoleChange();
      await populateVehiclesDropdown();
      openModal('modal-user');
    }

    async function openCreateUserForErpDriver(driverId, cnh, cnhCat, rntrc) {
      await openCreateUserModal('DRIVER');
      const cnhEl = document.getElementById('user-form-cnh');
      const catEl = document.getElementById('user-form-cnh-cat');
      const rntrcEl = document.getElementById('user-form-rntrc');
      const alertEl = document.getElementById('erp-detection-alert');

      if (cnhEl) cnhEl.value = cnh;
      if (catEl) catEl.value = cnhCat;
      if (rntrcEl) rntrcEl.value = rntrc;
      if (alertEl) alertEl.classList.remove('hidden');
    }

    async function openEditUserModal(userId) {
      try {
        const user = await apiFetch(\`/api/v1/admin/users/\${userId}\`);
        const title = document.getElementById('modal-user-title');
        const idInput = document.getElementById('user-form-id');
        const nameInput = document.getElementById('user-form-name');
        const cpfInput = document.getElementById('user-form-cpf');
        const phoneInput = document.getElementById('user-form-phone');
        const roleInput = document.getElementById('user-form-role');
        const statusInput = document.getElementById('user-form-status');
        const pwdContainer = document.getElementById('user-form-pwd-container');
        const pwdInput = document.getElementById('user-form-password');

        if (title) title.innerText = 'Editar Usuário';
        if (idInput) idInput.value = user.id;
        if (nameInput) nameInput.value = user.name;
        if (cpfInput) {
          cpfInput.value = user.cpf;
          cpfInput.disabled = true;
        }
        if (phoneInput) phoneInput.value = user.phone || '';
        if (roleInput) roleInput.value = user.role;
        if (statusInput) statusInput.value = user.status;

        if (pwdContainer) pwdContainer.classList.add('hidden');
        if (pwdInput) pwdInput.required = false;

        const currentVehicleId = user.driver?.assignments?.[0]?.vehicle?.id || '';
        await populateVehiclesDropdown(currentVehicleId);

        if (user.driver) {
          const cnhEl = document.getElementById('user-form-cnh');
          const catEl = document.getElementById('user-form-cnh-cat');
          const rntrcEl = document.getElementById('user-form-rntrc');
          if (cnhEl) cnhEl.value = user.driver.cnh || '';
          if (catEl) catEl.value = user.driver.cnhCategory || '';
          if (rntrcEl) rntrcEl.value = user.driver.rntrc || '';
        }

        handleRoleChange();
        openModal('modal-user');
      } catch (err) {
        showToast(\`Erro ao abrir usuário: \${err.message}\`, 'error');
      }
    }

    // FORM USER SUBMIT
    async function handleUserSubmit(e) {
      e.preventDefault();
      const id = document.getElementById('user-form-id')?.value;
      const isEdit = Boolean(id);

      const payload = {
        name: document.getElementById('user-form-name')?.value.trim(),
        phone: document.getElementById('user-form-phone')?.value.trim() || undefined,
        role: document.getElementById('user-form-role')?.value,
        status: document.getElementById('user-form-status')?.value,
      };

      if (!isEdit) {
        payload.cpf = document.getElementById('user-form-cpf')?.value.trim();
        payload.password = document.getElementById('user-form-password')?.value;
      }

      if (payload.role === 'DRIVER') {
        payload.cnh = document.getElementById('user-form-cnh')?.value.trim() || undefined;
        payload.cnhCategory = document.getElementById('user-form-cnh-cat')?.value || undefined;
        payload.rntrc = document.getElementById('user-form-rntrc')?.value.trim() || undefined;
        payload.vehicleId = document.getElementById('user-form-vehicle')?.value || undefined;
      }

      try {
        if (isEdit) {
          await apiFetch(\`/api/v1/admin/users/\${id}\`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          });
          showToast('Usuário atualizado com sucesso!', 'success');
        } else {
          await apiFetch('/api/v1/admin/users', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          showToast('Novo usuário criado com sucesso!', 'success');
        }
        closeModal('modal-user');
        refreshCurrentView();
      } catch (err) {
        showToast(err.message || 'Erro ao salvar usuário', 'error');
      }
    }

    // USER STATUS TOGGLE
    async function toggleUserStatus(id, currentStatus) {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const actionLabel = newStatus === 'ACTIVE' ? 'ativar' : 'desativar';

      if (!confirm(\`Deseja realmente \${actionLabel} este usuário?\`)) return;

      try {
        await apiFetch(\`/api/v1/admin/users/\${id}/status\`, {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus }),
        });
        showToast(\`Usuário \${newStatus === 'ACTIVE' ? 'ativado' : 'desativado'} com sucesso!\`, 'success');
        refreshCurrentView();
      } catch (err) {
        showToast(\`Falha ao alterar status: \${err.message}\`, 'error');
      }
    }

    // RESET PASSWORD
    function openResetPasswordModal(id, name) {
      const idEl = document.getElementById('reset-pwd-user-id');
      const nameEl = document.getElementById('reset-pwd-username');
      const formEl = document.getElementById('form-reset-pwd');

      if (idEl) idEl.value = id;
      if (nameEl) nameEl.innerText = name;
      if (formEl) formEl.reset();
      openModal('modal-reset-pwd');
    }

    async function handleResetPasswordSubmit(e) {
      e.preventDefault();
      const id = document.getElementById('reset-pwd-user-id')?.value;
      const pwd = document.getElementById('reset-new-password')?.value;
      const confirmPwd = document.getElementById('reset-confirm-password')?.value;

      if (pwd !== confirmPwd) {
        showToast('As senhas digitadas não coincidem.', 'error');
        return;
      }

      try {
        await apiFetch(\`/api/v1/admin/users/\${id}/reset-password\`, {
          method: 'POST',
          body: JSON.stringify({ password: pwd }),
        });
        showToast('Senha redefinida com sucesso! Sessões desconectadas.', 'success');
        closeModal('modal-reset-pwd');
      } catch (err) {
        showToast(\`Erro ao redefinir senha: \${err.message}\`, 'error');
      }
    }

    // DELETE USER SAFELY
    async function deleteUserSafely(id, name) {
      if (!confirm(\`ATENÇÃO: Deseja realmente excluir ou desativar o usuário "\${name}"?\\n\\nSe houver viagens ou fechamentos registrados, a conta será inativada com segurança para preservar o histórico.\`)) {
        return;
      }

      try {
        const res = await apiFetch(\`/api/v1/admin/users/\${id}\`, {
          method: 'DELETE',
        });
        showToast(res.message || 'Operação realizada com sucesso!', 'success');
        refreshCurrentView();
      } catch (err) {
        showToast(\`Erro ao excluir usuário: \${err.message}\`, 'error');
      }
    }

    // VEHICLES MODAL & ACTIONS
    function openCreateVehicleModal() {
      const title = document.getElementById('modal-vehicle-title');
      const form = document.getElementById('form-vehicle');
      const idInput = document.getElementById('vehicle-form-id');

      if (title) title.innerText = 'Novo Veículo';
      if (form) form.reset();
      if (idInput) idInput.value = '';
      openModal('modal-vehicle');
    }

    async function openEditVehicleModal(vehicleId) {
      try {
        const v = await apiFetch(\`/api/v1/admin/vehicles/\${vehicleId}\`);
        const title = document.getElementById('modal-vehicle-title');
        const idInput = document.getElementById('vehicle-form-id');
        const plateInput = document.getElementById('vehicle-form-plate');
        const modelInput = document.getElementById('vehicle-form-model');
        const brandInput = document.getElementById('vehicle-form-brand');
        const yearInput = document.getElementById('vehicle-form-year');
        const statusInput = document.getElementById('vehicle-form-status');

        if (title) title.innerText = 'Editar Veículo';
        if (idInput) idInput.value = v.id;
        if (plateInput) plateInput.value = v.plate;
        if (modelInput) modelInput.value = v.model;
        if (brandInput) brandInput.value = v.brand;
        if (yearInput) yearInput.value = v.year || '';
        if (statusInput) statusInput.value = v.status;
        openModal('modal-vehicle');
      } catch (err) {
        showToast(\`Erro ao abrir veículo: \${err.message}\`, 'error');
      }
    }

    async function handleVehicleSubmit(e) {
      e.preventDefault();
      const id = document.getElementById('vehicle-form-id')?.value;
      const isEdit = Boolean(id);

      const payload = {
        plate: document.getElementById('vehicle-form-plate')?.value.trim().toUpperCase(),
        model: document.getElementById('vehicle-form-model')?.value.trim(),
        brand: document.getElementById('vehicle-form-brand')?.value.trim(),
        year: document.getElementById('vehicle-form-year')?.value ? parseInt(document.getElementById('vehicle-form-year').value) : undefined,
        status: document.getElementById('vehicle-form-status')?.value,
      };

      try {
        if (isEdit) {
          await apiFetch(\`/api/v1/admin/vehicles/\${id}\`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          });
          showToast('Veículo atualizado com sucesso!', 'success');
        } else {
          await apiFetch('/api/v1/admin/vehicles', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          showToast('Veículo cadastrado com sucesso!', 'success');
        }
        closeModal('modal-vehicle');
        refreshCurrentView();
      } catch (err) {
        showToast(err.message || 'Erro ao salvar veículo', 'error');
      }
    }

    // 1. ISOLATED LOGIN INITIALIZATION
    function initLogin() {
      const loginForm = document.getElementById('login-form');
      const togglePwdBtn = document.getElementById('toggle-pwd-btn');

      if (!loginForm) {
        console.error('[ADMIN] login-form não encontrado');
        updateDiag('diag-form', 'NÃO', 'var(--rose-base)');
        updateDiag('diag-listener', 'NÃO', 'var(--rose-base)');
        return;
      }

      console.log('[ADMIN] login-form encontrado');
      updateDiag('diag-form', 'SIM', 'var(--emerald-base)');

      loginForm.addEventListener('submit', handleLogin);
      updateDiag('diag-listener', 'SIM', 'var(--emerald-base)');

      if (togglePwdBtn) {
        togglePwdBtn.addEventListener('click', () => {
          const input = document.getElementById('login-password');
          if (input) input.type = input.type === 'password' ? 'text' : 'password';
        });
      }
    }

    // 2. ISOLATED APP & MODAL EVENT LISTENERS
    function initAppFeatures() {
      const formUser = document.getElementById('form-user');
      if (formUser) formUser.addEventListener('submit', handleUserSubmit);

      const formResetPwd = document.getElementById('form-reset-pwd');
      if (formResetPwd) formResetPwd.addEventListener('submit', handleResetPasswordSubmit);

      const formVehicle = document.getElementById('form-vehicle');
      if (formVehicle) formVehicle.addEventListener('submit', handleVehicleSubmit);

      const userCpfInput = document.getElementById('user-form-cpf');
      if (userCpfInput) {
        userCpfInput.addEventListener('input', (e) => {
          let v = e.target.value.replace(/\\D/g, '');
          if (v.length > 11) v = v.substring(0, 11);
          if (v.length > 9) v = v.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{1,2})/, '$1.$2.$3-$4');
          else if (v.length > 6) v = v.replace(/(\\d{3})(\\d{3})(\\d{1,3})/, '$1.$2.$3');
          else if (v.length > 3) v = v.replace(/(\\d{3})(\\d{1,3})/, '$1.$2');
          e.target.value = v;
        });
      }

      ['user-search-input', 'user-role-filter', 'user-status-filter'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('input', () => {
            clearTimeout(window._userSearchTimeout);
            window._userSearchTimeout = setTimeout(loadUsers, 250);
          });
        }
      });

      ['vehicle-search-input', 'vehicle-status-filter'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('input', () => {
            clearTimeout(window._vehicleSearchTimeout);
            window._vehicleSearchTimeout = setTimeout(loadVehicles, 250);
          });
        }
      });

      renderIcons(document);
    }

    // 3. ISOLATED SESSION RESTORATION
    function initSession() {
      if (STATE.token && STATE.user) {
        showApp();
      }
    }

    // MASTER BOOTSTRAP INITIALIZATION
    function initAdminPanel() {
      console.log('[ADMIN] script carregado');
      updateDiag('diag-dom', 'SIM', 'var(--emerald-base)');

      // O LOGIN É INICIALIZADO PRIMEIRO E ISOLADO
      try {
        initLogin();
      } catch (loginErr) {
        console.error('[ADMIN] Erro ao inicializar login:', loginErr);
        updateDiag('diag-error', 'Erro initLogin: ' + loginErr.message, 'var(--rose-base)');
      }

      // INICIALIZAÇÃO DE RECURSOS DO PAINEL
      try {
        initAppFeatures();
      } catch (appErr) {
        console.error('[ADMIN] Erro ao inicializar recursos:', appErr);
      }

      // RESTAURAÇÃO DE SESSÃO
      try {
        initSession();
      } catch (sessionErr) {
        console.error('[ADMIN] Erro ao restaurar sessão:', sessionErr);
      }
    }

    // BOOTSTRAP EXECUTION
    try {
      updateDiag('diag-js', 'SIM', 'var(--emerald-base)');
    } catch (e) {}

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAdminPanel);
    } else {
      initAdminPanel();
    }
  </script>
</body>
</html>`;

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src-attr 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https: wss: ws:; font-src 'self' data: https:;",
    );
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
