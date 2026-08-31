import React from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/CommonComponents';
import {
  DollarSign,
  Receipt,
  Truck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  FileCheck2
} from 'lucide-react';

export const FinanceScreen: React.FC = () => {
  const { fechamentos, resolveDivergence, navigateTo } = useApp();

  const totalPaid = fechamentos
    .filter(f => f.status === 'PAGO')
    .reduce((acc, f) => acc + f.totalNet, 0);

  const pendingSettlement = fechamentos.find(f => f.status !== 'PAGO');

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-5 pb-24">
      <div>
        <h1 className="text-xl font-extrabold text-[#0F2042]">Gestão Financeira</h1>
        <p className="text-xs text-slate-500">
          Fechamentos quinzenais, conciliação de fretes e comprovantes de pagamento via PIX.
        </p>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="bg-[#0F2042] text-white rounded-2xl p-5 shadow-lg border border-blue-950/60">
          <p className="text-xs font-medium text-blue-200/80">Em Conferência (Quinzenal)</p>
          <p className="text-2xl font-black text-white mt-1">
            R$ {(pendingSettlement?.totalNet || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-3 flex items-center justify-between text-xs text-blue-200/80 pt-2 border-t border-blue-900/60">
            <span>Período: {pendingSettlement?.period || 'Atual'}</span>
            <span className="text-orange-400 font-bold">Previsão: 20/08</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pago (Últimos Fechamentos)</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
            <span>{fechamentos.filter(f => f.status === 'PAGO').length} ciclos finalizados</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> PIX Depositado
            </span>
          </div>
        </div>
      </div>

      {/* Fechamentos List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Extratos e Demonstrativos de Pagamento
        </h3>

        {fechamentos.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold block">FECHAMENTO QUINZENAL</span>
                <h4 className="text-base font-extrabold text-[#0F2042]">{item.period}</h4>
              </div>
              <StatusBadge status={item.status} />
            </div>

            {/* Breakdown */}
            <div className="space-y-2 text-xs pt-3 border-t border-slate-100">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>{item.tripsCount} Viagens Concluídas</span>
                <span className="font-bold text-slate-800">
                  R$ {item.tripsValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Reembolso de Pedágios</span>
                <span className="font-bold text-slate-800">
                  + R$ {item.tollsValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Adicionais / Diárias</span>
                <span className="font-bold text-slate-800">
                  + R$ {item.additionalsValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {item.discountsValue > 0 && (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Descontos / Adiantamentos</span>
                  <span className="font-bold">
                    - R$ {item.discountsValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            {/* Total Net */}
            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-xs font-extrabold text-slate-700 uppercase">Valor Líquido a Receber</span>
              <span className="text-lg font-black text-[#0F2042]">
                R$ {item.totalNet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Divergence Card if present */}
            {item.hasDivergence && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs text-rose-900">
                <div className="flex items-center gap-1.5 font-bold text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Divergência Documental Identificada</span>
                </div>
                <p className="text-rose-700 leading-relaxed">{item.divergenceMessage}</p>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      resolveDivergence(item.period);
                      navigateTo('SEND_ROMANEIO');
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                  >
                    <span>Reenviar Romaneio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
