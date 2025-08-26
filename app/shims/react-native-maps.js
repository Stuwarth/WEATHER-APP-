const React = require('react');
const { Platform, View, Text } = require('react-native');

if (Platform.OS === 'web') {
  // Web-safe lightweight mock so bundler doesn't try to resolve native-only code.
  const MapView = ({ children, style }) => (
    React.createElement(View, { style }, React.createElement(Text, { style: { color: '#fff' } }, 'Mapa nativo (solo en móvil)'))
  );
  const UrlTile = () => null;
  const Marker = ({ children }) => React.createElement(View, null, children);
  const PROVIDER_GOOGLE = null;
  module.exports = { default: MapView, UrlTile, Marker, PROVIDER_GOOGLE };
} else {
  // Avoid static analysis picking up the native module on web by using concatenation.
  // eslint-disable-next-line global-require
  module.exports = require('react-native' + '-maps');
}
