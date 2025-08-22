import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.24c02c5eb6724c09b1c3eae722ad5449',
  appName: 'gold-ease-receipt',
  webDir: 'dist',
  server: {
    url: 'https://24c02c5e-b672-4c09-b1c3-eae722ad5449.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    StatusBar: {
      style: 'default'
    }
  }
};

export default config;