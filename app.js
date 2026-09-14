// Wissam Snack — App Logic

const STR = {
  ar: {
    dir: "rtl",
    switchLabel: "EN",
    heroTitle1: "طعم", heroTitleSpan: "يحلي", heroTitle2: "جمعتك",
    heroSub: "اطلب أونلاين من وسام سناك — ساندويشات، برغر، شاورما وأكتر",
    delivery: "توصيل لكل مناطق صيدا",
    addToCart: "أضف للسلة",
    customize: "تخصيص",
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
    placeOrder: "تأكيد الطلب عبر واتساب",
    fieldRequired: "هذا الحقل مطلوب",
    phoneInvalid: "الرجاء إدخال رقم موبايل صحيح",
    orderConfirmedTitle: "تم إرسال طلبك!",
    orderConfirmedDesc: "بيفتحلك واتساب لتأكيد الطلب مباشرة مع وسام سناك",
    orderRef: "رقم الطلب",
    backToMenu: "الرجوع للمنيو",
    copied: "تم النسخ ✓",
    itemAdded: "تمت الإضافة للسلة",
    lbp: "ل.ل",
    czBread: "🍞 نوع الخبز",
    czToast: "🔥 التحميص",
    czVeggies: "🥬 الخضار والإضافات",
    czSauces: "🌶️ الصلصات",
    czExtras: "➕ إضافات مدفوعة (اختياري)",
    czNormal: "عادي",
    czExtra: "إكسترا",
    czOnSide: "على جنب",
    czWithout: "بدون"
  },
  en: {
    dir: "ltr",
    switchLabel: "AR",
    heroTitle1: "Taste", heroTitleSpan: "that", heroTitle2: "makes your day",
    heroSub: "Order online from Wissam Snack — sandwiches, burgers, shawarma & more",
    delivery: "Delivery to all areas of Sidon",
    addToCart: "Add to cart",
    customize: "Customize",
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
    placeOrder: "Confirm order via WhatsApp",
    fieldRequired: "This field is required",
    phoneInvalid: "Please enter a valid mobile number",
    orderConfirmedTitle: "Order sent!",
    orderConfirmedDesc: "WhatsApp will open so you can confirm your order directly with Wissam Snack",
    orderRef: "Order ref",
    backToMenu: "Back to menu",
    copied: "Copied ✓",
    itemAdded: "Added to cart",
    lbp: "LBP",
    czBread: "🍞 Bread type",
    czToast: "🔥 Toasting",
    czVeggies: "🥬 Veggies & toppings",
    czSauces: "🌶️ Sauces",
    czExtras: "➕ Paid extras (optional)",
    czNormal: "Normal",
    czExtra: "Extra",
    czOnSide: "On the side",
    czWithout: "Without"
  }
};

let lang = localStorage.getItem("ws_lang") || "ar";
let cart = JSON.parse(localStorage.getItem("ws_cart") || "[]"); // array of cart lines
let activeMenu = MENU_CATEGORIES; // static fallback; replaced live once Firestore data arrives
let activeCategory = MENU_CATEGORIES[0].id;
let activeOptions = CUSTOMIZATION_DEFAULTS; // static fallback; replaced live once Firestore data arrives

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

function cartCount(){ return cart.reduce((sum, line) => sum + line.qty, 0); }
function cartTotal(){ return cart.reduce((sum, line) => sum + line.unitPrice * line.qty, 0); }

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
    const btn = document.createElement("button");
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
  if (item.price !== null){
    const btn = document.createElement("button");
    btn.className = "add-btn";
    btn.textContent = `🥪 ${t("customize")}`;
    btn.onclick = () => openCustomizer(item);
    slot.appendChild(btn);
  }
  return card;
}

/* ---------------- Item Customizer ---------------- */

let czItem = null;
let czQty = 1;
let czState = { bread: null, toast: null, veggies: {}, sauces: {}, extras: {} };

function openCustomizer(item){
  czItem = item;
  czQty = 1;
  const opts = activeOptions;
  czState = {
    bread: opts.breadOptions && opts.breadOptions[0] ? opts.breadOptions[0].id : null,
    toast: opts.toastOptions && opts.toastOptions[0] ? opts.toastOptions[0].id : null,
    veggies: {}, sauces: {}, extras: {}
  };
  (opts.veggieOptions || []).forEach(v => { czState.veggies[v.id] = true; });
  (opts.sauceOptions || []).forEach(s => { czState.sauces[s.id] = { on: false, level: "normal" }; });
  (opts.extraOptions || []).forEach(e => { czState.extras[e.id] = false; });

  document.getElementById("customizeTitle").textContent = `🥪 ${item.name[lang]}`;
  renderCustomizeBody();
  updateCustomizeFooter();
  document.getElementById("customizeModal").classList.add("open");
}

function closeCustomizer(){
  document.getElementById("customizeModal").classList.remove("open");
}

function renderCustomizeBody(){
  const opts = activeOptions;
  const body = document.getElementById("customizeBody");
  let html = "";

  if (opts.breadOptions && opts.breadOptions.length){
    html += `<div class="cz-group"><div class="cz-group-title">${t("czBread")}</div><div class="cz-options" id="czBreadOptions"></div></div>`;
  }
  if (opts.toastOptions && opts.toastOptions.length){
    html += `<div class="cz-group"><div class="cz-group-title">${t("czToast")}</div><div class="cz-options" id="czToastOptions"></div></div>`;
  }
  if (opts.veggieOptions && opts.veggieOptions.length){
    html += `<div class="cz-group"><div class="cz-group-title">${t("czVeggies")}</div><div class="cz-options" id="czVeggieOptions"></div></div>`;
  }
  if (opts.sauceOptions && opts.sauceOptions.length){
    html += `<div class="cz-group"><div class="cz-group-title">${t("czSauces")}</div><div class="cz-options" id="czSauceOptions"></div></div>`;
  }
  if (opts.extraOptions && opts.extraOptions.length){
    html += `<div class="cz-group"><div class="cz-group-title">${t("czExtras")}</div><div class="cz-options" id="czExtraOptions"></div></div>`;
  }
  body.innerHTML = html;

  // Bread (radio)
  if (opts.breadOptions){
    const host = document.getElementById("czBreadOptions");
    opts.breadOptions.forEach(b=>{
      const row = document.createElement("label");
      row.className = "cz-radio" + (czState.bread === b.id ? " selected" : "");
      row.innerHTML = `<input type="radio" name="czBread" ${czState.bread===b.id?"checked":""}> <span class="cz-radio-label">${b.name ? b.name[lang] : (lang==='ar'?b.nameAr:b.nameEn)}</span>`;
      row.querySelector("input").onchange = () => { czState.bread = b.id; renderCustomizeBody(); updateCustomizeFooter(); };
      host.appendChild(row);
    });
  }
  // Toast (radio)
  if (opts.toastOptions){
    const host = document.getElementById("czToastOptions");
    opts.toastOptions.forEach(o=>{
      const row = document.createElement("label");
      row.className = "cz-radio" + (czState.toast === o.id ? " selected" : "");
      row.innerHTML = `<input type="radio" name="czToast" ${czState.toast===o.id?"checked":""}> <span class="cz-radio-label">${lang==='ar'?o.nameAr:o.nameEn}</span>`;
      row.querySelector("input").onchange = () => { czState.toast = o.id; renderCustomizeBody(); updateCustomizeFooter(); };
      host.appendChild(row);
    });
  }
  // Veggies (checkbox, default checked)
  if (opts.veggieOptions){
    const host = document.getElementById("czVeggieOptions");
    opts.veggieOptions.forEach(v=>{
      const checked = czState.veggies[v.id];
      const row = document.createElement("label");
      row.className = "cz-check" + (checked ? " selected" : "");
      row.innerHTML = `<input type="checkbox" ${checked?"checked":""}> <span class="cz-check-label">${lang==='ar'?v.nameAr:v.nameEn}</span>`;
      row.querySelector("input").onchange = (e) => { czState.veggies[v.id] = e.target.checked; renderCustomizeBody(); updateCustomizeFooter(); };
      host.appendChild(row);
    });
  }
  // Sauces (checkbox + level)
  if (opts.sauceOptions){
    const host = document.getElementById("czSauceOptions");
    opts.sauceOptions.forEach(s=>{
      const state = czState.sauces[s.id] || { on:false, level:"normal" };
      const row = document.createElement("div");
      row.className = "cz-sauce-row";
      row.innerHTML = `
        <label class="cz-sauce-top">
          <input type="checkbox" ${state.on?"checked":""}>
          <span class="cz-sauce-name">${lang==='ar'?s.nameAr:s.nameEn}</span>
        </label>
        ${state.on ? `
        <div class="cz-sauce-levels">
          <button type="button" class="cz-level-btn ${state.level==='normal'?'active':''}" data-level="normal">${t("czNormal")}</button>
          <button type="button" class="cz-level-btn ${state.level==='extra'?'active':''}" data-level="extra">${t("czExtra")}</button>
          <button type="button" class="cz-level-btn ${state.level==='onSide'?'active':''}" data-level="onSide">${t("czOnSide")}</button>
        </div>` : ""}
      `;
      row.querySelector('input[type="checkbox"]').onchange = (e) => {
        czState.sauces[s.id] = { on: e.target.checked, level: state.level || "normal" };
        renderCustomizeBody(); updateCustomizeFooter();
      };
      row.querySelectorAll(".cz-level-btn").forEach(btn=>{
        btn.onclick = () => { czState.sauces[s.id] = { on:true, level: btn.dataset.level }; renderCustomizeBody(); updateCustomizeFooter(); };
      });
      host.appendChild(row);
    });
  }
  // Extras (checkbox with price)
  if (opts.extraOptions){
    const host = document.getElementById("czExtraOptions");
    opts.extraOptions.forEach(x=>{
      const checked = czState.extras[x.id];
      const row = document.createElement("label");
      row.className = "cz-check" + (checked ? " selected" : "");
      row.innerHTML = `<input type="checkbox" ${checked?"checked":""}> <span class="cz-check-label">${lang==='ar'?x.nameAr:x.nameEn}</span> <span class="cz-check-price">+${fmtPrice(x.price)}</span>`;
      row.querySelector("input").onchange = (e) => { czState.extras[x.id] = e.target.checked; updateCustomizeFooter(); };
      host.appendChild(row);
    });
  }
}

function czUnitPrice(){
  const opts = activeOptions;
  let price = czItem.price;
  (opts.extraOptions || []).forEach(x=>{
    if (czState.extras[x.id]) price += (x.price || 0);
  });
  return price;
}

function czBuildSummary(){
  const opts = activeOptions;
  const parts = { ar: [], en: [] };

  const bread = (opts.breadOptions || []).find(b => b.id === czState.bread);
  if (bread){ parts.ar.push(bread.nameAr); parts.en.push(bread.nameEn); }

  const toast = (opts.toastOptions || []).find(o => o.id === czState.toast);
  if (toast && toast.id !== (opts.toastOptions[0] && opts.toastOptions[0].id)){
    parts.ar.push(toast.nameAr); parts.en.push(toast.nameEn);
  }

  const removedVeggies = (opts.veggieOptions || []).filter(v => czState.veggies[v.id] === false);
  if (removedVeggies.length){
    parts.ar.push(`بدون ${removedVeggies.map(v=>v.nameAr).join("، ")}`);
    parts.en.push(`Without ${removedVeggies.map(v=>v.nameEn).join(", ")}`);
  }

  (opts.sauceOptions || []).forEach(s=>{
    const state = czState.sauces[s.id];
    if (state && state.on){
      if (state.level === "extra"){ parts.ar.push(`${s.nameAr} زيادة`); parts.en.push(`Extra ${s.nameEn}`); }
      else if (state.level === "onSide"){ parts.ar.push(`${s.nameAr} على جنب`); parts.en.push(`${s.nameEn} on the side`); }
      else { parts.ar.push(s.nameAr); parts.en.push(s.nameEn); }
    }
  });

  (opts.extraOptions || []).forEach(x=>{
    if (czState.extras[x.id]){ parts.ar.push(`+${x.nameAr}`); parts.en.push(`+${x.nameEn}`); }
  });

  return {
    ar: parts.ar.length ? ` (${parts.ar.join("، ")})` : "",
    en: parts.en.length ? ` (${parts.en.join(", ")})` : ""
  };
}

function updateCustomizeFooter(){
  document.getElementById("customizeQtyVal").textContent = czQty;
  const unit = czUnitPrice();
  document.getElementById("customizeTotalPrice").textContent = fmtPrice(unit * czQty);
}

function addCustomizedToCart(){
  const unitPrice = czUnitPrice();
  const summary = czBuildSummary();
  const nameAr = czItem.name.ar + summary.ar;
  const nameEn = czItem.name.en + summary.en;

  const signature = JSON.stringify({ id: czItem.id, s: czState });
  const existing = cart.find(l => l.signature === signature);
  if (existing){
    existing.qty += czQty;
  } else {
    cart.push({
      lineId: "l" + Date.now() + Math.random().toString(36).slice(2,7),
      itemId: czItem.id,
      signature,
      qty: czQty,
      unitPrice,
      nameAr, nameEn,
      choices: JSON.parse(JSON.stringify(czState))
    });
  }
  saveCart();
  renderCart();
  closeCustomizer();
  showToast(t("itemAdded"));
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
  if (cart.length === 0){
    body.innerHTML = `<div class="empty-state">${t("cartEmpty")}</div>`;
  } else {
    body.innerHTML = "";
    cart.forEach(line=>{
      const el = document.createElement("div");
      el.className = "cart-line";
      el.innerHTML = `
        <div class="cart-line-info">
          <div class="cart-line-name">${lang==='ar' ? line.nameAr : line.nameEn}</div>
          <div class="cart-line-price">${fmtPrice(line.unitPrice)}</div>
          <div class="remove-line">${t("remove")}</div>
        </div>
        <div class="qty-row">
          <button data-action="dec">−</button>
          <span>${line.qty}</span>
          <button data-action="inc">+</button>
        </div>
      `;
      el.querySelector(".remove-line").onclick = () => { cart = cart.filter(l => l.lineId !== line.lineId); saveCart(); renderCart(); };
      el.querySelector('[data-action="dec"]').onclick = () => changeLineQty(line.lineId, -1);
      el.querySelector('[data-action="inc"]').onclick = () => changeLineQty(line.lineId, 1);
      body.appendChild(el);
    });
  }

  document.getElementById("drawerTotal").textContent = fmtPrice(cartTotal());
  document.getElementById("checkoutBtn").disabled = cart.length === 0;
}

function changeLineQty(lineId, delta){
  const line = cart.find(l => l.lineId === lineId);
  if (!line) return;
  line.qty = Math.max(0, line.qty + delta);
  if (line.qty === 0) cart = cart.filter(l => l.lineId !== lineId);
  saveCart();
  renderCart();
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
  const payLabel = lang === "ar" ? "نقداً عند التوصيل" : "Cash on Delivery";
  if (lang === "ar"){
    return `طلب جديد من وسام سناك 🧾\n` +
      `رقم الطلب: ${order.ref}\n\n` +
      `الاسم: ${order.name}\n` +
      `الموبايل: ${order.phone}\n` +
      `العنوان: ${order.address}\n` +
      (order.note ? `ملاحظات: ${order.note}\n` : "") +
      `\nالطلبية:\n${lines}\n\n` +
      `المجموع الكلي: ${fmtPrice(order.total)}\n` +
      `طريقة الدفع: ${payLabel}`;
  }
  return `New order from Wissam Snack 🧾\n` +
    `Order ref: ${order.ref}\n\n` +
    `Name: ${order.name}\n` +
    `Mobile: ${order.phone}\n` +
    `Address: ${order.address}\n` +
    (order.note ? `Notes: ${order.note}\n` : "") +
    `\nItems:\n${lines}\n\n` +
    `Total: ${fmtPrice(order.total)}\n` +
    `Payment: ${payLabel}`;
}

function genOrderRef(){
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${String(d.getHours()).padStart(2,"0")}${String(d.getMinutes()).padStart(2,"0")}${String(d.getSeconds()).padStart(2,"0")}`;
  return `WS-${stamp}`;
}

async function submitOrder(){
  if (!validateCheckoutForm()) return;

  const items = cart.map(line => ({
    id: line.itemId,
    name: lang === "ar" ? line.nameAr : line.nameEn,
    nameAr: line.nameAr,
    nameEn: line.nameEn,
    price: line.unitPrice,
    qty: line.qty,
    choices: line.choices
  }));

  const order = {
    ref: genOrderRef(),
    name: document.getElementById("custName").value.trim(),
    phone: document.getElementById("custPhone").value.trim(),
    address: document.getElementById("custAddress").value.trim(),
    note: document.getElementById("custNote").value.trim(),
    items,
    total: cartTotal(),
    payment: "cod",
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

  cart = [];
  saveCart();
  renderCart();

  // Auto-open WhatsApp shortly after showing confirmation
  setTimeout(()=>{ window.open(waLink, "_blank"); }, 600);
}

function closeConfirm(){
  document.getElementById("confirmModal").classList.remove("open");
  document.getElementById("checkoutForm").reset();
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

/* ---------------- Live Menu ---------------- */

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

/* ---------------- Live Customization Options ---------------- */

function loadLiveOptions(){
  if (!window.__firestore){
    window.addEventListener("firebase-ready", loadLiveOptions, { once:true });
    return;
  }
  const { db, doc, onSnapshot } = window.__firestore;
  onSnapshot(doc(db, "customization_config", "global"), (snap)=>{
    if (snap.exists()){
      activeOptions = snap.data();
    }
  }, ()=>{ /* keep static fallback on error */ });
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

  document.getElementById("closeCustomizeBtn").onclick = closeCustomizer;
  document.getElementById("customizeAddBtn").onclick = addCustomizedToCart;
  document.getElementById("customizeQtyDec").onclick = () => { if (czQty > 1){ czQty--; updateCustomizeFooter(); } };
  document.getElementById("customizeQtyInc").onclick = () => { czQty++; updateCustomizeFooter(); };

  document.getElementById("custPhone").addEventListener("input", function(){
    this.closest(".field").querySelector(".field-error").textContent = t("fieldRequired");
  });

  applyLanguage();
  loadLiveMenu();
  loadLiveOptions();

  if ("serviceWorker" in navigator){
    navigator.serviceWorker.register("service-worker.js").catch(()=>{});
  }
}

document.addEventListener("DOMContentLoaded", init);
