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
      minAmount: 250,
      maxAmount: 5000,
      dailyRoi: 0.18,
      durationDays: 30,
      risk: "Low",
      strategy: "Market-neutral BTC basis and hedged carry."
    },
    {
      id: "plan-2",
      name: "Blue Chip Momentum",
      minAmount: 5000,
      maxAmount: 25000,
      dailyRoi: 0.26,
      durationDays: 60,
      risk: "Medium",
      strategy: "Rotational exposure across BTC, ETH, and large-cap alts."
    },
    {
      id: "plan-3",
      name: "Opportunistic Alpha",
      minAmount: 25000,
      maxAmount: 250000,
      dailyRoi: 0.34,
      durationDays: 90,
      risk: "High",
      strategy: "Actively managed swing allocation with strict drawdown controls."
    }
  ],
  systemConfig: {
    btcAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    ethAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    usdtAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
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
