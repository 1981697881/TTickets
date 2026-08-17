export type PageResult<T = any> = {
  items: T[];
  page: number;
  lastPage: number;
  total: number;
};

/**
 * 兼容 0.5.5 常见返回：
 * 1) 数组本身挂 last_page / current_page（影院接口）
 * 2) Laravel 分页对象 { data, last_page, current_page, total }
 * 3) V8 大写 Data 列表
 */
export function normalizePage<T = any>(payload: any, fallbackPage = 1): PageResult<T> {
  if (Array.isArray(payload)) {
    const page = Number(payload.current_page ?? payload.currentPage ?? payload.page ?? fallbackPage) || fallbackPage;
    const lastPage = Number(
      payload.last_page ?? payload.lastPage ?? payload.total_page ?? payload.pages ?? page
    ) || page;
    const total = Number(payload.total ?? payload.length) || payload.length;
    return { items: [...payload], page, lastPage, total };
  }

  const source = payload && typeof payload === 'object' ? payload : {};
  const items = Array.isArray(source.data)
    ? source.data
    : Array.isArray(source.Data)
      ? source.Data
      : Array.isArray(source.list)
        ? source.list
        : Array.isArray(source.rows)
          ? source.rows
          : [];

  const page = Number(source.current_page ?? source.currentPage ?? source.page ?? fallbackPage) || fallbackPage;
  const lastPage = Number(
    source.last_page ?? source.lastPage ?? source.total_page ?? source.pages ?? page
  ) || page;
  const total = Number(source.total ?? items.length) || items.length;
  return { items, page, lastPage, total };
}

export function mergeUnique<T extends Record<string, any>>(
  current: T[] | null | undefined,
  incoming: T[] | null | undefined,
  key: keyof T | string = 'id',
  reset = false
): T[] {
  const base = reset ? [] : [...(current || [])];
  const seen = new Set(
    base.map(item => item?.[key as string]).filter(value => value !== undefined && value !== null)
  );
  for (const item of incoming || []) {
    const value = item?.[key as string];
    if (value === undefined || value === null || !seen.has(value)) {
      base.push(item);
      if (value !== undefined && value !== null) seen.add(value);
    }
  }
  return base;
}

export function createRequestGate() {
  let active = false;
  let sequence = 0;
  return {
    get active() {
      return active;
    },
    begin() {
      if (active) return null;
      active = true;
      sequence += 1;
      return sequence;
    },
    isLatest(token: number | null) {
      return token === sequence;
    },
    end(token: number | null) {
      if (token === sequence) active = false;
    },
    invalidate() {
      sequence += 1;
      active = false;
    }
  };
}

export function debounce<T extends (...args: any[]) => any>(fn: T, delay = 320) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const wrapped = function(this: any, ...args: Parameters<T>) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  } as T & { cancel: () => void };
  wrapped.cancel = () => clearTimeout(timer);
  return wrapped;
}
