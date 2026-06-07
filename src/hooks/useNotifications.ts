import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PrayerTime } from './usePrayerTimes';

export function useNotifications() {
  useEffect(() => { requestPermission(); }, []);

  const requestPermission = async () => {
    try { await LocalNotifications.requestPermissions(); } catch {}
  };

  const schedulePrayerNotifications = async (
    prayers: PrayerTime[],
    perPrayerVoice: Record<string, string>,
    iqamaEnabled: boolean,
    iqamaDelay: number,
  ) => {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0)
        await LocalNotifications.cancel({ notifications: pending.notifications });

      const now = new Date();
      const notifications: any[] = [];

      prayers.forEach((p, i) => {
        if (!p.notifyEnabled || p.name === 'sunrise') return;
        if (p.time <= now) return;

        // إشعار الأذان
        notifications.push({
          id: i + 1,
          title: `🕌 حان وقت صلاة ${p.nameAr}`,
          body: `الآن ${p.timeStr}`,
          schedule: { at: p.time },
          smallIcon: 'ic_launcher_foreground',
          iconColor: '#C8A96E',
          extra: { prayer: p.name, voice: perPrayerVoice[p.name] || 'ar.alafasy' },
        });

        // إشعار الإقامة
        if (iqamaEnabled && p.name !== 'sunrise') {
          const iqamaTime = new Date(p.time.getTime() + iqamaDelay * 60 * 1000);
          notifications.push({
            id: i + 10,
            title: `🕌 إقامة صلاة ${p.nameAr}`,
            body: `حان وقت إقامة صلاة ${p.nameAr}`,
            schedule: { at: iqamaTime },
            smallIcon: 'ic_launcher_foreground',
            iconColor: '#2E7D5B',
          });
        }
      });

      if (notifications.length > 0)
        await LocalNotifications.schedule({ notifications });
    } catch (e) { console.warn('Schedule notifications error:', e); }
  };

  const scheduleAzkarReminder = async (hour: number, minute: number, type: 'morning' | 'evening') => {
    try {
      const id   = type === 'morning' ? 200 : 201;
      const title = type === 'morning' ? '🌅 أذكار الصباح' : '🌆 أذكار المساء';
      const body  = type === 'morning' ? 'حان وقت أذكار الصباح' : 'حان وقت أذكار المساء';
      await LocalNotifications.schedule({
        notifications: [{
          id, title, body,
          schedule: { on: { hour, minute }, repeats: true },
          smallIcon: 'ic_launcher_foreground',
          iconColor: '#C8A96E',
        }],
      });
    } catch (e) { console.warn(e); }
  };

  return { schedulePrayerNotifications, scheduleAzkarReminder };
}
