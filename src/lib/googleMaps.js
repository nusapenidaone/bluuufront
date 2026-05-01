let promise = null;

export function loadGoogleMaps() {
  if (promise) return promise;
  if (window.google?.maps?.places) {
    promise = Promise.resolve(window.google);
    return promise;
  }
  promise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    s.async = true;
    s.onload = () => resolve(window.google);
    s.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(s);
  });
  return promise;
}
