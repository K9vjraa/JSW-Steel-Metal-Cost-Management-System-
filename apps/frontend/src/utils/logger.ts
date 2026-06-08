export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  context?: any;
}

const STORAGE_KEY = "mcms_diagnostic_logs";
const MAX_LOGS = 50;

// Load logs initially
let logBuffer: LogEntry[] = [];
try {
  const persisted = sessionStorage.getItem(STORAGE_KEY);
  if (persisted) {
    logBuffer = JSON.parse(persisted);
  }
} catch {
  // Swallow storage errors safely
}

function persistLogs() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(logBuffer));
  } catch {
    // Ignore storage quota errors
  }
}

function pushLog(level: "info" | "warn" | "error", message: string, context?: any) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context
  };

  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOGS) {
    logBuffer.shift(); // Keep standard ring-buffer size
  }

  persistLogs();

  // Pipe to native console
  if (level === "error") {
    console.error(`[MCMS ${level.toUpperCase()}] ${message}`, context || "");
  } else if (level === "warn") {
    console.warn(`[MCMS ${level.toUpperCase()}] ${message}`, context || "");
  } else {
    console.log(`[MCMS ${level.toUpperCase()}] ${message}`, context || "");
  }
}

export const logger = {
  info: (message: string, context?: any) => pushLog("info", message, context),
  warn: (message: string, context?: any) => pushLog("warn", message, context),
  error: (message: string, context?: any) => pushLog("error", message, context),
  
  getLogs: (): LogEntry[] => [...logBuffer],
  
  clear: () => {
    logBuffer = [];
    persistLogs();
  },

  exportDiagnostics: (actor?: { email: string; role: string; name: string }) => {
    const diagnosticPayload = {
      app: "JSW Steel Metal Cost Management System (MCMS)",
      timestamp: new Date().toISOString(),
      environment: import.meta.env.MODE,
      navigator: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        online: navigator.onLine,
        cookieEnabled: navigator.cookieEnabled
      },
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio
      },
      state: {
        url: window.location.href,
        path: window.location.pathname,
        actor: actor ? { name: actor.name, email: actor.email, role: actor.role } : "UNAUTHENTICATED"
      },
      recentLogs: logBuffer
    };

    return JSON.stringify(diagnosticPayload, null, 2);
  }
};

export default logger;
