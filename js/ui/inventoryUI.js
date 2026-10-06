/**
 * inventoryUI.js
 * ------------------------------------------------------------
 * Сетка предметов игрока с фильтром по редкости. Карточки — крупные
 * миниатюры без постоянных кнопок; клик по карточке раскрывает панель
 * действий ("Апгрейд" ведёт на колесо апгрейда с предзаполненным
 * предметом, "Продать" — начисляет монеты и удаляет предмет).
 * ------------------------------------------------------------
 */

import { getInventory, onInventoryChange, sellItem, getInventoryItemSellPrice } from '../systems/inventory.js?v=3';
import { RARITY_ORDER, getRarity } from '../config/rarities.js?v=3';
import { presetSourceAndGo } from './wheelUI.js?v=3';
import { renderVisualHTML } from './visualHelper.js?v=3';

let els = {};
let activeFilter = 'all';
let expandedUid = null;

export function initInventoryUI() {
  els = {
    filterBar: document.getElementById('inventory-filter'),
    grid: document.getElementById('inventory-grid'),
    empty: document.getElementById('inventory-empty'),
  };

  renderFilterBar();
  onInventoryChange(() => render());
  render();
}

function renderFilterBar() {
  const options = [{ id: 'all', name: 'Все', color: '#ffffff' }, ...RARITY_ORDER.map((id) => getRarity(id))];

  els.filterBar.innerHTML = '';
  options.forEach((rarity) => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = rarity.name;
    btn.style.borderColor = rarity.color;
    btn.dataset.rarity = rarity.id;
    if (rarity.id === activeFilter) btn.classList.add('active');

    btn.addEventListener('click', () => {
      activeFilter = rarity.id;
      els.filterBar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });

    els.filterBar.appendChild(btn);
  });
}

export function render() {
  const inventory = getInventory().filter(
    (entry) => activeFilter === 'all' || entry.item?.rarity === activeFilter
  );

  els.grid.innerHTML = '';
  els.empty.style.display = inventory.length === 0 ? 'block' : 'none';

  inventory.forEach((entry) => {
    if (!entry.item) return;
    const rarity = getRarity(entry.item.rarity);
    const sellPrice = getInventoryItemSellPrice(entry.uid);
    const isExpanded = entry.uid === expandedUid;

    const card = document.createElement('div');
    card.className = 'inventory-card big' + (isExpanded ? ' expanded' : '');
    card.style.borderColor = rarity.color;
  card.style.setProperty('--rarity-color', rarity.color);
    card.dataset.uid = entry.uid;
    card.innerHTML = `
      <div class="inventory-card-main">
        <div class="inventory-card-emoji">${renderVisualHTML(entry.item)}</div>
        <div class="inventory-card-name">${entry.item.name}</div>
        <div class="inventory-card-rarity" style="color:${rarity.color}">${rarity.name}</div>
      </div>
      <div class="inventory-card-actions">
        <button class="action-btn upgrade-btn" type="button">Апгрейд</button>
        <button class="action-btn sell-btn" type="button">Продать за <span class="coin-icon"></span>${sellPrice}</button>
      </div>
    `;

    card.addEventListener('click', () => {
      expandedUid = expandedUid === entry.uid ? null : entry.uid;
      render();
    });

    card.querySelector('.upgrade-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      expandedUid = null;
      presetSourceAndGo(entry.uid);
    });

    card.querySelector('.sell-btn').addEventListener('click', (e) => {
      // Не используем window.confirm() — в песочнице Yandex Games
      // (сайт открыт в iframe) блокирующие нативные диалоги
      // confirm()/alert() часто отключены политикой sandbox, и кнопка
      // выглядела как нерабочая (клик ничего не делал). Карточку и так
      // нужно сначала раскрыть кликом, поэтому доп. подтверждение не
      // критично — продаём сразу.
      e.stopPropagation();
      expandedUid = null;
      sellItem(entry.uid);
    });

    els.grid.appendChild(card);
  });
}
