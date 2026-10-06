/**
 * leaderboardUI.js
 * ------------------------------------------------------------
 * Экран "Таблица лидеров" — рендерит systems/leaderboard.js (фейковые
 * игроки с "живым" колебанием счёта + реальная строка игрока).
 * ------------------------------------------------------------
 */

import { getLeaderboard, onLeaderboardChange, initLeaderboard } from '../systems/leaderboard.js?v=3';

let listEl = null;

export function initLeaderboardUI() {
  listEl = document.getElementById('leaderboard-list');
  if (!listEl) return;

  onLeaderboardChange(render);
  initLeaderboard();
  render(getLeaderboard());
}

function render(rows) {
  if (!listEl) return;
  const data = rows || getLeaderboard();

  listEl.innerHTML = '';
  data.forEach((row, i) => {
    const rank = i + 1;
    const el = document.createElement('div');
    el.className = 'leaderboard-row' + (row.isPlayer ? ' is-player' : '') + (rank <= 3 ? ` top${rank}` : '');
    const avatarHTML = row.avatarUrl
      ? `<img src="${row.avatarUrl}" alt="" draggable="false" />`
      : row.avatar;

    el.innerHTML = `
      <div class="leaderboard-rank">${rank}</div>
      <div class="leaderboard-avatar">${avatarHTML}</div>
      <div class="leaderboard-name">${row.name}${row.isPlayer ? '<span class="you-badge">Вы</span>' : ''}${row.isReal ? '<span class="real-badge" title="Реальный игрок">•</span>' : ''}</div>
      <div class="leaderboard-score"><span class="coin-icon"></span>${row.score.toLocaleString('ru-RU')}</div>
    `;
    listEl.appendChild(el);
  });
}
