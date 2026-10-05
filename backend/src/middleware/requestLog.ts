import type { NextFunction, Request, Response } from 'express';
import { log } from '../log/logger';

/** 记录每个请求的进入与返回（含 query / body / 状态码 / 耗时）。 */
export function requestLog(req: Request, res: Response, next: NextFunction): void {
  const started = Date.now();
  const scope = `${req.method} ${req.originalUrl}`;

  const detail: Record<string, unknown> = {};
  if (Object.keys(req.query).length) detail.query = req.query;
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length) {
    detail.body = req.body;
  }
  log.info(scope, '收到请求', ...(Object.keys(detail).length ? [detail] : []));

  // 拦一层 res.json 以捕获响应体
  const originalJson = res.json.bind(res);
  let responseBody: unknown;
  let captured = false;
  res.json = ((body?: unknown) => {
    responseBody = body;
    captured = true;
    return originalJson(body);
  }) as typeof res.json;

  res.on('finish', () => {
    const summary = `返回 ${res.statusCode} · ${Date.now() - started}ms`;
    const args = captured ? [summary, responseBody] : [summary];

    if (res.statusCode >= 500) log.error(scope, ...args);
    else if (res.statusCode >= 400) log.warn(scope, ...args);
    else log.info(scope, ...args);
  });

  next();
}
