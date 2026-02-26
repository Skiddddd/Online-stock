import crypto from "node:crypto";
import jwt from "jsonwebtoken";

const DEFAULT_SECRET = "change-this-in-production";

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  const [salt, key] = (storedHash || "").split(":");
  if (!salt || !key) return false;
  const hashBuffer = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, "hex");
  if (hashBuffer.length !== keyBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, keyBuffer);
}

export function signToken(user) {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    secret,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  return jwt.verify(token, secret);
}

export function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
