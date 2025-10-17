export interface ILogger {
  /** 普通信息日志 */
  info: (message?: unknown, ...args: unknown[]) => void;
  /** 警告日志 */
  warn: (message?: unknown, ...args: unknown[]) => void;
  /** 错误日志（红色显示模块名与 message） */
  error: (message?: unknown, ...args: unknown[]) => void;
  /** 调试日志 */
  debug: (message?: unknown, ...args: unknown[]) => void;
}

function toMessage(input: unknown): string {
  if (input instanceof Error) return input.message || String(input);
  if (typeof input === "string") return input;
  try {
    return JSON.stringify(input);
  } catch {
    return String(input);
  }
}

export function createLogger(name: string, env: string): ILogger {
  // 在生产环境下，返回一个空实现的 logger，禁用所有日志输出
  if (env === "production") {
    const noop = () => {}; // 空操作函数
    return {
      info: noop,
      warn: noop,
      error: noop,
      debug: noop,
    };
  }
  const prefix = `[${name}]`;

  const info = (message?: unknown, ...args: unknown[]) => {
    console.log(`${prefix} ${toMessage(message)}`, ...args);
  };

  const warn = (message?: unknown, ...args: unknown[]) => {
    console.warn(`${prefix} ${toMessage(message)}`, ...args);
  };

  const error = (message?: unknown, ...args: unknown[]) => {
    const msg = toMessage(message);
    console.error(`${prefix} ${msg}`, ...args);
  };

  const debug = (message?: unknown, ...args: unknown[]) => {
    console.debug(`${prefix} ${toMessage(message)}`, ...args);
  };

  return { info, warn, error, debug };
}


export default createLogger;
