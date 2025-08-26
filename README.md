# Weather App (React Native + Expo)

Esta aplicación permite consultar el clima actual de cualquier ciudad usando la API de OpenWeatherMap.

# Weather App — Proyecto (React Native + Expo)

Versión corta
---------------
Aplicación móvil multiplataforma (Android / iOS / Web) creada con Expo + React Native que consulta datos de clima (OpenWeatherMap) y presenta una UI estilo iOS con widgets visuales (compás de viento, dial de presión y mapa de precipitación).

Estado del proyecto
-------------------
- Fase: Beta.
- APK generado con EAS Build disponible para pruebas en Android.
- Nota importante: en la versión beta actual se ha detectado un fallo en Android donde la app puede abrirse, mostrarse unos segundos y cerrarse inesperadamente en algunos dispositivos. Estamos investigando la causa y en futuras actualizaciones se publicará la corrección. Mientras tanto, ayuda de testing:
   - Recolecta logs con `adb logcat` y compártelos para acelerar el diagnóstico.
   - Prueba en varios dispositivos y anota pasos específicos que reproduzcan el cierre.

Descripción del programa
------------------------
La app permite:
- Buscar clima por ciudad (autocomplete usando la API de geocoding).
- Mostrar clima actual y pronóstico (horario/7 días).
- Visualizaciones: compás de viento (SVG), dial de presión, y un bloque de precipitación que usa `react-native-maps` en móvil nativo y un fallback web cuando se ejecuta en navegador.
- Theming dinámico basado en amanecer/atardecer.

Tecnologías y enlaces
---------------------
- Framework: Expo / React Native — https://expo.dev / https://reactnative.dev
- Router: `expo-router` — https://expo.github.io/router
- Maps (nativo): `react-native-maps` — https://github.com/react-native-maps/react-native-maps
- Gráficos SVG: `react-native-svg` — https://github.com/software-mansion/react-native-svg
- Localización: `expo-location` — https://docs.expo.dev/versions/latest/sdk/location
- API clima: OpenWeatherMap — https://openweathermap.org/api
- Build en la nube: EAS Build — https://expo.dev/eas

Instalación y pruebas (desarrollo)
---------------------------------
Requisitos locales:
- Node.js (16+ recomendado)
- npm o yarn
- Expo CLI y EAS CLI (opcional para builds nativos):

```powershell
npm install -g expo-cli eas-cli
```

Pasos básicos para ejecutar en desarrollo (web / Expo Go):

1. Clona el repositorio y entra en la carpeta:

```powershell
git clone https://github.com/Stuwarth/WEATHER-APP-.git
cd WEATHER-APP-
```

2. Instala dependencias:

```powershell
npm install
```

3. Inicia el servidor de desarrollo (Expo):

```powershell
npx expo start
```

4. Abre en tu dispositivo con Expo Go (Android) o en la web con el navegador. Nota: Expo Go NO carga módulos nativos adicionales (como `react-native-maps` nativo); para probar mapas nativos usa un build nativo (EAS).

Variables de entorno
--------------------
- La app usa OpenWeatherMap. Añade tu API key en el archivo correspondiente (`app/index.js` o el lugar señalado en el código) o exporta la variable de entorno para EAS/entorno de build. Ejemplo local:

```powershell
setx OWM_API_KEY "tu_api_key_aqui"
```

Compilar para Android (APK) — pasos rápidos
-----------------------------------------
1. Asegúrate de tener el proyecto en Git y los cambios subidos (recomendado):

```powershell
git add app.json package.json package-lock.json
git commit -m "Prepara proyecto para EAS Build"
git push origin main
```

2. Inicia build en la nube (preview para pruebas internas):

```powershell
eas build --platform android --profile preview
```

3. Al terminar descarga el APK desde la página de builds en https://expo.dev/accounts/<tu_cuenta>/projects/<tu_proyecto>/builds o usa el enlace/QR que te entrega la CLI.

4. Instala el APK en un dispositivo Android:

 - Directamente desde el móvil (abre el enlace o QR y descarga)
 - O desde PC con `adb`:

```powershell
adb install -r path\to\app.apk
```

Probar en iOS
------------
- Para generar un IPA y probar en iPhone necesitas una cuenta Apple Developer (de pago). Puedes usar EAS para crear el build iOS y distribuir por TestFlight.
- Comando de build iOS (EAS):

```powershell
eas build --platform ios --profile preview
```

Notas: EAS te guiará para gestionar credenciales (recomendado permitir la gestión automática si no estás familiarizado).

Debugging y problemas conocidos
-------------------------------
- Crash en Android (Beta): la app se cierra después de unos segundos en algunos dispositivos. Qué hacer para ayudar a resolverlo:
   1. Ejecuta `adb logcat` mientras reproduces el cierre para capturar el stacktrace.
   2. Reproduce los pasos exactos (ciudad buscada, uso de GPS, apertura del bloque de precipitación).
   3. Sube los logs y descríbelos en un issue o compártelos con el equipo.
- Errores de build en EAS: revisa la sección "Bundle JavaScript" en los logs de la build en https://expo.dev (la CLI también imprime un enlace al build).
- Si el mapa nativo ocasiona problemas en web, la app usa un mock (fallback) para evitar errores en navegadores.

Contribuir
----------
- Pull requests bienvenidas. Para cambios grandes, crea una rama (`git checkout -b feat/nombre`) y abre un PR describiendo los cambios.
- Antes de abrir PRs, asegúrate de que `npm test` (si existen tests) y `npx expo lint` pasan.

Licencia
--------
Proyecto para fines académicos / demostración. Añade la licencia que prefieras (MIT es común para proyectos personales).

Contacto
-------
- Para preguntas o envío de logs: abre un issue en el repo o contacta al autor (ver perfil de GitHub).

---

Este README fue generado para ayudarte a probar y compartir la app de forma segura durante la fase beta; si quieres, puedo añadir instrucciones específicas para recoger logs (`adb logcat` filtros) o un apartado de troubleshooting extendido.
