        let currentPlayer = 'X';
        let gameBoard = ['', '', '', '', '', '', '', '', ''];
        let gameActive = true;

        const winningConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        function initializeGame() {
            const board = document.getElementById('gameBoard');
            board.innerHTML = '';
            
            for (let i = 0; i < 9; i++) {
                const cell = document.createElement('button');
                cell.classList.add('cell');
                cell.setAttribute('data-index', i);
                cell.addEventListener('click', handleCellClick);
                board.appendChild(cell);
            }
            
            updateGameStatus(`Player ${currentPlayer}'s Turn`);
        }

        function handleCellClick(e) {
            const clickedCell = e.target;
            const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

            if (gameBoard[clickedCellIndex] !== '' || !gameActive) {
                return;
            }

            gameBoard[clickedCellIndex] = currentPlayer;
            clickedCell.textContent = currentPlayer;
            clickedCell.classList.add(currentPlayer.toLowerCase());
            clickedCell.disabled = true;

            checkResult();
        }

        function checkResult() {
            let roundWon = false;
            let winningCells = [];

            for (let i = 0; i < winningConditions.length; i++) {
                const [a, b, c] = winningConditions[i];
                if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
                    roundWon = true;
                    winningCells = [a, b, c];
                    break;
                }
            }

            if (roundWon) {
                updateGameStatus(`Player ${currentPlayer} Wins! 🎉`);
                highlightWinningCells(winningCells);
                gameActive = false;
                return;
            }

            if (!gameBoard.includes('')) {
                updateGameStatus("It's a Draw! 🤝");
                gameActive = false;
                return;
            }

            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateGameStatus(`Player ${currentPlayer}'s Turn`);
        }

        function highlightWinningCells(cells) {
            const allCells = document.querySelectorAll('.cell');
            cells.forEach(index => {
                allCells[index].classList.add('winning-cells');
            });
        }

        function updateGameStatus(message) {
            const statusElement = document.getElementById('gameStatus');
            statusElement.textContent = message;
            
            if (message.includes('Wins') || message.includes('Draw')) {
                statusElement.classList.add('winner');
            } else {
                statusElement.classList.remove('winner');
            }
        }

        function resetGame() {
            currentPlayer = 'X';
            gameBoard = ['', '', '', '', '', '', '', '', ''];
            gameActive = true;
            
            const cells = document.querySelectorAll('.cell');
            cells.forEach(cell => {
                cell.textContent = '';
                cell.disabled = false;
                cell.classList.remove('x', 'o', 'winning-cells');
            });
            
            updateGameStatus(`Player ${currentPlayer}'s Turn`);
        }

        // Initialize the game when page loads
        window.addEventListener('DOMContentLoaded', initializeGame);

        let xWins = 0;
let oWins = 0;
let draws = 0;
function checkResult() {
    let roundWon = false;
    let winningCells = [];

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            roundWon = true;
            winningCells = [a, b, c];
            break;
        }
    }

    if (roundWon) {
        updateGameStatus(`Player ${currentPlayer} Wins! 🎉`);
        highlightWinningCells(winningCells);
        gameActive = false;

        if (currentPlayer === 'X') {
            xWins++;
        } else {
            oWins++;
        }

        updateLeaderboard();
        return;
    }

    if (!gameBoard.includes('')) {
        updateGameStatus("It's a Draw! 🤝");
        gameActive = false;
        draws++;
        updateLeaderboard();
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateGameStatus(`Player ${currentPlayer}'s Turn`);

    function updateLeaderboard() {
    document.getElementById('xWins').textContent = xWins;
    document.getElementById('oWins').textContent = oWins;
    document.getElementById('draws').textContent = draws;
}
window.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    updateLeaderboard();
});
let xWins = parseInt(localStorage.getItem('xWins')) || 0;
let oWins = parseInt(localStorage.getItem('oWins')) || 0;
let draws = parseInt(localStorage.getItem('draws')) || 0;

localStorage.setItem('xWins', xWins);
localStorage.setItem('oWins', oWins);
localStorage.setItem('draws', draws);


}

