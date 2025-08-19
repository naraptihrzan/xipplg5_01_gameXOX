// Game State Variables
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = false;
let gameMode = 'pvp'; // 'pvp' or 'pvb'
let player1Name = '';
let player2Name = '';
let isBot = false;

// Winning Conditions
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Game Mode Selection
function selectMode(mode) {
    gameMode = mode;
    const buttons = document.querySelectorAll('.mode-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    const gameModeIndicator = document.getElementById('gameModeIndicator');
    
    if (mode === 'pvp') {
        buttons[0].classList.add('active');
        document.getElementById('player2Name').placeholder = 'Player 2 Name';
        gameModeIndicator.innerHTML = '<i class="fas fa-users"></i> Player vs Player';
    } else {
        buttons[1].classList.add('active');
        document.getElementById('player2Name').placeholder = 'Bot Name (optional)';
        gameModeIndicator.innerHTML = '<i class="fas fa-robot"></i> Player vs Bot';
    }
}

// Start Game Function
function startGame() {
    const p1Name = document.getElementById('player1Name').value.trim();
    const p2Name = document.getElementById('player2Name').value.trim();

    if (!p1Name) {
        alert('Please enter Player 1 name!');
        return;
    }

    player1Name = p1Name;
    player2Name = gameMode === 'pvb' ? (p2Name || 'Bot') : (p2Name || 'Player 2');
    isBot = gameMode === 'pvb';

    // Update player displays
    document.getElementById('player1Display').textContent = player1Name;
    document.getElementById('player2Display').textContent = player2Name;
    
    // Update player 2 icon for bot
    const player2Icon = document.getElementById('player2Icon');
    if (isBot) {
        player2Icon.className = 'fas fa-robot';
    } else {
        player2Icon.className = 'fas fa-user-friends';
    }

    // Hide name input, show game
    document.getElementById('nameInputSection').classList.add('hidden');
    document.getElementById('gameSection').classList.remove('hidden');

    initializeGame();
    updateLeaderboard();
}

// New Game Function
function newGame() {
    document.getElementById('nameInputSection').classList.remove('hidden');
    document.getElementById('gameSection').classList.add('hidden');
    
    // Reset form
    document.getElementById('player1Name').value = '';
    document.getElementById('player2Name').value = '';
    selectMode('pvp');
    
    // Reset player cards
    document.getElementById('player1Card').classList.remove('active');
    document.getElementById('player2Card').classList.remove('active');
}

// Initialize Game Board
function initializeGame() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    
    // Create board cells
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('button');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', handleCellClick);
        board.appendChild(cell);
    }
    
    updateGameStatus();
    updatePlayerCards();
}

// Handle Cell Click
function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameBoard[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    makeMove(clickedCellIndex, clickedCell);
}

// Make a Move
function makeMove(index, cellElement = null) {
    gameBoard[index] = currentPlayer;
    
    if (!cellElement) {
        cellElement = document.querySelector(`[data-index="${index}"]`);
    }
    
    cellElement.textContent = currentPlayer;
    cellElement.classList.add(currentPlayer.toLowerCase());
    cellElement.disabled = true;

    checkResult();
}

// Check Game Result
function checkResult() {
    let roundWon = false;
    let winningCells = [];

    // Check for winning conditions
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            roundWon = true;
            winningCells = [a, b, c];
            break;
        }
    }

    if (roundWon) {
        const winner = getCurrentPlayerName();
        updateGameStatusMessage(`${winner} Wins! 🎉`);
        highlightWinningCells(winningCells);
        gameActive = false;

        // Tambahin ini biar confetti muncul
        startConfetti();
        
        // Save to localStorage
        saveGameResult('win', currentPlayer);
        updateLeaderboard();
        return;
    }

    // Check for draw
    if (!gameBoard.includes('')) {
        updateGameStatusMessage("It's a Draw! 🤝");
        gameActive = false;
        
        // Save to localStorage
        saveGameResult('draw');
        updateLeaderboard();
        return;
    }

    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateGameStatus();
    updatePlayerCards();

    // Bot turn
    if (isBot && currentPlayer === 'O' && gameActive) {
        setTimeout(botMove, 800);
    }
}

// Get Current Player Name
function getCurrentPlayerName() {
    return currentPlayer === 'X' ? player1Name : player2Name;
}

// Update Game Status
function updateGameStatus() {
    const currentPlayerName = getCurrentPlayerName();
    updateGameStatusMessage(`${currentPlayerName}'s Turn`);
}

// Update Game Status Message
function updateGameStatusMessage(message) {
    const statusElement = document.getElementById('gameStatus');
    const iconElement = statusElement.querySelector('i');
    const textElement = statusElement.querySelector('span');
    
    if (message.includes('Wins')) {
        iconElement.className = 'fas fa-crown';
        statusElement.classList.add('winner');
        textElement.textContent = message;
    } else if (message.includes('Draw')) {
        iconElement.className = 'fas fa-handshake';
        statusElement.classList.add('winner');
        textElement.textContent = message;
    } else {
        iconElement.className = 'fas fa-play-circle';
        statusElement.classList.remove('winner');
        textElement.textContent = message;
    }
}

// Update Player Cards
function updatePlayerCards() {
    const player1Card = document.getElementById('player1Card');
    const player2Card = document.getElementById('player2Card');
    
    if (currentPlayer === 'X') {
        player1Card.classList.add('active');
        player2Card.classList.remove('active');
    } else {
        player1Card.classList.remove('active');
        player2Card.classList.add('active');
    }
}

// Bot Move Logic
function botMove() {
    if (!gameActive) return;
    
    // Simple AI: Try to win, block player, or random move
    let bestMove = -1;
    
    // Try to win
    bestMove = findWinningMove('O');
    if (bestMove === -1) {
        // Try to block player
        bestMove = findWinningMove('X');
    }
    if (bestMove === -1) {
        // Random move
        const availableMoves = [];
        for (let i = 0; i < 9; i++) {
            if (gameBoard[i] === '') {
                availableMoves.push(i);
            }
        }
        if (availableMoves.length > 0) {
            bestMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
    }

    if (bestMove !== -1) {
        makeMove(bestMove);
    }
}

// Find Winning Move
function findWinningMove(player) {
    for (let i = 0; i < 9; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = player;
            
            for (let j = 0; j < winningConditions.length; j++) {
                const [a, b, c] = winningConditions[j];
                if (gameBoard[a] === player && gameBoard[b] === player && gameBoard[c] === player) {
                    gameBoard[i] = '';
                    return i;
                }
            }
            
            gameBoard[i] = '';
        }
    }
    return -1;
}

// Highlight Winning Cells
function highlightWinningCells(cells) {
    const allCells = document.querySelectorAll('.cell');
    cells.forEach(index => {
        allCells[index].classList.add('winning-cells');
    });
}

// Reset Game
function resetGame() {
    initializeGame();
}

// Save Game Result
function saveGameResult(result, winner = null) {
    const key = gameMode === 'pvp' ? 'pvpStats' : 'pvbStats';
    let stats = JSON.parse(localStorage.getItem(key)) || {};

    if (!stats[player1Name]) {
        stats[player1Name] = { wins: 0, losses: 0, draws: 0 };
    }
    if (!stats[player2Name]) {
        stats[player2Name] = { wins: 0, losses: 0, draws: 0 };
    }

    if (result === 'draw') {
        stats[player1Name].draws++;
        stats[player2Name].draws++;
    } else if (result === 'win') {
        if (winner === 'X') {
            stats[player1Name].wins++;
            stats[player2Name].losses++;
        } else {
            stats[player2Name].wins++;
            stats[player1Name].losses++;
        }
    }

    localStorage.setItem(key, JSON.stringify(stats));
}

// Switch Leaderboard Tab
function switchTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.stats-section');
    
    tabButtons.forEach(btn => btn.classList.remove('active'));
    sections.forEach(section => section.classList.remove('active'));
    
    if (tabName === 'pvp') {
        tabButtons[0].classList.add('active');
        document.getElementById('pvpStatsSection').classList.add('active');
    } else {
        tabButtons[1].classList.add('active');
        document.getElementById('pvbStatsSection').classList.add('active');
    }
}

// Update Leaderboard
function updateLeaderboard() {
    updatePvPStats();
    updatePvBStats();
}

// Update PvP Stats
function updatePvPStats() {
    const stats = JSON.parse(localStorage.getItem('pvpStats')) || {};
    const container = document.getElementById('pvpStatsContent');
    container.innerHTML = '';

    if (Object.keys(stats).length === 0) {
        container.innerHTML = `
            <div class="no-stats">
                <i class="fas fa-info-circle"></i>
                <p>No games played yet</p>
            </div>
        `;
        return;
    }

    // Sort players by wins
    const sortedPlayers = Object.entries(stats).sort((a, b) => b[1].wins - a[1].wins);

    for (const [player, data] of sortedPlayers) {
        const total = data.wins + data.losses + data.draws;
        const winRate = total > 0 ? ((data.wins / total) * 100).toFixed(1) : 0;
        
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-stats';
        playerDiv.innerHTML = `
            <div class="player-name-header">
                <i class="fas fa-user"></i>
                ${player}
            </div>
            <div class="stat-row">
                <span>Wins:</span>
                <span class="stat-value">${data.wins}</span>
            </div>
            <div class="stat-row">
                <span>Losses:</span>
                <span class="stat-value">${data.losses}</span>
            </div>
            <div class="stat-row">
                <span>Draws:</span>
                <span class="stat-value">${data.draws}</span>
            </div>
            <div class="stat-row">
                <span>Win Rate:</span>
                <span class="win-rate">${winRate}%</span>
            </div>
        `;
        container.appendChild(playerDiv);
    }
}

// Update PvB Stats
function updatePvBStats() {
    const stats = JSON.parse(localStorage.getItem('pvbStats')) || {};
    const container = document.getElementById('pvbStatsContent');
    container.innerHTML = '';

    if (Object.keys(stats).length === 0) {
        container.innerHTML = `
            <div class="no-stats">
                <i class="fas fa-info-circle"></i>
                <p>No games played yet</p>
            </div>
        `;
        return;
    }

    // Sort players by wins, exclude bots
    const players = Object.entries(stats).filter(([name]) => name !== 'Bot');
    const sortedPlayers = players.sort((a, b) => b[1].wins - a[1].wins);

    for (const [player, data] of sortedPlayers) {
        const total = data.wins + data.losses + data.draws;
        const winRate = total > 0 ? ((data.wins / total) * 100).toFixed(1) : 0;
        
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-stats';
        playerDiv.innerHTML = `
            <div class="player-name-header">
                <i class="fas fa-user"></i>
                ${player}
            </div>
            <div class="stat-row">
                <span>Wins vs Bot:</span>
                <span class="stat-value">${data.wins}</span>
            </div>
            <div class="stat-row">
                <span>Losses vs Bot:</span>
                <span class="stat-value">${data.losses}</span>
            </div>
            <div class="stat-row">
                <span>Draws vs Bot:</span>
                <span class="stat-value">${data.draws}</span>
            </div>
            <div class="stat-row">
                <span>Win Rate vs Bot:</span>
                <span class="win-rate">${winRate}%</span>
            </div>
        `;
        container.appendChild(playerDiv);
    }
}

// Clear All Statistics
function clearAllStats() {
    if (confirm('Are you sure you want to clear all statistics? This action cannot be undone.')) {
        localStorage.removeItem('pvpStats');
        localStorage.removeItem('pvbStats');
        updateLeaderboard();
        alert('All statistics have been cleared!');
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    updateLeaderboard();
    selectMode('pvp'); // Set default mode
});

/* ============================= */
/* 🎉 Confetti Effect            */
/* ============================= */

// Buat canvas confetti
const confettiCanvas = document.getElementById('confettiCanvas');
const ctx = confettiCanvas.getContext('2d');

let confettiPieces = [];
let animationFrameId;

function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Buat potongan confetti random
function createConfetti() {
    const colors = ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#ffbe0b', '#fb5607', '#8338ec', '#3a86ff', '#06d6a0'];
    for (let i = 0; i < 150; i++) {
        confettiPieces.push({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * confettiCanvas.height - confettiCanvas.height,
            size: Math.random() * 6 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * 360
        });
    }
}

// Animasi confetti
function drawConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiPieces.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);

        p.y += p.speed;
        p.x += Math.sin(p.angle) * 2;

        if (p.y > confettiCanvas.height) {
            p.y = -10;
            p.x = Math.random() * confettiCanvas.width;
        }
    });

    animationFrameId = requestAnimationFrame(drawConfetti);
}

// Mulai confetti
function startConfetti() {
    confettiPieces = [];
    createConfetti();
    cancelAnimationFrame(animationFrameId);
    drawConfetti();

    // stop setelah 5 detik
    setTimeout(() => {
        cancelAnimationFrame(animationFrameId);
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }, 5000);
}

/* ============================= */
/* 🔗 Integrasi ke Game Winner   */
/* ============================= */