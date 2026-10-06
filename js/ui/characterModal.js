/**
 * characterModal.js
 * ------------------------------------------------------------
 * Полноэкранная модалка карточки персонажа — открывается по клику на
 * карточку в каталоге "Персонажи" (ui/charactersUI.js). Показывает
 * крупное изображение (ВСЕГДА в цвете, даже если персонаж ещё не в
 * инвентаре — в отличие от самой карточки каталога, которая для
 * незаблокированных персонажей ч/б через CSS-фильтр), его цену продажи
 * и список кейсов, из которых он может выпасть, с индивидуальным % шанса
 * (getItemDropChances — та же функция, что считает проценты в превью
 * "Содержимое кейса" на экране открытия, см. systems/caseOpening.js) и
 * кнопкой быстрого перехода к этому кейсу.
 *
 * Рендерится в отдельный оверлей #character-modal (index.html, вне #app),
 * тот же паттерн, что и ui/resultModal.js.
 * ------------------------------------------------------------
 */

import { getAllCases } from '../config/cases.js?v=3';
import { getSellPrice } from '../config/rarities.js?v=3';
import { getItemDropChances } from '../systems/caseOpening.js?v=3';
import { setSelectedCase } from './caseOpeningUI.js?v=3';
import { showScreen } from './screens.js?v=3';
import { renderVisualHTML } from './visualHelper.js?v=3';

let overlayEl = null;

function getOverlay() {
  if (!overlayEl) overlayEl = document.getElementById('character-modal');
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

function formatChance(chancePercent) {
  if (chancePercent < 1) return `${chancePercent.toFixed(2)}%`;
  return `${chancePercent.toFixed(1)}%`;
}

/**
 * Собирает список { caseConfig, chancePercent } для всех кейсов, где
 * встречается этот предмет — отсортирован по цене кейса (дешёвые сначала).
 */
function findSources(itemId) {
  const sources = [];
  getAllCases().forEach((caseConfig) => {
    const chance = getItemDropChances(caseConfig.id).get(itemId);
    if (chance != null) {
      sources.push({ caseConfig, chancePercent: chance });
    }
  });
  return sources.sort((a, b) => a.caseConfig.price - b.caseConfig.price);
}

export function openCharacterModal(item, rarity) {
  const el = getOverlay();
  if (!el) return;

  const sources = findSources(item.id);
  const sourcesHTML = sources.length > 0
    ? sources.map(({ caseConfig, chancePercent }) => `
        <div class="char-modal-source-row">
          <div class="char-modal-source-icon">${renderVisualHTML(caseConfig)}</div>
          <div class="char-modal-source-info">
            <div class="char-modal-source-name">${caseConfig.name}</div>
            <div class="char-modal-source-chance">Шанс: ${formatChance(chancePercent)}</div>
          </div>
          <button class="char-modal-source-btn" type="button" data-case-id="${caseConfig.id}">К кейсу</button>
        </div>
      `).join('')
    : '<p class="hint">Этот персонаж пока нигде не выпадает.</p>';

  el.innerHTML = `
    <div class="char-modal-card" style="--rarity-color:${rarity.color}">
      <button class="char-modal-close" type="button" aria-label="Закрыть">✕</button>
      <div class="char-modal-info">
        <div class="char-modal-name">${item.name}</div>
        <div class="char-modal-rarity" style="color:${rarity.color}">${rarity.name}</div>
        <div class="char-modal-price"><span class="coin-icon"></span>${getSellPrice(item)}</div>
        <div class="char-modal-sources-title">Доступен в кейсах</div>
        <div class="char-modal-sources">${sourcesHTML}</div>
      </div>
      <div class="char-modal-visual">${renderVisualHTML(item)}</div>
    </div>
  `;

  el.querySelector('.char-modal-close').addEventListener('click', close);
  el.querySelectorAll('.char-modal-source-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const caseId = btn.dataset.caseId;
      close();
      setSelectedCase(caseId);
      showScreen('caseOpening');
    });
  });

  open(el);
}

function open(el) {
  el.classList.add('visible');
  el.addEventListener('click', onBackdropClick);

  const card = el.querySelector('.char-modal-card');
  if (window.gsap && card) {
    gsap.fromTo(card, { opacity: 0, scale: 0.94, y: 16 }, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.6)' });
  }
}
