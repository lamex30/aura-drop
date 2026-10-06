/**
 * visualHelper.js
 * ------------------------------------------------------------
 * Общая функция рендера "картинки" предмета/кейса: если у сущности задан
 * sprite (путь к PNG на прозрачном фоне — см. config/items.js,
 * config/cases.js), рендерим <img>; иначе — fallback на emoji.
 *
 * Размер картинки завязан на font-size контейнера (см. .item-icon в
 * css/style.css: width/height в em) — поэтому один и тот же хелпер
 * корректно работает во всех местах (лента кейса, карточки инвентаря,
 * колесо апгрейда, каталог персонажей, список кейсов и т.д.) без
 * дополнительных настроек под каждый размер.
 * ------------------------------------------------------------
 */

export function renderVisualHTML(entity) {
  if (!entity) return '';
  if (entity.sprite) {
    return `<img class="item-icon" src="${entity.sprite}" alt="" draggable="false" />`;
  }
  return entity.emoji || '';
}
