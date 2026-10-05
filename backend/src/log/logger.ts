import { redact } from './redact';

type Level = 'info' | 'warn' | 'error';

const COLORS: Record<Level, string> = {
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

function timestamp(): string {
  const d = new Date();
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`;
}

function format(arg: unknown): string {
  if (arg instanceof Error) return arg.stack ?? `${arg.name}: ${arg.message}`;

  const safe = redact(arg);
  if (typeof safe === 'string') return safe;

  try {
    return JSON.stringify(safe, null, 2);
  } catch {
    return String(safe);
  }
}

function emit(level: Level, scope: string, args: unknown[]): void {
  const head =
    `${DIM}${timestamp()}${RESET} ` +
    `${COLORS[level]}${level.toUpperCase().padEnd(5)}${RESET} ` +
    `${DIM}[${scope}]${RESET}`;
  const line = args.length ? `${head} ${args.map(format).join(' ')}` : head;

  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

/**
 * 全项目唯一的日志出口。0.3 起打 LLM 请求/响应也走这里，
 * base64 图片由 redact 统一折叠，不会进终端。
 */
export const log = {
  info: (scope: string, ...args: unknown[]) => emit('info', scope, args),
  warn: (scope: string, ...args: unknown[]) => emit('warn', scope, args),
  error: (scope: string, ...args: unknown[]) => emit('error', scope, args),
};
