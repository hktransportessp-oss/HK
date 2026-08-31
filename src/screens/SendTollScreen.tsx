import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/CommonComponents';
import {
  Receipt,
  UploadCloud,
  DollarSign,
  MapPin,
  Calendar,
  Send,
  Loader2,
  CheckCircle2,
  Camera,
  Layers
} from 'lucide-react';

export const SendTollScreen: React.FC = () => {
  const { tolls, submitToll, trips, selectedTripId } = useApp();
  const [valueInput, setValueInput] = useState('48.50');
  const [plazaInput, setPlazaInput] = useState('Praça Itapecerica da Serra KM 298');
  const [highwayInput, setHighwayInput] = useState('BR-116 Régis Bittencourt');
  const [notesInput, setNotesInput] = useState('Cabine manual sem TAG');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedVal = parseFloat(valueInput.replace(',', '.'));
    if (isNaN(parsedVal) || parsedVal <= 0) {
      alert('Informe um valor válido para o pedágio.');
      return;
    }

    setIsSubmitting(true);
    await submitToll(parsedVal, notesInput, plazaInput);
    setIsSubmitting(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-5 pb-24">
      <div>
        <h1 className="text-xl font-extrabold text-[#0F2042]">Reembolso de Pedágio</h1>
        <p className="text-xs text-slate-500">
          Envie os comprovantes fiscais das praças de pedágio para inclusão no próximo fechamento.
        </p>
      </div>

      {showSuccessToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-scaleUp">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Comprovante de pedágio cadastrado e encaminhado para auditoria!</span>
        </div>
      )}

      {/* New Toll Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Cadastrar Novo Recibo
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Valor Pago (R$)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                R$
              </div>
              <input
                type="text"
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                placeholder="0,00"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2042]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Praça / KM
            </label>
            <input
              type="text"
              value={plazaInput}
              onChange={(e) => setPlazaInput(e.target.value)}
              placeholder="Ex: Praça KM 377"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2042]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Rodovia
          </label>
          <input
            type="text"
            value={highwayInput}
            onChange={(e) => setHighwayInput(e.target.value)}
            placeholder="Ex: BR-116 Régis Bittencourt"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2042]"
          />
        </div>

        {/* Attachment Card */}
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
          <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
          <p className="text-xs font-bold text-slate-700">Foto do Recibo / Cupom Fiscal</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Clique para capturar foto legível</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Observações
          </label>
          <input
            type="text"
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            placeholder="Ex: Cabine manual sem TAG"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2042]"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 disabled:opacity-75 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>ENVIANDO RECIBO...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>ENVIAR COMPROVANTE DE PEDÁGIO</span>
            </>
          )}
        </button>
      </form>

      {/* Toll History List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Histórico de Reembolsos
        </h3>

        {tolls.map((toll) => (
          <div
            key={toll.id}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-800">{toll.plaza}</h4>
                <p className="text-[11px] text-slate-500">{toll.highway} • {toll.date}</p>
                <p className="text-[10px] text-slate-400">{toll.tripRef}</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-sm font-extrabold text-[#0F2042]">
                R$ {toll.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-1">
                <StatusBadge status={toll.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
