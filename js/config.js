// ============================================
// НАСТРОЙКИ САЙТА — МЕНЯЙ ЗДЕСЬ
// ============================================

const CONFIG = {
  // Название магазина
  shopName: "Liya Sirena",

  // Слоган
  slogan: "Korean skincare & luxury beauty",

  // Город
  city: "Якутск",

  // Контакты — ЗАМЕНИ НА СВОИ
  whatsapp: "https://wa.me/79841038345",
  telegram: "https://t.me/liyasirena",
  instagram: "https://instagram.com/liyasirena",
  email: "your@email.com",

  // Текст для кнопок на товаре (добавляется название товара)
  whatsappText: "Здравствуйте! Хочу заказать: ",

  // Текст для общих кнопок (главная, подвал, контакты)
  whatsappTextGeneral: "Здравствуйте! Хочу сделать заказ"
};

// ============================================
// АВТОПОДСТАНОВКА (не трогай)
// ============================================

function applyContacts() {
  // WhatsApp
  document.querySelectorAll('.link-whatsapp').forEach(el => {
    const productName = el.dataset.product;
    if (productName) {
      // На товаре — с названием товара
      el.href = CONFIG.whatsapp + '?text=' + encodeURIComponent(CONFIG.whatsappText + productName);
    } else {
      // Общая кнопка — с общим текстом
      el.href = CONFIG.whatsapp + '?text=' + encodeURIComponent(CONFIG.whatsappTextGeneral);
    }
  });

  // Telegram
  document.querySelectorAll('.link-telegram').forEach(el => {
    el.href = CONFIG.telegram;
  });

  // Instagram
  document.querySelectorAll('.link-instagram').forEach(el => {
    el.href = CONFIG.instagram;
  });

  // Email
  document.querySelectorAll('.link-email').forEach(el => {
    el.href = 'mailto:' + CONFIG.email;
    el.textContent = CONFIG.email;
  });

  // Название магазина
  document.querySelectorAll('.shop-name').forEach(el => {
    el.textContent = CONFIG.shopName;
  });

  // Слоган
  document.querySelectorAll('.shop-slogan').forEach(el => {
    el.textContent = CONFIG.slogan;
  });

  // Город
  document.querySelectorAll('.shop-city').forEach(el => {
    el.textContent = CONFIG.city;
  });
}

document.addEventListener('DOMContentLoaded', applyContacts);