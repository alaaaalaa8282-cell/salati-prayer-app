import { useState, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { azkarData, AzkarCategory, Zikr } from '../data/azkar';
import { storage } from '../utils/storage';

type View = 'categories' | 'list' | 'counter';

export default function AzkarPage() {
  const [view, setView] = useState<View>('categories');
  const [selectedCategory, setSelectedCategory] = useState<AzkarCategory | null>(null);
  const [selectedZikr, setSelectedZikr] = useState<Zikr | null>(null);
  const [progress, setProgress] = useState<Record<number, number>>({});

  useEffect(() => {
    storage.get<Record<number, number>>('azkar_progress', {}).then(setProgress);
  }, []);

  const saveProgress = async (id: number, count: number) => {
    const updated = { ...progress, [id]: count };
    setProgress(updated);
    await storage.set('azkar_progress', updated);
  };

  const resetCategory = async () => {
    if (!selectedCategory) return;
    const updated = { ...progress };
    selectedCategory.azkar.forEach(z => { updated[z.id] = 0; });
    setProgress(updated);
    await storage.set('azkar_progress', updated);
  };

  if (view === 'counter' && selectedZikr) {
    return (
      <ZikrCounter
        zikr={selectedZikr}
        initialCount={progress[selectedZikr.id] || 0}
        onBack={() => setView('list')}
        onCountChange={(c) => saveProgress(selectedZikr.id, c)}
      />
    );
  }

  if (view === 'list' && selectedCategory) {
    const categoryProgress = selectedCategory.azkar.filter(
      z => (progress[z.id] || 0) >= z.repetitions
    ).length;

    return (
      <div>
        <div className="page-header" style={{ justifyContent: 'space-between' }}>
          <button onClick={() => setView('categories')} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 24, cursor: 'pointer' }}>←</button>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 18 }}>{selectedCategory.icon} {selectedCategory.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              {categoryProgress}/{selectedCategory.azkar.length} مكتمل
            </p>
          </div>
          <button onClick={resetCategory} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>
            إعادة
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ padding: '10px 16px 0' }}>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(categoryProgress / selectedCategory.azkar.length) * 100}%`,
              background: 'var(--gold)',
              borderRadius: 4,
              transition: 'width 0.3s',
            }} />
          </div>
        </div>

        <div style={{ padding: '12px 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {selectedCategory.azkar.map((zikr) => {
            const count = progress[zikr.id] || 0;
            const done = count >= zikr.repetitions;
            return (
              <div
                key={zikr.id}
                className="card"
                onClick={() => { setSelectedZikr(zikr); setView('counter'); }}
                style={{
                  cursor: 'pointer',
                  opacity: done ? 0.7 : 1,
                  border: done ? '1px solid var(--green)' : '1px solid var(--border)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {done && (
                  <div style={{
                    position: 'absolute', top: 8, left: 8,
                    background: 'var(--green)', borderRadius: '50%',
                    width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: '#fff',
                  }}>✓</div>
                )}
                <p style={{ fontSize: 18, lineHeight: 1.9, color: 'var(--text-primary)', marginBottom: 10, fontFamily: 'serif' }}>
                  {zikr.text.length > 150 ? zikr.text.substring(0, 150) + '...' : zikr.text}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{zikr.source}</p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {zikr.repetitions > 1 && (
                      <span className="chip gold">{count}/{zikr.repetitions}</span>
                    )}
                    <span style={{ color: 'var(--text-muted)', fontSize: 20 }}>‹</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Categories view
  return (
    <div>
      <div className="page-header">
        <span style={{ fontSize: 24 }}>📿</span>
        <h1>الأذكار</h1>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {azkarData.map(cat => {
          const done = cat.azkar.filter(z => (progress[z.id] || 0) >= z.repetitions).length;
          const pct = Math.round((done / cat.azkar.length) * 100);
          return (
            <div
              key={cat.id}
              className="card"
              onClick={() => { setSelectedCategory(cat); setView('list'); }}
              style={{ cursor: 'pointer', padding: '16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                <span style={{ fontSize: 32 }}>{cat.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 17 }}>{cat.name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                    {cat.azkar.length} ذكر • {done} مكتمل
                  </p>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 22 }}>‹</span>
              </div>
              <div style={{ height: 5, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'var(--green-light)' : 'var(--gold)', borderRadius: 4, transition: 'width 0.3s' }} />
              </div>
              {pct > 0 && <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>{pct}% مكتمل</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Zikr Counter Screen ──────────────────────────────────────────────────────

function ZikrCounter({ zikr, initialCount, onBack, onCountChange }: {
  zikr: Zikr;
  initialCount: number;
  onBack: () => void;
  onCountChange: (count: number) => void;
}) {
  const [count, setCount] = useState(initialCount);
  const done = count >= zikr.repetitions;

  const tap = async () => {
    if (done) return;
    const next = count + 1;
    setCount(next);
    onCountChange(next);
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch {}
  };

  const reset = async () => {
    setCount(0);
    onCountChange(0);
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch {}
  };

  const pct = Math.min((count / zikr.repetitions) * 100, 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '80vh' }}>
      <div className="page-header" style={{ justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 24, cursor: 'pointer' }}>←</button>
        <h1 style={{ fontSize: 16 }}>العداد</h1>
        <button onClick={reset} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>إعادة</button>
      </div>

      {/* Zikr text */}
      <div style={{ padding: '20px 20px 0', flex: 1 }}>
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <p style={{ fontSize: 20, lineHeight: 2, textAlign: 'center', fontFamily: 'serif', color: 'var(--text-primary)' }}>
            {zikr.text}
          </p>
          <p style={{ textAlign: 'center', color: 'var(--gold)', fontSize: 12, marginTop: 12 }}>{zikr.source}</p>
        </div>

        {/* Circular progress */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle
              cx="80" cy="80" r="70" fill="none"
              stroke={done ? 'var(--green-light)' : 'var(--gold)'}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - pct / 100)}`}
              transform="rotate(-90 80 80)"
              style={{ transition: 'stroke-dashoffset 0.3s' }}
            />
            <text x="80" y="72" textAnchor="middle" fill={done ? '#3EA87A' : '#C8A96E'} fontSize="36" fontWeight="800" fontFamily="sans-serif">
              {count}
            </text>
            <text x="80" y="98" textAnchor="middle" fill="var(--text-muted)" fontSize="14" fontFamily="sans-serif">
              من {zikr.repetitions}
            </text>
          </svg>

          {done ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--green-light)', fontSize: 22, fontWeight: 700 }}>✓ اكتمل</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>جزاك الله خيراً</p>
            </div>
          ) : (
            <button className="azkar-counter-btn" onClick={tap} style={{ width: 80, height: 80, fontSize: 28 }}>
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
