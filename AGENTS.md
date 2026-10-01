# Farm Simulator (p5.js)

## Overview
A p5.js farm simulator game ("Simulador de Fazenda") originally created in the p5.js web editor.
The repo contains static files: `index.html`, `sketch.js`, `style.css`, and ~24 image assets (jpg/webp).

## Running
```bash
docker compose -f docker-compose.base44.yml up -d
```
Serves on port 3000 via Python's built-in HTTP server. No build step — it's a static site.

## How it works
- `index.html` loads p5.js from CDN and includes `sketch.js`
- `sketch.js` is the complete game (668 lines): start screen, farm, city, buy/sell menus
- Images are loaded via relative paths (e.g., `loadImage("fazenda.jpg")`)
- Game controls: WASD to move, P to plant, click to harvest, C/F to switch farm/city, V/M for shops

## No secrets required
This is a purely static project with no backend, database, or external services.
