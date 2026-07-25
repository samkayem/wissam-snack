// Wissam Snack — Menu Data
// Prices are in thousand LBP as printed on the menu (e.g. 350 = 350,000 LBP).
// Edit here to add/remove/change items — the app reads this file directly.

const MENU_CATEGORIES = [
  {
    id: "sandwiches",
    name: { ar: "ساندويشات", en: "Sandwiches" },
    icon: "🌯",
    items: [
      { id: "sw-fahita", name: { ar: "فاهيتا", en: "Fahita" }, price: 350 },
      { id: "sw-pesto", name: { ar: "تشكن بيستو", en: "Chicken Pesto" }, price: 350 },
      { id: "sw-supreme", name: { ar: "تشكن سوبريم", en: "Chicken Supreme" }, price: 350 },
      { id: "sw-twister", name: { ar: "تويستر دجاج", en: "Chicken Twister" }, price: 350 },
      { id: "sw-wissam", name: { ar: "الوسام", en: "Al Wissam Special" }, price: 350 },
      { id: "sw-mexicana", name: { ar: "مكسيكانا", en: "Mexicana" }, price: 350 },
      { id: "sw-chinese", name: { ar: "دجاج صيني", en: "Chinese Chicken" }, price: 300 },
      { id: "sw-sub", name: { ar: "تشكن ساب", en: "Chicken Sub" }, price: 350 },
      { id: "sw-francisco", name: { ar: "فرنسيسكو", en: "Francisco" }, price: 350 },
      { id: "sw-taouk", name: { ar: "طاووق", en: "Taouk" }, price: 250 },
      { id: "sw-taouk-turkey", name: { ar: "طاووق تركي", en: "Turkish Taouk" }, price: 250 },
      { id: "sw-chicken-large", name: { ar: "ساندويش فروج كبير", en: "Large Chicken Sandwich" }, price: 250 },
      { id: "sw-souda", name: { ar: "ساندويش سوده", en: "Souda Sandwich" }, price: 200 },
      { id: "sw-sujuk", name: { ar: "سجق طازج", en: "Fresh Sujuk" }, price: 250 },
      { id: "sw-crispy", name: { ar: "كرسبي ساندويش", en: "Crispy Sandwich" }, price: 300 },
      { id: "sw-shrimp", name: { ar: "قريدس موزريلا او بالخلطة", en: "Shrimp Mozzarella / Mix" }, price: 350 },
      { id: "sw-mushroom", name: { ar: "تشكن ماشروم", en: "Chicken Mushroom" }, price: 350 }
    ]
  },
  {
    id: "beef-sandwiches",
    name: { ar: "ساندويشات لحمة", en: "Beef Sandwiches" },
    icon: "🥩",
    items: [
      { id: "bs-philadelphia", name: { ar: "فيلادلفيا", en: "Philadelphia" }, price: 450 },
      { id: "bs-cheesesteak", name: { ar: "تشيز ستيك", en: "Cheese Steak" }, price: 450 },
      { id: "bs-fatayel", name: { ar: "فتايل", en: "Fatayel" }, price: 450 }
    ]
  },
  {
    id: "beef-burger",
    name: { ar: "برغر لحمة", en: "Beef Burger" },
    icon: "🍔",
    items: [
      { id: "bb-bacon", name: { ar: "باكن برغر", en: "Bacon Burger" }, price: 400 },
      { id: "bb-patty-mozz", name: { ar: "باتي موزريلا بيف برغر", en: "Beef Patty Mozzarella Burger" }, price: 450 },
      { id: "bb-swiss-mushroom", name: { ar: "سويس ماشروم برغر", en: "Swiss Mushroom Burger" }, price: 450 },
      { id: "bb-classic-cheese", name: { ar: "كلاسيك بيف شاركل برغر", en: "Classic Beef Cheese Burger" }, price: 350 },
      { id: "bb-kids", name: { ar: "ليبانيز برغر (Kids burger)", en: "Kids Burger" }, price: 200 },
      { id: "bb-double", name: { ar: "دبل برغر", en: "Double Burger" }, price: 500 },
      { id: "bb-truffle", name: { ar: "ترافل برغر", en: "Truffle Burger" }, price: 400 },
      { id: "bb-smash", name: { ar: "سماش برغر", en: "Smash Burger" }, price: 350, tag: "popular" }
    ]
  },
  {
    id: "chicken-burger",
    name: { ar: "برغر دجاج", en: "Chicken Burger" },
    icon: "🍗",
    items: [
      { id: "cb-escalope", name: { ar: "اسكالوب برغر", en: "Escalope Burger" }, price: 300 },
      { id: "cb-kids", name: { ar: "برغر أطفال (kids)", en: "Kids Burger" }, price: 200 },
      { id: "cb-zinger", name: { ar: "زنجر برغر (Zinger)", en: "Zinger Burger" }, price: 350, tag: "zinger" },
      { id: "cb-cheese", name: { ar: "تشكن تشيز برغر", en: "Chicken Cheese Burger" }, price: 300 },
      { id: "cb-crunchy", name: { ar: "كرانشي برغر", en: "Crunchy Burger" }, price: 350 },
      { id: "cb-patty-mozz", name: { ar: "باتي موزريلا تشكن برغر", en: "Chicken Patty Mozzarella Burger" }, price: 400 },
      { id: "cb-arizona", name: { ar: "أريزونا تشكن تشيز برغر", en: "Arizona Chicken Cheese Burger" }, price: 450 },
      { id: "cb-sweet-smoke", name: { ar: "سويت اند سموك", en: "Sweet & Smoke" }, price: 350 }
    ]
  },
  {
    id: "shawarma",
    name: { ar: "الشاورما", en: "Shawarma" },
    icon: "🌯",
    items: [
      { id: "sh-fatteh", name: { ar: "فتة شورما جاط", en: "Shawarma Fatteh Plate" }, price: 400 },
      { id: "sh-chicken-large", name: { ar: "شاورما دجاج ساندويش كبير", en: "Large Chicken Shawarma Sandwich" }, price: 250 },
      { id: "sh-chicken-small", name: { ar: "شاورما دجاج ساندويش صغير", en: "Small Chicken Shawarma Sandwich" }, price: 150 },
      { id: "sh-box-loose", name: { ar: "وجبية شاورما فرط", en: "Loose Shawarma Box Meal" }, price: 650 },
      { id: "sh-1kg-service", name: { ar: "1 ك شاورما مع سرفيس", en: "1kg Shawarma with Sides" }, price: 2000 },
      { id: "sh-half-kg-service", name: { ar: "نص ك شاورما مع سرفيس", en: "Half kg Shawarma with Sides" }, price: 1000 },
      { id: "sh-meal-loose", name: { ar: "وجبة شورما فرط", en: "Loose Shawarma Meal" }, price: 400 },
      { id: "sh-arabic-cut", name: { ar: "وجبة مقطع عربي", en: "Arabic Cut Meal" }, price: 400 },
      { id: "sh-chicken-box", name: { ar: "بوكس شاورما دجاج", en: "Chicken Shawarma Box" }, price: 1200 }
    ]
  },
  {
    id: "potato",
    name: { ar: "بطاطا", en: "Potato" },
    icon: "🍟",
    items: [
      { id: "pt-happiness-box", name: { ar: "بوكس السعادة", en: "Happiness Box" }, price: 1200 },
      { id: "pt-fries-small", name: { ar: "علبة بطاطا فرايز", en: "Fries Cup" }, price: 250 },
      { id: "pt-fries-medium", name: { ar: "جاط بطاطا وسط فرايز", en: "Medium Fries Plate" }, price: 350 },
      { id: "pt-fries-large", name: { ar: "جاط بطاطا كبير فرايز", en: "Large Fries Plate" }, price: 500 },
      { id: "pt-cheese-fries", name: { ar: "تشيز فرايز", en: "Cheese Fries" }, price: 450 },
      { id: "pt-chicken-cheese-fries", name: { ar: "تشكن تشيز فرايز", en: "Chicken Cheese Fries" }, price: 550 },
      { id: "pt-potato-sandwich", name: { ar: "ساندويش بطاطا", en: "Potato Sandwich" }, price: 100 }
    ]
  },
  {
    id: "plates",
    name: { ar: "أطباق", en: "Plates" },
    icon: "🍽️",
    items: [
      { id: "pl-fahita", name: { ar: "وجبة فاهيتا", en: "Fahita Plate" }, price: 1000 },
      { id: "pl-fahita-family", name: { ar: "وجبة فاهيتا عائلية", en: "Family Fahita Plate" }, price: 2400 },
      { id: "pl-shrimp", name: { ar: "قريدس", en: "Shrimp" }, price: 1000 },
      { id: "pl-chinese", name: { ar: "وجبة تشاينيز", en: "Chinese Plate" }, price: 700 },
      { id: "pl-taouk", name: { ar: "وجبة طاووق", en: "Taouk Plate" }, price: 700 },
      { id: "pl-souda", name: { ar: "وجبة سودا", en: "Souda Plate" }, price: 500 },
      { id: "pl-half-chicken", name: { ar: "وجبة نص فروج", en: "Half Chicken Plate" }, price: 450 },
      { id: "pl-chicken-mushroom", name: { ar: "وجبة تشكن ماشروم", en: "Chicken Mushroom Plate" }, price: 1000 },
      { id: "pl-crispy-6", name: { ar: "وجبة كرسبي 6 قطع", en: "Crispy 6 pcs Plate" }, price: 700 },
      { id: "pl-crispy-9", name: { ar: "وجبة كرسبي 9 قطع", en: "Crispy 9 pcs Plate" }, price: 1000 },
      { id: "pl-crispy-12", name: { ar: "وجبة كرسبي 12 قطعة", en: "Crispy 12 pcs Plate" }, price: 1300 },
      { id: "pl-taouk-1kg", name: { ar: "طاووق 1 ك مشوي", en: "Grilled Taouk 1kg" }, price: 1600 },
      { id: "pl-chicken-broasted", name: { ar: "فروج بروستد", en: "Broasted Chicken" }, price: 1200 },
      { id: "pl-chicken-grilled", name: { ar: "فروج مشوي", en: "Grilled Chicken" }, price: null }
    ]
  }
];

// Business info
const BUSINESS_INFO = {
  name: { ar: "وسام سناك", en: "Wissam Snack" },
  tagline: { ar: "طعم يحلي جمعتك", en: "Taste that makes your day" },
  whatsapp: "9613644720", // international format, no +/spaces, used for wa.me links
  whishNumber: "03 644 720",
  phoneDisplay: "03 644 720",
  facebook: "https://www.facebook.com/profile.php?id=100076200439151",
  deliveryNote: { ar: "خدمة دلفري لكافة أنحاء صيدا", en: "Delivery service to all areas of Sidon" },
  currency: { ar: "ل.ل", en: "LBP" }
};
