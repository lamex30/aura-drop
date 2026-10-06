/**
 * wheelUI.js
 * ------------------------------------------------------------
 * Экран колеса апгрейда: выбор предмета из инвентаря (source),
 * выбор целевого предмета (target), расчёт шанса, анимация колеса (GSAP),
 * применение результата.
 * ------------------------------------------------------------
 */

import {
  getInventory, removeItemByUid, addItemToInventory, requestSaveProgress,
  sellItem, getInventoryItemSellPrice,
} from '../systems/inventory.js?v=3';
import { ITEMS } from '../config/items.js?v=3';
import { getRarity, getAdBonus, getSellPrice, RARITY_ORDER } from '../config/rarities.js?v=3';
import { calculateUpgradeChance, spinUpgrade } from '../systems/upgradeWheel.js?v=3';
import { showRewardedVideo } from '../systems/yandexSDK.js?v=3';
import { showScreen } from './screens.js?v=3';
import { renderVisualHTML } from './visualHelper.js?v=3';
import { showWinModal, showFailModal } from './resultModal.js?v=3';

const WHEEL_SPIN_DURATION = 4.5; // секунды — длительность вращения стрелки (ease-in-out)
// Величина бонуса за рекламу зависит от редкости ЦЕЛИ апгрейда
// (config/rarities.js -> adBonus): чем реже цель, тем меньше бонус —
// иначе рекламой можно было бы слишком легко выбивать топовые редкости.

let els = {};
let selectedSourceUid = null;
let selectedTargetId = null;
let isSpinning = false;
let bonusSpinAvailable = false;
let needleRotation = 0; // накопленный угол поворота стрелки (градусы), только растёт

// Пока true — реактивные ре-рендеры (вызванные inventory.onInventoryChange,
// в т.ч. из main.js) игнорируются. Без этого removeItemByUid()/
// addItemToInventory() внутри applySpinResult() синхронно триггерят
// notify() -> main.js вызывает render() ДО того, как здесь успевают
// сброситься selectedSourceUid/selectedTargetId — из-за этого
// updateChanceAndDial() видел "предмет не найден" (он уже удалён из
// инвентаря) и мгновенно перекрашивал диск в серый ПРЯМО в момент
// остановки стрелки, стирая цвет сектора успеха/провала раньше, чем
// игрок успевал увидеть результат. Из-за этого казалось, что стрелка
// стоит на секторе выигрыша, а предмет всё равно "сгорает".
let isApplyingResult = false;

export function initWheelUI() {
  els = {
    sourceGrid: document.getElementById('wheel-source-grid'),
    targetGrid: document.getElementById('wheel-target-grid'),
    chanceDisplay: document.getElementById('wheel-chance'),
    wheelDial: document.getElementById('wheel-dial'),
    wheelNeedle: document.getElementById('wheel-needle'),
    spinBtn: document.getElementById('wheel-spin-btn'),
    bonusSpinBtn: document.getElementById('wheel-bonus-spin-btn'),
  };

  els.spinBtn.addEventListener('click', handleSpinClick);
  els.bonusSpinBtn.addEventListener('click', handleBonusSpinClick);

  render();
}

export function render() {
  if (isApplyingResult) return;
  renderSourceGrid();
  renderTargetGrid();
  updateChanceAndDial();
}

/**
 * Открывает экран колеса апгрейда с уже выбранным исходным предметом —
 * вызывается из inventoryUI.js по кнопке "Апгрейд" на карточке предмета.
 */
export function presetSourceAndGo(uid) {
  const entry = getInventory().find((e) => e.uid === uid);
  if (!entry) return;

  selectedSourceUid = uid;
  selectedTargetId = null;
  render();
  showScreen('wheel');
}

function renderSourceGrid() {
  const inventory = getInventory().filter((e) => e.item);

  els.sourceGrid.innerHTML = '';
  if (inventory.length === 0) {
    els.sourceGrid.innerHTML = '<p class="hint">Инвентарь пуст — сначала открой кейс.</p>';
    return;
  }

  inventory.forEach((entry) => {
    const rarity = getRarity(entry.item.rarity);
    const card = document.createElement('div');
    card.className = 'inventory-card small';
    if (entry.uid === selectedSourceUid) card.classList.add('selected');
    card.style.borderColor = rarity.color;
    card.style.setProperty('--rarity-color', rarity.color);
    card.innerHTML = `
      <div class="inventory-card-emoji">${renderVisualHTML(entry.item)}</div>
      <div class="inventory-card-name">${entry.item.name}</div>
      <div class="inventory-card-price"><span class="coin-icon"></span>${getSellPrice(entry.item)}</div>
    `;
    card.addEventListener('click', () => {
      selectedSourceUid = entry.uid;
      selectedTargetId = null; // сброс цели при смене исходного предмета
      render();
    });
    els.sourceGrid.appendChild(card);
  });
}

function renderTargetGrid() {
  els.targetGrid.innerHTML = '';

  const sourceEntry = getInventory().find((e) => e.uid === selectedSourceUid);
  if (!sourceEntry) {
    els.targetGrid.innerHTML = '<p class="hint">Сначала выбери предмет выше.</p>';
    return;
  }

  // Возможные цели: любой предмет ТОЙ ЖЕ категории с редкостью СТРОГО ВЫШЕ
  // source — не только следующая ступень. Раньше апгрейд позволял прыгнуть
  // только на соседнюю редкость; теперь можно целиться сразу в любую более
  // высокую (например common -> legendary одним спином) — за это отвечает
  // индекс в RARITY_ORDER, а не getNextRarity(). Шанс на далёкие прыжки
  // соразмерно низкий — см. upgradeWheel.js (натуральное падение по
  // соотношению value + расширенный вниз MIN_CHANCE_PERCENT).
  const sourceRarityIdx = RARITY_ORDER.indexOf(sourceEntry.item.rarity);
  const targets = ITEMS.filter(
    (it) => it.category === sourceEntry.item.category && RARITY_ORDER.indexOf(it.rarity) > sourceRarityIdx
  );

  if (targets.length === 0) {
    els.targetGrid.innerHTML = '<p class="hint">Для этого предмета нет доступных целей апгрейда (максимальная редкость).</p>';
    return;
  }

  targets.forEach((target) => {
    const rarity = getRarity(target.rarity);
    const card = document.createElement('div');
    card.className = 'inventory-card small';
    if (target.id === selectedTargetId) card.classList.add('selected');
    card.style.borderColor = rarity.color;
    card.style.setProperty('--rarity-color', rarity.color);
    card.innerHTML = `
      <div class="inventory-card-emoji">${renderVisualHTML(target)}</div>
      <div class="inventory-card-name">${target.name}</div>
      <div class="inventory-card-rarity" style="color:${rarity.color}">${rarity.name}</div>
      <div class="inventory-card-price"><span class="coin-icon"></span>${getSellPrice(target)}</div>
    `;
    card.addEventListener('click', () => {
      selectedTargetId = target.id;
      render();
    });
    els.targetGrid.appendChild(card);
  });
}

function updateChanceAndDial() {
  const sourceEntry = getInventory().find((e) => e.uid === selectedSourceUid);
  const targetItem = ITEMS.find((it) => it.id === selectedTargetId);

  const ready = !!(sourceEntry && targetItem);
  els.spinBtn.disabled = !ready || isSpinning;

  if (!ready) {
    els.chanceDisplay.textContent = 'Выбери предмет и цель апгрейда';
    els.wheelDial.style.background = 'conic-gradient(#333 0% 100%)';
    updateBonusButton(null);
    return;
  }

  const bonusPercent = bonusSpinAvailable ? getAdBonus(targetItem.rarity) : 0;
  const chance = calculateUpgradeChance(sourceEntry.item, targetItem, bonusPercent);
  els.chanceDisplay.textContent = bonusSpinAvailable
    ? `Шанс успеха: ${chance.toFixed(1)}% (бонус +${bonusPercent}% применён)`
    : `Шанс успеха: ${chance.toFixed(1)}%`;

  const winColor = getRarity(targetItem.rarity).color;
  els.wheelDial.style.background = `conic-gradient(${winColor} 0% ${chance}%, #2a2a35 ${chance}% 100%)`;

  updateBonusButton(targetItem);
}

/**
 * Обновляет вид кнопки "Бонус (реклама)" — она недоступна, пока идёт
 * спин, и переходит в состояние "уже активен" после просмотра рекламы,
 * чтобы игрок не мог накопить несколько бонусов одновременно. Показанный
 * процент зависит от текущей выбранной цели (targetItem) — у каждой
 * редкости свой adBonus (config/rarities.js).
 */
function updateBonusButton(targetItem) {
  if (!els.bonusSpinBtn) return;

  if (bonusSpinAvailable) {
    const bonusPercent = targetItem ? getAdBonus(targetItem.rarity) : null;
    els.bonusSpinBtn.textContent = bonusPercent != null
      ? `Бонус активен (+${bonusPercent}%)`
      : 'Бонус активен';
    els.bonusSpinBtn.disabled = true;
  } else {
    els.bonusSpinBtn.innerHTML = 'Бонус';
    els.bonusSpinBtn.disabled = isSpinning;
  }
}

function handleSpinClick() {
  if (isSpinning) return;

  const sourceEntry = getInventory().find((e) => e.uid === selectedSourceUid);
  const targetItem = ITEMS.find((it) => it.id === selectedTargetId);
  if (!sourceEntry || !targetItem) return;

  runSpin(sourceEntry, targetItem);
}

function handleBonusSpinClick() {
  if (isSpinning || bonusSpinAvailable) return;

  showRewardedVideo({
    onRewarded: () => {
      // Бонус действует на СЛЕДУЮЩИЙ спин: добавляет getAdBonus(targetItem.rarity)
      // процентных пунктов к шансу успеха (см. runSpin/updateChanceAndDial),
      // расходуется сразу при следующем спине независимо от его исхода.
      bonusSpinAvailable = true;
      updateChanceAndDial();
    },
    onError: () => {
      // Не используем alert() — в песочнице Yandex Games (iframe)
      // блокирующие нативные диалоги часто отключены и выглядят как
      // "ничего не произошло". Пишем в консоль для отладки.
      console.warn('[wheelUI] Не удалось загрузить рекламу для бонуса.');
    },
  });
}

function runSpin(sourceEntry, targetItem) {
  isSpinning = true;
  els.spinBtn.disabled = true;

  // Бонус расходуется в момент запуска спина (и на успех, и на провал) —
  // он одноразовый и относится именно к ЭТОЙ попытке. Размер бонуса
  // зависит от редкости ИМЕННО ЭТОЙ цели (targetItem), а не фиксирован.
  const bonus = bonusSpinAvailable ? getAdBonus(targetItem.rarity) : 0;
  bonusSpinAvailable = false;
  updateBonusButton(targetItem);

  const chance = calculateUpgradeChance(sourceEntry.item, targetItem, bonus);
  const result = spinUpgrade(sourceEntry.item, targetItem, bonus);

  // Диск неподвижен (сектора заданы conic-gradient в updateChanceAndDial),
  // крутится только стрелка вокруг него. Сектор 0%..chance% (по часовой
  // от 12 часов) — "успех", остальное — "провал". Угол приземления
  // выбираем СЛУЧАЙНО ВНУТРИ нужного сектора (с отступом от границ),
  // используя уже готовый исход result.success — так стрелка всегда
  // честно указывает на реальный результат.
  const successZoneDeg = (chance / 100) * 360;
  const failZoneDeg = 360 - successZoneDeg;
  const margin = Math.min(6, successZoneDeg / 4, failZoneDeg / 4);

  let angleInCycle;
  if (result.success) {
    const span = Math.max(successZoneDeg - margin * 2, 0.001);
    angleInCycle = margin + Math.random() * span;
  } else {
    const span = Math.max(failZoneDeg - margin * 2, 0.001);
    angleInCycle = successZoneDeg + margin + Math.random() * span;
  }

  // Несколько ЦЕЛЫХ полных оборотов для азарта + честный угол приземления.
  // Важно: spins должно быть целым числом — если бы оно было дробным
  // (например, 4.73), то spins*360 добавляло бы случайный "довесок" в
  // градусах поверх angleInCycle, и после деления по модулю 360 итоговый
  // угол приземления уезжал бы В ДРУГОЙ сектор, не совпадающий с уже
  // определённым исходом (result.success) — именно это и вызывало баг
  // "стрелка на секторе выигрыша, а предмет всё равно сгорел".
  const spins = 4 + Math.floor(Math.random() * 3); // 4, 5 или 6 целых оборотов
  const currentFullTurns = Math.floor(needleRotation / 360);
  const targetRotation = (currentFullTurns + spins) * 360 + angleInCycle;

  gsap.to(els.wheelNeedle, {
    rotate: targetRotation,
    duration: WHEEL_SPIN_DURATION,
    ease: 'power2.inOut',
    force3D: true,
    onComplete: () => {
      needleRotation = targetRotation;
      isSpinning = false;
      applySpinResult(sourceEntry, result);
    },
  });
}

function applySpinResult(sourceEntry, result) {
  // Мутации инвентаря блокируем от преждевременного реактивного ре-рендера
  // (см. комментарий у isApplyingResult) — иначе диск перекрасится в серый
  // раньше, чем отработает остальная логика. Полноэкранная модалка
  // результата (ui/resultModal.js) всё равно перекрывает экран целиком,
  // так что сброс диска под ней игроку не виден.
  isApplyingResult = true;
  removeItemByUid(sourceEntry.uid);
  let newUid = null;
  if (result.success) {
    newUid = addItemToInventory(result.resultItem.id).uid;
  }
  requestSaveProgress();
  isApplyingResult = false;

  selectedSourceUid = null;
  selectedTargetId = null;

  render();
  showResult(result, newUid);
}

/**
 * Показывает результат апгрейда в полноэкранной модалке — при успехе с
 * теми же тремя действиями (продать/апгрейд/сохранить), что и после
 * открытия кейса, при провале — тем же текстом, что был в старой плашке.
 */
function showResult(result, newUid) {
  if (result.success) {
    const rarity = getRarity(result.resultItem.rarity);
    const sellPrice = getInventoryItemSellPrice(newUid);
    showWinModal(result.resultItem, rarity, {
      sellPrice,
      label: 'Апгрейд успешен',
      onSell: () => sellItem(newUid),
      onUpgrade: () => presetSourceAndGo(newUid),
    });
  } else {
    showFailModal('Предмет сгорел. Не повезло!');
  }
}
