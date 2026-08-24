export const TRACKING_POLICY = {
  ACTIVE_TRIP_INTERVAL_MS: 90 * 1000,      // 1.5 minutos (1 a 2 minutos em viagem ativa)
  STOPPED_INTERVAL_MS: 5 * 60 * 1000,      // 5 minutos (parado / sem movimento)
  IDLE_INTERVAL_MS: 10 * 60 * 1000,        // 10 minutos (fora de viagem / ocioso)
  
  // Limiares de classificação de status de conexão
  ONLINE_THRESHOLD_MS: 5 * 60 * 1000,      // <= 5 min: Online
  WARNING_THRESHOLD_MS: 10 * 60 * 1000,    // 5 a 10 min: Atenção
  NO_UPDATE_THRESHOLD_MS: 30 * 60 * 1000,  // 10 a 30 min: Sem atualização
  OFFLINE_THRESHOLD_MS: 30 * 60 * 1000,    // > 30 min: Offline

  // Velocidade mínima para considerar em movimento (km/h)
  MIN_MOVING_SPEED_KMH: 3.0,

  // Janela máxima para aceitação de timestamps passados (30 dias)
  MAX_PAST_TIMESTAMP_MS: 30 * 24 * 60 * 60 * 1000,
  
  // Tolerância máxima para timestamps futuros (5 minutos por drift de relógio)
  MAX_FUTURE_TIMESTAMP_MS: 5 * 60 * 1000,
  
  // Política de retenção de dados históricos detalhados (90 dias)
  DATA_RETENTION_DAYS: 90,
};

export type DriverTrackingStatus = 'EM_MOVIMENTO' | 'PARADO' | 'SEM_ATUALIZACAO' | 'OFFLINE';

export function calculateTrackingStatus(
  lastCapturedAt: Date | string | null,
  speed?: number | null,
): DriverTrackingStatus {
  if (!lastCapturedAt) return 'OFFLINE';

  const capturedTime = new Date(lastCapturedAt).getTime();
  const diffMs = Date.now() - capturedTime;

  if (diffMs > TRACKING_POLICY.OFFLINE_THRESHOLD_MS) {
    return 'OFFLINE';
  }

  if (diffMs > TRACKING_POLICY.WARNING_THRESHOLD_MS) {
    return 'SEM_ATUALIZACAO';
  }

  if (speed !== undefined && speed !== null && speed >= TRACKING_POLICY.MIN_MOVING_SPEED_KMH) {
    return 'EM_MOVIMENTO';
  }

  return 'PARADO';
}
