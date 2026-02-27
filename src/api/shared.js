const API_BASE_URL = 'https://bluuu.tours/api/new';

/**
 * Shared fetch utility with retry logic
 */
export async function fetchWithRetry(url, options = {}, retries = 3, backoff = 1000) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            if (retries > 0 && (response.status >= 500 || response.status === 429)) {
                await new Promise(r => setTimeout(r, backoff));
                return fetchWithRetry(url, options, retries - 1, backoff * 2);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
    } catch (err) {
        if (retries > 0) {
            await new Promise(r => setTimeout(r, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw err;
    }
}

export async function fetchSharedTours() {
    const res = await fetchWithRetry(`${API_BASE_URL}/tours`);
    return await res.json();
}

export async function fetchTransfers() {
    const res = await fetchWithRetry(`${API_BASE_URL}/transfers`);
    return await res.json();
}

export async function fetchCovers() {
    const res = await fetchWithRetry(`${API_BASE_URL}/covers`);
    return await res.json();
}
