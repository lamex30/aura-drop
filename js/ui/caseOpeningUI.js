/**
 * caseOpeningUI.js
 * ------------------------------------------------------------
 * Экран открытия кейса: выбор кейса, кнопка открытия, анимация
 * крутящейся ленты предметов (GSAP) с замедлением и финальным
 * хайлайтом выпавшего предмета.
 * ------------------------------------------------------------
 */

import { getAllCases, getCaseById, ADS_EVERY_N_CASES } from '../config/cases.js?v=3';
import { RARITY_ORDER, getRarity } from '../config/rarities.js?v=3';
import { openCase, getCaseItemPool, getItemDropChances } from '../systems/caseOpening.js?v=3';
import { canAfford, spendCoins, getBalance } from '../systems/currency.js?v=3';
import { addItemToInventory, requestSaveProgress, sellItem, getInventoryItemSellPrice } from '../systems/inventory.js?v=3';
import { showRewardedVideo } from '../systems/yandexSDK.js?v=3';
import { pushRealDrop } from '../systems/lootFeed.js?v=3';
import { presetSourceAndGo } from './wheelUI.js?v=3';
import { renderVisualHTML } from './visualHelper.js?v=3';
import { showWinModal } from './resultModal.js?v=3';
import { openCharacterModal } from './characterModal.js?v=3';

const REEL_ITEM_COUNT = 40;   // сколько карточек в ленте прокрутки
const WINNING_INDEX = 34;      // на какой по счёту карточке останавливаемся
const CARD_WIDTH = 160;        // px, должно соответствовать CSS .reel-card { width }
const REEL_SPIN_DURATION = 5;  // секунды — длительность прокрутки ленты (ease-in-out)
const QUICK_SPIN_DURATION = 0.25; // секунды — для кнопки "Быстрое открытие" (без ожидания)
const IDLE_PREVIEW_COUNT = 14; // сколько карточек показываем в статичном (неактивном) состоянии ленты

let selectedCaseId = getAllCases()[0]?.id || null;
let casesOpenedCount = 0;
let isSpinning = false;

let els = {};

export function initCaseOpeningUI() {
  els = {
    titleEl: document.getElementById('case-opening-title'),
    caseInfo: document.getElementById('case-info'),
    openBtn: document.getElementById('open-case-btn'),
    quickOpenBtn: document.getElementById('quick-open-btn'),
    freeCaseBtn: document.getElementById('free-case-btn'),
    reelViewport: document.getElementById('reel-viewport'),
    reelTrack: document.getElementById('reel-track'),
    possibleDropsGrid: document.getElementById('case-possible-drops-grid'),
  };

  updateCaseInfo();
  renderIdlePreview(selectedCaseId);
  renderPossibleDrops(selectedCaseId);

  els.openBtn.addEventListener('click', handleOpenClick);
  els.quickOpenBtn.addEventListener('click', handleQuickOpenClick);
  els.freeCaseBtn.addEventListener('click', handleFreeCaseClick);
}

/**
 * Выбирает кейс для открытия на этом экране — вызывается из casesUI.js
 * при клике на карточку кейса на экране "Кейсы".
 */
export function setSelectedCase(caseId) {
  selectedCaseId = caseId;
  updateCaseInfo();
  renderIdlePreview(caseId);
  renderPossibleDrops(caseId);
}

/**
 * Статичное (неанимированное) состояние ленты — показывается, пока
 * игрок не нажал "Открыть кейс", чтобы полоска не была пустой.
 */
function renderIdlePreview(caseId) {
  const caseConfig = getCaseById(caseId);
  if (!caseConfig || !els.reelTrack) return;

  const pool = getCaseItemPool(caseConfig);
  if (pool.length === 0) return;

  els.reelTrack.innerHTML = '';
  gsap.set(els.reelTrack, { x: 0 });

  for (let i = 0; i < IDLE_PREVIEW_COUNT; i++) {
    els.reelTrack.appendChild(buildReelCard(pool[i % pool.length]));
  }
}

/**
 * Список всех предметов, которые может выдать этот кейс — отображается
 * внизу экрана, чтобы игрок видел состав кейса перед покупкой.
 */
function renderPossibleDrops(caseId) {
  const caseConfig = getCaseById(caseId);
  if (!caseConfig || !els.possibleDropsGrid) return;

  const pool = getCaseItemPool(caseConfig)
    .slice()
    .sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
  const dropChances = getItemDropChances(caseId);

  els.possibleDropsGrid.innerHTML = '';

  pool.forEach((item) => {
    const rarity = getRarity(item.rarity);
    const chancePercent = dropChances.get(item.id) || 0;
    const card = document.createElement('div');
    card.className = 'inventory-card small drop-preview';
    card.style.borderColor = rarity.color;
    card.style.setProperty('--rarity-color', rarity.color);
    card.innerHTML = `
      <div class="inventory-card-emoji">${renderVisualHTML(item)}</div>
      <div class="inventory-card-name">${item.name}</div>
      <div class="inventory-card-rarity" style="color:${rarity.color}">${rarity.name}</div>
      <div class="inventory-card-chance">${formatDropChance(chancePercent)}</div>
    `;
    card.addEventListener('click', () => openCharacterModal(item, rarity));
    els.possibleDropsGrid.appendChild(card);
  });
}

/**
 * Форматирует % шанса выпадения под превью кейса — у топовых кейсов
 * (например, ultra_mythic -> infinite_aura, см. config/cases.js) шанс
 * может быть меньше 0.1%, где одного знака после запятой недостаточно,
 * чтобы значение не округлилось до "0.0%".
 */
function formatDropChance(chancePercent) {
  if (chancePercent < 1) return `${chancePercent.toFixed(2)}%`;
  return `${chancePercent.toFixed(1)}%`;
}

function updateCaseInfo() {
  const c = getCaseById(selectedCaseId);
  if (!c) return;
  if (els.titleEl) els.titleEl.innerHTML = `${renderVisualHTML(c)} ${c.name}`;
  if (els.caseInfo) els.caseInfo.textContent = `Цена: ${c.price} монет`;
  if (els.openBtn) els.openBtn.textContent = `Открыть кейс (${c.price})`;
  if (els.quickOpenBtn) els.quickOpenBtn.textContent = `Быстрое открытие (${c.price})`;

  // Бесплатно за рекламу можно открыть только дешёвые кейсы (adFree в
  // config/cases.js) — иначе не было бы смысла копить монеты на дорогой
  // кейс, если тот же ролик даёт его бесплатно (см. запрос пользователя).
  if (els.freeCaseBtn) {
    if (c.adFree) {
      els.freeCaseBtn.innerHTML = 'Бесплатный кейс';
      els.freeCaseBtn.disabled = isSpinning;
      els.freeCaseBtn.title = '';
    } else {
      els.freeCaseBtn.innerHTML = 'Бесплатно — только дешёвые кейсы';
      els.freeCaseBtn.disabled = true;
      els.freeCaseBtn.title = 'Бесплатно открываются только самые дешёвые кейсы (см. вкладку "Кейсы")';
    }
  }
}

function handleFreeCaseClick() {
  if (isSpinning) return;

  const caseConfig = getCaseById(selectedCaseId);
  if (!caseConfig?.adFree) return;

  showRewardedVideo({
    onRewarded: () => {
      spinAndOpen(selectedCaseId, { free: true });
    },
    onClose: (wasRewarded) => {
      if (!wasRewarded) {
        showToast('Ролик не досмотрен — награда не выдана.');
      }
    },
    onError: () => showToast('Не удалось загрузить рекламу.'),
  });
}

function handleOpenClick() {
  if (isSpinning) return;

  const caseConfig = getCaseById(selectedCaseId);
  if (!caseConfig) return;

  if (!canAfford(caseConfig.price)) {
    showToast('Недостаточно монет!');
    return;
  }

  spendCoins(caseConfig.price);
  spinAndOpen(selectedCaseId, { free: false, quick: false });
}

/**
 * "Быстрое открытие" — та же цена и тот же результат (openCase), но без
 * ожидания: лента долетает до выигрышной карточки почти мгновенно
 * (QUICK_SPIN_DURATION), а не за REEL_SPIN_DURATION секунд.
 */
function handleQuickOpenClick() {
  if (isSpinning) return;

  const caseConfig = getCaseById(selectedCaseId);
  if (!caseConfig) return;

  if (!canAfford(caseConfig.price)) {
    showToast('Недостаточно монет!');
    return;
  }

  spendCoins(caseConfig.price);
  spinAndOpen(selectedCaseId, { free: false, quick: true });
}

function spinAndOpen(caseId, { free, quick }) {
  const result = openCase(caseId);
  if (!result) return;

  isSpinning = true;
  setControlsEnabled(false);

  buildReel(caseId, result.item);
  playReelAnimation(() => {
    const entry = addItemToInventory(result.item.id);
    requestSaveProgress();
    pushRealDrop(result.item);
    showWinResult(result.item, entry.uid);

    isSpinning = false;
    setControlsEnabled(true);

    casesOpenedCount += 1;
    maybeShowInterstitial();
  }, quick ? QUICK_SPIN_DURATION : REEL_SPIN_DURATION);
}

function setControlsEnabled(enabled) {
  els.openBtn.disabled = !enabled;
  els.quickOpenBtn.disabled = !enabled;

  // Кнопку рекламы включаем обратно только если этот кейс вообще
  // доступен бесплатно (adFree) — иначе она осталась бы кликабельной
  // после первого спина для платных кейсов.
  const caseConfig = getCaseById(selectedCaseId);
  els.freeCaseBtn.disabled = !enabled || !caseConfig?.adFree;
}

function buildReel(caseId, winningItem) {
  const caseConfig = getCaseById(caseId);
  const pool = getCaseItemPool(caseConfig);

  els.reelTrack.innerHTML = '';
  els.reelTrack.style.transform = 'translateX(0px)';

  for (let i = 0; i < REEL_ITEM_COUNT; i++) {
    const item = i === WINNING_INDEX ? winningItem : pool[Math.floor(Math.random() * pool.length)];
    els.reelTrack.appendChild(buildReelCard(item));
  }
}

function buildReelCard(item) {
  const rarity = getRarity(item.rarity);
  const card = document.createElement('div');
  card.className = 'reel-card';
  card.style.borderColor = rarity.color;
    card.style.setProperty('--rarity-color', rarity.color);
  card.innerHTML = `
    <div class="reel-card-emoji">${renderVisualHTML(item)}</div>
    <div class="reel-card-name">${item.name}</div>
    <div class="reel-card-rarity" style="color:${rarity.color}">${rarity.name}</div>
  `;
  return card;
}

function playReelAnimation(onComplete, duration = REEL_SPIN_DURATION) {
  const viewportWidth = els.reelViewport.clientWidth;
  const targetX = -(WINNING_INDEX * CARD_WIDTH - viewportWidth / 2 + CARD_WIDTH / 2);
  const isQuick = duration <= QUICK_SPIN_DURATION;

  // Один плавный твин на весь путь: разгон в начале, торможение в конце
  // (ease-in-out), без рывков и без "доводящей" коррекции — GSAP считает
  // прогресс по реальному времени (не по кадрам), поэтому скорость
  // анимации одинакова на любой герцовке экрана. Для "быстрого открытия"
  // (QUICK_SPIN_DURATION) используем более резкий ease — на таком коротком
  // отрезке плавный inOut почти не успевает почувствоваться.
  gsap.set(els.reelTrack, { x: 0, force3D: true });
  gsap.to(els.reelTrack, {
    x: targetX,
    duration,
    ease: isQuick ? 'power1.out' : 'power2.inOut',
    force3D: true,
    onComplete: () => {
      highlightWinningCard();
      onComplete();
    },
  });
}

function highlightWinningCard() {
  const cards = els.reelTrack.querySelectorAll('.reel-card');
  const winCard = cards[WINNING_INDEX];
  if (!winCard) return;
  winCard.classList.add('reel-card-winner');
  gsap.fromTo(
    winCard,
    { scale: 1 },
    { scale: 1.12, duration: 0.5, yoyo: true, repeat: 3, ease: 'sine.inOut' }
  );
}

/**
 * Показывает выпавший предмет в полноэкранной модалке (ui/resultModal.js)
 * с тремя действиями — предмет уже добавлен в инвентарь (addItemToInventory
 * вызван до этого), так что "Сохранить" просто закрывает модалку, ничего
 * не мутируя. "Апгрейд" сразу открывает колесо с этим предметом как
 * источником, "Продать" — мгновенно продаёт его же (без блокирующего
 * confirm(), который часто отключён в песочнице Yandex Games).
 */
function showWinResult(item, uid) {
  const rarity = getRarity(item.rarity);
  const sellPrice = getInventoryItemSellPrice(uid);

  showWinModal(item, rarity, {
    sellPrice,
    label: 'Выпал новый предмет',
    onSell: () => sellItem(uid),
    onUpgrade: () => presetSourceAndGo(uid),
  });
}

// ДЕМО-ВЕРСИЯ: межстраничная реклама отключена. В полной версии для
// Яндекс Игр здесь каждые ADS_EVERY_N_CASES открытий показывается
// предупреждение-отсчёт и полноэкранная реклама.
function maybeShowInterstitial() {
  void ADS_EVERY_N_CASES;
}

function showToast(message) {
  // TODO(UI): заменить на нормальный toast-компонент со стилями/анимацией.
  console.log(`[toast] ${message}`);
  alert(message);
}

// Экспорт для main.js — обновление отображения баланса при заходе на экран
export function refreshBalanceDisplay() {
  const balanceEl = document.getElementById('balance-display');
  if (balanceEl) balanceEl.textContent = getBalance();
}
