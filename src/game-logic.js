export const ROWS = 6;
export const COLS = 7;
export const PLAYER_1 = 1;
export const PLAYER_2 = 2;

export function createBoard() {
    // 6 rows, 7 cols. 0 = empty.
    return Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
}

export function getLowestEmptyRow(board, col) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === 0) {
            return r;
        }
    }
    return -1; // Column full
}

export function checkWin(board, player) {
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            if (
                board[r][c] === player &&
                board[r][c + 1] === player &&
                board[r][c + 2] === player &&
                board[r][c + 3] === player
            ) {
                return true;
            }
        }
    }

    // Vertical
    for (let r = 0; r < ROWS - 3; r++) {
        for (let c = 0; c < COLS; c++) {
            if (
                board[r][c] === player &&
                board[r + 1][c] === player &&
                board[r + 2][c] === player &&
                board[r + 3][c] === player
            ) {
                return true;
            }
        }
    }

    // Diagonal (down-right)
    for (let r = 0; r < ROWS - 3; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            if (
                board[r][c] === player &&
                board[r + 1][c + 1] === player &&
                board[r + 2][c + 2] === player &&
                board[r + 3][c + 3] === player
            ) {
                return true;
            }
        }
    }

    // Diagonal (up-right)
    for (let r = 3; r < ROWS; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            if (
                board[r][c] === player &&
                board[r - 1][c + 1] === player &&
                board[r - 2][c + 2] === player &&
                board[r - 3][c + 3] === player
            ) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Resolves a turn where both players have submitted 3 moves.
 * Moves are interleaved: A1, B1, A2, B2, A3, B3.
 * Returns the new board and the winner (if any) and the move log.
 */
export function resolveTurn(currentBoard, player1Moves, player2Moves) {
    // Clone board to avoid mutation
    const newBoard = currentBoard.map(row => [...row]);
    let winner = null;
    const moveLog = []; // { player, col, row, win }

    for (let i = 0; i < 3; i++) {
        // Player 1's move
        if (!winner && i < player1Moves.length) {
            const col = player1Moves[i];
            const row = getLowestEmptyRow(newBoard, col);
            if (row !== -1) {
                newBoard[row][col] = PLAYER_1;
                const won = checkWin(newBoard, PLAYER_1);
                moveLog.push({ player: PLAYER_1, col, row, win: won });
                if (won) winner = PLAYER_1;
            } else {
                moveLog.push({ player: PLAYER_1, col, row: -1, error: 'Column full' });
            }
        }

        // Player 2's move
        if (!winner && i < player2Moves.length) {
            const col = player2Moves[i];
            const row = getLowestEmptyRow(newBoard, col);
            if (row !== -1) {
                newBoard[row][col] = PLAYER_2;
                const won = checkWin(newBoard, PLAYER_2);
                moveLog.push({ player: PLAYER_2, col, row, win: won });
                if (won) winner = PLAYER_2;
            } else {
                moveLog.push({ player: PLAYER_2, col, row: -1, error: 'Column full' });
            }
        }
    }

    return { board: newBoard, winner, moveLog };
}
