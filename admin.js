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
  initMainTabs();
}

function initMainTabs(){
  document.querySelectorAll("#mainTabs button").forEach(btn=>{
    btn.onclick = () => {
      document.querySelectorAll("#mainTabs button").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      const isMenu = btn.dataset.tab === "menu";
      document.getElementById("ordersTab").style.display = isMenu ? "none" : "block";
      document.getElementById("menuTab").style.display = isMenu ? "block" : "none";
      document.getElementById("pageTitle").textContent = isMenu ? "🍔 مينيو وسام سناك" : "🧾 طلبات وسام سناك";
      if (isMenu) startMenuListening();
    };
  });
}

function fmtMoney(n){ return (n||0).toLocaleString("en-US") + " ل.ل"; }
function fmtTime(iso){
  try {
    return new Date(iso).toLocaleString("en-GB", { dateStyle:"short", timeStyle:"short" });
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

// ============================================================
// Menu management (Firestore-backed)
// ============================================================

let liveCategories = [];
let liveItems = [];
let menuListenersStarted = false;

function slugify(text){
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40) || ("cat-" + Date.now());
}

function startMenuListening(){
  if (menuListenersStarted) return;
  if (!window.__firestore){
    window.addEventListener("firebase-ready", startMenuListening, { once:true });
    return;
  }
  menuListenersStarted = true;
  const { db, collection, onSnapshot, query, orderBy } = window.__firestore;

  onSnapshot(query(collection(db, "menu_categories"), orderBy("order", "asc")), (snap)=>{
    liveCategories = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderMenuTab();
  }, (err)=>{
    document.getElementById("menuCategories").innerHTML = `<div class="empty">تعذر تحميل المينيو: ${err.message}</div>`;
  });

  onSnapshot(query(collection(db, "menu_items"), orderBy("order", "asc")), (snap)=>{
    liveItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderMenuTab();
  });
}

function renderMenuTab(){
  const seedBox = document.getElementById("menuSeedBox");
  const catsWrap = document.getElementById("menuCategories");

  if (liveCategories.length === 0){
    seedBox.innerHTML = `
      <div class="seed-box">
        <div style="font-size:1.8rem;">📋</div>
        <p style="margin:8px 0;">ما في مينيو محفوظ بقاعدة البيانات بعد.</p>
        <button class="primary-wide" id="seedMenuBtn" style="width:auto; padding:11px 24px;">استيراد المينيو الحالي (مرة واحدة)</button>
      </div>`;
    document.getElementById("seedMenuBtn").onclick = seedMenuFromDefaults;
    catsWrap.innerHTML = "";
    return;
  }
  seedBox.innerHTML = "";

  catsWrap.innerHTML = "";
  liveCategories.forEach(cat=>{
    const items = liveItems.filter(i => i.categoryId === cat.id).sort((a,b)=>(a.order||0)-(b.order||0));
    const card = document.createElement("div");
    card.className = "cat-card";
    card.innerHTML = `
      <div class="cat-head">
        <span class="cat-name">${cat.icon || "🍽️"} ${cat.nameAr} <span style="color:#a8977a; font-weight:600; font-size:0.8rem;">/ ${cat.nameEn}</span></span>
        <div class="cat-actions">
          <button class="icon-btn" data-act="rename-cat">✏️ تعديل الاسم</button>
          <button class="icon-btn" data-act="add-item">+ صنف</button>
          <button class="icon-btn danger" data-act="delete-cat">🗑 حذف الفئة</button>
        </div>
      </div>
      <div class="items-host"></div>
    `;
    const itemsHost = card.querySelector(".items-host");
    items.forEach(item => itemsHost.appendChild(renderItemRow(item)));

    card.querySelector('[data-act="rename-cat"]').onclick = () => renameCategory(cat);
    card.querySelector('[data-act="delete-cat"]').onclick = () => deleteCategory(cat, items.length);
    card.querySelector('[data-act="add-item"]').onclick = () => itemsHost.appendChild(renderItemRow(null, cat.id));

    catsWrap.appendChild(card);
  });
}

function renderItemRow(item, newForCategoryId){
  const isNew = !item;
  const row = document.createElement("div");
  row.className = "item-row";
  row.innerHTML = `
    <input type="text" class="f-name" placeholder="الاسم بالعربي" value="${item ? (item.nameAr||"") : ""}" data-f="nameAr">
    <input type="text" class="f-name" placeholder="Name in English" value="${item ? (item.nameEn||"") : ""}" data-f="nameEn">
    <input type="number" class="f-price" placeholder="السعر" value="${item && item.price != null ? item.price : ""}" data-f="price">
    <select class="f-tag" data-f="tag">
      <option value="">بدون شارة</option>
      <option value="popular" ${item && item.tag === "popular" ? "selected" : ""}>⭐ الأكثر طلباً</option>
      <option value="zinger" ${item && item.tag === "zinger" ? "selected" : ""}>🔥 Zinger</option>
    </select>
    <label class="avail"><input type="checkbox" data-f="available" ${!item || item.available !== false ? "checked" : ""}> متوفر</label>
    <div class="row-actions">
      <button class="icon-btn" data-act="save">💾 حفظ</button>
      ${isNew ? "" : `<button class="icon-btn danger" data-act="delete">🗑</button>`}
    </div>
  `;
  row.querySelector('[data-act="save"]').onclick = () => saveItemRow(row, item, newForCategoryId);
  if (!isNew){
    row.querySelector('[data-act="delete"]').onclick = () => deleteItem(item);
  }
  return row;
}

async function saveItemRow(row, existingItem, newForCategoryId){
  const { db, doc, setDoc, addDoc, collection } = window.__firestore;
  const nameAr = row.querySelector('[data-f="nameAr"]').value.trim();
  const nameEn = row.querySelector('[data-f="nameEn"]').value.trim();
  const priceRaw = row.querySelector('[data-f="price"]').value;
  const tag = row.querySelector('[data-f="tag"]').value || null;
  const available = row.querySelector('[data-f="available"]').checked;
  const price = priceRaw === "" ? null : Number(priceRaw);

  if (!nameAr || !nameEn){
    alert("لازم تعبّي الاسم بالعربي والإنجليزي");
    return;
  }

  try {
    if (existingItem){
      await setDoc(doc(db, "menu_items", existingItem.id), {
        ...existingItem, nameAr, nameEn, price, tag, available
      });
    } else {
      const order = liveItems.filter(i=>i.categoryId===newForCategoryId).length;
      await addDoc(collection(db, "menu_items"), {
        categoryId: newForCategoryId, nameAr, nameEn, price, tag, available, order
      });
    }
  } catch (e) {
    alert("تعذر الحفظ: " + e.message);
  }
}

async function deleteItem(item){
  if (!confirm(`حذف "${item.nameAr}" نهائياً؟`)) return;
  const { db, doc, deleteDoc } = window.__firestore;
  try { await deleteDoc(doc(db, "menu_items", item.id)); }
  catch (e) { alert("تعذر الحذف: " + e.message); }
}

async function renameCategory(cat){
  const nameAr = prompt("الاسم بالعربي:", cat.nameAr);
  if (nameAr === null) return;
  const nameEn = prompt("الاسم بالإنجليزي:", cat.nameEn);
  if (nameEn === null) return;
  const { db, doc, setDoc } = window.__firestore;
  try { await setDoc(doc(db, "menu_categories", cat.id), { ...cat, nameAr, nameEn }); }
  catch (e) { alert("تعذر الحفظ: " + e.message); }
}

async function deleteCategory(cat, itemCount){
  if (itemCount > 0){
    alert("ما فيك تحذف فئة فيها أصناف — احذف الأصناف الأول.");
    return;
  }
  if (!confirm(`حذف فئة "${cat.nameAr}"؟`)) return;
  const { db, doc, deleteDoc } = window.__firestore;
  try { await deleteDoc(doc(db, "menu_categories", cat.id)); }
  catch (e) { alert("تعذر الحذف: " + e.message); }
}

async function addNewCategory(){
  const nameAr = document.getElementById("newCatAr").value.trim();
  const nameEn = document.getElementById("newCatEn").value.trim();
  const icon = document.getElementById("newCatIcon").value.trim() || "🍽️";
  if (!nameAr || !nameEn){
    alert("لازم تعبّي الاسم بالعربي والإنجليزي");
    return;
  }
  const id = slugify(nameEn);
  const { db, doc, setDoc } = window.__firestore;
  try {
    await setDoc(doc(db, "menu_categories", id), { nameAr, nameEn, icon, order: liveCategories.length });
    document.getElementById("newCatAr").value = "";
    document.getElementById("newCatEn").value = "";
    document.getElementById("newCatIcon").value = "";
  } catch (e) {
    alert("تعذر الحفظ: " + e.message);
  }
}

async function seedMenuFromDefaults(){
  if (typeof MENU_CATEGORIES === "undefined"){
    alert("ملف menu-data.js غير محمّل");
    return;
  }
  const { db, writeBatch, doc } = window.__firestore;
  const batch = writeBatch(db);
  MENU_CATEGORIES.forEach((cat, catIndex)=>{
    batch.set(doc(db, "menu_categories", cat.id), {
      nameAr: cat.name.ar, nameEn: cat.name.en, icon: cat.icon, order: catIndex
    });
    cat.items.forEach((item, itemIndex)=>{
      batch.set(doc(db, "menu_items", item.id), {
        categoryId: cat.id, nameAr: item.name.ar, nameEn: item.name.en,
        price: item.price, tag: item.tag || null, available: item.price !== null, order: itemIndex
      });
    });
  });
  try {
    await batch.commit();
  } catch (e) {
    alert("تعذر الاستيراد: " + e.message);
  }
}

document.addEventListener("DOMContentLoaded", ()=>{
  document.getElementById("loginBtn").onclick = tryLogin;
  document.getElementById("pinInput").addEventListener("keydown", e=>{ if (e.key === "Enter") tryLogin(); });
  document.getElementById("addCatBtn").onclick = addNewCategory;
  if (sessionStorage.getItem("ws_admin_ok") === "1") showDashboard();
});
