// ============================================================
// Push notifications (background) — Firebase Cloud Messaging
// This runs even when no tab/app window is open, which is what
// lets the badge count on the home-screen icon update instantly.
// ============================================================
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDAolzoI_4YTsXULSmkItfY6YvHa3yXpZg",
  authDomain: "wissam-snack.firebaseapp.com",
  projectId: "wissam-snack",
  storageBucket: "wissam-snack.firebasestorage.app",
  messagingSenderId: "503317111404",
  appId: "1:503317111404:web:49af00ed1148629b6bee49"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const badgeCount = payload.data && payload.data.badgeCount !== undefined ? Number(payload.data.badgeCount) : undefined;

  if (payload.notification){
    self.registration.showNotification(payload.notification.title || "طلب جديد – وسام سناك", {
      body: payload.notification.body || "",
      icon: "icons/icon-192.png",
      badge: "icons/icon-96.png",
      data: payload.data || {}
    });
  }

  if (badgeCount !== undefined && self.navigator && self.navigator.setAppBadge){
    if (badgeCount > 0) self.navigator.setAppBadge(badgeCount).catch(()=>{});
    else if (self.navigator.clearAppBadge) self.navigator.clearAppBadge().catch(()=>{});
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientsArr) => {
      const existing = clientsArr.find((c) => c.url.includes("admin.html"));
      if (existing) return existing.focus();
      return self.clients.openWindow("./admin.html");
    })
  );
});

const CACHE_NAME = "wissam-snack-v9";
const ASSETS = [
  "./index.html",
  "./style.css",
  "./app.js",
  "./menu-data.js",
  "./firebase-config.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Let page navigations (opening the app / clicking the home-screen icon) go
  // straight to the network. iOS Safari refuses to render a response that came
  // through a redirect if it was served via a service worker's respondWith(),
  // even a same-origin one — this sidesteps that entirely for navigations.
  if (event.request.mode === "navigate") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((res) => {
            if (!res || !res.ok || res.redirected) return res; // don't cache redirects/errors
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            return res;
          })
          .catch(() => cached)
      );
    })
  );
});
