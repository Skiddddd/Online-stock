import "dotenv/config";
import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import { GoogleGenAI } from "@google/genai";
import { readDb, writeDb } from "./db.js";
import { hashPassword, verifyPassword, signToken, verifyToken, sanitizeUser } from "./auth.js";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

function makeId(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getAppUrl(req) {
  const configured = process.env.APP_URL;
  if (configured) return configured;

  const origin = req?.headers?.origin;
  if (origin) return origin;

  return "http://localhost:5500";
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false") === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || "Skid Invest <no-reply@skidinvest.com>";
  const enabled = Boolean(host && user && pass);
  return { enabled, host, port, secure, user, pass, from };
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenAI({ apiKey });
}

async function sendResetEmail({ email, resetLink }) {
  const smtp = getSmtpConfig();
  if (!smtp.enabled) {
    console.log(`[dev] SMTP not configured. Reset link for ${email}: ${resetLink}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass }
  });

  await transporter.sendMail({
    from: smtp.from,
    to: email,
    subject: "Reset your Skid Invest password",
    text: `We received a password reset request.\n\nUse this link to reset your password:\n${resetLink}\n\nThis link expires in 30 minutes.\nIf you did not request this, ignore this email.`,
    html: `<p>We received a password reset request.</p><p><a href="${resetLink}">Reset your password</a></p><p>This link expires in 30 minutes.</p><p>If you did not request this, ignore this email.</p>`
  });
}

async function sendMagicLinkEmail({ email, magicLink }) {
  const smtp = getSmtpConfig();
  if (!smtp.enabled) {
    console.log(`[dev] SMTP not configured. Magic link for ${email}: ${magicLink}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass }
  });

  await transporter.sendMail({
    from: smtp.from,
    to: email,
    subject: "Your Skid Invest sign-in link",
    text: `Use this one-time link to sign in:\n${magicLink}\n\nThis link expires in 15 minutes.`,
    html: `<p>Use this one-time link to sign in:</p><p><a href="${magicLink}">Sign in to your account</a></p><p>This link expires in 15 minutes.</p>`
  });
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Missing auth token." });

  try {
    req.auth = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

async function loadCurrentUser(req) {
  const db = await readDb();
  const user = db.users.find((u) => u.id === req.auth.sub);
  return { db, user };
}

function adminRequired(req, res, next) {
  if (req.auth?.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
}

async function ensureAdminSeed() {
  const db = await readDb();
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@nexus.io").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
  const hasAdmin = db.users.some((u) => u.email.toLowerCase() === adminEmail);
  let mutated = false;

  if (!Array.isArray(db.passwordResets)) {
    db.passwordResets = [];
    mutated = true;
  }
  if (!Array.isArray(db.magicLinks)) {
    db.magicLinks = [];
    mutated = true;
  }

  if (!hasAdmin) {
    db.users.push({
      id: "admin-1",
      email: adminEmail,
      fullName: "Nexus Admin",
      passwordHash: hashPassword(adminPassword),
      balance: 1000000,
      role: "ADMIN",
      isActive: true,
      createdAt: new Date().toISOString()
    });
    mutated = true;
  }

  if (mutated) {
    await writeDb(db);
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "nexus-backend", timestamp: new Date().toISOString() });
});

app.get("/api/plans", async (_req, res) => {
  const db = await readDb();
  res.json(db.plans);
});

app.get("/api/system-config", async (_req, res) => {
  const db = await readDb();
  res.json(db.systemConfig);
});

app.get("/api/ai/market-sentiment", async (_req, res) => {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents:
        "Generate a brief, 3-sentence crypto market sentiment analysis for today. Mention BTC, ETH, and one trending altcoin. Keep it professional and concise."
    });

    res.json({ text: response.text || "" });
  } catch (error) {
    const isMissingKey = error instanceof Error && error.message.includes("GEMINI_API_KEY");
    if (isMissingKey) {
      return res.status(500).json({ error: "AI service is not configured." });
    }
    return res.status(502).json({ error: "AI service request failed." });
  }
});

app.post("/api/ai/investment-advice", async (req, res) => {
  const { balance, planName } = req.body || {};
  const amount = Number(balance);
  const selectedPlan = String(planName || "").trim();

  if (!Number.isFinite(amount) || amount < 0 || !selectedPlan) {
    return res.status(400).json({ error: "balance and planName are required." });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `A user has a balance of $${amount} and is considering the ${selectedPlan} investment plan. Give exactly 3 concise bullet-point tips on risk management and diversification in current crypto markets.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    res.json({ text: response.text || "" });
  } catch (error) {
    const isMissingKey = error instanceof Error && error.message.includes("GEMINI_API_KEY");
    if (isMissingKey) {
      return res.status(500).json({ error: "AI service is not configured." });
    }
    return res.status(502).json({ error: "AI service request failed." });
  }
});

app.get("/api/market/btc-history", async (_req, res) => {
  try {
    const upstream = await fetch("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=3&interval=hourly", {
      headers: {
        Accept: "application/json"
      }
    });

    if (!upstream.ok) {
      return res.status(502).json({ error: "Market data provider unavailable." });
    }

    const payload = await upstream.json();
    const prices = Array.isArray(payload?.prices) ? payload.prices : [];
    const normalized = prices
      .map((entry) => ({
        ts: Number(entry?.[0]),
        price: Number(entry?.[1])
      }))
      .filter((entry) => Number.isFinite(entry.ts) && Number.isFinite(entry.price));

    res.json({ symbol: "BTCUSD", source: "coingecko", points: normalized });
  } catch {
    res.status(502).json({ error: "Could not load market data." });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { fullName, email, password } = req.body || {};
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "fullName, email, and password are required." });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const db = await readDb();
  const exists = db.users.some((u) => u.email.toLowerCase() === normalizedEmail);
  if (exists) {
    return res.status(409).json({ error: "Email already exists." });
  }

  const user = {
    id: makeId("usr"),
    email: normalizedEmail,
    fullName: String(fullName).trim(),
    passwordHash: hashPassword(String(password)),
    balance: 0,
    role: "USER",
    isActive: true,
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  await writeDb(db);

  const token = signToken(user);
  res.status(201).json({ token, user: sanitizeUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required." });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const db = await readDb();
  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user || !verifyPassword(String(password), user.passwordHash)) {
    return res.status(401).json({ error: "Invalid credentials." });
  }
  if (!user.isActive) {
    return res.status(403).json({ error: "Account is suspended." });
  }

  const token = signToken(user);
  res.json({ token, user: sanitizeUser(user) });
});

app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body || {};
  const normalizedEmail = String(email || "").toLowerCase().trim();
  if (!normalizedEmail) {
    return res.status(400).json({ error: "email is required." });
  }

  const db = await readDb();
  db.passwordResets = Array.isArray(db.passwordResets) ? db.passwordResets : [];
  db.passwordResets = db.passwordResets.filter((entry) => new Date(entry.expiresAt).getTime() > Date.now());

  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  const rawToken = crypto.randomBytes(32).toString("hex");
  db.passwordResets.push({
    id: makeId("rst"),
    userId: user?.id || null,
    email: normalizedEmail,
    tokenHash: hashResetToken(rawToken),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  });
  await writeDb(db);

  const resetLink = `${getAppUrl(req)}/?reset_token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(normalizedEmail)}`;
  try {
    await sendResetEmail({ email: normalizedEmail, resetLink });
  } catch (err) {
    console.error("Failed to send reset email:", err);
    return res.status(500).json({ error: "Could not send reset email." });
  }

  res.json({ message: "If an account exists, a reset link has been sent." });
});

app.post("/api/auth/magic-link/request", async (req, res) => {
  const { email } = req.body || {};
  const normalizedEmail = String(email || "").toLowerCase().trim();
  if (!normalizedEmail) {
    return res.status(400).json({ error: "email is required." });
  }

  const db = await readDb();
  db.magicLinks = Array.isArray(db.magicLinks) ? db.magicLinks : [];
  db.magicLinks = db.magicLinks.filter((entry) => new Date(entry.expiresAt).getTime() > Date.now());

  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user || !user.isActive) {
    await writeDb(db);
    return res.json({ message: "If an account exists, a sign-in link has been issued." });
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  db.magicLinks.push({
    id: makeId("mlk"),
    userId: user.id,
    email: normalizedEmail,
    tokenHash: hashResetToken(rawToken),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  });
  await writeDb(db);

  const magicLink = `${getAppUrl(req)}/?magic_token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(normalizedEmail)}`;
  try {
    await sendMagicLinkEmail({ email: normalizedEmail, magicLink });
  } catch (err) {
    console.error("Failed to send magic link email:", err);
  }

  res.json({ message: "If an account exists, a sign-in link has been issued.", magicLink });
});

app.post("/api/auth/magic-link/consume", async (req, res) => {
  const { email, token } = req.body || {};
  const normalizedEmail = String(email || "").toLowerCase().trim();
  if (!normalizedEmail || !token) {
    return res.status(400).json({ error: "email and token are required." });
  }

  const db = await readDb();
  db.magicLinks = Array.isArray(db.magicLinks) ? db.magicLinks : [];

  const tokenHash = hashResetToken(String(token));
  const linkEntry = db.magicLinks.find((entry) =>
    entry.email.toLowerCase() === normalizedEmail &&
    entry.tokenHash === tokenHash &&
    new Date(entry.expiresAt).getTime() > Date.now()
  );

  if (!linkEntry) {
    return res.status(400).json({ error: "Invalid or expired magic link." });
  }

  const user = db.users.find((u) => u.id === linkEntry.userId);
  if (!user || !user.isActive) {
    return res.status(403).json({ error: "Account not available." });
  }

  db.magicLinks = db.magicLinks.filter((entry) => entry.id !== linkEntry.id);
  await writeDb(db);

  const signedToken = signToken(user);
  res.json({ token: signedToken, user: sanitizeUser(user) });
});

app.post("/api/auth/reset-password", async (req, res) => {
  const { email, token, newPassword } = req.body || {};
  const normalizedEmail = String(email || "").toLowerCase().trim();
  if (!normalizedEmail || !token || !newPassword) {
    return res.status(400).json({ error: "email, token and newPassword are required." });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const db = await readDb();
  db.passwordResets = Array.isArray(db.passwordResets) ? db.passwordResets : [];

  const tokenHash = hashResetToken(String(token));
  const resetEntry = db.passwordResets.find((entry) =>
    entry.email.toLowerCase() === normalizedEmail &&
    entry.tokenHash === tokenHash &&
    new Date(entry.expiresAt).getTime() > Date.now()
  );

  if (!resetEntry) {
    return res.status(400).json({ error: "Invalid or expired reset link." });
  }

  const user = db.users.find((u) => u.id === resetEntry.userId);
  if (user) {
    user.passwordHash = hashPassword(String(newPassword));
  }
  db.passwordResets = db.passwordResets.filter((entry) => entry.id !== resetEntry.id);
  await writeDb(db);

  res.json({ message: "Password reset successful." });
});

app.get("/api/me", authRequired, async (req, res) => {
  const { user } = await loadCurrentUser(req);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json(sanitizeUser(user));
});

app.get("/api/transactions", authRequired, async (req, res) => {
  const { db, user } = await loadCurrentUser(req);
  if (!user) return res.status(404).json({ error: "User not found." });

  const mine = db.transactions.filter((t) => t.userId === user.id);
  res.json(mine);
});

app.post("/api/transactions", authRequired, async (req, res) => {
  const { type, amount, method, planId } = req.body || {};
  if (!type || !amount || !method) {
    return res.status(400).json({ error: "type, amount, and method are required." });
  }
  if (!["DEPOSIT", "WITHDRAWAL", "INVESTMENT"].includes(type)) {
    return res.status(400).json({ error: "Invalid transaction type." });
  }
  const amountNumber = Number(amount);
  if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number." });
  }

  const { db, user } = await loadCurrentUser(req);
  if (!user) return res.status(404).json({ error: "User not found." });

  if ((type === "WITHDRAWAL" || type === "INVESTMENT") && amountNumber > user.balance) {
    return res.status(400).json({ error: "Insufficient balance." });
  }

  if (type === "INVESTMENT" && planId) {
    const plan = db.plans.find((p) => p.id === planId);
    if (!plan) return res.status(400).json({ error: "Invalid plan ID." });
    if (amountNumber < plan.minAmount || amountNumber > plan.maxAmount) {
      return res.status(400).json({ error: "Amount outside plan limits." });
    }
  }

  const transaction = {
    id: makeId("tx"),
    userId: user.id,
    userEmail: user.email,
    type,
    amount: amountNumber,
    status: "PENDING",
    date: new Date().toISOString(),
    method: String(method),
    planId: planId || null
  };

  db.transactions.unshift(transaction);
  await writeDb(db);
  res.status(201).json(transaction);
});

app.get("/api/admin/overview", authRequired, adminRequired, async (_req, res) => {
  const db = await readDb();
  const pendingTxs = db.transactions.filter((t) => t.status === "PENDING");
  const completedVolume = db.transactions
    .filter((t) => t.status === "COMPLETED")
    .reduce((sum, t) => sum + t.amount, 0);

  res.json({
    users: db.users.length,
    activeUsers: db.users.filter((u) => u.isActive).length,
    pendingTransactions: pendingTxs.length,
    completedVolume,
    pendingItems: pendingTxs.slice(0, 20)
  });
});

app.get("/api/admin/users", authRequired, adminRequired, async (_req, res) => {
  const db = await readDb();
  res.json(db.users.map(sanitizeUser));
});

app.patch("/api/admin/users/:id", authRequired, adminRequired, async (req, res) => {
  const { id } = req.params;
  const { role, isActive, balanceAdjustment } = req.body || {};
  const db = await readDb();
  const user = db.users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: "User not found." });

  if (role) {
    if (!["USER", "ADMIN"].includes(role)) return res.status(400).json({ error: "Invalid role." });
    user.role = role;
  }
  if (typeof isActive === "boolean") {
    user.isActive = isActive;
  }
  if (balanceAdjustment !== undefined) {
    const delta = Number(balanceAdjustment);
    if (!Number.isFinite(delta)) return res.status(400).json({ error: "Invalid balance adjustment." });
    user.balance = Math.max(0, user.balance + delta);
  }

  await writeDb(db);
  res.json(sanitizeUser(user));
});

app.post("/api/admin/users/reset-password", authRequired, adminRequired, async (req, res) => {
  const { email, newPassword } = req.body || {};
  const normalizedEmail = String(email || "").toLowerCase().trim();
  if (!normalizedEmail || !newPassword) {
    return res.status(400).json({ error: "email and newPassword are required." });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const db = await readDb();
  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) return res.status(404).json({ error: "User not found." });

  user.passwordHash = hashPassword(String(newPassword));
  await writeDb(db);
  res.json({ message: "Password reset successful." });
});

app.get("/api/admin/transactions", authRequired, adminRequired, async (_req, res) => {
  const db = await readDb();
  res.json(db.transactions);
});

app.patch("/api/admin/transactions/:id", authRequired, adminRequired, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!["PENDING", "COMPLETED", "REJECTED"].includes(status)) {
    return res.status(400).json({ error: "Invalid status." });
  }

  const db = await readDb();
  const tx = db.transactions.find((t) => t.id === id);
  if (!tx) return res.status(404).json({ error: "Transaction not found." });

  const previousStatus = tx.status;
  tx.status = status;

  // Apply accounting exactly once when moving into COMPLETED state.
  if (status === "COMPLETED" && previousStatus !== "COMPLETED") {
    const user = db.users.find((u) => u.id === tx.userId);
    if (user) {
      if (tx.type === "DEPOSIT") user.balance += tx.amount;
      if (tx.type === "WITHDRAWAL" || tx.type === "INVESTMENT") {
        user.balance = Math.max(0, user.balance - tx.amount);
      }
    }
  }

  await writeDb(db);
  res.json(tx);
});

app.patch("/api/admin/system-config", authRequired, adminRequired, async (req, res) => {
  const { btcAddress, ethAddress, usdtAddress } = req.body || {};
  const db = await readDb();

  db.systemConfig = {
    btcAddress: btcAddress || db.systemConfig.btcAddress,
    ethAddress: ethAddress || db.systemConfig.ethAddress,
    usdtAddress: usdtAddress || db.systemConfig.usdtAddress
  };

  await writeDb(db);
  res.json(db.systemConfig);
});

ensureAdminSeed()
  .then(() => {
    app.listen(port, () => {
      console.log(`Nexus backend running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize backend:", err);
    process.exit(1);
  });
