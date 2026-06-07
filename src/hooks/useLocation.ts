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
        city: data.address?.city || data.address?.town || data.address?.village || 'موقعك',
        country: data.address?.country || '',
      };
    } catch {
      return { city: 'موقعك', country: '' };
    }
  };

  const tryBrowserGeo = (): Promise<{ lat: number; lon: number }> =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject('غير مدعوم');
      navigator.geolocation.getCurrentPosition(
        p => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
        err => reject(err.message),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

  const getLocation = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      // من الكاش أولاً
      if (!forceRefresh) {
        const cached = await storage.get<{ data: LocationData; ts: number } | null>('loc_cache', null);
        if (cached && Date.now() - cached.ts < 30 * 60 * 1000) {
          setLocation(cached.data);
          setLoading(false);
          return;
        }
      }

      let lat = 0, lon = 0;

      // محاولة 1: Capacitor Geolocation
      try {
        await Geolocation.requestPermissions();
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 8000,
        });
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
      } catch {
        // محاولة 2: Browser Geolocation
        const pos = await tryBrowserGeo();
        lat = pos.lat;
        lon = pos.lon;
      }

      const { city, country } = await fetchCity(lat, lon);
      const data: LocationData = { lat, lon, city, country };
      setLocation(data);
      await storage.set('loc_cache', { data, ts: Date.now() });
    } catch {
      // آخر موقع محفوظ
      const cached = await storage.get<{ data: LocationData } | null>('loc_cache', null);
      if (cached) {
        setLocation(cached.data);
      } else {
        setError('يرجى الذهاب لإعدادات الهاتف ← التطبيقات ← صلاتي ← الأذونات ← الموقع ← السماح');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getLocation(); }, []);

  return { location, loading, error, refresh: () => getLocation(true) };
                             }
