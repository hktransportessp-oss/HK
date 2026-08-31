import React from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge, ProgressTimeline } from '../components/CommonComponents';
import { CheckCircle, Clock, FileText, User, ArrowLeft, Home, Building2 } from 'lucide-react';

export const RomaneioStatusScreen: React.FC = () => {
  const { romaneios, selectedRomaneioId, navigateTo, goBack } = useApp();

  const romaneio = romaneios.find(r => r.id === selectedRomaneioId) || romaneios[0];

  if (!romaneio) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-sm font-bold text-slate-600">Nenhum romaneio selecionado.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-4 pb-24">
      <div>
        <h1 className="text-xl font-extrabold text-[#0F2042]">Status do Romaneio</h1>
        <p className="text-xs text-slate-500">
          {romaneio.id} • Enviado em {romaneio.sentDate} às {romaneio.sentTime}
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Resumo do Envio
          </h3>
          <StatusBadge status={romaneio.status} />
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Motorista:</span>
            <span className="font-bold text-slate-800">{romaneio.driver}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Operação:</span>
            <span className="font-bold text-slate-800">{romaneio.operation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Documento Principal:</span>
            <span className="font-bold text-[#0F2042]">{romaneio.fileName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Total de Anexos:</span>
            <span className="font-bold text-slate-800">{romaneio.fileCount} arquivos</span>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <ProgressTimeline currentStep={romaneio.currentStep} />

      {/* Action Button */}
      <button
        onClick={() => navigateTo('HOME')}
        className="w-full py-3.5 px-4 bg-[#0F2042] hover:bg-blue-900 active:bg-slate-900 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide"
      >
        <Home className="w-4 h-4" />
        <span>VOLTAR AO INÍCIO</span>
      </button>
    </div>
  );
};
