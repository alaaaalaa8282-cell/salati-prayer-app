import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { CALC_METHODS } from '../hooks/usePrayerTimes';
import { RECITERS } from '../data/quranSurahs';

const AZAN_VOICES = [
  { id: 'ar.alafasy',        name: 'مشاري راشد العفاسي' },
  { id: 'ar.abdullahbasfar', name: 'عبدالله بصفر' },
  { id: 'ar.husary',         name: 'محمود خليل الحصري' },
  { id: 'ar.minshawi',       name: 'محمد صديق المنشاوي' },
];

export default function SettingsPage() {
  const [calcMethod, setCalcMethod] = useState('Egyptian');
  const [madhab, setMadhab] = useState('Shafi');
  const [azanVoice, setAzanVoice] = useState('ar.alafasy');
  const [reciter, setReciter] = useState('ar.alafasy');
  const [autoSilent, setAutoSilent] = useState(false);
  const [morningReminderTime, setMorningReminderTime] = useState('06:00');
  const [eveningReminderTime, setEveningReminderTime] = useState('17:00');
  const [iqamaDelay, setIqamaDelay] = useState(10);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      setCalcMethod(await storage.get('calc_method', 'Egyptian'));
      setMadhab(await storage.get('madhab', 'Shafi'));
      setAzanVoice(await storage.get('azan_voice', 'ar.alafasy'));
      setReciter(await storage.get('reciter', 'ar.alafasy'));
      setAutoSilent(await storage.get('auto_silent', false));
      setMorningReminderTime(await storage.get('morning_time', '06:00'));
      setEveningReminderTime(await storage.get('evening_time', '17:00'));
      setIqamaDelay(await storage.get('iqama_delay', 10));
    };
    load();
  }, []);

  const save = async (key: string, value: any) => {
    await storage.set(key, value);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div>
      <div className="page-header">
        <span style={{ fontSize: 24 }}>⚙️</span>
        <h1>الإعدادات</h1>
        {saved && <span style={{ color: 'var(--green-light)', fontSize: 13, marginRight: 'auto' }}>✓ تم الحفظ</span>}
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Prayer calculation */}
        <section>
          <p className="section-title">حساب مواقيت الصلاة</p>
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>طريقة الحساب</p>
              <select
                value={calcMethod}
                onChange={e => { setCalcMethod(e.target.value); save('calc_method', e.target.value); }}
                style={{
                  width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)',
                  fontSize: 14, fontFamily: 'inherit', outline: 'none',
                }}
              >
                {Object.entries(CALC_METHODS).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>

            <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>حساب العصر</p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ val: 'Shafi', label: 'الجمهور (شافعي / مالكي / حنبلي)' }, { val: 'Hanafi', label: 'حنفي' }].map(m => (
                  <button
                    key={m.val}
                    onClick={() => { setMadhab(m.val); save('madhab', m.val); }}
                    style={{
                      flex: 1, padding: '8px 6px', borderRadius: 8,
                      background: madhab === m.val ? 'var(--gold)' : 'var(--bg-surface)',
                      color: madhab === m.val ? '#0D1B2A' : 'var(--text-secondary)',
                      border: `1px solid ${madhab === m.val ? 'var(--gold)' : 'var(--border)'}`,
                      fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >{m.label}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Azan settings */}
        <section>
          <p className="section-title">الأذان</p>
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>صوت الأذان</p>
              <select
                value={azanVoice}
                onChange={e => { setAzanVoice(e.target.value); save('azan_voice', e.target.value); }}
                style={{
                  width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)',
                  fontSize: 14, fontFamily: 'inherit', outline: 'none',
                }}
              >
                {AZAN_VOICES.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 14 }}>الإقامة تلقائياً</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>تذكير بعد الأذان بـ {iqamaDelay} دقيقة</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="range" min={5} max={30} step={5} value={iqamaDelay}
                  onChange={e => { setIqamaDelay(+e.target.value); save('iqama_delay', +e.target.value); }}
                  style={{ width: 80 }}
                />
                <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 14, minWidth: 30 }}>{iqamaDelay}د</span>
              </div>
            </div>

            <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 14 }}>الصمت التلقائي</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>كتم الهاتف أثناء وقت الصلاة</p>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={autoSilent} onChange={e => { setAutoSilent(e.target.checked); save('auto_silent', e.target.checked); }} />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        </section>

        {/* Azkar reminders */}
        <section>
          <p className="section-title">تذكيرات الأذكار</p>
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 14 }}>🌅 أذكار الصباح</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>وقت التذكير</p>
              </div>
              <input
                type="time" value={morningReminderTime}
                onChange={e => { setMorningReminderTime(e.target.value); save('morning_time', e.target.value); }}
                style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '8px 10px', color: 'var(--gold)',
                  fontSize: 14, fontFamily: 'inherit', outline: 'none',
                }}
              />
            </div>
            <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 14 }}>🌆 أذكار المساء</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>وقت التذكير</p>
              </div>
              <input
                type="time" value={eveningReminderTime}
                onChange={e => { setEveningReminderTime(e.target.value); save('evening_time', e.target.value); }}
                style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '8px 10px', color: 'var(--gold)',
                  fontSize: 14, fontFamily: 'inherit', outline: 'none',
                }}
              />
            </div>
          </div>
        </section>

        {/* Quran reciter */}
        <section>
          <p className="section-title">القرآن الكريم</p>
          <div className="card" style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>القارئ المفضل</p>
            <select
              value={reciter}
              onChange={e => { setReciter(e.target.value); save('reciter', e.target.value); }}
              style={{
                width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)',
                fontSize: 14, fontFamily: 'inherit', outline: 'none',
              }}
            >
              {RECITERS.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </section>

        {/* App info */}
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>🕌</p>
          <p style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 16 }}>صلاتي</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>الإصدار 1.0.0</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 8, lineHeight: 1.6 }}>
            تطوير: محمد علاء
          </p>
        </div>
      </div>
    </div>
  );
}
