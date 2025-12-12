# Project Improvement TODOs

Here is a consolidated list of proposed improvements for the Connect 4 Variant project, categorized by area of impact.

## 🧪 Testing & Stability [High Priority]
- [ ] **Add Unit Tests**: Install **Vitest** and write tests for `game-logic.js` to ensure core rules (win checks, simultaneous turn resolution, fair turn order) are mathematically correct and regression-free.

## 🔐 Security [High Priority]
- [ ] **Strict Input Validation**: Implement rigorous validation for incoming `webxdc` updates.
    - Validate that `moves` array contains exactly 3 integers (0-6).
    - ensure `type` is one of the allowed values ('join', 'moves', 'reset').
    - Consider using a lightweight library like **Zod** or writing a robust manual validation function.
- [ ] **Content Security Policy (CSP)**: Add a `<meta>` tag to `index.html` to prevent loading external resources, ensuring the app remains self-contained and secure.
    - Example: `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline';">`

## 💎 Code Quality & Workflow
- [ ] **Prettier + Husky**:
    - Install **Prettier** for consistent code formatting.
    - Set up **Husky** and **lint-staged** to automatically run linting and formatting on `git commit`, preventing bad code from entering the repo.
- [ ] **Type Checking (JSDoc)**: Add JSDoc comments/annotations to key functions and enable `"checkJs": true` in a `jsconfig.json` file. This provides TypeScript-like error checking in VS Code without a full TS migration.

## 🎨 UI/UX Polish
- [ ] **Highlight Winning Line**: Visually distinguish the 4 connecting discs (e.g., make them glow or pulse) to make the win condition obvious.
- [ ] **Disc Animations**: Add CSS transitions to simulate discs "falling" into slots for a more premium feel.
- [ ] **Responsive Grid**: Fine-tune the board dimensions to ensure perfect scaling across all mobile screen sizes.

## 📊 Features
- [ ] **Session Scoreboard**: Track and display a running score (e.g., "Player A: 2 - Player B: 1") that persists across game resets.
