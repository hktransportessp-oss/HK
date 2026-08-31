import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  DollarSign,
  FileCheck2,
  Check
} from 'lucide-react';

export const NotificationsScreen: React.FC = () => {
  const { notifications, markNotificationRead } = useApp();

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'PROCESSADO':
        return <FileCheck2 className="w-5 h-5 text-blue-600" />;
      case 'DIVERGÊNCIA':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'APROVADO':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'PAGO':
        return <DollarSign className="w-5 h-5 text-indigo-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getNotifBg = (type: string) => {
    switch (type) {
      case 'PROCESSADO':
        return 'bg-blue-50';
      case 'DIVERGÊNCIA':
        return 'bg-rose-50';
      case 'APROVADO':
        return 'bg-emerald-50';
      case 'PAGO':
        return 'bg-indigo-50';
      default:
        return 'bg-slate-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-4 pb-24">
      <div>
        <h1 className="text-xl font-extrabold text-[#0F2042]">Central de Notificações</h1>
        <p className="text-xs text-slate-500">
          Atualizações de romaneios, status de fretes e avisos da central HK.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700">Nenhuma notificação no momento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                notif.read
                  ? 'bg-white border-slate-200/80'
                  : 'bg-white border-orange-200 shadow-xs ring-1 ring-orange-200/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${getNotifBg(notif.type)} shrink-0 mt-0.5`}>
                  {getNotifIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {notif.timeLabel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-700">
                      {notif.valueText}: {notif.valueLabel}
                    </span>

                    {!notif.read && (
                      <span className="text-[10px] font-bold text-orange-600 flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        Nova mensagem
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
