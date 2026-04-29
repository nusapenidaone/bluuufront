import { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Map } from 'lucide-react';
import { loadGoogleMaps } from '../../lib/googleMaps';

const BALI_BOUNDS = { south: -9.0, west: 114.4, north: -7.9, east: 116.0 };
const BALI_CENTER = { lat: -8.719, lng: 115.169 }; // Kuta area

export default function AddressAutocomplete({ value, onChange, placeholder, className }) {
  const inputRef = useRef(null);
  const mapDivRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const debounceRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [dropdownRect, setDropdownRect] = useState(null);

  // Sync externally-controlled value (e.g. "same address" checkbox)
  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = value ?? '';
    }
  }, [value]);

  const fetchSuggestions = useCallback(async (input) => {
    if (!input || input.length < 2) { setSuggestions([]); return; }
    try {
      const google = await loadGoogleMaps();
      const bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(BALI_BOUNDS.south, BALI_BOUNDS.west),
        new google.maps.LatLng(BALI_BOUNDS.north, BALI_BOUNDS.east),
      );
      const { suggestions: raw } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        locationBias: bounds,
      });
      setSuggestions(raw ?? []);
      if (inputRef.current) setDropdownRect(inputRef.current.getBoundingClientRect());
      setOpen(true);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleInput = (e) => {
    const v = e.target.value;
    onChange(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 250);
  };

  const handleSelect = async (suggestion) => {
    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({ fields: ['formattedAddress', 'location'] });
      const addr = place.formattedAddress;
      onChange(addr);
      if (inputRef.current) inputRef.current.value = addr;
      const loc = place.location;
      if (loc) setLocation({ lat: loc.lat(), lng: loc.lng() });
    } catch {
      const text = suggestion.placePrediction.text?.text ?? '';
      onChange(text);
      if (inputRef.current) inputRef.current.value = text;
    }
    setSuggestions([]);
    setOpen(false);
  };

  const reverseGeocode = useCallback(async (latLng) => {
    const google = await loadGoogleMaps();
    const geocoder = new google.maps.Geocoder();
    const { results } = await geocoder.geocode({ location: latLng });
    if (results?.[0]) {
      const addr = results[0].formatted_address;
      onChange(addr);
      if (inputRef.current) inputRef.current.value = addr;
    }
  }, [onChange]);

  // Initialize or update map when showMap becomes true
  useEffect(() => {
    if (!showMap || !mapDivRef.current) return;
    const center = location ?? BALI_CENTER;
    loadGoogleMaps().then((google) => {
      if (!mapInstanceRef.current) {
        // First time: create the map
        mapInstanceRef.current = new google.maps.Map(mapDivRef.current, {
          zoom: location ? 15 : 11,
          center,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'cooperative',
          clickableIcons: false,
        });
        // Click on map → place / move marker + reverse geocode
        mapInstanceRef.current.addListener('click', (e) => {
          const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          setLocation(pos);
          if (!markerRef.current) {
            markerRef.current = new google.maps.Marker({
              position: pos,
              map: mapInstanceRef.current,
              draggable: true,
            });
            markerRef.current.addListener('dragend', (ev) => {
              const p = { lat: ev.latLng.lat(), lng: ev.latLng.lng() };
              setLocation(p);
              reverseGeocode(p);
            });
          } else {
            markerRef.current.setPosition(pos);
          }
          reverseGeocode(pos);
        });
        // Place marker immediately if we already have a location
        if (location) {
          markerRef.current = new google.maps.Marker({
            position: center,
            map: mapInstanceRef.current,
            draggable: true,
          });
          markerRef.current.addListener('dragend', (ev) => {
            const p = { lat: ev.latLng.lat(), lng: ev.latLng.lng() };
            setLocation(p);
            reverseGeocode(p);
          });
        }
      } else {
        // Map already exists: just re-center when location updates
        mapInstanceRef.current.setCenter(center);
        if (location && markerRef.current) markerRef.current.setPosition(center);
      }
    });
  }, [showMap, location, reverseGeocode]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          defaultValue={value}
          onChange={handleInput}
          onBlur={() => { clearTimeout(debounceRef.current); setTimeout(() => setOpen(false), 150); }}
          placeholder={placeholder}
          className={className}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setShowMap((v) => !v)}
          title={showMap ? 'Hide map' : 'Show on map'}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-secondary-500 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
        >
          <Map className="h-4 w-4" />
        </button>
      </div>

      {open && suggestions.length > 0 && dropdownRect && createPortal(
        <ul
          style={{
            position: 'fixed',
            top: dropdownRect.bottom + 4,
            left: dropdownRect.left,
            width: dropdownRect.width,
            zIndex: 9999,
          }}
          className="overflow-hidden rounded-lg border border-neutral-200 bg-white text-sm shadow-lg"
        >
          {suggestions.map((s, i) => {
            const main = s.placePrediction.mainText?.text ?? '';
            const secondary = s.placePrediction.secondaryText?.text ?? '';
            return (
              <li
                key={i}
                onMouseDown={() => handleSelect(s)}
                className="flex cursor-pointer items-start gap-2 px-3 py-2.5 hover:bg-neutral-50"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                <div className="min-w-0">
                  <div className="truncate font-medium text-secondary-900">{main}</div>
                  {secondary && <div className="truncate text-xs text-secondary-400">{secondary}</div>}
                </div>
              </li>
            );
          })}
        </ul>,
        document.body
      )}

      {showMap && (
        <div className="mt-2 overflow-hidden rounded-lg border border-neutral-200">
          <div ref={mapDivRef} className="h-52 w-full" />
          <div className="flex items-center gap-1.5 bg-neutral-50 px-3 py-1.5 text-xs text-secondary-400">
            <MapPin className="h-3 w-3 shrink-0" />
            Нажмите на карту чтобы поставить точку, или перетащите маркер
          </div>
        </div>
      )}
    </div>
  );
}
