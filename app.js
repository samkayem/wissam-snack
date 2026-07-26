// Wissam Snack — App Logic

const STR = {
  ar: {
    dir: "rtl",
    switchLabel: "EN",
    heroTitle1: "طعم", heroTitleSpan: "يحلي", heroTitle2: "جمعتك",
    heroSub: "اطلب أونلاين من وسام سناك — ساندويشات، برغر، شاورما وأكتر",
    delivery: "توصيل لكل مناطق صيدا",
    addToCart: "أضف للسلة",
    unavailable: "غير متوفر حالياً",
    yourCart: "سلتك",
    cartEmpty: "السلة فاضية، ضيف شي طيب من المنيو 😋",
    subtotal: "المجموع الفرعي",
    total: "المجموع الكلي",
    checkout: "إتمام الطلب",
    continueShopping: "أكمل التسوق",
    remove: "حذف",
    checkoutTitle: "بيانات الطلب",
    nameLabel: "الاسم الكامل",
    namePh: "مثال: أحمد سعيد",
    phoneLabel: "رقم الموبايل",
    phonePh: "03 123 456",
    addressLabel: "عنوان التوصيل",
    addressPh: "المنطقة، الشارع، أقرب معلم...",
    noteLabel: "ملاحظات (اختياري)",
    notePh: "أي تفاصيل إضافية عن الطلب...",
    payMethod: "طريقة الدفع",
    cod: "الدفع نقداً عند التوصيل",
    codDesc: "ادفع كاش للديلفري عند وصول الطلب",
    whish: "الدفع عبر Whish Money",
    whishDesc: "حوّل المبلغ عبر تطبيق Whish ثم أكّد التحويل",
    whishInstructions: "حوّل المبلغ التالي إلى رقم Whish Money:",
    whishAmount: "المبلغ المطلوب",
    openWhish: "نسخ الرقم وفتح Whish",
    copyNumber: "نسخ الرقم",
    whishRefLabel: "رقم مرجعي / آخر 4 أرقام من التحويل",
    whishRefPh: "لتسهيل تأكيد الدفع من طرفنا",
    placeOrder: "تأكيد الطلب عبر واتساب",
    fieldRequired: "هذا الحقل مطلوب",
    phoneInvalid: "الرجاء إدخال رقم موبايل صحيح",
    orderConfirmedTitle: "تم إرسال طلبك!",
    orderConfirmedDesc: "بيفتحلك واتساب لتأكيد الطلب مباشرة مع وسام سناك",
    orderRef: "رقم الطلب",
    backToMenu: "الرجوع للمنيو",
    copied: "تم النسخ ✓",
    itemAdded: "تمت الإضافة للسلة",
    lbp: "ل.ل"
  },
  en: {
    dir: "ltr",
    switchLabel: "AR",
    heroTitle1: "Taste", heroTitleSpan: "that", heroTitle2: "makes your day",
    heroSub: "Order online from Wissam Snack — sandwiches, burgers, shawarma & more",
    delivery: "Delivery to all areas of Sidon",
    addToCart: "Add to cart",
    unavailable: "Currently unavailable",
    yourCart: "Your Cart",
    cartEmpty: "Your cart is empty — grab something tasty from the menu 😋",
    subtotal: "Subtotal",
    total: "Total",
    checkout: "Checkout",
    continueShopping: "Continue shopping",
    remove: "Remove",
    checkoutTitle: "Order Details",
    nameLabel: "Full Name",
    namePh: "e.g. Ahmad Saeed",
    phoneLabel: "Mobile Number",
    phonePh: "03 123 456",
    addressLabel: "Delivery Address",
    addressPh: "Area, street, nearest landmark...",
    noteLabel: "Notes (optional)",
    notePh: "Any extra details about your order...",
    payMethod: "Payment Method",
    cod: "Cash on Delivery",
    codDesc: "Pay cash to the delivery rider on arrival",
    whish: "Pay via Whish Money",
    whishDesc: "Transfer via the Whish app, then confirm your transfer",
    whishInstructions: "Transfer the following amount to this Whish Money number:",
    whishAmount: "Amount due",
    openWhish: "Copy number & open Whish",
    copyNumber: "Copy number",
    whishRefLabel: "Reference / last 4 digits of transfer",
    whishRefPh: "Helps us confirm your payment faster",
    placeOrder: "Confirm order via WhatsApp",
    fieldRequired: "This field is required",
    phoneInvalid: "Please enter a valid mobile number",
    orderConfirmedTitle: "Order sent!",
    orderConfirmedDesc: "WhatsApp will open so you can confirm your order directly with Wissam Snack",
    orderRef: "Order ref",
    backToMenu: "Back to menu",
    copied: "Copied ✓",
    itemAdded: "Added to cart",
    lbp: "LBP"
  }
};

let lang = localStorage.getItem("ws_lang") || "ar";
let cart = JSON.parse(localStorage.getItem("ws_cart") || "{}"); // {itemId: qty}
let selectedPayment = "cod";
let activeMenu = MENU_CATEGORIES; // static fallback; replaced live once Firestore data arrives
let activeCategory = MENU_CATEGORIES[0].id;

function t(key){ return STR[lang][key]; }

function findItem(id){
  for (const cat of activeMenu){
    const it = cat.items.find(i => i.id === id);
    if (it) return it;
  }
  return null;
}

function fmtPrice(n){
  if (n === null || n === undefined) return t("unavailable");
  return n.toLocaleString("en-US") + " " + t("lbp");
}

function saveCart(){ localStorage.setItem("ws_cart", JSON.stringify(cart)); }

function cartCount(){ return Object.values(cart).reduce((a,b)=>a+b,0); }
function cartTotal(){
  return Object.entries(cart).reduce((sum,[id,qty])=>{
    const it = findItem(id);
    return sum + (it && it.price ? it.price * qty : 0);
  }, 0);
}

/* ---------------- Rendering ---------------- */

function applyLanguage(){
  document.documentElement.lang = lang;
  document.documentElement.dir = t("dir");
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el=>{
    el.placeholder = t(el.getAttribute("data-i18n-ph"));
  });
  document.getElementById("langSwitch").textContent = t("switchLabel");
  renderTabs();
  renderMenu();
  renderCart();
}

function renderTabs(){
  const tabs = document.getElementById("tabs");
  tabs.innerHTML = "";
  activeMenu.forEach(cat=>{
    btn.className = "tab" + (cat.id === activeCategory ? " active" : "");
    btn.textContent = `${cat.icon} ${cat.name[lang]}`;
    btn.onclick = () => {
      activeCategory = cat.id;
      document.getElementById(`cat-${cat.id}`).scrollIntoView({behavior:"smooth", block:"start"});
      renderTabs();
    };
    tabs.appendChild(btn);
  });
}

function renderMenu(){
  const wrap = document.getElementById("menuSections");
  wrap.innerHTML = "";
  activeMenu.forEach(cat=>{
    const section = document.createElement("section");
    section.className = "category-section";
    section.id = `cat-${cat.id}`;
    section.innerHTML = `<div class="category-title">${cat.icon} ${cat.name[lang]}</div>`;
    const grid = document.createElement("div");
    grid.className = "grid";
    cat.items.forEach(item=>{
      grid.appendChild(renderItemCard(item));
    });
    section.appendChild(grid);
    wrap.appendChild(section);
  });
}

function renderItemCard(item){
  const card = document.createElement("div");
  card.className = "item-card";
  const tagHtml = item.tag ? `<div class="tag ${item.tag}">${item.tag === "zinger" ? "🔥 ZINGER" : "⭐ " + (lang==="ar"?"الأكثر طلباً":"Popular")}</div>` : "";
  const qty = cart[item.id] || 0;
  const priceHtml = item.price === null
    ? `<div class="item-unavailable">${t("unavailable")}</div>`
    : `<div class="item-price">${fmtPrice(item.price)}</div>`;

  card.innerHTML = `
    ${tagHtml}
    <div class="item-name">${item.name[lang]}</div>
    ${priceHtml}
    <div class="control-slot"></div>
  `;
  const slot = card.querySelector(".control-slot");
  renderItemControl(slot, item, qty);
  return card;
}

function renderItemControl(slot, item, qty){
  if (item.price === null){
    slot.innerHTML = "";
    return;
  }
  if (qty > 0){
    slot.innerHTML = `
      <div class="qty-row">
        <button data-action="dec">−</button>
        <span>${qty}</span>
        <button data-action="inc">+</button>
      </div>`;
    slot.querySelector('[data-action="dec"]').onclick = () => changeQty(item.id, -1);
    slot.querySelector('[data-action="inc"]').onclick = () => changeQty(item.id, 1);
  } else {
    slot.innerHTML = `<button class="add-btn">+ ${t("addToCart")}</button>`;
    slot.querySelector(".add-btn").onclick = () => { changeQty(item.id, 1); showToast(t("itemAdded")); };
  }
}

function changeQty(id, delta){
  const current = cart[id] || 0;
  const next = Math.max(0, current + delta);
  if (next === 0) delete cart[id];
  else cart[id] = next;
  saveCart();
  renderMenu();
  renderCart();
}

/* ---------------- Cart Drawer ---------------- */

function renderCart(){
  const count = cartCount();
  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartCount").style.display = count > 0 ? "flex" : "none";

  const sticky = document.getElementById("stickyCart");
  if (count > 0){
    sticky.classList.add("show");
    document.getElementById("stickyCount").textContent = count;
    document.getElementById("stickyTotal").textContent = fmtPrice(cartTotal());
  } else {
    sticky.classList.remove("show");
  }

  const body = document.getElementById("drawerBody");
  const entries = Object.entries(cart);
  if (entries.length === 0){
    body.innerHTML = `<div class="empty-state">${t("cartEmpty")}</div>`;
  } else {
    body.innerHTML = "";
    entries.forEach(([id, qty])=>{
      const item = findItem(id);
      if (!item) return;
      const line = document.createElement("div");
      line.className = "cart-line";
      line.innerHTML = `
        <div class="cart-line-info">
          <div class="cart-line-name">${item.name[lang]}</div>
          <div class="cart-line-price">${fmtPrice(item.price)}</div>
          <div class="remove-line">${t("remove")}</div>
        </div>
        <div class="qty-row">
          <button data-action="dec">−</button>
          <span>${qty}</span>
          <button data-action="inc">+</button>
        </div>
      `;
      line.querySelector(".remove-line").onclick = () => { delete cart[id]; saveCart(); renderMenu(); renderCart(); };
      line.querySelector('[data-action="dec"]').onclick = () => changeQty(id, -1);
      line.querySelector('[data-action="inc"]').onclick = () => changeQty(id, 1);
      body.appendChild(line);
    });
  }

  document.getElementById("drawerTotal").textContent = fmtPrice(cartTotal());
  document.getElementById("checkoutBtn").disabled = entries.length === 0;

  const whishAmountEl = document.getElementById("whishAmountDisplay");
  if (whishAmountEl) whishAmountEl.textContent = fmtPrice(cartTotal());
}

function openDrawer(){
  document.getElementById("overlay").classList.add("open");
  document.getElementById("cartDrawer").classList.add("open");
}
function closeDrawer(){
  document.getElementById("overlay").classList.remove("open");
  document.getElementById("cartDrawer").classList.remove("open");
}

/* ---------------- Checkout Modal ---------------- */

function openCheckout(){
  closeDrawer();
  document.getElementById("checkoutModal").classList.add("open");
}
function closeCheckout(){
  document.getElementById("checkoutModal").classList.remove("open");
}

function selectPayment(method){
  selectedPayment = method;
  document.querySelectorAll(".pay-option").forEach(el=>{
    el.classList.toggle("selected", el.dataset.method === method);
    el.querySelector("input").checked = el.dataset.method === method;
  });
  document.getElementById("whishBox").classList.toggle("show", method === "whish");
}

function validateField(input){
  const field = input.closest(".field");
  const valid = input.value.trim().length > 0;
  field.classList.toggle("has-error", !valid);
  return valid;
}

function validateCheckoutForm(){
  const name = document.getElementById("custName");
  const phone = document.getElementById("custPhone");
  const address = document.getElementById("custAddress");
  let ok = true;
  if (!validateField(name)) ok = false;
  if (!validateField(phone)) ok = false;
  else {
    const digits = phone.value.replace(/[^0-9]/g,"");
    if (digits.length < 7){
      phone.closest(".field").classList.add("has-error");
      phone.closest(".field").querySelector(".field-error").textContent = t("phoneInvalid");
      ok = false;
    }
  }
  if (!validateField(address)) ok = false;
  return ok;
}

function buildOrderSummaryText(order){
  const lines = order.items.map(i => `• ${i.name} x${i.qty} — ${fmtPrice(i.price*i.qty)}`).join("\n");
  const payLabel = order.payment === "whish" ? "Whish Money" : (lang === "ar" ? "نقداً عند التوصيل" : "Cash on Delivery");
  if (lang === "ar"){
    return `طلب جديد من وسام سناك 🧾\n` +
      `رقم الطلب: ${order.ref}\n\n` +
      `الاسم: ${order.name}\n` +
      `الموبايل: ${order.phone}\n` +
      `العنوان: ${order.address}\n` +
      (order.note ? `ملاحظات: ${order.note}\n` : "") +
      `\nالطلبية:\n${lines}\n\n` +
      `المجموع الكلي: ${fmtPrice(order.total)}\n` +
      `طريقة الدفع: ${payLabel}` +
      (order.payment === "whish" && order.whishRef ? `\nمرجع التحويل: ${order.whishRef}` : "");
  }
  return `New order from Wissam Snack 🧾\n` +
    `Order ref: ${order.ref}\n\n` +
    `Name: ${order.name}\n` +
    `Mobile: ${order.phone}\n` +
    `Address: ${order.address}\n` +
    (order.note ? `Notes: ${order.note}\n` : "") +
    `\nItems:\n${lines}\n\n` +
    `Total: ${fmtPrice(order.total)}\n` +
    `Payment: ${payLabel}` +
    (order.payment === "whish" && order.whishRef ? `\nTransfer ref: ${order.whishRef}` : "");
}

function genOrderRef(){
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${String(d.getHours()).padStart(2,"0")}${String(d.getMinutes()).padStart(2,"0")}${String(d.getSeconds()).padStart(2,"0")}`;
  return `WS-${stamp}`;
}

async function submitOrder(){
  if (!validateCheckoutForm()) return;

  const items = Object.entries(cart).map(([id, qty])=>{
    const it = findItem(id);
    return { id, name: it.name[lang], nameAr: it.name.ar, nameEn: it.name.en, price: it.price, qty };
  });

  const order = {
    ref: genOrderRef(),
    name: document.getElementById("custName").value.trim(),
    phone: document.getElementById("custPhone").value.trim(),
    address: document.getElementById("custAddress").value.trim(),
    note: document.getElementById("custNote").value.trim(),
    items,
    total: cartTotal(),
    payment: selectedPayment,
    whishRef: selectedPayment === "whish" ? document.getElementById("whishRef").value.trim() : "",
    lang,
    createdAt: new Date().toISOString(),
    status: "new"
  };

  // Try to save to Firestore if configured (see firebase-config.js). Never blocks the order.
  try {
    if (window.saveOrderToFirestore) await window.saveOrderToFirestore(order);
  } catch (e) {
    console.warn("Could not save order to Firestore:", e);
  }

  const text = buildOrderSummaryText(order);
  const waLink = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(text)}`;

  // Show confirmation, clear cart, then open WhatsApp
  document.getElementById("orderRefText").textContent = `${t("orderRef")}: ${order.ref}`;
  closeCheckout();
  document.getElementById("confirmModal").classList.add("open");
  document.getElementById("waLinkBtn").href = waLink;

  cart = {};
  saveCart();
  renderMenu();
  renderCart();

  // Auto-open WhatsApp shortly after showing confirmation
  setTimeout(()=>{ window.open(waLink, "_blank"); }, 600);
}

function closeConfirm(){
  document.getElementById("confirmModal").classList.remove("open");
  document.getElementById("checkoutForm").reset();
  selectPayment("cod");
}

/* ---------------- Whish helpers ---------------- */

function copyWhishNumber(){
  navigator.clipboard.writeText(BUSINESS_INFO.whishNumber.replace(/\s/g,"")).then(()=>{
    showToast(t("copied"));
  });
}

function openWhishApp(){
  // No documented public deep link exists for Whish, and attempting a fake
  // scheme (whish://...) triggers an ugly OS-level "invalid address" error
  // on iOS/Safari. Safer approach: just guide the customer to open the app
  // themselves and use the number/amount shown above.
  copyWhishNumber();
  showToast(lang === "ar"
    ? "افتح تطبيق Whish من هاتفك وحوّل للرقم المنسوخ 📋"
    : "Open the Whish app on your phone and transfer to the copied number 📋");
}

/* ---------------- Toast ---------------- */

let toastTimer;
function showToast(msg){
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> el.classList.remove("show"), 2000);
}

let liveMenuCats = null;
let liveMenuItems = null;

function buildMenuFromLive(){
  if (!liveMenuCats || !liveMenuItems) return null;
  return liveMenuCats
    .sort((a,b)=>(a.order||0)-(b.order||0))
    .map(cat => ({
      id: cat.id,
      icon: cat.icon || "🍽️",
      name: { ar: cat.nameAr, en: cat.nameEn },
      items: liveMenuItems
        .filter(i => i.categoryId === cat.id)
        .sort((a,b)=>(a.order||0)-(b.order||0))
        .map(i => ({
          id: i.id,
          name: { ar: i.nameAr, en: i.nameEn },
          price: i.available === false ? null : (i.price ?? null),
          tag: i.tag || null
        }))
    }))
    .filter(cat => cat.items.length > 0);
}

function applyLiveMenuIfReady(){
  const built = buildMenuFromLive();
  if (!built || built.length === 0) return; // keep static fallback until live data exists
  activeMenu = built;
  if (!activeMenu.some(c => c.id === activeCategory)) activeCategory = activeMenu[0].id;
  renderTabs();
  renderMenu();
  renderCart();
}

function loadLiveMenu(){
  if (!window.__firestore){
    window.addEventListener("firebase-ready", loadLiveMenu, { once:true });
    return;
  }
  const { db, collection, onSnapshot, query, orderBy } = window.__firestore;
  onSnapshot(query(collection(db, "menu_categories"), orderBy("order","asc")), (snap)=>{
    liveMenuCats = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    applyLiveMenuIfReady();
  }, ()=>{ /* keep static fallback on error */ });

  onSnapshot(query(collection(db, "menu_items"), orderBy("order","asc")), (snap)=>{
    liveMenuItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    applyLiveMenuIfReady();
  }, ()=>{});
}

/* ---------------- Init ---------------- */

function toggleLang(){
  lang = lang === "ar" ? "en" : "ar";
  localStorage.setItem("ws_lang", lang);
  applyLanguage();
}

function init(){
  document.getElementById("langSwitch").onclick = toggleLang;
  document.getElementById("cartBtn").onclick = openDrawer;
  document.getElementById("closeDrawerBtn").onclick = closeDrawer;
  document.getElementById("overlay").onclick = closeDrawer;
  document.getElementById("checkoutBtn").onclick = openCheckout;
  document.getElementById("stickyCart").onclick = openDrawer;
  document.getElementById("closeCheckoutBtn").onclick = closeCheckout;
  document.getElementById("checkoutForm").addEventListener("submit", (e)=>{ e.preventDefault(); submitOrder(); });
  document.getElementById("closeConfirmBtn").onclick = closeConfirm;
  document.getElementById("openWhishBtn").onclick = openWhishApp;

  document.querySelectorAll(".pay-option").forEach(el=>{
    el.onclick = () => selectPayment(el.dataset.method);
  });

  document.getElementById("custPhone").addEventListener("input", function(){
    this.closest(".field").querySelector(".field-error").textContent = t("fieldRequired");
  });

  applyLanguage();
  selectPayment("cod");
  loadLiveMenu();

  if ("serviceWorker" in navigator){
    navigator.serviceWorker.register("service-worker.js").catch(()=>{});
  }
}

document.addEventListener("DOMContentLoaded", init);
