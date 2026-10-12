/**
 * notifications.js
 * Единый модуль уведомлений для всего приложения.
 * Использование:
 *   Notify.success('Сохранено');
 *   await Notify.confirm('Удалить?', 'Данные нельзя восстановить');
 *   const l = Notify.loading('Загрузка...'); ... l.close();
 *
 * Ни от чего не зависит. Стили инжектятся автоматически.
 */
(function () {
  'use strict';

  if (window.Notify) return; // защита от повторной загрузки

  const MAX_TOASTS = 5;
  const DEFAULT_DURATION = 4000;

  /* ============ СТИЛИ ============ */
  const STYLE_ID = 'notify-styles';
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .notify-stack {
        position: fixed; right: 20px; bottom: 20px;
        display: flex; flex-direction: column; gap: 10px;
        z-index: 99999; pointer-events: none;
        max-width: 380px;
      }
      .notify-toast {
        pointer-events: auto;
        display: flex; align-items: flex-start; gap: 10px;
        padding: 12px 14px;
        border-radius: 10px;
        background: #fff;
        color: #1f2937;
        box-shadow: 0 8px 24px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.06);
        border-left: 4px solid #6b7280;
        font: 14px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        transform: translateX(120%);
        opacity: 0;
        transition: transform .25s ease, opacity .25s ease;
        position: relative;
        min-width: 260px;
      }
      .notify-toast.is-visible { transform: translateX(0); opacity: 1; }
      .notify-toast.is-hiding  { transform: translateX(120%); opacity: 0; }
      .notify-toast__icon { font-size: 18px; line-height: 1; flex-shrink: 0; margin-top: 1px; }
      .notify-toast__body { flex: 1; word-break: break-word; }
      .notify-toast__close {
        background: none; border: none; cursor: pointer;
        color: #9ca3af; font-size: 16px; line-height: 1; padding: 0 2px;
        margin-left: 4px; flex-shrink: 0;
      }
      .notify-toast__close:hover { color: #374151; }

      .notify-toast--success { border-left-color: #10b981; }
      .notify-toast--success .notify-toast__icon { color: #10b981; }
      .notify-toast--error   { border-left-color: #ef4444; }
      .notify-toast--error   .notify-toast__icon { color: #ef4444; }
      .notify-toast--warning { border-left-color: #f59e0b; }
      .notify-toast--warning .notify-toast__icon { color: #f59e0b; }
      .notify-toast--info    { border-left-color: #3b82f6; }
      .notify-toast--info    .notify-toast__icon { color: #3b82f6; }

      .notify-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,.45);
        display: flex; align-items: center; justify-content: center;
        z-index: 100000; opacity: 0; transition: opacity .2s ease;
      }
      .notify-overlay.is-visible { opacity: 1; }
      .notify-modal {
        background: #fff; border-radius: 12px; padding: 22px 22px 18px;
        max-width: 440px; width: calc(100% - 40px);
        box-shadow: 0 20px 60px rgba(0,0,0,.3);
        transform: scale(.95); transition: transform .2s ease;
        font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .notify-overlay.is-visible .notify-modal { transform: scale(1); }
      .notify-modal__title { font-size: 17px; font-weight: 600; margin: 0 0 8px; color: #111827; }
      .notify-modal__message { color: #4b5563; margin: 0 0 18px; white-space: pre-wrap; }
      .notify-modal__actions { display: flex; gap: 10px; justify-content: flex-end; }
      .notify-btn {
        padding: 8px 16px; border-radius: 8px; font-size: 14px; cursor: pointer;
        border: 1px solid transparent; font-family: inherit; transition: .15s;
      }
      .notify-btn--ghost { background: #f3f4f6; color: #374151; border-color: #e5e7eb; }
      .notify-btn--ghost:hover { background: #e5e7eb; }
      .notify-btn--danger { background: #ef4444; color: #fff; }
      .notify-btn--danger:hover { background: #dc2626; }
      .notify-btn--primary { background: #3b82f6; color: #fff; }
      .notify-btn--primary:hover { background: #2563eb; }

      .notify-loader {
        position: fixed; inset: 0; background: rgba(255,255,255,.7);
        display: flex; align-items: center; justify-content: center;
        z-index: 100001; flex-direction: column; gap: 12px;
      }
      .notify-loader__spinner {
        width: 36px; height: 36px; border-radius: 50%;
        border: 3px solid #e5e7eb; border-top-color: #3b82f6;
        animation: notify-spin .8s linear infinite;
      }
      .notify-loader__text { color: #374151; font-size: 14px; }
      @keyframes notify-spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
  }

  /* ============ СТЕК ТОСТОВ ============ */
  let stackEl = null;
  function getStack() {
    if (stackEl && document.body.contains(stackEl)) return stackEl;
    stackEl = document.createElement('div');
    stackEl.className = 'notify-stack';
    document.body.appendChild(stackEl);
    return stackEl;
  }

  const ICONS = { success: '✔', error: '✖', warning: '⚠', info: 'ℹ' };

  function showToast(type, message, duration) {
    injectStyles();
    const stack = getStack();
    while (stack.children.length >= MAX_TOASTS) stack.removeChild(stack.firstChild);

    const toast = document.createElement('div');
    toast.className = `notify-toast notify-toast--${type}`;
    toast.innerHTML = `
      <span class="notify-toast__icon">${ICONS[type] || 'ℹ'}</span>
      <div class="notify-toast__body"></div>
      <button class="notify-toast__close" aria-label="Закрыть">✕</button>
    `;
    toast.querySelector('.notify-toast__body').textContent = String(message);
    stack.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('is-visible'));

    let timer = null;
    const close = () => {
      if (timer) clearTimeout(timer);
      toast.classList.remove('is-visible');
      toast.classList.add('is-hiding');
      setTimeout(() => toast.remove(), 250);
    };
    toast.querySelector('.notify-toast__close').addEventListener('click', close);
    timer = setTimeout(close, duration || DEFAULT_DURATION);
    return close;
  }

  /* ============ CONFIRM ============ */
  function confirmDialog(title, message, options) {
    injectStyles();
    options = options || {};
    const okText = options.okText || 'ОК';
    const cancelText = options.cancelText || 'Отмена';
    const danger = !!options.danger;

    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'notify-overlay';
      overlay.innerHTML = `
        <div class="notify-modal" role="dialog" aria-modal="true">
          <h3 class="notify-modal__title"></h3>
          <p class="notify-modal__message"></p>
          <div class="notify-modal__actions">
            <button class="notify-btn notify-btn--ghost" data-act="cancel"></button>
            <button class="notify-btn ${danger ? 'notify-btn--danger' : 'notify-btn--primary'}" data-act="ok"></button>
          </div>
        </div>
      `;
      overlay.querySelector('.notify-modal__title').textContent = title || 'Подтверждение';
      overlay.querySelector('.notify-modal__message').textContent = message || '';
      overlay.querySelector('[data-act="cancel"]').textContent = cancelText;
      overlay.querySelector('[data-act="ok"]').textContent = okText;
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add('is-visible'));

      const finish = (val) => {
        overlay.classList.remove('is-visible');
        setTimeout(() => overlay.remove(), 200);
        document.removeEventListener('keydown', onKey);
        resolve(val);
      };
      const onKey = (e) => {
        if (e.key === 'Escape') finish(false);
        if (e.key === 'Enter')  finish(true);
      };
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) finish(false);
        const act = e.target.getAttribute && e.target.getAttribute('data-act');
        if (act === 'ok') finish(true);
        if (act === 'cancel') finish(false);
      });
      document.addEventListener('keydown', onKey);
      setTimeout(() => overlay.querySelector('[data-act="ok"]').focus(), 50);
    });
  }

  /* ============ LOADING ============ */
  function showLoading(text) {
    injectStyles();
    const el = document.createElement('div');
    el.className = 'notify-loader';
    el.innerHTML = `
      <div class="notify-loader__spinner"></div>
      <div class="notify-loader__text"></div>
    `;
    el.querySelector('.notify-loader__text').textContent = text || 'Загрузка...';
    document.body.appendChild(el);
    return {
      close() { if (el.parentNode) el.remove(); },
      setText(t) { el.querySelector('.notify-loader__text').textContent = t; }
    };
  }

  /* ============ COPY ============ */
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed'; ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showToast('success', 'Скопировано в буфер обмена');
      return true;
    } catch (e) {
      showToast('error', 'Не удалось скопировать');
      return false;
    }
  }

  /* ============ ЭКСПОРТ ============ */
  window.Notify = {
    success: (m, d) => showToast('success', m, d),
    error:   (m, d) => showToast('error',   m, d),
    warning: (m, d) => showToast('warning', m, d),
    info:    (m, d) => showToast('info',    m, d),
    confirm: confirmDialog,
    loading: showLoading,
    copy:    copyText
  };

  // алиас для обратной совместимости с существующим кодом
  window.vgatk = window.vgatk || {};
  window.vgatk.showToast = (msg, type) => showToast(type || 'info', msg);

  console.log('✅ notifications.js загружен (Desktop Edition)');
})();