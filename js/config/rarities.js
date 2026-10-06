/**
 * RARITIES CONFIG
 * ------------------------------------------------------------
 * Единая таблица редкостей. Меняй здесь цвет, вес (шанс) и т.д.
 * "weight" — относительный вес в взвешенном рандоме (не проценты!).
 * Итоговый шанс редкости = weight / (сумма всех weight в конкретном кейсе).
 * Конкретные кейсы (config/cases.js) могут переопределять набор
 * доступных редкостей и их веса под себя — здесь только "мастер"-список.
 *
 * value — БАЗОВАЯ условная "ценность" редкости для КОЛЕСА АПГРЕЙДА
 * (systems/upgradeWheel.js — чем больше разрыв в ценности source/target,
 * тем ниже шанс апгрейда). НЕ используется для цены продажи — см. sellValue.
 *
 * sellValue — ОТДЕЛЬНАЯ шкала специально для getSellPrice() ниже, подобранная
 * так, чтобы топовая редкость, реально выпадающая из кейса, при продаже
 * примерно окупала цену ТОГО КЕЙСА, где она — потолок (см. config/cases.js,
 * тирная система): uncommon ≈ потолок тира 1 (65), epic ≈ потолок тира 2
 * (160), legendary ≈ потолок тира 3 (380), mythic ≈ потолок тира 4 (1200).
 * Специально ОТДЕЛЕНА от value: если бы окупаемость считалась через ту же
 * шкалу, что и шанс апгрейда, пришлось бы либо ломать баланс колеса, либо
 * оставлять кейсы невыгодными — раньше даже удачный дорогой дроп почти
 * никогда не окупал цену кейса, из которого он выпал.
 * ------------------------------------------------------------
 */

// adBonus — на сколько % повышается шанс апгрейда за rewarded-рекламу в
// ui/wheelUI.js, В ЗАВИСИМОСТИ ОТ РЕДКОСТИ ЦЕЛИ апгрейда (не источника!).
// Специально убывает по мере роста редкости: реклама заметно помогает
// на дешёвых, частых апгрейдах и почти не влияет на топовые — иначе
// игрок мог бы рекламой же выбивать мифики с высокой вероятностью,
// обесценивая их редкость.
export const RARITIES = {
  common: {
    id: 'common',
    name: 'Обычный',
    color: '#b0b0b0',
    weight: 500,
    value: 1,
    sellValue: 1.5,
    adBonus: 25, // практически не используется — на common никто не апгрейдит
  },
  uncommon: {
    id: 'uncommon',
    name: 'Необычный',
    color: '#4caf50',
    weight: 250,
    value: 2,
    sellValue: 6.5,
    adBonus: 20,
  },
  rare: {
    id: 'rare',
    name: 'Редкий',
    color: '#2196f3',
    weight: 120,
    value: 5,
    sellValue: 10,
    adBonus: 15,
  },
  epic: {
    id: 'epic',
    name: 'Эпический',
    color: '#9c27b0',
    weight: 50,
    value: 12,
    sellValue: 16,
    adBonus: 10,
  },
  legendary: {
    id: 'legendary',
    name: 'Легендарный',
    color: '#ff9800',
    weight: 15,
    value: 30,
    sellValue: 38,
    adBonus: 6,
  },
  mythic: {
    id: 'mythic',
    name: 'Мифический',
    color: '#f44336',
    weight: 4,
    value: 80,
    sellValue: 120,
    adBonus: 3,
  },
  // infinite — единственная редкость выше mythic, и единственная, у
  // которой во всей игре есть РОВНО ОДИН предмет (см. items.js ->
  // 'infinite_aura'). weight здесь почти не используется (в кейсах
  // задаётся отдельно, см. cases.js -> ultra_mythic), но нужен для
  // единообразия структуры. sellValue подобрано так, чтобы getSellPrice()
  // этого предмета (см. ниже) выходил ровно на 10 000 монет.
  infinite: {
    id: 'infinite',
    name: 'Бесконечный',
    color: '#ff2ee0',
    weight: 1,
    value: 1000,
    sellValue: 1000,
    adBonus: 1, // символический — апгрейд на эту редкость и так у пола шанса
  },
  // TODO(баланс): категория horror будет иметь свои, более высокие по "ценности"
  // редкости (например "cursed", "nightmare") — добавить сюда позже вместе
  // с отдельными весами для horror-кейсов.
};

// Порядок редкостей от худшей к лучшей — используется для сортировки UI
// и для определения "соседней сверху" редкости в колесе апгрейда.
export const RARITY_ORDER = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
  'mythic',
  'infinite',
];

export function getRarity(id) {
  return RARITIES[id] || null;
}

export function getNextRarity(id) {
  const idx = RARITY_ORDER.indexOf(id);
  if (idx === -1 || idx === RARITY_ORDER.length - 1) return null;
  return RARITY_ORDER[idx + 1];
}

/**
 * "Истинная ценность" конкретного предмета: value редкости, умноженный
 * на личный множитель предмета (config/items.js -> item.value, 0.7-1.3 —
 * персонажи одной редкости не равноценны, один чуть лучше/хуже другого).
 * Единая точка правды для ВСЕГО, что должно зависеть от "силы" предмета —
 * и цены продажи (getSellPrice), и шанса апгрейда (systems/upgradeWheel.js),
 * чтобы они всегда были согласованы друг с другом.
 *
 * Принимает либо целый предмет (учитывается его личный множитель), либо
 * просто id редкости строкой (тогда множитель = 1 — "базовая" ценность
 * редкости без привязки к конкретному предмету, для мест в UI, где под
 * рукой нет самого предмета).
 */
export function getItemValue(itemOrRarityId) {
  const isItem = typeof itemOrRarityId === 'object' && itemOrRarityId !== null;
  const rarityId = isItem ? itemOrRarityId.rarity : itemOrRarityId;
  const itemValueMultiplier = isItem && typeof itemOrRarityId.value === 'number' ? itemOrRarityId.value : 1;

  const rarity = getRarity(rarityId);
  return rarity ? rarity.value * itemValueMultiplier : 0;
}

// Сколько монет игрок получает за 1 очко sellValue редкости (см. ниже)
// при продаже из инвентаря (systems/inventory.js -> sellItem()).
export const SELL_PRICE_MULTIPLIER = 10;

/**
 * "Продажная ценность" предмета — параллель к getItemValue(), но по
 * отдельной шкале sellValue (см. комментарий у RARITIES выше), не влияющей
 * на шанс апгрейда. Принимает то же самое, что и getItemValue() (целый
 * предмет или просто id редкости строкой).
 */
export function getSellValue(itemOrRarityId) {
  const isItem = typeof itemOrRarityId === 'object' && itemOrRarityId !== null;
  const rarityId = isItem ? itemOrRarityId.rarity : itemOrRarityId;
  const itemValueMultiplier = isItem && typeof itemOrRarityId.value === 'number' ? itemOrRarityId.value : 1;

  const rarity = getRarity(rarityId);
  return rarity ? rarity.sellValue * itemValueMultiplier : 0;
}

/**
 * Цена продажи предмета — принимает то же самое, что и getItemValue()
 * (целый предмет или просто id редкости строкой).
 */
export function getSellPrice(itemOrRarityId) {
  return Math.round(getSellValue(itemOrRarityId) * SELL_PRICE_MULTIPLIER);
}

/**
 * Бонус за рекламу (в %) для апгрейда НА эту редкость (см. adBonus выше).
 */
export function getAdBonus(rarityId) {
  const rarity = getRarity(rarityId);
  return rarity ? rarity.adBonus : 0;
}
