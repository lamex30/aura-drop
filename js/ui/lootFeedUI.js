/**
 * lootFeedUI.js
 * ------------------------------------------------------------
 * Рендер ленты живых дропов (systems/lootFeed.js) в боковую панель
 * (десктоп) / горизонтальный тикер (мобильный — переключается чистым CSS,
 * см. .loot-feed в css/style.css). Новые записи вставляются в начало
 * инкрементально (не пересобирают весь список), чтобы плавная
 * анимация появления не запускалась заново на уже показанных карточках.
 * ------------------------------------------------------------
 */

import { getFeed, onFeedChange, initLootFeed } from '../systems/lootFeed.js?v=3';
import { getRarity } from '../config/rarities.js?v=3';
import { renderVisualHTML } from './visualHelper.js?v=3';

let listEl = null;
const renderedIds = new Set();

export function initLootFeedUI() {
  listEl = document.getElementById('loot-feed-list');
  if (!listEl) return;

  onFeedChange(render);
  initLootFeed();
  render(getFeed());
}

function buildRow(entry) {
  const rarity = getRarity(entry.item.rarity);
  const row = document.createElement('div');
  row.className = 'loot-feed-item' + (entry.isReal ? ' real' : '');
  row.style.borderColor = rarity.color;
  row.style.setProperty('--rarity-color', rarity.color);
  row.innerHTML = `
    <div class="loot-feed-icon">${renderVisualHTML(entry.item)}</div>
    <div class="loot-feed-info">
      <div class="loot-feed-user">${entry.username}</div>
      <div class="loot-feed-item-name" style="color:${rarity.color}">${entry.item.name}</div>
    </div>
  `;
  return row;
}

function render(feed) {
  if (!listEl) return;

  // feed отсортирован от новых к старым — собираем префикс записей,
  // которых ещё нет в DOM, затем вставляем их в начало в хронологическом
  // порядке (от старой к новой из этой пачки), чтобы итоговый порядок
  // в DOM совпал с порядком в feed.
  const newOnes = [];
  for (const entry of feed) {
    if (renderedIds.has(entry.id)) break;
    newOnes.push(entry);
  }

  newOnes.reverse().forEach((entry) => {
    const row = buildRow(entry);
    listEl.insertBefore(row, listEl.firstChild);
    renderedIds.add(entry.id);
    requestAnimationFrame(() => row.classList.add('show'));
  });

  while (listEl.children.length > feed.length) {
    listEl.removeChild(listEl.lastChild);
  }
}
