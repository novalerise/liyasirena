// ============================================
// СТРАНИЦА ТОВАРА
// ============================================

let currentProduct = null;
let allProducts = [];
let currentImageIndex = 0;
let productImages = [];

async function loadProduct() {
  try {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      showError('Товар не найден');
      return;
    }

    const res = await fetch('data/products.json');
    allProducts = await res.json();

    currentProduct = allProducts.find(p => p.id === id);

    if (!currentProduct) {
      showError('Товар не найден');
      return;
    }

    renderProduct();
    renderSimilar();
    updateTitle();
  } catch (err) {
    console.error('Ошибка загрузки:', err);
    showError('Не удалось загрузить товар');
  }
}

// Получить массив фото
function getProductImages(product) {
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images;
  }
  if (product.image) {
    return [product.image];
  }
  return [];
}

function updateTitle() {
  document.title = currentProduct.name + ' · Liya Sirena';
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = currentProduct.description.slice(0, 160);
}

function showError(message) {
  const container = document.getElementById('productContainer');
  container.innerHTML = `
    <div style="text-align:center; padding: 80px 20px;">
      <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 32px; margin-bottom: 14px;">${message}</h2>
      <p style="color: var(--ink-light); margin-bottom: 26px;">Возможно, товар был удалён или ссылка неверна.</p>
      <a href="catalog.html" class="btn btn--primary">Перейти в каталог</a>
    </div>
  `;
}

function renderProduct() {
  const p = currentProduct;
  productImages = getProductImages(p);
  currentImageIndex = 0;

  const crumbs = document.getElementById('breadcrumbs');
  crumbs.innerHTML = `
    <a href="index.html">Главная</a>
    <span>/</span>
    <a href="catalog.html">Каталог</a>
    <span>/</span>
    <a href="catalog.html?brand=${encodeURIComponent(p.brand)}">${p.brand}</a>
    <span>/</span>
    <span>${p.name}</span>
  `;

  const discount = p.oldPrice
    ? Math.round((1 - p.price / p.oldPrice) * 100)
    : 0;

  const skinText = (typeof getSkinTypeText === 'function')
    ? getSkinTypeText(p.skinType)
    : '';

  const concerns = (p.concern || []).join(', ');

  const tagsHtml = (p.tags || []).map(tag => {
    return `<span class="product__tag">${tag}</span>`;
  }).join('');

  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const isFav = favorites.includes(p.id);

  // Галерея
  const hasMultipleImages = productImages.length > 1;
  const mainImage = productImages[0] || '';

  // Стрелки — только если фото больше одного
  const arrowsHtml = hasMultipleImages
    ? `<button class="product__arrow product__arrow--prev" id="prevArrow" aria-label="Предыдущее фото">
         <svg viewBox="0 0 24 24">
           <polyline points="15 18 9 12 15 6"/>
         </svg>
       </button>
       <button class="product__arrow product__arrow--next" id="nextArrow" aria-label="Следующее фото">
         <svg viewBox="0 0 24 24">
           <polyline points="9 18 15 12 9 6"/>
         </svg>
       </button>`
    : '';

  // Миниатюры — только если фото больше одного
  const thumbsHtml = hasMultipleImages
    ? `<div class="product__thumbs">
        ${productImages.map((img, i) => `
          <div class="product__thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
            <img src="${img}" alt="${p.name}"
                 onerror="this.style.display='none'; this.parentElement.style.background='var(--sand)';">
          </div>
        `).join('')}
      </div>`
    : '';

  const html = `
    <div class="product">

      <div class="product__gallery">
        <div class="product__main-image" id="mainImage">
          <img src="${mainImage}" alt="${p.name}" id="mainImageImg"
               onerror="this.style.display='none'; this.parentElement.classList.add('no-image');">
          ${arrowsHtml}
        </div>
        ${thumbsHtml}
      </div>

      <div class="product__info">

        <div class="product__brand">
          <a href="catalog.html?brand=${encodeURIComponent(p.brand)}">${p.brand}</a>
        </div>

        <h1 class="product__title">${p.name}</h1>

        ${p.volume ? `<div class="product__volume">Объём: ${p.volume}${skinText ? ' · ' + skinText : ''}</div>` : ''}

        <div class="product__price">
          ${p.oldPrice ? `<span class="product__price-old">${p.oldPrice} ₽</span>` : ''}
          <span class="product__price-current">${p.price} ₽</span>
          ${discount > 0 ? `<span class="product__discount">−${discount}%</span>` : ''}
        </div>

        <div class="product__order">Под заказ</div>

        <div class="product__specs">
          ${p.volume ? `
            <div class="product__spec">
              <span class="product__spec-label">Объём</span>
              <span class="product__spec-value">${p.volume}</span>
            </div>
          ` : ''}
          ${skinText ? `
            <div class="product__spec">
              <span class="product__spec-label">Тип кожи</span>
              <span class="product__spec-value">${(p.skinType || []).join(', ')}</span>
            </div>
          ` : ''}
          ${concerns ? `
            <div class="product__spec">
              <span class="product__spec-label">Назначение</span>
              <span class="product__spec-value">${concerns}</span>
            </div>
          ` : ''}
        </div>

        ${tagsHtml ? `<div class="product__tags">${tagsHtml}</div>` : ''}

                <div class="product__actions">
          <a href="#" class="btn btn--whatsapp link-whatsapp product__actions-main" data-product="${p.name}">
            <svg viewBox="0 0 24 24" class="product__actions-icon">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            Заказать в WhatsApp
          </a>
          <div class="product__actions-row">
            <a href="#" class="btn btn--telegram link-telegram">
              <svg viewBox="0 0 24 24" class="product__actions-icon">
                <path d="M22 2L11 13"/>
                <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
              Telegram
            </a>
            <a href="#" class="btn btn--instagram link-instagram">
              <svg viewBox="0 0 24 24" class="product__actions-icon">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <circle cx="12" cy="12" r="4"/>
                <line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/>
              </svg>
              Instagram
            </a>
          </div>
        </div>

        <button class="product__fav ${isFav ? 'active' : ''}" id="favBtn">
          <svg viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>${isFav ? 'В избранном' : 'В избранное'}</span>
        </button>

      </div>
    </div>

    <div class="product__tabs">
      <div class="tabs__nav">
        <button class="tabs__btn active" data-tab="desc">Описание</button>
        <button class="tabs__btn" data-tab="how">Как использовать</button>
        <button class="tabs__btn" data-tab="ing">Состав</button>
      </div>

      <div class="tabs__panel active" data-panel="desc">
        <p>${p.description}</p>
      </div>

      <div class="tabs__panel" data-panel="how">
        <p>${p.howToUse || 'Инструкция скоро появится.'}</p>
      </div>

      <div class="tabs__panel" data-panel="ing">
        <div class="tabs__ingredients">
          ${p.ingredients || 'Состав уточняется.'}
        </div>
      </div>

      <div class="how-we-work">
        <h3 class="how-we-work__title">Как я работаю</h3>
        <p class="how-we-work__text">
          Я <strong>байер в Якутске</strong>. Вы пишете мне, что хотите заказать,
          я уточняю наличие и сроки у поставщиков.
        </p>
        <p class="how-we-work__text">
          Сроки и цена зависят от бренда и позиции — обычно
          <strong>от нескольких дней</strong>. Точную информацию скажу
          в WhatsApp или Telegram, когда вы напишете.
        </p>
        <p class="how-we-work__text">
          Все продукты — <strong>оригиналы</strong>. Работаю только
          с проверенными поставщиками.
        </p>
      </div>
    </div>
  `;

  document.getElementById('productContainer').innerHTML = html;

  if (typeof applyContacts === 'function') applyContacts();

  initTabs();
  initFavButton();
  initGallery();
}

// ============================================
// ГАЛЕРЕЯ
// ============================================
function initGallery() {
  if (productImages.length <= 1) return;

  const mainImg = document.getElementById('mainImageImg');
  const prevBtn = document.getElementById('prevArrow');
  const nextBtn = document.getElementById('nextArrow');
  const thumbs = document.querySelectorAll('.product__thumb');

  // Обновить состояние: фото, стрелки, миниатюры
  function updateGallery() {
    // Меняем фото
    mainImg.src = productImages[currentImageIndex];
    mainImg.style.display = 'block';
    mainImg.parentElement.classList.remove('no-image');

    // Миниатюры — активная
    thumbs.forEach((t, i) => {
      t.classList.toggle('active', i === currentImageIndex);
    });

    // Стрелки — показывать/скрывать
    if (prevBtn) {
      prevBtn.style.display = currentImageIndex > 0 ? 'flex' : 'none';
    }
    if (nextBtn) {
      nextBtn.style.display = currentImageIndex < productImages.length - 1 ? 'flex' : 'none';
    }
  }

  // Стрелка назад
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentImageIndex > 0) {
        currentImageIndex--;
        updateGallery();
      }
    });
  }

  // Стрелка вперёд
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentImageIndex < productImages.length - 1) {
        currentImageIndex++;
        updateGallery();
      }
    });
  }

  // Миниатюры — клик
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      currentImageIndex = Number(thumb.dataset.index);
      updateGallery();
    });
  });

  // Клавиатура: ← и →
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
      currentImageIndex--;
      updateGallery();
    }
    if (e.key === 'ArrowRight' && currentImageIndex < productImages.length - 1) {
      currentImageIndex++;
      updateGallery();
    }
  });

  // Инициализация
  updateGallery();
}

function initTabs() {
  document.querySelectorAll('.tabs__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tabs__btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tabs__panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`.tabs__panel[data-panel="${tab}"]`).classList.add('active');
    });
  });
}

function initFavButton() {
  const btn = document.getElementById('favBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    if (favorites.includes(currentProduct.id)) {
      favorites = favorites.filter(f => f !== currentProduct.id);
      btn.classList.remove('active');
      btn.querySelector('span').textContent = 'В избранное';
      showToast('Удалено из избранного');
    } else {
      favorites.push(currentProduct.id);
      btn.classList.add('active');
      btn.querySelector('span').textContent = 'В избранном';
      showToast('Добавлено в избранное');
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    if (typeof updateFavBadge === 'function') updateFavBadge();
  });
}

function renderSimilar() {
  const similar = allProducts
    .filter(p =>
      p.id !== currentProduct.id &&
      (p.brand === currentProduct.brand ||
       p.category === currentProduct.category ||
       p.line === currentProduct.line)
    )
    .slice(0, 4);

  if (!similar.length) return;

  const section = document.getElementById('similarSection');
  const grid = document.getElementById('similarGrid');

  section.style.display = 'block';
  grid.innerHTML = similar.map(productCardHTML).join('');

  if (typeof initFavButtons === 'function') initFavButtons();
  if (typeof initReveal === 'function') initReveal();
}

document.addEventListener('DOMContentLoaded', loadProduct);