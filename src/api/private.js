import { fetchWithRetry } from './shared';
import { apiUrl } from './base';

export async function fetchPrivateTours() {
    const res = await fetchWithRetry(apiUrl('tours/private'));
    return await res.json();
}

export async function fetchTourDetail(slug) {
    const res = await fetchWithRetry(apiUrl(`tour/${slug}`));
    return await res.json();
}
