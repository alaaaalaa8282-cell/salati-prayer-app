import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const PRAYERS = [
  { key: 'fajr',    name: 'الفجر',   icon: '🌄' },
  { key: 'dhuhr',   name: 'الظهر',   icon: '☀️' },
  { key: 'asr',     name: 'العصر',   icon: '🌤️' },
  { key: 'maghrib', name: 'المغرب',  icon: '🌇' },
  { key: 'isha',    name: 'العشاء',  icon: '🌙' },
];

type PrayerStatus = 'done' | 'qada' | 'missed' | null;

interface DayRecord {
  date: string;
  prayers: Record<string, PrayerStatus>;
}

function getDateKey(d = new Date()) {
  return d.toISOString().split('T')[0];
}

function getLast30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return getDateKey(d);
  }).reverse();
}

export default function PrayerTrackerPage() {
  const [records, setRecords] = useState<Record<string, DayRecord>>({});
  const [tab, setTab] = useState<'today' | 'stats' | 'history'>('today');
  const todayKey = getDateKey();

  useEffect(() => {
    storage.get<Record<string, DayRecord>>('prayer_records', {}).then(setRecords);
  }, []);

  const saveRecords = async (updated: Record<string, DayRecord>) => {
    setRecords(updated);
    await storage.set('prayer_records', updated);
  };

  const togglePrayer = async (prayerKey: string) => {
    const today = records[todayKey] || { date: todayKey, prayers: {} };
    const current = today.prayers[prayerKey];
    const next: PrayerStatus =
      current === null || current === undefined ? 'done' :
      current === 'done' ? 'qada' :
      current === 'qada' ? 'missed' : null;

    const updated = {
      ...records,
      [todayKey]: {
        ...today,
        prayers: { ...today.prayers, [prayerKey]: next },
      },
    };
    await saveRecords(updated);
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch {}
  };

  const todayRecord = records[todayKey] || { date: todayKey, prayers: {} };

  const getStatusColor = (s: PrayerStatus) => {
    if (s === 'done')   return 'var(--green-light)';
    if (s === 'qada')   return 'var(--warning)';
    if (s === 'missed') return 'var(--danger)';
    return 'var(--border)';
  };

  const getStatusIcon = (s: PrayerStatus) => {
    if (s === 'done')   return '✓';
    if (s === 'qada')   return 'ق';
    if (s === 'missed') return '✗';
    return '○';
  };

  const getStatusLabel = (s: PrayerStatus) => {
    if (s === 'done')   return 'أديت';
    if (s === 'qada')   return 'قضاء';
    if (s === 'missed') return 'فاتت';
    return 'لم تُحدَّد';
  };

  // إحصائيات
  const last30 = getLast30Days();
  const stats = PRAYERS.map(p => {
    let done = 0, qada = 0, missed = 0, total = 0;
    last30.forEach(day => {
      const rec = records[day];
      if (!rec) return;
      total++;
      const s = rec.prayers[p.key];
      if (s === 'done')   done++;
      if (s === 'qada')   qada++;
      if (s === 'missed') missed++;
    });
    return { ...p, done, qada, missed, total, pct: total ? Math.round((done / total) * 100) : 0 };
  });

  const todayDone = PRAYERS.filter(p => todayRecord.prayers[p.key] === 'done').length;

  return (
    <div>
      <div className="page-header">
        <span style={{ fontSize: 24 }}>📊</span>
        <h1>متابعة الصلوات</h1>
      </div>

      {/* ملخص اليوم */}
      <div style={{ margin: '12px 16px 0', background: 'linear-gradient(135deg,#1A2B3C,#0D1B2A)', borderRadius: 14, padding: 16, border: '1px solid rgba(200,169,110,0.25)', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
        <div>
          <p style={{ color: 'var(--gold)', fontSize: 28, fontWeight: 900 }}>{todayDone}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>أُديت اليوم</p>
        </div>
        <div style={{ width: 1, background: 'var(--border)' }} />
        <div>
          <p style={{ color: 'var(--text-primary)', fontSize: 28, fontWeight: 900 }}>5</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>الإجمالي</p>
        </div>
        <div style={{ width: 1, background: 'var(--border)' }} />
        <div>
          <p style={{ color: todayDone === 5 ? 'var(--green-light)' : 'var(--warning)', fontSize: 28, fontWeight: 900 }}>
            {Math.round((todayDone / 5) * 100)}%
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>نسبة الأداء</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '12px 16px 0', display: 'flex', gap: 8 }}>
        {(['today', 'stats', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
            background: tab === t ? 'var(--gold)' : 'var(--bg-card)',
            color: tab === t ? '#0D1B2A' : 'var(--text-secondary)',
            border: `1px solid ${tab === t ? 'var(--gold)' : 'var(--border)'}`,
            fontWeight: 700, fontSize: 12,
          }}>
            {t === 'today' ? '📅 اليوم' : t === 'stats' ? '📈 إحصائيات' : '📆 السجل'}
          </button>
        ))}
      </div>

      {/* اليوم */}
      {tab === 'today' && (
        <div style={{ padding: '12px 16px 20px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 12 }}>
            اضغط على الصلاة للتبديل: أُديت ← قضاء ← فاتت
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PRAYERS.map(prayer => {
              const status = todayRecord.prayers[prayer.key] as PrayerStatus;
              return (
                <div key={prayer.key} className="card"
                  onClick={() => togglePrayer(prayer.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', padding: '14px 16px', border: `1px solid ${getStatusColor(status)}40` }}
                >
                  <span style={{ fontSize: 26 }}>{prayer.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 15 }}>{prayer.name}</p>
                    <p style={{ fontSize: 12, color: getStatusColor(status), marginTop: 3 }}>
                      {getStatusLabel(status)}
                    </p>
                  </div>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: `${getStatusColor(status)}20`,
                    border: `2px solid ${getStatusColor(status)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: getStatusColor(status), fontWeight: 800, fontSize: 16,
                  }}>
                    {getStatusIcon(status)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* إحصائيات */}
      {tab === 'stats' && (
        <div style={{ padding: '12px 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>إحصائيات آخر 30 يوم</p>
          {stats.map(s => (
            <div key={s.key} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <p style={{ fontWeight: 700 }}>{s.name}</p>
                </div>
                <span style={{ color: s.pct >= 80 ? 'var(--green-light)' : s.pct >= 50 ? 'var(--warning)' : 'var(--danger)', fontWeight: 800, fontSize: 16 }}>
                  {s.pct}%
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ height: '100%', width: `${s.pct}%`, borderRadius: 4, transition: 'width 0.3s', background: s.pct >= 80 ? 'var(--green-light)' : s.pct >= 50 ? 'var(--warning)' : 'var(--danger)' }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--green-light)' }}>✓ {s.done} أُديت</span>
                <span style={{ fontSize: 11, color: 'var(--warning)' }}>ق {s.qada} قضاء</span>
                <span style={{ fontSize: 11, color: 'var(--danger)' }}>✗ {s.missed} فاتت</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* السجل */}
      {tab === 'history' && (
        <div style={{ padding: '12px 16px 20px' }}>
          {last30.slice().reverse().map(day => {
            const rec = records[day];
            const date = new Date(day);
            const label = date.toLocaleDateString('ar-EG', { weekday: 'short', month: 'short', day: 'numeric' });
            const done = rec ? PRAYERS.filter(p => rec.prayers[p.key] === 'done').length : 0;
            return (
              <div key={day} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '12px 14px' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: day === todayKey ? 'var(--gold)' : 'var(--text-primary)' }}>
                    {day === todayKey ? 'اليوم' : label}
                  </p>
                  <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                    {PRAYERS.map(p => (
                      <div key={p.key} style={{
                        width: 22, height: 22, borderRadius: '50%', fontSize: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: `${getStatusColor(rec?.prayers[p.key] as PrayerStatus)}30`,
                        color: getStatusColor(rec?.prayers[p.key] as PrayerStatus),
                        fontWeight: 700,
                      }}>
                        {getStatusIcon(rec?.prayers[p.key] as PrayerStatus)}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: done === 5 ? 'var(--green-light)' : done >= 3 ? 'var(--warning)' : 'var(--danger)', fontWeight: 800, fontSize: 18 }}>{done}/5</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
