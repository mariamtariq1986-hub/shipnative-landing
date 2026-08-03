import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const next: ExpoConfig = {
    ...config,
    name: 'Replyly',
    slug: 'replyly',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'replyly',
    userInterfaceStyle: 'automatic',
    icon: './assets/icon.png',
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.mariamtariq.replyly',
      infoPlist: {
        NSUserNotificationsUsageDescription:
          'Replyly can remind you to follow up on unanswered customer messages.',
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: 'com.mariamtariq.replyly',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#07110d',
      },
      permissions: ['POST_NOTIFICATIONS'],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-web-browser',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#07110d',
          image: './assets/splash-icon.png',
          imageWidth: 200,
        },
      ],
      [
        'expo-notifications',
        {
          color: '#25d366',
          defaultChannel: 'reminders',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: 'f7976a6e-92d4-46b0-82fd-c2487ff958e5',
      },
      privacyUrl: 'https://replyly-kappa.vercel.app/privacy',
      gumroadUrl: 'https://mariamtariq72.gumroad.com/l/replyly',
    },
  };

  // Splash kept via expo-splash-screen plugin; classic splash key for Expo Go compatibility.
  return {
    ...next,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#07110d',
    },
  } as ExpoConfig;
};
