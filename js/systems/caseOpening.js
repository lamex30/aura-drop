/**
 * caseOpening.js
 * ------------------------------------------------------------
 * Логика открытия кейса: взвешенный рандом по rarityWeights конкретного
 * кейса (config/cases.js), затем случайный предмет нужной редкости/
 * категории из config/items.js.
 * ------------------------------------------------------------
 */

import { getCaseById } from '../config/cases.js?v=3';
import { getItemById, getItemsByCategory } from '../config/items.js?v=3';

/**
 * Взвешенный случайный выбор ключа из объекта { key: weight }.
 */
function weightedRandomKey(weightsObj) {
  const entries = Object.entries(weightsObj);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;

  for (const [key, weight] of entries) {
    if (roll < weight) return key;
    roll -= weight;
  }
  // fallback на случай ошибок округления
  return entries[entries.length - 1][0];
}

/**
 * Возвращает полный список предметов, которые может выдать кейс —
 * из явного itemPool (config/cases.js), либо, если он не задан,
 * fallback на все предметы нужных категорий.
 */
export function getCaseItemPool(caseConfig) {
  if (Array.isArray(caseConfig.itemPool) && caseConfig.itemPool.length > 0) {
    return caseConfig.itemPool.map(getItemById).filter(Boolean);
  }
  return caseConfig.categories.flatMap((cat) => getItemsByCategory(cat));
}

/**
 * Открывает кейс по id и возвращает выпавший предмет.
 * @returns {{ item: object, rarityId: string } | null}
 */
export function openCase(caseId) {
  const caseConfig = getCaseById(caseId);
  if (!caseConfig) {
    console.error(`[caseOpening] Кейс "${caseId}" не найден в config/cases.js`);
    return null;
  }

  const rarityId = weightedRandomKey(caseConfig.rarityWeights);
  const pool = getCaseItemPool(caseConfig);
  const candidates = pool.filter((it) => it.rarity === rarityId);

  if (candidates.length === 0) {
    console.error(
      `[caseOpening] Нет предметов редкости "${rarityId}" в пуле кейса "${caseId}" — проверь itemPool/rarityWeights в config/cases.js`
    );
    return null;
  }

  const item = candidates[Math.floor(Math.random() * candidates.length)];

  return { item, rarityId };
}

/**
 * Возвращает список возможных редкостей кейса с их итоговым % шансом —
 * удобно для экрана предпросмотра кейса ("что может выпасть").
 */
export function getCaseOdds(caseId) {
  const caseConfig = getCaseById(caseId);
  if (!caseConfig) return [];

  const total = Object.values(caseConfig.rarityWeights).reduce((s, w) => s + w, 0);

  return Object.entries(caseConfig.rarityWeights).map(([rarityId, weight]) => ({
    rarityId,
    chancePercent: (weight / total) * 100,
  }));
}

/**
 * Возвращает Map<itemId, chancePercent> — индивидуальный % шанса КАЖДОГО
 * конкретного предмета из пула кейса (шанс его редкости, поделённый
 * поровну между всеми предметами этой редкости в пуле — см. openCase()
 * выше, где после выбора редкости предмет внутри неё берётся равновероятно).
 * Используется в превью "что может выпасть" (ui/caseOpeningUI.js).
 */
export function getItemDropChances(caseId) {
  const caseConfig = getCaseById(caseId);
  if (!caseConfig) return new Map();

  const pool = getCaseItemPool(caseConfig);
  const odds = getCaseOdds(caseId);
  const chanceByRarity = new Map(odds.map((o) => [o.rarityId, o.chancePercent]));

  const countByRarity = new Map();
  pool.forEach((item) => {
    countByRarity.set(item.rarity, (countByRarity.get(item.rarity) || 0) + 1);
  });

  const result = new Map();
  pool.forEach((item) => {
    const rarityChance = chanceByRarity.get(item.rarity) || 0;
    const countInRarity = countByRarity.get(item.rarity) || 1;
    result.set(item.id, rarityChance / countInRarity);
  });
  return result;
}
