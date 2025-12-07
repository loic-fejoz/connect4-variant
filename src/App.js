import { h } from 'preact';
import { useState, useEffect, useMemo } from 'preact/hooks';
import { html } from 'htm/preact';
import { Board } from './components/Board.js';
import { createBoard, resolveTurn, checkWin, PLAYER_1, PLAYER_2 } from './game-logic.js';

const MOVES_PER_TURN = 3;

export function App() {
    const [board, setBoard] = useState(createBoard());
    const [currentTurnMoves, setCurrentTurnMoves] = useState({}); // { serial: [c1, c2, c3] } or { addr: ... }
    // Actually, WebXDC state usually accumulates.
    // Let's rely on reducing the full history or just maintaining state.
    // WebXDC listener gives us all updates or just new ones.
    // We usually maintain "current state" and apply updates.

    const [winner, setWinner] = useState(null);
    const [playerInfo, setPlayerInfo] = useState({ selfAddr: '', selfName: '' });

    // Local turn state
    const [localMoves, setLocalMoves] = useState([]);
    const [isSending, setIsSending] = useState(false);

    // Computed: valid players.
    // In a webxdc game, usually the first two to join or fixed.
    // Let's assume ANY two players can play, but we need to identify them.
    // Simple approach: First two unique addresses seen are P1 and P2.
    const [players, setPlayers] = useState([]); // [addr1, addr2]

    useEffect(() => {
        if (window.webxdc) {
            setPlayerInfo({
                selfAddr: window.webxdc.selfAddr,
                selfName: window.webxdc.selfName
            });

            window.webxdc.setUpdateListener((update) => {
                // update has { payload, serial, info, max_serial }
                // update.info usually contains who sent it.
                // But 'serial' is the reliable sequence.

                // We need to re-calculate state from scratch or handle incremental?
                // "The callback is called for every update the app receives"
                // "for existing updates (when the app starts) the callback is called with the updates in order"

                // Wait, for complex state, re-reducing is safer if logic is fast.
                // But let's try incremental.

                // Actually, for this turn-based logic, we need to know "Who is P1, Who is P2".
                // Let's define: First person to send a "join" or "move" is P1?
                // Or just use the sorted addresses of participants?
                // Let's store players in the state updates.

                // Payload structure: { type: 'moves', moves: [...] }
                // or { type: 'reset' }

                // We can treat the listener as a reducer.
                // But setUpdateListener might be called multiple times.

                // Handling state inside a reducer function is better.
            }, 0); // start serial
        }
    }, []);

    // Let's rewrite using a reducer pattern to handle the stream of updates.
    const [state, dispatch] = useState({
        board: createBoard(),
        players: [], // [{ addr, name }]
        roundMoves: {}, // { [addr]: [c, c, c] }
        winner: null,
        moveLog: []
    });

    useEffect(() => {
        if (!window.webxdc) return;

        const handleUpdate = (update) => {
            if (update.serial === 0) return; // ignore initial empty update if any

            const { payload, info } = update;
            // info: { addr, name, ... }
            if (!payload) return;

            dispatch(prev => {
                const next = { ...prev };

                // Identify players
                const playerAddr = info.addr;
                let playerIdx = next.players.findIndex(p => p.addr === playerAddr);
                if (playerIdx === -1 && next.players.length < 2) {
                    next.players = [...next.players, { addr: playerAddr, name: info.name }];
                    playerIdx = next.players.length - 1;
                }

                // If new player tried to move but game full?
                if (playerIdx === -1) {
                    // Spectator or 3rd player trying to play? Ignore for now or handle.
                    // For simplicity: ignore actions from non-players if full.
                    return next;
                }

                if (payload.type === 'moves') {
                    const moves = payload.moves;
                    const pAddr = next.players[playerIdx].addr;

                    // Store moves for this round
                    if (!next.roundMoves[pAddr]) {
                        next.roundMoves = { ...next.roundMoves, [pAddr]: moves };
                    }

                    // Check if we have moves for both players (or 1 if solo testing? No, 2 players)
                    // But we need to know WHO IS P1 and WHO IS P2 to resolving order.
                    // P1 is players[0], P2 is players[1].

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
                } else if (payload.type === 'reset') {
                    next.board = createBoard();
                    next.winner = null;
                    next.roundMoves = {};
                    next.moveLog = [];
                    // Keep players? Assuming yes.
                }

                return next;
            });
        };

        const processUpdates = async () => {
            // We need to accumulate updates?
            // Window.webxdc.setUpdateListener calls back for ONE update.
            // Is it synchronous or sequential? 
            // "The callback is called ... one by one".
            window.webxdc.setUpdateListener((update) => {
                handleUpdate(update);
            });
        };

        processUpdates();
    }, []);

    const myAddr = window.webxdc ? window.webxdc.selfAddr : '';
    const myPlayerIdx = state.players.findIndex(p => p.addr === myAddr);

    // Can I play?
    // Only if I am P1 or P2, OR if < 2 players (I will become one).
    const canPlay = !state.winner && (myPlayerIdx !== -1 || state.players.length < 2) && !state.roundMoves[myAddr];

    const onColumnClick = (col) => {
        if (!canPlay) return;
        if (localMoves.length < MOVES_PER_TURN) {
            setLocalMoves([...localMoves, col]);
        }
    };

    const onSubmit = () => {
        if (localMoves.length !== MOVES_PER_TURN) return;

        const info = myPlayerIdx !== -1 ? state.players[myPlayerIdx].name : (window.webxdc.selfName || 'Player');
        const desc = `${info} selected moves`;

        window.webxdc.sendUpdate({
            payload: { type: 'moves', moves: localMoves },
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

    // Preview local selection on board?
    // We can pass `localMoves` as `previewMoves` to Board solely for rendering.
    // But wait, `Board` component logic for preview isn't fully implemented (it was placeholder).
    // Let's just list the selected columns textually or implement simple markers.

    return html`
    <div class="app-container">
      <header>
        <h1>Connect 4 Variant</h1>
        <div class="status">
          ${state.winner ? html`<h2>Winner: ${state.winner.name}!</h2>` :
            html`<p>Players: ${state.players.map(p => p.name).join(' vs ')}</p>`}
        </div>
      </header>
      
      <${Board} 
         board=${state.board} 
         onColumnClick=${onColumnClick} 
         disabled=${!canPlay}
         previewMoves=${localMoves}
      />

      <div class="controls">
        <p>Your Selection: ${localMoves.map(c => c + 1).join(', ')}</p>
        
        ${state.roundMoves[myAddr] ? html`<p>Waiting for opponent...</p>` : ''}
        
        <button onClick=${onSubmit} disabled=${localMoves.length !== 3 || !canPlay}>
          Submit Moves
        </button>
        
        ${state.winner ? html`<button onClick=${onReset}>Reset Game</button>` : ''}
      </div>
    </div>
  `;
}
