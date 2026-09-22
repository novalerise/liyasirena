// ============================================
// ОБЩИЕ СКРИПТЫ
// ============================================

function initReveal() {
  const elements = document.querySelectorAll('.reveal:not(.visible)');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  elements.forEach(el => observer.observe(el));
}

function initToTop() {
  const btn = document.getElementById('toTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function initPreloader() {
  const preloader = document.getElementById('preloader');

  // Плавное появление страницы
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';

  window.addEventListener('load', () => {
    setTimeout(() => {
      document.body.style.opacity = '1';
    }, 100);

    if (preloader) {
      setTimeout(() => preloader.classList.add('hidden'), 300);
    }
  });

  // Подстраховка: если load не сработал за 2 сек — показываем
  setTimeout(() => {
    document.body.style.opacity = '1';
    if (preloader) preloader.classList.add('hidden');
  }, 2000);
}

// --- Избранное ---
function initFavButtons() {
  const buttons = document.querySelectorAll('.product-card__fav');
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

  buttons.forEach(btn => {
    const id = btn.dataset.id;
    if (favorites.includes(id)) btn.classList.add('active');

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(id, btn);
    });
  });
}

function toggleFavorite(id, btn) {
  let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
    if (btn) btn.classList.remove('active');
    showToast('Удалено из избранного');
  } else {
    favorites.push(id);
    if (btn) btn.classList.add('active');
    showToast('Добавлено в избранное');
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));
  if (typeof updateFavBadge === 'function') updateFavBadge();
}

// --- Карточка товара ---
// Правила отображения:
// - если skinType = ["все типы"] → ничего не пишем
// - если 1-2 типа → перечисляем через запятую
// - если 3+ типа → "Для всех типов кожи"
function getSkinTypeText(skinType) {
  if (!skinType || !skinType.length) return '';
  if (skinType.includes('все типы')) return '';
  if (skinType.length >= 3) return 'Для всех типов кожи';
  return 'Для ' + skinType.join(' и ') + ' кожи';
}

function productCardHTML(product) {
  const tagsHTML = (product.tags && product.tags.length)
    ? `<div class="product-card__tags">
        ${product.tags.map(tag => {
          let cls = 'tag';
          if (tag.includes('Хит')) cls += ' tag--hit';
          else if (tag.includes('Новинка')) cls += ' tag--new';
          else if (tag.includes('Скидка')) cls += ' tag--sale';
          else if (tag.includes('Люкс')) cls += ' tag--lux';
          return `<span class="${cls}">${tag}</span>`;
        }).join('')}
       </div>`
    : '';

  const priceHTML = `
    ${product.oldPrice ? `<span class="product-card__old">${product.oldPrice} ₽</span>` : ''}
    <span class="product-card__current">${product.price} ₽</span>
  `;

  const skinText = getSkinTypeText(product.skinType);

  // Берём главное фото: image или первое из images
  const cardImage = product.image
    || (product.images && product.images[0])
    || '';

  return `
    <div class="product-card reveal">
      ${tagsHTML}

      <button class="product-card__fav" data-id="${product.id}" title="В избранное">
        <svg viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      <a href="product.html?id=${product.id}" class="product-card__link">
        <div class="product-card__image">
          <img src="${cardImage}" alt="${product.name}" loading="lazy"
               onerror="this.style.display='none'; this.parentElement.classList.add('no-image');">
        </div>
        <div class="product-card__brand">${product.brand}</div>
        <h3 class="product-card__name">${product.name}</h3>
        ${skinText ? `<div class="product-card__skin">${skinText}</div>` : ''}
        <div class="product-card__price">${priceHTML}</div>
        <div class="product-card__order">Под заказ</div>
      </a>
    </div>
  `;
}

// ============================================
// ПОПУЛЯРНЫЕ БРЕНДЫ ДЛЯ ГЛАВНОЙ
// ============================================
// Возвращает 3 корейских + 3 люксовых бренда
function getHomeBrands(products) {
  const kbeauty = [...new Set(
    products.filter(p => p.line === 'kbeauty').map(p => p.brand)
  )].sort().slice(0, 3);

  const luxury = [...new Set(
    products.filter(p => p.line === 'luxury').map(p => p.brand)
  )].sort().slice(0, 3);

  // Возвращаем с указанием линии
  return [
    ...kbeauty.map(b => ({ brand: b, line: 'kbeauty' })),
    ...luxury.map(b => ({ brand: b, line: 'luxury' }))
  ];
}

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initToTop();
  initReveal();
  setTimeout(initReveal, 500);
  setTimeout(initReveal, 1500);
});