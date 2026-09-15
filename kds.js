// ============================================================
// Admin/KDS PIN — keep this in sync with admin.js's ADMIN_PIN_HASH.
// Default PIN is 1234. See admin.js for how to generate a new hash.
// ============================================================
const KDS_PIN_HASH = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"; // sha256("1234")

let liveOrders = [];
let optionsCatalog = CUSTOMIZATION_DEFAULTS; // static fallback; replaced live once Firestore data arrives
let listenersStarted = false;

async function sha256(text){
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

async function tryLogin(){
  const pin = document.getElementById("pinInput").value.trim();
  const hash = await sha256(pin);
  if (hash === KDS_PIN_HASH){
    sessionStorage.setItem("ws_kds_ok", "1");
    showBoard();
  } else {
    document.getElementById("loginError").style.display = "block";
  }
}

function logout(){
  sessionStorage.removeItem("ws_kds_ok");
  location.reload();
}

function showBoard(){
  document.getElementById("loginWrap").style.display = "none";
  document.getElementById("board").style.display = "block";
  startClock();
  startListening();
}

function startClock(){
  const el = document.getElementById("clock");
  const tick = () => { el.textContent = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }); };
  tick();
  setInterval(tick, 15000);
}

function startListening(){
  if (listenersStarted) return;
  if (!window.__firestore){
    window.addEventListener("firebase-ready", startListening, { once:true });
    return;
  }
  listenersStarted = true;
  const { db, collection, onSnapshot, query, orderBy, doc } = window.__firestore;

  onSnapshot(doc(db, "customization_config", "global"), (snap)=>{
    if (snap.exists()) optionsCatalog = snap.data();
    render();
  }, ()=>{});

  let firstLoad = true;
  onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "asc")), (snap)=>{
    const prevIds = new Set(liveOrders.map(o=>o.id));
    liveOrders = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(o => o.status !== "done");
    if (!firstLoad){
      const hasNew = liveOrders.some(o => !prevIds.has(o.id));
      if (hasNew) document.getElementById("kdsSound").play().catch(()=>{});
    }
    firstLoad = false;
    render();
  }, (err)=>{
    console.error(err);
  });

  // Re-render periodically so elapsed-time labels stay fresh.
  setInterval(render, 30000);
}

function optName(list, id, field){
  const found = (list || []).find(o => o.id === id);
  return found ? found[field] : id;
}

function buildChips(choices){
  if (!choices) return "";
  const chips = [];
  const bread = (optionsCatalog.breadOptions || []).find(b => b.id === choices.bread);
  if (bread) chips.push(`<span class="chip bread">🍞 ${bread.nameAr}</span>`);

  const toastDefault = optionsCatalog.toastOptions && optionsCatalog.toastOptions[0] && optionsCatalog.toastOptions[0].id;
  if (choices.toast && choices.toast !== toastDefault){
    const toast = (optionsCatalog.toastOptions || []).find(o => o.id === choices.toast);
    if (toast) chips.push(`<span class="chip bread">🔥 ${toast.nameAr}</span>`);
  }

  (optionsCatalog.veggieOptions || []).forEach(v=>{
    if (choices.veggies && choices.veggies[v.id] === false){
      chips.push(`<span class="chip removed">🚫 بدون ${v.nameAr}</span>`);
    }
  });

  (optionsCatalog.sauceOptions || []).forEach(s=>{
    const state = choices.sauces && choices.sauces[s.id];
    if (state && state.on){
      const label = state.level === "extra" ? `${s.nameAr} زيادة` : state.level === "onSide" ? `${s.nameAr} على جنب` : s.nameAr;
      chips.push(`<span class="chip sauce">🌶️ ${label}</span>`);
    }
  });

  (optionsCatalog.extraOptions || []).forEach(x=>{
    if (choices.extras && choices.extras[x.id]){
      chips.push(`<span class="chip extra">➕ ${x.nameAr}</span>`);
    }
  });

  return chips.join("");
}

function elapsedMinutes(iso){
  try {
    return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  } catch { return 0; }
}

function renderOrderCard(order){
  const mins = elapsedMinutes(order.createdAt);
  const urgent = order.status === "new" && mins >= 10;
  const itemsHtml = (order.items || []).map(i => `
    <div class="oc-item">
      <div class="oc-item-name"><span>${i.nameAr || i.name}</span><span class="oc-item-qty">×${i.qty}</span></div>
      <div class="oc-chips">${buildChips(i.choices)}</div>
    </div>
  `).join("");

  let actionHtml = "";
  if (order.status === "new"){
    actionHtml = `<button class="oc-btn start" data-act="preparing">🔥 بدء التحضير</button>`;
  } else if (order.status === "preparing"){
    actionHtml = `<button class="oc-btn ready" data-act="delivering">✅ جاهز للتوصيل</button>`;
  } else if (order.status === "delivering"){
    actionHtml = `<button class="oc-btn done" data-act="done">✓ تم التسليم</button>`;
  }

  const card = document.createElement("div");
  card.className = "order-card" + (urgent ? " urgent" : "");
  card.innerHTML = `
    <div class="oc-top">
      <span class="oc-ref">${order.ref || ""}</span>
      <span class="oc-time ${urgent ? "urgent" : ""}">⏱ ${mins} د</span>
    </div>
    <div class="oc-customer">👤 ${order.name || ""}</div>
    ${itemsHtml}
    ${order.note ? `<div class="oc-note">📝 ${order.note}</div>` : ""}
    <div class="oc-actions">${actionHtml}</div>
  `;
  const btn = card.querySelector(".oc-btn");
  if (btn) btn.onclick = () => updateOrderStatus(order.id, btn.dataset.act);
  return card;
}

async function updateOrderStatus(orderId, status){
  const { db, doc, updateDoc } = window.__firestore;
  try { await updateDoc(doc(db, "orders", orderId), { status }); }
  catch (e) { console.warn("Failed to update status:", e); }
}

function render(){
  const lanes = {
    new: document.getElementById("laneNew"),
    preparing: document.getElementById("lanePreparing"),
    delivering: document.getElementById("laneDelivering")
  };
  const counts = { new: 0, preparing: 0, delivering: 0 };

  Object.values(lanes).forEach(l => l.innerHTML = "");

  liveOrders.forEach(order=>{
    const lane = lanes[order.status];
    if (!lane) return;
    counts[order.status]++;
    lane.appendChild(renderOrderCard(order));
  });

  document.getElementById("countNew").textContent = counts.new;
  document.getElementById("countPreparing").textContent = counts.preparing;
  document.getElementById("countDelivering").textContent = counts.delivering;

  Object.entries(lanes).forEach(([status, lane])=>{
    if (counts[status] === 0) lane.innerHTML = `<div class="empty-lane">ولا طلب هلق</div>`;
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  document.getElementById("loginBtn").onclick = tryLogin;
  document.getElementById("pinInput").addEventListener("keydown", e=>{ if (e.key === "Enter") tryLogin(); });
  if (sessionStorage.getItem("ws_kds_ok") === "1") showBoard();

  if ("serviceWorker" in navigator){
    navigator.serviceWorker.register("service-worker.js").catch(()=>{});
  }
});
