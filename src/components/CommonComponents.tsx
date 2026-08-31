import React from 'react';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Truck,
  ShieldCheck,
  DollarSign,
  ChevronRight
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const norm = status.toUpperCase().trim();

  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let icon = <Clock className="w-3.5 h-3.5" />;

  if (norm.includes('CONCLU') || norm.includes('APROV') || norm.includes('PAGO') || norm.includes('ENTREG')) {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    icon = <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
  } else if (norm.includes('ANDAMENTO') || norm.includes('TRÂNSITO') || norm.includes('TRANSITO') || norm.includes('CAMINHO')) {
    bg = 'bg-blue-50 text-blue-700 border-blue-200';
    icon = <Truck className="w-3.5 h-3.5 text-blue-600" />;
  } else if (norm.includes('ANÁLISE') || norm.includes('ANALISE') || norm.includes('PROCESS') || norm.includes('CONFER')) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
    icon = <Clock className="w-3.5 h-3.5 text-amber-600" />;
  } else if (norm.includes('DIVERG') || norm.includes('RECUS') || norm.includes('ERRO') || norm.includes('PENDÊNCIA')) {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
  } else if (norm.includes('PENDENTE')) {
    bg = 'bg-slate-100 text-slate-600 border-slate-200';
    icon = <Clock className="w-3.5 h-3.5 text-slate-500" />;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${bg} ${className}`}
    >
      {icon}
      <span>{status}</span>
    </span>
  );
};

interface ProgressTimelineProps {
  currentStep: number;
}

export const ProgressTimeline: React.FC<ProgressTimelineProps> = ({ currentStep }) => {
  const steps = [
    { title: 'Envio Realizado', subtitle: 'Comprovantes recebidos no sistema' },
    { title: 'Processamento OCR', subtitle: 'Leitura automática e validação de chaves NF-e' },
    { title: 'Auditoria HK', subtitle: 'Conferência física e fiscal pela equipe' },
    { title: 'Integrado ao Fechamento', subtitle: 'Liberado para pagamento quinzenal' }
  ];

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
        Fluxo de Auditoria e Aprovação
      </h3>
      <div className="space-y-4">
        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isDone = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isPending = stepNumber > currentStep;

          return (
            <div key={idx} className="flex items-start gap-3 relative">
              {idx < steps.length - 1 && (
                <div
                  className={`absolute left-4 top-8 bottom-0 w-0.5 -ml-px ${
                    isDone ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                  style={{ height: 'calc(100% - 10px)' }}
                />
              )}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 font-bold text-xs transition-colors ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-[#0F2042] text-white ring-4 ring-blue-100'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isDone ? <CheckCircle className="w-4 h-4" /> : stepNumber}
              </div>
              <div className="pt-0.5 pb-2">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-bold ${
                      isCurrent
                        ? 'text-[#0F2042]'
                        : isDone
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      EM ANDAMENTO
                    </span>
                  )}
                  {isDone && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      CONCLUÍDO
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{step.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
