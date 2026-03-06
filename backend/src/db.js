import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), "backend", "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const INITIAL_DATA = {
  users: [],
  transactions: [],
  passwordResets: [],
  magicLinks: [],
  plans: [
    {
      id: "plan-1",
      name: "BTC Core Income",
      minAmount: 200,
      maxAmount: 2000,
      dailyRoi: 0.18,
      durationDays: 30,
      risk: "Low",
      strategy: "Market-neutral BTC basis and hedged carry."
    },
    {
      id: "plan-2",
      name: "Blue Chip Momentum",
      minAmount: 1000,
      maxAmount: 25000,
      dailyRoi: 0.26,
      durationDays: 60,
      risk: "Medium",
      strategy: "Rotational exposure across BTC, ETH, and large-cap alts."
    },
    {
      id: "plan-3",
      name: "Opportunistic Alpha",
      minAmount: 10000,
      maxAmount: 250000,
      dailyRoi: 0.34,
      durationDays: 90,
      risk: "High",
      strategy: "Actively managed swing allocation with strict drawdown controls."
    }
  ],
  systemConfig: {
    btcAddress: "bc1qynty8rdg8448dektk7yesd9ph0w08tfy7dav3y",
    ethAddress: "0xf4059C384bAa6d60E426F91681F1e62A830E4Ec9",
    usdtAddress: "0xf4059C384bAa6d60E426F91681F1e62A830E4Ec9"
  }
};

async function ensureDbFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(INITIAL_DATA, null, 2), "utf8");
  }
}

export async function readDb() {
  await ensureDbFile();
  const raw = await fs.readFile(DB_PATH, "utf8");
  return JSON.parse(raw);
}

export async function writeDb(nextDb) {
  await ensureDbFile();
  await fs.writeFile(DB_PATH, JSON.stringify(nextDb, null, 2), "utf8");
}
