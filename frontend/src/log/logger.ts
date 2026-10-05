import { redact } from './redact';

type Level = 'info' | 'warn' | 'error';

const LEVEL_STYLE: Record<Level, string> = {
  info: 'color:#0a7ea4;font-weight:600',
  warn: 'color:#b8860b;font-weight:600',
  error: 'color:#c0392b;font-weight:600',
};
const DIM_STYLE = 'color:#999';

function timestamp(): string {
  const d = new Date();
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`;
}

/** 终端桥专用：Error 转文本，其余统一脱敏，保证可 JSON 序列化且不带 base64 过网络。 */
function toTerminalArg(a: unknown): unknown {
  if (a instanceof Error) return a.stack ?? `${a.name}: ${a.message}`;
  return redact(a);
}

function emit(level: Level, scope: string, args: unknown[]): void {
  const ts = timestamp();

  // 1) 浏览器 DevTools Console（带颜色）
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  fn(
    '%c%s %c%s %c%s',
    DIM_STYLE,
    ts,
    LEVEL_STYLE[level],
    level.toUpperCase().padEnd(5),
    DIM_STYLE,
    `[${scope}]`,
    ...args.map((a) => (a instanceof Error ? a : redact(a))),
  );

  // 2) 终端桥：回显到跑 npm run dev 的 cmd（仅 dev；构建产物里 import.meta.hot 为 undefined）
  if (import.meta.hot) {
    import.meta.hot.send('claude-log', {
      level,
      scope,
      timestamp: ts,
      args: args.map(toTerminalArg),
    });
  }
}

/**
 * 前端唯一的日志出口。0.3/0.4 打 LLM 请求与流式返回也走这里，
 * base64 图片由 redact 统一折叠，不会进 Console 也不会回显到终端。
 */
export const log = {
  info: (scope: string, ...args: unknown[]) => emit('info', scope, args),
  warn: (scope: string, ...args: unknown[]) => emit('warn', scope, args),
  error: (scope: string, ...args: unknown[]) => emit('error', scope, args),
};
