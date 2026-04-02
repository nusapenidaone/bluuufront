import { apiUrl } from './base';

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
    const res = await fetchWithRetry(apiUrl('tours/shared'));
    return await res.json();
}

export async function fetchTransfers() {
    const res = await fetchWithRetry(apiUrl('transfers'));
    return await res.json();
}

export async function fetchPrivateTransfers() {
    const res = await fetchWithRetry(apiUrl('transfers/private'));
    return await res.json();
}

export async function fetchSharedTransfers() {
    const res = await fetchWithRetry(apiUrl('transfers/shared'));
    return await res.json();
}

export async function fetchCovers() {
    const res = await fetchWithRetry(apiUrl('covers'));
    return await res.json();
}

export async function fetchPrivateCovers() {
    const res = await fetchWithRetry(apiUrl('covers/private'));
    return await res.json();
}

export async function fetchSharedCovers() {
    const res = await fetchWithRetry(apiUrl('covers/shared'));
    return await res.json();
}

export async function fetchFaq() {
    const res = await fetchWithRetry(apiUrl('faq'));
    return await res.json();
}

export async function fetchGallery() {
    const res = await fetchWithRetry(apiUrl('gallery'));
    return await res.json();
}
