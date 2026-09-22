// ============================================
// СТРАНИЦА ИЗБРАННОГО
// ============================================

let allProductsCache = [];

async function loadFavorites() {
  const container = document.getElementById('favoritesContainer');
  if (!container) return;

  const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');

  if (!favoriteIds.length) {
    renderEmpty(container);
    return;
  }

  try {
    const res = await fetch('data/products.json');
    allProductsCache = await res.json();

    const favoriteProducts = allProductsCache.filter(p =>
      favoriteIds.includes(p.id)
    );

    if (!favoriteProducts.length) {
      renderEmpty(container);
      return;
    }

    renderFavorites(container, favoriteProducts);
  } catch (err) {
    console.error('Ошибка загрузки:', err);
    container.innerHTML = '<p class="favorites__loading">Не удалось загрузить</p>';
  }
}

function renderEmpty(container) {
  container.innerHTML = `
    <div class="favorites__empty">
      <svg viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      <h2>В избранном пока ничего нет</h2>
      <p>Нажмите на сердечко в карточке товара, чтобы сохранить его здесь</p>
      <a href="catalog.html" class="btn btn--primary">Перейти в каталог</a>
    </div>
  `;
}

function renderFavorites(container, products) {
  container.innerHTML = `
    <div class="favorites__top">
      <div class="favorites__count">Сохранено: ${products.length}</div>
      <button class="favorites__clear" id="clearFav">Очистить всё</button>
    </div>
    <div class="products-grid" id="favGrid">
      ${products.map(productCardHTML).join('')}
    </div>
  `;

  if (typeof initFavButtons === 'function') initFavButtons();
  if (typeof initReveal === 'function') initReveal();

  // Кнопка очистки
  const clearBtn = document.getElementById('clearFav');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Удалить все товары из избранного?')) {
        localStorage.setItem('favorites', '[]');
        if (typeof updateFavBadge === 'function') updateFavBadge();
        loadFavorites();
        if (typeof showToast === 'function') showToast('Избранное очищено');
      }
    });
  }

  // Следим за удалением через сердечки — обновляем список
  document.querySelectorAll('#favGrid .product-card__fav').forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeout(() => {
        const stillFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (stillFavorites.length === 0) {
          loadFavorites();
        } else {
          // Обновляем счётчик
          const count = document.querySelector('.favorites__count');
          if (count) count.textContent = `Сохранено: ${stillFavorites.length}`;
        }
      }, 100);
    });
  });
}

document.addEventListener('DOMContentLoaded', loadFavorites);