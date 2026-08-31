export type ScreenType =
  | 'HOME'
  | 'TRIPS'
  | 'TRIP_DETAIL'
  | 'TRIP_ROUTE'
  | 'LINKED_INVOICES'
  | 'SCAN_INVOICE'
  | 'SEND_ROMANEIO'
  | 'ROMANEIO_STATUS'
  | 'SEND_TOLL'
  | 'FINANCE'
  | 'NOTIFICATIONS'
  | 'PROFILE';

export interface UserProfile {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  truckPlate: string;
  truckModel: string;
  role: string;
  active: boolean;
  avatarUrl?: string;
}

export type TripStatus =
  | 'EM_ANDAMENTO'
  | 'PENDENTE'
  | 'CONCLUÍDA'
  | 'AGUARDANDO_CARREGAMENTO'
  | 'EM_TRANSITO';

export interface Trip {
  id: string;
  tripCode: string;
  originCity: string;
  destinationCity: string;
  distanceKm: number;
  status: string;
  driverName: string;
  truckPlate: string;
  departureDate: string;
  estimatedArrival: string;
  totalValue: number;
  stopsCount: number;
  totalWeightKg: number;
  operationName: string;
  linkedInvoicesCount: number;
  notes?: string;
  currentStopIndex?: number;
}

export interface Delivery {
  id: string;
  tripId: string;
  customerName: string;
  address: string;
  city: string;
  deliveryWindow: string;
  status: 'PENDENTE' | 'A_CAMINHO' | 'ENTREGUE' | 'DIVERGENCIA';
  sequence: number;
  volumeCount: number;
  invoicesCount: number;
  estimatedTime: string;
  signedProofUrl?: string;
  hasIssue?: boolean;
  issueDescription?: string;
}

export interface Invoice {
  id: string;
  number: string;
  accessKey: string;
  tripId: string;
  recipient: string;
  city: string;
  value: number;
  status: 'ENTREGUE' | 'EM TRÂNSITO' | 'PENDENTE' | 'CONFERIDO' | 'DIVERGÊNCIA';
  issuedAt: string;
  volume: number;
}

export interface Romaneio {
  id: string;
  tripId?: string;
  operation: string;
  driver: string;
  truckPlate: string;
  sentDate: string;
  sentTime: string;
  status: 'EM ANÁLISE' | 'APROVADO' | 'PENDÊNCIA' | 'PROCESSADO';
  currentStep: number; // 1: Recebido, 2: Em análise OCR, 3: Validação HK, 4: Fechamento
  fileName: string;
  fileCount: number;
  notes?: string;
  divergenceMessage?: string;
}

export interface TollReceipt {
  id: string;
  tripRef: string;
  date: string;
  value: number;
  plaza: string;
  highway: string;
  status: 'PENDENTE' | 'APROVADO' | 'REEMBOLSADO' | 'RECUSADO';
  notes: string;
  receiptUrl?: string;
}

export interface Fechamento {
  id: string;
  period: string;
  status: 'EM CONFERÊNCIA' | 'APROVADO' | 'PAGO' | 'COM DIVERGÊNCIA';
  tripsCount: number;
  tripsValue: number;
  tollsValue: number;
  additionalsValue: number;
  discountsValue: number;
  totalGross: number;
  totalNet: number;
  hasDivergence: boolean;
  divergenceMessage: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeLabel: string;
  type: 'PROCESSADO' | 'APROVADO' | 'PAGO' | 'DIVERGÊNCIA' | 'GERAL';
  valueText?: string;
  valueLabel?: string;
  read: boolean;
}

export interface RouteStop {
  sequence: number;
  deliveryId: string;
  customer: string;
  address: string;
  deliveryWindow: string;
  estimatedArrival: string;
  latitude: number;
  longitude: number;
  volumeCount: number;
  invoiceCount: number;
  distanceFromPreviousKm: number;
  durationFromPreviousMinutes: number;
  warning?: string;
}

export interface RouteOptimization {
  tripId: string;
  totalDistanceKm: number;
  estimatedDurationMinutes: number;
  mapsProviderStatus: string;
  stops: RouteStop[];
}
