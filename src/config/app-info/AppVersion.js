// config/app-info/AppVersion.js
export const APP_VERSION = {
  major: 1,
  minor: 2,
  patch: 3,
  build: 1001,
  versionString: '1.2.3',
  buildString: '1.2.3 (1001)',
  releaseDate: '2024-01-15',
  environment: 'production', // development, staging, production
  minimumSupportedVersion: '1.0.0',
};

export const VERSION_HISTORY = [
  {
    version: '1.2.3',
    releaseDate: '2024-01-15',
    changes: ['Bug fixes', 'Performance improvements'],
    critical: false,
  },
  {
    version: '1.2.0',
    releaseDate: '2024-01-01',
    changes: ['New admin dashboard', 'Enhanced safety features'],
    critical: true,
  },
];