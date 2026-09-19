import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, ShieldCheck, Truck, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const pendingStatuses = new Set([
  'AGUARDANDO_LIBERACAO',
  'LIBERACAO_PENDENTE',
  'ERRO_LIBERACAO'
]);

export const AdminPendingTripsScreen: React.FC = () => {
  const { userProfile, trips, releaseTripManually } = useApp();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const normalizedRole = userProfile?.role.toUpperCase() || '';
  const canAccess = normalizedRole.includes('ADMIN') || normalizedRole.includes('OPER');
  const pendingTrips = useMemo(
    () => trips.filter(trip => pendingStatuses.has(trip.clearanceStatus)),
    [trips]
  );

  const selectedTrip = trips.find(trip => trip.id === selectedTripId);

  const submitManualRelease = () => {
    if (!selectedTrip || !reason.trim()) {
      setError('Informe uma justificativa para a liberação.');
      return;
    }

    if (releaseTripManually(selectedTrip.id, reason)) {
      setSelectedTripId(null);
      setReason('');
      setError('');
    } else {
      setError('Seu perfil não possui permissão para liberar viagens.');
    }
  };

  if (!canAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <ShieldCheck className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h1 className="text-lg font-extrabold text-slate-900">Acesso restrito</h1>
        <p className="text-sm text-slate-500 mt-1">Esta área é exclusiva para administradores e operação.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 space-y-5 pb-24">
      <div>
        <h1 className="text-xl font-extrabold text-[#0F2042]">Viagens Pendentes</h1>
        <p className="text-xs text-slate-500 mt-1">
          Liberação operacional com justificativa e registro do responsável.
        </p>
      </div>

      {pendingTrips.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">Nenhuma viagem pendente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingTrips.map(trip => (
            <div key={trip.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#0F2042]" />
                    <h2 className="text-sm font-extrabold text-slate-900">{trip.tripCode} · {trip.operationName}</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{trip.originCity} → {trip.destinationCity}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-bold text-amber-800">
                  <Clock className="w-3.5 h-3.5" /> {trip.clearanceStatus.replaceAll('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                <div><span className="block text-slate-400">Motorista</span><strong>{trip.driverName}</strong></div>
                <div><span className="block text-slate-400">Veículo</span><strong>{trip.truckPlate}</strong></div>
                <div><span className="block text-slate-400">Romaneio</span><strong>{trip.linkedInvoicesCount} NF-es</strong></div>
                <div><span className="block text-slate-400">Última tentativa</span><strong>{trip.clearanceUpdatedAt || 'Não registrada'}</strong></div>
              </div>

              {trip.clearanceStatus === 'ERRO_LIBERACAO' && (
                <p className="flex items-center gap-1.5 text-xs text-rose-700 mt-3">
                  <AlertTriangle className="w-3.5 h-3.5" /> A liberação automática retornou erro.
                </p>
              )}

              <button
                onClick={() => setSelectedTripId(trip.id)}
                className="mt-4 w-full sm:w-auto px-4 py-2 bg-[#0F2042] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Liberar viagem
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedTrip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#0F2042]">Liberar viagem</h2>
                <p className="text-xs text-slate-500 mt-1">{selectedTrip.tripCode} · {selectedTrip.driverName}</p>
              </div>
              <button onClick={() => setSelectedTripId(null)} className="p-1.5 text-slate-400 hover:text-slate-700" title="Fechar">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
              Esta ação será registrada como <strong>liberação manual</strong>. Ela não altera a resposta original da AverbePorto.
            </div>

            <label className="block text-xs font-bold text-slate-700">
              Justificativa obrigatória
              <textarea
                value={reason}
                onChange={event => setReason(event.target.value)}
                rows={4}
                className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 text-sm font-normal outline-none focus:border-[#0F2042] focus:ring-2 focus:ring-blue-100"
                placeholder="Informe por que a operação foi liberada manualmente..."
              />
            </label>

            {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <button onClick={() => setSelectedTripId(null)} className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">
                Cancelar
              </button>
              <button onClick={submitManualRelease} className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">
                Confirmar liberação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};