import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, User, Settings, AlertCircle, Check, Loader2 } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, serverUrl, updateServerUrl } = useApp();
  const [cpf, setCpf] = useState('342.891.028-44');
  const [password, setPassword] = useState('123456');
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showServerModal, setShowServerModal] = useState(false);
  const [editedServerUrl, setEditedServerUrl] = useState(serverUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpf.trim()) {
      setErrorMessage('Informe seu CPF ou telefone para continuar.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Informe sua senha de acesso.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    const result = await login(cpf, password, remember);
    setIsLoading(false);
    if (!result.success) {
      setErrorMessage(result.error || 'Não foi possível realizar o login.');
    }
  };

  const formatCpf = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    if (raw.length <= 3) return raw;
    if (raw.length <= 6) return `${raw.slice(0, 3)}.${raw.slice(3)}`;
    if (raw.length <= 9) return `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}`;
    return `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9, 11)}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-950">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-100 relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-[#0F2042] flex flex-col items-center justify-center shadow-lg border border-blue-900/40 mb-3 text-white">
            <span className="text-2xl font-black tracking-tighter text-orange-500">HK</span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-300">Transportes</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2042] tracking-tight">HK Connect</h1>
          <p className="text-sm text-slate-500 font-medium">Acesso Exclusivo do Motorista</p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs sm:text-sm font-medium animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              CPF ou Telefone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                placeholder="000.000.000-00"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2042] focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2042] focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-medium pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded text-[#0F2042] focus:ring-[#0F2042] border-slate-300"
              />
              <span>Lembrar acesso</span>
            </label>
            <button
              type="button"
              onClick={() => setErrorMessage('Para redefinir sua senha, solicite ao suporte operacional da HK.')}
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              Esqueci a senha
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 disabled:opacity-75 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm tracking-wide"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AUTENTICANDO...</span>
              </>
            ) : (
              <span>ENTRAR NO SISTEMA</span>
            )}
          </button>
        </form>

        {/* Server Endpoint Config */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center">
          <button
            type="button"
            onClick={() => {
              setEditedServerUrl(serverUrl);
              setShowServerModal(true);
            }}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Servidor: {serverUrl.replace(/https?:\/\//, '').replace(/\/$/, '')}</span>
          </button>
        </div>
      </div>

      {/* Server Dialog Modal */}
      {showServerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-base font-bold text-[#0F2042] mb-2">Endpoint da API REST</h3>
            <p className="text-xs text-slate-500 mb-4">
              Informe a URL do servidor backend para homologação ou produção:
            </p>
            <input
              type="text"
              value={editedServerUrl}
              onChange={(e) => setEditedServerUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 mb-4 focus:ring-2 focus:ring-[#0F2042] focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowServerModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  updateServerUrl(editedServerUrl.trim());
                  setShowServerModal(false);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0F2042] hover:bg-blue-900 rounded-lg shadow-xs"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
