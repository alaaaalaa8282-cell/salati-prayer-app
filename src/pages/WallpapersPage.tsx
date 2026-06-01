import { useState } from 'react';

interface Wallpaper {
  id: number;
  title: string;
  url: string;
  category: string;
}

// Using Unsplash public images with Islamic/mosque themes
const WALLPAPERS: Wallpaper[] = [
  { id: 1,  title: 'المسجد الحرام',     category: 'المساجد',    url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800' },
  { id: 2,  title: 'المسجد النبوي',     category: 'المساجد',    url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800' },
  { id: 3,  title: 'المسجد الأقصى',     category: 'المساجد',    url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800' },
  { id: 4,  title: 'سماء الليل',        category: 'طبيعة',      url: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=800' },
  { id: 5,  title: 'شروق الشمس',        category: 'طبيعة',      url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800' },
  { id: 6,  title: 'الصحراء',           category: 'طبيعة',      url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800' },
  { id: 7,  title: 'القمر والنجوم',     category: 'طبيعة',      url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800' },
  { id: 8,  title: 'السحب',             category: 'طبيعة',      url: 'https://images.unsplash.com/photo-1504608524841-42584120d065?w=800' },
  { id: 9,  title: 'الجبال',            category: 'طبيعة',      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800' },
  { id: 10, title: 'البحر الهادئ',      category: 'طبيعة',      url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800' },
  { id: 11, title: 'الزخارف الإسلامية', category: 'فن إسلامي',  url: 'https://images.unsplash.com/photo-1548263594-a71ea65a8598?w=800' },
  { id: 12, title: 'النقوش',            category: 'فن إسلامي',  url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800' },
];

const CATEGORIES = ['الكل', ...Array.from(new Set(WALLPAPERS.map(w => w.category)))];

export default function WallpapersPage() {
  const [selectedCat, setSelectedCat] = useState('الكل');
  const [preview, setPreview] = useState<Wallpaper | null>(null);

  const filtered = selectedCat === 'الكل' ? WALLPAPERS : WALLPAPERS.filter(w => w.category === selectedCat);

  if (preview) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="page-header" style={{ justifyContent: 'space-between' }}>
          <button onClick={() => setPreview(null)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 24, cursor: 'pointer' }}>←</button>
          <h1 style={{ fontSize: 16 }}>{preview.title}</h1>
          <button
            onClick={() => {
              const a = document.createElement('a');
              a.href = preview.url;
              a.download = `${preview.title}.jpg`;
              a.target = '_blank';
              a.click();
            }}
            style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            💾 حفظ
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', padding: '0 0 10px' }}>
          <img
            src={preview.url.replace('w=800', 'w=1200')}
            alt={preview.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ padding: '12px 16px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', marginBottom: 10 }}>
            اضغط على زر الحفظ لتحميل الخلفية
          </p>
          <button
            className="btn-primary"
            onClick={() => window.open(preview.url.replace('w=800', 'w=1200'), '_blank')}
          >
            🖼️ فتح بالحجم الكامل
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <span style={{ fontSize: 24 }}>🖼️</span>
        <h1>خلفيات إسلامية</h1>
      </div>

      {/* Category filter */}
      <div style={{ padding: '12px 16px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            style={{
              background: selectedCat === cat ? 'var(--gold)' : 'var(--bg-card)',
              color: selectedCat === cat ? '#0D1B2A' : 'var(--text-secondary)',
              border: `1px solid ${selectedCat === cat ? 'var(--gold)' : 'var(--border)'}`,
              borderRadius: 20, padding: '6px 14px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
            }}
          >{cat}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ padding: '0 16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {filtered.map(wp => (
          <div
            key={wp.id}
            onClick={() => setPreview(wp)}
            style={{ borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative', aspectRatio: '9/16', border: '1px solid var(--border)' }}
          >
            <img
              src={wp.url.replace('w=800', 'w=400')}
              alt={wp.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              loading="lazy"
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              padding: '20px 10px 10px',
            }}>
              <p style={{ color: '#fff', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>{wp.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
