const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');
const { resolve: metroResolve } = require('metro-resolver');

const projectRoot = __dirname;
const defaultConfig = getDefaultConfig(projectRoot);

// Path to the web mock we created earlier
const webMockPath = path.resolve(projectRoot, 'web-mocks', 'react-native-maps.js');

// Keep original resolver if present
const originalResolveRequest = defaultConfig.resolver.resolveRequest;

defaultConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  try {
    if (platform === 'web' && (moduleName === 'react-native-maps' || moduleName.startsWith('react-native-maps/'))) {
      return { type: 'sourceFile', filePath: webMockPath };
    }
  } catch (e) {
    // ignore and fall through to original resolver
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  // Fallback to metro-resolver's resolve implementation to correctly handle native bundle resolution
  return metroResolve(context, moduleName, platform);
};

module.exports = defaultConfig;
