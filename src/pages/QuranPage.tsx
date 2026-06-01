import { useState, useEffect, useRef } from 'react';
import { SURAHS, RECITERS } from '../data/quranSurahs';
import { storage } from '../utils/storage';

interface Verse {
  number: number;
  numberInSurah: number;
  text: string;
}

type View = 'list' | 'reader';

export default function QuranPage() {
  const [view, setView] = useState<View>('list');
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const filtered = SURAHS.filter(s =>
    s.nameAr.includes(search) || s.nameEn.toLowerCase().includes(search.toLowerCase()) || String(s.number).includes(search)
  );

  if (view === 'reader' && selectedSurah !== null) {
    return (
      <SurahReader
        surahNumber={selectedSurah}
        onBack={() => setView('list')}
        onNext={() => selectedSurah < 114 && setSelectedSurah(selectedSurah + 1)}
        onPrev={() => selectedSurah > 1 && setSelectedSurah(selectedSurah - 1)}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <span style={{ fontSize: 24 }}>📖</span>
        <h1>القرآن الكريم</h1>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px' }}>
        <input
          type="text"
          placeholder="ابحث عن سورة..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '10px 14px',
            color: 'var(--text-primary)',
            fontSize: 15,
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Surah list */}
      <div style={{ padding: '0 16px 16px' }}>
        {filtered.map(surah => (
          <div
            key={surah.number}
            className="card"
            onClick={() => { setSelectedSurah(surah.number); setView('reader'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8, cursor: 'pointer', padding: '12px 14px' }}
          >
            {/* Number badge */}
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--gold)', fontWeight: 700, fontSize: 13, flexShrink: 0,
            }}>
              {surah.number}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontWeight: 700, fontSize: 16 }}>{surah.nameAr}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'sans-serif' }}>{surah.nameEn}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <span className="chip">{surah.verses} آية</span>
                <span className={`chip ${surah.revelationType === 'مكية' ? 'gold' : 'green'}`}>{surah.revelationType}</span>
              </div>
            </div>

            <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>‹</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Surah Reader ────────────────────────────────────────────────────────────

function SurahReader({ surahNumber, onBack, onNext, onPrev }: {
  surahNumber: number;
  onBack: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const surah = SURAHS[surahNumber - 1];
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reciter, setReciter] = useState('ar.alafasy');
  const [showReciters, setShowReciters] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [playingVerse, setPlayingVerse] = useState<number | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [fontSize, setFontSize] = useState(22);

  useEffect(() => {
    storage.get<string>('reciter', 'ar.alafasy').then(setReciter);
    storage.get<number[]>(`bookmarks_${surahNumber}`, []).then(setBookmarks);
    loadSurah();
  }, [surahNumber]);

  const loadSurah = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`);
      const data = await res.json();
      if (data.code === 200) {
        setVerses(data.data.ayahs.map((v: any) => ({
          number: v.number,
          numberInSurah: v.numberInSurah,
          text: v.text,
        })));
      } else {
        setError('تعذّر تحميل السورة');
      }
    } catch {
      setError('تحقق من اتصالك بالإنترنت');
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (verseNum: number) => {
    const updated = bookmarks.includes(verseNum)
      ? bookmarks.filter(b => b !== verseNum)
      : [...bookmarks, verseNum];
    setBookmarks(updated);
    await storage.set(`bookmarks_${surahNumber}`, updated);
  };

  const playVerse = async (verseAbsoluteNumber: number, verseInSurah: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (playingVerse === verseAbsoluteNumber) {
      setPlayingVerse(null);
      setAudioPlaying(false);
      return;
    }
    // Calculate the verse number for Quran CDN
    // CDN uses the format: reciter/verse_number.mp3
    // For surah 1 (Al-Fatihah), ayah 1 is 1; for surah 2 ayah 1 it's 8, etc.
    const url = `https://cdn.islamic.network/quran/audio/128/${reciter}/${verseAbsoluteNumber}.mp3`;
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingVerse(verseAbsoluteNumber);
    setAudioPlaying(true);
    audio.play().catch(() => setAudioPlaying(false));
    audio.onended = () => {
      setPlayingVerse(null);
      setAudioPlaying(false);
    };
    audio.onerror = () => {
      setPlayingVerse(null);
      setAudioPlaying(false);
    };
  };

  const playFullSurah = () => {
    if (!verses.length) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const url = `https://cdn.islamic.network/quran/audio/128/${reciter}/${verses[0].number}.mp3`;
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingVerse(verses[0].number);
    setAudioPlaying(true);
    let i = 0;
    audio.play();
    audio.onended = () => {
      i++;
      if (i < verses.length) {
        const next = new Audio(`https://cdn.islamic.network/quran/audio/128/${reciter}/${verses[i].number}.mp3`);
        audioRef.current = next;
        setPlayingVerse(verses[i].number);
        next.play();
        next.onended = audio.onended as any;
        next.onerror = () => { setPlayingVerse(null); setAudioPlaying(false); };
      } else {
        setPlayingVerse(null);
        setAudioPlaying(false);
      }
    };
  };

  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlayingVerse(null);
    setAudioPlaying(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 24, cursor: 'pointer' }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 18 }}>{surah.nameAr}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{surah.verses} آية • {surah.revelationType}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setFontSize(s => Math.min(s + 2, 32))} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 18, cursor: 'pointer' }}>A+</button>
          <button onClick={() => setFontSize(s => Math.max(s - 2, 16))} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer' }}>A-</button>
        </div>
      </div>

      {/* Audio controls */}
      <div style={{ background: 'var(--bg-surface)', padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          onClick={audioPlaying ? stopAudio : playFullSurah}
          className="btn-primary"
          style={{ flex: 1, padding: '10px', fontSize: 14 }}
          disabled={loading}
        >
          {audioPlaying ? '⏹ إيقاف' : '▶ استماع للسورة'}
        </button>
        <button
          onClick={() => setShowReciters(!showReciters)}
          className="btn-outline"
          style={{ fontSize: 13, padding: '10px 12px', whiteSpace: 'nowrap' }}
        >
          🎙 القارئ
        </button>
      </div>

      {/* Reciter selector */}
      {showReciters && (
        <div style={{ background: 'var(--bg-card)', padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
          {RECITERS.map(r => (
            <div
              key={r.id}
              onClick={async () => { setReciter(r.id); await storage.set('reciter', r.id); setShowReciters(false); }}
              style={{
                padding: '10px 0',
                color: reciter === r.id ? 'var(--gold)' : 'var(--text-secondary)',
                fontWeight: reciter === r.id ? 700 : 400,
                cursor: 'pointer',
                borderBottom: '1px solid var(--border)',
                fontSize: 14,
              }}
            >
              {reciter === r.id ? '✓ ' : ''}{r.name}
            </div>
          ))}
        </div>
      )}

      {/* Bismillah */}
      {surahNumber !== 1 && surahNumber !== 9 && (
        <div style={{ textAlign: 'center', padding: '20px 16px 10px', fontSize: 24, color: 'var(--gold)', fontFamily: 'serif' }}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
      )}

      {/* Verses */}
      {loading && <div className="spinner" />}
      {error && (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>{error}</p>
          <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={loadSurah}>إعادة المحاولة</button>
        </div>
      )}

      <div style={{ padding: '10px 16px 20px' }}>
        {verses.map((verse) => (
          <div
            key={verse.number}
            className="card"
            style={{
              marginBottom: 10,
              background: playingVerse === verse.number ? 'rgba(200,169,110,0.08)' : 'var(--bg-card)',
              border: playingVerse === verse.number ? '1px solid rgba(200,169,110,0.4)' : '1px solid var(--border)',
            }}
          >
            {/* Verse header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--gold)', fontSize: 12, fontWeight: 700,
              }}>
                {verse.numberInSurah}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => toggleBookmark(verse.number)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: bookmarks.includes(verse.number) ? 'var(--gold)' : 'var(--text-muted)' }}
                >
                  {bookmarks.includes(verse.number) ? '🔖' : '🏷'}
                </button>
                <button
                  onClick={() => playVerse(verse.number, verse.numberInSurah)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: playingVerse === verse.number ? 'var(--gold)' : 'var(--text-muted)' }}
                >
                  {playingVerse === verse.number ? '⏸' : '▶'}
                </button>
              </div>
            </div>
            {/* Verse text */}
            <p className="verse-text" style={{ fontSize: fontSize, textAlign: 'right', lineHeight: 2.2 }}>
              {verse.text} ۝{verse.numberInSurah}
            </p>
          </div>
        ))}

        {/* Navigation */}
        {!loading && verses.length > 0 && (
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            {surahNumber > 1 && (
              <button className="btn-outline" style={{ flex: 1 }} onClick={onPrev}>
                ← السورة السابقة
              </button>
            )}
            {surahNumber < 114 && (
              <button className="btn-primary" style={{ flex: 1 }} onClick={onNext}>
                السورة التالية →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
