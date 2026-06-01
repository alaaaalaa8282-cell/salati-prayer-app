import { useState, useRef } from 'react';

interface CardTemplate {
  id: string;
  occasion: string;
  icon: string;
  greeting: string;
  subText: string;
  bgGradient: string;
  textColor: string;
}

const CARDS: CardTemplate[] = [
  {
    id: 'eid_fitr',
    occasion: 'عيد الفطر',
    icon: '🌙',
    greeting: 'عيد فطر مبارك',
    subText: 'تقبّل الله منا ومنكم صالح الأعمال',
    bgGradient: 'linear-gradient(135deg, #1A2B3C 0%, #2E4A1E 100%)',
    textColor: '#C8A96E',
  },
  {
    id: 'eid_adha',
    occasion: 'عيد الأضحى',
    icon: '🕌',
    greeting: 'عيد أضحى مبارك',
    subText: 'أعاده الله علينا وعليكم باليمن والبركات',
    bgGradient: 'linear-gradient(135deg, #1A2B3C 0%, #3D1A00 100%)',
    textColor: '#E8C98E',
  },
  {
    id: 'ramadan',
    occasion: 'رمضان',
    icon: '🌙✨',
    greeting: 'رمضان كريم',
    subText: 'رمضان مبارك - كل عام وأنتم بخير',
    bgGradient: 'linear-gradient(135deg, #0D1B2A 0%, #2A1B3D 100%)',
    textColor: '#C8A96E',
  },
  {
    id: 'friday',
    occasion: 'الجمعة',
    icon: '🌿',
    greeting: 'جمعة مباركة',
    subText: 'جمعة مباركة - تقبّل الله دعاءكم',
    bgGradient: 'linear-gradient(135deg, #0D1B2A 0%, #1E3A1A 100%)',
    textColor: '#7BC67A',
  },
  {
    id: 'prophet_birthday',
    occasion: 'المولد النبوي',
    icon: '💚',
    greeting: 'ذكرى المولد النبوي الشريف',
    subText: 'اللهم صلّ وسلّم على سيدنا محمد',
    bgGradient: 'linear-gradient(135deg, #0D1B2A 0%, #1A3A2A 100%)',
    textColor: '#7BC67A',
  },
  {
    id: 'new_hijri',
    occasion: 'رأس السنة الهجرية',
    icon: '🗓️',
    greeting: 'عام هجري مبارك',
    subText: 'أعاده الله علينا وعليكم بالخير واليمن والبركات',
    bgGradient: 'linear-gradient(135deg, #1A2B3C 0%, #2A1A00 100%)',
    textColor: '#C8A96E',
  },
  {
    id: 'isra_miraj',
    occasion: 'الإسراء والمعراج',
    icon: '🌠',
    greeting: 'ذكرى الإسراء والمعراج',
    subText: 'سُبْحَانَ الَّذِي أَسْرَى بِعَبْدِهِ لَيْلاً',
    bgGradient: 'linear-gradient(135deg, #0D1B2A 0%, #1A0D2A 100%)',
    textColor: '#C8A96E',
  },
  {
    id: 'general',
    occasion: 'تهنئة عامة',
    icon: '🤲',
    greeting: 'بارك الله فيكم',
    subText: 'جزاكم الله خيراً وأدام عليكم الصحة والعافية',
    bgGradient: 'linear-gradient(135deg, #1A2B3C 0%, #2B1A2A 100%)',
    textColor: '#C8A96E',
  },
];

export default function GreetingCardsPage() {
  const [selected, setSelected] = useState<CardTemplate | null>(null);
  const [customName, setCustomName] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  const shareCard = async (card: CardTemplate) => {
    const text = `${card.greeting}\n${card.subText}${customName ? `\n\nإلى: ${customName}` : ''}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: card.occasion, text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      alert('تم نسخ النص!');
    }
  };

  if (selected) {
    return (
      <div>
        <div className="page-header" style={{ justifyContent: 'space-between' }}>
          <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 24, cursor: 'pointer' }}>←</button>
          <h1 style={{ fontSize: 16 }}>{selected.occasion}</h1>
          <div style={{ width: 40 }} />
        </div>

        {/* Card preview */}
        <div style={{ padding: '20px 20px 0' }}>
          <div
            ref={cardRef}
            style={{
              background: selected.bgGradient,
              borderRadius: 20,
              padding: '40px 24px',
              textAlign: 'center',
              border: '1px solid rgba(200,169,110,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative corners */}
            <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 20, opacity: 0.3 }}>✦</div>
            <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 20, opacity: 0.3 }}>✦</div>
            <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 20, opacity: 0.3 }}>✦</div>
            <div style={{ position: 'absolute', bottom: 10, left: 10, fontSize: 20, opacity: 0.3 }}>✦</div>

            <p style={{ fontSize: 48, marginBottom: 16 }}>{selected.icon}</p>
            <p style={{ color: selected.textColor, fontSize: 26, fontWeight: 800, marginBottom: 12, lineHeight: 1.4 }}>
              {selected.greeting}
            </p>
            <div style={{ width: 60, height: 2, background: selected.textColor, margin: '0 auto 16px', opacity: 0.5 }} />
            <p style={{ color: '#fff', fontSize: 15, lineHeight: 1.8, opacity: 0.9 }}>
              {selected.subText}
            </p>
            {customName && (
              <p style={{ color: selected.textColor, fontSize: 14, marginTop: 20, opacity: 0.8 }}>
                إلى: {customName}
              </p>
            )}
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 24 }}>صلاتي - تطبيق المسلم</p>
          </div>
        </div>

        {/* Personalize */}
        <div style={{ padding: '16px 20px' }}>
          <input
            type="text"
            placeholder="أضف اسم المرسَل إليه (اختياري)"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            style={{
              width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '12px 14px', color: 'var(--text-primary)',
              fontSize: 15, outline: 'none', fontFamily: 'inherit', marginBottom: 12,
            }}
          />
          <button className="btn-primary" onClick={() => shareCard(selected)}>
            📤 مشاركة البطاقة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <span style={{ fontSize: 24 }}>🎉</span>
        <h1>بطاقات التهنئة</h1>
      </div>

      <div style={{ padding: '12px 16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {CARDS.map(card => (
          <div
            key={card.id}
            onClick={() => setSelected(card)}
            style={{
              background: card.bgGradient,
              borderRadius: 14, padding: '20px 12px',
              textAlign: 'center', cursor: 'pointer',
              border: '1px solid rgba(200,169,110,0.2)',
              transition: 'transform 0.15s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}
          >
            <span style={{ fontSize: 32 }}>{card.icon}</span>
            <p style={{ color: card.textColor, fontWeight: 700, fontSize: 14, lineHeight: 1.4 }}>
              {card.occasion}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>اضغط للمعاينة</p>
          </div>
        ))}
      </div>
    </div>
  );
}
