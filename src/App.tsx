import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar, BottomNavigation } from './components/Navigation';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { TripsScreen } from './screens/TripsScreen';
import { TripDetailScreen } from './screens/TripDetailScreen';
import { TripRouteScreen } from './screens/TripRouteScreen';
import { LinkedInvoicesScreen } from './screens/LinkedInvoicesScreen';
import { ScanInvoiceScreen } from './screens/ScanInvoiceScreen';
import { SendRomaneioScreen } from './screens/SendRomaneioScreen';
import { RomaneioStatusScreen } from './screens/RomaneioStatusScreen';
import { SendTollScreen } from './screens/SendTollScreen';
import { FinanceScreen } from './screens/FinanceScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { ProfileScreen } from './screens/ProfileScreen';

const MainLayout: React.FC = () => {
  const { currentScreen, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'HOME':
        return <HomeScreen />;
      case 'TRIPS':
        return <TripsScreen />;
      case 'TRIP_DETAIL':
        return <TripDetailScreen />;
      case 'TRIP_ROUTE':
        return <TripRouteScreen />;
      case 'LINKED_INVOICES':
        return <LinkedInvoicesScreen />;
      case 'SCAN_INVOICE':
        return <ScanInvoiceScreen />;
      case 'SEND_ROMANEIO':
        return <SendRomaneioScreen />;
      case 'ROMANEIO_STATUS':
        return <RomaneioStatusScreen />;
      case 'SEND_TOLL':
        return <SendTollScreen />;
      case 'FINANCE':
        return <FinanceScreen />;
      case 'NOTIFICATIONS':
        return <NotificationsScreen />;
      case 'PROFILE':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased flex flex-col selection:bg-orange-500 selection:text-white">
      <TopBar />
      <main className="flex-1 w-full overflow-y-auto">
        {renderScreen()}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
