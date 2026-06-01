import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from '../hooks/useLocation';

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

function calcQiblaAngle(lat: number, lon: number): number {
  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (KAABA_LAT * Math.PI) / 180;
  const Δλ = ((KAABA_LON - lon) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const angle = (Math.atan2(y, x) * 180) / Math.PI;
  return (angle + 360) % 360;
}

function calcDistance(lat: number, lon: number): number {
  const R = 6371;
  const dLat = ((KAABA_LAT - lat) * Math.PI) / 180;
  const dLon = ((KAABA_LON - lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat * Math.PI) / 180) * Math.cos((KAABA_LAT * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function QiblaPage() {
  const { location, loading, error, refresh } = useLocation();
  const [compassHeading, setCompassHeading] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [sensorSupported, setSensorSupported] = useState(true);
  const [permission, setPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const smoothRef = useRef(0);

  useEffect(() => {
    if (location) {
      setQiblaAngle(calcQiblaAngle(location.lat, location.lon));
      setDistance(calcDistance(location.lat, location.lon));
    }
  }, [location]);

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    let heading = 0;
    if ((e as any).webkitCompassHeading !== undefined) {
      heading = (e as any).webkitCompassHeading;
    } else if (e.alpha !== null) {
      heading = (360 - e.alpha) % 360;
    }
    // Smooth interpolation
    smoothRef.current = smoothRef.current * 0.85 + heading * 0.15;
    setCompassHeading(Math.round(smoothRef.current));
  }, []);

  const requestOrientation = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const result = await (DeviceOrientationEvent as any).requestPermission();
        if (result === 'granted') {
          setPermission('granted');
          window.addEventListener('deviceorientationevent', handleOrientation as any, true);
          window.addEventListener('deviceorientation', handleOrientation as any, true);
        } else {
          setPermission('denied');
        }
      } catch {
        setPermission('denied');
      }
    } else {
      setPermission('granted');
      window.addEventListener('deviceorientation', handleOrientation as any, true);
    }
  };

  useEffect(() => {
    if (!window.DeviceOrientationEvent) {
      setSensorSupported(false);
      return;
    }
    requestOrientation();
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation as any, true);
    };
  }, []);

  const needleAngle = qiblaAngle !== null ? qiblaAngle - compassHeading : 0;

  return (
    <div>
      <div className="page-header">
        <span style={{ fontSize: 24 }}>🧭</span>
        <h1>اتجاه القبلة</h1>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {/* Location info */}
        {location && (
          <div className="card" style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: 20, padding: '14px 10px' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>موقعك</p>
              <p style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 14, marginTop: 4 }}>{location.city || 'موقعك'}</p>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>الاتجاه</p>
              <p style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 14, marginTop: 4 }}>
                {qiblaAngle !== null ? `${Math.round(qiblaAngle)}°` : '—'}
              </p>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>المسافة</p>
              <p style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 14, marginTop: 4 }}>
                {distance ? `${distance.toLocaleString('ar')} كم` : '—'}
              </p>
            </div>
          </div>
        )}

        {loading && <div className="spinner" />}
        {error && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>{error}</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={refresh}>إعادة</button>
          </div>
        )}

        {/* Compass */}
        {qiblaAngle !== null && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative', width: 260, height: 260 }}>
              {/* Compass rose */}
              <svg width="260" height="260" viewBox="0 0 260 260" style={{ position: 'absolute', top: 0, left: 0 }}>
                {/* Outer ring */}
                <circle cx="130" cy="130" r="125" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="2" />
                <circle cx="130" cy="130" r="115" fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
                {/* Cardinal directions */}
                {[
                  { label: 'ش', angle: 0 },
                  { label: 'ق', angle: 90 },
                  { label: 'ج', angle: 180 },
                  { label: 'غ', angle: 270 },
                ].map(({ label, angle }) => {
                  const rad = ((angle - compassHeading) * Math.PI) / 180;
                  const x = 130 + 96 * Math.sin(rad);
                  const y = 130 - 96 * Math.cos(rad);
                  return (
                    <text key={label} x={x} y={y + 5} textAnchor="middle" fill={angle === 0 ? '#E57373' : 'var(--text-secondary)'} fontSize="16" fontWeight="700" fontFamily="sans-serif">
                      {label}
                    </text>
                  );
                })}
                {/* Degree marks */}
                {Array.from({ length: 36 }, (_, i) => {
                  const a = (i * 10 - compassHeading) * Math.PI / 180;
                  const r1 = i % 9 === 0 ? 108 : 113;
                  return (
                    <line key={i}
                      x1={130 + r1 * Math.sin(a)} y1={130 - r1 * Math.cos(a)}
                      x2={130 + 120 * Math.sin(a)} y2={130 - 120 * Math.cos(a)}
                      stroke="var(--border)" strokeWidth={i % 9 === 0 ? 2 : 1}
                    />
                  );
                })}
              </svg>

              {/* Qibla needle */}
              <svg
                width="260" height="260" viewBox="0 0 260 260"
                style={{ position: 'absolute', top: 0, left: 0, transform: `rotate(${needleAngle}deg)`, transformOrigin: 'center', transition: 'transform 0.15s ease-out' }}
              >
                {/* Needle pointing to Qibla */}
                <polygon points="130,30 122,130 130,145 138,130" fill="var(--gold)" />
                <polygon points="130,230 122,130 130,145 138,130" fill="var(--text-muted)" />
                <circle cx="130" cy="130" r="10" fill="var(--bg-surface)" stroke="var(--gold)" strokeWidth="2" />
                {/* Kaaba icon at needle tip */}
                <text x="130" y="20" textAnchor="middle" fontSize="16">🕋</text>
              </svg>

              {/* Center dot */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 14, height: 14, borderRadius: '50%',
                background: 'var(--gold)', boxShadow: '0 0 8px var(--gold)',
              }} />
            </div>

            {/* Compass heading */}
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              الاتجاه الحالي: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{compassHeading}°</span>
            </p>

            {!sensorSupported && (
              <div className="card" style={{ textAlign: 'center', padding: 16 }}>
                <p style={{ color: 'var(--warning)', fontSize: 14 }}>⚠️ مستشعر البوصلة غير متاح</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>
                  الاتجاه المحسوب: {qiblaAngle !== null ? `${Math.round(qiblaAngle)}°` : '—'} من الشمال
                </p>
              </div>
            )}

            {permission === 'denied' && (
              <div className="card" style={{ textAlign: 'center', padding: 16 }}>
                <p style={{ color: 'var(--warning)', fontSize: 14 }}>⚠️ البوصلة تحتاج إذن</p>
                <button className="btn-primary" style={{ marginTop: 10 }} onClick={requestOrientation}>
                  منح الإذن
                </button>
              </div>
            )}

            <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', maxWidth: 240 }}>
              وجّه الهاتف حتى يشير السهم الذهبي ناحية الكعبة المشرفة
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
