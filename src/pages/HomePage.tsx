import { useState, useEffect, useRef } from 'react';
import { useLocation } from '../hooks/useLocation';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { useNotifications } from '../hooks/useNotifications';
import { toHijri, formatHijri } from '../utils/hijriDate';
import { storage } from '../utils/storage';

const PRAYER_ICONS: Record<string, string> = {
  fajr: '🌄', sunrise: '🌅', dhuhr: '☀️', asr: '🌤️', maghrib: '🌇', isha: '🌙',
};

export default function HomePage() {
  const { location, loading: locLoading, error: locError, refresh } = useLocation();
  const { prayers, getNextPrayer, getTimeUntilNext, updateNotify } = usePrayerTimes(location);
  const { schedulePrayerNotifications } = useNotifications();
  const [countdown, setCountdown] = useState('');
  const [perPrayerVoice, setPerPrayerVoice] = useState<Record<string, string>>({});
  const [iqamaEnabled, setIqamaEnabled] = useState(true);
  const [iqamaDelay, setIqamaDelay] = useState(10);
  const intervalRef = useRef<any>(null);

  const hijriDate = toHijri(new Date());
  const today = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  useEffect(() => {
    storage.get<Record<string, string>>('per_prayer_voice', {}).then(setPerPrayerVoice);
    storage.get<boolean>('iqama_enabled', true).then(setIqamaEnabled);
    storage.get<number>('iqama_delay', 10).then(setIqamaDelay);
  }, []);

  useEffect(() => {
    if (prayers.length > 0)
      schedulePrayerNotifications(prayers, perPrayerVoice, iqamaEnabled, iqamaDelay);
  }, [prayers, perPrayerVoice, iqamaEnabled, iqamaDelay]);

  useEffect(() => {
    intervalRef.current = setInterval(() => setCountdown(getTimeUntilNext()), 1000);
    return () => clearInterval(intervalRef.current);
  }, [prayers]);

  const nextPrayer = getNextPrayer();

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0D1B2A,#1A2B3C)', padding: '20px 16px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>📍</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {locLoading ? 'جارٍ تحديد الموقع...' : locError ? 'تعذّر تحديد الموقع' : `${location?.city}${location?.country ? '، ' + location.country : ''}`}
            </span>
          </div>
          <button onClick={refresh} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 20, cursor: 'pointer' }}>⟳</button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>{today}</p>
        <p style={{ color: 'var(--gold)', fontSize: 14, fontWeight: 600 }}>{formatHijri(hijriDate)}</p>

        {nextPrayer && (
          <div style={{ marginTop: 20, background: 'rgba(200,169,110,0.1)', borderRadius: 14, padding: '14px 18px', border: '1px solid rgba(200,169,110,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4 }}>الصلاة القادمة</p>
              <p style={{ color: 'var(--gold)', fontSize: 20, fontWeight: 800 }}>
                {PRAYER_ICONS[nextPrayer.name]} {nextPrayer.nameAr}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>{nextPrayer.timeStr}</p>
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>متبقي</p>
              <p style={{ color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: 1 }}>{countdown || '—'}</p>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <p className="section-title" style={{ marginTop: 20 }}>مواقيت الصلاة</p>

        {locLoading && <div className="spinner" />}
        {locError && (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>{locError}</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={refresh}>إعادة المحاولة</button>
          </div>
        )}

        {prayers.length > 0 && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {prayers.map(prayer => (
              <div key={prayer.name} className={`prayer-row ${prayer.isNext ? 'next-prayer' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{PRAYER_ICONS[prayer.name]}</span>
                  <div>
                    <p style={{ fontWeight: prayer.isNext ? 700 : 500, fontSize: 16, color: prayer.isNext ? 'var(--gold)' : 'var(--text-primary)' }}>
                      {prayer.nameAr}
                    </p>
                    {prayer.isNext && <p style={{ fontSize: 11, color: 'var(--gold)', marginTop: 1 }}>⬅ الصلاة القادمة</p>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: prayer.isNext ? 'var(--gold)' : 'var(--text-primary)' }}>{prayer.timeStr}</p>
                  {prayer.name !== 'sunrise' && (
                    <label className="toggle">
                      <input type="checkbox" checked={prayer.notifyEnabled} onChange={e => updateNotify(prayer.name, e.target.checked)} />
                      <span className="toggle-slider" />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="section-title" style={{ marginTop: 24 }}>تذكيرات إسلامية</p>
        <IslamicDutiesWidget />
      </div>
    </div>
  );
}

function IslamicDutiesWidget() {
  const dayOfWeek = new Date().getDay();
  const duties = [
    { icon: '🌙', text: 'قيام الليل',              desc: 'الثلث الأخير من الليل' },
    { icon: '📖', text: 'الورد اليومي من القرآن',  desc: 'حافظ على وردك اليومي' },
    ...(dayOfWeek === 5 ? [{ icon: '📘', text: 'سورة الكهف', desc: 'اليوم الجمعة - اقرأ سورة الكهف' }] : []),
    { icon: '🤲', text: 'صيام الاثنين والخميس',    desc: 'سنة نبوية' },
    { icon: '⚪', text: 'صيام أيام البيض',          desc: '13 و14 و15 من كل شهر هجري' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {duties.map((d, i) => (
        <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
          <span style={{ fontSize: 26 }}>{d.icon}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: 14 }}>{d.text}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{d.desc}</p>
          </div>
          <span style={{ color: 'var(--green-light)', fontSize: 18 }}>✓</span>
        </div>
      ))}
    </div>
  );
}
