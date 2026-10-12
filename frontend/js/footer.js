/**
 * footer.js
 * Единый футер для всех страниц.
 *
 * Поведение:
 *   - Если на странице есть контейнер #footer-container — футер вставится туда.
 *   - Иначе, если страница входа (body.login-page) — футер вставится внутрь #loginContainer,
 *     сразу под ссылкой «Зарегистрироваться».
 *   - Иначе — в конец <body>.
 *
 * Структура:
 *   - Пункт «❗ Разработчик» — раскрывается по клику.
 *   - «© 2026 УО «ВГАТК». Все права защищены.» — отдельной строкой в самом низу.
 */
(function () {
  'use strict';

  if (window.__footerInjected) return;
  window.__footerInjected = true;

  const STYLE_ID = 'app-footer-styles';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      /* ========== Общий контейнер футера ========== */
      .app-footer {
        margin-top: 24px;
        font: 13px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #6b7280;
      }
      .app-footer--inside-card {
        padding-top: 16px;
        border-top: 1px solid #e5e7eb;
      }
      .app-footer--outside-card {
        padding: 20px 24px;
        background: var(--bg-card, #ffffff);
        border-top: 1px solid var(--border, #e5e7eb);
      }

      /* ========== Пункт «Разработчик» ========== */
      .app-footer__dev {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 8px 4px;
        border-radius: 8px;
        user-select: none;
        transition: background .15s ease, color .15s ease;
        color: #475569;
        font-weight: 500;
      }
      .app-footer__dev:hover {
        background: rgba(59, 130, 246, 0.08);
        color: #1e40af;
      }
      .app-footer__dev-icon {
        font-size: 15px;
        line-height: 1;
        color: #3b82f6;
        flex-shrink: 0;
      }
      .app-footer__dev-text { flex: 1; }
      .app-footer__dev-arrow {
        font-size: 11px;
        color: #94a3b8;
        transition: transform .2s ease;
        flex-shrink: 0;
      }
      .app-footer__dev.is-open .app-footer__dev-arrow {
        transform: rotate(180deg);
      }

      /* ========== Раскрывающийся блок ========== */
      .app-footer__panel {
        max-height: 0;
        overflow: hidden;
        transition: max-height .25s ease, opacity .2s ease, margin .2s ease;
        opacity: 0;
        margin-top: 0;
      }
      .app-footer__panel.is-open {
        max-height: 260px;
        opacity: 1;
        margin-top: 8px;
      }
      .app-footer__panel-inner {
        background: #f8fafc;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 12px 14px;
        font-size: 12.5px;
        line-height: 1.6;
        color: #475569;
      }
      .app-footer__panel-title {
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 6px;
        font-size: 12.5px;
      }
      .app-footer__panel strong { color: #111827; }

      /* ========== Копирайт в самом низу ========== */
      .app-footer__copy {
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px dashed #e5e7eb;
        text-align: center;
        font-size: 12px;
        color: #94a3b8;
      }
    `;
    document.head.appendChild(s);
  }

  function buildFooter() {
    const wrap = document.createElement('footer');
    wrap.className = 'app-footer';
    wrap.innerHTML = `
      <div class="app-footer__dev" role="button" tabindex="0" aria-expanded="false">
        <span class="app-footer__dev-icon">❗</span>
        <span class="app-footer__dev-text">Разработчик</span>
        <span class="app-footer__dev-arrow">▼</span>
      </div>

      <div class="app-footer__panel">
        <div class="app-footer__panel-inner">
          <div class="app-footer__panel-title">Разработчик программного обеспечения</div>
          Государственное учреждение образования<br>
          «Витебский технологический колледж»,<br>
          отделение программного обеспечения,<br>
          <strong>Быков Артём Русланович</strong>
        </div>
      </div>

      <div class="app-footer__copy">
        © 2026 УО «ВГАТК». Все права защищены.
      </div>
    `;

    // Обработчик клика на «Разработчик»
    const devBtn = wrap.querySelector('.app-footer__dev');
    const panel  = wrap.querySelector('.app-footer__panel');

    function toggle() {
      const isOpen = panel.classList.toggle('is-open');
      devBtn.classList.toggle('is-open', isOpen);
      devBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
    devBtn.addEventListener('click', toggle);
    devBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });

    return wrap;
  }

  function inject() {
    injectStyles();
    const footer = buildFooter();

    // 1. Явный контейнер на странице
    const explicit = document.getElementById('footer-container');
    if (explicit) {
      explicit.appendChild(footer);
      return;
    }

    // 2. Страница входа — вставляем внутрь карточки логина
    if (document.body.classList.contains('login-page')) {
      const card = document.getElementById('loginContainer');
      if (card) {
        footer.classList.add('app-footer--inside-card');
        card.appendChild(footer);
        return;
      }
    }

    // 3. Все остальные страницы — в конец <body>
    footer.classList.add('app-footer--outside-card');
    document.body.appendChild(footer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

  console.log('✅ footer.js загружен (Desktop Edition)');
})();