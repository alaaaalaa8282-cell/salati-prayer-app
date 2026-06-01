import { useState, useEffect } from 'react';
import { useLocation } from '../hooks/useLocation';

interface Mosque {
  id: number;
  name: string;
  lat: number;
  lon: number;
  distance: number; // km
}

function calcDist(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function MosquesPage() {
  const { location, loading: locLoading, error: locError, refresh } = useLocation();
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [radius, setRadius] = useState(3000); // meters

  useEffect(() => {
    if (location) fetchMosques();
  }, [location, radius]);

  const fetchMosques = async () => {
    if (!location) return;
    setLoading(true);
    setError('');
    try {
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${location.lat},${location.lon});
          way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${location.lat},${location.lon});
        );
        out center;
      `.trim();

      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
      });
      const data = await res.json();

      const list: Mosque[] = data.elements
        .map((el: any) => {
          const lat = el.lat ?? el.center?.lat;
          const lon = el.lon ?? el.center?.lon;
          if (!lat || !lon) return null;
          return {
            id: el.id,
            name: el.tags?.name || el.tags?.['name:ar'] || 'مسجد',
            lat,
            lon,
            distance: calcDist(location.lat, location.lon, lat, lon),
          };
        })
        .filter(Boolean)
        .sort((a: Mosque, b: Mosque) => a.distance - b.distance)
        .slice(0, 30);

      setMosques(list);
      if (list.length === 0) setError('لا توجد مساجد في هذا النطاق. جرّب توسيع نطاق البحث.');
    } catch {
      setError('تعذّر تحميل المساجد. تحقق من اتصالك بالإنترنت.');
    } finally {
      setLoading(false);
    }
  };

  const openMaps = (mosque: Mosque) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}&travelmode=walking`;
    window.open(url, '_blank');
  };

  const formatDist = (d: number) => {
    if (d < 1) return `${Math.round(d * 1000)} م`;
    return `${d.toFixed(1)} كم`;
  };

  return (
    <div>
      <div className="page-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🕌</span>
          <h1>أقرب المساجد</h1>
        </div>
        <button
          onClick={fetchMosques}
          style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 20, cursor: 'pointer' }}
        >⟳</button>
      </div>

      {/* Radius selector */}
      <div style={{ padding: '12px 16px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {[1000, 3000, 5000, 10000].map(r => (
          <button
            key={r}
            onClick={() => setRadius(r)}
            style={{
              background: radius === r ? 'var(--gold)' : 'var(--bg-card)',
              color: radius === r ? '#0D1B2A' : 'var(--text-secondary)',
              border: `1px solid ${radius === r ? 'var(--gold)' : 'var(--border)'}`,
              borderRadius: 20, padding: '6px 14px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
          >
            {r < 1000 ? `${r} م` : `${r / 1000} كم`}
          </button>
        ))}
      </div>

      {/* Location bar */}
      {location && (
        <div style={{ padding: '4px 16px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>📍</span>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{location.city || 'موقعك الحالي'}</p>
        </div>
      )}

      {/* States */}
      {(locLoading || loading) && <div className="spinner" />}

      {(locError || error) && (
        <div style={{ textAlign: 'center', padding: '24px 20px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>{locError || error}</p>
          <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={locError ? refresh : fetchMosques}>
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Mosques list */}
      {!loading && !error && mosques.length > 0 && (
        <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>
            {mosques.length} مسجد بالقرب منك
          </p>
          {mosques.map((mosque, i) => (
            <div key={mosque.id} className="card" style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px' }}>
              {/* Rank */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: i === 0 ? 'rgba(200,169,110,0.2)' : 'var(--bg-surface)',
                border: `1px solid ${i === 0 ? 'var(--gold)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: i === 0 ? 18 : 14,
                flexShrink: 0,
              }}>
                {i === 0 ? '🕌' : i + 1}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }} className="text-truncate">
                  {mosque.name}
                </p>
                <p style={{ color: 'var(--gold)', fontSize: 13, fontWeight: 600 }}>
                  📍 {formatDist(mosque.distance)}
                </p>
              </div>

              <button
                onClick={() => openMaps(mosque)}
                style={{
                  background: 'var(--green)', border: 'none',
                  borderRadius: 8, padding: '8px 12px',
                  color: '#fff', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                }}
              >
                🗺 الطريق
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
