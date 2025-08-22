/**
 * 轻量日志工具（无任何第三方依赖）
 * - 通过传入 name 作为模块名称前缀
 * - error 日志以红色显示 [name] 和 message
 * - 在浏览器环境使用 CSS 样式；在非浏览器（如 Node/原生容器控制台）使用 ANSI 转义
 */

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

/** 判断是否在浏览器环境（含 H5 端） */
const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined";

/** ANSI 颜色码（非浏览器环境使用） */
const ANSI = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
};

/** 将 message 统一为字符串（优先使用 Error.message） */
function toMessage(input: unknown): string {
  if (input instanceof Error) return input.message || String(input);
  if (typeof input === "string") return input;
  try {
    return JSON.stringify(input);
  } catch {
    return String(input);
  }
}

/** 创建带模块名前缀的 Logger */
export function createLogger(name: string): ILogger {
  const prefix = `[${name}]`;

  const info = (message?: unknown, ...args: unknown[]) => {
    if (isBrowser) {
      // 浏览器端使用默认颜色
      // [name] message, args
      console.log(
        `%c${prefix}%c ${toMessage(message)}`,
        "color:#1976d2;font-weight:600",
        "color:inherit",
        ...args
      );
    } else {
      // 终端端：蓝色前缀
      console.log(
        `${ANSI.blue}${ANSI.bold}${prefix}${ANSI.reset} ${toMessage(message)}`,
        ...args
      );
    }
  };

  const warn = (message?: unknown, ...args: unknown[]) => {
    if (isBrowser) {
      console.warn(
        `%c${prefix}%c ${toMessage(message)}`,
        "color:#f9a825;font-weight:600",
        "color:inherit",
        ...args
      );
    } else {
      console.warn(
        `${ANSI.yellow}${ANSI.bold}${prefix}${ANSI.reset} ${toMessage(
          message
        )}`,
        ...args
      );
    }
  };

  const error = (message?: unknown, ...args: unknown[]) => {
    const msg = toMessage(message);
    if (isBrowser) {
      // 整体红色显示模块名与 message
      console.error(
        `%c${prefix} ${msg}`,
        "color:#e53935;font-weight:700",
        ...args
      );
    } else {
      // 终端端使用 ANSI 红色突出模块名与 message
      console.error(
        `${ANSI.red}${ANSI.bold}${prefix} ${msg}${ANSI.reset}`,
        ...args
      );
    }
  };

  const debug = (message?: unknown, ...args: unknown[]) => {
    if (isBrowser) {
      console.debug(
        `%c${prefix}%c ${toMessage(message)}`,
        "color:#9e9e9e",
        "color:inherit",
        ...args
      );
    } else {
      console.debug(
        `${ANSI.gray}${prefix}${ANSI.reset} ${toMessage(message)}`,
        ...args
      );
    }
  };

  return { info, warn, error, debug };
}

/** 默认导出：方便直接 import createLogger from '.../logger' */
export default createLogger;
