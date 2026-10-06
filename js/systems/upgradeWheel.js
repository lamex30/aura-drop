/**
 * upgradeWheel.js
 * ------------------------------------------------------------
 * Логика "колеса апгрейда": игрок ставит предмет из инвентаря (source)
 * и выбирает целевой предмет (target, обычно более высокой редкости).
 * Шанс успеха считается по соотношению ИНДИВИДУАЛЬНОЙ ценности предметов
 * (getItemValue() из config/rarities.js — учитывает не только редкость,
 * но и личный множитель конкретного предмета), а не просто редкости:
 * раз персонажи одной редкости теперь стоят по-разному, дорогой target
 * внутри своей редкости апгрейдится труднее, чем дешёвый — точно так же,
 * как дешёвый source даёт чуть лучший шанс, чем дорогой source той же
 * редкости.
 *
 * При успехе: source сгорает, игрок получает target.
 * При провале: source просто сгорает (стандартная механика case-upgrade).
 * ------------------------------------------------------------
 */

import { getItemValue } from '../config/rarities.js?v=3';

// TODO(баланс): множитель и границы шанса — крутилки для баланса экономики.
// HOUSE_EDGE=1 — честная механика без искусственного перекоса в чью-либо
// пользу (не путать с шансом выпадения предметов из кейсов, config/cases.js
// — его это НЕ затрагивает). При таком edge и mult=1 у обеих сторон базовый
// шанс апгрейда на СЛЕДУЮЩУЮ редкость уже сам по себе получается разумным:
// common→uncommon 50%, uncommon→rare 40%, rare→epic 42%, epic→legendary
// 40%, legendary→mythic 37.5%, mythic→infinite 8% (см. RARITIES value —
// именно из соотношения этих чисел и берётся база, HOUSE_EDGE её не трогает).
// Раньше HOUSE_EDGE подняли до 1.35, пытаясь смягчить "слишком жёстко" —
// перегнули палку: при удачном сочетании личных множителей предметов
// (config/items.js -> item.value, 0.7-1.3) это давало под 88% даже на
// epic→legendary, совсем без риска. Вернули edge к честной 1.
//
// ui/wheelUI.js теперь разрешает целиться не только в СОСЕДНЮЮ редкость,
// но в ЛЮБУЮ редкость выше source (например common -> legendary одним
// спином) — формула ниже это уже "бесплатно" поддерживает: value растёт
// от редкости к редкости экспоненциально (1, 2, 5, 12, 30, 80, 1000), так
// что sourceValue/targetValue сам по себе падает всё ниже с каждой
// пропущенной ступенью (common→epic ≈ 8%, common→legendary ≈ 3%,
// common→infinite ≈ 0.1%) — никакой дополнительной "штрафной" формулы за
// количество пропущенных ступеней не нужно, натуральное соотношение уже
// даёт нужную крутизну падения. Единственное, что пришлось поменять —
// опустить пол клампа: со старым MIN=12 почти ВСЕ дальние прыжки (3+
// ступени) утыкались в один и тот же потолок-пол 12% и переставали
// отличаться друг от друга шансом. Теперь пол = 3% — соседние редкости
// это не затрагивает (у них натуральный шанс и так всегда заметно выше
// пола, см. числа выше), а вот далёким прыжкам наконец есть куда падать
// вниз, сохраняя при этом хоть какой-то реальный (не нулевой) шанс на
// самый дерзкий джекпот-апгрейд через много ступеней разом.
const HOUSE_EDGE = 1;
const MIN_CHANCE_PERCENT = 3;   // даже самый дальний прыжок (напр. common→infinite) не 0%, но близко
const MAX_CHANCE_PERCENT = 75;  // никогда не даём почти гарантированный успех

/**
 * Считает шанс успеха апгрейда source -> target, в процентах (0-100).
 * bonusPercent — необязательная надбавка (например, за rewarded-рекламу
 * в ui/wheelUI.js), прибавляется ДО финального ограничения потолком —
 * т.е. бонус реально влияет на сам бросок, а не только на то, что
 * показано в интерфейсе.
 */
export function calculateUpgradeChance(sourceItem, targetItem, bonusPercent = 0) {
  const sourceValue = getItemValue(sourceItem);
  const targetValue = getItemValue(targetItem);

  if (!sourceValue || !targetValue) return 0;
  if (targetValue <= sourceValue) {
    // Апгрейд "вниз" или на равный по ценности предмет — считаем это
    // почти гарантированным разменом (высокий шанс, но не 100%).
    return MAX_CHANCE_PERCENT;
  }

  const rawChance = (sourceValue / targetValue) * 100 * HOUSE_EDGE + bonusPercent;
  return clamp(rawChance, MIN_CHANCE_PERCENT, MAX_CHANCE_PERCENT);
}

/**
 * Крутит колесо: бросает кубик против рассчитанного шанса (с учётом
 * bonusPercent, см. calculateUpgradeChance).
 * @returns {{ success: boolean, chancePercent: number, resultItem: object|null }}
 */
export function spinUpgrade(sourceItem, targetItem, bonusPercent = 0) {
  const chancePercent = calculateUpgradeChance(sourceItem, targetItem, bonusPercent);
  const roll = Math.random() * 100;
  const success = roll < chancePercent;

  return {
    success,
    chancePercent,
    resultItem: success ? targetItem : null,
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
