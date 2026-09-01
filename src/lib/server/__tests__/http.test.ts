import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchWithTimeout } from '../http';

afterEach(() => vi.restoreAllMocks());

describe('fetchWithTimeout', () => {
	it('passes configured timeout to AbortController and clears timer on success', async () => {
		const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok', { status: 200 }));
		const response = await fetchWithTimeout('https://example.test', {}, 25);
		expect(response.status).toBe(200);
		expect(fetchMock).toHaveBeenCalledOnce();
		const request = fetchMock.mock.calls[0][1] as RequestInit;
		expect(request.signal).toBeInstanceOf(AbortSignal);
	});

	it('aborts a request that exceeds timeout', async () => {
		const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((_url, options) =>
			new Promise((_resolve, reject) => {
				options?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
			})
		);
		await expect(fetchWithTimeout('https://example.test', {}, 5)).rejects.toMatchObject({ name: 'AbortError' });
		expect(fetchMock).toHaveBeenCalledOnce();
	});
});
