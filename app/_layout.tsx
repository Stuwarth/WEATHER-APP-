import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import WeatherApp from './index';

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <WeatherApp />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
