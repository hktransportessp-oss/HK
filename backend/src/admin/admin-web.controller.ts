import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Response } from 'express';

@Controller('admin')
export class AdminWebController {
  @Get(['', '/', 'dashboard', 'users', 'vehicles'])
  @ApiExcludeEndpoint()
  serveAdminApp(@Res() res: Response) {
    const html = `<!DOCTYPE html>
<html lang="pt-BR" class="h-full bg-slate-950 text-slate-100">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HK Connect — Painel Administrativo</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
          },
          colors: {
            brand: {
              50: '#eff6ff',
              100: '#dbeafe',
              500: '#3b82f6',
              600: '#2563eb',
              700: '#1d4ed8',
              800: '#1e40af',
              900: '#1e3a8a',
              950: '#0f172a',
            },
            accent: {
              500: '#f59e0b',
              600: '#d97706',
            }
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .glass-card { background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(12px); border: 1px solid rgba(51, 65, 85, 0.5); }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
  </style>
</head>
<body class="h-full flex flex-col antialiased selection:bg-brand-500 selection:text-white">

  <!-- NOTIFICATION TOAST CONTAINER -->
  <div id="toast-container" class="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm pointer-events-none"></div>

  <!-- AUTH SCREEN (LOGIN) -->
  <div id="auth-screen" class="min-h-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <div class="w-full max-w-md glass-card rounded-2xl p-8 shadow-2xl border border-slate-800 relative overflow-hidden">
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-brand-600/20 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl"></div>

      <div class="text-center mb-8 relative">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-lg shadow-brand-500/30 mb-4">
          <i data-lucide="truck" class="w-8 h-8"></i>
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-white">HK CONNECT</h1>
        <p class="text-sm text-slate-400 mt-1">Painel de Gestão e Operações</p>
        <span class="inline-block px-2.5 py-0.5 mt-2 text-xs font-semibold uppercase tracking-wider rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
          Acesso Restrito: ADMIN & MANAGER
        </span>
      </div>

      <form id="login-form" class="space-y-5 relative">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">CPF ou Telefone</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <i data-lucide="user" class="w-4 h-4"></i>
            </div>
            <input type="text" id="login-username" required placeholder="000.000.000-00" 
              class="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition">
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Senha</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <i data-lucide="lock" class="w-4 h-4"></i>
            </div>
            <input type="password" id="login-password" required placeholder="••••••••" 
              class="w-full pl-10 pr-10 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition">
            <button type="button" id="toggle-pwd-btn" class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300">
              <i data-lucide="eye" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <button type="submit" id="login-submit-btn" class="w-full py-3.5 px-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/25 transition duration-150 flex items-center justify-center gap-2">
          <span>Entrar no Painel</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </button>
      </form>
    </div>
  </div>

  <!-- MAIN APPLICATION LAYOUT -->
  <div id="app-layout" class="hidden min-h-full flex flex-col md:flex-row bg-slate-950">
    
    <!-- SIDEBAR -->
    <aside class="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      <!-- Brand Header -->
      <div class="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md">
            <i data-lucide="truck" class="w-5 h-5"></i>
          </div>
          <div>
            <span class="font-bold text-white tracking-tight">HK CONNECT</span>
            <span class="block text-[10px] text-brand-400 font-semibold tracking-wider uppercase">Painel Admin</span>
          </div>
        </div>
      </div>

      <!-- User Info Badge -->
      <div class="p-4 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold text-sm" id="user-avatar">
          AD
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-white truncate" id="user-display-name">Administrador</p>
          <p class="text-xs text-brand-400 font-medium" id="user-display-role">ADMIN</p>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-3 space-y-1.5 py-2">
        <button onclick="navigate('dashboard')" id="nav-dashboard" class="nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition text-slate-300 hover:bg-slate-800 hover:text-white">
          <i data-lucide="layout-dashboard" class="w-4 h-4 text-slate-400"></i>
          <span>Dashboard</span>
        </button>

        <button onclick="navigate('users')" id="nav-users" class="nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition text-slate-300 hover:bg-slate-800 hover:text-white">
          <i data-lucide="users" class="w-4 h-4 text-slate-400"></i>
          <span>Usuários e Motoristas</span>
        </button>

        <button onclick="navigate('vehicles')" id="nav-vehicles" class="nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition text-slate-300 hover:bg-slate-800 hover:text-white">
          <i data-lucide="truck" class="w-4 h-4 text-slate-400"></i>
          <span>Frota de Veículos</span>
        </button>
      </nav>

      <!-- Logout Footer -->
      <div class="p-3 border-t border-slate-800">
        <button onclick="handleLogout()" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition">
          <i data-lucide="log-out" class="w-4 h-4"></i>
          <span>Sair da Conta</span>
        </button>
      </div>
    </aside>

    <!-- MAIN CONTENT AREA -->
    <main class="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
      
      <!-- TOPBAR -->
      <header class="h-16 px-6 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
        <div class="flex items-center gap-3">
          <h2 id="page-title" class="text-lg font-bold text-white">Dashboard</h2>
        </div>
        <div class="flex items-center gap-3">
          <button onclick="refreshCurrentView()" title="Recarregar Dados" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 text-xs font-medium">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
            <span class="hidden sm:inline">Atualizar</span>
          </button>
          <span id="api-status-badge" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            API Conectada
          </span>
        </div>
      </header>

      <!-- VIEW: DASHBOARD -->
      <section id="view-dashboard" class="p-6 space-y-6">
        <!-- Stats Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          
          <div class="glass-card p-5 rounded-2xl border border-slate-800">
            <div class="flex items-center justify-between text-slate-400 mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider">Total Usuários</span>
              <div class="p-2 rounded-xl bg-brand-500/10 text-brand-400"><i data-lucide="users" class="w-4 h-4"></i></div>
            </div>
            <p id="stat-total-users" class="text-2xl font-bold text-white">-</p>
            <span class="text-xs text-slate-400 mt-1 block">Cadastrados no HK Central</span>
          </div>

          <div class="glass-card p-5 rounded-2xl border border-slate-800">
            <div class="flex items-center justify-between text-slate-400 mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider">Usuários Ativos</span>
              <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><i data-lucide="check-circle" class="w-4 h-4"></i></div>
            </div>
            <p id="stat-active-users" class="text-2xl font-bold text-emerald-400">-</p>
            <span class="text-xs text-slate-400 mt-1 block">Acesso liberado</span>
          </div>

          <div class="glass-card p-5 rounded-2xl border border-slate-800">
            <div class="flex items-center justify-between text-slate-400 mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider">Inativos / Bloq.</span>
              <div class="p-2 rounded-xl bg-rose-500/10 text-rose-400"><i data-lucide="shield-alert" class="w-4 h-4"></i></div>
            </div>
            <p id="stat-inactive-users" class="text-2xl font-bold text-rose-400">-</p>
            <span class="text-xs text-slate-400 mt-1 block">Acesso negado</span>
          </div>

          <div class="glass-card p-5 rounded-2xl border border-slate-800">
            <div class="flex items-center justify-between text-slate-400 mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider">Motoristas</span>
              <div class="p-2 rounded-xl bg-amber-500/10 text-amber-400"><i data-lucide="user-check" class="w-4 h-4"></i></div>
            </div>
            <p id="stat-total-drivers" class="text-2xl font-bold text-amber-400">-</p>
            <span class="text-xs text-slate-400 mt-1 block">Perfis operacionais</span>
          </div>

          <div class="glass-card p-5 rounded-2xl border border-slate-800">
            <div class="flex items-center justify-between text-slate-400 mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider">ERP_ONLY</span>
              <div class="p-2 rounded-xl bg-purple-500/10 text-purple-400"><i data-lucide="link-2-off" class="w-4 h-4"></i></div>
            </div>
            <p id="stat-erp-drivers" class="text-2xl font-bold text-purple-400">-</p>
            <span class="text-xs text-slate-400 mt-1 block">Aguardando login</span>
          </div>

          <div class="glass-card p-5 rounded-2xl border border-slate-800">
            <div class="flex items-center justify-between text-slate-400 mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider">Veículos</span>
              <div class="p-2 rounded-xl bg-cyan-500/10 text-cyan-400"><i data-lucide="truck" class="w-4 h-4"></i></div>
            </div>
            <p id="stat-total-vehicles" class="text-2xl font-bold text-cyan-400">-</p>
            <span class="text-xs text-slate-400 mt-1 block">Frota registrada</span>
          </div>
        </div>

        <!-- Quick Action & Unlinked Drivers Alert -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="glass-card p-6 rounded-2xl border border-slate-800 lg:col-span-2 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-bold text-white">Atalhos Operacionais</h3>
                <p class="text-xs text-slate-400 mt-0.5">Gerencie os cadastros rápidos para liberação de acesso ao app</p>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button onclick="openCreateUserModal('DRIVER')" class="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-left transition flex items-start gap-3">
                <div class="p-2.5 rounded-xl bg-brand-500/20 text-brand-400 mt-0.5">
                  <i data-lucide="user-plus" class="w-5 h-5"></i>
                </div>
                <div>
                  <span class="font-semibold text-white text-sm block">Criar Motorista</span>
                  <span class="text-xs text-slate-400 mt-0.5 block">Cadastre o login e vincule veículo para teste no APK</span>
                </div>
              </button>

              <button onclick="openCreateVehicleModal()" class="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-left transition flex items-start gap-3">
                <div class="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 mt-0.5">
                  <i data-lucide="plus-circle" class="w-5 h-5"></i>
                </div>
                <div>
                  <span class="font-semibold text-white text-sm block">Cadastrar Veículo</span>
                  <span class="text-xs text-slate-400 mt-0.5 block">Adicione placas e modelos à frota</span>
                </div>
              </button>
            </div>
          </div>

          <!-- ERP Pending Linking -->
          <div class="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-white">Sincronização ERP</h3>
              <span id="erp-badge" class="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300">0 pendentes</span>
            </div>
            <p class="text-xs text-slate-400">Motoristas criados pelo ERP que ainda não possuem usuário para login no APK.</p>
            <div id="unlinked-drivers-list" class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              <p class="text-xs text-slate-500 italic">Nenhum motorista pendente de vínculo.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- VIEW: USERS -->
      <section id="view-users" class="hidden p-6 space-y-6">
        <!-- Action Header & Filters -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex-1 flex flex-wrap items-center gap-3">
            <!-- Search -->
            <div class="relative min-w-[240px] flex-1 max-w-md">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <i data-lucide="search" class="w-4 h-4"></i>
              </div>
              <input type="text" id="user-search-input" placeholder="Buscar por Nome, CPF ou Telefone..." 
                class="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            </div>

            <!-- Role Filter -->
            <select id="user-role-filter" class="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Todos os Perfis</option>
              <option value="DRIVER">Motorista (DRIVER)</option>
              <option value="MANAGER">Gerente (MANAGER)</option>
              <option value="ADMIN">Administrador (ADMIN)</option>
              <option value="OPERATOR">Operador (OPERATOR)</option>
            </select>

            <!-- Status Filter -->
            <select id="user-status-filter" class="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Todos os Status</option>
              <option value="ACTIVE">Ativo (ACTIVE)</option>
              <option value="INACTIVE">Inativo (INACTIVE)</option>
              <option value="BLOCKED">Bloqueado (BLOCKED)</option>
            </select>
          </div>

          <button onclick="openCreateUserModal()" class="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-brand-500/20 transition flex items-center gap-2 shrink-0">
            <i data-lucide="user-plus" class="w-4 h-4"></i>
            <span>Novo Usuário</span>
          </button>
        </div>

        <!-- Users Table Card -->
        <div class="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left text-sm text-slate-300">
              <thead class="bg-slate-900/90 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800 tracking-wider">
                <tr>
                  <th class="px-6 py-3.5">Usuário</th>
                  <th class="px-6 py-3.5">CPF / Telefone</th>
                  <th class="px-6 py-3.5">Perfil</th>
                  <th class="px-6 py-3.5">Status</th>
                  <th class="px-6 py-3.5">Motorista / Veículo</th>
                  <th class="px-6 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody id="users-table-body" class="divide-y divide-slate-800/60">
                <tr>
                  <td colspan="6" class="px-6 py-8 text-center text-slate-500">
                    <div class="inline-flex items-center gap-2">
                      <div class="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                      Carregando usuários...
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- VIEW: VEHICLES -->
      <section id="view-vehicles" class="hidden p-6 space-y-6">
        <!-- Action Header & Filters -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex-1 flex flex-wrap items-center gap-3">
            <div class="relative min-w-[240px] flex-1 max-w-md">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <i data-lucide="search" class="w-4 h-4"></i>
              </div>
              <input type="text" id="vehicle-search-input" placeholder="Buscar por Placa, Modelo ou Marca..." 
                class="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            </div>

            <select id="vehicle-status-filter" class="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Todos os Status</option>
              <option value="DISPONIVEL">Disponível</option>
              <option value="EM_VIAGEM">Em Viagem</option>
              <option value="MANUTENCAO">Manutenção</option>
            </select>
          </div>

          <button onclick="openCreateVehicleModal()" class="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition flex items-center gap-2 shrink-0">
            <i data-lucide="plus-circle" class="w-4 h-4"></i>
            <span>Novo Veículo</span>
          </button>
        </div>

        <!-- Vehicles Table -->
        <div class="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left text-sm text-slate-300">
              <thead class="bg-slate-900/90 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800 tracking-wider">
                <tr>
                  <th class="px-6 py-3.5">Placa</th>
                  <th class="px-6 py-3.5">Modelo / Marca</th>
                  <th class="px-6 py-3.5">Ano</th>
                  <th class="px-6 py-3.5">Status</th>
                  <th class="px-6 py-3.5">Motorista Vinculado</th>
                  <th class="px-6 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody id="vehicles-table-body" class="divide-y divide-slate-800/60">
                <tr>
                  <td colspan="6" class="px-6 py-8 text-center text-slate-500">Carregando veículos...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </main>
  </div>

  <!-- MODAL: CRIAR / EDITAR USUÁRIO -->
  <div id="modal-user" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
    <div class="w-full max-w-2xl glass-card rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <h3 id="modal-user-title" class="text-base font-bold text-white">Novo Usuário</h3>
        <button onclick="closeModal('modal-user')" class="text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <form id="form-user" class="p-6 space-y-4 overflow-y-auto custom-scrollbar">
        <input type="hidden" id="user-form-id">

        <!-- DADOS BÁSICOS -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Nome Completo *</label>
            <input type="text" id="user-form-name" required placeholder="Ex: Carlos Eduardo de Souza" 
              class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none">
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-slate-300 mb-1.5">CPF *</label>
            <input type="text" id="user-form-cpf" required placeholder="000.000.000-00" maxlength="14"
              class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none">
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Telefone</label>
            <input type="text" id="user-form-phone" placeholder="(11) 99999-8888" 
              class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none">
          </div>

          <div id="user-form-pwd-container">
            <label class="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Senha Inicial *</label>
            <input type="password" id="user-form-password" placeholder="Mínimo 6 caracteres" minlength="6"
              class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none">
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Perfil de Acesso *</label>
            <select id="user-form-role" onchange="handleRoleChange()" required 
              class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none">
              <option value="DRIVER">Motorista (DRIVER)</option>
              <option value="MANAGER">Gerente (MANAGER)</option>
              <option value="ADMIN">Administrador (ADMIN)</option>
              <option value="OPERATOR">Operador (OPERATOR)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Status *</label>
            <select id="user-form-status" required 
              class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none">
              <option value="ACTIVE">Ativo (ACTIVE)</option>
              <option value="INACTIVE">Inativo (INACTIVE)</option>
              <option value="BLOCKED">Bloqueado (BLOCKED)</option>
            </select>
          </div>
        </div>

        <!-- SEÇÃO MOTORISTA (APENAS SE ROLE = DRIVER) -->
        <div id="driver-fields-section" class="pt-4 border-t border-slate-800 space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
              <i data-lucide="id-card" class="w-4 h-4"></i>
              Dados Operacionais do Motorista
            </h4>
          </div>

          <!-- DETECÇÃO DE MOTORISTA ERP -->
          <div id="erp-detection-alert" class="hidden p-3.5 rounded-xl bg-purple-950/60 border border-purple-800/80 text-purple-200 text-xs flex items-start gap-2.5">
            <i data-lucide="info" class="w-4 h-4 text-purple-400 shrink-0 mt-0.5"></i>
            <div>
              <p class="font-semibold">Motorista compatível encontrado no ERP!</p>
              <p class="mt-0.5 text-purple-300">Este cadastro será automaticamente vinculado ao registro existente para preservar o histórico contábil e de viagens.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-semibold uppercase text-slate-300 mb-1.5">CNH</label>
              <input type="text" id="user-form-cnh" placeholder="Número CNH" 
                class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none">
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Categoria CNH</label>
              <select id="user-form-cnh-cat" 
                class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none">
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
              <label class="block text-xs font-semibold uppercase text-slate-300 mb-1.5">RNTRC</label>
              <input type="text" id="user-form-rntrc" placeholder="Registro RNTRC" 
                class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none">
            </div>
          </div>

          <!-- VÍNCULO DE VEÍCULO -->
          <div>
            <label class="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Veículo Atual Alocado</label>
            <select id="user-form-vehicle" 
              class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none">
              <option value="">Nenhum veículo vinculado (alocar depois)</option>
            </select>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-800 flex justify-end gap-3">
          <button type="button" onclick="closeModal('modal-user')" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm transition">Cancelar</button>
          <button type="submit" id="user-submit-btn" class="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-brand-500/25 transition">Salvar Usuário</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: RESET DE SENHA -->
  <div id="modal-reset-pwd" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
    <div class="w-full max-w-md glass-card rounded-2xl border border-slate-800 shadow-2xl p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <i data-lucide="key" class="w-5 h-5 text-amber-400"></i>
          Redefinir Senha
        </h3>
        <button onclick="closeModal('modal-reset-pwd')" class="text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <p class="text-xs text-slate-400">
        Defina a nova senha para o usuário <strong id="reset-pwd-username" class="text-white"></strong>. 
        Ao salvar, todas as sessões ativas no APK e Web serão revogadas imediatamente.
      </p>

      <form id="form-reset-pwd" class="space-y-4">
        <input type="hidden" id="reset-pwd-user-id">

        <div>
          <label class="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Nova Senha *</label>
          <input type="password" id="reset-new-password" required minlength="6" placeholder="Mínimo 6 caracteres" 
            class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none">
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Confirmar Nova Senha *</label>
          <input type="password" id="reset-confirm-password" required minlength="6" placeholder="Repita a senha" 
            class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none">
        </div>

        <div class="pt-2 flex justify-end gap-3">
          <button type="button" onclick="closeModal('modal-reset-pwd')" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm">Cancelar</button>
          <button type="submit" class="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-amber-500/20">Confirmar Redefinição</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: NOVO VEÍCULO -->
  <div id="modal-vehicle" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
    <div class="w-full max-w-md glass-card rounded-2xl border border-slate-800 shadow-2xl p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h3 id="modal-vehicle-title" class="text-base font-bold text-white flex items-center gap-2">
          <i data-lucide="truck" class="w-5 h-5 text-cyan-400"></i>
          Novo Veículo
        </h3>
        <button onclick="closeModal('modal-vehicle')" class="text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <form id="form-vehicle" class="space-y-4">
        <input type="hidden" id="vehicle-form-id">

        <div>
          <label class="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Placa do Veículo *</label>
          <input type="text" id="vehicle-form-plate" required placeholder="ABC-1234 ou ABC1D23" maxlength="8"
            class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white uppercase text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Modelo *</label>
            <input type="text" id="vehicle-form-model" required placeholder="Ex: FH 540" 
              class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Marca *</label>
            <input type="text" id="vehicle-form-brand" required placeholder="Ex: Volvo" 
              class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Ano</label>
            <input type="number" id="vehicle-form-year" placeholder="2023" min="1990" max="2030"
              class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Status</label>
            <select id="vehicle-form-status" 
              class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none">
              <option value="DISPONIVEL">Disponível</option>
              <option value="EM_VIAGEM">Em Viagem</option>
              <option value="MANUTENCAO">Manutenção</option>
            </select>
          </div>
        </div>

        <div class="pt-2 flex justify-end gap-3">
          <button type="button" onclick="closeModal('modal-vehicle')" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm">Cancelar</button>
          <button type="submit" class="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-cyan-500/20">Salvar Veículo</button>
        </div>
      </form>
    </div>
  </div>

  <!-- JAVASCRIPT APPLICATION CORE -->
  <script>
    // State
    const STATE = {
      token: localStorage.getItem('hk_access_token'),
      refreshToken: localStorage.getItem('hk_refresh_token'),
      user: JSON.parse(localStorage.getItem('hk_user') || 'null'),
      currentView: 'dashboard',
      users: [],
      vehicles: [],
      stats: null,
      unlinkedDrivers: [],
    };

    // Formatters
    function formatCPF(cpf) {
      if (!cpf) return '-';
      const clean = cpf.replace(/\\D/g, '');
      if (clean.length !== 11) return cpf;
      return clean.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{2})/, '$1.$2.$3-$4');
    }

    function formatPhone(phone) {
      if (!phone) return '-';
      return phone;
    }

    // Toast Notifications
    function showToast(msg, type = 'info') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      
      const colors = {
        success: 'bg-emerald-950 border-emerald-800 text-emerald-200',
        error: 'bg-rose-950 border-rose-800 text-rose-200',
        info: 'bg-slate-900 border-slate-700 text-slate-200',
      };

      const icons = {
        success: 'check-circle',
        error: 'alert-triangle',
        info: 'info',
      };

      toast.className = \`p-4 rounded-xl border shadow-xl flex items-start gap-3 transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto \${colors[type] || colors.info}\`;
      toast.innerHTML = \`
        <i data-lucide="\${icons[type] || 'info'}" class="w-5 h-5 shrink-0 mt-0.5"></i>
        <div class="text-xs font-medium leading-relaxed">\${msg}</div>
      \`;

      container.appendChild(toast);
      lucide.createIcons({ root: toast });

      setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      }, 10);

      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }

    // Authenticated API Fetch
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
          // Token expired or invalid
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

    // Navigation
    function navigate(viewName) {
      STATE.currentView = viewName;
      document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('bg-brand-600', 'text-white');
        el.classList.add('text-slate-300');
      });

      const activeNav = document.getElementById(\`nav-\${viewName}\`);
      if (activeNav) {
        activeNav.classList.add('bg-brand-600', 'text-white');
        activeNav.classList.remove('text-slate-300');
      }

      document.getElementById('view-dashboard').classList.add('hidden');
      document.getElementById('view-users').classList.add('hidden');
      document.getElementById('view-vehicles').classList.add('hidden');

      const target = document.getElementById(\`view-\${viewName}\`);
      if (target) target.classList.remove('hidden');

      const titles = {
        dashboard: 'Dashboard e Indicadores',
        users: 'Gestão de Usuários e Motoristas',
        vehicles: 'Gestão da Frota de Veículos',
      };
      document.getElementById('page-title').innerText = titles[viewName] || 'Painel';

      refreshCurrentView();
    }

    async function refreshCurrentView() {
      if (STATE.currentView === 'dashboard') {
        await loadDashboard();
      } else if (STATE.currentView === 'users') {
        await loadUsers();
      } else if (STATE.currentView === 'vehicles') {
        await loadVehicles();
      }
    }

    // Auth & Login
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('login-submit-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span><span>Autenticando...</span>';

      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;

      try {
        const data = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        }).then(r => r.json());

        if (data.accessToken && data.user) {
          if (data.user.role !== 'ADMIN' && data.user.role !== 'MANAGER') {
            showToast('Acesso negado: Apenas administradores e gerentes podem acessar este painel.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Entrar no Painel</span><i data-lucide="arrow-right" class="w-4 h-4"></i>';
            lucide.createIcons();
            return;
          }

          STATE.token = data.accessToken;
          STATE.refreshToken = data.refreshToken;
          STATE.user = data.user;

          localStorage.setItem('hk_access_token', data.accessToken);
          localStorage.setItem('hk_refresh_token', data.refreshToken);
          localStorage.setItem('hk_user', JSON.stringify(data.user));

          showApp();
          showToast(\`Bem-vindo(a), \${data.user.name}!\`, 'success');
        } else {
          showToast(data.message || 'Credenciais inválidas ou conta inativa', 'error');
        }
      } catch (err) {
        showToast('Falha na comunicação com o servidor HK Central.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Entrar no Painel</span><i data-lucide="arrow-right" class="w-4 h-4"></i>';
        lucide.createIcons();
      }
    });

    function showApp() {
      document.getElementById('auth-screen').classList.add('hidden');
      document.getElementById('app-layout').classList.remove('hidden');

      if (STATE.user) {
        document.getElementById('user-display-name').innerText = STATE.user.name;
        document.getElementById('user-display-role').innerText = STATE.user.role;
        const initials = STATE.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        document.getElementById('user-avatar').innerText = initials || 'AD';
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

      localStorage.removeItem('hk_access_token');
      localStorage.removeItem('hk_refresh_token');
      localStorage.removeItem('hk_user');
      STATE.token = null;
      STATE.user = null;

      document.getElementById('app-layout').classList.add('hidden');
      document.getElementById('auth-screen').classList.remove('hidden');
    }

    // Toggle Password Visibility
    document.getElementById('toggle-pwd-btn')?.addEventListener('click', () => {
      const input = document.getElementById('login-password');
      input.type = input.type === 'password' ? 'text' : 'password';
    });

    // Load Dashboard Stats
    async function loadDashboard() {
      try {
        const stats = await apiFetch('/api/v1/admin/dashboard');
        STATE.stats = stats;

        document.getElementById('stat-total-users').innerText = stats.totalUsers ?? 0;
        document.getElementById('stat-active-users').innerText = stats.activeUsers ?? 0;
        document.getElementById('stat-inactive-users').innerText = stats.inactiveUsers ?? 0;
        document.getElementById('stat-total-drivers').innerText = stats.totalDrivers ?? 0;
        document.getElementById('stat-erp-drivers').innerText = stats.erpOnlyDrivers ?? 0;
        document.getElementById('stat-total-vehicles').innerText = stats.totalVehicles ?? 0;

        // Load Unlinked Drivers
        const unlinked = await apiFetch('/api/v1/admin/drivers/unlinked');
        STATE.unlinkedDrivers = unlinked;
        const unlinkedContainer = document.getElementById('unlinked-drivers-list');
        document.getElementById('erp-badge').innerText = \`\${unlinked.length} pendentes\`;

        if (!unlinked.length) {
          unlinkedContainer.innerHTML = '<p class="text-xs text-slate-500 italic">Nenhum motorista pendente de vínculo.</p>';
        } else {
          unlinkedContainer.innerHTML = unlinked.map(d => \`
            <div class="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
              <div>
                <span class="text-xs font-semibold text-white block">CNH: \${d.cnh || 'Não inf.'} (Cat \${d.cnhCategory || '-'})</span>
                <span class="text-[10px] text-purple-400">RNTRC: \${d.rntrc || '-'}</span>
              </div>
              <button onclick="openCreateUserForErpDriver('\${d.id}', '\${d.cnh || ''}', '\${d.cnhCategory || ''}', '\${d.rntrc || ''}')" class="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 text-xs font-medium transition">
                Vincular Login
              </button>
            </div>
          \`).join('');
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      }
    }

    // Load Users
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
        document.getElementById('users-table-body').innerHTML = \`
          <tr><td colspan="6" class="px-6 py-6 text-center text-rose-400 text-xs">Erro ao carregar usuários: \${err.message}</td></tr>
        \`;
      }
    }

    function renderUsersTable(users) {
      const tbody = document.getElementById('users-table-body');
      if (!users.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-slate-500 text-xs">Nenhum usuário encontrado.</td></tr>';
        return;
      }

      tbody.innerHTML = users.map(user => {
        const roleColors = {
          ADMIN: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          MANAGER: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          DRIVER: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
          OPERATOR: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
        };

        const statusColors = {
          ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          INACTIVE: 'bg-slate-700 text-slate-400 border-slate-600',
          BLOCKED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        };

        const driverInfo = user.driver ? \`
          <div>
            <span class="text-xs text-white font-medium block">CNH: \${user.driver.cnh || '-'} (Cat \${user.driver.cnhCategory || '-'})</span>
            <span class="text-[11px] text-slate-400">Veículo: \${user.driver.assignments?.[0]?.vehicle?.plate || 'Sem veículo'}</span>
          </div>
        \` : '<span class="text-xs text-slate-500">-</span>';

        return \`
          <tr class="hover:bg-slate-900/60 transition">
            <td class="px-6 py-4">
              <div class="font-semibold text-white text-sm">\${user.name}</div>
              <div class="text-xs text-slate-400">ID: \${user.id.substring(0, 8)}...</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-xs font-mono text-slate-200">\${formatCPF(user.cpf)}</div>
              <div class="text-xs text-slate-400">\${formatPhone(user.phone)}</div>
            </td>
            <td class="px-6 py-4">
              <span class="inline-block px-2 py-0.5 text-xs font-semibold rounded-full border \${roleColors[user.role] || ''}">
                \${user.role}
              </span>
            </td>
            <td class="px-6 py-4">
              <span class="inline-block px-2 py-0.5 text-xs font-semibold rounded-full border \${statusColors[user.status] || ''}">
                \${user.status}
              </span>
            </td>
            <td class="px-6 py-4">\${driverInfo}</td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <button onclick="openEditUserModal('\${user.id}')" title="Editar" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
                  <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="toggleUserStatus('\${user.id}', '\${user.status}')" title="\${user.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}" class="p-1.5 rounded-lg \${user.status === 'ACTIVE' ? 'bg-amber-950/40 hover:bg-amber-900 text-amber-300' : 'bg-emerald-950/40 hover:bg-emerald-900 text-emerald-300'} transition">
                  <i data-lucide="\${user.status === 'ACTIVE' ? 'pause-circle' : 'play-circle'}" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="openResetPasswordModal('\${user.id}', '\${user.name}')" title="Redefinir Senha" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition">
                  <i data-lucide="key" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="deleteUserSafely('\${user.id}', '\${user.name}')" title="Excluir / Desativar" class="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-400 transition">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </td>
          </tr>
        \`;
      }).join('');
      lucide.createIcons({ root: tbody });
    }

    // Load Vehicles
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
        document.getElementById('vehicles-table-body').innerHTML = \`
          <tr><td colspan="6" class="px-6 py-6 text-center text-rose-400 text-xs">Erro ao carregar veículos: \${err.message}</td></tr>
        \`;
      }
    }

    function renderVehiclesTable(vehicles) {
      const tbody = document.getElementById('vehicles-table-body');
      if (!vehicles.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-slate-500 text-xs">Nenhum veículo cadastrado.</td></tr>';
        return;
      }

      tbody.innerHTML = vehicles.map(v => {
        const driverName = v.assignments?.[0]?.driver?.user?.name || (v.assignments?.[0]?.driver ? 'Motorista sem nome' : 'Nenhum');
        return \`
          <tr class="hover:bg-slate-900/60 transition">
            <td class="px-6 py-4 font-mono font-bold text-white text-sm">\${v.plate}</td>
            <td class="px-6 py-4 text-sm text-slate-200">\${v.brand} \${v.model}</td>
            <td class="px-6 py-4 text-xs text-slate-400">\${v.year || '-'}</td>
            <td class="px-6 py-4">
              <span class="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                \${v.status}
              </span>
            </td>
            <td class="px-6 py-4 text-xs text-slate-300">\${driverName}</td>
            <td class="px-6 py-4 text-right">
              <button onclick="openEditVehicleModal('\${v.id}')" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
                <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
              </button>
            </td>
          </tr>
        \`;
      }).join('');
      lucide.createIcons({ root: tbody });
    }

    // Modal Handlers
    function openModal(id) {
      document.getElementById(id).classList.remove('hidden');
      lucide.createIcons();
    }

    function closeModal(id) {
      document.getElementById(id).classList.add('hidden');
    }

    async function populateVehiclesDropdown(selectedVehicleId = '') {
      try {
        const vehicles = await apiFetch('/api/v1/admin/vehicles');
        const select = document.getElementById('user-form-vehicle');
        select.innerHTML = '<option value="">Nenhum veículo vinculado (alocar depois)</option>' +
          vehicles.map(v => \`
            <option value="\${v.id}" \${v.id === selectedVehicleId ? 'selected' : ''}>
              \${v.plate} — \${v.brand} \${v.model} (\${v.status})
            </option>
          \`).join('');
      } catch (err) {
        console.error('Failed to load vehicles dropdown:', err);
      }
    }

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
      document.getElementById('modal-user-title').innerText = 'Novo Usuário';
      document.getElementById('form-user').reset();
      document.getElementById('user-form-id').value = '';
      document.getElementById('user-form-pwd-container').classList.remove('hidden');
      document.getElementById('user-form-password').required = true;
      document.getElementById('user-form-role').value = defaultRole;
      document.getElementById('erp-detection-alert').classList.add('hidden');

      handleRoleChange();
      await populateVehiclesDropdown();
      openModal('modal-user');
    }

    async function openCreateUserForErpDriver(driverId, cnh, cnhCat, rntrc) {
      await openCreateUserModal('DRIVER');
      document.getElementById('user-form-cnh').value = cnh;
      document.getElementById('user-form-cnh-cat').value = cnhCat;
      document.getElementById('user-form-rntrc').value = rntrc;
      document.getElementById('erp-detection-alert').classList.remove('hidden');
    }

    async function openEditUserModal(userId) {
      try {
        const user = await apiFetch(\`/api/v1/admin/users/\${userId}\`);
        document.getElementById('modal-user-title').innerText = 'Editar Usuário';
        document.getElementById('user-form-id').value = user.id;
        document.getElementById('user-form-name').value = user.name;
        document.getElementById('user-form-cpf').value = user.cpf;
        document.getElementById('user-form-cpf').disabled = true; // CPF imutável na edição direta
        document.getElementById('user-form-phone').value = user.phone || '';
        document.getElementById('user-form-role').value = user.role;
        document.getElementById('user-form-status').value = user.status;

        // Ocultar campo de senha no formulário de edição (usar modal de reset)
        document.getElementById('user-form-pwd-container').classList.add('hidden');
        document.getElementById('user-form-password').required = false;

        const currentVehicleId = user.driver?.assignments?.[0]?.vehicle?.id || '';
        await populateVehiclesDropdown(currentVehicleId);

        if (user.driver) {
          document.getElementById('user-form-cnh').value = user.driver.cnh || '';
          document.getElementById('user-form-cnh-cat').value = user.driver.cnhCategory || '';
          document.getElementById('user-form-rntrc').value = user.driver.rntrc || '';
        }

        handleRoleChange();
        openModal('modal-user');
      } catch (err) {
        showToast(\`Erro ao abrir usuário: \${err.message}\`, 'error');
      }
    }

    // Save User (Create or Update)
    document.getElementById('form-user').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('user-form-id').value;
      const isEdit = Boolean(id);

      const payload = {
        name: document.getElementById('user-form-name').value.trim(),
        phone: document.getElementById('user-form-phone').value.trim() || undefined,
        role: document.getElementById('user-form-role').value,
        status: document.getElementById('user-form-status').value,
      };

      if (!isEdit) {
        payload.cpf = document.getElementById('user-form-cpf').value.trim();
        payload.password = document.getElementById('user-form-password').value;
      }

      if (payload.role === 'DRIVER') {
        payload.cnh = document.getElementById('user-form-cnh').value.trim() || undefined;
        payload.cnhCategory = document.getElementById('user-form-cnh-cat').value || undefined;
        payload.rntrc = document.getElementById('user-form-rntrc').value.trim() || undefined;
        payload.vehicleId = document.getElementById('user-form-vehicle').value || undefined;
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
    });

    // Toggle Status
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

    // Reset Password
    function openResetPasswordModal(id, name) {
      document.getElementById('reset-pwd-user-id').value = id;
      document.getElementById('reset-pwd-username').innerText = name;
      document.getElementById('form-reset-pwd').reset();
      openModal('modal-reset-pwd');
    }

    document.getElementById('form-reset-pwd').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('reset-pwd-user-id').value;
      const pwd = document.getElementById('reset-new-password').value;
      const confirmPwd = document.getElementById('reset-confirm-password').value;

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
    });

    // Delete / Soft-Deactivate User
    async function deleteUserSafely(id, name) {
      if (!confirm(\`ATENÇÃO: Deseja realmente excluir ou desativar o usuário "\${name}"?\\n\\nSe houver viagens ou fechamentos registrados, a conta será inativada com segurança para preservar o histórico fiscal e contábil.\`)) {
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

    // Vehicle Modal & Actions
    function openCreateVehicleModal() {
      document.getElementById('modal-vehicle-title').innerText = 'Novo Veículo';
      document.getElementById('form-vehicle').reset();
      document.getElementById('vehicle-form-id').value = '';
      openModal('modal-vehicle');
    }

    async function openEditVehicleModal(vehicleId) {
      try {
        const v = await apiFetch(\`/api/v1/admin/vehicles/\${vehicleId}\`);
        document.getElementById('modal-vehicle-title').innerText = 'Editar Veículo';
        document.getElementById('vehicle-form-id').value = v.id;
        document.getElementById('vehicle-form-plate').value = v.plate;
        document.getElementById('vehicle-form-model').value = v.model;
        document.getElementById('vehicle-form-brand').value = v.brand;
        document.getElementById('vehicle-form-year').value = v.year || '';
        document.getElementById('vehicle-form-status').value = v.status;
        openModal('modal-vehicle');
      } catch (err) {
        showToast(\`Erro ao abrir veículo: \${err.message}\`, 'error');
      }
    }

    document.getElementById('form-vehicle').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('vehicle-form-id').value;
      const isEdit = Boolean(id);

      const payload = {
        plate: document.getElementById('vehicle-form-plate').value.trim().toUpperCase(),
        model: document.getElementById('vehicle-form-model').value.trim(),
        brand: document.getElementById('vehicle-form-brand').value.trim(),
        year: document.getElementById('vehicle-form-year').value ? parseInt(document.getElementById('vehicle-form-year').value) : undefined,
        status: document.getElementById('vehicle-form-status').value,
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
    });

    // Auto format CPF on type
    document.getElementById('user-form-cpf')?.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\\D/g, '');
      if (v.length > 11) v = v.substring(0, 11);
      if (v.length > 9) v = v.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{1,2})/, '$1.$2.$3-$4');
      else if (v.length > 6) v = v.replace(/(\\d{3})(\\d{3})(\\d{1,3})/, '$1.$2.$3');
      else if (v.length > 3) v = v.replace(/(\\d{3})(\\d{1,3})/, '$1.$2');
      e.target.value = v;
    });

    // Filter Listeners
    ['user-search-input', 'user-role-filter', 'user-status-filter'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => {
        clearTimeout(window._userSearchTimeout);
        window._userSearchTimeout = setTimeout(loadUsers, 250);
      });
    });

    ['vehicle-search-input', 'vehicle-status-filter'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => {
        clearTimeout(window._vehicleSearchTimeout);
        window._vehicleSearchTimeout = setTimeout(loadVehicles, 250);
      });
    });

    // Initial Startup
    document.addEventListener('DOMContentLoaded', () => {
      lucide.createIcons();
      if (STATE.token && STATE.user) {
        showApp();
      }
    });
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
