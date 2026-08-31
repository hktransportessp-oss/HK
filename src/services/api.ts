import {
  UserProfile,
  Trip,
  Delivery,
  Invoice,
  Romaneio,
  TollReceipt,
  Fechamento,
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
  defaultRouteData
} from '../data/mockData';

const SERVER_URL_KEY = 'hk_server_url';
const TOKEN_KEY = 'hk_auth_token';
const DEFAULT_SERVER_URL = 'https://hk-production-4658.up.railway.app/';

export function getServerUrl(): string {
  return localStorage.getItem(SERVER_URL_KEY) || DEFAULT_SERVER_URL;
}

export function setServerUrl(url: string): void {
  localStorage.setItem(SERVER_URL_KEY, url);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

class ApiService {
  private get baseUrl(): string {
    let url = getServerUrl().trim();
    if (!url.endsWith('/')) url += '/';
    return url;
  }

  async login(cpf: string, password: string): Promise<{ success: boolean; token?: string; user?: UserProfile; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cpf.replace(/\D/g, ''), password }),
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token || 'mock_jwt_hk_token_2024';
        setAuthToken(token);
        return {
          success: true,
          token,
          user: data.user || initialUserProfile
        };
      }
    } catch {
      // Offline fallback: simulate successful login for valid-looking credentials
    }

    // Standard driver login fallback
    if (cpf.trim().length >= 3 && password.trim().length >= 3) {
      const token = 'mock_jwt_hk_token_2024';
      setAuthToken(token);
      return {
        success: true,
        token,
        user: initialUserProfile
      };
    }

    return {
      success: false,
      error: 'CPF ou senha incorretos. Verifique suas credenciais.'
    };
  }

  async optimizeRoute(tripId: string): Promise<RouteOptimization> {
    try {
      const token = getAuthToken();
      const response = await fetch(`${this.baseUrl}api/v1/trips/${tripId}/route-optimization`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(4000)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }
    return defaultRouteData;
  }
}

export const api = new ApiService();
