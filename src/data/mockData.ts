import {
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

export const initialUserProfile: UserProfile = {
  id: 'usr_001',
  name: 'João da Silva',
  cpf: '342.891.028-44',
  phone: '(11) 98765-4321',
  truckPlate: 'ABC-1234',
  truckModel: 'Scania R450 Streamline Highline',
  role: 'Motorista Carreteiro',
  active: true,
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
};

export const initialTrips: Trip[] = [
  {
    id: 'TRIP-4992',
    tripCode: '#4992',
    originCity: 'São Paulo - SP',
    destinationCity: 'Curitiba - PR',
    distanceKm: 408,
    status: 'EM ANDAMENTO',
    driverName: 'João da Silva',
    truckPlate: 'ABC-1234',
    departureDate: '24/10/2023 06:00',
    estimatedArrival: '24/10/2023 18:30',
    totalValue: 3450.00,
    stopsCount: 4,
    totalWeightKg: 14200,
    operationName: 'Distribuição Sul - Carga Fracionada',
    linkedInvoicesCount: 6,
    notes: 'Priorizar descarregamento na Distribuidora Paranaense antes das 17h.',
    currentStopIndex: 1
  },
  {
    id: 'TRIP-4985',
    tripCode: '#4985',
    originCity: 'Campinas - SP',
    destinationCity: 'Belo Horizonte - MG',
    distanceKm: 585,
    status: 'CONCLUÍDA',
    driverName: 'João da Silva',
    truckPlate: 'ABC-1234',
    departureDate: '20/10/2023 07:30',
    estimatedArrival: '21/10/2023 11:00',
    totalValue: 4200.00,
    stopsCount: 3,
    totalWeightKg: 18500,
    operationName: 'Linha Sudeste Indústria',
    linkedInvoicesCount: 5,
    notes: 'Viagem finalizada sem ocorrências.'
  },
  {
    id: 'TRIP-4978',
    tripCode: '#4978',
    originCity: 'Santos - SP',
    destinationCity: 'São Paulo - SP',
    distanceKm: 85,
    status: 'CONCLUÍDA',
    driverName: 'João da Silva',
    truckPlate: 'ABC-1234',
    departureDate: '18/10/2023 14:00',
    estimatedArrival: '18/10/2023 19:00',
    totalValue: 1250.00,
    stopsCount: 2,
    totalWeightKg: 22000,
    operationName: 'Transferência Portuária Terminal 2',
    linkedInvoicesCount: 2
  },
  {
    id: 'TRIP-5001',
    tripCode: '#5001',
    originCity: 'São Paulo - SP',
    destinationCity: 'Joinville - SC',
    distanceKm: 520,
    status: 'PENDENTE',
    driverName: 'João da Silva',
    truckPlate: 'ABC-1234',
    departureDate: '26/10/2023 05:00',
    estimatedArrival: '26/10/2023 20:00',
    totalValue: 4800.00,
    stopsCount: 5,
    totalWeightKg: 16000,
    operationName: 'Expresso Catarinense HK',
    linkedInvoicesCount: 8,
    notes: 'Aguardando liberação de ordem de carregamento no CD Cajamar.'
  }
];

export const initialDeliveries: Record<string, Delivery[]> = {
  'TRIP-4992': [
    {
      id: 'DEL-101',
      tripId: 'TRIP-4992',
      customerName: 'Supermercados Big Sul Ltda',
      address: 'Rodovia BR-116, Km 98 - Atuba',
      city: 'Curitiba - PR',
      deliveryWindow: '08:00 - 12:00',
      status: 'ENTREGUE',
      sequence: 1,
      volumeCount: 45,
      invoicesCount: 2,
      estimatedTime: '09:30',
      signedProofUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'DEL-102',
      tripId: 'TRIP-4992',
      customerName: 'Distribuidora Paranaense de Alimentos',
      address: 'Rua Marechal Floriano Peixoto, 4500 - Hauer',
      city: 'Curitiba - PR',
      deliveryWindow: '13:00 - 17:00',
      status: 'A_CAMINHO',
      sequence: 2,
      volumeCount: 80,
      invoicesCount: 2,
      estimatedTime: '14:45'
    },
    {
      id: 'DEL-103',
      tripId: 'TRIP-4992',
      customerName: 'Atacado Central Pinhais',
      address: 'Av. Ayrton Senna da Silva, 1200',
      city: 'Pinhais - PR',
      deliveryWindow: '15:30 - 18:30',
      status: 'PENDENTE',
      sequence: 3,
      volumeCount: 32,
      invoicesCount: 1,
      estimatedTime: '17:15'
    },
    {
      id: 'DEL-104',
      tripId: 'TRIP-4992',
      customerName: 'LogCenter São José dos Pinhais',
      address: 'Rua Joinville, 890 - Afonso Pena',
      city: 'São José dos Pinhais - PR',
      deliveryWindow: '18:00 - 20:00',
      status: 'PENDENTE',
      sequence: 4,
      volumeCount: 60,
      invoicesCount: 1,
      estimatedTime: '19:00'
    }
  ]
};

export const initialInvoices: Invoice[] = [
  {
    id: 'inv_01',
    number: 'NF-e 004.892.110',
    accessKey: '35231012345678000199550010008921101234567890',
    tripId: 'TRIP-4992',
    recipient: 'Supermercados Big Sul Ltda',
    city: 'Curitiba - PR',
    value: 18450.00,
    status: 'ENTREGUE',
    issuedAt: '22/10/2023',
    volume: 25
  },
  {
    id: 'inv_02',
    number: 'NF-e 004.892.111',
    accessKey: '35231012345678000199550010008921111234567891',
    tripId: 'TRIP-4992',
    recipient: 'Supermercados Big Sul Ltda',
    city: 'Curitiba - PR',
    value: 12300.50,
    status: 'ENTREGUE',
    issuedAt: '22/10/2023',
    volume: 20
  },
  {
    id: 'inv_03',
    number: 'NF-e 004.893.004',
    accessKey: '35231012345678000199550010008930041234567892',
    tripId: 'TRIP-4992',
    recipient: 'Distribuidora Paranaense de Alimentos',
    city: 'Curitiba - PR',
    value: 34120.00,
    status: 'EM TRÂNSITO',
    issuedAt: '23/10/2023',
    volume: 50
  },
  {
    id: 'inv_04',
    number: 'NF-e 004.893.005',
    accessKey: '35231012345678000199550010008930051234567893',
    tripId: 'TRIP-4992',
    recipient: 'Distribuidora Paranaense de Alimentos',
    city: 'Curitiba - PR',
    value: 21900.00,
    status: 'EM TRÂNSITO',
    issuedAt: '23/10/2023',
    volume: 30
  },
  {
    id: 'inv_05',
    number: 'NF-e 004.894.512',
    accessKey: '35231012345678000199550010008945121234567894',
    tripId: 'TRIP-4992',
    recipient: 'Atacado Central Pinhais',
    city: 'Pinhais - PR',
    value: 15780.00,
    status: 'PENDENTE',
    issuedAt: '23/10/2023',
    volume: 32
  },
  {
    id: 'inv_06',
    number: 'NF-e 004.895.890',
    accessKey: '35231012345678000199550010008958901234567895',
    tripId: 'TRIP-4992',
    recipient: 'LogCenter São José dos Pinhais',
    city: 'São José dos Pinhais - PR',
    value: 28600.00,
    status: 'PENDENTE',
    issuedAt: '23/10/2023',
    volume: 60
  }
];

export const initialRomaneios: Romaneio[] = [
  {
    id: 'ROM-9823',
    tripId: 'TRIP-4992',
    operation: 'Distribuição Sul - Carga Fracionada',
    driver: 'João da Silva',
    truckPlate: 'ABC-1234',
    sentDate: '24 Out 2023',
    sentTime: '14:32',
    status: 'EM ANÁLISE',
    currentStep: 2,
    fileName: 'doc_cte_9823.pdf',
    fileCount: 3,
    notes: 'Conferido sem avarias no primeiro descarregamento em Curitiba.'
  },
  {
    id: 'ROM-9780',
    tripId: 'TRIP-4985',
    operation: 'Linha Sudeste Indústria',
    driver: 'João da Silva',
    truckPlate: 'ABC-1234',
    sentDate: '21 Out 2023',
    sentTime: '16:10',
    status: 'APROVADO',
    currentStep: 4,
    fileName: 'canhotos_bh_4985.pdf',
    fileCount: 5,
    notes: 'Todos os canhotos assinados com carimbo legível.'
  }
];

export const initialTolls: TollReceipt[] = [
  {
    id: 'toll_01',
    tripRef: 'Viagem #4992 (SP -> Curitiba)',
    date: '24/10/2023',
    value: 48.50,
    plaza: 'Praça Itapecerica da Serra KM 298',
    highway: 'BR-116 Régis Bittencourt',
    status: 'APROVADO',
    notes: 'Cabine manual sem TAG'
  },
  {
    id: 'toll_02',
    tripRef: 'Viagem #4992 (SP -> Curitiba)',
    date: '24/10/2023',
    value: 48.50,
    plaza: 'Praça Miracatu KM 377',
    highway: 'BR-116 Régis Bittencourt',
    status: 'APROVADO',
    notes: 'Recibo impresso anexado'
  },
  {
    id: 'toll_03',
    tripRef: 'Viagem #4992 (SP -> Curitiba)',
    date: '24/10/2023',
    value: 48.50,
    plaza: 'Praça Campina Grande do Sul KM 57',
    highway: 'BR-116 Régis Bittencourt',
    status: 'PENDENTE',
    notes: 'Envio recente'
  },
  {
    id: 'toll_04',
    tripRef: 'Viagem #4985 (Campinas -> BH)',
    date: '20/10/2023',
    value: 36.20,
    plaza: 'Praça Mairiporã KM 65',
    highway: 'BR-381 Fernão Dias',
    status: 'REEMBOLSADO',
    notes: 'Pago no fechamento anterior'
  }
];

export const initialFechamentos: Fechamento[] = [
  {
    id: 'fech_01',
    period: '01/08 a 15/08/2023',
    status: 'EM CONFERÊNCIA',
    tripsCount: 4,
    tripsValue: 12450.00,
    tollsValue: 382.40,
    additionalsValue: 450.00,
    discountsValue: 0.00,
    totalGross: 13282.40,
    totalNet: 13282.40,
    hasDivergence: true,
    divergenceMessage: 'Comprovante de entrega ilegível. Necessário reenvio de canhoto para aprovação na Viagem #4992.'
  },
  {
    id: 'fech_02',
    period: '16/07 a 31/07/2023',
    status: 'PAGO',
    tripsCount: 6,
    tripsValue: 18200.00,
    tollsValue: 540.00,
    additionalsValue: 300.00,
    discountsValue: 200.00,
    totalGross: 19040.00,
    totalNet: 18840.00,
    hasDivergence: false,
    divergenceMessage: ''
  },
  {
    id: 'fech_03',
    period: '01/07 a 15/07/2023',
    status: 'PAGO',
    tripsCount: 5,
    tripsValue: 15400.00,
    tollsValue: 460.00,
    additionalsValue: 200.00,
    discountsValue: 0.00,
    totalGross: 16060.00,
    totalNet: 16060.00,
    hasDivergence: false,
    divergenceMessage: ''
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif_01',
    title: 'Romaneio Processado com Sucesso',
    message: 'O romaneio ROM-9780 da Viagem #4985 foi auditado e aprovado pela equipe de logística da HK.',
    timeLabel: 'Há 25 min',
    type: 'PROCESSADO',
    valueText: 'Ref',
    valueLabel: 'ROM-9780',
    read: false
  },
  {
    id: 'notif_02',
    title: 'Atenção: Pendência Documental',
    message: 'Canhoto da NF-e 004.892.110 com assinatura parcial na Viagem #4992. Por favor, reenvie a foto nítida.',
    timeLabel: 'Hoje às 10:15',
    type: 'DIVERGÊNCIA',
    valueText: 'Status',
    valueLabel: 'Ação Necessária',
    read: false
  },
  {
    id: 'notif_03',
    title: 'Comprovante de Pedágio Aprovado',
    message: 'O reembolso da Praça Miracatu KM 377 no valor de R$ 48,50 foi deferido para o próximo fechamento.',
    timeLabel: 'Ontem às 18:30',
    type: 'APROVADO',
    valueText: 'Reembolso',
    valueLabel: 'R$ 48,50',
    read: true
  },
  {
    id: 'notif_04',
    title: 'Pagamento Realizado - PIX',
    message: 'Transferência do fechamento quinzenal 16/07 a 31/07 efetuada na sua conta Itaú cadastrada.',
    timeLabel: '02 Ago 2023',
    type: 'PAGO',
    valueText: 'Crédito PIX',
    valueLabel: 'R$ 18.840,00',
    read: true
  }
];

export const defaultRouteData: RouteOptimization = {
  tripId: 'TRIP-4992',
  totalDistanceKm: 422,
  estimatedDurationMinutes: 385,
  mapsProviderStatus: 'Conectado ao Google Maps Services HK API',
  stops: [
    {
      sequence: 1,
      deliveryId: 'DEL-101',
      customer: 'Supermercados Big Sul Ltda',
      address: 'Rodovia BR-116, Km 98 - Atuba, Curitiba - PR',
      deliveryWindow: '08:00 - 12:00',
      estimatedArrival: '09:30',
      latitude: -25.3852,
      longitude: -49.2014,
      volumeCount: 45,
      invoiceCount: 2,
      distanceFromPreviousKm: 395,
      durationFromPreviousMinutes: 340
    },
    {
      sequence: 2,
      deliveryId: 'DEL-102',
      customer: 'Distribuidora Paranaense de Alimentos',
      address: 'Rua Marechal Floriano Peixoto, 4500 - Hauer, Curitiba - PR',
      deliveryWindow: '13:00 - 17:00',
      estimatedArrival: '14:45',
      latitude: -25.4761,
      longitude: -49.2612,
      volumeCount: 80,
      invoiceCount: 2,
      distanceFromPreviousKm: 12.5,
      durationFromPreviousMinutes: 25,
      warning: 'Zona de Restrição de Circulação de Veículos Pesados (ZRC) após 18h.'
    },
    {
      sequence: 3,
      deliveryId: 'DEL-103',
      customer: 'Atacado Central Pinhais',
      address: 'Av. Ayrton Senna da Silva, 1200, Pinhais - PR',
      deliveryWindow: '15:30 - 18:30',
      estimatedArrival: '17:15',
      latitude: -25.4385,
      longitude: -49.1925,
      volumeCount: 32,
      invoiceCount: 1,
      distanceFromPreviousKm: 8.2,
      durationFromPreviousMinutes: 18
    },
    {
      sequence: 4,
      deliveryId: 'DEL-104',
      customer: 'LogCenter São José dos Pinhais',
      address: 'Rua Joinville, 890 - Afonso Pena, São José dos Pinhais - PR',
      deliveryWindow: '18:00 - 20:00',
      estimatedArrival: '19:00',
      latitude: -25.5284,
      longitude: -49.1983,
      volumeCount: 60,
      invoiceCount: 1,
      distanceFromPreviousKm: 6.3,
      durationFromPreviousMinutes: 15
    }
  ]
};
