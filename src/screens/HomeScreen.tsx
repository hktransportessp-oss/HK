import React from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/CommonComponents';
import {
  Truck,
  ScanLine,
  FileCheck2,
  Receipt,
  DollarSign,
  MapPin,
  ArrowRight,
  Route,
  FileText,
  AlertTriangle,
  ChevronRight,
  Clock,
  ShieldCheck,
  Building2,
  Package
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    userProfile,
    trips,
    deliveries,
    fechamentos,
    notifications,
    navigateTo,
    selectTrip
  } = useApp();

  const activeTrip = trips.find(t => t.status === 'EM ANDAMENTO') || trips[0];
  const activeDeliveries = activeTrip ? (deliveries[activeTrip.id] || []) : [];
  const completedStops = activeDeliveries.filter(d => d.status === 'ENTREGUE').length;
  const currentFechamento = fechamentos.find(f => f.hasDivergence) || fechamentos[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-5 pb-24">
      {/* Driver Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-900/10 border border-blue-900/20 flex items-center justify-center font-black text-lg text-[#0F2042]">
            {userProfile?.name ? userProfile.name.charAt(0) : 'J'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#0F2042]">{userProfile?.name}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ATIVO
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {userProfile?.truckPlate} • {userProfile?.truckModel}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigateTo('PROFILE')}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          title="Ver perfil"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Divergence Alert if present */}
      {currentFechamento?.hasDivergence && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-rose-900">Pendência Documental</h3>
              <span className="text-xs font-semibold text-rose-700">{currentFechamento.period}</span>
            </div>
            <p className="text-xs text-rose-800 mt-1 leading-relaxed">
              {currentFechamento.divergenceMessage}
            </p>
            <button
              onClick={() => navigateTo('SEND_ROMANEIO')}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <span>Reenviar Comprovante</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Active Trip Spotlight Card */}
      {activeTrip && (
        <div className="bg-[#0F2042] text-white rounded-2xl p-5 shadow-lg border border-blue-950/60 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-mono font-bold tracking-wider text-orange-400">
                {activeTrip.tripCode}
              </span>
              <span className="text-xs font-medium text-slate-300">
                {activeTrip.operationName}
              </span>
            </div>
            <StatusBadge status={activeTrip.status} />
          </div>

          {/* Route origin to destination */}
          <div className="my-4">
            <div className="flex items-center justify-between font-bold text-base sm:text-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                <span>{activeTrip.originCity}</span>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-300 shrink-0 mx-2" />
              <div className="flex items-center gap-2 text-right">
                <span>{activeTrip.destinationCity}</span>
              </div>
            </div>
            <p className="text-xs text-blue-200/80 mt-1 flex items-center gap-3">
              <span>Distância: {activeTrip.distanceKm} km</span>
              <span>•</span>
              <span>{activeTrip.stopsCount} paradas ({completedStops}/{activeDeliveries.length} entregues)</span>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-blue-950/80 rounded-full h-2 my-3 overflow-hidden border border-blue-900">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${activeDeliveries.length ? (completedStops / activeDeliveries.length) * 100 : 35}%`
              }}
            />
          </div>

          {/* Quick Action buttons on trip */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-blue-900/60">
            <button
              onClick={() => selectTrip(activeTrip.id)}
              className="py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5 text-orange-400" />
              <span className="truncate">Detalhes</span>
            </button>
            <button
              onClick={() => {
                selectTrip(activeTrip.id);
                navigateTo('TRIP_ROUTE', { tripId: activeTrip.id });
              }}
              className="py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <Route className="w-3.5 h-3.5 text-blue-300" />
              <span className="truncate">Roteirizar</span>
            </button>
            <button
              onClick={() => {
                selectTrip(activeTrip.id);
                navigateTo('LINKED_INVOICES', { tripId: activeTrip.id });
              }}
              className="py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate">Notas ({activeTrip.linkedInvoicesCount})</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Action Grid */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Ações Rápidas do Motorista
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigateTo('SCAN_INVOICE')}
            className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-orange-300 hover:shadow-md active:bg-slate-50 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <ScanLine className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800">Escanear NF-e</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Leitor de Chave/QR</span>
          </button>

          <button
            onClick={() => navigateTo('SEND_ROMANEIO')}
            className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md active:bg-slate-50 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800">Enviar Romaneio</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Fotos dos Canhotos</span>
          </button>

          <button
            onClick={() => navigateTo('SEND_TOLL')}
            className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md active:bg-slate-50 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Receipt className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800">Pedágios</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Reembolso Fácil</span>
          </button>

          <button
            onClick={() => navigateTo('FINANCE')}
            className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md active:bg-slate-50 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800">Financeiro</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Fechamento & PIX</span>
          </button>
        </div>
      </div>

      {/* Deliveries Ticker for Current Trip */}
      {activeDeliveries.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Próximas Entregas ({activeDeliveries.length})
            </h3>
            <button
              onClick={() => selectTrip(activeTrip.id)}
              className="text-xs font-bold text-[#0F2042] hover:text-orange-600 transition-colors"
            >
              Ver Todas
            </button>
          </div>

          <div className="space-y-3">
            {activeDeliveries.slice(0, 3).map((delivery) => (
              <div
                key={delivery.id}
                onClick={() => selectTrip(activeTrip.id)}
                className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 transition-colors cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#0F2042] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {delivery.sequence}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{delivery.customerName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{delivery.address}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <StatusBadge status={delivery.status} />
                  <p className="text-[10px] text-slate-400 font-medium mt-1">ETA: {delivery.estimatedTime}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Notifications Widget */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Avisos Operacionais
            </h3>
            <button
              onClick={() => navigateTo('NOTIFICATIONS')}
              className="text-xs font-bold text-[#0F2042] hover:text-orange-600 transition-colors"
            >
              Central Completa
            </button>
          </div>

          <div className="space-y-2.5">
            {notifications.slice(0, 2).map((notif) => (
              <div
                key={notif.id}
                onClick={() => navigateTo('NOTIFICATIONS')}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors cursor-pointer flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-blue-100 text-blue-800 mt-0.5 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-800 truncate">{notif.title}</p>
                    <span className="text-[10px] text-slate-400 shrink-0">{notif.timeLabel}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
