/**
 * charactersUI.js
 * ------------------------------------------------------------
 * Экран "Персонажи" — полный каталог всех предметов из config/items.js
 * с их редкостью, независимо от того, есть ли они у игрока. Предметы,
 * которых ещё нет в инвентаре, отображаются приглушённо (заблокированы).
 * ------------------------------------------------------------
 */

import { ITEMS } from '../config/items.js?v=3';
import { RARITY_ORDER, getRarity } from '../config/rarities.js?v=3';
import { getInventory, onInventoryChange } from '../systems/inventory.js?v=3';
import { renderVisualHTML } from './visualHelper.js?v=3';
import { openCharacterModal } from './characterModal.js?v=3';
import { getSellPrice } from '../config/rarities.js?v=3';

let els = {};
let activeFilter = 'all';

export function initCharactersUI() {
  els = {
    filterBar: document.getElementById('characters-filter'),
    grid: document.getElementById('characters-grid'),
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
  const ownedIds = new Set(getInventory().map((e) => e.itemId));

  // "Все" смешивает brainrot и horror — оба раздела в config/items.js идут
  // отдельными блоками (каждый растёт от common до mythic сам по себе),
  // так что без явной сортировки самый дешёвый horror-предмет оказывался
  // сразу после самого дорогого brainrot-а. Сортируем по месту редкости в
  // RARITY_ORDER, а внутри одной редкости — по цене продажи (от дешёвых
  // к дорогим), чтобы список шёл ровной лестницей сверху вниз.
  const items = ITEMS
    .filter((it) => activeFilter === 'all' || it.rarity === activeFilter)
    .slice()
    .sort((a, b) => {
      const rarityDiff = RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
      if (rarityDiff !== 0) return rarityDiff;
      return getSellPrice(a) - getSellPrice(b);
    });

  els.grid.innerHTML = '';

  items.forEach((item) => {
    const rarity = getRarity(item.rarity);
    const isOwned = ownedIds.has(item.id);

    const card = document.createElement('div');
    card.className = 'inventory-card big' + (isOwned ? '' : ' locked');
    card.style.borderColor = rarity.color;
  card.style.setProperty('--rarity-color', rarity.color);
    card.innerHTML = `
      <div class="inventory-card-emoji">${renderVisualHTML(item)}</div>
      <div class="inventory-card-name">${item.name}</div>
      <div class="inventory-card-rarity" style="color:${rarity.color}">${rarity.name}</div>
      ${isOwned ? '' : '<div class="inventory-card-lock">LOCKED</div>'}
    `;
    card.addEventListener('click', () => openCharacterModal(item, rarity));
    els.grid.appendChild(card);
  });
}
