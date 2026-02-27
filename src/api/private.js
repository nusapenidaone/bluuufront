import { fetchWithRetry } from './shared';

const API_BASE_URL = 'https://bluuu.tours/api/new';

export async function fetchPrivateTours() {
    const res = await fetchWithRetry(`${API_BASE_URL}/private-tours`);
    return await res.json();
}

export async function fetchTourDetail(slug) {
    const res = await fetchWithRetry(`${API_BASE_URL}/tour/${slug}`);
    return await res.json();
}
