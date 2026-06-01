import { useState } from 'react';

interface Book {
  title: string;
  author: string;
  category: string;
  icon: string;
  url: string;
  desc: string;
}

const BOOKS: Book[] = [
  // عقيدة
  { title: 'كتاب التوحيد', author: 'محمد بن عبد الوهاب', category: 'عقيدة', icon: '📗', url: 'https://ia903407.us.archive.org/0/items/kitab-al-tawhid/', desc: 'أصول العقيدة الإسلامية' },
  { title: 'العقيدة الواسطية', author: 'ابن تيمية', category: 'عقيدة', icon: '📗', url: 'https://islamqa.info/', desc: 'شرح عقيدة أهل السنة والجماعة' },
  // حديث
  { title: 'رياض الصالحين', author: 'الإمام النووي', category: 'حديث', icon: '📘', url: 'https://hadeethenc.com/ar/home', desc: 'مجموعة الأحاديث النبوية' },
  { title: 'الأربعون النووية', author: 'الإمام النووي', category: 'حديث', icon: '📘', url: 'https://hadeethenc.com/ar/browse/hadiths/1', desc: '42 حديثاً نبوياً شريفاً' },
  { title: 'بلوغ المرام', author: 'ابن حجر العسقلاني', category: 'حديث', icon: '📘', url: 'https://hadeethenc.com/', desc: 'أحاديث الأحكام' },
  // فقه
  { title: 'الفقه الميسر', author: 'مجموعة من العلماء', category: 'فقه', icon: '📙', url: 'https://islamqa.info/ar/', desc: 'فقه العبادات والمعاملات' },
  { title: 'زاد المعاد', author: 'ابن القيم الجوزية', category: 'فقه', icon: '📙', url: 'https://islamqa.info/', desc: 'هدي النبي ﷺ في العبادات والسلوك' },
  // تزكية
  { title: 'إحياء علوم الدين', author: 'الإمام الغزالي', category: 'تزكية', icon: '📕', url: 'https://islamway.net/', desc: 'تزكية النفس وتهذيب الأخلاق' },
  { title: 'مدارج السالكين', author: 'ابن القيم الجوزية', category: 'تزكية', icon: '📕', url: 'https://islamway.net/', desc: 'منازل السالكين إلى الله' },
  // سيرة
  { title: 'الرحيق المختوم', author: 'صفي الرحمن المباركفوري', category: 'سيرة', icon: '📒', url: 'https://islamway.net/', desc: 'السيرة النبوية الشريفة' },
  { title: 'نور اليقين في سيرة سيد المرسلين', author: 'الخضري', category: 'سيرة', icon: '📒', url: 'https://islamway.net/', desc: 'سيرة النبي محمد ﷺ' },
];

const CATEGORIES = ['الكل', ...Array.from(new Set(BOOKS.map(b => b.category)))];

const ONLINE_RESOURCES = [
  { name: 'إسلام ويب', url: 'https://islamweb.net', icon: '🌐', desc: 'فتاوى وأحكام شرعية' },
  { name: 'الإسلام سؤال وجواب', url: 'https://islamqa.info/ar/', icon: '❓', desc: 'أجوبة للمسائل الشرعية' },
  { name: 'موسوعة الحديث', url: 'https://hadeethenc.com/ar/home', icon: '📜', desc: 'موسوعة الحديث النبوي' },
  { name: 'طريق الإسلام', url: 'https://islamway.net/', icon: '🛤️', desc: 'دروس ومحاضرات إسلامية' },
  { name: 'موقع الشيخ ابن باز', url: 'https://binbaz.org.sa/', icon: '📋', desc: 'فتاوى ومؤلفات' },
  { name: 'موقع الشيخ ابن عثيمين', url: 'https://ibnothaimeen.com/', icon: '📋', desc: 'فتاوى ودروس' },
];

export default function LibraryPage() {
  const [selectedCat, setSelectedCat] = useState('الكل');
  const [tab, setTab] = useState<'books' | 'online'>('books');

  const filtered = selectedCat === 'الكل' ? BOOKS : BOOKS.filter(b => b.category === selectedCat);

  return (
    <div>
      <div className="page-header">
        <span style={{ fontSize: 24 }}>📚</span>
        <h1>المكتبة الإسلامية</h1>
      </div>

      {/* Tabs */}
      <div style={{ padding: '12px 16px 0', display: 'flex', gap: 10 }}>
        {(['books', 'online'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '10px', borderRadius: 10,
              background: tab === t ? 'var(--gold)' : 'var(--bg-card)',
              color: tab === t ? '#0D1B2A' : 'var(--text-secondary)',
              border: `1px solid ${tab === t ? 'var(--gold)' : 'var(--border)'}`,
              fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {t === 'books' ? '📖 الكتب' : '🌐 مواقع'}
          </button>
        ))}
      </div>

      {tab === 'books' && (
        <>
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

          <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((book, i) => (
              <div
                key={i}
                className="card"
                style={{ display: 'flex', gap: 14, alignItems: 'flex-start', cursor: 'pointer', padding: '14px' }}
                onClick={() => window.open(book.url, '_blank')}
              >
                <span style={{ fontSize: 32, flexShrink: 0 }}>{book.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{book.title}</p>
                  <p style={{ color: 'var(--gold)', fontSize: 12, marginBottom: 4 }}>{book.author}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.5 }}>{book.desc}</p>
                  <span className={`chip ${book.category === 'عقيدة' ? 'gold' : book.category === 'حديث' ? 'green' : ''}`} style={{ marginTop: 8, display: 'inline-block' }}>
                    {book.category}
                  </span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>↗</span>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'online' && (
        <div style={{ padding: '12px 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ONLINE_RESOURCES.map((res, i) => (
            <div
              key={i}
              className="card"
              style={{ display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer', padding: '14px' }}
              onClick={() => window.open(res.url, '_blank')}
            >
              <span style={{ fontSize: 30, flexShrink: 0 }}>{res.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{res.name}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{res.desc}</p>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>↗</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
