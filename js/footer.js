// ============================================
// ПОДВАЛ САЙТА — КОМПАКТНЫЙ
// ============================================

function renderFooter() {
  const footerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer__inner">

          <!-- Логотип -->
          <div class="footer__brand">
            <div class="footer__title">
              <span class="shop-name">LiyasIrena</span>
            </div>
            <div class="footer__slogan">
              <span class="shop-slogan">Korean skincare & luxury beauty</span>
            </div>
          </div>

          <!-- Навигация в одну линию -->
          <nav class="footer__nav">
            <a href="catalog.html">Каталог</a>
            <a href="catalog.html?line=kbeauty">Skin Care</a>
            <a href="catalog.html?line=luxury">Luxury</a>
            <a href="brands.html">Бренды</a>
            <a href="about.html">О нас</a>
            <a href="contacts.html">Контакты</a>
          </nav>

          <!-- Соцсети -->
          <div class="footer__socials">
            <a href="#" class="footer__social link-whatsapp" title="WhatsApp">
              <svg viewBox="0 0 24 24">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </a>
            <a href="#" class="footer__social link-telegram" title="Telegram">
              <svg viewBox="0 0 24 24">
                <path d="M22 2L11 13"/>
                <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </a>
            <a href="#" class="footer__social link-instagram" title="Instagram">
              <svg viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <circle cx="12" cy="12" r="4"/>
                <line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/>
              </svg>
            </a>
          </div>

        </div>

        <!-- Нижняя линия с копирайтом -->
        <div class="footer__bottom">
          <span>© <span id="year"></span> <span class="shop-name">LiyasIrena</span></span>
          <span class="footer__dot">·</span>
          <span class="shop-city">Якутск</span>
        </div>
      </div>
    </footer>
  `;

  const placeholder = document.getElementById('footer');
  if (placeholder) placeholder.innerHTML = footerHTML;

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', renderFooter);