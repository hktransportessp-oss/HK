import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  UploadCloud,
  FileText,
  Trash2,
  Send,
  Loader2,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  User,
  Truck
} from 'lucide-react';

export const SendRomaneioScreen: React.FC = () => {
  const { userProfile, submitRomaneio, navigateTo } = useApp();
  const [notes, setNotes] = useState('Conferido sem avarias no descarregamento.');
  const [filesAttached, setFilesAttached] = useState<string[]>(['doc_cte_9823.pdf', 'canhoto_nfe_4892.jpg']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const docPhotoUrl =
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&auto=format&fit=crop&q=80';

  const handleAddAttachment = () => {
    const nextNum = filesAttached.length + 1;
    setFilesAttached([...filesAttached, `comprovante_${nextNum}.jpg`]);
  };

  const handleRemoveAttachment = (index: number) => {
    setFilesAttached(filesAttached.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (filesAttached.length === 0) {
      alert('Anexe pelo menos um comprovante ou foto do canhoto.');
      return;
    }

    setIsSubmitting(true);
    const newRom = await submitRomaneio(notes, filesAttached);
    setIsSubmitting(false);
    navigateTo('ROMANEIO_STATUS', { romaneioId: newRom.id });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-4 pb-24">
      <div>
        <h1 className="text-xl font-extrabold text-[#0F2042]">Enviar Romaneio</h1>
        <p className="text-xs text-slate-500">
          Tire fotos legíveis dos canhotos das notas para processamento e conferência automática.
        </p>
      </div>

      {/* Driver Data Prefilled Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Dados do Motorista e Veículo
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0F2042] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#0F2042]">{userProfile?.name}</h4>
              <p className="text-xs text-slate-500">{userProfile?.truckPlate} • {userProfile?.truckModel}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            ATIVO
          </span>
        </div>
      </div>

      {/* Upload Attachment Box */}
      <div
        onClick={handleAddAttachment}
        className="bg-white rounded-2xl p-6 border-2 border-dashed border-slate-300 hover:border-orange-500 transition-colors cursor-pointer text-center shadow-xs group"
      >
        <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
          <UploadCloud className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-extrabold text-[#0F2042]">
          Tire uma foto ou selecione o arquivo PDF
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Formatos aceitos: JPG, PNG, PDF (Máx. 15MB por arquivo)
        </p>
        <div className="mt-3 flex justify-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
            <Camera className="w-3.5 h-3.5" /> Tirar Foto
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
            <FileText className="w-3.5 h-3.5" /> Anexar PDF
          </span>
        </div>
      </div>

      {/* Attached Files List */}
      {filesAttached.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Documentos Anexados ({filesAttached.length})
          </h3>

          <div className="space-y-2">
            {filesAttached.map((fileName, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                    <img
                      src={docPhotoUrl}
                      alt="Doc preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[200px] sm:max-w-md">
                      {fileName}
                    </p>
                    <p className="text-[10px] text-slate-400">2.4 MB • Anexado agora</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(idx)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                  title="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes Field */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
          Observações da Entrega (Opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Informe detalhes como reentrega, avaria ou canhoto faltante..."
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2042]"
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 disabled:opacity-75 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>ENVIANDO PARA A AUDITORIA...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>ENVIAR PARA CONFERÊNCIA</span>
          </>
        )}
      </button>
    </div>
  );
};
