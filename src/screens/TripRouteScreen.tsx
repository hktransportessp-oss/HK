import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Route,
  Navigation,
  Clock,
  MapPin,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Layers,
  CheckCircle2
} from 'lucide-react';

export const TripRouteScreen: React.FC = () => {
  const { routeData, isLoadingRoute, optimizeRoute, selectedTripId } = useApp();

  const handleOptimize = () => {
    if (selectedTripId) {
      optimizeRoute(selectedTripId);
    }
  };

  const hours = routeData ? Math.floor(routeData.estimatedDurationMinutes / 60) : 0;
  const mins = routeData ? routeData.estimatedDurationMinutes % 60 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-4 pb-24">
      <div>
        <h1 className="text-xl font-extrabold text-[#0F2042]">Roteirização Inteligente HK</h1>
        <p className="text-xs text-slate-500">
          Sequenciamento otimizado de paradas com restrições urbanas e janelas de atendimento.
        </p>
      </div>

      {/* Summary Card */}
      {routeData && (
        <div className="bg-[#0F2042] text-white rounded-2xl p-5 shadow-lg border border-blue-950/60">
          <div className="grid grid-cols-2 gap-4 pb-3 border-b border-blue-900/60">
            <div>
              <p className="text-[11px] font-medium text-blue-200/80">Distância Total Estimada</p>
              <p className="text-xl font-black text-white mt-0.5">{routeData.totalDistanceKm} km</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-blue-200/80">Tempo de Trânsito Estimado</p>
              <p className="text-xl font-black text-orange-400 mt-0.5">{hours}h {mins}min</p>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between text-xs text-blue-200/80">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {routeData.mapsProviderStatus}
            </span>
            <span className="font-semibold">{routeData.stops.length} Paradas</span>
          </div>
        </div>
      )}

      {/* Optimize Action Button */}
      <button
        onClick={handleOptimize}
        disabled={isLoadingRoute}
        className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-600 active:bg-blue-800 disabled:opacity-75 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide"
      >
        <RefreshCw className={`w-4 h-4 ${isLoadingRoute ? 'animate-spin' : ''}`} />
        <span>{isLoadingRoute ? 'CALCULANDO ROTA OTIMIZADA...' : 'OTIMIZAR SEQUÊNCIA DE ENTREGAS'}</span>
      </button>

      {/* Stops Timeline */}
      <div className="space-y-3.5 pt-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Itinerário Sequencial da Viagem
        </h3>

        {!routeData || routeData.stops.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <p className="text-xs text-slate-500 font-medium">Nenhuma parada gerada ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {routeData.stops.map((stop) => (
              <div
                key={stop.deliveryId}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0F2042] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {stop.sequence}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#0F2042]">{stop.customer}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{stop.address}</p>
                      <p className="text-[11px] text-slate-600 font-medium mt-1">
                        Janela: <strong className="text-slate-800">{stop.deliveryWindow}</strong>
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0F2042] font-bold text-xs shrink-0">
                    ETA: {stop.estimatedArrival}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>{stop.volumeCount} volumes • {stop.invoiceCount} NF-es</span>
                  <span>Trecho: {stop.distanceFromPreviousKm} km ({stop.durationFromPreviousMinutes} min)</span>
                </div>

                {/* Restriction warning if present */}
                {stop.warning && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-amber-900 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{stop.warning}</span>
                  </div>
                )}

                {/* GPS Navigate button */}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-[#0F2042] hover:bg-blue-900 active:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Navigation className="w-4 h-4 text-orange-400" />
                  <span>INICIAR NAVEGAÇÃO GPS</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
