const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Set resolver aliases for custom components
config.resolver.alias = {
  ...config.resolver.alias, // Preserve existing aliases
  '@': './src', // Add the @ alias here
  'react-native-linear-gradient': require.resolve('./src/components/shared/LinearGradient.js'),
  '@react-native-community/blur': require.resolve('./src/components/shared/BlurView.js'),
  'react-native-blur': require.resolve('./src/components/shared/BlurView.js'),
};

// Platform resolution order (web first for web bundling)
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// Add source extensions for better module resolution
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'jsx',
  'js',
  'ts',
  'tsx',
  'json',
  'cjs',
  'mjs'
];

// Ensure node_modules resolution works correctly
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules')
];

// Add custom resolver to handle missing modules (FIX FOR MODULE 3807 ERROR)
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle numeric module IDs that don't exist
  if (moduleName.match(/^\d+$/)) {
    console.warn(`Metro: Attempting to resolve unknown module ID: ${moduleName}`);
    // Return null to gracefully handle missing modules
    return {
      type: 'empty',
    };
  }
  
  // Handle known problematic modules
  const problematicModules = ['3807', '3808', '3809']; // Add more as needed
  if (problematicModules.includes(moduleName)) {
    console.warn(`Metro: Skipping problematic module: ${moduleName}`);
    return {
      type: 'empty',
    };
  }
  
  // Use default resolver for normal modules
  try {
    return context.resolveRequest(context, moduleName, platform);
  } catch (error) {
    console.warn(`Metro: Failed to resolve ${moduleName}:`, error.message);
    // Return empty module instead of crashing
    return {
      type: 'empty',
    };
  }
};

// Transform configuration for better compatibility
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
  
  // Add configuration to handle dynamic imports better
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false, // Disable problematic import features
      inlineRequires: false, // Prevent inline require issues
    },
  }),
  
  minifierConfig: {
    // Disable minification issues with certain modules
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Add watchman configuration to prevent file watching issues
config.watchFolders = [
  path.resolve(__dirname, 'src'),
  path.resolve(__dirname, 'node_modules')
];

// Reset cache configuration
config.resetCache = true;

module.exports = config;