// ============================================
// ШАПКА САЙТА
// ============================================

function renderHeader() {
  const headerHTML = `
    <header class="header">
      <div class="container">
        <div class="header__inner">

          <a href="index.html" class="header__logo">
            <span class="header__logo-name shop-name">LiyasIrena</span>
            <span class="header__logo-slogan shop-slogan">Korean skincare & luxury beauty</span>
          </a>

          <nav class="header__nav" id="mainNav">
            <a href="index.html">Главная</a>
            <a href="catalog.html">Каталог</a>
            <a href="catalog.html?line=kbeauty">Skin Care</a>
            <a href="catalog.html?line=luxury">Luxury</a>
            <a href="brands.html">Бренды</a>
            <a href="contacts.html">Контакты</a>
          </nav>

          <div class="header__actions">

            <a href="favorites.html" class="header__icon" title="Избранное">
              <svg viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span class="header__badge" id="favBadge" style="display:none">0</span>
            </a>

            <button class="header__burger" id="burger" aria-label="Меню">
              <span></span>
              <span></span>
              <span></span>
            </button>

          </div>
        </div>
      </div>
    </header>
  `;

  const placeholder = document.getElementById('header');
  if (placeholder) placeholder.innerHTML = headerHTML;

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.header__nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) link.classList.add('active');
  });

  const burger = document.getElementById('burger');
  const nav = document.getElementById('mainNav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      nav.classList.toggle('open');
    });
  }

  updateFavBadge();
}

function updateFavBadge() {
  const badge = document.getElementById('favBadge');
  if (!badge) return;

  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (favorites.length > 0) {
    badge.textContent = favorites.length;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', renderHeader);