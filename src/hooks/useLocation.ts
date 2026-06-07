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

  const fetchCity = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ar`
      );
      const data = await res.json();
      return {
        city: data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'موقعك',
        country: data.address?.country || '',
      };
    } catch {
      return { city: 'موقعك', country: '' };
    }
  };

  const getLocation = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      // طلب الإذن أولاً
      const perm = await Geolocation.requestPermissions();
      if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
        throw new Error('لم يتم منح إذن الموقع');
      }

      // تحقق من الكاش
      if (!forceRefresh) {
        const cached = await storage.get<{ data: LocationData; ts: number } | null>('loc_cache', null);
        if (cached && Date.now() - cached.ts < 30 * 60 * 1000) {
          setLocation(cached.data);
          setLoading(false);
          return;
        }
      }

      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      const { latitude: lat, longitude: lon } = pos.coords;
      const { city, country } = await fetchCity(lat, lon);
      const data: LocationData = { lat, lon, city, country };
      setLocation(data);
      await storage.set('loc_cache', { data, ts: Date.now() });
    } catch (err: any) {
      const cached = await storage.get<{ data: LocationData } | null>('loc_cache', null);
      if (cached) {
        setLocation(cached.data);
      } else {
        setError(err.message?.includes('إذن') ? err.message : 'تعذّر الحصول على موقعك. يرجى تفعيل GPS.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getLocation(); }, []);

  return { location, loading, error, refresh: () => getLocation(true) };
}
