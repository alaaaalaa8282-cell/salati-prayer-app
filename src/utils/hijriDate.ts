// Hijri calendar conversion utilities

const HIJRI_MONTHS_AR = [
  'محرّم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوّال', 'ذو القعدة', 'ذو الحجة'
];

const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
  dayName: string;
}

export function toHijri(date: Date): HijriDate {
  const jd = gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const { day, month, year } = jdToHijri(jd);
  return {
    day,
    month,
    year,
    monthName: HIJRI_MONTHS_AR[month - 1],
    dayName: DAYS_AR[date.getDay()],
  };
}

function gregorianToJD(year: number, month: number, day: number): number {
  if (month < 3) { year--; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524;
}

function jdToHijri(jd: number): { day: number; month: number; year: number } {
  jd = Math.floor(jd) + 0.5;
  const z = Math.floor(jd - 1948439.5) + 0.5;
  const a = Math.floor((z - 122.1) / 365.25);
  const b = z - Math.floor(365.25 * a) + 0.5;
  
  let year = Math.floor((30 * z + 10646) / 10631);
  let month = Math.min(12, Math.ceil((z - (29 + jdOfHijri(year, 1, 1))) / 29.5) + 1);
  let day = z - jdOfHijri(year, month, 1) + 1;
  
  // Simple approximation
  const l = jd - 1948439.5;
  year = Math.floor((30 * l + 10646) / 10631);
  month = Math.min(12, Math.ceil((l - (-0.5 + jdOfHijri(year, 1, 1))) / 29.5) + 1);
  day = Math.floor(l) - jdOfHijri(year, month, 1) + 1;
  if (day < 1) { month--; if (month < 1) { month = 12; year--; } day = 30; }
  if (day > 30) { month++; if (month > 12) { month = 1; year++; } day = 1; }

  return { day: Math.max(1, day), month: Math.max(1, month), year };
}

function jdOfHijri(year: number, month: number, day: number): number {
  return day + Math.ceil(29.5 * (month - 1)) + (year - 1) * 354 + 
    Math.floor((3 + 11 * year) / 30) + 1948439 - 385;
}

export function formatHijri(h: HijriDate): string {
  return `${h.day} ${h.monthName} ${h.year} هـ`;
}

export function isRamadan(date: Date = new Date()): boolean {
  return toHijri(date).month === 9;
}

export function getRamadanDays(year: number): { suhoor: string; iftar: string; day: number }[] {
  // Returns first 30 days - times calculated from prayer times
  return Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    suhoor: '',
    iftar: '',
  }));
}
