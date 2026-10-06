/**
 * screens.js
 * ------------------------------------------------------------
 * Простой роутер между экранами. Каждый экран — это <section class="screen">
 * с data-screen="имя" в index.html. Переключение — просто toggle класса .active.
 * ------------------------------------------------------------
 */

const SCREENS = ['cases', 'caseOpening', 'inventory', 'wheel', 'characters', 'leaderboard'];

let currentScreen = null;
const enterCallbacks = {}; // screenName -> [fn]

export function onScreenEnter(screenName, cb) {
  if (!enterCallbacks[screenName]) enterCallbacks[screenName] = [];
  enterCallbacks[screenName].push(cb);
}

export function showScreen(screenName) {
  if (!SCREENS.includes(screenName)) {
    console.error(`[screens] Неизвестный экран: ${screenName}`);
    return;
  }

  document.querySelectorAll('.screen').forEach((el) => {
    el.classList.toggle('active', el.dataset.screen === screenName);
  });

  document.querySelectorAll('.topbar-nav-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.nav === screenName);
  });

  currentScreen = screenName;

  (enterCallbacks[screenName] || []).forEach((cb) => cb());
}

export function getCurrentScreen() {
  return currentScreen;
}

export function initScreenNav() {
  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => showScreen(btn.dataset.nav));
  });
}
