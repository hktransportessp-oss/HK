import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ScreenType,
  UserProfile,
  Trip,
  Delivery,
  Invoice,
  Romaneio,
  TollReceipt,
  Fechamento,
  NotificationItem,
  RouteOptimization
} from '../types';
import {
  initialUserProfile,
  initialTrips,
  initialDeliveries,
  initialInvoices,
  initialRomaneios,
  initialTolls,
  initialFechamentos,
  initialNotifications,
  defaultRouteData
} from '../data/mockData';
import { api, getAuthToken, clearAuthToken, getServerUrl, setServerUrl } from '../services/api';

interface AppContextType {
  currentScreen: ScreenType;
  screenHistory: ScreenType[];
  selectedTripId: string | null;
  selectedRomaneioId: string | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  serverUrl: string;
  updateServerUrl: (url: string) => void;
  trips: Trip[];
  deliveries: Record<string, Delivery[]>;
  invoices: Invoice[];
  romaneios: Romaneio[];
  tolls: TollReceipt[];
  fechamentos: Fechamento[];
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  routeData: RouteOptimization | null;
  isLoadingRoute: boolean;

  // Actions
  navigateTo: (screen: ScreenType, options?: { tripId?: string; romaneioId?: string }) => void;
  goBack: () => void;
  login: (cpf: string, pass: string, remember: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  selectTrip: (id: string) => void;
  updateTripStatus: (tripId: string, newStatus: string) => void;
  updateDeliveryStatus: (deliveryId: string, newStatus: Delivery['status'], signedProofUrl?: string) => void;
  submitRomaneio: (notes: string, files: string[]) => Promise<Romaneio>;
  submitToll: (value: number, notes: string, plaza?: string) => Promise<TollReceipt>;
  linkScannedInvoice: (accessKey: string, tripId: string) => Invoice;
  resolveDivergence: (period: string) => void;
  markNotificationRead: (id: string) => void;
  optimizeRoute: (tripId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('HOME');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>(['HOME']);
  const [selectedTripId, setSelectedTripId] = useState<string | null>('TRIP-4992');
  const [selectedRomaneioId, setSelectedRomaneioId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialUserProfile);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // If token exists, assume authenticated
    return !!getAuthToken() || true; // Default true so user sees live app immediately
  });
  const [serverUrl, setServerUrlState] = useState<string>(getServerUrl());

  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [deliveries, setDeliveries] = useState<Record<string, Delivery[]>>(initialDeliveries);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [romaneios, setRomaneios] = useState<Romaneio[]>(initialRomaneios);
  const [tolls, setTolls] = useState<TollReceipt[]>(initialTolls);
  const [fechamentos, setFechamentos] = useState<Fechamento[]>(initialFechamentos);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [routeData, setRouteData] = useState<RouteOptimization | null>(defaultRouteData);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const navigateTo = (screen: ScreenType, options?: { tripId?: string; romaneioId?: string }) => {
    if (options?.tripId) setSelectedTripId(options.tripId);
    if (options?.romaneioId) setSelectedRomaneioId(options.romaneioId);
    setScreenHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop();
      const prevScreen = newHistory[newHistory.length - 1];
      setScreenHistory(newHistory);
      setCurrentScreen(prevScreen);
    } else {
      setCurrentScreen('HOME');
    }
  };

  const updateServerUrl = (url: string) => {
    setServerUrl(url);
    setServerUrlState(url);
  };

  const login = async (cpf: string, pass: string, remember: boolean): Promise<{ success: boolean; error?: string }> => {
    const res = await api.login(cpf, pass);
    if (res.success && res.user) {
      setUserProfile(res.user);
      setIsAuthenticated(true);
      setCurrentScreen('HOME');
      setScreenHistory(['HOME']);
      return { success: true };
    }
    return { success: false, error: res.error || 'Credenciais inválidas' };
  };

  const logout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
    setCurrentScreen('HOME');
  };

  const selectTrip = (id: string) => {
    setSelectedTripId(id);
    navigateTo('TRIP_DETAIL', { tripId: id });
  };

  const updateTripStatus = (tripId: string, newStatus: string) => {
    setTrips(prev =>
      prev.map(t => (t.id === tripId ? { ...t, status: newStatus } : t))
    );
  };

  const updateDeliveryStatus = (
    deliveryId: string,
    newStatus: Delivery['status'],
    signedProofUrl?: string
  ) => {
    setDeliveries(prev => {
      const updated: Record<string, Delivery[]> = {};
      for (const [tId, delivList] of Object.entries(prev)) {
        updated[tId] = delivList.map(d =>
          d.id === deliveryId
            ? { ...d, status: newStatus, signedProofUrl: signedProofUrl || d.signedProofUrl }
            : d
        );
      }
      return updated;
    });
  };

  const submitRomaneio = async (notes: string, files: string[]): Promise<Romaneio> => {
    const newRom: Romaneio = {
      id: `ROM-${Math.floor(1000 + Math.random() * 9000)}`,
      tripId: selectedTripId || 'TRIP-4992',
      operation: 'Distribuição HK - Carga Regular',
      driver: userProfile?.name || 'João da Silva',
      truckPlate: userProfile?.truckPlate || 'ABC-1234',
      sentDate: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      sentTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'EM ANÁLISE',
      currentStep: 2,
      fileName: files[0] || 'comprovante_envio.pdf',
      fileCount: files.length || 1,
      notes
    };

    setRomaneios(prev => [newRom, ...prev]);

    // Add success notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: 'Romaneio Enviado para Conferência',
      message: `O romaneio ${newRom.id} foi recebido e está na esteira de validação OCR e fiscal.`,
      timeLabel: 'Agora',
      type: 'PROCESSADO',
      valueText: 'Ref',
      valueLabel: newRom.id,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    return newRom;
  };

  const submitToll = async (value: number, notes: string, plaza?: string): Promise<TollReceipt> => {
    const newToll: TollReceipt = {
      id: `toll_${Date.now()}`,
      tripRef: selectedTripId ? `Viagem #${selectedTripId.replace('TRIP-', '')}` : 'Viagem Atual',
      date: new Date().toLocaleDateString('pt-BR'),
      value: value,
      plaza: plaza || 'Praça Pedágio Rodovia',
      highway: 'Rodovia Federal/Estadual',
      status: 'PENDENTE',
      notes
    };

    setTolls(prev => [newToll, ...prev]);
    return newToll;
  };

  const linkScannedInvoice = (accessKey: string, tripId: string): Invoice => {
    const lastDigits = accessKey.slice(-8);
    const invoiceNum = `NF-e 004.${lastDigits.slice(0, 3)}.${lastDigits.slice(3, 6)}`;
    const newInv: Invoice = {
      id: `inv_${Date.now()}`,
      number: invoiceNum,
      accessKey,
      tripId,
      recipient: 'Cliente Destinatário Logística HK',
      city: 'Curitiba - PR',
      value: 14890.00,
      status: 'CONFERIDO',
      issuedAt: new Date().toLocaleDateString('pt-BR'),
      volume: 35
    };

    setInvoices(prev => [newInv, ...prev]);

    // Update trip linked invoice count
    setTrips(prev =>
      prev.map(t =>
        t.id === tripId ? { ...t, linkedInvoicesCount: t.linkedInvoicesCount + 1 } : t
      )
    );

    return newInv;
  };

  const resolveDivergence = (period: string) => {
    setFechamentos(prev =>
      prev.map(f =>
        f.period === period
          ? {
              ...f,
              hasDivergence: false,
              divergenceMessage: 'Comprovante reenviado e em reavaliação pela auditoria.'
            }
          : f
      )
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const optimizeRoute = async (tripId: string) => {
    setIsLoadingRoute(true);
    try {
      const data = await api.optimizeRoute(tripId);
      setRouteData(data);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        screenHistory,
        selectedTripId,
        selectedRomaneioId,
        userProfile,
        isAuthenticated,
        serverUrl,
        updateServerUrl,
        trips,
        deliveries,
        invoices,
        romaneios,
        tolls,
        fechamentos,
        notifications,
        unreadNotificationsCount,
        routeData,
        isLoadingRoute,
        navigateTo,
        goBack,
        login,
        logout,
        selectTrip,
        updateTripStatus,
        updateDeliveryStatus,
        submitRomaneio,
        submitToll,
        linkScannedInvoice,
        resolveDivergence,
        markNotificationRead,
        optimizeRoute
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
