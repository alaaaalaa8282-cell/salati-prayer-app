import { useState, useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import HomePage from './pages/HomePage';
import QuranPage from './pages/QuranPage';
import AzkarPage from './pages/AzkarPage';
import QiblaPage from './pages/QiblaPage';
import MorePage from './pages/MorePage';

type Tab = 'home' | 'quran' | 'azkar' | 'qibla' | 'more';

const NAV_ITEMS: { id: Tab; label: string; icon: (active: boolean) => JSX.Element }[] = [
  {
    id: 'home',
    label: 'الرئيسية',
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'quran',
    label: 'القرآن',
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    id: 'azkar',
    label: 'الأذكار',
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    id: 'qibla',
    label: 'القبلة',
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    id: 'more',
    label: 'المزيد',
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
      </svg>
    ),
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => {
    try {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#0D1B2A' });
    } catch {}

    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) CapApp.exitApp();
    });
  }, []);

  const renderPage = () => {
    switch (activeTab) {
      case 'home':  return <HomePage />;
      case 'quran': return <QuranPage />;
      case 'azkar': return <AzkarPage />;
      case 'qibla': return <QiblaPage />;
      case 'more':  return <MorePage />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="page-content">
        {renderPage()}
      </div>

      <nav className="bottom-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon(activeTab === item.id)}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
