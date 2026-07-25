// ============================================================
// Firebase configuration for Wissam Snack
// ------------------------------------------------------------
// 1) Go to https://console.firebase.google.com → create a project
//    (or reuse an existing one, but a SEPARATE project from Aklatna
//    is recommended so orders don't mix).
// 2) Enable "Firestore Database" (production mode).
// 3) Project settings → General → "Your apps" → Web app → copy the
//    config object below.
// 4) Paste your real values here. Until you do, the site still
//    works fully (menu, cart, WhatsApp order) — it just won't save
//    orders to the admin panel.
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyDAolzoI_4YTsXULSmkItfY6YvHa3yXpZg",
  authDomain: "wissam-snack.firebaseapp.com",
  projectId: "wissam-snack",
  storageBucket: "wissam-snack.firebasestorage.app",
  messagingSenderId: "503317111404",
  appId: "1:503317111404:web:49af00ed1148629b6bee49"
};

let db = null;

(async function initFirebase(){
  if (firebaseConfig.apiKey === "REPLACE_ME") return; // not configured yet
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
    const {
      getFirestore, collection, addDoc, serverTimestamp,
      onSnapshot, query, orderBy, doc, updateDoc
    } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);

    window.saveOrderToFirestore = async function(order){
      await addDoc(collection(db, "orders"), { ...order, serverCreatedAt: serverTimestamp() });
    };

    // Exposed for admin.js (plain script, no ES module imports there)
    window.__firestore = { db, collection, onSnapshot, query, orderBy, doc, updateDoc };
    window.dispatchEvent(new Event("firebase-ready"));
  } catch (e) {
    console.warn("Firebase init failed:", e);
  }
})();
