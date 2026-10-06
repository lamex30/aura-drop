/**
 * CASES CONFIG
 * ------------------------------------------------------------
 * Конфиг кейсов. Каждый кейс задаёт:
 *  id          — уникальный идентификатор
 *  name        — отображаемое название
 *  price       — цена в монетах
 *  emoji       — fallback-иконка (эмодзи), если sprite не задан/не загрузился
 *  sprite      — путь к PNG-иконке кейса (assets/icons/, см. ART_NEEDED.md
 *                и ui/visualHelper.js -> renderVisualHTML())
 *  categories  — какие категории предметов (config/items.js) может выдать
 *                (используется как fallback, если не задан itemPool)
 *  itemPool    — ЯВНЫЙ список id предметов (config/items.js), которые
 *                может выдать именно этот кейс.
 *  rarityWeights — веса редкостей ТОЛЬКО для этого кейса (id редкости ->
 *                  вес). Если редкости нет в этом объекте, она НЕ МОЖЕТ
 *                  выпасть из кейса.
 *  adFree        — необязательный boolean. true — кейс можно открыть
 *                  бесплатно за просмотр rewarded-рекламы (кнопка
 *                  "Бесплатный кейс" в ui/caseOpeningUI.js). Стоит
 *                  ТОЛЬКО у самых дешёвых кейсов (тир 1) — иначе не было
 *                  бы смысла покупать/копить монеты на дорогие кейсы:
 *                  зачем платить за лучший кейс, если за ту же рекламу
 *                  можно взять его же бесплатно. Если поле не задано —
 *                  кейс считается НЕ доступным за рекламу.
 *
 * ------------------------------------------------------------
 * ЭКОНОМИКА РЕДКОСТЕЙ ПО ТИРАМ — "пол" редкости строго растёт с ценой:
 *
 *   Тир 1 (15-65,   adFree):  common, uncommon                — НЕТ rare+
 *   Тир 2 (70-160):           uncommon, rare, epic (+ капля legendary
 *                              только у самого дорогого кейса тира)  — НЕТ common
 *   Тир 3 (200-380):          rare, epic, legendary (+ капля mythic
 *                              только у самого дорогого кейса тира)  — НЕТ common/uncommon
 *   Тир 4 (450-1200):         epic, legendary, mythic                — НЕТ common/uncommon/rare
 *
 * Ключевое правило: itemPool каждого кейса собирается ИСКЛЮЧИТЕЛЬНО из
 * BRAINROT_x / HORROR_x констант (config/items.js) тех редкостей, что
 * реально перечислены в его rarityWeights — ни разу не вручную по id, и
 * ни разу не "весь ростер" — именно поэтому предмет за 10-20 монет
 * физически не может выпасть из кейса за 1200: его редкости просто нет
 * в rarityWeights этого кейса, и, соответственно, нет и в itemPool.
 * Внутри тира кейсы дифференцируются формой кривой весов (чем дороже —
 * тем больше вес смещён к верхней границе тира), а не составом пула.
 * ------------------------------------------------------------
 */

import {
  BRAINROT_COMMON, BRAINROT_UNCOMMON, BRAINROT_RARE, BRAINROT_EPIC, BRAINROT_LEGENDARY, BRAINROT_MYTHIC, BRAINROT_INFINITE,
  HORROR_COMMON, HORROR_UNCOMMON, HORROR_RARE, HORROR_EPIC, HORROR_LEGENDARY, HORROR_MYTHIC,
} from './items.js?v=3';

export const CASES = {
  // ================= Тир 1: дешёвые "мемные стартеры" (common/uncommon) =================
  l_case: {
    id: 'l_case',
    name: 'L Кейс',
    price: 15,
    adFree: true,
    emoji: '🤡',
    sprite: 'assets/icons/l_case.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_COMMON, ...BRAINROT_UNCOMMON],
    rarityWeights: {
      common: 900,
      uncommon: 100,
    },
  },
  ohio: {
    id: 'ohio',
    name: 'Огайо Бокс',
    price: 20,
    adFree: true,
    emoji: '🌽',
    sprite: 'assets/icons/ohio.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_COMMON, ...BRAINROT_UNCOMMON],
    rarityWeights: {
      common: 850,
      uncommon: 150,
    },
  },
  baka: {
    id: 'baka',
    name: 'Бака Бокс',
    price: 35,
    adFree: true,
    emoji: '😤',
    sprite: 'assets/icons/baka.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_COMMON, ...BRAINROT_UNCOMMON],
    rarityWeights: {
      common: 780,
      uncommon: 220,
    },
  },
  cringe: {
    id: 'cringe',
    name: 'Кринж Кейс',
    price: 45,
    adFree: true,
    emoji: '😬',
    sprite: 'assets/icons/cringe.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_COMMON, ...BRAINROT_UNCOMMON],
    rarityWeights: {
      common: 700,
      uncommon: 300,
    },
  },
  skibidi: {
    id: 'skibidi',
    name: 'Скибиди Сундук',
    price: 50,
    adFree: true,
    emoji: '🚽',
    sprite: 'assets/icons/skibidi.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_COMMON, ...BRAINROT_UNCOMMON],
    rarityWeights: {
      common: 620,
      uncommon: 380,
    },
  },
  delulu: {
    id: 'delulu',
    name: 'Дилулу Бокс',
    price: 65,
    adFree: true,
    emoji: '💭',
    sprite: 'assets/icons/delulu.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_COMMON, ...BRAINROT_UNCOMMON],
    rarityWeights: {
      common: 550,
      uncommon: 450,
    },
  },

  // ================= Тир 2: средние (uncommon/rare/epic, без common) =================
  mewing: {
    id: 'mewing',
    name: 'Мьюинг Мастер Кейс',
    price: 70,
    emoji: '😤',
    sprite: 'assets/icons/mewing.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_UNCOMMON, ...BRAINROT_RARE, ...BRAINROT_EPIC],
    rarityWeights: {
      uncommon: 700,
      rare: 280,
      epic: 20,
    },
  },
  npc: {
    id: 'npc',
    name: 'NPC Кейс',
    price: 75,
    emoji: '🤖',
    sprite: 'assets/icons/npc.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_UNCOMMON, ...BRAINROT_RARE, ...BRAINROT_EPIC],
    rarityWeights: {
      uncommon: 650,
      rare: 310,
      epic: 40,
    },
  },
  goblin_mode: {
    id: 'goblin_mode',
    name: 'Гоблин Мод Кейс',
    price: 85,
    emoji: '👺',
    sprite: 'assets/icons/goblin_mode.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_UNCOMMON, ...BRAINROT_RARE, ...BRAINROT_EPIC],
    rarityWeights: {
      uncommon: 600,
      rare: 340,
      epic: 60,
    },
  },
  sigma: {
    id: 'sigma',
    name: 'Сигма Кейс',
    price: 90,
    emoji: '🗿',
    sprite: 'assets/icons/sigma.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_UNCOMMON, ...BRAINROT_RARE, ...BRAINROT_EPIC],
    rarityWeights: {
      uncommon: 550,
      rare: 370,
      epic: 80,
    },
  },
  bussin: {
    id: 'bussin',
    name: 'Бассин Бокс',
    price: 95,
    emoji: '🍔',
    sprite: 'assets/icons/bussin.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_UNCOMMON, ...BRAINROT_RARE, ...BRAINROT_EPIC],
    rarityWeights: {
      uncommon: 520,
      rare: 380,
      epic: 100,
    },
  },
  aura_farm: {
    id: 'aura_farm',
    name: 'Аура Фарм Кейс',
    price: 110,
    emoji: '🌾',
    sprite: 'assets/icons/aura_farm.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_UNCOMMON, ...BRAINROT_RARE, ...BRAINROT_EPIC],
    rarityWeights: {
      uncommon: 460,
      rare: 400,
      epic: 140,
    },
  },
  goofy: {
    id: 'goofy',
    name: 'Гуфи Кейс',
    price: 120,
    emoji: '🤪',
    sprite: 'assets/icons/goofy.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_UNCOMMON, ...BRAINROT_RARE, ...BRAINROT_EPIC],
    rarityWeights: {
      uncommon: 420,
      rare: 420,
      epic: 160,
    },
  },
  zesty: {
    id: 'zesty',
    name: 'Зести Бокс',
    price: 130,
    emoji: '🌶️',
    sprite: 'assets/icons/zesty.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_UNCOMMON, ...BRAINROT_RARE, ...BRAINROT_EPIC],
    rarityWeights: {
      uncommon: 400,
      rare: 430,
      epic: 170,
    },
  },
  gyatt: {
    id: 'gyatt',
    name: 'Гьятт Дроп',
    price: 140,
    emoji: '🍑',
    sprite: 'assets/icons/gyatt.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_UNCOMMON, ...BRAINROT_RARE, ...BRAINROT_EPIC],
    rarityWeights: {
      uncommon: 380,
      rare: 440,
      epic: 180,
    },
  },
  sussy: {
    id: 'sussy',
    name: 'Сасси Бокс',
    price: 160,
    emoji: '🔪',
    sprite: 'assets/icons/sussy.png',
    categories: ['brainrot'],
    // Самый дорогой кейс тира 2 — единственный, где проглядывает
    // маленький "хвост" legendary (верхняя граница следующего тира).
    itemPool: [...BRAINROT_UNCOMMON, ...BRAINROT_RARE, ...BRAINROT_EPIC, ...BRAINROT_LEGENDARY],
    rarityWeights: {
      uncommon: 300,
      rare: 450,
      epic: 230,
      legendary: 20,
    },
  },
  // horror_vault — ИСКЛЮЧЕНИЕ из общей тирной схемы: horror-категория
  // держит всего 2 кейса на все 6 редкостей (в отличие от brainrot,
  // растянутого на 4 тира), поэтому horror_vault — единственный "вход"
  // для common/uncommon/rare horror-предметов. Раз его "потолок" — rare
  // (а не epic, как у обычных кейсов тира 3), цена и место в списке —
  // на уровне тира 2, а не 300 монет, как было раньше: иначе получался
  // бы тот же "мусор из дорогого кейса", с которым мы здесь и боремся.
  // Весь "чистый" верх диапазона (epic/legendary/mythic) полностью
  // отдан verity_case в тире 4 — сам horror_vault НИКОГДА не даёт epic+.
  horror_vault: {
    id: 'horror_vault',
    name: 'Сундук Ужасов',
    price: 100,
    emoji: '🕸️',
    sprite: 'assets/icons/horror_vault.png',
    categories: ['horror'],
    itemPool: [...HORROR_COMMON, ...HORROR_UNCOMMON, ...HORROR_RARE],
    rarityWeights: {
      common: 300,
      uncommon: 400,
      rare: 300,
    },
  },

  // ================= Тир 3: премиум (rare/epic/legendary, без common/uncommon) =================
  chad: {
    id: 'chad',
    name: 'Чад Кейс',
    price: 200,
    emoji: '💪',
    sprite: 'assets/icons/chad.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_RARE, ...BRAINROT_EPIC, ...BRAINROT_LEGENDARY],
    rarityWeights: {
      rare: 550,
      epic: 380,
      legendary: 70,
    },
  },
  rizz: {
    id: 'rizz',
    name: 'Ризз Коробка',
    price: 220,
    emoji: '😎',
    sprite: 'assets/icons/rizz.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_RARE, ...BRAINROT_EPIC, ...BRAINROT_LEGENDARY],
    rarityWeights: {
      rare: 500,
      epic: 420,
      legendary: 80,
    },
  },
  mega_sigma: {
    id: 'mega_sigma',
    name: 'Мега Сигма Кейс',
    price: 250,
    emoji: '🏆',
    sprite: 'assets/icons/mega_sigma.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_RARE, ...BRAINROT_EPIC, ...BRAINROT_LEGENDARY],
    rarityWeights: {
      rare: 450,
      epic: 450,
      legendary: 100,
    },
  },
  w_rizz: {
    id: 'w_rizz',
    name: 'W Ризз Кейс',
    price: 280,
    emoji: '🏆',
    sprite: 'assets/icons/w_rizz.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_RARE, ...BRAINROT_EPIC, ...BRAINROT_LEGENDARY],
    rarityWeights: {
      rare: 400,
      epic: 470,
      legendary: 130,
    },
  },
  fanum: {
    id: 'fanum',
    name: 'Фанум Такс Кейс',
    price: 300,
    emoji: '🍟',
    sprite: 'assets/icons/fanum.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_RARE, ...BRAINROT_EPIC, ...BRAINROT_LEGENDARY],
    rarityWeights: {
      rare: 350,
      epic: 480,
      legendary: 170,
    },
  },
  skibidi_apex: {
    id: 'skibidi_apex',
    name: 'Скибиди Апекс Кейс',
    price: 380,
    emoji: '👑',
    sprite: 'assets/icons/skibidi_apex.png',
    categories: ['brainrot'],
    // Самый дорогой кейс тира 3 — единственный, где проглядывает
    // маленький "хвост" mythic (верхняя граница следующего тира).
    itemPool: [...BRAINROT_RARE, ...BRAINROT_EPIC, ...BRAINROT_LEGENDARY, ...BRAINROT_MYTHIC],
    rarityWeights: {
      rare: 280,
      epic: 480,
      legendary: 200,
      mythic: 40,
    },
  },

  // ================= Тир 4: топ, для "китов" (epic/legendary/mythic, без rare и ниже) =================
  alpha_omega: {
    id: 'alpha_omega',
    name: 'Альфа Омега Кейс',
    price: 450,
    emoji: '🐺',
    sprite: 'assets/icons/alpha_omega.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_EPIC, ...BRAINROT_LEGENDARY, ...BRAINROT_MYTHIC],
    rarityWeights: {
      epic: 550,
      legendary: 350,
      mythic: 100,
    },
  },
  gacha: {
    id: 'gacha',
    name: 'Гачи Кейс',
    price: 500,
    emoji: '🎰',
    sprite: 'assets/icons/gacha.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_EPIC, ...BRAINROT_LEGENDARY, ...BRAINROT_MYTHIC],
    rarityWeights: {
      epic: 480,
      legendary: 400,
      mythic: 120,
    },
  },
  fate_case: {
    id: 'fate_case',
    name: 'Кейс Судьбы',
    price: 600,
    emoji: '🎲',
    sprite: 'assets/icons/fate_case.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_EPIC, ...BRAINROT_LEGENDARY, ...BRAINROT_MYTHIC],
    rarityWeights: {
      epic: 400,
      legendary: 440,
      mythic: 160,
    },
  },
  mythic_grail: {
    id: 'mythic_grail',
    name: 'Мифический Грааль',
    price: 800,
    emoji: '💎',
    sprite: 'assets/icons/mythic_grail.png',
    categories: ['brainrot'],
    itemPool: [...BRAINROT_EPIC, ...BRAINROT_LEGENDARY, ...BRAINROT_MYTHIC],
    rarityWeights: {
      epic: 300,
      legendary: 480,
      mythic: 220,
    },
  },
  // verity_case — вторая (верхняя) половина horror-диапазона: держит
  // epic/legendary/mythic целиком (horror_vault выше их вообще не даёт),
  // поэтому это настоящий топ-кейс без единого "слабого" дропа. Здесь же
  // живут обе фазы Верити (horror_11 — Доброе Лицо, легендарная;
  // horror_12 — Злое Лицо, мифическая) — в horror-пуле всего по 2
  // предмета на редкость, поэтому даже небольшой вес даёт каждому
  // конкретному предмету заметно более высокий индивидуальный шанс, чем
  // у brainrot-аналогов с 5 предметами на редкость.
  verity_case: {
    id: 'verity_case',
    name: 'Кейс Судьбы: Верити',
    price: 900,
    emoji: '🚪',
    sprite: 'assets/icons/verity_case.png',
    categories: ['horror'],
    itemPool: [...HORROR_EPIC, ...HORROR_LEGENDARY, ...HORROR_MYTHIC],
    rarityWeights: {
      epic: 300,
      legendary: 450,
      mythic: 250,
    },
  },
  ultra_mythic: {
    id: 'ultra_mythic',
    name: 'Ультра Мифик Кейс',
    price: 1200,
    emoji: '🌟',
    sprite: 'assets/icons/ultra_mythic.png',
    categories: ['brainrot'],
    // Топовый "китовый" кейс игры — гарантирован минимум epic, самый
    // высокий шанс mythic в игре. Также ЕДИНСТВЕННЫЙ кейс, который вообще
    // может выдать 'infinite_aura' (rarity 'infinite', см. config/items.js
    // и config/rarities.js) — вес 1 из 1001 даёт ~0.1% шанс на предмет,
    // ценность которого (10 000 монет) не сопоставима ни с чем остальным
    // в игре. Второй, альтернативный путь получить его — апгрейд любого
    // mythic-брейнрота на колесе (systems/upgradeWheel.js).
    itemPool: [...BRAINROT_EPIC, ...BRAINROT_LEGENDARY, ...BRAINROT_MYTHIC, ...BRAINROT_INFINITE],
    rarityWeights: {
      epic: 150,
      legendary: 450,
      mythic: 400,
      infinite: 1,
    },
  },
};

// Сколько кейсов игрок может открыть подряд, прежде чем показать
// межстраничную рекламу (interstitial). Меняй под монетизационный баланс.
export const ADS_EVERY_N_CASES = 4;

export function getCaseById(id) {
  return CASES[id] || null;
}

export function getAllCases() {
  return Object.values(CASES);
}
