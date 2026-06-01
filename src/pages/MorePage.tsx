import { useState } from 'react';
import MosquesPage from './MosquesPage';
import RamadanPage from './RamadanPage';
import LibraryPage from './LibraryPage';
import WallpapersPage from './WallpapersPage';
import GreetingCardsPage from './GreetingCardsPage';
import SettingsPage from './SettingsPage';

type SubPage = null | 'mosques' | 'ramadan' | 'library' | 'wallpapers' | 'cards' | 'settings';

const MENU_ITEMS = [
  { id: 'mosques',    icon: '🕌', title: 'أقرب المساجد',       desc: 'ابحث عن مساجد بالقرب منك' },
  { id: 'ramadan',    icon: '🌙', title: 'رمضان',              desc: 'إمساكية، تذكيرات، معلومات' },
  { id: 'library',    icon: '📚', title: 'المكتبة الإسلامية',  desc: 'كتب ومواقع إسلامية' },
  { id: 'wallpapers', icon: '🖼️', title: 'خلفيات إسلامية',    desc: 'خلفيات جميلة للهاتف' },
  { id: 'cards',      icon: '🎉', title: 'بطاقات التهنئة',     desc: 'تهنئة بالمناسبات الإسلامية' },
  { id: 'settings',   icon: '⚙️', title: 'الإعدادات',          desc: 'تخصيص التطبيق وإعداداته' },
] as const;

export default function MorePage() {
  const [page, setPage] = useState<SubPage>(null);

  const renderSubPage = () => {
    switch (page) {
      case 'mosques':    return <MosquesPage />;
      case 'ramadan':    return <RamadanPage />;
      case 'library':    return <LibraryPage />;
      case 'wallpapers': return <WallpapersPage />;
      case 'cards':      return <GreetingCardsPage />;
      case 'settings':   return <SettingsPage />;
      default:           return null;
    }
  };

  if (page) {
    return (
      <div style={{ position: 'relative' }}>
        {/* Back button overlay */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 200,
          display: 'flex', alignItems: 'center',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          padding: '14px 16px',
          gap: 12,
        }}>
          <button
            onClick={() => setPage(null)}
            style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 24, cursor: 'pointer', padding: 0 }}
          >←</button>
          <p style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 16 }}>
            {MENU_ITEMS.find(m => m.id === page)?.title}
          </p>
        </div>
        {renderSubPage()}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <span style={{ fontSize: 24 }}>🕌</span>
        <h1>المزيد</h1>
      </div>

      {/* App branding */}
      <div style={{
        margin: '16px 16px 8px',
        background: 'linear-gradient(135deg, #1A2B3C, #0D1B2A)',
        borderRadius: 14, padding: '20px', textAlign: 'center',
        border: '1px solid rgba(200,169,110,0.2)',
      }}>
        <p style={{ fontSize: 36, marginBottom: 8 }}>🕌</p>
        <p style={{ color: 'var(--gold)', fontWeight: 800, fontSize: 20 }}>صلاتي</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>تطبيق المسلم الشامل</p>
      </div>

      {/* Menu grid */}
      <div style={{ padding: '8px 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MENU_ITEMS.map(item => (
          <div
            key={item.id}
            className="card"
            onClick={() => setPage(item.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', padding: '14px 16px' }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, flexShrink: 0,
            }}>
              {item.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 15 }}>{item.title}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 3 }}>{item.desc}</p>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: 20 }}>‹</span>
          </div>
        ))}
      </div>

      {/* App version */}
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 11, paddingBottom: 10 }}>
        صلاتي v1.0.0 • com.mohamed.Alaa
      </p>
    </div>
  );
}
