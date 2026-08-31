import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  Truck,
  FileCheck2,
  DollarSign,
  Receipt,
  User,
  Bell,
  ArrowLeft,
  ScanLine,
  Layers,
  MapPin
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const { currentScreen, goBack, unreadNotificationsCount, navigateTo, userProfile } = useApp();

  const isSubScreen = [
    'TRIP_DETAIL',
    'TRIP_ROUTE',
    'LINKED_INVOICES',
    'SCAN_INVOICE',
    'ROMANEIO_STATUS',
    'NOTIFICATIONS'
  ].includes(currentScreen);

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'HOME':
        return 'HK Connect';
      case 'TRIPS':
        return 'Minhas Viagens';
      case 'TRIP_DETAIL':
        return 'Detalhes da Viagem';
      case 'TRIP_ROUTE':
        return 'Roteirização Inteligente';
      case 'LINKED_INVOICES':
        return 'Notas Fiscais';
      case 'SCAN_INVOICE':
        return 'Leitor de NF-e';
      case 'SEND_ROMANEIO':
        return 'Enviar Romaneio';
      case 'ROMANEIO_STATUS':
        return 'Status do Romaneio';
      case 'SEND_TOLL':
        return 'Reembolso Pedágio';
      case 'FINANCE':
        return 'Gestão Financeira';
      case 'NOTIFICATIONS':
        return 'Notificações';
      case 'PROFILE':
        return 'Meu Perfil';
      default:
        return 'HK Connect';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0F2042] text-white border-b border-blue-950/60 shadow-md">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isSubScreen ? (
            <button
              onClick={goBack}
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors text-white"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-black text-sm text-white shadow-xs">
              HK
            </div>
          )}

          <div>
            <h1 className="font-bold text-base leading-tight tracking-tight text-white flex items-center gap-2">
              {getScreenTitle()}
              {!isSubScreen && (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" title="Online" />
              )}
            </h1>
            {!isSubScreen && (
              <p className="text-[11px] text-blue-200/80 font-medium">
                {userProfile?.truckPlate || 'HK Transportes'} • {userProfile?.name?.split(' ')[0] || 'Motorista'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Scan action */}
          <button
            onClick={() => navigateTo('SCAN_INVOICE')}
            className="p-2 rounded-full hover:bg-white/10 text-blue-200 hover:text-white transition-colors"
            title="Escanear NF-e"
          >
            <ScanLine className="w-5 h-5" />
          </button>

          {/* Notifications button */}
          <button
            onClick={() => navigateTo('NOTIFICATIONS')}
            className="p-2 rounded-full hover:bg-white/10 text-blue-200 hover:text-white relative transition-colors"
            title="Notificações"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center border-2 border-[#0F2042]">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Profile button */}
          <button
            onClick={() => navigateTo('PROFILE')}
            className="w-8 h-8 rounded-full bg-blue-800/80 border border-blue-400/30 flex items-center justify-center text-xs font-bold text-white hover:ring-2 hover:ring-orange-400 transition-all"
            title="Perfil"
          >
            {userProfile?.name ? userProfile.name.charAt(0) : 'J'}
          </button>
        </div>
      </div>
    </header>
  );
};

export const BottomNavigation: React.FC = () => {
  const { currentScreen, navigateTo } = useApp();

  const navItems = [
    {
      screen: 'HOME' as const,
      label: 'Início',
      icon: Home
    },
    {
      screen: 'TRIPS' as const,
      label: 'Viagens',
      icon: Truck
    },
    {
      screen: 'SEND_ROMANEIO' as const,
      label: 'Romaneio',
      icon: FileCheck2
    },
    {
      screen: 'FINANCE' as const,
      label: 'Financeiro',
      icon: DollarSign
    },
    {
      screen: 'SEND_TOLL' as const,
      label: 'Pedágios',
      icon: Receipt
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg pb-safe">
      <div className="max-w-4xl mx-auto flex items-center justify-around h-16 px-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive =
            currentScreen === item.screen ||
            (item.screen === 'TRIPS' && ['TRIP_DETAIL', 'TRIP_ROUTE', 'LINKED_INVOICES'].includes(currentScreen)) ||
            (item.screen === 'SEND_ROMANEIO' && ['ROMANEIO_STATUS'].includes(currentScreen));

          return (
            <button
              key={item.screen}
              onClick={() => navigateTo(item.screen)}
              className={`flex-1 py-1 flex flex-col items-center justify-center transition-colors relative ${
                isActive ? 'text-[#0F2042] font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-[#0F2042] rounded-full" />
              )}
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-[#0F2042] stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className="text-[11px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
