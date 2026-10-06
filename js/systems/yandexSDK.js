/**
 * yandexSDK.js — ДЕМО-ВЕРСИЯ (без рекламы и без Yandex Games SDK)
 * ------------------------------------------------------------
 * Это облегчённая копия для показа в портфолио / на GitHub Pages.
 * Вся реклама и SDK Яндекс Игр отсюда вырезаны:
 *  - rewarded-кнопки ("+50", "Бесплатный кейс", "Бонус") срабатывают сразу;
 *  - полноэкранная реклама не показывается;
 *  - прогресс хранится только в localStorage;
 *  - таблица лидеров показывает только ботов + игрока.
 *
 * Полная версия с интегрированным SDK и рекламой продаётся —
 * контакты в окне "Игра продаётся" (js/sale.js).
 * ------------------------------------------------------------
 */

const SAVE_KEY = 'aura_drop_demo_save';

export async function initYandexSDK() {
  return { isAvailable: false, isReady: true };
}

export function isSDKAvailable() {
  return false;
}

/** Реклама в демо отключена — сразу "закрываемся". */
export function showFullscreenAdv(options = {}) {
  options.onClose?.(false);
}

/** В демо награда выдаётся сразу, без ролика. */
export function showRewardedVideo({ onRewarded, onClose } = {}) {
  onRewarded?.();
  onClose?.(true);
}

export async function savePlayerData(data) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    return false;
  }
}

export async function loadPlayerData() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function getYSDK() {
  return null;
}

export async function setLeaderboardScore() {
  return false;
}

export async function getLeaderboardEntries() {
  return [];
}
