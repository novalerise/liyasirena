// ============================================
// ЛОГИКА КАТАЛОГА
// ============================================

let allProducts = [];
let filteredProducts = [];

const state = {
  line: '',
  search: '',
  brands: [],
  categories: [],
  skinTypes: [],
  concerns: [],
  priceMin: null,
  priceMax: null,
  sort: 'new'  // по умолчанию — сначала новые
};

// ============================================
// ЗАГРУЗКА
// ============================================
async function loadProducts() {
  try {
    const res = await fetch('data/products.json');
    allProducts = await res.json();

    detectMode();
    initFilters();
    applyFilters();
  } catch (err) {
    console.error('Ошибка:', err);
    document.getElementById('catalogGrid').innerHTML =
      '<p style="color:var(--ink-light)">Откройте через Live Server</p>';
  }
}

// ============================================
// РЕЖИМ ИЗ URL
// ============================================
function detectMode() {
  const params = new URLSearchParams(window.location.search);

  const line = params.get('line');
  if (line === 'kbeauty' || line === 'luxury') state.line = line;

  const brand = params.get('brand');
  if (brand) state.brands = [brand];

  updatePageTitle();
}

function updatePageTitle() {
  const title = document.getElementById('pageTitle');
  const crumb = document.getElementById('crumbCurrent');

  // Если выбран один бренд — показываем бренд
  if (state.brands.length === 1) {
    const brandName = state.brands[0];
    if (title) title.textContent = brandName;
    if (crumb) crumb.textContent = brandName;
    document.title = brandName + ' · LiyasIrena';
    return;
  }

  // Иначе — по разделу
  if (state.line === 'kbeauty') {
    if (title) title.textContent = 'Skin Care';
    if (crumb) crumb.textContent = 'Skin Care';
    document.title = 'Skin Care · LiyasIrena';
    return;
  }

  if (state.line === 'luxury') {
    if (title) title.textContent = 'Luxury';
    if (crumb) crumb.textContent = 'Luxury';
    document.title = 'Luxury · LiyasIrena';
    return;
  }

  // Общий каталог
  if (title) title.textContent = 'Каталог';
  if (crumb) crumb.textContent = 'Каталог';
  document.title = 'Каталог · LiyasIrena';
}

// ============================================
// ФИЛЬТРЫ
// ============================================
function initFilters() {
  // Radio «Раздел»
  document.querySelectorAll('input[name="line"]').forEach(radio => {
    if (radio.value === state.line) radio.checked = true;

    radio.addEventListener('change', () => {
      state.line = radio.value;

      // Убираем выбранные бренды, которых нет в новом разделе
      if (state.line) {
        state.brands = state.brands.filter(b => {
          const product = allProducts.find(p => p.brand === b);
          return product && product.line === state.line;
        });
      }

      // Обновляем URL
      const url = new URL(window.location);
      if (state.line) url.searchParams.set('line', state.line);
      else url.searchParams.delete('line');
      window.history.replaceState({}, '', url);

      renderBrandsForLine();
      updatePageTitle();
      applyFilters();
    });
  });

  // Бренды — только из текущего раздела
  renderBrandsForLine();

  // Категории
  const categories = [...new Set(getCurrentProducts().map(p => p.category))].sort();
  renderFilterOptions('categoryFilter', categories, 'categories');

  // Тип кожи
  const skinTypes = [...new Set(getCurrentProducts().flatMap(p => p.skinType || []))].sort();
  renderFilterOptions('skinFilter', skinTypes, 'skinTypes');

  // Проблемы
  const concerns = [...new Set(getCurrentProducts().flatMap(p => p.concern || []))].sort();
  renderFilterOptions('concernFilter', concerns, 'concerns');
}

function getCurrentProducts() {
  if (!state.line) return allProducts;
  return allProducts.filter(p => p.line === state.line);
}

function renderBrandsForLine() {
  const brands = [...new Set(getCurrentProducts().map(p => p.brand))].sort();
  state.brands = state.brands.filter(b => brands.includes(b));
  renderFilterOptions('brandFilter', brands, 'brands');
}

function renderFilterOptions(containerId, items, stateKey) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items.length) {
    container.innerHTML = '<p style="font-size:12px;color:var(--ink-light)">Нет вариантов</p>';
    return;
  }

  container.innerHTML = items.map(item => {
    const checked = state[stateKey].includes(item) ? 'checked' : '';
    return `
      <label class="filter-option">
        <input type="checkbox" value="${item}" data-filter="${stateKey}" ${checked}>
        <span class="filter-option__box"></span>
        <span class="filter-option__label">${item}</span>
      </label>
    `;
  }).join('');

  container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const value = cb.value;
      const key = cb.dataset.filter;

      if (cb.checked) state[key].push(value);
      else state[key] = state[key].filter(v => v !== value);

      applyFilters();
    });
  });
}

// ============================================
// ФИЛЬТРАЦИЯ
// ============================================
function applyFilters() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) state.search = searchInput.value.trim().toLowerCase();

  const priceMin = document.getElementById('priceMin');
  const priceMax = document.getElementById('priceMax');
  state.priceMin = priceMin && priceMin.value ? Number(priceMin.value) : null;
  state.priceMax = priceMax && priceMax.value ? Number(priceMax.value) : null;

  filteredProducts = allProducts.filter(product => {
    if (state.line && product.line !== state.line) return false;

    if (state.search) {
      const text = (product.name + ' ' + product.brand).toLowerCase();
      if (!text.includes(state.search)) return false;
    }

    if (state.brands.length && !state.brands.includes(product.brand)) return false;
    if (state.categories.length && !state.categories.includes(product.category)) return false;

    if (state.skinTypes.length) {
      const has = state.skinTypes.some(t => (product.skinType || []).includes(t));
      if (!has) return false;
    }

    if (state.concerns.length) {
      const has = state.concerns.some(c => (product.concern || []).includes(c));
      if (!has) return false;
    }

    if (state.priceMin !== null && product.price < state.priceMin) return false;
    if (state.priceMax !== null && product.price > state.priceMax) return false;

    return true;
  });

  sortProducts();
  renderCatalog();
  renderActiveFilters();
  updateCount();
  updatePageTitle();
}

function sortProducts() {
  switch (state.sort) {
    case 'new':
      // Сначала новые (по дате добавления)
      filteredProducts.sort((a, b) => {
        const dateA = a.dateAdded ? new Date(a.dateAdded) : new Date(0);
        const dateB = b.dateAdded ? new Date(b.dateAdded) : new Date(0);
        return dateB - dateA;
      });
      break;
    case 'price-asc':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'popular':
    default:
      // Хиты продаж — вперёд
      filteredProducts.sort((a, b) => {
        const aHit = a.tags && a.tags.includes('Хит продаж') ? 1 : 0;
        const bHit = b.tags && b.tags.includes('Хит продаж') ? 1 : 0;
        return bHit - aHit;
      });
  }
}

// ============================================
// ОТРИСОВКА
// ============================================
function renderCatalog() {
  const grid = document.getElementById('catalogGrid');
  const empty = document.getElementById('emptyState');

  if (!filteredProducts.length) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  grid.innerHTML = filteredProducts.map(product => {
    const baseCard = productCardHTML(product);
    return baseCard.replace(
      '<a href="product.html',
      `<button class="product-card__quick" data-quick="${product.id}" title="Быстрый просмотр">
        <svg viewBox="0 0 24 24">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>
      <a href="product.html`
    );
  }).join('');

  if (typeof initFavButtons === 'function') initFavButtons();
  if (typeof initReveal === 'function') initReveal();
  initQuickView();
}

// ============================================
// БЫСТРЫЙ ПРОСМОТР
// ============================================
function initQuickView() {
  document.querySelectorAll('[data-quick]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openQuickView(btn.dataset.quick);
    });
  });
}

function openQuickView(id) {
  const p = allProducts.find(prod => prod.id === id);
  if (!p) return;

  const body = document.getElementById('quickViewBody');
  const modal = document.getElementById('quickView');

  const skinText = (typeof getSkinTypeText === 'function')
    ? getSkinTypeText(p.skinType)
    : '';

  body.innerHTML = `
    <div class="quick">
            <div class="quick__image">
        <img src="${p.image || (p.images && p.images[0]) || ''}" alt="${p.name}"
             onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=color:var(--ink-light)>Фото скоро</span>';">
      </div>
      <div>
        <div class="quick__brand">${p.brand}</div>
        <h2 class="quick__name">${p.name}</h2>
        ${p.volume ? `<div class="quick__volume">${p.volume}${skinText ? ' · ' + skinText : ''}</div>` : ''}
        <div class="quick__price">
          ${p.oldPrice ? `<span class="quick__price-old">${p.oldPrice} ₽</span>` : ''}
          <span class="quick__price-current">${p.price} ₽</span>
        </div>
        <div class="quick__order">Под заказ</div>
        <p class="quick__desc">${p.description}</p>
        <div class="quick__actions">
          <a href="#" class="btn link-whatsapp" data-product="${p.name}">WhatsApp</a>
          <a href="#" class="btn link-telegram">Telegram</a>
          <a href="#" class="btn link-instagram">Instagram</a>
        </div>
        <a href="product.html?id=${p.id}" class="quick__more">Подробнее о товаре →</a>
      </div>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  if (typeof applyContacts === 'function') applyContacts();
}

function closeQuickView() {
  document.getElementById('quickView').classList.remove('open');
  document.body.style.overflow = '';
}

// ============================================
// ЧИПСЫ
// ============================================
function renderActiveFilters() {
  const container = document.getElementById('activeFilters');
  if (!container) return;

  const chips = [];

  state.brands.forEach(b => chips.push({ label: b, type: 'brands', value: b }));
  state.categories.forEach(c => chips.push({ label: c, type: 'categories', value: c }));
  state.skinTypes.forEach(s => chips.push({ label: s, type: 'skinTypes', value: s }));
  state.concerns.forEach(c => chips.push({ label: c, type: 'concerns', value: c }));
  if (state.priceMin !== null) chips.push({ label: `от ${state.priceMin} ₽`, type: 'priceMin' });
  if (state.priceMax !== null) chips.push({ label: `до ${state.priceMax} ₽`, type: 'priceMax' });

  container.innerHTML = chips.map(chip => `
    <span class="chip">
      ${chip.label}
      <span class="chip__remove" data-type="${chip.type}" data-value="${chip.value || ''}">×</span>
    </span>
  `).join('');

  container.querySelectorAll('.chip__remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      const value = btn.dataset.value;

      if (type === 'priceMin') document.getElementById('priceMin').value = '';
      else if (type === 'priceMax') document.getElementById('priceMax').value = '';
      else {
        state[type] = state[type].filter(v => v !== value);
        const cb = document.querySelector(`input[data-filter="${type}"][value="${value}"]`);
        if (cb) cb.checked = false;
      }

      applyFilters();
    });
  });
}

function updateCount() {
  const count = document.getElementById('countInfo');
  if (count) count.textContent = `Показано: ${filteredProducts.length} из ${allProducts.length}`;
}

// ============================================
// ПОИСК
// ============================================
function initSearch() {
  const input = document.getElementById('searchInput');
  const suggest = document.getElementById('searchSuggest');
  if (!input || !suggest) return;

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();

    if (query.length < 1) {
      suggest.classList.remove('open');
      applyFilters();
      return;
    }

    const matches = allProducts
      .filter(p => {
        if (state.line && p.line !== state.line) return false;
        return (p.name + ' ' + p.brand).toLowerCase().includes(query);
      })
      .slice(0, 6);

    if (matches.length) {
      suggest.innerHTML = matches.map(p => `
        <div class="search__item" data-id="${p.id}">
          ${p.name}
          <span>${p.brand}</span>
        </div>
      `).join('');
      suggest.classList.add('open');

      suggest.querySelectorAll('.search__item').forEach(item => {
        item.addEventListener('click', () => {
          window.location.href = `product.html?id=${item.dataset.id}`;
        });
      });
    } else {
      suggest.classList.remove('open');
    }

    applyFilters();
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search')) suggest.classList.remove('open');
  });
}

// ============================================
// СОРТИРОВКА, ЦЕНА, МОБ. ФИЛЬТРЫ
// ============================================
function initSort() {
  const select = document.getElementById('sortSelect');
  if (!select) return;
  select.addEventListener('change', () => {
    state.sort = select.value;
    applyFilters();
  });
}

function initPriceInputs() {
  ['priceMin', 'priceMax'].forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(applyFilters, 400);
    });
  });
}

function initMobileFilters() {
  const openBtn = document.getElementById('filterOpen');
  const closeBtn = document.getElementById('filterClose');
  const sidebar = document.getElementById('sidebar');

  if (!openBtn || !sidebar) return;

  let overlay = document.querySelector('.filter-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'filter-overlay';
    document.body.appendChild(overlay);
  }

  const open = () => {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  openBtn.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  overlay.addEventListener('click', close);
}

// ============================================
// СБРОС
// ============================================
function resetFilters() {
  state.search = '';
  state.brands = [];
  state.categories = [];
  state.skinTypes = [];
  state.concerns = [];
  state.priceMin = null;
  state.priceMax = null;
  state.line = '';

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  const priceMin = document.getElementById('priceMin');
  if (priceMin) priceMin.value = '';
  const priceMax = document.getElementById('priceMax');
  if (priceMax) priceMax.value = '';

  document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('input[name="line"]').forEach(r => r.checked = r.value === '');

  // Очищаем URL
  window.history.replaceState({}, '', 'catalog.html');

  renderBrandsForLine();
  updatePageTitle();
  applyFilters();
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  initSearch();
  initSort();
  initPriceInputs();
  initMobileFilters();

  const resetBtn = document.getElementById('resetFilters');
  if (resetBtn) resetBtn.addEventListener('click', resetFilters);

  document.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', closeQuickView);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeQuickView();
  });
});