import { redactPII } from "./privacy";

export type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  message: string;
  context?: string;
  data?: Record<string, any>;
  error?: Error | unknown;
}

function formatLog(level: LogLevel, payload: LogPayload) {
  const timestamp = new Date().toISOString();
  const safeData = payload.data ? redactPII(payload.data) : undefined;
  let safeError: string | undefined;

  if (payload.error instanceof Error) {
    safeError = redactPII(`${payload.error.name}: ${payload.error.message}`);
  } else if (payload.error) {
    safeError = redactPII(String(payload.error));
  }

  return {
    timestamp,
    level,
    context: payload.context || "SideQuest",
    message: redactPII(payload.message),
    ...(safeData ? { data: safeData } : {}),
    ...(safeError ? { error: safeError } : {}),
  };
}

export const logger = {
  info(message: string, data?: Record<string, any>, context?: string) {
    const formatted = formatLog("info", { message, data, context });
    console.log(JSON.stringify(formatted));
  },

  warn(message: string, error?: unknown, data?: Record<string, any>, context?: string) {
    const formatted = formatLog("warn", { message, error, data, context });
    console.warn(JSON.stringify(formatted));
  },

  error(message: string, error?: unknown, data?: Record<string, any>, context?: string) {
    const formatted = formatLog("error", { message, error, data, context });
    console.error(JSON.stringify(formatted));
  },
};
