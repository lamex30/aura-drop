/**
 * main.js — точка входа игры "АУРА ДРОП"
 * ------------------------------------------------------------
 * Порядок инициализации:
 *  1. Инициализация Yandex Games SDK (как можно раньше — платформа
 *     требует это для корректного показа игры/рекламы).
 *  2. Загрузка сохранённого прогресса игрока.
 *  3. Инициализация UI-экранов и систем.
 *  4. Показ главного экрана.
 * ------------------------------------------------------------
 */

import { initYandexSDK, showRewardedVideo } from './systems/yandexSDK.js?v=3';
import { loadProgress, onInventoryChange, attachAutoSave } from './systems/inventory.js?v=3';
import { onBalanceChange, getBalance, addCoins } from './systems/currency.js?v=3';
import { initScreenNav, showScreen, onScreenEnter } from './ui/screens.js?v=3';
import { initCasesUI } from './ui/casesUI.js?v=3';
import { initCaseOpeningUI, refreshBalanceDisplay } from './ui/caseOpeningUI.js?v=3';
import { initInventoryUI, render as renderInventory } from './ui/inventoryUI.js?v=3';
import { initWheelUI, render as renderWheel } from './ui/wheelUI.js?v=3';
import { initCharactersUI } from './ui/charactersUI.js?v=3';
import { initLootFeedUI } from './ui/lootFeedUI.js?v=3';
import { initLeaderboardUI } from './ui/leaderboardUI.js?v=3';

async function bootstrap() {
  // 1. Yandex SDK — инициализируем в первую очередь.
  await initYandexSDK();

  // 2. Прогресс игрока (баланс + инвентарь).
  await loadProgress();

  // 3. Автосохранение при изменении баланса.
  attachAutoSave(onBalanceChange);

  // 4. UI.
  initScreenNav();
  initCasesUI();
  initCaseOpeningUI();
  initInventoryUI();
  initWheelUI();
  initCharactersUI();
  initLootFeedUI();
  initLeaderboardUI();

  onBalanceChange(() => refreshBalanceDisplay());
  refreshBalanceDisplay();

  // inventoryUI и charactersUI уже подписываются на onInventoryChange
  // самостоятельно (внутри своих initXxxUI) — подписывать их здесь ещё
  // раз означало бы рендерить те же экраны дважды на каждое изменение
  // инвентаря (открытие кейса, продажа, апгрейд). Колесо апгрейда себя
  // не подписывает, поэтому его рендер остаётся здесь.
  onInventoryChange(renderWheel);

  onScreenEnter('inventory', renderInventory);
  onScreenEnter('wheel', renderWheel);
  onScreenEnter('caseOpening', refreshBalanceDisplay);

  initTopbarEarnButton();

  document.getElementById('loading-screen')?.classList.add('hidden');
  showScreen('cases');

  console.log(`[main] Игра готова. Баланс: ${getBalance()}`);
}

// Кнопка "+50 монет за рекламу" в шапке — доступна с любого экрана в любой
// момент (в отличие от "Бесплатный кейс", привязанного к конкретному
// дешёвому кейсу, см. ui/caseOpeningUI.js). Блокируется на время просмотра
// ролика, чтобы не запустить несколько rewarded-показов одновременно.
const EARN_REWARD_COINS = 50;

function initTopbarEarnButton() {
  const btn = document.getElementById('topbar-earn-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    btn.disabled = true;

    showRewardedVideo({
      onRewarded: () => addCoins(EARN_REWARD_COINS),
      onClose: () => {
        btn.disabled = false;
      },
      onError: () => {
        btn.disabled = false;
      },
    });
  });
}

bootstrap().catch((err) => {
  console.error('[main] Критическая ошибка при запуске игры:', err);
  const loadingEl = document.getElementById('loading-screen');
  if (loadingEl) {
    loadingEl.innerHTML = '<p>Ошибка загрузки игры. Попробуйте перезагрузить страницу.</p>';
  }
});

// TODO(звук): подключить систему звуков/музыки (например, простой AudioManager
// на HTMLAudioElement) и вызывать её на события: открытие кейса, выпадение
// редкого предмета, успех/провал апгрейда, клики по UI.
