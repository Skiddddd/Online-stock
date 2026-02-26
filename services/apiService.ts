import { SystemConfig, Transaction, TransactionStatus, TransactionType, User, InvestmentPlan } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const TOKEN_KEY = 'nexus_auth_token';
const REQUEST_TIMEOUT_MS = 10000;

type RequestMethod = 'GET' | 'POST' | 'PATCH';

interface AuthResponse {
  token: string;
  user: User;
}

interface CreateTransactionPayload {
  type: TransactionType;
  amount: number;
  method: string;
  planId?: string;
}

async function request<T>(
  path: string,
  method: RequestMethod = 'GET',
  body?: unknown,
  withAuth = false
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (withAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload.error || `Request failed: ${res.status}`);
    }
    return payload as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out. Check your API server connection.');
    }
    if (error instanceof TypeError) {
      throw new Error(`Unable to reach API at ${API_BASE}.`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiService = {
  getToken: () => localStorage.getItem(TOKEN_KEY),

  clearToken: () => localStorage.removeItem(TOKEN_KEY),

  async login(email: string, password: string): Promise<AuthResponse> {
    const result = await request<AuthResponse>('/api/auth/login', 'POST', { email, password });
    localStorage.setItem(TOKEN_KEY, result.token);
    return result;
  },

  async register(fullName: string, email: string, password: string): Promise<AuthResponse> {
    const result = await request<AuthResponse>('/api/auth/register', 'POST', { fullName, email, password });
    localStorage.setItem(TOKEN_KEY, result.token);
    return result;
  },

  getPlans: () => request<InvestmentPlan[]>('/api/plans'),

  getSystemConfig: () => request<SystemConfig>('/api/system-config'),

  getMe: () => request<User>('/api/me', 'GET', undefined, true),

  getTransactions: () => request<Transaction[]>('/api/transactions', 'GET', undefined, true),

  createTransaction: (payload: CreateTransactionPayload) =>
    request<Transaction>('/api/transactions', 'POST', payload, true),

  adminGetUsers: () => request<User[]>('/api/admin/users', 'GET', undefined, true),

  adminGetTransactions: () => request<Transaction[]>('/api/admin/transactions', 'GET', undefined, true),

  adminUpdateTransaction: (id: string, status: TransactionStatus) =>
    request<Transaction>(`/api/admin/transactions/${id}`, 'PATCH', { status }, true),

  adminUpdateSystemConfig: (config: SystemConfig) =>
    request<SystemConfig>('/api/admin/system-config', 'PATCH', config, true)
};
