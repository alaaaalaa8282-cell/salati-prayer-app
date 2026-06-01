import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PrayerTime } from './usePrayerTimes';

export function useNotifications() {
  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    try {
      await LocalNotifications.requestPermissions();
    } catch (e) {
      console.warn('Notification permission error:', e);
    }
  };

  const schedulePrayerNotifications = async (prayers: PrayerTime[], azanVoice: string) => {
    try {
      await LocalNotifications.cancel({ notifications: (await LocalNotifications.getPending()).notifications });

      const notifications = prayers
        .filter(p => p.notifyEnabled && p.time > new Date())
        .map((p, i) => ({
          id: i + 1,
          title: `حان وقت صلاة ${p.nameAr}`,
          body: `الآن ${p.timeStr} - ${p.nameAr}`,
          schedule: { at: p.time },
          sound: 'azan.mp3',
          smallIcon: 'ic_launcher_foreground',
          iconColor: '#C8A96E',
        }));

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
      }
    } catch (e) {
      console.warn('Schedule notifications error:', e);
    }
  };

  const scheduleAzkarReminder = async (type: 'morning' | 'evening', hour: number, minute: number) => {
    try {
      const id = type === 'morning' ? 100 : 101;
      const title = type === 'morning' ? '🌅 أذكار الصباح' : '🌆 أذكار المساء';
      const body = type === 'morning' ? 'حان وقت أذكار الصباح' : 'حان وقت أذكار المساء';

      await LocalNotifications.schedule({
        notifications: [{
          id,
          title,
          body,
          schedule: {
            on: { hour, minute },
            repeats: true,
          },
          smallIcon: 'ic_launcher_foreground',
          iconColor: '#C8A96E',
        }],
      });
    } catch (e) {
      console.warn('Azkar reminder error:', e);
    }
  };

  const scheduleIslamicDutyReminder = async (id: number, title: string, body: string, date: Date) => {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          id,
          title,
          body,
          schedule: { at: date },
          smallIcon: 'ic_launcher_foreground',
          iconColor: '#C8A96E',
        }],
      });
    } catch (e) {
      console.warn('Duty reminder error:', e);
    }
  };

  return { schedulePrayerNotifications, scheduleAzkarReminder, scheduleIslamicDutyReminder };
}
