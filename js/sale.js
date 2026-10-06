/**
 * sale.js — окно "Игра продаётся" (только в демо-версии).
 * Показывается при первом заходе и по кнопке "₽ Продаётся" в шапке.
 */
(function () {
  var KEY = 'aura_drop_sale_seen';
  var modal = document.getElementById('sale-modal');
  var openBtn = document.getElementById('sale-open-btn');
  if (!modal) return;

  function open() {
    modal.classList.add('visible');
    document.body.classList.add('sale-lock');
  }
  function close() {
    modal.classList.remove('visible');
    document.body.classList.remove('sale-lock');
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
  }

  if (openBtn) openBtn.addEventListener('click', open);
  modal.addEventListener('click', function (e) {
    if (e.target === modal || e.target.closest('[data-sale-close]')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('visible')) close();
  });

  var seen = false;
  try { seen = localStorage.getItem(KEY) === '1'; } catch (e) {}
  if (!seen) setTimeout(open, 700);
})();
