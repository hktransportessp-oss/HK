import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/CommonComponents';
import {
  Search,
  Truck,
  MapPin,
  ArrowRight,
  Calendar,
  DollarSign,
  ChevronRight,
  Package,
  Layers
} from 'lucide-react';

export const TripsScreen: React.FC = () => {
  const { trips, selectTrip } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODAS' | 'EM ANDAMENTO' | 'CONCLUÍDA' | 'PENDENTE'>('TODAS');

  const filteredTrips = trips.filter(trip => {
    const matchesSearch =
      trip.tripCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.originCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destinationCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.operationName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'TODAS' || trip.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-4 pb-24">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-[#0F2042]">Minhas Viagens</h1>
        <p className="text-xs text-slate-500">
          Acompanhe suas rotas, manifestos e ordens de carregamento.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código, cidade ou operação..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2042] shadow-2xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(['TODAS', 'EM ANDAMENTO', 'CONCLUÍDA', 'PENDENTE'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-[#0F2042] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {status === 'TODAS' ? 'Todas as Viagens' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Trips List */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-xs">
          <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Nenhuma viagem encontrada</h3>
          <p className="text-xs text-slate-400 mt-1">Tente ajustar o termo de busca ou filtros.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => selectTrip(trip.id)}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-[#0F2042] hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0F2042] font-mono font-bold text-xs">
                    {trip.tripCode}
                  </span>
                  <span className="text-xs font-medium text-slate-500 truncate max-w-[200px] sm:max-w-none">
                    {trip.operationName}
                  </span>
                </div>
                <StatusBadge status={trip.status} />
              </div>

              {/* Route */}
              <div className="flex items-center justify-between my-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                    <span className="font-extrabold text-sm sm:text-base text-slate-800">
                      {trip.originCity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0F2042] shrink-0" />
                    <span className="font-extrabold text-sm sm:text-base text-slate-800">
                      {trip.destinationCity}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium">Valor Líquido</p>
                  <p className="text-base font-extrabold text-[#0F2042]">
                    R$ {trip.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Specs and Timestamps */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-3">
                  <span>{trip.distanceKm} km</span>
                  <span>•</span>
                  <span>{trip.stopsCount} paradas</span>
                  <span>•</span>
                  <span>{(trip.totalWeightKg / 1000).toFixed(1)} t</span>
                </div>
                <div className="flex items-center gap-1 text-[#0F2042] font-bold group-hover:text-orange-600 transition-colors">
                  <span>Ver Detalhes</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
