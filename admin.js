// ============================================================
// Admin PIN — CHANGE THIS before going live.
// Default PIN is 1234. To set a new PIN:
//   1) Open browser console on this page and run:
//      await crypto.subtle.digest("SHA-256", new TextEncoder().encode("YOUR_NEW_PIN"))
//        .then(buf => console.log(Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("")))
//   2) Paste the resulting hash below as ADMIN_PIN_HASH.
// ============================================================
const ADMIN_PIN_HASH = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"; // sha256("1234")

const STATUS_LABELS = {
  new: { label: "جديد", cls: "st-new" },
  preparing: { label: "قيد التحضير", cls: "st-preparing" },
  delivering: { label: "قيد التوصيل", cls: "st-delivering" },
  done: { label: "تم التسليم", cls: "st-done" }
};

let allOrders = [];
let activeFilter = "all";

async function sha256(text){
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

async function tryLogin(){
  const pin = document.getElementById("pinInput").value.trim();
  const hash = await sha256(pin);
  if (hash === ADMIN_PIN_HASH){
    sessionStorage.setItem("ws_admin_ok", "1");
    showDashboard();
  } else {
    document.getElementById("loginError").style.display = "block";
  }
}

function logout(){
  sessionStorage.removeItem("ws_admin_ok");
  location.reload();
}

function showDashboard(){
  document.getElementById("loginWrap").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  startListening();
}

function fmtMoney(n){ return (n||0).toLocaleString("ar-LB") + " ل.ل"; }
function fmtTime(iso){
  try {
    return new Date(iso).toLocaleString("ar-LB", { dateStyle:"short", timeStyle:"short" });
  } catch { return ""; }
}

function renderFilters(){
  const wrap = document.getElementById("filters");
  const opts = [
    { id: "all", label: "الكل" },
    { id: "new", label: "جديد" },
    { id: "preparing", label: "قيد التحضير" },
    { id: "delivering", label: "قيد التوصيل" },
    { id: "done", label: "تم التسليم" }
  ];
  wrap.innerHTML = "";
  opts.forEach(o=>{
    const btn = document.createElement("button");
    btn.textContent = o.label;
    btn.className = activeFilter === o.id ? "active" : "";
    btn.onclick = () => { activeFilter = o.id; render(); };
    wrap.appendChild(btn);
  });
}

function renderStats(){
  const el = document.getElementById("stats");
  const total = allOrders.length;
  const today = allOrders.filter(o => {
    const d = new Date(o.createdAt);
    const n = new Date();
    return d.toDateString() === n.toDateString();
  });
  const todayRevenue = today.reduce((s,o)=> s + (o.total||0), 0);
  const newCount = allOrders.filter(o=>o.status === "new").length;
  el.innerHTML = `
    <div class="stat"><div class="n">${today.length}</div><div class="l">طلبات اليوم</div></div>
    <div class="stat"><div class="n">${fmtMoney(todayRevenue)}</div><div class="l">مبيعات اليوم</div></div>
    <div class="stat"><div class="n">${newCount}</div><div class="l">طلبات جديدة</div></div>
    <div class="stat"><div class="n">${total}</div><div class="l">إجمالي الطلبات</div></div>
  `;
}

async function updateStatus(orderId, status){
  const { db, doc, updateDoc } = window.__firestore;
  try {
    await updateDoc(doc(db, "orders", orderId), { status });
  } catch (e) {
    console.warn("Failed to update status:", e);
  }
}

function render(){
  renderStats();
  renderFilters();
  const list = document.getElementById("ordersList");
  const filtered = activeFilter === "all" ? allOrders : allOrders.filter(o => o.status === activeFilter);

  if (filtered.length === 0){
    list.innerHTML = `<div class="empty">لا توجد طلبات حالياً</div>`;
    return;
  }

  list.innerHTML = "";
  filtered.forEach(order=>{
    const st = STATUS_LABELS[order.status] || STATUS_LABELS.new;
    const itemsHtml = (order.items||[]).map(i => `<div>• ${i.nameAr || i.name} × ${i.qty} — ${fmtMoney(i.price*i.qty)}</div>`).join("");
    const payLabel = order.payment === "whish" ? `Whish Money${order.whishRef ? " (مرجع: " + order.whishRef + ")" : ""}` : "نقداً عند التوصيل";

    const card = document.createElement("div");
    card.className = "order-card";
    card.innerHTML = `
      <div class="order-top">
        <div>
          <div class="order-ref">${order.ref}</div>
          <div class="order-time">${fmtTime(order.createdAt)}</div>
        </div>
        <div class="order-status ${st.cls}">${st.label}</div>
      </div>
      <div class="order-body">
        <div class="row"><b>الزبون:</b> ${order.name}</div>
        <div class="row"><b>الموبايل:</b> <a href="tel:${order.phone}" style="color:#f7f1e1;">${order.phone}</a></div>
        <div class="row"><b>العنوان:</b> ${order.address}</div>
        ${order.note ? `<div class="row"><b>ملاحظات:</b> ${order.note}</div>` : ""}
        <div class="row"><b>الدفع:</b> <span class="pay-tag">${payLabel}</span></div>
        <div class="items-list">${itemsHtml}</div>
        <div class="order-total">المجموع: ${fmtMoney(order.total)}</div>
      </div>
      <div class="order-actions" data-id="${order.id}">
        <button data-status="new" class="${order.status==='new'?'active':''}">جديد</button>
        <button data-status="preparing" class="${order.status==='preparing'?'active':''}">تحضير</button>
        <button data-status="delivering" class="${order.status==='delivering'?'active':''}">توصيل</button>
        <button data-status="done" class="${order.status==='done'?'active':''}">تم التسليم</button>
      </div>
    `;
    card.querySelectorAll(".order-actions button").forEach(btn=>{
      btn.onclick = () => updateStatus(order.id, btn.dataset.status);
    });
    list.appendChild(card);
  });
}

function startListening(){
  if (!window.__firestore){
    window.addEventListener("firebase-ready", startListening, { once:true });
    document.getElementById("ordersList").innerHTML = `<div class="empty">في انتظار الاتصال بقاعدة البيانات... تأكد من تعبئة firebase-config.js</div>`;
    return;
  }
  const { db, collection, onSnapshot, query, orderBy } = window.__firestore;
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  let firstLoad = true;
  onSnapshot(q, (snap)=>{
    const prevIds = new Set(allOrders.map(o=>o.id));
    allOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (!firstLoad){
      const hasNew = allOrders.some(o => !prevIds.has(o.id));
      if (hasNew){
        document.getElementById("notifSound").play().catch(()=>{});
        if (document.hidden) document.title = "🔴 طلب جديد! — " + document.title.replace("🔴 طلب جديد! — ", "");
      }
    }
    firstLoad = false;
    render();
  }, (err)=>{
    console.error(err);
    document.getElementById("ordersList").innerHTML = `<div class="empty">تعذر الاتصال بقاعدة البيانات: ${err.message}</div>`;
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  document.getElementById("loginBtn").onclick = tryLogin;
  document.getElementById("pinInput").addEventListener("keydown", e=>{ if (e.key === "Enter") tryLogin(); });
  if (sessionStorage.getItem("ws_admin_ok") === "1") showDashboard();
});
