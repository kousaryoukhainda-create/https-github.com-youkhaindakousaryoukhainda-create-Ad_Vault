import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.advault.app',
  appName: 'Ad Vault',
  webDir: 'dist',
  plugins: {
    AdMob: {
      androidAppId: 'ca-app-pub-9097876174837302~6636055175'
    }
  }
};

export default config;
