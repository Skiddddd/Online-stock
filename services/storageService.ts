import { AppState, User, UserRole, Transaction, InvestmentPlan, TransactionType, TransactionStatus, SystemConfig } from '../types';
import { INITIAL_PLANS, STORAGE_KEY, INITIAL_CONFIG } from '../constants';

const defaultState: AppState = {
  currentUser: null,
  users: [
    {
      id: 'admin-1',
      email: 'admin@nexus.io',
      fullName: 'Nexus Admin',
      balance: 1000000,
      role: UserRole.ADMIN,
      createdAt: new Date().toISOString()
    }
  ],
  transactions: [],
  plans: INITIAL_PLANS,
  systemConfig: INITIAL_CONFIG
};

export const storageService = {
  getState: (): AppState => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
      return defaultState;
    }
    return JSON.parse(saved);
  },

  saveState: (state: AppState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  login: (email: string): User | null => {
    const state = storageService.getState();
    const user = state.users.find(u => u.email === email);
    if (user) {
      state.currentUser = user;
      storageService.saveState(state);
      return user;
    }
    return null;
  },

  register: (fullName: string, email: string): User => {
    const state = storageService.getState();
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      fullName,
      balance: 0,
      role: UserRole.USER,
      createdAt: new Date().toISOString()
    };
    state.users.push(newUser);
    state.currentUser = newUser;
    storageService.saveState(state);
    return newUser;
  },

  logout: () => {
    const state = storageService.getState();
    state.currentUser = null;
    storageService.saveState(state);
  },

  updateSystemConfig: (config: SystemConfig) => {
    const state = storageService.getState();
    state.systemConfig = config;
    storageService.saveState(state);
  },

  setUserBalance: (userId: string, nextBalance: number) => {
    const state = storageService.getState();
    const user = state.users.find(u => u.id === userId);
    if (!user) return;

    user.balance = Math.max(0, Number(nextBalance) || 0);

    if (state.currentUser?.id === userId) {
      state.currentUser = user;
    }

    storageService.saveState(state);
  },

  createTransaction: (userId: string, type: TransactionType, amount: number, method: string) => {
    const state = storageService.getState();
    const user = state.users.find(u => u.id === userId);
    if (!user) return;

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      userEmail: user.email,
      type,
      amount,
      status: TransactionStatus.PENDING,
      date: new Date().toISOString(),
      method
    };

    state.transactions.unshift(newTx);
    storageService.saveState(state);
    return newTx;
  },

  updateTransactionStatus: (txId: string, status: TransactionStatus) => {
    const state = storageService.getState();
    const tx = state.transactions.find(t => t.id === txId);
    if (!tx) return;

    tx.status = status;

    if (status === TransactionStatus.COMPLETED) {
      const user = state.users.find(u => u.id === tx.userId);
      if (user) {
        if (tx.type === TransactionType.DEPOSIT) {
          user.balance += tx.amount;
        } else if (tx.type === TransactionType.WITHDRAWAL || tx.type === TransactionType.INVESTMENT) {
          user.balance -= tx.amount;
        }
      }
    }

    storageService.saveState(state);
  }
};
