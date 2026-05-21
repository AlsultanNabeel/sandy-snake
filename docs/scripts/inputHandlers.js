const KEY_DIRECTION_MAP = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  W: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  S: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  A: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
  D: { x: 1, y: 0 }
};

const SWIPE_THRESHOLD = 18;
let controller = {
  onDirectionChange: function () {},
  onReset: function () {},
  onPause: null,
  onResume: null,
  onGameOver: null
};
let boardElement = null;
let restartElement = null;
let isBound = false;
let isGamePaused = false;
let isGameOver = false;
let touchStartPoint = null;
let activeResetTimer = null;

function handleKeyDown(event) {
  if (!isBound) {
    return;
  }

  const direction = KEY_DIRECTION_MAP[event.key];
  if (direction) {
    event.preventDefault();
    if (isGameOver) {
      attemptReset();
      return;
    }
    resumeIfPaused();
    controller.onDirectionChange(direction);
    return;
  }

  if (event.key === ' ' || event.key === 'Spacebar') {
    event.preventDefault();
    if (isGameOver) {
      attemptReset();
    } else {
      togglePauseState();
    }
    return;
  }

  if (event.key === 'r' || event.key === 'R') {
    event.preventDefault();
    attemptReset();
  }
}

function handleBoardClick() {
  if (isGameOver) {
    attemptReset();
  }
}

function handleTouchStart(event) {
  if (!event.changedTouches || event.changedTouches.length === 0) {
    return;
  }
  const touch = event.changedTouches[0];
  touchStartPoint = { x: touch.clientX, y: touch.clientY };
}

function handleTouchEnd(event) {
  if (!touchStartPoint || !event.changedTouches || event.changedTouches.length === 0) {
    touchStartPoint = null;
    return;
  }

  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartPoint.x;
  const deltaY = touch.clientY - touchStartPoint.y;
  touchStartPoint = null;

  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  if (absX < SWIPE_THRESHOLD && absY < SWIPE_THRESHOLD) {
    if (isGameOver) {
      attemptReset();
    }
    return;
  }

  const direction = absX > absY
    ? { x: deltaX > 0 ? 1 : -1, y: 0 }
    : { x: 0, y: deltaY > 0 ? 1 : -1 };

  if (isGameOver) {
    attemptReset();
    return;
  }

  resumeIfPaused();
  controller.onDirectionChange(direction);
}

function attemptReset() {
  if (!isBound) {
    return;
  }
  clearResetTimer();
  isGameOver = false;
  isGamePaused = false;
  controller.onReset();
  if (controller.onResume) {
    controller.onResume();
  }
}

function togglePauseState() {
  if (isGamePaused) {
    isGamePaused = false;
    if (controller.onResume) {
      controller.onResume();
    }
  } else {
    isGamePaused = true;
    if (controller.onPause) {
      controller.onPause();
    }
  }
}

function resumeIfPaused() {
  if (!isGamePaused) {
    return;
  }
  isGamePaused = false;
  if (controller.onResume) {
    controller.onResume();
  }
}

function clearResetTimer() {
  if (activeResetTimer) {
    clearTimeout(activeResetTimer);
    activeResetTimer = null;
  }
}

export function initializeInputHandlers(options) {
  if (isBound) {
    teardownInputHandlers();
  }

  controller = Object.assign({}, controller, options || {});
  boardElement = options && options.boardElement ? options.boardElement : document.body;
  restartElement = options && options.restartButton ? options.restartButton : null;

  window.addEventListener('keydown', handleKeyDown, { passive: false });
  boardElement.addEventListener('click', handleBoardClick);
  boardElement.addEventListener('touchstart', handleTouchStart, { passive: true });
  boardElement.addEventListener('touchend', handleTouchEnd, { passive: true });
  if (restartElement) {
    restartElement.addEventListener('click', attemptReset);
  }

  isBound = true;
}

export function teardownInputHandlers() {
  if (!isBound) {
    return;
  }
  window.removeEventListener('keydown', handleKeyDown, { passive: false });
  boardElement.removeEventListener('click', handleBoardClick);
  boardElement.removeEventListener('touchstart', handleTouchStart);
  boardElement.removeEventListener('touchend', handleTouchEnd);
  if (restartElement) {
    restartElement.removeEventListener('click', attemptReset);
  }
  clearResetTimer();
  isBound = false;
}

export function signalGameOver(options) {
  if (isGameOver || !isBound) {
    return;
  }
  isGameOver = true;
  isGamePaused = false;
  clearResetTimer();
  if (controller.onGameOver) {
    controller.onGameOver();
  }
  const config = options || {};
  if (config.autoRestartDelay != null && config.autoRestartDelay >= 0) {
    activeResetTimer = setTimeout(attemptReset, config.autoRestartDelay);
  }
}
