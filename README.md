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

## Estructura

- `src/app/domain`: Entidades y modelos de datos.
- `src/app/application`: Fachadas y casos de uso.
- `src/app/infrastructure`: Servicios HTTP y repositorios de API.
- `src/app/presentation`: Componentes, layouts y páginas.
