import { h } from 'preact';
import { html } from 'htm/preact';
import { ROWS, COLS, PLAYER_1, PLAYER_2 } from '../game-logic.js';

export function Board({ board, onColumnClick, disabled, previewMoves = [] }) {
    // Preview moves are transient moves selected by the user but not yet committed
    // We can overlay them.

    // Create a display board that includes preview moves
    const displayBoard = board.map(row => [...row]);

    // Apply preview moves visually
    // This is tricky because we need to know where they land.
    // We can just calculate "lowest empty" for each preview move in order.
    // But for simple visualization, maybe just showing the selection is enough?
    // Let's try to simulate them on displayBoard.
    if (previewMoves.length > 0) {
        const tempBoard = board.map(row => [...row]);
        // TODO: if we want to show preview, we need logic. 
        // For now, let's just render the base board.
        // The "selection" UI might be better above the board or just simple indicators.
    }

    return html`
    <div class="board" style="--rows: ${ROWS}; --cols: ${COLS}">
      ${Array(COLS).fill(0).map((_, colIndex) => {
        return html`
          <div class="column" onClick=${() => !disabled && onColumnClick(colIndex)}>
             ${Array(ROWS).fill(0).map((_, r) => {
            // Render from top (0) to bottom (ROWS-1) visually? 
            // Usually board[0] is top row? 
            // Logic: row 0 is top.
            // Flex column reverses order? No, normal flow is top-down.
            const rowIndex = r;
            const cellValue = board[rowIndex][colIndex];

            let className = 'cell';
            if (cellValue === PLAYER_1) className += ' p1';
            if (cellValue === PLAYER_2) className += ' p2';

            return html`<div class=${className}></div>`;
        })}
          </div>
        `;
    })}
    </div>
  `;
}
