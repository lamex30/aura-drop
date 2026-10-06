/**
 * lootFeed.js
 * ------------------------------------------------------------
 * Глобальная лента "живых" дропов (полоса слева на десктопе / тикер
 * сверху на мобильном) — создаёт ощущение активного онлайна. Настоящие
 * дропы игрока попадают в неё мгновенно через pushRealDrop() (см.
 * ui/caseOpeningUI.js), а в промежутках генерируются фейковые записи со
 * случайными "игроками" и предметами через случайные интервалы, чтобы не
 * выглядело механически.
 * ------------------------------------------------------------
 */

import { ITEMS } from '../config/items.js?v=3';

// Веса редкостей СПЕЦИАЛЬНО ДЛЯ ЭТОЙ ЛЕНТЫ — не те же самые, что реальные
// шансы кейсов в config/rarities.js! Настоящие веса (500/250/120/50/15/4/1)
// делают ленту почти сплошь серо-зелёной — по фидбеку в ней должно быть
// заметно больше ярких редкостей (фиолетовый epic, оранжевый legendary,
// красный mythic), не в ущерб обычным дропам — те тоже остаются, просто
// уже не подавляют всё остальное. Это чисто атмосферная лента ("создаёт
// ощущение активного онлайна"), она не связана с реальной экономикой
// кейсов — раздувать её в сторону эффектных дропов совершенно безопасно.
const FEED_RARITY_WEIGHTS = {
  common: 28,
  uncommon: 24,
  rare: 20,
  epic: 15,
  legendary: 8,
  mythic: 4,
  infinite: 1,
};

const FAKE_NAMES = [
  'Толя228', 'xX_Sigma_Xx', 'ГигаЧад1337', 'СкибидиФанат', 'rizzler_pro',
  'НикитаОнлайн', 'brainrotKing', 'ДимонБустер', 'ТралалелоФан', 'sasha_gg',
  'ОгайоБой', 'ЗаМамонта', 'kirill_sigma', 'ГойдаМастер', 'nastya_uwu',
  'ПацанСХрущёвки', 'РизЛорд', 'vovka_pro100', 'МаксБрейнрот', 'yaroslav_w',
  'ТемныйЛорд', 'ПодписчикБаги', 'egor_rizz', 'КотёнокМяу', 'FarmerAlex',
  'ДропХантер', 'liza_gacha', 'СигмаБой2011', 'roma_skibidi', 'АураФармер',
];

// Случайный интервал между фейковыми дропами (мс) — специально широкий
// разброс, чтобы тики не выглядели как таймер по расписанию.
const MIN_DELAY = 2200;
const MAX_DELAY = 9000;
const MAX_FEED_LENGTH = 40;

let feed = [];
const listeners = new Set();
let timerId = null;
let seq = 1;

// Предметы сгруппированы по редкости один раз (не на каждый тик) —
// ITEMS не меняется в рантайме, пересчитывать группировку незачем.
const ITEMS_BY_RARITY = ITEMS.reduce((map, it) => {
  (map[it.rarity] ||= []).push(it);
  return map;
}, {});

/**
 * Взвешенный случайный выбор предмета: сначала редкость по FEED_RARITY_WEIGHTS
 * (см. выше — веса ленты, а не реальные шансы кейсов), затем случайный
 * предмет этой редкости среди всех brainrot+horror с такой редкостью.
 */
function weightedRandomItem() {
  const entries = Object.entries(FEED_RARITY_WEIGHTS).filter(([rarityId]) => ITEMS_BY_RARITY[rarityId]?.length);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [rarityId, weight] of entries) {
    r -= weight;
    if (r <= 0) {
      const pool = ITEMS_BY_RARITY[rarityId];
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }
  return ITEMS[ITEMS.length - 1];
}

function randomName() {
  return FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
}

function pushEntry(entry) {
  feed.unshift({ id: seq++, ts: Date.now(), ...entry });
  if (feed.length > MAX_FEED_LENGTH) feed.length = MAX_FEED_LENGTH;
  listeners.forEach((cb) => cb(feed));
}

/**
 * Вызывается при реальном открытии кейса игроком (ui/caseOpeningUI.js) —
 * попадает в ленту мгновенно, помечена isReal (другой стиль в UI).
 */
export function pushRealDrop(item) {
  pushEntry({ username: 'Вы', item, isReal: true });
}

function scheduleNextFakeTick() {
  const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
  timerId = setTimeout(() => {
    pushEntry({ username: randomName(), item: weightedRandomItem(), isReal: false });
    scheduleNextFakeTick();
  }, delay);
}

export function initLootFeed() {
  if (timerId) return; // защита от повторной инициализации
  scheduleNextFakeTick();
}

export function getFeed() {
  return feed;
}

export function onFeedChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
