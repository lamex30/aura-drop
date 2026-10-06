/**
 * inventory.js
 * ------------------------------------------------------------
 * Хранение предметов игрока + единая точка сохранения/загрузки прогресса
 * (баланс монет + инвентарь) через yandexSDK.js (Player Data API с
 * fallback на localStorage).
 *
 * Предмет в инвентаре хранится как { uid, itemId }, где uid — уникальный
 * экземпляр (чтобы можно было иметь несколько копий одного и того же
 * предмета и апгрейдить/продавать их по отдельности).
 * ------------------------------------------------------------
 */

import { getItemById } from '../config/items.js?v=3';
import { getSellPrice } from '../config/rarities.js?v=3';
import { serializeCurrency, hydrateCurrency, addCoins } from './currency.js?v=3';
import { savePlayerData, loadPlayerData } from './yandexSDK.js?v=3';

let items = []; // [{ uid, itemId }]
let uidCounter = 1;

const listeners = new Set();

export function getInventory() {
  return items.map((entry) => ({
    ...entry,
    item: getItemById(entry.itemId),
  }));
}

export function addItemToInventory(itemId) {
  const entry = { uid: `inv_${uidCounter++}_${Date.now()}`, itemId };
  items.push(entry);
  notify();
  return entry;
}

export function removeItemByUid(uid) {
  const idx = items.findIndex((e) => e.uid === uid);
  if (idx === -1) return null;
  const [removed] = items.splice(idx, 1);
  notify();
  return removed;
}

export function getInventoryEntry(uid) {
  return items.find((e) => e.uid === uid) || null;
}

/**
 * Возвращает цену продажи предмета в инвентаре (в монетах), не продавая его.
 * Используется UI для отображения цены на кнопке "Продать".
 */
export function getInventoryItemSellPrice(uid) {
  const entry = getInventoryEntry(uid);
  if (!entry) return 0;
  const item = getItemById(entry.itemId);
  return item ? getSellPrice(item) : 0;
}

/**
 * Продаёт предмет из инвентаря: удаляет его и начисляет монеты
 * (см. config/rarities.js -> getSellPrice()).
 * @returns {number} количество полученных монет (0, если предмет не найден)
 */
export function sellItem(uid) {
  const removed = removeItemByUid(uid);
  if (!removed) return 0;

  const item = getItemById(removed.itemId);
  const price = item ? getSellPrice(item.rarity) : 0;

  addCoins(price);
  requestSaveProgress();
  return price;
}

export function onInventoryChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify() {
  listeners.forEach((cb) => cb(getInventory()));
}

// --- Сохранение / загрузка всего прогресса игрока ---

let saveTimer = null;

/**
 * Дебаунсим сохранение, чтобы не спамить Player Data API при частых изменениях.
 */
export function requestSaveProgress() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveProgressNow, 600);
}

export async function saveProgressNow() {
  const payload = {
    version: 1,
    currency: serializeCurrency(),
    inventory: items,
    uidCounter,
    savedAt: Date.now(),
  };
  await savePlayerData(payload);
}

export async function loadProgress() {
  const data = await loadPlayerData();

  if (!data) {
    hydrateCurrency(null);
    items = [];
    uidCounter = 1;
    notify();
    return;
  }

  hydrateCurrency(data.currency);
  items = Array.isArray(data.inventory) ? data.inventory : [];
  uidCounter = typeof data.uidCounter === 'number' ? data.uidCounter : items.length + 1;
  notify();
}

// Подписываемся на изменения баланса, чтобы автосохраняться и по монетам тоже.
export function attachAutoSave(currencyOnBalanceChange) {
  currencyOnBalanceChange(() => requestSaveProgress());
}
