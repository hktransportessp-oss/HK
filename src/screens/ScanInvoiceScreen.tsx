import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  ScanLine,
  Camera,
  CheckCircle,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPin,
  Barcode
} from 'lucide-react';

export const ScanInvoiceScreen: React.FC = () => {
  const { selectedTripId, linkScannedInvoice, navigateTo, goBack } = useApp();
  const [accessKeyInput, setAccessKeyInput] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannedResult, setScannedResult] = useState<{
    number: string;
    key: string;
    recipient: string;
    city: string;
    value: number;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Try opening real camera if permitted, or fallback to interactive scanning simulation
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (cameraActive) {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          // Camera not available in this container environment - simulate gracefully
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraActive]);

  const handleSimulateScan = () => {
    const sampleKey = '35231012345678000199550010008967401234567896';
    setAccessKeyInput(sampleKey);
    parseKey(sampleKey);
  };

  const parseKey = (key: string) => {
    const clean = key.replace(/\D/g, '');
    if (clean.length === 44) {
      const lastDigits = clean.slice(-8);
      setScannedResult({
        number: `NF-e 004.${lastDigits.slice(0, 3)}.${lastDigits.slice(3, 6)}`,
        key: clean,
        recipient: 'Atacado Distribuidor Sul Log',
        city: 'Curitiba - PR',
        value: 23750.00
      });
    } else {
      setScannedResult(null);
    }
  };

  const handleManualKeyChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 44);
    setAccessKeyInput(clean);
    parseKey(clean);
  };

  const handleConfirmLink = () => {
    if (!scannedResult) return;
    linkScannedInvoice(scannedResult.key, selectedTripId || 'TRIP-4992');
    setSuccessMessage(true);
    setTimeout(() => {
      navigateTo('LINKED_INVOICES', { tripId: selectedTripId || 'TRIP-4992' });
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-4 pb-24">
      <div>
        <h1 className="text-xl font-extrabold text-[#0F2042]">Leitor de Código de Barras / QR</h1>
        <p className="text-xs text-slate-500">
          Aponte a câmera para a DANFE ou digite os 44 dígitos da Chave de Acesso.
        </p>
      </div>

      {/* Scanner Viewport Box */}
      <div className="relative w-full aspect-4/3 sm:aspect-16/9 bg-slate-950 rounded-2xl overflow-hidden shadow-xl border-2 border-slate-800 flex flex-col items-center justify-center p-4">
        {cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-b from-slate-900 via-[#0F2042] to-slate-950 flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-3 text-orange-400">
              <Camera className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-white">Scanner de Alta Precisão HK</p>
            <p className="text-xs text-slate-300 max-w-xs mt-1">
              Posicione o código de barras 128C ou QR Code da NF-e no centro da moldura.
            </p>
          </div>
        )}

        {/* Viewfinder Reticle Overlay */}
        <div className="relative z-10 w-64 sm:w-80 h-32 sm:h-40 border-2 border-orange-500/80 rounded-xl flex items-center justify-center pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
          {/* Laser animation */}
          <div className="w-full h-0.5 bg-orange-400 shadow-[0_0_8px_#f97316] animate-pulse" />
          <div className="absolute -top-6 text-[11px] font-bold text-orange-400 tracking-wider uppercase">
            Área de Enquadramento
          </div>
        </div>

        {/* Action button on bottom of viewfinder */}
        <div className="absolute bottom-4 z-20 flex gap-2">
          <button
            type="button"
            onClick={handleSimulateScan}
            className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-lg text-xs font-bold shadow-lg transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simular Leitura Instantânea</span>
          </button>
        </div>
      </div>

      {/* Manual 44 digits input */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Ou Digite a Chave de Acesso (44 dígitos)
        </h3>

        <div className="relative">
          <input
            type="text"
            value={accessKeyInput}
            onChange={(e) => handleManualKeyChange(e.target.value)}
            placeholder="Ex: 3523 1012 3456 7800 0199 5500 1000 8967 4012 3456 7896"
            className="w-full p-3 font-mono text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2042]"
            maxLength={44}
          />
          <span className="absolute right-3 top-3 text-[11px] font-bold text-slate-400">
            {accessKeyInput.length}/44
          </span>
        </div>
      </div>

      {/* Scanned Result Confirmation Card */}
      {scannedResult && (
        <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500 shadow-md space-y-4 animate-scaleUp">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle className="w-5 h-5" />
              <h3 className="text-sm font-extrabold">NF-e Identificada com Sucesso</h3>
            </div>
            <span className="text-xs font-bold text-[#0F2042]">{scannedResult.number}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
            <div>
              <p className="text-slate-400 font-medium">Destinatário</p>
              <p className="font-bold text-slate-800 mt-0.5">{scannedResult.recipient}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Destino</p>
              <p className="font-bold text-slate-800 mt-0.5">{scannedResult.city}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Valor Total da Nota</p>
              <p className="font-extrabold text-emerald-700 mt-0.5">
                R$ {scannedResult.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Viagem de Vínculo</p>
              <p className="font-bold text-[#0F2042] mt-0.5">#{selectedTripId?.replace('TRIP-', '') || '4992'}</p>
            </div>
          </div>

          {successMessage ? (
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold text-center">
              Nota fiscal vinculada à viagem com sucesso! Redirecionando...
            </div>
          ) : (
            <button
              onClick={handleConfirmLink}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>CONFIRMAR E VINCULAR À VIAGEM</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
