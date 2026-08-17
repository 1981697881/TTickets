export function isApiSuccess(response: any): boolean {
  if (!response || typeof response !== 'object') return false;
  return (
    response.flag === true ||
    response.flag === 1 ||
    response.flag === 'true' ||
    response.code === 1 ||
    response.code === '1'
  );
}

export function extractArray(payload: any, keys: string[] = ['Data', 'data', 'list', 'rows']): any[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  for (const key of ['Data', 'data', 'result']) {
    if (payload[key] && typeof payload[key] === 'object') {
      const nested = extractArray(payload[key], keys);
      if (nested.length) return nested;
    }
  }

  return [];
}

export function unwrapPayload<T = any>(payload: T): any {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return payload;
  const source = payload as Record<string, any>;
  return source.Data ?? source.data ?? source.result ?? payload;
}
