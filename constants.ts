
import { InvestmentPlan, SystemConfig } from './types';

export const INITIAL_PLANS: InvestmentPlan[] = [
  {
    id: 'plan-1',
    name: 'Starter Tier',
    minAmount: 200,
    maxAmount: 2000,
    dailyRoi: 1.5,
    durationDays: 30
  },
  {
    id: 'plan-2',
    name: 'Professional Tier',
    minAmount: 1000,
    maxAmount: 10000,
    dailyRoi: 2.5,
    durationDays: 60
  },
  {
    id: 'plan-3',
    name: 'Whale Master Tier',
    minAmount: 10000,
    maxAmount: 1000000,
    dailyRoi: 4.0,
    durationDays: 90
  }
];

export const INITIAL_CONFIG: SystemConfig = {
  btcAddress: 'bc1qynty8rdg8448dektk7yesd9ph0w08tfy7dav3y',
  ethAddress: '0xf4059C384bAa6d60E426F91681F1e62A830E4Ec9',
  usdtAddress: '0xf4059C384bAa6d60E426F91681F1e62A830E4Ec9'
};

export const STORAGE_KEY = 'nexus_crypto_db_v1';
export const REMEMBERED_EMAIL_KEY = 'nexus_remembered_email';
