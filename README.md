# Connect 4 Variant - WebXDC

A lightweight, turn-based Connect 4 variant built for WebXDC using Preact, htm, and Vite.

## 🎮 Game Rules

This is not your standard Connect 4!

1.  **Turn-Based Batching**: Instead of playing one disc at a time, each player selects **3 columns** in a sequence during their turn.
2.  **Simultaneous Resolution**: Once both players have submitted their 3 moves, the game resolves them in an alternating sequence:
    *   Move 1 (Player A)
    *   Move 1 (Player B)
    *   Move 2 (Player A)
    *   Move 2 (Player B)
    *   Move 3 (Player A)
    *   Move 3 (Player B)
3.  **Winning**: The first player to connect 4 discs (horizontally, vertically, or diagonally) wins.
    *   Win conditions are checked *after every individual disc drop* during the resolution phase.
4.  **Column Selection Requirement**: You cannot select the same column **strictly more than twice** in a single turn.
5.  **Fair Turn Order**:
    *   **First Game**: The first player to join the game plays first.
    *   **Subsequent Games**: The loser of the previous game plays first.
6.  **Joining**: The game requires 2 players.
    *   First user to click "Join Game" waits in lobby.
    *   Second user joins to start the match.
    *   Any further users are **Spectators**.

## 🛠️ Technology Stack

*   **Preact**: Fast, 3kb React alternative with the same modern API.
*   **htm**: Hyperscript Tagged Markup. Allows using JSX-like syntax in plain JavaScript template literals. No complex build step required for parsing!
*   **Vite**: Next-generation frontend tooling for a lightning-fast dev server.
*   **WebXDC**: The app is designed to run within the WebXDC messenger context.

## 🚀 Development Environment

### Prerequisites
*   Node.js (v14+)
*   npm

### Setup
1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Start the local development server:
    ```bash
    npm run dev
    ```

3.  Build for production:
    ```bash
    npm run build
    ```

4.  Generate .xdc file:
    ```bash
    make connect4-game.xdc
    ```

### WebXDC Emulation
This project includes a `webxdc.js` mock for local browser development. It simulates sending and receiving updates so you can test the game logic without needing the full messenger environment.

## 🤖 AI Attribution
This game was entirely designed and coded with the assistance of **Antigravity**, an agentic AI coding assistant developed by **Google Deepmind**.

*   **Model**: Antigravity (Advanced Agentic Coding)
*   **Developer**: Google Deepmind
*   **Date**: December 2025

> [!NOTE]
> Most of the prompts used to create this game are available in the project's `git log`.

