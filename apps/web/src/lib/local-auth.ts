import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

export const SESSION_COOKIE = "ravus_session";
export const SESSION_SECONDS = 60 * 60 * 24 * 7;

type StoredUser = { id: string; name: string; email: string; password_hash: string; salt: string };
export type PublicUser = Pick<StoredUser, "id" | "name" | "email">;

let database: DatabaseSync | undefined;

function getDatabase() {
  if (database) return database;
  const directory = join(process.cwd(), ".data");
  mkdirSync(directory, { recursive: true });
  const connection = new DatabaseSync(join(directory, "ravus-auth.sqlite"));
  connection.exec("PRAGMA journal_mode = WAL");
  connection.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
  `);
  database = connection;
  return connection;
}

function passwordHash(password: string, salt: string) {
  return scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validPassword(value: string) {
  return value.length >= 10 && value.length <= 128 && /[a-z]/i.test(value) && /\d/.test(value);
}

export function createUser(name: string, email: string, password: string): PublicUser | null {
  const db = getDatabase();
  const id = randomBytes(18).toString("hex");
  const salt = randomBytes(16).toString("hex");
  const result = db.prepare("INSERT OR IGNORE INTO users (id, name, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(id, name, email, passwordHash(password, salt).toString("hex"), salt, Date.now());
  return result.changes ? { id, name, email } : null;
}

export function verifyUser(email: string, password: string): PublicUser | null {
  const db = getDatabase();
  const user = db.prepare("SELECT id, name, email, password_hash, salt FROM users WHERE email = ?").get(email) as StoredUser | undefined;
  if (!user) return null;
  const actual = passwordHash(password, user.salt);
  const expected = Buffer.from(user.password_hash, "hex");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  return { id: user.id, name: user.name, email: user.email };
}

export function createSession(userId: string) {
  const db = getDatabase();
  const token = randomBytes(32).toString("base64url");
  db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(Date.now());
  db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .run(hashToken(token), userId, Date.now() + SESSION_SECONDS * 1000);
  return token;
}

export function getSessionUser(token: string | undefined): PublicUser | null {
  if (!token || token.length > 128) return null;
  const db = getDatabase();
  const user = db.prepare(`SELECT users.id, users.name, users.email FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?`)
    .get(hashToken(token), Date.now()) as PublicUser | undefined;
  return user ?? null;
}

export function deleteSession(token: string | undefined) {
  if (!token || token.length > 128) return;
  getDatabase().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === (request.headers.get("host") ?? new URL(request.url).host); }
  catch { return false; }
}
