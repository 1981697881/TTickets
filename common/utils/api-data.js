export function isApiSuccess(response) {
	if (!response || typeof response !== 'object') return false;
	return response.flag === true || response.flag === 1 || response.flag === 'true' || response.code === 1 || response.code === '1';
}

export function extractArray(payload, keys = ['Data', 'data', 'list', 'rows']) {
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

export function unwrapPayload(payload) {
	if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return payload;
	return payload.Data ?? payload.data ?? payload.result ?? payload;
}
