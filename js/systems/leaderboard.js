/**
 * leaderboard.js
 * ------------------------------------------------------------
 * "Онлайн" лидерборд — три источника строк, смешанные в один список:
 *  1. Фейковые боты со случайно колеблющимся счётом (создают ощущение
 *     живого рейтинга даже когда реальных игроков мало) — оставлены
 *     по явной просьбе, не убираются.
 *  2. Настоящие игроки платформы — через реальный Yandex Leaderboards
 *     API (systems/yandexSDK.js -> getLeaderboardEntries/setLeaderboardScore).
 *     Вне Яндекс.Игр (dev-режим) это просто пустой список.
 *  3. Сама строка текущего игрока — считается локально из баланса +
 *     стоимости инвентаря при продаже (config/rarities.js -> getSellPrice()),
 *     и периодически отправляется в реальный лидерборд тем же числом.
 *
 * ВАЖНО: LEADERBOARD_NAME должен точно совпадать с техническим именем
 * лидерборда, созданного в кабинете разработчика Яндекс Игр (раздел
 * "Таблицы лидеров") — если лидерборд с таким именем там не создан,
 * setLeaderboardScore/getLeaderboardEntries просто молча проваливаются
 * (см. try/catch в yandexSDK.js), и в списке остаются только боты + игрок.
 * ------------------------------------------------------------
 */

import { getBalance, onBalanceChange } from './currency.js?v=3';
import { getInventory, onInventoryChange } from './inventory.js?v=3';
import { getSellPrice } from '../config/rarities.js?v=3';
import { setLeaderboardScore, getLeaderboardEntries } from './yandexSDK.js?v=3';

const LEADERBOARD_NAME = 'auraDropNetWorth';

// Не спамим API отправкой счёта на каждое изменение баланса/инвентаря —
// достаточно раз в REAL_SCORE_SUBMIT_INTERVAL, реальная позиция в топе
// всё равно обновляется не мгновенно.
const REAL_SCORE_SUBMIT_INTERVAL = 30000;
const REAL_ENTRIES_REFRESH_INTERVAL = 60000;

const FAKE_PLAYERS = [
  { name: 'ГигаЧад1337', avatar: '🗿', base: 48200 },
  { name: 'xX_Sigma_Xx', avatar: '😎', base: 41500 },
  { name: 'ДропХантер', avatar: '🎯', base: 36800 },
  { name: 'ТралалелоФан', avatar: '🦈', base: 29900 },
  { name: 'rizzler_pro', avatar: '💅', base: 24700 },
  { name: 'ОгайоБой', avatar: '🌽', base: 19300 },
  { name: 'nastya_uwu', avatar: '🎀', base: 15600 },
  { name: 'kirill_sigma', avatar: '🐺', base: 11200 },
  { name: 'ПацанСХрущёвки', avatar: '🏚️', base: 8400 },
  { name: 'liza_gacha', avatar: '🎰', base: 5200 },
  { name: 'egor_rizz', avatar: '🔥', base: 3100 },
  { name: 'FarmerAlex', avatar: '🌾', base: 1800 },
];

let fakeScores = FAKE_PLAYERS.map((p) => p.base + Math.floor(Math.random() * 400));
let realRows = []; // последний успешно загруженный снимок реальных игроков (см. refreshRealEntries)
const listeners = new Set();
let fakeTickTimerId = null;
let realRefreshTimerId = null;
let scoreSubmitTimerId = null;

function playerNetWorth() {
  const inventoryValue = getInventory().reduce(
    (sum, e) => sum + (e.item ? getSellPrice(e.item) : 0),
    0
  );
  return getBalance() + inventoryValue;
}

export function getLeaderboard() {
  const rows = FAKE_PLAYERS.map((p, i) => ({
    name: p.name,
    avatar: p.avatar,
    avatarUrl: null,
    score: fakeScores[i],
    isPlayer: false,
  }));
  rows.push(...realRows);
  rows.push({ name: 'Вы', avatar: '🧑', avatarUrl: null, score: playerNetWorth(), isPlayer: true });
  rows.sort((a, b) => b.score - a.score);
  return rows;
}

function notify() {
  listeners.forEach((cb) => cb(getLeaderboard()));
}

/**
 * Небольшие случайные колебания счёта ботов через случайный интервал —
 * тот же приём "псевдо-активности", что и в systems/lootFeed.js, только
 * применённый к рейтингу, чтобы он выглядел "живым", а не статичной таблицей.
 */
function tickFakeScores() {
  fakeScores = fakeScores.map((s) => Math.max(0, s + Math.floor((Math.random() - 0.35) * 250)));
  notify();
  fakeTickTimerId = setTimeout(tickFakeScores, 4000 + Math.random() * 5000);
}

/**
 * Подгружает реальную верхушку лидерборда с платформы и превращает её в
 * строки того же формата, что и боты/игрок. Аватарка реального игрока —
 * асинхронный вызов на КАЖДУЮ запись (см. player.getAvatarSrc в Yandex
 * SDK), поэтому маппинг идёт через Promise.all, а не синхронно.
 */
async function refreshRealEntries() {
  const entries = await getLeaderboardEntries(LEADERBOARD_NAME);

  realRows = await Promise.all(
    entries.map(async (entry) => {
      let avatarUrl = null;
      try {
        avatarUrl = (await entry.player?.getAvatarSrc?.('small')) || null;
      } catch {
        avatarUrl = null;
      }
      return {
        name: entry.player?.publicName || 'Игрок Яндекса',
        avatar: '👤',
        avatarUrl,
        score: entry.score,
        isPlayer: false,
        isReal: true,
      };
    })
  );

  notify();
  realRefreshTimerId = setTimeout(refreshRealEntries, REAL_ENTRIES_REFRESH_INTERVAL);
}

/**
 * Отправляет текущий счёт игрока в реальный лидерборд платформы —
 * периодически, а не на каждое изменение (см. REAL_SCORE_SUBMIT_INTERVAL).
 */
function scheduleScoreSubmit() {
  setLeaderboardScore(LEADERBOARD_NAME, playerNetWorth());
  scoreSubmitTimerId = setTimeout(scheduleScoreSubmit, REAL_SCORE_SUBMIT_INTERVAL);
}

export function initLeaderboard() {
  if (fakeTickTimerId) return; // защита от повторной инициализации
  onBalanceChange(notify);
  onInventoryChange(notify);
  tickFakeScores();
  refreshRealEntries();
  scheduleScoreSubmit();
}

export function onLeaderboardChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
