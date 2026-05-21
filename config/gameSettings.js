// Game settings configuration for Snake and Ladder application
// All values are centralized here to keep game behavior consistent across modules

const gameSettings = Object.freeze({
    board: Object.freeze({
        width: 600,              // Total board width in pixels
        height: 600,             // Total board height in pixels
        columns: 20,             // Number of horizontal grid cells
        rows: 20,                // Number of vertical grid cells
        backgroundColor: "#121212"
    }),

    snake: Object.freeze({
        initialLength: 3,        // Starting length of the snake in segments
        initialDirection: "right",
        color: "#29e36a",
        headColor: "#ffffff",
        cellSize: 30,            // Size of each snake segment in pixels
        growPerFood: 1
    }),

    food: Object.freeze({
        color: "#ff5252",
        spawnIntervalMs: 0,      // 0 means spawn immediately when eaten
        maxOnBoard: 1
    }),

    gameLoop: Object.freeze({
        tickRateMs: 120,         // Delay between movement updates
        inputBufferSize: 2,      // Max queued direction changes
        acceleration: 0          // Additional speed per food (0 keeps constant)
    }),

    scoring: Object.freeze({
        pointsPerFood: 1,
        resetOnGameOver: true
    }),

    boundaries: Object.freeze({
        wrapAround: false,       // Hitting wall triggers game over
        displayGameOverMessage: "Game Over: Press any key to restart"
    })
});

export default gameSettings;
