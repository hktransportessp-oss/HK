import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Truck,
  Phone,
  Shield,
  LogOut,
  Settings,
  Headphones,
  FileCheck2,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { userProfile, logout, serverUrl, updateServerUrl } = useApp();
  const [showServerDialog, setShowServerDialog] = useState(false);
  const [editedUrl, setEditedUrl] = useState(serverUrl);

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-5 pb-24">
      <div>
        <h1 className="text-xl font-extrabold text-[#0F2042]">Meu Perfil</h1>
        <p className="text-xs text-slate-500">
          Dados cadastrais, veículo vinculado e suporte operacional HK.
        </p>
      </div>

      {/* Driver Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs text-center relative overflow-hidden">
        <div className="w-20 h-20 rounded-2xl bg-[#0F2042] text-white flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow-md">
          {userProfile?.name ? userProfile.name.charAt(0) : 'J'}
        </div>
        <h2 className="text-lg font-black text-[#0F2042]">{userProfile?.name}</h2>
        <p className="text-xs text-slate-500 font-medium">{userProfile?.role}</p>

        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Cadastro Ativo e Homologado</span>
        </div>
      </div>

      {/* Driver Data & Vehicle */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3 text-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Informações Pessoais e Veículo
        </h3>

        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <div className="flex justify-between py-1">
            <span className="text-slate-500 font-medium">CPF:</span>
            <span className="font-bold text-slate-800 font-mono">{userProfile?.cpf}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500 font-medium">Telefone / Contato:</span>
            <span className="font-bold text-slate-800">{userProfile?.phone}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500 font-medium">Placa do Veículo:</span>
            <span className="font-bold text-[#0F2042] font-mono bg-blue-50 px-2 py-0.5 rounded">
              {userProfile?.truckPlate}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500 font-medium">Modelo do Veículo:</span>
            <span className="font-bold text-slate-800">{userProfile?.truckModel}</span>
          </div>
        </div>
      </div>

      {/* Operational Support HK */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Central de Suporte Operacional
        </h3>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <a
            href="https://api.whatsapp.com/send?phone=5511999999999&text=Ol%C3%A1%2C%20preciso%20de%20suporte%20na%20minha%20viagem%20pela%20HK."
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Headphones className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">WhatsApp Torre de Controle HK</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>

          <button
            onClick={() => {
              setEditedUrl(serverUrl);
              setShowServerDialog(true);
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">Configuração de Servidor API</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {serverUrl.replace(/https?:\/\//, '').slice(0, 20)}...
            </span>
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full py-3.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
      >
        <LogOut className="w-4 h-4" />
        <span>SAIR DO APLICATIVO</span>
      </button>

      {/* Server Dialog Modal */}
      {showServerDialog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#0F2042]">Configurar URL do Backend</h3>
            <input
              type="text"
              value={editedUrl}
              onChange={(e) => setEditedUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#0F2042]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowServerDialog(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  updateServerUrl(editedUrl.trim());
                  setShowServerDialog(false);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0F2042] hover:bg-blue-900 rounded-lg"
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
