/**
 * currency.js
 * ------------------------------------------------------------
 * Баланс игрока (монеты). Хранит состояние в памяти, персистится
 * через systems/inventory.js -> saveProgress() (единая точка сохранения).
 * ------------------------------------------------------------
 */

const STARTING_BALANCE = 100; // TODO(баланс): стартовый баланс новых игроков

let balance = STARTING_BALANCE;

const listeners = new Set();

export function getBalance() {
  return balance;
}

export function setBalance(value) {
  balance = Math.max(0, Math.floor(value));
  notify();
}

export function addCoins(amount) {
  if (amount <= 0) return;
  balance += Math.floor(amount);
  notify();
}

/**
 * Списывает монеты, если хватает баланса.
 * @returns {boolean} true если списание прошло успешно
 */
export function spendCoins(amount) {
  if (amount <= 0) return true;
  if (balance < amount) return false;
  balance -= Math.floor(amount);
  notify();
  return true;
}

export function canAfford(amount) {
  return balance >= amount;
}

export function onBalanceChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify() {
  listeners.forEach((cb) => cb(balance));
}

// --- сериализация для сохранения ---
export function serializeCurrency() {
  return { balance };
}

export function hydrateCurrency(data) {
  if (data && typeof data.balance === 'number') {
    balance = data.balance;
  } else {
    balance = STARTING_BALANCE;
  }
  notify();
}
