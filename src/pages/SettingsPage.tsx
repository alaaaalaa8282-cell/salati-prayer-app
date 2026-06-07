import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { CALC_METHODS } from '../hooks/usePrayerTimes';
import { RECITERS } from '../data/quranSurahs';
import { LocalNotifications } from '@capacitor/local-notifications';

const AZAN_VOICES = [
  { id: 'ar.alafasy',        name: 'مشاري راشد العفاسي' },
  { id: 'ar.abdullahbasfar', name: 'عبدالله بصفر' },
  { id: 'ar.husary',         name: 'محمود خليل الحصري' },
  { id: 'ar.minshawi',       name: 'محمد صديق المنشاوي' },
  { id: 'ar.shaatree',       name: 'أبو بكر الشاطري' },
  { id: 'ar.ahmedajamy',     name: 'أحمد العجمي' },
];

const PRAYERS = [
  { key: 'fajr',    name: 'الفجر',   icon: '🌄' },
  { key: 'dhuhr',   name: 'الظهر',   icon: '☀️' },
  { key: 'asr',     name: 'العصر',   icon: '🌤️' },
  { key: 'maghrib', name: 'المغرب',  icon: '🌇' },
  { key: 'isha',    name: 'العشاء',  icon: '🌙' },
];

export default function SettingsPage() {
  const [calcMethod, setCalcMethod] = useState('Egyptian');
  const [madhab, setMadhab] = useState('Shafi');
  const [reciter, setReciter] = useState('ar.alafasy');
  const [autoSilent, setAutoSilent] = useState(false);
  const [iqamaDelay, setIqamaDelay] = useState(10);
  const [iqamaEnabled, setIqamaEnabled] = useState(true);
  const [morningTime, setMorningTime] = useState('06:00');
  const [eveningTime, setEveningTime] = useState('17:00');
  const [perPrayerVoice, setPerPrayerVoice] = useState<Record<string, string>>({
    fajr: 'ar.alafasy', dhuhr: 'ar.alafasy', asr: 'ar.alafasy', maghrib: 'ar.alafasy', isha: 'ar.alafasy',
  });
  const [saved, setSaved] = useState(false);
  const [expandedPrayer, setExpandedPrayer] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setCalcMethod(await storage.get('calc_method', 'Egyptian'));
      setMadhab(await storage.get('madhab', 'Shafi'));
      setReciter(await storage.get('reciter', 'ar.alafasy'));
      setAutoSilent(await storage.get('auto_silent', false));
      setIqamaDelay(await storage.get('iqama_delay', 10));
      setIqamaEnabled(await storage.get('iqama_enabled', true));
      setMorningTime(await storage.get('morning_time', '06:00'));
      setEveningTime(await storage.get('evening_time', '17:00'));
      setPerPrayerVoice(await storage.get('per_prayer_voice', {
        fajr: 'ar.alafasy', dhuhr: 'ar.alafasy', asr: 'ar.alafasy', maghrib: 'ar.alafasy', isha: 'ar.alafasy',
      }));
    };
    load();
  }, []);

  const save = async (key: string, value: any) => {
    await storage.set(key, value);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const updatePrayerVoice = async (prayer: string, voice: string) => {
    const updated = { ...perPrayerVoice, [prayer]: voice };
    setPerPrayerVoice(updated);
    await save('per_prayer_voice', updated);
  };

  const scheduleAzkarReminders = async () => {
    try {
      await LocalNotifications.requestPermissions();
      const [mH, mM] = morningTime.split(':').map(Number);
      const [eH, eM] = eveningTime.split(':').map(Number);
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 200,
            title: '🌅 أذكار الصباح',
            body: 'حان وقت أذكار الصباح',
            schedule: { on: { hour: mH, minute: mM }, repeats: true },
            smallIcon: 'ic_launcher_foreground',
            iconColor: '#C8A96E',
          },
          {
            id: 201,
            title: '🌆 أذكار المساء',
            body: 'حان وقت أذكار المساء',
            schedule: { on: { hour: eH, minute: eM }, repeats: true },
            smallIcon: 'ic_launcher_foreground',
            iconColor: '#C8A96E',
          },
        ],
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) { console.warn(e); }
  };

  const S: React.CSSProperties = {
    width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)',
    fontSize: 14, fontFamily: 'inherit', outline: 'none',
  };

  return (
    <div>
      <div className="page-header">
        <span style={{ fontSize: 24 }}>⚙️</span>
        <h1>الإعدادات</h1>
        {saved && <span style={{ color: 'var(--green-light)', fontSize: 13, marginRight: 'auto' }}>✓ تم الحفظ</span>}
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* حساب مواقيت الصلاة */}
        <section>
          <p className="section-title">حساب مواقيت الصلاة</p>
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>طريقة الحساب</p>
              <select value={calcMethod} onChange={e => { setCalcMethod(e.target.value); save('calc_method', e.target.value); }} style={S}>
                {Object.entries(CALC_METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>حساب وقت العصر</p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ val: 'Shafi', label: 'الجمهور' }, { val: 'Hanafi', label: 'حنفي' }].map(m => (
                  <button key={m.val} onClick={() => { setMadhab(m.val); save('madhab', m.val); }} style={{
                    flex: 1, padding: '9px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                    background: madhab === m.val ? 'var(--gold)' : 'var(--bg-surface)',
                    color: madhab === m.val ? '#0D1B2A' : 'var(--text-secondary)',
                    border: `1px solid ${madhab === m.val ? 'var(--gold)' : 'var(--border)'}`,
                    fontWeight: 600, fontSize: 13,
                  }}>{m.label}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* مؤذن لكل صلاة */}
        <section>
          <p className="section-title">🕌 مؤذن لكل صلاة</p>
          <div className="card" style={{ padding: 0 }}>
            {PRAYERS.map((prayer, i) => (
              <div key={prayer.key}>
                <div
                  onClick={() => setExpandedPrayer(expandedPrayer === prayer.key ? null : prayer.key)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 16px', cursor: 'pointer',
                    borderBottom: i < PRAYERS.length - 1 || expandedPrayer === prayer.key ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 20 }}>{prayer.icon}</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{prayer.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--gold)', marginTop: 2 }}>
                        {AZAN_VOICES.find(v => v.id === perPrayerVoice[prayer.key])?.name}
                      </p>
                    </div>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>
                    {expandedPrayer === prayer.key ? '▲' : '▼'}
                  </span>
                </div>
                {expandedPrayer === prayer.key && (
                  <div style={{ background: 'var(--bg-surface)', borderBottom: i < PRAYERS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    {AZAN_VOICES.map(voice => (
                      <div
                        key={voice.id}
                        onClick={() => updatePrayerVoice(prayer.key, voice.id)}
                        style={{
                          padding: '12px 20px', cursor: 'pointer',
                          color: perPrayerVoice[prayer.key] === voice.id ? 'var(--gold)' : 'var(--text-secondary)',
                          fontWeight: perPrayerVoice[prayer.key] === voice.id ? 700 : 400,
                          fontSize: 14, borderBottom: '1px solid var(--border)',
                          display: 'flex', justifyContent: 'space-between',
                        }}
                      >
                        <span>{voice.name}</span>
                        {perPrayerVoice[prayer.key] === voice.id && <span>✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* إعدادات الأذان */}
        <section>
          <p className="section-title">الأذان والإقامة</p>
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontSize: 14 }}>تذكير الإقامة</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>تنبيه قبل الإقامة</p>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={iqamaEnabled} onChange={e => { setIqamaEnabled(e.target.checked); save('iqama_enabled', e.target.checked); }} />
                <span className="toggle-slider" />
              </label>
            </div>
            {iqamaEnabled && (
              <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: 14 }}>وقت الإقامة بعد الأذان</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="range" min={5} max={30} step={5} value={iqamaDelay}
                    onChange={e => { setIqamaDelay(+e.target.value); save('iqama_delay', +e.target.value); }}
                    style={{ width: 80 }}
                  />
                  <span style={{ color: 'var(--gold)', fontWeight: 700, minWidth: 30 }}>{iqamaDelay}د</span>
                </div>
              </div>
            )}
            <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 14 }}>الصمت التلقائي</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>كتم الهاتف أثناء الصلاة</p>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={autoSilent} onChange={e => { setAutoSilent(e.target.checked); save('auto_silent', e.target.checked); }} />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        </section>

        {/* تذكيرات الأذكار */}
        <section>
          <p className="section-title">تذكيرات الأذكار</p>
          <div className="card" style={{ padding: 0 }}>
            {[
              { label: '🌅 أذكار الصباح', val: morningTime, set: setMorningTime, key: 'morning_time' },
              { label: '🌆 أذكار المساء', val: eveningTime, set: setEveningTime, key: 'evening_time' },
            ].map(item => (
              <div key={item.key} style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: 14 }}>{item.label}</p>
                <input type="time" value={item.val}
                  onChange={e => { item.set(e.target.value); save(item.key, e.target.value); }}
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', color: 'var(--gold)', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
                />
              </div>
            ))}
            <div style={{ padding: '12px 16px' }}>
              <button className="btn-primary" onClick={scheduleAzkarReminders}>
                🔔 تفعيل تذكيرات الأذكار
              </button>
            </div>
          </div>
        </section>

        {/* القرآن الكريم */}
        <section>
          <p className="section-title">القرآن الكريم</p>
          <div className="card" style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>القارئ المفضل</p>
            <select value={reciter} onChange={e => { setReciter(e.target.value); save('reciter', e.target.value); }} style={S}>
              {RECITERS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </section>

        {/* معلومات التطبيق */}
        <div className="card" style={{ textAlign: 'center', padding: 20 }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🕌</p>
          <p style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 16 }}>صلاتي</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>الإصدار 1.0.0</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 8 }}>تطوير: محمد علاء</p>
        </div>
      </div>
    </div>
  );
}
