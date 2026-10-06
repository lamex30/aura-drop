/**
 * casesUI.js
 * ------------------------------------------------------------
 * Экран "Кейсы" — сетка всех доступных кейсов (config/cases.js).
 * Клик по карточке выбирает кейс и переводит на экран открытия.
 * ------------------------------------------------------------
 */

import { getAllCases } from '../config/cases.js?v=3';
import { setSelectedCase } from './caseOpeningUI.js?v=3';
import { showScreen } from './screens.js?v=3';
import { renderVisualHTML } from './visualHelper.js?v=3';

let els = {};

export function initCasesUI() {
  els = {
    grid: document.getElementById('cases-grid'),
  };
  render();
}

export function render() {
  els.grid.innerHTML = '';

  getAllCases().forEach((c) => {
    const card = document.createElement('div');
    card.className = 'case-card';
    card.innerHTML = `
      ${c.adFree ? '<div class="case-card-ad-badge" title="Доступен бесплатно за рекламу">AD</div>' : ''}
      <div class="case-card-image">${renderVisualHTML(c)}</div>
      <div class="case-card-body">
        <div class="case-card-name">${c.name}</div>
        <div class="case-card-count">${c.itemPool.length} предметов</div>
        <div class="case-card-price"><span class="coin-icon"></span>${c.price}</div>
      </div>
    `;
    card.addEventListener('click', () => {
      setSelectedCase(c.id);
      showScreen('caseOpening');
    });
    els.grid.appendChild(card);
  });
}
