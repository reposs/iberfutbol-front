# IberFútbol — Frontend

Plataforma web oficial del fútbol español: marcadores en directo, clasificaciones oficiales, fichas de clubes, estadísticas de jugadores y actualidad deportiva.

## Requisitos previos

- Node.js >= 20.x
- npm >= 10.x

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (puerto 4200)
npm start

# Compilación para producción
npm run build
```

## Estructura y Modo Autónomo (Solo Frontend)

La aplicación funciona de forma **100% autónoma desde el navegador** (sin necesidad de levantar `iberfutbol-back`):

- `src/app/domain`: Entidades y contratos (`FootballRepositoryPort`).
- `src/app/application`: Fachada reactiva con Angular Signals (`FootballFacade`).
- `src/app/infrastructure/autonomous`:
  - `LiveSpanishBrowserProvider`: Sincronización en tiempo real desde el navegador con la API pública CORS de ESPN (LaLiga EA Sports, LaLiga Hypermotion, Copa del Rey y Selección Española), enriquecida con retratos verificados de Wikipedia (`&origin=*`) y TheSportsDB.
  - `RealisticSpanishSeedProvider`: Catálogo estructurado para Primera Federación, Segunda Federación y respaldo instantáneo.
  - `PermittedSpanishNewsBrowserProvider`: Noticias y *timeline* en directo vía ESPN Deportes JSON API y pasarela CORS RSS-a-JSON (`rss2json`).
  - `BrowserAiEditorialEngine`: Motor editorial determinista verificado en cliente para previas, crónicas, resúmenes de jornada e informes de equipos/jugadores.
- `src/app/infrastructure/repositories/autonomous-football.repository.ts`: Implementación autónoma de `FOOTBALL_REPOSITORY_PORT` conectada en `app.config.ts`.
- `src/app/presentation`: Componentes, layouts, páginas y soporte de Google AdSense (`AdPlaceholderComponent`).

## Activar Google AdSense

1. En `src/app/core/config/monetization.config.ts`, cambia `activeCommercialAds: true` y añade tu `adsenseClientId: 'ca-pub-XXXXXXXXXXXXXXXX'`.
2. En `public/ads.txt`, reemplaza `pub-0000000000000000` por tu identificador de editor de Google AdSense.
