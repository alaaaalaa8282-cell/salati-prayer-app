import { useState, useEffect, useCallback } from 'react';
import { Coordinates, CalculationMethod, CalculationParameters, PrayerTimes, Madhab } from 'adhan';
import { LocationData } from './useLocation';
import { storage } from '../utils/storage';

export interface PrayerTime {
  name: string;
  nameAr: string;
  time: Date;
  timeStr: string;
  isNext: boolean;
  notifyEnabled: boolean;
}

export const CALC_METHODS: Record<string, string> = {
  MuslimWorldLeague: 'رابطة العالم الإسلامي',
  Egyptian: 'الهيئة المصرية العامة للمساحة',
  Karachi: 'كراتشي - جامعة العلوم الإسلامية',
  UmmAlQura: 'أم القرى - مكة المكرمة',
  Dubai: 'دبي',
  Qatar: 'قطر',
  Kuwait: 'الكويت',
  MoonsightingCommittee: 'لجنة رؤية الهلال',
  NorthAmerica: 'أمريكا الشمالية',
  Singapore: 'سنغافورة',
  Turkey: 'تركيا',
  Tehran: 'طهران',
};

const PRAYER_NAMES_AR: Record<string, string> = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getMethodParams(method: string): CalculationParameters {
  switch (method) {
    case 'Egyptian':              return CalculationMethod.Egyptian();
    case 'Karachi':               return CalculationMethod.Karachi();
    case 'UmmAlQura':             return CalculationMethod.UmmAlQura();
    case 'Dubai':                 return CalculationMethod.Dubai();
    case 'Qatar':                 return CalculationMethod.Qatar();
    case 'Kuwait':                return CalculationMethod.Kuwait();
    case 'MoonsightingCommittee': return CalculationMethod.MoonsightingCommittee();
    case 'NorthAmerica':          return CalculationMethod.NorthAmerica();
    case 'Singapore':             return CalculationMethod.Singapore();
    case 'Turkey':                return CalculationMethod.Turkey();
    case 'Tehran':                return CalculationMethod.Tehran();
    default:                      return CalculationMethod.MuslimWorldLeague();
  }
}

export function usePrayerTimes(location: LocationData | null) {
  const [prayers, setPrayers] = useState<PrayerTime[]>([]);
  const [calcMethod, setCalcMethod] = useState<string>('Egyptian');
  const [madhab, setMadhab] = useState<string>('Shafi');
  const [notifySettings, setNotifySettings] = useState<Record<string, boolean>>({
    fajr: true, sunrise: false, dhuhr: true, asr: true, maghrib: true, isha: true,
  });

  const loadSettings = useCallback(async () => {
    const method = await storage.get<string>('calc_method', 'Egyptian');
    const mad    = await storage.get<string>('madhab', 'Shafi');
    const notify = await storage.get<Record<string, boolean>>('notify_settings', {
      fajr: true, sunrise: false, dhuhr: true, asr: true, maghrib: true, isha: true,
    });
    setCalcMethod(method);
    setMadhab(mad);
    setNotifySettings(notify);
  }, []);

  const calculate = useCallback((
    loc: LocationData,
    method: string,
    mad: string,
    notifyMap: Record<string, boolean>,
  ) => {
    const coords = new Coordinates(loc.lat, loc.lon);
    const params = getMethodParams(method);
    params.madhab = mad === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;
    const now   = new Date();
    const times = new PrayerTimes(coords, now, params);

    const prayerList = [
      { key: 'fajr',    time: times.fajr },
      { key: 'sunrise', time: times.sunrise },
      { key: 'dhuhr',   time: times.dhuhr },
      { key: 'asr',     time: times.asr },
      { key: 'maghrib', time: times.maghrib },
      { key: 'isha',    time: times.isha },
    ];

    const nextPrayer = times.nextPrayer();

    const result: PrayerTime[] = prayerList.map(p => ({
      name:          p.key,
      nameAr:        PRAYER_NAMES_AR[p.key],
      time:          p.time,
      timeStr:       formatTime(p.time),
      isNext:        p.key === nextPrayer,
      notifyEnabled: notifyMap[p.key] ?? true,
    }));

    setPrayers(result);
  }, []);

  useEffect(() => { loadSettings(); }, []);

  useEffect(() => {
    if (location) calculate(location, calcMethod, madhab, notifySettings);
  }, [location, calcMethod, madhab, notifySettings]);

  const updateNotify = async (prayerKey: string, enabled: boolean) => {
    const updated = { ...notifySettings, [prayerKey]: enabled };
    setNotifySettings(updated);
    await storage.set('notify_settings', updated);
  };

  const updateMethod = async (method: string) => {
    setCalcMethod(method);
    await storage.set('calc_method', method);
  };

  const updateMadhab = async (mad: string) => {
    setMadhab(mad);
    await storage.set('madhab', mad);
  };

  const getNextPrayer = (): PrayerTime | null =>
    prayers.find(p => p.isNext) || null;

  const getTimeUntilNext = (): string => {
    const next = getNextPrayer();
    if (!next) return '';
    const diff = next.time.getTime() - Date.now();
    if (diff < 0) return '';
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1_000);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return {
    prayers, calcMethod, madhab, notifySettings,
    updateNotify, updateMethod, updateMadhab,
    getNextPrayer, getTimeUntilNext,
  };
      }
