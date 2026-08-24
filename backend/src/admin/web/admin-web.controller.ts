import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';

@ApiTags('Admin - Painel Web')
@Controller('admin')
export class AdminWebController {
  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  @ApiOperation({ summary: 'Interface do Painel Operacional Web HK Connect' })
  @ApiResponse({ status: 200, description: 'HTML do Painel Administrativo' })
  getAdminPanel(): string {
    return `<!DOCTYPE html>
<html lang="pt-BR" class="h-full bg-slate-900 text-slate-100">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HK Connect — Gestão Operacional</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Leaflet CSS & JS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    .leaflet-container { background: #0f172a; }
    .status-badge-movimento { background-color: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); }
    .status-badge-parado { background-color: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); }
    .status-badge-sem-atualizacao { background-color: rgba(234, 179, 8, 0.2); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4); }
    .status-badge-offline { background-color: rgba(148, 163, 184, 0.2); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.4); }
  </style>
</head>
<body class="h-full flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">

  <!-- Top Navigation Header -->
  <header class="bg-slate-800/90 backdrop-blur border-b border-slate-700/80 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 font-bold text-lg text-white">
          HK
        </div>
        <div>
          <h1 class="text-base font-bold text-white tracking-tight leading-tight">HK Connect</h1>
          <p class="text-xs text-slate-400 font-medium">Gestão Operacional & Rastreamento</p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <nav class="flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-700/50">
        <button id="tab-tracking-btn" onclick="switchTab('tracking')" class="flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all bg-blue-600 text-white shadow">
          <i data-lucide="navigation" class="w-4 h-4"></i>
          <span>Rastreamento em Tempo Real</span>
        </button>
        <button id="tab-users-btn" onclick="switchTab('users')" class="flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <i data-lucide="users" class="w-4 h-4"></i>
          <span>Gestão de Usuários</span>
        </button>
      </nav>

      <!-- Auth / API Token controls -->
      <div class="flex items-center space-x-3">
        <div class="relative">
          <input id="jwt-input" type="password" placeholder="Cole seu JWT Bearer Token..." class="w-48 sm:w-64 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
        </div>
        <button onclick="saveToken()" class="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-medium transition border border-slate-600">
          Salvar Token
        </button>
      </div>
    </div>
  </header>

  <!-- Main Content Area -->
  <main class="flex-1 flex flex-col overflow-hidden">

    <!-- SEÇÃO 1: RASTREAMENTO (TRACKING MAP) -->
    <div id="section-tracking" class="flex-1 flex flex-col lg:flex-row overflow-hidden">
      <!-- Sidebar Filters & Drivers List -->
      <div class="w-full lg:w-96 bg-slate-800/80 border-r border-slate-700 flex flex-col z-10 overflow-hidden">
        <!-- Controls & Filters -->
        <div class="p-4 border-b border-slate-700 space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Motoristas Monitorados
            </h2>
            <button onclick="refreshTrackingData()" class="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition text-xs flex items-center gap-1">
              <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i>
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative">
            <i data-lucide="search" class="w-4 h-4 absolute left-3 top-2.5 text-slate-400"></i>
            <input id="tracking-search" oninput="filterDriversList()" type="text" placeholder="Buscar por motorista, placa ou viagem..." class="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500">
          </div>

          <!-- Status Filter Pills -->
          <div class="flex flex-wrap gap-1.5 text-xs">
            <button onclick="setStatusFilter('ALL')" id="filter-btn-all" class="px-2.5 py-1 rounded-md font-semibold bg-blue-600 text-white">Todos (<span id="count-all">0</span>)</button>
            <button onclick="setStatusFilter('EM_MOVIMENTO')" id="filter-btn-mov" class="px-2.5 py-1 rounded-md font-medium text-emerald-400 bg-slate-900 border border-slate-700 hover:border-emerald-500/50">Em Movimento (<span id="count-mov">0</span>)</button>
            <button onclick="setStatusFilter('PARADO')" id="filter-btn-parado" class="px-2.5 py-1 rounded-md font-medium text-blue-400 bg-slate-900 border border-slate-700 hover:border-blue-500/50">Parados (<span id="count-parado">0</span>)</button>
            <button onclick="setStatusFilter('SEM_ATUALIZACAO')" id="filter-btn-alerta" class="px-2.5 py-1 rounded-md font-medium text-amber-400 bg-slate-900 border border-slate-700 hover:border-amber-500/50">Alerta (<span id="count-alerta">0</span>)</button>
            <button onclick="setStatusFilter('OFFLINE')" id="filter-btn-off" class="px-2.5 py-1 rounded-md font-medium text-slate-400 bg-slate-900 border border-slate-700 hover:border-slate-500/50">Offline (<span id="count-off">0</span>)</button>
          </div>
        </div>

        <!-- Drivers Scrollable List -->
        <div id="drivers-list-container" class="flex-1 overflow-y-auto divide-y divide-slate-700/60 p-2 space-y-1">
          <div class="p-8 text-center text-slate-500 text-xs">Carregando motoristas...</div>
        </div>

        <!-- Auto-refresh banner -->
        <div class="px-4 py-2 bg-slate-900/80 border-t border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
          <span>Auto-atualização: <b class="text-blue-400">15s</b></span>
          <span id="last-sync-time">Último sync: --:--:--</span>
        </div>
      </div>

      <!-- Map Container & Driver Detail Drawer -->
      <div class="flex-1 relative flex flex-col">
        <div id="map" class="w-full h-full z-0"></div>

        <!-- Floating Driver Detail Card -->
        <div id="driver-detail-card" class="hidden absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 bg-slate-800/95 backdrop-blur-md border border-slate-700 rounded-2xl p-5 shadow-2xl z-20 space-y-4">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2">
                <h3 id="card-driver-name" class="font-bold text-white text-base">Nome do Motorista</h3>
                <span id="card-driver-status" class="px-2 py-0.5 rounded text-[10px] font-bold">STATUS</span>
              </div>
              <p id="card-driver-phone" class="text-xs text-slate-400 mt-0.5"></p>
            </div>
            <button onclick="closeDriverDetail()" class="p-1 rounded-lg bg-slate-700/80 text-slate-400 hover:text-white">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3 bg-slate-900/70 p-3 rounded-xl border border-slate-700/50 text-xs">
            <div>
              <span class="text-slate-400 block text-[10px]">Veículo</span>
              <span id="card-driver-vehicle" class="font-semibold text-slate-200">ABC-1234</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px]">Velocidade</span>
              <span id="card-driver-speed" class="font-semibold text-slate-200">0 km/h</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px]">Viagem Ativa</span>
              <span id="card-driver-trip" class="font-semibold text-blue-400">Nenhuma</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px]">Última Captura</span>
              <span id="card-driver-updated" class="font-semibold text-slate-300">--</span>
            </div>
          </div>

          <!-- Trail / History Selector -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-300 font-semibold flex items-center gap-1.5">
                <i data-lucide="route" class="w-3.5 h-3.5 text-blue-400"></i>
                Trilha Histórica Recente
              </span>
              <div class="flex gap-1">
                <button onclick="loadDriverTrail('2h')" class="px-2 py-0.5 rounded text-[10px] bg-slate-700 hover:bg-blue-600 text-slate-200">2h</button>
                <button onclick="loadDriverTrail('6h')" class="px-2 py-0.5 rounded text-[10px] bg-slate-700 hover:bg-blue-600 text-slate-200">6h</button>
                <button onclick="loadDriverTrail('12h')" class="px-2 py-0.5 rounded text-[10px] bg-slate-700 hover:bg-blue-600 text-slate-200">12h</button>
                <button onclick="loadDriverTrail('24h')" class="px-2 py-0.5 rounded text-[10px] bg-slate-700 hover:bg-blue-600 text-slate-200">24h</button>
              </div>
            </div>
            <div id="trail-status" class="text-[11px] text-slate-400 italic"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- SEÇÃO 2: GESTÃO DE USUÁRIOS (USERS MANAGEMENT TABLE) -->
    <div id="section-users" class="hidden flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <!-- Metrics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="bg-slate-800 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Usuários</p>
            <h3 id="users-metric-total" class="text-2xl font-black text-white mt-1">0</h3>
          </div>
          <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <i data-lucide="users" class="w-5 h-5"></i>
          </div>
        </div>
        <div class="bg-slate-800 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Ativos</p>
            <h3 id="users-metric-active" class="text-2xl font-black text-emerald-400 mt-1">0</h3>
          </div>
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <i data-lucide="check-circle" class="w-5 h-5"></i>
          </div>
        </div>
        <div class="bg-slate-800 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p class="text-xs font-semibold text-amber-400 uppercase tracking-wider">Inativos</p>
            <h3 id="users-metric-inactive" class="text-2xl font-black text-amber-400 mt-1">0</h3>
          </div>
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <i data-lucide="clock" class="w-5 h-5"></i>
          </div>
        </div>
        <div class="bg-slate-800 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p class="text-xs font-semibold text-rose-400 uppercase tracking-wider">Bloqueados</p>
            <h3 id="users-metric-blocked" class="text-2xl font-black text-rose-400 mt-1">0</h3>
          </div>
          <div class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <i data-lucide="shield-alert" class="w-5 h-5"></i>
          </div>
        </div>
        <div class="bg-slate-800 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p class="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Sem Usuário (ERP)</p>
            <h3 id="users-metric-no-user" class="text-2xl font-black text-cyan-400 mt-1">0</h3>
          </div>
          <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <i data-lucide="truck" class="w-5 h-5"></i>
          </div>
        </div>
      </div>

      <!-- Action Bar & Search -->
      <div class="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <div class="relative w-full sm:w-80">
            <i data-lucide="search" class="w-4 h-4 absolute left-3 top-3 text-slate-400"></i>
            <input id="users-search-input" oninput="loadUsersTable()" type="text" placeholder="Buscar por nome, telefone ou CPF..." class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500">
          </div>
          <select id="users-role-filter" onchange="loadUsersTable()" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500">
            <option value="">Todos os Perfis</option>
            <option value="DRIVER">Motorista</option>
            <option value="OPERATOR">Operador</option>
            <option value="MANAGER">Gerente</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>

        <button onclick="openCreateUserModal()" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
          <i data-lucide="user-plus" class="w-4 h-4"></i>
          Novo Usuário
        </button>
      </div>

      <!-- Users Table -->
      <div class="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-700 text-left text-xs text-slate-300">
            <thead class="bg-slate-900/60 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th class="px-6 py-4">Usuário</th>
                <th class="px-6 py-4">CPF / Telefone</th>
                <th class="px-6 py-4">Perfil</th>
                <th class="px-6 py-4">Motorista Vinculado</th>
                <th class="px-6 py-4">Veículo Atual</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4">Último Acesso</th>
                <th class="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody id="users-table-body" class="divide-y divide-slate-700/60 font-medium">
              <tr><td colspan="8" class="px-6 py-8 text-center text-slate-500">Carregando usuários...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>

  <!-- Modal Criar / Editar Usuário -->
  <div id="user-modal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
      <div class="p-5 border-b border-slate-700 flex items-center justify-between">
        <h3 id="modal-user-title" class="font-bold text-white text-base">Cadastrar Novo Usuário</h3>
        <button onclick="closeUserModal()" class="text-slate-400 hover:text-white p-1 rounded-lg">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <form id="user-form" onsubmit="handleUserSubmit(event)" class="p-6 space-y-4 text-xs">
        <input type="hidden" id="modal-user-id">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Nome Completo *</label>
          <input id="modal-user-name" required type="text" placeholder="Ex: Carlos Alberto" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">CPF *</label>
            <input id="modal-user-cpf" required type="text" placeholder="123.456.789-01" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500">
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Telefone</label>
            <input id="modal-user-phone" type="text" placeholder="+5511999998888" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500">
          </div>
        </div>

        <div id="modal-password-container">
          <label class="block font-semibold text-slate-300 mb-1">Senha (Argon2id) *</label>
          <input id="modal-user-password" type="password" placeholder="Mínimo 6 caracteres" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Perfil (Role) *</label>
            <select id="modal-user-role" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500">
              <option value="DRIVER">MOTORISTA (DRIVER)</option>
              <option value="OPERATOR">OPERADOR (OPERATOR)</option>
              <option value="MANAGER">GERENTE (MANAGER)</option>
              <option value="ADMIN">ADMINISTRADOR (ADMIN)</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Status Operacional *</label>
            <select id="modal-user-status" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500">
              <option value="ACTIVE">ACTIVE (Ativo)</option>
              <option value="INACTIVE">INACTIVE (Inativo)</option>
              <option value="BLOCKED">BLOCKED (Bloqueado)</option>
            </select>
          </div>
        </div>

        <div class="pt-2">
          <button type="submit" class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-500/20">
            Salvar Usuário
          </button>
        </div>
      </form>
    </div>
  </div>

  <script>
    // Initial State & Configuration
    let currentTab = 'tracking';
    let currentFilter = 'ALL';
    let driversCache = [];
    let mapInstance = null;
    let markersLayer = null;
    let trailLayer = null;
    let selectedDriverId = null;
    let autoRefreshTimer = null;

    // JWT Token Handling
    function getStoredToken() {
      return localStorage.getItem('hk_admin_jwt') || '';
    }

    function saveToken() {
      const token = document.getElementById('jwt-input').value.trim();
      if (token) {
        localStorage.setItem('hk_admin_jwt', token);
        alert('Token JWT salvo com sucesso!');
        refreshTrackingData();
        loadUsersTable();
      }
    }

    // Tab Switching
    function switchTab(tab) {
      currentTab = tab;
      const trackingSec = document.getElementById('section-tracking');
      const usersSec = document.getElementById('section-users');
      const trackingBtn = document.getElementById('tab-tracking-btn');
      const usersBtn = document.getElementById('tab-users-btn');

      if (tab === 'tracking') {
        trackingSec.classList.remove('hidden');
        usersSec.classList.add('hidden');
        trackingBtn.className = 'flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow';
        usersBtn.className = 'flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all';
        setTimeout(() => { if (mapInstance) mapInstance.invalidateSize(); }, 200);
      } else {
        trackingSec.classList.add('hidden');
        usersSec.classList.remove('hidden');
        usersBtn.className = 'flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow';
        trackingBtn.className = 'flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all';
        loadUsersTable();
      }
    }

    // Initialize Leaflet Map
    function initMap() {
      if (mapInstance) return;
      mapInstance = L.map('map', { zoomControl: true }).setView([-23.5505, -46.6333], 11);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        maxZoom: 19
      }).addTo(mapInstance);

      markersLayer = L.layerGroup().addTo(mapInstance);
      trailLayer = L.layerGroup().addTo(mapInstance);
    }

    // API Helper with Bearer
    async function apiFetch(url, options = {}) {
      const token = getStoredToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
        ...(options.headers || {})
      };
      const response = await fetch(url, { credentials: 'omit', ...options, headers });
      if (response.status === 401 || response.status === 403) {
        console.warn('Requisição negada ou sem autorização (401/403). Insira um JWT Bearer de ADMIN ou MANAGER no topo.');
      }
      return response;
    }

    // Tracking Functions
    async function refreshTrackingData() {
      try {
        const res = await apiFetch('/api/v1/admin/tracking/drivers');
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('Falha ao carregar tracking:', errData);
          return;
        }
        const data = await res.json();
        driversCache = data;
        updateTrackingStats();
        renderDriversList();
        renderMapMarkers();
        document.getElementById('last-sync-time').innerText = 'Último sync: ' + new Date().toLocaleTimeString('pt-BR');
      } catch (err) {
        console.error('Erro de conexão ao carregar tracking:', err);
      }
    }

    function updateTrackingStats() {
      let mov = 0, parado = 0, alerta = 0, off = 0;
      driversCache.forEach(d => {
        if (d.trackingStatus === 'EM_MOVIMENTO') mov++;
        else if (d.trackingStatus === 'PARADO') parado++;
        else if (d.trackingStatus === 'SEM_ATUALIZACAO') alerta++;
        else off++;
      });
      document.getElementById('count-all').innerText = driversCache.length;
      document.getElementById('count-mov').innerText = mov;
      document.getElementById('count-parado').innerText = parado;
      document.getElementById('count-alerta').innerText = alerta;
      document.getElementById('count-off').innerText = off;
    }

    function setStatusFilter(status) {
      currentFilter = status;
      ['all', 'mov', 'parado', 'alerta', 'off'].forEach(k => {
        const btn = document.getElementById('filter-btn-' + k);
        if (btn) btn.className = 'px-2.5 py-1 rounded-md font-medium text-slate-400 bg-slate-900 border border-slate-700';
      });
      const activeMap = { 'ALL': 'all', 'EM_MOVIMENTO': 'mov', 'PARADO': 'parado', 'SEM_ATUALIZACAO': 'alerta', 'OFFLINE': 'off' };
      const activeBtn = document.getElementById('filter-btn-' + activeMap[status]);
      if (activeBtn) activeBtn.className = 'px-2.5 py-1 rounded-md font-semibold bg-blue-600 text-white';
      renderDriversList();
      renderMapMarkers();
    }

    function filterDriversList() {
      renderDriversList();
      renderMapMarkers();
    }

    function renderDriversList() {
      const container = document.getElementById('drivers-list-container');
      const search = document.getElementById('tracking-search').value.toLowerCase();
      
      const filtered = driversCache.filter(d => {
        if (currentFilter !== 'ALL' && d.trackingStatus !== currentFilter) return false;
        if (search) {
          const match = d.driverName.toLowerCase().includes(search) ||
                        (d.vehicle?.plate && d.vehicle.plate.toLowerCase().includes(search)) ||
                        (d.activeTrip?.tripCode && d.activeTrip.tripCode.toLowerCase().includes(search));
          if (!match) return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        container.innerHTML = '<div class="p-6 text-center text-slate-500 text-xs">Nenhum motorista encontrado com os filtros atuais.</div>';
        return;
      }

      const statusBadges = {
        'EM_MOVIMENTO': '<span class="status-badge-movimento px-2 py-0.5 rounded text-[10px] font-bold">EM MOVIMENTO</span>',
        'PARADO': '<span class="status-badge-parado px-2 py-0.5 rounded text-[10px] font-bold">PARADO</span>',
        'SEM_ATUALIZACAO': '<span class="status-badge-sem-atualizacao px-2 py-0.5 rounded text-[10px] font-bold">SEM ATUALIZAÇÃO</span>',
        'OFFLINE': '<span class="status-badge-offline px-2 py-0.5 rounded text-[10px] font-bold">OFFLINE</span>',
      };

      container.innerHTML = filtered.map(d => \`
        <div onclick="selectDriver('\${d.driverId}')" class="p-3 rounded-xl hover:bg-slate-750 cursor-pointer transition border border-transparent hover:border-slate-700/80 bg-slate-900/40 \${selectedDriverId === d.driverId ? 'border-blue-500 bg-blue-950/20' : ''}">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-slate-100 text-xs">\${d.driverName}</h4>
            \${statusBadges[d.trackingStatus] || ''}
          </div>
          <div class="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
            <span>\${d.vehicle ? '🚛 ' + d.vehicle.plate : 'Sem veículo'}</span>
            <span>\${d.lastLocation?.speed ? Math.round(d.lastLocation.speed) + ' km/h' : '0 km/h'}</span>
          </div>
          \${d.activeTrip ? '<div class="text-[10px] text-blue-400 mt-1 font-medium">Viagem: ' + d.activeTrip.tripCode + ' (' + d.activeTrip.destination + ')</div>' : ''}
        </div>
      \`).join('');
    }

    function renderMapMarkers() {
      if (!markersLayer) return;
      markersLayer.clearLayers();
      const bounds = [];

      const search = document.getElementById('tracking-search').value.toLowerCase();
      const filtered = driversCache.filter(d => {
        if (!d.lastLocation?.latitude || !d.lastLocation?.longitude) return false;
        if (currentFilter !== 'ALL' && d.trackingStatus !== currentFilter) return false;
        if (search) {
          const match = d.driverName.toLowerCase().includes(search) ||
                        (d.vehicle?.plate && d.vehicle.plate.toLowerCase().includes(search));
          if (!match) return false;
        }
        return true;
      });

      const colorMap = {
        'EM_MOVIMENTO': '#22c55e',
        'PARADO': '#3b82f6',
        'SEM_ATUALIZACAO': '#eab308',
        'OFFLINE': '#94a3b8'
      };

      filtered.forEach(d => {
        const lat = d.lastLocation.latitude;
        const lng = d.lastLocation.longitude;
        bounds.push([lat, lng]);

        const color = colorMap[d.trackingStatus] || '#94a3b8';
        const marker = L.circleMarker([lat, lng], {
          radius: 8,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        });

        marker.bindPopup(\`
          <div style="font-family: sans-serif; font-size: 12px; color: #1e293b;">
            <b>\${d.driverName}</b><br/>
            Placa: \${d.vehicle?.plate || 'N/A'}<br/>
            Status: <b>\${d.trackingStatus}</b><br/>
            Velocidade: \${d.lastLocation?.speed ? Math.round(d.lastLocation.speed) : 0} km/h<br/>
            Última captura: \${new Date(d.lastLocation.capturedAt).toLocaleTimeString('pt-BR')}
          </div>
        \`);

        marker.on('click', () => selectDriver(d.driverId));
        markersLayer.addLayer(marker);
      });

      if (bounds.length > 0 && !selectedDriverId) {
        mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }

    async function selectDriver(driverId) {
      selectedDriverId = driverId;
      renderDriversList();
      const driver = driversCache.find(d => d.driverId === driverId);
      if (!driver) return;

      const card = document.getElementById('driver-detail-card');
      card.classList.remove('hidden');

      document.getElementById('card-driver-name').innerText = driver.driverName;
      document.getElementById('card-driver-phone').innerText = driver.driverPhone || 'Sem telefone';
      document.getElementById('card-driver-vehicle').innerText = driver.vehicle ? \`\${driver.vehicle.plate} (\${driver.vehicle.model})\` : 'N/A';
      document.getElementById('card-driver-speed').innerText = driver.lastLocation?.speed ? Math.round(driver.lastLocation.speed) + ' km/h' : '0 km/h';
      document.getElementById('card-driver-trip').innerText = driver.activeTrip ? driver.activeTrip.tripCode : 'Nenhuma viagem';
      document.getElementById('card-driver-updated').innerText = driver.lastLocation ? new Date(driver.lastLocation.capturedAt).toLocaleTimeString('pt-BR') : '--';

      const statusBadges = {
        'EM_MOVIMENTO': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
        'PARADO': 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
        'SEM_ATUALIZACAO': 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
        'OFFLINE': 'bg-slate-500/20 text-slate-400 border border-slate-500/40',
      };
      const badgeElem = document.getElementById('card-driver-status');
      badgeElem.className = 'px-2 py-0.5 rounded text-[10px] font-bold ' + (statusBadges[driver.trackingStatus] || '');
      badgeElem.innerText = driver.trackingStatus;

      if (driver.lastLocation?.latitude && driver.lastLocation?.longitude) {
        mapInstance.flyTo([driver.lastLocation.latitude, driver.lastLocation.longitude], 15, { duration: 1.2 });
      }

      loadDriverTrail('2h');
    }

    function closeDriverDetail() {
      selectedDriverId = null;
      document.getElementById('driver-detail-card').classList.add('hidden');
      if (trailLayer) trailLayer.clearLayers();
      renderDriversList();
    }

    async function loadDriverTrail(period) {
      if (!selectedDriverId) return;
      const statusElem = document.getElementById('trail-status');
      statusElem.innerText = 'Carregando trilha (' + period + ')...';
      if (trailLayer) trailLayer.clearLayers();

      try {
        const res = await apiFetch(\`/api/v1/admin/tracking/drivers/\${selectedDriverId}/history?period=\${period}\`);
        if (!res.ok) {
          statusElem.innerText = 'Erro ao carregar histórico.';
          return;
        }
        const data = await res.json();
        if (!data.points || data.points.length === 0) {
          statusElem.innerText = 'Nenhuma posição gravada nas últimas ' + period;
          return;
        }

        const latLngs = data.points.map(p => [p.latitude, p.longitude]);
        const polyline = L.polyline(latLngs, { color: '#3b82f6', weight: 4, opacity: 0.8, dashArray: '4, 8' });
        trailLayer.addLayer(polyline);
        statusElem.innerText = \`Trilha exibindo \${data.points.length} pontos (\${period})\`;
      } catch (err) {
        statusElem.innerText = 'Falha ao buscar trilha.';
      }
    }

    // Users Management Table Functions
    async function loadUsersTable() {
      const search = document.getElementById('users-search-input')?.value || '';
      const role = document.getElementById('users-role-filter')?.value || '';
      const tbody = document.getElementById('users-table-body');
      
      let url = '/api/v1/admin/users?';
      if (search) url += 'search=' + encodeURIComponent(search) + '&';
      if (role) url += 'role=' + encodeURIComponent(role);

      try {
        const res = await apiFetch(url);
        if (!res.ok) {
          tbody.innerHTML = '<tr><td colspan="8" class="px-6 py-8 text-center text-rose-400">Falha ao carregar usuários. Certifique-se de configurar o JWT Bearer no topo.</td></tr>';
          return;
        }
        const users = await res.json();
        updateUserMetrics(users);

        if (users.length === 0) {
          tbody.innerHTML = '<tr><td colspan="8" class="px-6 py-8 text-center text-slate-500">Nenhum usuário encontrado.</td></tr>';
          return;
        }

        tbody.innerHTML = users.map(u => \`
          <tr class="hover:bg-slate-750 transition">
            <td class="px-6 py-4">
              <div class="font-bold text-white text-xs">\${u.name}</div>
              <div class="text-[10px] text-slate-400 font-mono">\${u.id}</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-xs text-slate-300 font-mono">\${u.cpf}</div>
              <div class="text-[11px] text-slate-400">\${u.phone || 'Sem telefone'}</div>
            </td>
            <td class="px-6 py-4">
              <span class="px-2.5 py-1 rounded-md text-[10px] font-bold \${u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : u.role === 'MANAGER' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'}">\${u.role}</span>
            </td>
            <td class="px-6 py-4">
              \${u.driver ? \`<div class="text-xs text-emerald-400 font-semibold">Sim (\${u.driver.status})</div><div class="text-[10px] text-slate-400 font-mono">\${u.driver.id.substring(0, 8)}...</div>\` : '<span class="text-slate-500">Não vinculado</span>'}
            </td>
            <td class="px-6 py-4">
              \${u.vehicle ? \`<div class="text-xs text-slate-200 font-bold">\${u.vehicle.plate}</div><div class="text-[10px] text-slate-400">\${u.vehicle.model}</div>\` : '<span class="text-slate-500">--</span>'}
            </td>
            <td class="px-6 py-4">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold \${u.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : u.status === 'BLOCKED' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-500/20 text-slate-400'}">\${u.status}</span>
            </td>
            <td class="px-6 py-4 text-[11px] text-slate-400">
              \${u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('pt-BR') : 'Nunca acessou'}
            </td>
            <td class="px-6 py-4 text-right space-x-1">
              <button onclick="editUser('\${u.id}')" class="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition text-[11px]" title="Editar">✏️</button>
              <button onclick="promptResetPassword('\${u.id}')" class="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition text-[11px]" title="Redefinir Senha">🔑</button>
              <button onclick="toggleUserStatus('\${u.id}', '\${u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}')" class="p-1.5 rounded-lg \${u.status === 'ACTIVE' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'} transition text-[11px]" title="Alternar Status">\${u.status === 'ACTIVE' ? '⛔' : '✅'}</button>
            </td>
          </tr>
        \`).join('');
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="8" class="px-6 py-8 text-center text-rose-400">Erro de rede.</td></tr>';
      }
    }

    function updateUserMetrics(users) {
      let active = 0, inactive = 0, blocked = 0;
      users.forEach(u => {
        if (u.status === 'ACTIVE') active++;
        else if (u.status === 'BLOCKED') blocked++;
        else inactive++;
      });
      document.getElementById('users-metric-total').innerText = users.length;
      document.getElementById('users-metric-active').innerText = active;
      document.getElementById('users-metric-inactive').innerText = inactive;
      document.getElementById('users-metric-blocked').innerText = blocked;
    }

    // Modal Create / Edit
    function openCreateUserModal() {
      document.getElementById('modal-user-title').innerText = 'Cadastrar Novo Usuário';
      document.getElementById('modal-user-id').value = '';
      document.getElementById('modal-user-name').value = '';
      document.getElementById('modal-user-cpf').value = '';
      document.getElementById('modal-user-phone').value = '';
      document.getElementById('modal-user-password').value = '';
      document.getElementById('modal-password-container').classList.remove('hidden');
      document.getElementById('user-modal').classList.remove('hidden');
    }

    async function editUser(id) {
      const res = await apiFetch('/api/v1/admin/users/' + id);
      if (!res.ok) return alert('Falha ao carregar detalhes do usuário');
      const u = await res.json();

      document.getElementById('modal-user-title').innerText = 'Editar Usuário: ' + u.name;
      document.getElementById('modal-user-id').value = u.id;
      document.getElementById('modal-user-name').value = u.name;
      document.getElementById('modal-user-cpf').value = u.cpf;
      document.getElementById('modal-user-phone').value = u.phone || '';
      document.getElementById('modal-user-role').value = u.role;
      document.getElementById('modal-user-status').value = u.status;
      document.getElementById('modal-password-container').classList.add('hidden');
      document.getElementById('user-modal').classList.remove('hidden');
    }

    function closeUserModal() {
      document.getElementById('user-modal').classList.add('hidden');
    }

    async function handleUserSubmit(e) {
      e.preventDefault();
      const id = document.getElementById('modal-user-id').value;
      const name = document.getElementById('modal-user-name').value;
      const cpf = document.getElementById('modal-user-cpf').value;
      const phone = document.getElementById('modal-user-phone').value;
      const role = document.getElementById('modal-user-role').value;
      const status = document.getElementById('modal-user-status').value;

      if (!id) {
        // Create User
        const password = document.getElementById('modal-user-password').value;
        const res = await apiFetch('/api/v1/admin/users', {
          method: 'POST',
          body: JSON.stringify({ name, cpf, phone, password, role })
        });
        if (res.ok) {
          alert('Usuário criado com sucesso!');
          closeUserModal();
          loadUsersTable();
        } else {
          const err = await res.json().catch(() => ({}));
          alert('Erro ao criar usuário: ' + (err.message || 'Verifique as permissões'));
        }
      } else {
        // Update User
        const res = await apiFetch('/api/v1/admin/users/' + id, {
          method: 'PATCH',
          body: JSON.stringify({ name, phone, role, status })
        });
        if (res.ok) {
          alert('Usuário atualizado com sucesso!');
          closeUserModal();
          loadUsersTable();
        } else {
          const err = await res.json().catch(() => ({}));
          alert('Erro ao atualizar: ' + (err.message || 'Verifique as permissões'));
        }
      }
    }

    async function promptResetPassword(id) {
      const newPass = prompt('Digite a nova senha segura para o usuário (mínimo 6 caracteres):');
      if (!newPass) return;
      const res = await apiFetch(\`/api/v1/admin/users/\${id}/password\`, {
        method: 'PATCH',
        body: JSON.stringify({ password: newPass })
      });
      if (res.ok) {
        alert('Senha redefinida com sucesso! Sessões ativas foram revogadas.');
      } else {
        const err = await res.json().catch(() => ({}));
        alert('Erro ao redefinir senha: ' + (err.message || 'Erro'));
      }
    }

    async function toggleUserStatus(id, newStatus) {
      if (!confirm(\`Deseja alterar o status para \${newStatus}?\`)) return;
      const res = await apiFetch(\`/api/v1/admin/users/\${id}/status\`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        loadUsersTable();
      } else {
        const err = await res.json().catch(() => ({}));
        alert('Erro ao alterar status: ' + (err.message || 'Erro'));
      }
    }

    // Initialization
    window.addEventListener('DOMContentLoaded', () => {
      lucide.createIcons();
      initMap();
      const token = getStoredToken();
      if (token) {
        document.getElementById('jwt-input').value = token;
      }
      refreshTrackingData();
      autoRefreshTimer = setInterval(refreshTrackingData, 15000);
    });
  </script>
</body>
</html>`;
  }
}
