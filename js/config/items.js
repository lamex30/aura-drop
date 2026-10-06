/**
 * ITEMS CONFIG
 * ------------------------------------------------------------
 * База всех предметов игры. Добавляй/меняй предметы только здесь.
 *
 * Поля:
 *  id        — уникальный строковый идентификатор
 *  name      — отображаемое название
 *  rarity    — id редкости из config/rarities.js
 *  category  — 'brainrot' | 'horror' (категории тематики предметов)
 *  emoji     — fallback-иконка (эмодзи), используется только если sprite
 *              не задан или картинка не загрузилась
 *  sprite    — путь к PNG-иконке (72x72, прозрачный фон). Сейчас у всех
 *              предметов подключены иконки из Twemoji (лицензия CC-BY 4.0,
 *              свободно для коммерческого использования) — см.
 *              assets/icons/. UI рендерит их через
 *              ui/visualHelper.js -> renderVisualHTML(entity).
 *              TODO(арт): при желании заменить на авторские иллюстрации
 *              персонажей — просто поменять путь в sprite, остальное
 *              подхватится автоматически.
 *
 * ВАЖНО: у каждого нового предмета должна быть хотя бы одна "точка входа"
 * в config/cases.js — иначе он никогда не выпадет ни из одного кейса.
 * Полные (full-roster) кейсы (rizz, mega_sigma, fanum, horror_vault,
 * mythic_grail и т.д.) держат в itemPool ВСЕ id соответствующей
 * категории именно для этой гарантии — при добавлении нового предмета
 * не забудь дописать его id в ROSTER-константы ниже.
 * ------------------------------------------------------------
 */

export const ITEMS = [
  // ======================= BRAINROT =======================

  // ---- common ----
  { id: 'brainrot_01', value: 0.75, name: 'Тунг Тунг Санахан', rarity: 'common', category: 'brainrot', emoji: '🪵', sprite: 'assets/icons/brainrot_01.png' },
  { id: 'brainrot_02', value: 1.2, name: 'Бомбардиро Крокодило', rarity: 'common', category: 'brainrot', emoji: '🐊', sprite: 'assets/icons/brainrot_02.png' },
  { id: 'brainrot_11', value: 0.85, name: 'Чимпанзини Бананини', rarity: 'common', category: 'brainrot', emoji: '🐒', sprite: 'assets/icons/brainrot_11.png' },
  { id: 'brainrot_12', value: 1.3, name: 'Триппи Троппи', rarity: 'common', category: 'brainrot', emoji: '🐡', sprite: 'assets/icons/brainrot_12.png' },
  { id: 'brainrot_13', value: 0.7, name: 'Та Та Та Сахур', rarity: 'common', category: 'brainrot', emoji: '🥁', sprite: 'assets/icons/brainrot_13.png' },
  { id: 'brainrot_14', value: 1.1, name: 'Бонека Амбалабу', rarity: 'common', category: 'brainrot', emoji: '🎎', sprite: 'assets/icons/brainrot_14.png' },
  { id: 'brainrot_15', value: 0.95, name: 'Пот Хотспот', rarity: 'common', category: 'brainrot', emoji: '📡', sprite: 'assets/icons/brainrot_15.png' },
  { id: 'brainrot_16', value: 1.05, name: 'Статино Туалетто', rarity: 'common', category: 'brainrot', emoji: '🚽', sprite: 'assets/icons/brainrot_16.png' },

  // ---- uncommon ----
  { id: 'brainrot_03', value: 0.75, name: 'Тралалело Тралала', rarity: 'uncommon', category: 'brainrot', emoji: '🦈', sprite: 'assets/icons/brainrot_03.png' },
  { id: 'brainrot_04', value: 1.2, name: 'Капучино Ассассино', rarity: 'uncommon', category: 'brainrot', emoji: '☕', sprite: 'assets/icons/brainrot_04.png' },
  { id: 'brainrot_17', value: 0.85, name: 'Фриго Камело', rarity: 'uncommon', category: 'brainrot', emoji: '🐫', sprite: 'assets/icons/brainrot_17.png' },
  { id: 'brainrot_18', value: 1.3, name: 'Эспрессо Синьора', rarity: 'uncommon', category: 'brainrot', emoji: '☕', sprite: 'assets/icons/brainrot_18.png' },
  { id: 'brainrot_19', value: 0.7, name: 'Кокофанто Элефанто', rarity: 'uncommon', category: 'brainrot', emoji: '🐘', sprite: 'assets/icons/brainrot_19.png' },
  { id: 'brainrot_20', value: 1.1, name: 'Жирафа Челесте', rarity: 'uncommon', category: 'brainrot', emoji: '🦒', sprite: 'assets/icons/brainrot_20.png' },
  { id: 'brainrot_21', value: 0.95, name: 'Пиччоне Маккина', rarity: 'uncommon', category: 'brainrot', emoji: '🕊️', sprite: 'assets/icons/brainrot_21.png' },
  { id: 'brainrot_22', value: 1.05, name: 'Один Дин Дин Дун', rarity: 'uncommon', category: 'brainrot', emoji: '🔔', sprite: 'assets/icons/brainrot_22.png' },

  // ---- rare ----
  { id: 'brainrot_05', value: 0.75, name: 'Люринг Тунг Тунг', rarity: 'rare', category: 'brainrot', emoji: '🎭', sprite: 'assets/icons/brainrot_05.png' },
  { id: 'brainrot_06', value: 1.2, name: 'Гимоски Гими', rarity: 'rare', category: 'brainrot', emoji: '🧦', sprite: 'assets/icons/brainrot_06.png' },
  { id: 'brainrot_23', value: 0.85, name: 'Брр Брр Патапим', rarity: 'rare', category: 'brainrot', emoji: '🌲', sprite: 'assets/icons/brainrot_23.png' },
  { id: 'brainrot_24', value: 1.3, name: 'Торртуджини Драгонфрутини', rarity: 'rare', category: 'brainrot', emoji: '🐢', sprite: 'assets/icons/brainrot_24.png' },
  { id: 'brainrot_25', value: 0.7, name: 'Балерина Каппучина', rarity: 'rare', category: 'brainrot', emoji: '🩰', sprite: 'assets/icons/brainrot_25.png' },
  { id: 'brainrot_26', value: 1.1, name: 'Глорбо Фруттодрилло', rarity: 'rare', category: 'brainrot', emoji: '🐊', sprite: 'assets/icons/brainrot_26.png' },
  { id: 'brainrot_27', value: 0.95, name: 'Вака Сатурно Сатурнита', rarity: 'rare', category: 'brainrot', emoji: '🐄', sprite: 'assets/icons/brainrot_27.png' },
  { id: 'brainrot_28', value: 1.05, name: 'Лирили Ларила', rarity: 'rare', category: 'brainrot', emoji: '🌵', sprite: 'assets/icons/brainrot_28.png' },

  // ---- epic ----
  { id: 'brainrot_07', value: 0.75, name: 'Фрутти Тралалеро', rarity: 'epic', category: 'brainrot', emoji: '🍉', sprite: 'assets/icons/brainrot_07.png' },
  { id: 'brainrot_08', value: 1.2, name: 'Ку Пепе Дэнс', rarity: 'epic', category: 'brainrot', emoji: '🕺', sprite: 'assets/icons/brainrot_08.png' },
  { id: 'brainrot_29', value: 0.85, name: 'Бобритто Бандито', rarity: 'epic', category: 'brainrot', emoji: '🦫', sprite: 'assets/icons/brainrot_29.png' },
  { id: 'brainrot_30', value: 1.3, name: 'Каркеркар Куркур', rarity: 'epic', category: 'brainrot', emoji: '🚙', sprite: 'assets/icons/brainrot_30.png' },
  { id: 'brainrot_31', value: 0.7, name: 'Нуклеаро Динозауро', rarity: 'epic', category: 'brainrot', emoji: '🦖', sprite: 'assets/icons/brainrot_31.png' },
  { id: 'brainrot_32', value: 1.1, name: 'Сигмо Баллерино', rarity: 'epic', category: 'brainrot', emoji: '🕺', sprite: 'assets/icons/brainrot_32.png' },
  { id: 'brainrot_33', value: 0.95, name: 'Тигролино Бананино', rarity: 'epic', category: 'brainrot', emoji: '🐯', sprite: 'assets/icons/brainrot_33.png' },
  { id: 'brainrot_34', value: 1.05, name: 'Рино Тостерино', rarity: 'epic', category: 'brainrot', emoji: '🦏', sprite: 'assets/icons/brainrot_34.png' },

  // ---- legendary ----
  { id: 'brainrot_09', value: 0.8, name: 'Бруни Бранкалеоне', rarity: 'legendary', category: 'brainrot', emoji: '👑', sprite: 'assets/icons/brainrot_09.png' },
  { id: 'brainrot_35', value: 1.2, name: 'Маттео Кокомерато', rarity: 'legendary', category: 'brainrot', emoji: '🍉', sprite: 'assets/icons/brainrot_35.png' },
  { id: 'brainrot_36', value: 0.9, name: 'Серпентино Кактусино', rarity: 'legendary', category: 'brainrot', emoji: '🐍', sprite: 'assets/icons/brainrot_36.png' },
  { id: 'brainrot_37', value: 1.25, name: 'Гаттатино Няньино', rarity: 'legendary', category: 'brainrot', emoji: '🐱', sprite: 'assets/icons/brainrot_37.png' },
  { id: 'brainrot_38', value: 1.0, name: 'Драконио Эспрессио', rarity: 'legendary', category: 'brainrot', emoji: '🐲', sprite: 'assets/icons/brainrot_38.png' },

  // ---- mythic ----
  { id: 'brainrot_10', value: 0.8, name: 'Гигачад Скибиди', rarity: 'mythic', category: 'brainrot', emoji: '🚽', sprite: 'assets/icons/brainrot_10.png' },
  { id: 'brainrot_39', value: 1.2, name: 'Императоро Тиранизавро', rarity: 'mythic', category: 'brainrot', emoji: '👑', sprite: 'assets/icons/brainrot_39.png' },
  { id: 'brainrot_40', value: 0.9, name: 'Омега Сигмо Риззино', rarity: 'mythic', category: 'brainrot', emoji: '🗿', sprite: 'assets/icons/brainrot_40.png' },
  { id: 'brainrot_41', value: 1.25, name: 'Голдино Драгонфруттино', rarity: 'mythic', category: 'brainrot', emoji: '🐉', sprite: 'assets/icons/brainrot_41.png' },
  { id: 'brainrot_42', value: 1.0, name: 'Кроко Диаманто', rarity: 'mythic', category: 'brainrot', emoji: '💎', sprite: 'assets/icons/brainrot_42.png' },

  // ---- infinite (уникальная редкость — ЕДИНСТВЕННЫЙ предмет во всей игре) ----
  // Достаётся либо микро-шансом из ultra_mythic (config/cases.js), либо
  // апгрейдом любого mythic-брейнрота на колесе (rarity 'infinite' идёт
  // сразу за 'mythic' в RARITY_ORDER — см. config/rarities.js).
  { id: 'infinite_aura', value: 1.0, name: 'БЕСКОНЕЧНАЯ АУРА', rarity: 'infinite', category: 'brainrot', emoji: '♾️', sprite: 'assets/icons/infinite_aura.png' },

  // ======================= HORROR =======================
  // TODO(баланс/арт): категория horror временно использует общую шкалу
  // редкостей RARITIES. Позже можно добавить отдельные horror-редкости
  // (cursed/nightmare) с ещё более высоким value.

  // ---- common ----
  { id: 'horror_01', value: 0.85, name: 'Шёпот в стенах', rarity: 'common', category: 'horror', emoji: '👻', sprite: 'assets/icons/horror_01.png' },
  { id: 'horror_07', value: 1.15, name: 'Скрип половиц', rarity: 'common', category: 'horror', emoji: '🪵', sprite: 'assets/icons/horror_07.png' },

  // ---- uncommon ----
  { id: 'horror_02', value: 0.85, name: 'Треснувшая кукла', rarity: 'uncommon', category: 'horror', emoji: '🪆', sprite: 'assets/icons/horror_02.png' },
  { id: 'horror_08', value: 1.15, name: 'Голос за дверью', rarity: 'uncommon', category: 'horror', emoji: '🚪', sprite: 'assets/icons/horror_08.png' },

  // ---- rare ----
  { id: 'horror_03', value: 0.85, name: 'Бледная фигура', rarity: 'rare', category: 'horror', emoji: '🕯️', sprite: 'assets/icons/horror_03.png' },
  { id: 'horror_09', value: 1.15, name: 'Холодное дыхание', rarity: 'rare', category: 'horror', emoji: '❄️', sprite: 'assets/icons/horror_09.png' },

  // ---- epic ----
  { id: 'horror_04', value: 0.85, name: 'Тень с чердака', rarity: 'epic', category: 'horror', emoji: '🦇', sprite: 'assets/icons/horror_04.png' },
  { id: 'horror_10', value: 1.15, name: 'Кровавые отпечатки', rarity: 'epic', category: 'horror', emoji: '🩸', sprite: 'assets/icons/horror_10.png' },

  // ---- legendary ----
  { id: 'horror_05', value: 0.85, name: 'Проклятое зеркало', rarity: 'legendary', category: 'horror', emoji: '🪞', sprite: 'assets/icons/horror_05.png' },
  // Верити (Доброе Лицо) — половина монстра-двери из хоррор-фольклора:
  // добрая, приветливая сторона. Легендарная редкость.
  { id: 'horror_11', value: 1.15, name: 'Верити (Доброе Лицо)', rarity: 'legendary', category: 'horror', emoji: '😇', sprite: 'assets/icons/horror_11.png' },

  // ---- mythic ----
  { id: 'horror_06', value: 0.85, name: 'Оно из подвала', rarity: 'mythic', category: 'horror', emoji: '💀', sprite: 'assets/icons/horror_06.png' },
  // Верити (Злое Лицо) — вторая, кошмарная фаза той же сущности.
  // По условию — редкость ВЫШЕ легендарной, т.е. мифическая (максимум
  // текущей шкалы редкостей, см. config/rarities.js -> RARITY_ORDER).
  { id: 'horror_12', value: 1.15, name: 'Верити (Злое Лицо)', rarity: 'mythic', category: 'horror', emoji: '😈', sprite: 'assets/icons/horror_12.png' },
];

// ---- "Полные ростеры" по категориям — используются в config/cases.js
// для full-roster кейсов, чтобы КАЖДЫЙ предмет был гарантированно
// доступен хотя бы из одного кейса. ----
export const BRAINROT_ROSTER = ITEMS.filter((it) => it.category === 'brainrot').map((it) => it.id);
export const HORROR_ROSTER = ITEMS.filter((it) => it.category === 'horror').map((it) => it.id);

/**
 * id предметов по категории+редкости — используются в config/cases.js,
 * чтобы itemPool каждого кейса собирался ТОЧНО из тех редкостей, что
 * реально присутствуют в его rarityWeights (см. комментарий там про
 * "пол" редкости по ценовым тирам). Без этого легко случайно оставить
 * в пуле предметы редкости, которая по цене кейса быть не должна.
 */
function byCategoryRarity(category, rarity) {
  return ITEMS.filter((it) => it.category === category && it.rarity === rarity).map((it) => it.id);
}

export const BRAINROT_COMMON = byCategoryRarity('brainrot', 'common');
export const BRAINROT_UNCOMMON = byCategoryRarity('brainrot', 'uncommon');
export const BRAINROT_RARE = byCategoryRarity('brainrot', 'rare');
export const BRAINROT_EPIC = byCategoryRarity('brainrot', 'epic');
export const BRAINROT_LEGENDARY = byCategoryRarity('brainrot', 'legendary');
export const BRAINROT_MYTHIC = byCategoryRarity('brainrot', 'mythic');
export const BRAINROT_INFINITE = byCategoryRarity('brainrot', 'infinite');

export const HORROR_COMMON = byCategoryRarity('horror', 'common');
export const HORROR_UNCOMMON = byCategoryRarity('horror', 'uncommon');
export const HORROR_RARE = byCategoryRarity('horror', 'rare');
export const HORROR_EPIC = byCategoryRarity('horror', 'epic');
export const HORROR_LEGENDARY = byCategoryRarity('horror', 'legendary');
export const HORROR_MYTHIC = byCategoryRarity('horror', 'mythic');

export function getItemById(id) {
  return ITEMS.find((it) => it.id === id) || null;
}

export function getItemsByRarity(rarityId) {
  return ITEMS.filter((it) => it.rarity === rarityId);
}

export function getItemsByCategory(category) {
  return ITEMS.filter((it) => it.category === category);
}
