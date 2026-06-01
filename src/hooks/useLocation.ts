import { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { storage } from '../utils/storage';

export interface LocationData {
  lat: number;
  lon: number;
  city?: string;
  country?: string;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCity = async (lat: number, lon: number): Promise<{ city: string; country: string }> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ar`
      );
      const data = await res.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        'موقعك الحالي';
      const country = data.address?.country || '';
      return { city, country };
    } catch {
      return { city: 'موقعك الحالي', country: '' };
    }
  };

  const getLocation = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      // Check cached location first (valid for 30 min)
      if (!forceRefresh) {
        const cached = await storage.get<{ data: LocationData; timestamp: number } | null>('location_cache', null);
        if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
          setLocation(cached.data);
          setLoading(false);
          return;
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      const { latitude: lat, longitude: lon } = position.coords;
      const { city, country } = await fetchCity(lat, lon);
      const data: LocationData = { lat, lon, city, country };
      setLocation(data);
      await storage.set('location_cache', { data, timestamp: Date.now() });
    } catch (err: any) {
      // Try to use last known location
      const cached = await storage.get<{ data: LocationData } | null>('location_cache', null);
      if (cached) {
        setLocation(cached.data);
      } else {
        setError('تعذّر الحصول على موقعك. يرجى تفعيل GPS.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return { location, loading, error, refresh: () => getLocation(true) };
}
