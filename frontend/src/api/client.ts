import { log } from '../log/logger';

export interface ApiResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

export interface ApiOptions {
  method?: string;
  /** 普通对象走 JSON 序列化；FormData / Blob / string 原样透传 */
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * 前端所有后端调用的唯一出口。
 * 请求体、返回体、状态码、耗时都会打进 console（base64 自动折叠）。
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<ApiResult<T>> {
  const method = (options.method ?? 'GET').toUpperCase();
  const scope = `${method} ${path}`;
  const started = performance.now();

  const headers: Record<string, string> = { ...options.headers };
  let payload: BodyInit | undefined;

  if (typeof options.body === 'string' || options.body instanceof FormData || options.body instanceof Blob) {
    payload = options.body as BodyInit;
  } else if (options.body !== undefined) {
    payload = JSON.stringify(options.body);
    headers['Content-Type'] ??= 'application/json';
  }

  log.info(scope, '→ 请求', ...(options.body !== undefined ? [options.body] : []));

  let res: Response;
  try {
    res = await fetch(path, { method, body: payload, headers });
  } catch (err) {
    log.error(scope, `× 请求失败 · ${Math.round(performance.now() - started)}ms`, err);
    throw err;
  }

  const ms = Math.round(performance.now() - started);
  const text = await res.text();

  let data: unknown = text;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // 非 JSON 响应，保留原文
    }
  }

  const summary = `← 返回 ${res.status} · ${ms}ms`;
  if (!res.ok && res.status >= 500) log.error(scope, summary, data);
  else if (!res.ok) log.warn(scope, summary, data);
  else log.info(scope, summary, data);

  return { ok: res.ok, status: res.status, data: data as T };
}
