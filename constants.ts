
import { InvestmentPlan, SystemConfig } from './types';

export const INITIAL_PLANS: InvestmentPlan[] = [
  {
    id: 'plan-1',
    name: 'Starter Tier',
    minAmount: 100,
    maxAmount: 1000,
    dailyRoi: 1.5,
    durationDays: 30
  },
  {
    id: 'plan-2',
    name: 'Professional Tier',
    minAmount: 1001,
    maxAmount: 10000,
    dailyRoi: 2.5,
    durationDays: 60
  },
  {
    id: 'plan-3',
    name: 'Whale Master Tier',
    minAmount: 10001,
    maxAmount: 1000000,
    dailyRoi: 4.0,
    durationDays: 90
  }
];

export const INITIAL_CONFIG: SystemConfig = {
  btcAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  ethAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  usdtAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
};

export const STORAGE_KEY = 'nexus_crypto_db_v1';
export const REMEMBERED_EMAIL_KEY = 'nexus_remembered_email';
