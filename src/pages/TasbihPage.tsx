import { useState, useEffect, useRef } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { storage } from '../utils/storage';

interface TasbihPreset {
  id: string;
  text: string;
  target: number;
  color: string;
}

const PRESETS: TasbihPreset[] = [
  { id: 'subhan',  text: 'سُبْحَانَ اللَّهِ',                    target: 33,  color: '#2E7D5B' },
  { id: 'hamd',    text: 'الْحَمْدُ لِلَّهِ',                    target: 33,  color: '#C8A96E' },
  { id: 'akbar',   text: 'اللَّهُ أَكْبَرُ',                     target: 34,  color: '#E8785A' },
  { id: 'lailaha', text: 'لَا إِلَهَ إِلَّا اللَّهُ',            target: 100, color: '#7B68EE' },
  { id: 'hawla',   text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', target: 100, color: '#5BA4CF' },
  { id: 'salat',   text: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',    target: 100, color: '#C8A96E' },
  { id: 'istighfar', text: 'أَسْتَغْفِرُ اللَّهَ',               target: 100, color: '#E57373' },
  { id: 'custom',  text: 'مخصص',                                  target: 99,  color: '#78909C' },
];

export default function TasbihPage() {
  const [selected, setSelected] = useState<TasbihPreset>(PRESETS[0]);
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [vibrate, setVibrate] = useState(true);
  const [customText, setCustomText] = useState('');
  const [customTarget, setCustomTarget] = useState(33);
  const [showPresets, setShowPresets] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const longPressRef = useRef<any>(null);

  useEffect(() => {
    storage.get<boolean>('tasbih_vibrate', true).then(setVibrate);
    storage.get<{ count: number; total: number; rounds: number; presetId: string }>('tasbih_state', {
      count: 0, total: 0, rounds: 0, presetId: 'subhan',
    }).then(s => {
      setCount(s.count);
      setTotal(s.total);
      setRounds(s.rounds);
      const preset = PRESETS.find(p => p.id === s.presetId) || PRESETS[0];
      setSelected(preset);
    });
  }, []);

  const saveState = async (c: number, t: number, r: number, presetId: string) => {
    await storage.set('tasbih_state', { count: c, total: t, rounds: r, presetId });
  };

  const tap = async () => {
    const next = count + 1;
    const newTotal = total + 1;
    if (vibrate) {
      try { await Haptics.impact({ style: ImpactStyle.Light }); } catch {}
    }
    if (next >= selected.target) {
      const newRounds = rounds + 1;
      setCount(0);
      setTotal(newTotal);
      setRounds(newRounds);
      try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch {}
      await saveState(0, newTotal, newRounds, selected.id);
    } else {
      setCount(next);
      setTotal(newTotal);
      await saveState(next, newTotal, rounds, selected.id);
    }
  };

  const reset = async () => {
    setCount(0);
    setTotal(0);
    setRounds(0);
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch {}
    await saveState(0, 0, 0, selected.id);
  };

  const selectPreset = async (preset: TasbihPreset) => {
    if (preset.id === 'custom') {
      setShowCustom(true);
      setShowPresets(false);
      return;
    }
    setSelected(preset);
    setCount(0);
    setTotal(0);
    setRounds(0);
    setShowPresets(false);
    await saveState(0, 0, 0, preset.id);
  };

  const applyCustom = async () => {
    const custom: TasbihPreset = {
      id: 'custom',
      text: customText || 'ذكر مخصص',
      target: customTarget,
      color: '#78909C',
    };
    setSelected(custom);
    setCount(0);
    setTotal(0);
    setRounds(0);
    setShowCustom(false);
    await saveState(0, 0, 0, 'custom');
  };

  const pct = Math.min((count / selected.target) * 100, 100);
  const size = 220;
  const r = 95;
  const circumference = 2 * Math.PI * r;

  return (
    <div>
      <div className="page-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>📿</span>
          <h1>المسبحة</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <label className="toggle" title="اهتزاز">
            <input type="checkbox" checked={vibrate} onChange={async e => {
              setVibrate(e.target.checked);
              await storage.set('tasbih_vibrate', e.target.checked);
            }} />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

        {/* اختيار الذكر */}
        <button
          onClick={() => setShowPresets(!showPresets)}
          style={{
            width: '100%', background: 'var(--bg-card)', border: `1px solid ${selected.color}`,
            borderRadius: 12, padding: '12px 16px', cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          <p style={{ color: selected.color, fontWeight: 700, fontSize: 16 }}>{selected.text}</p>
          <span style={{ color: 'var(--text-muted)' }}>{showPresets ? '▲' : '▼'}</span>
        </button>

        {showPresets && (
          <div className="card" style={{ width: '100%', padding: 0, overflow: 'hidden' }}>
            {PRESETS.map(p => (
              <div key={p.id} onClick={() => selectPreset(p)}
                style={{
                  padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: selected.id === p.id ? 'rgba(200,169,110,0.08)' : 'transparent',
                }}
              >
                <p style={{ color: p.color, fontWeight: 600, fontSize: 14 }}>{p.text}</p>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>الهدف: {p.target}</span>
              </div>
            ))}
          </div>
        )}

        {showCustom && (
          <div className="card" style={{ width: '100%' }}>
            <p style={{ color: 'var(--gold)', fontWeight: 700, marginBottom: 12 }}>ذكر مخصص</p>
            <input
              type="text" placeholder="اكتب الذكر..." value={customText}
              onChange={e => setCustomText(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 15, fontFamily: 'inherit', outline: 'none', marginBottom: 10 }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, flexShrink: 0 }}>الهدف:</p>
              <input type="number" value={customTarget} min={1} max={1000}
                onChange={e => setCustomTarget(+e.target.value)}
                style={{ width: 80, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', color: 'var(--gold)', fontSize: 14, fontFamily: 'inherit', outline: 'none', textAlign: 'center' }}
              />
            </div>
            <button className="btn-primary" onClick={applyCustom}>تطبيق</button>
          </div>
        )}

        {/* إحصائيات */}
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          {[
            { label: 'الجولات', value: rounds },
            { label: 'الإجمالي', value: total },
          ].map(item => (
            <div key={item.label} className="card" style={{ flex: 1, textAlign: 'center', padding: '12px 8px' }}>
              <p style={{ color: 'var(--gold)', fontWeight: 800, fontSize: 22 }}>{item.value}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{item.label}</p>
            </div>
          ))}
        </div>

        {/* الدائرة والعداد */}
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
            <circle cx={size/2} cy={size/2} r={r} fill="var(--bg-card)" stroke="var(--border)" strokeWidth="8" />
            <circle
              cx={size/2} cy={size/2} r={r} fill="none"
              stroke={selected.color} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct / 100)}
              transform={`rotate(-90 ${size/2} ${size/2})`}
              style={{ transition: 'stroke-dashoffset 0.2s' }}
            />
          </svg>
          <button
            onClick={tap}
            style={{
              position: 'absolute', inset: 14,
              borderRadius: '50%', border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 4,
            }}
          >
            <span style={{ color: selected.color, fontSize: 52, fontWeight: 900, lineHeight: 1 }}>{count}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>من {selected.target}</span>
          </button>
        </div>

        {/* أزرار */}
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <button onClick={reset} className="btn-outline" style={{ flex: 1 }}>🔄 إعادة</button>
          <button
            onClick={tap}
            style={{
              flex: 2, background: selected.color, border: 'none', borderRadius: 12,
              color: '#fff', fontSize: 18, fontWeight: 700, padding: '14px', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            تسبيح +
          </button>
        </div>
      </div>
    </div>
  );
}
