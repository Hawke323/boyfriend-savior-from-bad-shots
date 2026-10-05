import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * 浏览器 → Vite dev server 的日志桥：
 * 前端 logger 用 import.meta.hot.send('claude-log', …) 把日志发回来，
 * 这里打印到跑 npm run dev 的终端，和看后端日志一样直接看前端日志。
 * 仅 dev 生效（构建时不走 configureServer）。
 */
function terminalLog(): Plugin {
  const COLORS: Record<string, string> = {
    info: '\x1b[36m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
  };
  const DIM = '\x1b[2m';
  const RESET = '\x1b[0m';

  function formatArg(a: unknown): string {
    if (typeof a === 'string') return a;
    try {
      return JSON.stringify(a, null, 2);
    } catch {
      return String(a);
    }
  }

  return {
    name: 'terminal-log',
    configureServer(server) {
      server.ws.on('claude-log', (data) => {
        const { level, scope, timestamp: ts, args } = data as {
          level: 'info' | 'warn' | 'error';
          scope: string;
          timestamp: string;
          args: unknown[];
        };
        const c = COLORS[level] ?? '';
        const head =
          `${DIM}${ts}${RESET} ` +
          `${c}${level.toUpperCase().padEnd(5)}${RESET} ` +
          `${DIM}[${scope}]${RESET}`;
        const line = args?.length ? `${head} ${args.map(formatArg).join(' ')}` : head;

        const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
        fn(line);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), terminalLog()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
