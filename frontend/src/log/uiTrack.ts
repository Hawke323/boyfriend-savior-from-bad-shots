import { log } from './logger';

const INTERACTIVE =
  'button, a[href], input, select, textarea, ' +
  '[role="button"], [role="tab"], [role="checkbox"], [role="switch"], [role="menuitem"], ' +
  'summary, label[for]';

function describe(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 60);
  const parts = [`<${tag}>`];
  if (el.id) parts.push(`#${el.id}`);
  if (text) parts.push(`"${text}"`);

  if (el instanceof HTMLInputElement) {
    if (el.type === 'file') {
      const names = Array.from(el.files ?? []).map((f) => f.name);
      if (names.length) parts.push(`files=[${names.join(', ')}]`);
    } else if (el.value) {
      parts.push(`value="${el.value.slice(0, 40)}"`);
    }
  } else if (el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
    if (el.value) parts.push(`value="${el.value.slice(0, 40)}"`);
  }

  return parts.join(' ');
}

/**
 * 全局 UI 交互日志：不用每个组件手动加 log。
 * 捕获阶段监听，覆盖 click / change / submit 三类有意义的交互。
 */
export function setupUiLogging(): void {
  document.addEventListener(
    'click',
    (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const el = target.closest(INTERACTIVE);
      if (el) log.info('ui', 'click', describe(el));
    },
    true,
  );

  document.addEventListener(
    'change',
    (e) => {
      const el = e.target;
      if (el instanceof Element && el.matches('input, select, textarea')) {
        log.info('ui', 'change', describe(el));
      }
    },
    true,
  );

  document.addEventListener(
    'submit',
    (e) => {
      const el = e.target;
      if (el instanceof Element && el.matches('form')) {
        log.info('ui', 'submit', describe(el));
      }
    },
    true,
  );
}
