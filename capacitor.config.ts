hereimport { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mohamed.Alaa',
  appName: 'صلاتي',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_launcher_foreground',
      iconColor: '#C8A96E',
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0D1B2A',
      showSpinner: false,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#0D1B2A',
    },
  },
};

export default config;
