const resultEl = document.querySelector('#result');
const expressionEl = document.querySelector('#expression');
const keysEl = document.querySelector('.keys');

const state = {
  current: '0',
  previous: null,
  operator: null,
  overwrite: false,
};

function updateDisplay() {
  resultEl.textContent = state.current;

  if (state.operator && state.previous !== null) {
    expressionEl.textContent = `${state.previous} ${symbolForOperator(state.operator)}`;
  } else {
    expressionEl.textContent = '';
  }
}

function symbolForOperator(operator) {
  return (
    {
      '+': '+',
      '-': '−',
      '*': '×',
      '/': '÷',
    }[operator] || ''
  );
}

function inputDigit(digit) {
  if (state.overwrite) {
    state.current = digit === '.' ? '0.' : digit;
    state.overwrite = false;
    updateDisplay();
    return;
  }

  if (digit === '.') {
    if (!state.current.includes('.')) {
      state.current += '.';
    }
  } else {
    state.current = state.current === '0' ? digit : state.current + digit;
  }

  updateDisplay();
}

function clearState() {
  state.current = '0';
  state.previous = null;
  state.operator = null;
  state.overwrite = false;
  updateDisplay();
}

function toggleSign() {
  if (state.current === '0') return;
  state.current = state.current.startsWith('-')
    ? state.current.slice(1)
    : `-${state.current}`;
  updateDisplay();
}

function applyPercent() {
  const value = parseFloat(state.current);
  if (Number.isNaN(value)) return;
  state.current = (value / 100).toString();
  updateDisplay();
}

function setOperator(operator) {
  const currentValue = parseFloat(state.current);

  if (state.operator && state.previous !== null && !state.overwrite) {
    const result = evaluate(state.previous, currentValue, state.operator);
    if (result !== null) {
      state.previous = result;
      state.current = String(result);
    }
  } else {
    state.previous = currentValue;
  }

  state.operator = operator;
  state.overwrite = true;
  updateDisplay();
}

function evaluate(previous, current, operator) {
  let result = null;
  switch (operator) {
    case '+':
      result = previous + current;
      break;
    case '-':
      result = previous - current;
      break;
    case '*':
      result = previous * current;
      break;
    case '/':
      if (current === 0) {
        resultEl.textContent = 'Nope';
        expressionEl.textContent = '';
        state.current = '0';
        state.previous = null;
        state.operator = null;
        state.overwrite = true;
        return null;
      }
      result = previous / current;
      break;
    default:
      return null;
  }
  return parseFloat(result.toFixed(10));
}

function handleEquals() {
  if (state.operator === null || state.previous === null) {
    return;
  }
  const currentValue = parseFloat(state.current);
  const computation = evaluate(state.previous, currentValue, state.operator);
  if (computation === null) {
    return;
  }
  state.current = String(computation);
  state.previous = null;
  state.operator = null;
  state.overwrite = true;
  updateDisplay();
}

function handleKey({ target }) {
  if (!(target instanceof HTMLButtonElement)) return;

  if (target.dataset.digit) {
    inputDigit(target.dataset.digit);
    return;
  }

  if (target.dataset.operator) {
    setOperator(target.dataset.operator);
    return;
  }

  switch (target.dataset.action) {
    case 'clear':
      clearState();
      break;
    case 'sign':
      toggleSign();
      break;
    case 'percent':
      applyPercent();
      break;
    case 'equals':
      handleEquals();
      break;
    default:
      break;
  }
}

function handleKeyboard(event) {
  const { key } = event;

  if (/[0-9]/.test(key)) {
    inputDigit(key);
    return;
  }

  if (key === '.') {
    inputDigit(key);
    return;
  }

  if (['+', '-', '*', '/'].includes(key)) {
    event.preventDefault();
    setOperator(key);
    return;
  }

  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    handleEquals();
    return;
  }

  if (key === 'Backspace') {
    if (state.overwrite || state.current.length === 1) {
      state.current = '0';
    } else {
      state.current = state.current.slice(0, -1);
    }
    state.overwrite = false;
    updateDisplay();
    return;
  }

  if (key === 'Escape') {
    clearState();
  }
}

keysEl.addEventListener('click', handleKey);
window.addEventListener('keydown', handleKeyboard);

updateDisplay();
