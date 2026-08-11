export function normalizePage(payload, fallbackPage = 1) {
  if (Array.isArray(payload)) {
    return { items: payload, page: fallbackPage, lastPage: fallbackPage, total: payload.length };
  }

  const source = payload || {};
  const items = Array.isArray(source.data)
    ? source.data
    : Array.isArray(source.list)
      ? source.list
      : Array.isArray(source.rows)
        ? source.rows
        : [];

  const page = Number(source.current_page ?? source.currentPage ?? source.page ?? fallbackPage) || fallbackPage;
  const lastPage = Number(source.last_page ?? source.lastPage ?? source.total_page ?? source.pages ?? page) || page;
  const total = Number(source.total ?? items.length) || items.length;
  return { items, page, lastPage, total };
}

export function mergeUnique(current, incoming, key = 'id', reset = false) {
  const base = reset ? [] : [...(current || [])];
  const seen = new Set(base.map(item => item?.[key]).filter(value => value !== undefined && value !== null));
  for (const item of incoming || []) {
    const value = item?.[key];
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
    get active() { return active; },
    begin() {
      if (active) return null;
      active = true;
      sequence += 1;
      return sequence;
    },
    isLatest(token) { return token === sequence; },
    end(token) {
      if (token === sequence) active = false;
    },
    invalidate() {
      sequence += 1;
      active = false;
    }
  };
}

export function debounce(fn, delay = 320) {
  let timer;
  const wrapped = function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
  wrapped.cancel = () => clearTimeout(timer);
  return wrapped;
}
