import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/CommonComponents';
import {
  Truck,
  MapPin,
  ArrowRight,
  Route,
  FileText,
  ScanLine,
  FileCheck2,
  Calendar,
  Weight,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  UserCheck,
  ShieldAlert,
  Camera,
  Navigation
} from 'lucide-react';

export const TripDetailScreen: React.FC = () => {
  const {
    trips,
    selectedTripId,
    deliveries,
    updateTripStatus,
    updateDeliveryStatus,
    navigateTo
  } = useApp();

  const trip = trips.find(t => t.id === selectedTripId) || trips[0];
  const tripDeliveries = trip ? (deliveries[trip.id] || []) : [];

  const [selectedDeliveryForAction, setSelectedDeliveryForAction] = useState<string | null>(null);
  const [proofUrlInput, setProofUrlInput] = useState('');
  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);

  if (!trip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-sm font-bold text-slate-600">Viagem não encontrada.</p>
      </div>
    );
  }

  const handleNextTripStatus = () => {
    if (trip.status === 'PENDENTE') {
      updateTripStatus(trip.id, 'EM ANDAMENTO');
    } else if (trip.status === 'EM ANDAMENTO') {
      updateTripStatus(trip.id, 'CONCLUÍDA');
    }
  };

  const handleConfirmDelivery = (deliveryId: string) => {
    updateDeliveryStatus(
      deliveryId,
      'ENTREGUE',
      proofUrlInput || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&auto=format&fit=crop&q=80'
    );
    setSelectedDeliveryForAction(null);
    setProofUrlInput('');
    setIsConfirmingDelivery(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-5 pb-24">
      {/* Header Info Card */}
      <div className="bg-[#0F2042] text-white rounded-2xl p-5 shadow-lg border border-blue-950/60">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-white/10 text-orange-400 font-mono font-bold text-xs">
              {trip.tripCode}
            </span>
            <span className="text-xs font-medium text-slate-300">
              {trip.operationName}
            </span>
          </div>
          <StatusBadge status={trip.status} />
        </div>

        {/* Route Origin to Destination */}
        <div className="my-4">
          <div className="flex items-center justify-between font-bold text-base sm:text-lg">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
              <span>{trip.originCity}</span>
            </div>
            <ArrowRight className="w-5 h-5 text-blue-300 shrink-0 mx-2" />
            <div className="flex items-center gap-2 text-right">
              <span>{trip.destinationCity}</span>
            </div>
          </div>
        </div>

        {/* Trip Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-blue-900/60 text-xs">
          <div>
            <span className="text-blue-300/80 block text-[11px]">Distância</span>
            <span className="font-bold text-white">{trip.distanceKm} km</span>
          </div>
          <div>
            <span className="text-blue-300/80 block text-[11px]">Peso Total</span>
            <span className="font-bold text-white">{(trip.totalWeightKg / 1000).toFixed(1)} toneladas</span>
          </div>
          <div>
            <span className="text-blue-300/80 block text-[11px]">Saída Prevista</span>
            <span className="font-bold text-white">{trip.departureDate}</span>
          </div>
          <div>
            <span className="text-blue-300/80 block text-[11px]">Valor do Frete</span>
            <span className="font-bold text-orange-400">
              R$ {trip.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Trip Action Button */}
        <div className="mt-4 pt-3 border-t border-blue-900/60 flex items-center justify-between">
          <p className="text-xs text-blue-200/80">
            Status Operacional da Carga
          </p>
          {trip.status !== 'CONCLUÍDA' ? (
            <button
              onClick={handleNextTripStatus}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              {trip.status === 'PENDENTE' ? 'INICIAR VIAGEM' : 'FINALIZAR VIAGEM'}
            </button>
          ) : (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Viagem Finalizada
            </span>
          )}
        </div>
      </div>

      {/* Operational Actions 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigateTo('TRIP_ROUTE', { tripId: trip.id })}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#0F2042] hover:shadow-md transition-all text-left flex items-start justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0F2042] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Route className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Roteirização Inteligente</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Otimizar paradas e GPS</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0F2042] transition-colors" />
        </button>

        <button
          onClick={() => navigateTo('LINKED_INVOICES', { tripId: trip.id })}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#0F2042] hover:shadow-md transition-all text-left flex items-start justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Notas Fiscais</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">{trip.linkedInvoicesCount} NF-es Vinculadas</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 transition-colors" />
        </button>

        <button
          onClick={() => navigateTo('SCAN_INVOICE')}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-orange-300 hover:shadow-md transition-all text-left flex items-start justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <ScanLine className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Escanear NF-e</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Leitor de Chave 44 dígitos</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-600 transition-colors" />
        </button>

        <button
          onClick={() => navigateTo('SEND_ROMANEIO')}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all text-left flex items-start justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Enviar Romaneio</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Auditoria e Canhotos</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-700 transition-colors" />
        </button>
      </div>

      {/* Deliveries Sequence List */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Sequência de Entregas ({tripDeliveries.length} Paradas)
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {tripDeliveries.filter(d => d.status === 'ENTREGUE').length} de {tripDeliveries.length} concluídas
          </span>
        </div>

        <div className="space-y-3">
          {tripDeliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0F2042] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {delivery.sequence}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{delivery.customerName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{delivery.address}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium mt-1">
                      <span>Janela: {delivery.deliveryWindow}</span>
                      <span>•</span>
                      <span>{delivery.volumeCount} volumes</span>
                      <span>•</span>
                      <span>{delivery.invoicesCount} NF-es</span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={delivery.status} />
              </div>

              {/* Delivery Action Buttons */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(delivery.address + ' ' + delivery.city)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0F2042] hover:text-blue-900 px-2 py-1 rounded-lg hover:bg-slate-200/60 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-orange-500" />
                  <span>GPS Maps</span>
                </a>

                {delivery.status !== 'ENTREGUE' ? (
                  <button
                    onClick={() => {
                      setSelectedDeliveryForAction(delivery.id);
                      setIsConfirmingDelivery(true);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Confirmar Entrega</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Canhoto Registrado
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal for Delivery Proof */}
      {isConfirmingDelivery && selectedDeliveryForAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle className="w-6 h-6" />
              <h3 className="text-base font-extrabold text-[#0F2042]">Confirmar Entrega</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Capture uma foto nítida do canhoto assinado ou anexe o comprovante com carimbo do recebedor:
            </p>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50">
              <Camera className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-700">Foto do Canhoto Assinado</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Simulação de captura em alta resolução</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingDelivery(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelivery(selectedDeliveryForAction)}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                Salvar e Baixar Entrega
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
