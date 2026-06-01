import { useState, useEffect } from 'react';
import { toHijri, isRamadan } from '../utils/hijriDate';
import { useLocation } from '../hooks/useLocation';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { storage } from '../utils/storage';

interface DayEntry {
  day: number;
  date: string;
  suhoor: string;
  iftar: string;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getRamadanImsakia(location: { lat: number; lon: number }): DayEntry[] {
  const entries: DayEntry[] = [];
  const coords = new Coordinates(location.lat, location.lon);
  const params = CalculationMethod.Egyptian();
  const now = new Date();

  for (let d = 0; d < 30; d++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDate() + 1 + d);
    const times = new PrayerTimes(coords, date, params);
    entries.push({
      day: d + 1,
      date: date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }),
      suhoor: formatTime(times.fajr),
      iftar: formatTime(times.maghrib),
    });
  }
  return entries;
}

export default function RamadanPage() {
  const { location } = useLocation();
  const [imsakia, setImsakia] = useState<DayEntry[]>([]);
  const [todayHijri] = useState(toHijri(new Date()));
  const [inRamadan] = useState(isRamadan());
  const [suhoorReminder, setSuhoorReminder] = useState(true);
  const [iftarReminder, setIftarReminder] = useState(true);
  const [tab, setTab] = useState<'imsakia' | 'info'>('imsakia');

  useEffect(() => {
    storage.get<boolean>('suhoor_reminder', true).then(setSuhoorReminder);
    storage.get<boolean>('iftar_reminder', true).then(setIftarReminder);
  }, []);

  useEffect(() => {
    if (location) setImsakia(getRamadanImsakia(location));
  }, [location]);

  const ramadanDay = inRamadan ? todayHijri.day : null;
  const todayEntry = (inRamadan && ramadanDay) ? imsakia[ramadanDay - 1] : null;

  return (
    <div>
      <div className="page-header">
        <span style={{ fontSize: 24 }}>🌙</span>
        <h1>رمضان المبارك</h1>
      </div>

      <div style={{
        margin: '16px 16px 0', borderRadius: 14,
        background: 'linear-gradient(135deg, #1A2B3C, #0D1B2A)',
        border: '1px solid rgba(200,169,110,0.3)', padding: 20, textAlign: 'center',
      }}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>🌙✨</p>
        {inRamadan ? (
          <>
            <p style={{ color: 'var(--gold)', fontSize: 20, fontWeight: 800 }}>رمضان كريم</p>
            <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>اليوم {ramadanDay} من رمضان</p>
          </>
        ) : (
          <>
            <p style={{ color: 'var(--gold)', fontSize: 18, fontWeight: 700 }}>رمضان قادم</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 6 }}>
              الشهر الحالي: {todayHijri.monthName}
            </p>
          </>
        )}
      </div>

      {todayEntry && (
        <div style={{ padding: '16px 16px 0' }}>
          <div className="card" style={{ display: 'flex', justifyContent: 'space-around', padding: '16px 10px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 28 }}>🌄</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>السحور</p>
              <p style={{ color: 'var(--gold)', fontWeight: 800, fontSize: 18, marginTop: 4 }}>{todayEntry.suhoor}</p>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 28 }}>🌇</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>الإفطار</p>
              <p style={{ color: 'var(--gold)', fontWeight: 800, fontSize: 18, marginTop: 4 }}>{todayEntry.iftar}</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '16px 16px 0' }}>
        <div className="card">
          <p className="section-title" style={{ marginBottom: 14 }}>تذكيرات رمضان</p>
          {[
            { key: 'suhoor', label: 'تذكير السحور', icon: '🌄', val: suhoorReminder, set: setSuhoorReminder },
            { key: 'iftar', label: 'تذكير الإفطار', icon: '🌇', val: iftarReminder, set: setIftarReminder },
          ].map(item => (
            <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <p style={{ fontSize: 14 }}>{item.label}</p>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={item.val} onChange={async e => {
                  item.set(e.target.checked);
                  await storage.set(`${item.key}_reminder`, e.target.checked);
                }} />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', gap: 10 }}>
        {(['imsakia', 'info'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '10px', borderRadius: 10,
            background: tab === t ? 'var(--gold)' : 'var(--bg-card)',
            color: tab === t ? '#0D1B2A' : 'var(--text-secondary)',
            border: `1px solid ${tab === t ? 'var(--gold)' : 'var(--border)'}`,
            fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {t === 'imsakia' ? '📅 الإمساكية' : 'ℹ️ معلومات'}
          </button>
        ))}
      </div>

      {tab === 'imsakia' && (
        <div style={{ padding: '12px 16px 20px' }}>
          {imsakia.length === 0 && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>
              جارٍ تحديد الموقع لعرض الإمساكية...
            </p>
          )}
          {imsakia.length > 0 && (
            <div>
              <div style={{
                display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr',
                padding: '8px 12px', background: 'var(--bg-surface)',
                borderRadius: '10px 10px 0 0', border: '1px solid var(--border)',
                fontSize: 12, color: 'var(--text-muted)', fontWeight: 700,
              }}>
                <span>يوم</span><span>التاريخ</span><span>السحور</span><span>الإفطار</span>
              </div>
              {imsakia.map(entry => (
                <div key={entry.day} style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr',
                  padding: '10px 12px', fontSize: 13,
                  background: entry.day === ramadanDay ? 'rgba(200,169,110,0.1)' : 'var(--bg-card)',
                  border: '1px solid var(--border)', borderTop: 'none',
                }}>
                  <span style={{ color: entry.day === ramadanDay ? 'var(--gold)' : 'var(--text-secondary)', fontWeight: entry.day === ramadanDay ? 700 : 400 }}>{entry.day}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{entry.date}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{entry.suhoor}</span>
                  <span style={{ color: 'var(--gold)' }}>{entry.iftar}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'info' && (
        <div style={{ padding: '12px 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '📿', title: 'فضل رمضان', text: 'شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ (البقرة: 185)' },
            { icon: '🌙', title: 'ليلة القدر', text: 'خير من ألف شهر - ابحث عنها في الأوتار من العشر الأواخر' },
            { icon: '🤲', title: 'الاعتكاف', text: 'سنة في العشر الأواخر من رمضان' },
            { icon: '💝', title: 'الزكاة والصدقة', text: 'أفضل الصدقة صدقة في رمضان - تضاعف الحسنات' },
            { icon: '📖', title: 'ختم القرآن', text: 'استهدف ختم القرآن مرة على الأقل - جزء يومياً' },
          ].map((item, i) => (
            <div key={i} className="card" style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--gold)', marginBottom: 6 }}>{item.title}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7 }}>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
