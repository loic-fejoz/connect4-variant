
import { useState, useEffect } from 'preact/hooks';
import { html } from 'htm/preact';
import { Board } from './components/Board.js';
import { createBoard, resolveTurn, PLAYER_1 } from './game-logic.js';

const MOVES_PER_TURN = 3;

export function App() {
    const [localMoves, setLocalMoves] = useState([]);

    // Reducer-like state
    const [state, setState] = useState({
        board: createBoard(),
        players: [], // [{ addr, name }]
        roundMoves: {}, // { [addr]: [c, c, c] }
        winner: null,
        moveLog: []
    });

    // Current User Info
    const myAddr = window.webxdc ? window.webxdc.selfAddr : 'stats_addr';
    const myName = window.webxdc ? window.webxdc.selfName : 'Me';

    useEffect(() => {
        if (!window.webxdc) return;

        const handleUpdate = (update) => {
            if (update.serial === 0) return;
            const { payload } = update;
            if (!payload) return;

            setState(prev => {
                const next = { ...prev };
                const playerAddr = payload.addr;
                const playerName = payload.name;

                // JOIN Logic
                if (payload.type === 'join') {
                    const alreadyJoined = next.players.some(p => p.addr === playerAddr);
                    if (!alreadyJoined && next.players.length < 2) {
                        next.players = [...next.players, { addr: playerAddr, name: playerName }];
                    }
                    return next;
                }

                // MOVES Logic
                if (payload.type === 'moves') {
                    // Only allow moves from registered players
                    const isPlayer = next.players.some(p => p.addr === playerAddr);
                    if (!isPlayer) return next;

                    const moves = payload.moves;

                    // Store moves for this round
                    if (!next.roundMoves[playerAddr]) {
                        next.roundMoves = { ...next.roundMoves, [playerAddr]: moves };
                    }

                    // Turn Resolution
                    if (next.players.length === 2 &&
                        next.roundMoves[next.players[0].addr] &&
                        next.roundMoves[next.players[1].addr]) {

                        const p1Moves = next.roundMoves[next.players[0].addr];
                        const p2Moves = next.roundMoves[next.players[1].addr];

                        const res = resolveTurn(next.board, p1Moves, p2Moves);

                        next.board = res.board;
                        next.winner = res.winner ? (res.winner === 1 ? next.players[0] : next.players[1]) : null;
                        next.moveLog = [...next.moveLog, ...res.moveLog];
                        next.roundMoves = {}; // Reset for next round
                    }
                }

                // RESET Logic
                if (payload.type === 'reset') {
                    // Check if Player 1 (who started first) won.
                    // If so, swap players so the loser (Player 2) starts first next game.
                    if (next.winner && next.players.length === 2 && next.winner.addr === next.players[0].addr) {
                        const p0 = next.players[0];
                        next.players[0] = next.players[1];
                        next.players[1] = p0;
                    }

                    next.board = createBoard();
                    next.winner = null;
                    next.roundMoves = {};
                    next.moveLog = [];
                    // Players persist on reset (potentially swapped)
                }

                return next;
            });
        };

        window.webxdc.setUpdateListener((update) => {
            handleUpdate(update);
        });
    }, []);

    // Derived State
    const myPlayerIdx = state.players.findIndex(p => p.addr === myAddr);
    const isPlayer = myPlayerIdx !== -1;
    const isSpectator = !isPlayer && state.players.length >= 2;
    const canPlay = isPlayer && !state.winner && !state.roundMoves[myAddr] && state.players.length === 2;

    // Handlers
    const onJoin = () => {
        const desc = `${myName} joined the game`;
        window.webxdc.sendUpdate({
            payload: { type: 'join', addr: myAddr, name: myName },
            info: desc
        }, desc);
    };

    const onColumnClick = (col) => {
        if (!canPlay) return;

        // Rule: A player is not allowed to select 3 times the same column in a turn.
        const count = localMoves.filter(c => c === col).length;
        if (count >= 2) return;

        if (localMoves.length < MOVES_PER_TURN) {
            setLocalMoves([...localMoves, col]);
        }
    };

    const onSubmitMoves = () => {
        if (localMoves.length !== MOVES_PER_TURN) return;

        let desc = `${state.players[myPlayerIdx].name} selected moves`;

        // Check if this move completes the round and creates a winner
        const opponentIdx = myPlayerIdx === 0 ? 1 : 0;
        const opponentAddr = state.players[opponentIdx]?.addr;

        if (opponentAddr && state.roundMoves[opponentAddr]) {
            // Opponent has moved. We are completing the round.
            // Prepare args for resolveTurn (pure check)
            const p1Moves = myPlayerIdx === 0 ? localMoves : state.roundMoves[state.players[0].addr];
            const p2Moves = myPlayerIdx === 1 ? localMoves : state.roundMoves[state.players[1].addr];

            const res = resolveTurn(state.board, p1Moves, p2Moves);

            if (res.winner) {
                const winnerName = res.winner === PLAYER_1 ? state.players[0].name : state.players[1].name;
                desc = `🏆 ${winnerName} won the game!`;
            }
        }

        window.webxdc.sendUpdate({
            payload: { type: 'moves', moves: localMoves, addr: myAddr },
            info: desc
        }, desc);

        setLocalMoves([]); // Clear local
    };

    const onReset = () => {
        window.webxdc.sendUpdate({
            payload: { type: 'reset' },
            info: 'Game Reset'
        }, 'Game Reset');
    };

    // Rendering

    // 1. Lobby / Waiting Room
    if (state.players.length < 2) {
        return html`
          <div class="app-container">
              <h1>Connect 4 Variant</h1>
              <div class="lobby">
                  <p>Status: Waiting for players (${state.players.length}/2)</p>
                  <ul>
                      ${state.players.map(p => html`<li>${p.name} joined</li>`)}
                  </ul>
                  ${!isPlayer ?
                html`<button onClick=${onJoin}>Join Game</button>` :
                html`<p>Waiting for opponent...</p>`
            }
              </div>
          </div>
      `;
    }

    // 2. Game View (Players + Spectators)
    const titleClass = myPlayerIdx === 0 ? 'title-p1' : (myPlayerIdx === 1 ? 'title-p2' : '');

    const onClearSelection = () => {
        setLocalMoves([]);
    };

    return html`
    <div class="app-container">
      <header>
        <h1 class=${titleClass}>Connect 4 Variant</h1>
        <div class="status">
            ${isSpectator ? html`<span class="badge">Spectator Mode</span>` : ''}
            ${state.winner ?
            html`<h2 class="winner-banner">Winner: ${state.winner.name}!</h2>` :
            html`<p>${state.players[0].name} <span class="vs">vs</span> ${state.players[1].name}</p>`
        }
        </div>
      </header>
      
      <${Board} 
         board=${state.board} 
         onColumnClick=${onColumnClick} 
         disabled=${!canPlay}
         previewMoves=${localMoves}
      />

      <div class="controls">
        ${isPlayer ? html`
            <p>Your Selection: ${localMoves.map(c => c + 1).join(', ')}</p>
            ${state.roundMoves[myAddr] ? html`<p>Waiting for opponent...</p>` : ''}
            <div class="button-group">
                <button onClick=${onClearSelection} disabled=${localMoves.length === 0 || !canPlay} style="background-color: #888; margin-right: 10px;">
                    Clear
                </button>
                <button class="primary" onClick=${onSubmitMoves} disabled=${localMoves.length !== 3 || !canPlay}>
                    Submit Moves
                </button>
            </div>
        ` : ''}
        
        ${state.winner ? html`<button onClick=${onReset}>Reset Game</button>` : ''}
      </div>
    </div>
  `;
}
