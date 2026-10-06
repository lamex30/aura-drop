/**
 * resultModal.js
 * ------------------------------------------------------------
 * Полноэкранная модалка результата — общая для открытия кейса (всегда
 * "удача": выпал новый предмет) и колеса апгрейда (удача/провал).
 * Рендерится в единый контейнер #result-modal (index.html, вне #app),
 * чтобы перекрывать весь экран поверх любого текущего экрана.
 * ------------------------------------------------------------
 */

import { renderVisualHTML } from './visualHelper.js?v=3';

let overlayEl = null;

function getOverlay() {
  if (!overlayEl) overlayEl = document.getElementById('result-modal');
  return overlayEl;
}

function onBackdropClick(e) {
  if (e.target === overlayEl) close();
}

function close() {
  if (!overlayEl) return;
  overlayEl.classList.remove('visible');
  overlayEl.removeEventListener('click', onBackdropClick);
  window.setTimeout(() => {
    overlayEl.innerHTML = '';
  }, 250);
}

/**
 * Модалка удачи: выпал/получен предмет. Три действия — продать,
 * отправить в апгрейд или просто сохранить его в инвентаре (закрыть).
 * Предмет к этому моменту уже должен быть добавлен в инвентарь вызывающей
 * стороной — "Сохранить" ничего не мутирует, только закрывает модалку.
 */
export function showWinModal(item, rarity, { sellPrice, onSell, onUpgrade, onClose, label } = {}) {
  const el = getOverlay();
  if (!el) return;

  el.innerHTML = `
    <div class="result-modal-card win" style="--rarity-color:${rarity.color}">
      <div class="result-modal-label">${label || 'Новый предмет'}</div>
      <div class="result-modal-icon">${renderVisualHTML(item)}</div>
      <div class="result-modal-name">${item.name}</div>
      <div class="result-modal-rarity" style="color:${rarity.color}">${rarity.name}</div>
      <div class="result-modal-actions">
        <button class="modal-action-btn sell-action" type="button">Продать<span class="modal-action-sub"><span class="coin-icon"></span>${sellPrice ?? 0}</span></button>
        <button class="modal-action-btn upgrade-action" type="button">Апгрейд</button>
        <button class="modal-action-btn keep-action primary" type="button">Сохранить</button>
      </div>
    </div>
  `;

  el.querySelector('.sell-action').addEventListener('click', () => {
    close();
    onSell?.();
  });
  el.querySelector('.upgrade-action').addEventListener('click', () => {
    close();
    onUpgrade?.();
  });
  el.querySelector('.keep-action').addEventListener('click', () => {
    close();
    onClose?.();
  });

  open(el);
}

/**
 * Модалка провала — используется колесом апгрейда, когда предмет сгорел.
 */
export function showFailModal(text, { onClose } = {}) {
  const el = getOverlay();
  if (!el) return;

  el.innerHTML = `
    <div class="result-modal-card fail">
      <div class="result-modal-label">Провал</div>
      <div class="result-modal-fail-mark">✕</div>
      <div class="result-modal-name">${text}</div>
      <div class="result-modal-actions single">
        <button class="modal-action-btn keep-action primary" type="button">Понятно</button>
      </div>
    </div>
  `;

  el.querySelector('.keep-action').addEventListener('click', () => {
    close();
    onClose?.();
  });

  open(el);
}

function open(el) {
  el.classList.add('visible');
  el.addEventListener('click', onBackdropClick);

  const card = el.querySelector('.result-modal-card');
  if (window.gsap && card) {
    gsap.fromTo(card, { opacity: 0, scale: 0.9, y: 16 }, { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.6)' });
    const icon = card.querySelector('.result-modal-icon');
    if (icon) {
      gsap.to(icon, { scale: 1.08, duration: 0.9, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }
  }
}
