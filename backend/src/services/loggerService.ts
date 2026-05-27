import fs from "node:fs/promises";
import path from "node:path";

type LogLevel = "info" | "warn" | "error";

type LogEntry = {
  ts: string;
  level: LogLevel;
  event: string;
  data?: Record<string, unknown>;
};

const logsDir = path.resolve(process.cwd(), "logs");
const logFile = path.join(logsDir, "backend.log");

async function append(entry: LogEntry): Promise<void> {
  await fs.mkdir(logsDir, { recursive: true });
  await fs.appendFile(logFile, `${JSON.stringify(entry)}\n`, "utf8");
}

async function write(level: LogLevel, event: string, data?: Record<string, unknown>): Promise<void> {
  const entry: LogEntry = { ts: new Date().toISOString(), level, event, data };
  if (level === "error") {
    console.error(`[${entry.ts}] ${event}`, data || {});
  } else if (level === "warn") {
    console.warn(`[${entry.ts}] ${event}`, data || {});
  } else {
    console.log(`[${entry.ts}] ${event}`, data || {});
  }
  await append(entry).catch(() => undefined);
}

export function logInfo(event: string, data?: Record<string, unknown>): void {
  void write("info", event, data);
}

export function logWarn(event: string, data?: Record<string, unknown>): void {
  void write("warn", event, data);
}

export function logError(event: string, data?: Record<string, unknown>): void {
  void write("error", event, data);
}

export async function getRecentLogs(limit = 100): Promise<string[]> {
  try {
    const raw = await fs.readFile(logFile, "utf8");
    const lines = raw.trim().split(/\r?\n/).filter(Boolean);
    return lines.slice(-Math.max(1, Math.min(limit, 500)));
  } catch {
    return [];
  }
}
