// Proxy file to defer to platform-specific implementations.
// Prefer the web-safe implementation to avoid SSR/native import issues.
export { default } from './NativePrecipitationMap.web';
