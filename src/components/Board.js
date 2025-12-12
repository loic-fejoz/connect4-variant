
import { html } from 'htm/preact';
import { ROWS, COLS, PLAYER_1, PLAYER_2 } from '../game-logic.js';

export function Board({ board, onColumnClick, disabled }) {
  // Preview moves are transient selected by the user but not yet committed
  // We can overlay them.

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
