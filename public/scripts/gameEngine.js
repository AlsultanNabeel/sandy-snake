(function () {
    const canvas = document.getElementById("gameCanvas");
    const context = canvas.getContext("2d");
    const scoreValueEl = document.getElementById("scoreValue");
    const statusMessageEl = document.getElementById("statusMessage");

    const CONFIG = {
        tileSize: 20,
        boardTiles: 21,
        snakeSpeedMs: 160,
        snakeBaseLength: 3,
        colors: {
            snakeHead: "#22c55e",
            snakeBody: "#16a34a",
            pellet: "#eab308",
            background: "#0b1120",
            grid: "rgba(248, 250, 252, 0.05)",
        },
    };

    const state = {
        snake: [],
        direction: { x: 0, y: 0 },
        queuedDirection: { x: 0, y: 0 },
        pellet: null,
        score: 0,
        timerId: null,
        isAlive: true,
        swipeStart: null,
    };

    const boardPixels = CONFIG.tileSize * CONFIG.boardTiles;
    canvas.width = boardPixels;
    canvas.height = boardPixels;

    function createInitialSnake() {
        const center = Math.floor(CONFIG.boardTiles / 2);
        const snake = [];
        for (let i = 0; i < CONFIG.snakeBaseLength; i += 1) {
            snake.push({ x: center - i, y: center });
        }
        return snake;
    }

    function randomPelletPosition() {
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * CONFIG.boardTiles),
                y: Math.floor(Math.random() * CONFIG.boardTiles),
            };
        } while (state.snake.some(segment => segment.x === position.x && segment.y === position.y));
        return position;
    }

    function setStatusMessage(message, isError = false) {
        statusMessageEl.textContent = message;
        statusMessageEl.style.color = isError ? "#f87171" : "#cbd5f5";
    }

    function updateScoreDisplay() {
        scoreValueEl.textContent = String(state.score);
    }

    function resetGame() {
        state.snake = createInitialSnake();
        state.direction = { x: 1, y: 0 };
        state.queuedDirection = { x: 1, y: 0 };
        state.pellet = randomPelletPosition();
        state.score = 0;
        state.isAlive = true;
        updateScoreDisplay();
        setStatusMessage("ابدأ بالحركة باستخدام الأسهم.");
    }

    function startLoop() {
        if (state.timerId) {
            clearInterval(state.timerId);
        }
        state.timerId = setInterval(gameTick, CONFIG.snakeSpeedMs);
    }

    function stopLoop() {
        if (state.timerId) {
            clearInterval(state.timerId);
            state.timerId = null;
        }
    }

    function applyQueuedDirection() {
        const { x, y } = state.queuedDirection;
        const { x: cx, y: cy } = state.direction;
        if (cx === -x && cy === -y) {
            return;
        }
        state.direction = { x, y };
    }

    function gameTick() {
        if (!state.isAlive) {
            return;
        }
        applyQueuedDirection();
        const nextHead = {
            x: state.snake[0].x + state.direction.x,
            y: state.snake[0].y + state.direction.y,
        };

        if (isOutOfBounds(nextHead)) {
            handleGameOver();
            return;
        }

        const hasEaten = state.pellet.x === nextHead.x && state.pellet.y === nextHead.y;
        state.snake.unshift(nextHead);

        if (hasEaten) {
            state.score += 1;
            updateScoreDisplay();
            state.pellet = randomPelletPosition();
            setStatusMessage("أحسنت! استمر في جمع الحبوب.");
        } else {
            state.snake.pop();
        }

        if (isSelfCollision(nextHead)) {
            handleGameOver();
            return;
        }

        renderFrame();
    }

    function isOutOfBounds(position) {
        return (
            position.x < 0 ||
            position.y < 0 ||
            position.x >= CONFIG.boardTiles ||
            position.y >= CONFIG.boardTiles
        );
    }

    function isSelfCollision(head) {
        for (let i = 1; i < state.snake.length; i += 1) {
            const segment = state.snake[i];
            if (segment.x === head.x && segment.y === head.y) {
                return true;
            }
        }
        return false;
    }

    function drawBackground() {
        context.fillStyle = CONFIG.colors.background;
        context.fillRect(0, 0, boardPixels, boardPixels);
        context.strokeStyle = CONFIG.colors.grid;
        context.lineWidth = 1;
        for (let i = 0; i <= CONFIG.boardTiles; i += 1) {
            const pos = i * CONFIG.tileSize;
            context.beginPath();
            context.moveTo(pos, 0);
            context.lineTo(pos, boardPixels);
            context.stroke();
            context.beginPath();
            context.moveTo(0, pos);
            context.lineTo(boardPixels, pos);
            context.stroke();
        }
    }

    function drawSnake() {
        context.fillStyle = CONFIG.colors.snakeBody;
        for (let i = state.snake.length - 1; i >= 0; i -= 1) {
            const segment = state.snake[i];
            const x = segment.x * CONFIG.tileSize;
            const y = segment.y * CONFIG.tileSize;
            const radius = CONFIG.tileSize * 0.35;
            drawRoundedRect(x, y, CONFIG.tileSize, CONFIG.tileSize, radius);
            if (i === 0) {
                context.fillStyle = CONFIG.colors.snakeHead;
                drawRoundedRect(x, y, CONFIG.tileSize, CONFIG.tileSize, radius);
                context.fillStyle = CONFIG.colors.snakeBody;
            }
        }
    }

    function drawPellet() {
        const size = CONFIG.tileSize;
        const x = state.pellet.x * size + size / 2;
        const y = state.pellet.y * size + size / 2;
        const radius = size * 0.3;
        context.beginPath();
        context.fillStyle = CONFIG.colors.pellet;
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
    }

    function drawRoundedRect(x, y, width, height, radius) {
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius);
        context.lineTo(x + width, y + height - radius);
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.fill();
    }

    function renderFrame() {
        drawBackground();
        drawPellet();
        drawSnake();
    }

    function handleGameOver() {
        state.isAlive = false;
        stopLoop();
        setStatusMessage("جيم أوفر! تم تصفير العداد. اضغط أي مفتاح للحركة لبدء جولة جديدة.", true);
        state.score = 0;
        updateScoreDisplay();
        setTimeout(() => {
            resetGame();
            renderFrame();
            startLoop();
        }, 1200);
    }

    function queueDirection(x, y) {
        if (!state.isAlive) {
            return;
        }
        state.queuedDirection = { x, y };
    }

    function handleKeydown(event) {
        const key = event.key.toLowerCase();
        if (key === "arrowup" || key === "w") {
            queueDirection(0, -1);
        } else if (key === "arrowdown" || key === "s") {
            queueDirection(0, 1);
        } else if (key === "arrowleft" || key === "a") {
            queueDirection(-1, 0);
        } else if (key === "arrowright" || key === "d") {
            queueDirection(1, 0);
        }
    }

    function handleTouchStart(event) {
        if (event.touches.length !== 1) {
            return;
        }
        const touch = event.touches[0];
        state.swipeStart = { x: touch.clientX, y: touch.clientY };
    }

    function handleTouchMove(event) {
        if (!state.swipeStart || event.changedTouches.length !== 1) {
            return;
        }
        const touch = event.changedTouches[0];
        const dx = touch.clientX - state.swipeStart.x;
        const dy = touch.clientY - state.swipeStart.y;
        const threshold = 24;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) {
            return;
        }
        if (Math.abs(dx) > Math.abs(dy)) {
            queueDirection(dx > 0 ? 1 : -1, 0);
        } else {
            queueDirection(0, dy > 0 ? 1 : -1);
        }
        state.swipeStart = null;
    }

    function preventScrollOnSpace(event) {
        if (event.code === "Space" && event.target === document.body) {
            event.preventDefault();
        }
    }

    function initEventListeners() {
        document.addEventListener("keydown", handleKeydown);
        document.addEventListener("keydown", preventScrollOnSpace, { passive: false });
        canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
        canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    }

    function init() {
        resetGame();
        initEventListeners();
        renderFrame();
        startLoop();
    }

    init();
})();