// Service Worker: speichert die App-Dateien, damit sie auch offline funktioniert.
// Bei Änderungen an der App die Versionsnummer erhöhen, damit Handys die neue Version laden.
const VERSION = 'fisi-lernapp-v16';
const DATEIEN = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/speicher.js',
  './js/subnetting.js',
  './js/lektionen.js',
  './data/fragen.js',
  './data/karten.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(DATEIEN)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Erst aus dem Netz laden (damit Änderungen sofort ankommen), offline aus dem Speicher.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(antwort => {
        const kopie = antwort.clone();
        caches.open(VERSION).then(c => c.put(e.request, kopie));
        return antwort;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
