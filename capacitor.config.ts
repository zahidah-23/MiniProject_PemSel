import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lostfound.app',
  appName: 'LostFound',
  webDir: 'dist',
  server: {
    cleartext: true
  }
};

export default config;
