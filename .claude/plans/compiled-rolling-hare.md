# Plan: Make Math Facts Quiz an Installable PWA

## Context
The web app at `src/web/` is a simple static site. Making it an installable PWA allows users to add it to their home screen and use it offline — perfect for a quiz app that stores everything in localStorage.

## Files to create

### 1. `src/web/manifest.json`
- `name`: "Math Facts Quiz"
- `short_name`: "Math Facts"
- `start_url`: "/"
- `display`: "standalone"
- `background_color`: "#fff"
- `theme_color`: "#1095c1" (Pico CSS primary)
- `icons`: reference the SVG icon at multiple sizes

### 2. `src/web/icon.svg`
Simple math-themed SVG icon (multiplication sign or similar). Used as the PWA icon — SVG works as a single source for all sizes.

### 3. `src/web/sw.js`
Service worker (plain JS, not bundled) that:
- On `install`: pre-caches `index.html`, `app.js`, Pico CSS CDN URL, `manifest.json`, `icon.svg`
- On `fetch`: cache-first strategy — serve from cache, fall back to network, cache new responses
- Versioned cache name so updates invalidate old caches on `activate`

## Files to modify

### 4. `src/web/index.html`
Add to `<head>`:
- `<link rel="manifest" href="manifest.json">`
- `<meta name="theme-color" content="#1095c1">`
- `<link rel="icon" href="icon.svg" type="image/svg+xml">`
- `<meta name="apple-mobile-web-app-capable" content="yes">`

### 5. `src/web/app.ts`
Register the service worker at the end:
```ts
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
```

### 6. `package.json`
Update `build:web:dist` to also copy `manifest.json`, `icon.svg`, and `sw.js` to `dist/`.

## Verification
- `make chingon` — all checks pass
- Manual: serve locally, open DevTools → Application → check manifest loads, service worker registers, app is installable
