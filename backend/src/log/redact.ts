const MAX_ARRAY = 50;
const MAX_DEPTH = 8;

const DATA_URL = /^data:([^;,]+);base64,/;
const BASE64_CHARS = /^[A-Za-z0-9+/\r\n]+={0,2}$/;

/**
 * 生成一个可安全打印的副本。
 * 只折叠 base64 图片和二进制数据，其余内容（含 LLM 的 prompt / 返回文本）原样保留。
 */
export function redact(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;

  if (Buffer.isBuffer(value)) return `<Buffer ${value.length} 字节>`;
  if (value instanceof Uint8Array) return `<Uint8Array ${value.length} 字节>`;

  if (typeof value === 'string') return redactString(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'bigint') return `${value}n`;
  if (typeof value === 'function') return '[Function]';
  if (typeof value === 'symbol') return value.toString();

  if (depth > MAX_DEPTH) return '<层级过深>';

  if (Array.isArray(value)) {
    const items = value.slice(0, MAX_ARRAY).map((v) => redact(v, depth + 1));
    if (value.length > MAX_ARRAY) items.push(`…另有 ${value.length - MAX_ARRAY} 项`);
    return items;
  }

  const obj = value as Record<string, unknown>;

  // Buffer 被 JSON 序列化后的形状：{ type: 'Buffer', data: [1, 2, 3, …] }
  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return `<Buffer ${obj.data.length} 字节>`;
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) out[k] = redact(v, depth + 1);
  return out;
}

function redactString(s: string): string {
  const m = DATA_URL.exec(s);
  if (m) return `<base64 图片 ${m[1]}，共 ${s.length} 字符>`;

  // 裸 base64（无 data: 前缀）：够长且前 4KB 全是 base64 字符才判定
  if (s.length > 256 && BASE64_CHARS.test(s.slice(0, 4096))) {
    return `<base64 数据，共 ${s.length} 字符>`;
  }

  return s;
}
