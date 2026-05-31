# guess.io — Frontend

> A real-time multiplayer number deduction game. Race your opponents to crack the secret code before the shared attempt pool runs out.

**Live:** https://guess-io.netlify.app  
**Backend Repository:** https://github.com/Ace-ux-cmd/guess.io/tree/master

---

## Table of Contents

- [Overview](#overview)
- [Gameplay](#gameplay)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [WebSocket Protocol](#websocket-protocol)
- [Game Flow](#game-flow)
- [State Management](#state-management)
- [Component Reference](#component-reference)
- [Composables](#composables)
- [Routing](#routing)
- [Styling & Animations](#styling--animations)
- [Known Bugs & Limitations](#known-bugs--limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Overview

guess.io is a competitive real-time multiplayer game where 2–4 players share a pool of attempts to crack a randomly generated secret number. Every guess — regardless of who makes it — consumes from the shared pool. The faster you guess, the more attempts you use, leaving fewer for your opponents.

The frontend is a Vue 3 single-page application communicating with a Node.js WebSocket server. All game logic is authoritative on the server. The client is responsible only for rendering state and capturing input.

---

## Gameplay

1. Enter a username on the home screen
2. Select a difficulty level in the lobby
3. Wait for enough players to join the queue
4. Once matched, a shared board appears — guess the secret number
5. Each digit is evaluated as **correct** (right digit, right position), **present** (right digit, wrong position), or **absent** (not in the secret)
6. No duplicate digits allowed in a single guess
7. The first player to guess the full number wins — or the last player standing if others disconnect
8. After the game ends, the secret is revealed and all players return to the home screen

### Difficulty Modes

| Mode   | Players | Digits | Attempts |
| ------ | ------- | ------ | -------- |
| Easy   | 2       | 4      | 10       |
| Medium | 3       | 5      | 12       |
| Hard   | 4       | 6      | 15       |

---

## Tech Stack

| Layer            | Technology                     |
| ---------------- | ------------------------------ |
| Framework        | Vue 3 (Composition API)        |
| Language         | TypeScript                     |
| State Management | Pinia                          |
| Routing          | Vue Router 4                   |
| Styling          | Tailwind CSS v4                |
| WebSocket        | Native browser `WebSocket` API |
| Build Tool       | Vite                           |
| Deployment       | Netlify                        |
| Font             | Space Mono (Google Fonts)      |

---

## Project Structure

```
src/
├── App.vue                         # Root component, socket and listener initialization
├── main.ts                         # App entry point
│
├── assets/
│   ├── animations.css              # All keyframe animations and utility animation classes
│   └── main.css                    # Global styles, Tailwind imports, CSS theme variables
│
├── components/
│   ├── game/
│   │   ├── GuessGrid.vue           # Shared board — past rows, active row, placeholder rows
│   │   ├── GuessRow.vue            # Single row of tiles, shake animation, input routing
│   │   └── NumberTile.vue          # Individual tile — input, colored result, or placeholder
│   │
│   └── ui/
│       ├── BackButton.vue          # Reusable back navigation button
│       ├── BaseButton.vue          # Primary button with hover and press animations
│       ├── BaseModal.vue           # Animated modal, controlled via v-model, optional close
│       ├── DifficultySelector.vue  # Radio group for easy/medium/hard, emits v-model
│       ├── FloatingNumbers.vue     # Animated background — random digits floating upward
│       └── TheHeader.vue           # App-wide header with logo
│
├── composables/
│   ├── useGameSync.ts              # Registers WebSocket listeners, delegates to store
│   └── useSocket.ts                # Singleton WebSocket with typed emit/on/off API
│
├── router/
│   └── routes.ts                   # Route definitions with navigation guards
│
├── stores/
│   └── gameStore.ts                # Central Pinia store — all game state and socket handlers
│
├── types/
│   └── types.ts                    # Shared TypeScript interfaces for payloads and game state
│
└── views/
    ├── HomeView.vue                # Username entry and play button
    ├── LobbyView.vue               # Difficulty selection and queue entry
    └── GameView.vue                # Waiting room, game board, opponent panel, game over modal
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/Hanseldev/guess-io/
cd guess-io-frontend
npm install
```

### Development

```bash
npm run dev
```

Runs the app at `http://localhost:5173`.

To test on a mobile device on the same network, add `host: true` to `vite.config.ts`:

```typescript
export default defineConfig({
	server: {
		host: true,
	},
});
```

Vite will display a network URL you can open on any device connected to the same WiFi.

### Build

```bash
npm run build
```

Output goes to `dist/`.

### WebSocket Server

The frontend connects to the backend at `wss://guess-io.onrender.com`. To point it at a local server, update the URL in `src/composables/useSocket.ts`:

```typescript
socketInstance = new WebSocket("ws://localhost:YOUR_PORT");
```

See the [backend repository](https://github.com/Ace-ux-cmd/guess.io/tree/master) for backend setup instructions.

---

## Architecture

### WebSocket Singleton

`useSocket.ts` creates a single `WebSocket` instance at module level. Subsequent calls to `useSocket()` return the same connection, preventing duplicate connections across components and composables.

All messages follow the envelope format required by the server:

```json
{
	"type": "event_name",
	"payload": {}
}
```

Incoming messages are routed to registered handlers via an internal `messageHandlers` record keyed by event type. The `ping`/`pong` heartbeat is handled transparently inside `useSocket` — no other layer ever sees it.

Handler deduplication is built in — calling `on()` with the same callback twice will not register it twice.

### Event Flow

```
User Input
    ↓
Component (GuessRow / NumberTile)
    ↓
gameStore.submitGuess(guess)
    ↓
useSocket.emit("guess", { guess })
    ↓
    [Server validates and evaluates]
    ↓
useSocket.onmessage → routes by type
    ↓
useGameSync listener
    ↓
gameStore.handleGuessResult(payload)
    ↓
Pinia state update → Vue reactivity → UI re-render
```

### Shared Board Model

All players share one board. Guesses are rendered in chronological order regardless of who made them:

- **Your guesses** — colored tiles (correct / present / absent)
- **Opponent guesses** — neutral grey tiles showing digits only (the server does not send result data for opponent guesses in the current API version)

The board iterates `guesses[]` from the store directly. One active input row sits below all submitted rows, keyed on own guess count to force a remount only when you submit — not when an opponent does, preserving your cursor position mid-input.

### Attempt Pool

All attempts are shared across players. The server owns the count. Every `guess_result` or `guess_made` event increments `totalGuesses` on the client. `remainingGuesses` is computed as:

```typescript
guessAttempts - totalGuesses;
```

---

## WebSocket Protocol

### Client → Server

| Event         | Payload              | Description                         |
| ------------- | -------------------- | ----------------------------------- |
| `play`        | `{ username, mode }` | Join the matchmaking queue          |
| `guess`       | `{ guess }`          | Submit a guess string e.g. `"1234"` |
| `leave_queue` | none                 | Leave the matchmaking queue         |
| `pong`        | `{}`                 | Heartbeat response to server ping   |

### Server → Client

| Event          | Payload                                                   | Description                          |
| -------------- | --------------------------------------------------------- | ------------------------------------ |
| `queue_update` | `{ usernames, playersInQueue }`                           | Real-time queue state while waiting  |
| `queue_left`   | confirmation                                              | Acknowledgement of leaving the queue |
| `match_found`  | `{ roomId, digit, tries, players }`                       | Game is starting                     |
| `match_failed` | `{ success, message }`                                    | Still waiting, queue not full yet    |
| `guess_result` | `{ guess, result, correctPosition, correctDigit, tries }` | Your guess evaluation                |
| `guess_made`   | `{ username, guess, tries }`                              | An opponent made a guess             |
| `game_over`    | `{ winner, secret, reason }`                              | Game has ended                       |
| `error`        | `{ message }`                                             | Validation or system error           |

---

## Game Flow

```
HomeView      → Enter username → Play
LobbyView     → Select difficulty → Create Lobby
              → store.joinQueue(mode) → emit "play"
GameView      → Waiting room (isActive = false)
              → Server broadcasts "queue_update" as players join
              → Server emits "match_found" when queue is full
              → isActive = true → board renders
              → Players submit guesses → shared board updates for all
              → Server emits "game_over" on win, attempts = 0, or disconnect
              → Game over modal → 3s countdown → redirect to HomeView
```

---

## State Management

All game state lives in `gameStore.ts`. Components read state via `storeToRefs` for reactivity and call actions directly on the store instance.

### Key State

| Field                 | Type                       | Description                                                  |
| --------------------- | -------------------------- | ------------------------------------------------------------ |
| `username`            | `string`                   | Current player's username                                    |
| `gameId`              | `string`                   | Active room ID                                               |
| `guesses`             | `GuessResult[]`            | All past guesses in order, own and opponent                  |
| `currentGuess`        | `(string\|number)[]`       | Digits typed in the active row                               |
| `currentAttemptIndex` | `number`                   | Number of your own guesses submitted                         |
| `totalGuesses`        | `number`                   | Total guesses across all players combined                    |
| `guessLength`         | `number`                   | Digit count for this mode, server-provided                   |
| `guessAttempts`       | `number`                   | Total attempt pool, server-provided                          |
| `isActive`            | `boolean`                  | True once `match_found` is received                          |
| `isGameOver`          | `boolean`                  | True once `game_over` is received                            |
| `isWinner`            | `boolean`                  | True if this player won                                      |
| `wasDisconnect`       | `boolean`                  | True if game ended due to a player disconnecting             |
| `isSubmitting`        | `boolean`                  | True while awaiting `guess_result`, blocks double submission |
| `shakeActive`         | `boolean`                  | Triggers shake animation on the active row                   |
| `joinedQueue`         | `boolean`                  | Guards against stale waiting room on page refresh            |
| `currentMode`         | `string`                   | Selected difficulty, used for queue slot placeholders        |
| `queuePlayers`        | `string[]`                 | Other players currently in queue, from `queue_update`        |
| `opponents`           | `Player[]`                 | Opponents in the current room                                |
| `opponentLastGuesses` | `Record<string, string[]>` | Opponent guess history keyed by username                     |
| `secret`              | `string`                   | Secret number revealed after game over                       |
| `error`               | `string\|null`             | Current error message, auto-clears after 3 seconds           |

### Key Actions

| Action                         | Description                                             |
| ------------------------------ | ------------------------------------------------------- |
| `joinQueue(mode)`              | Resets state and emits `play` to server                 |
| `submitGuess(guess)`           | Validates locally then emits `guess` to server          |
| `handleMatchFound(payload)`    | Sets up board from server data, flips `isActive`        |
| `handleGuessResult(payload)`   | Pushes result to board, advances own attempt index      |
| `handleOpponentGuess(payload)` | Pushes opponent guess to shared board, updates panel    |
| `handleQueueUpdate(payload)`   | Updates live queue player list in waiting room          |
| `handleGameOver(payload)`      | Sets game over state, reveals secret, flags disconnect  |
| `resetGame()`                  | Clears all game state, preserves username               |
| `setError(message)`            | Sets error, triggers shake, auto-clears after 3 seconds |

---

## Component Reference

### `GuessGrid.vue`

Renders the shared game board. Iterates `guesses[]` directly for past rows. Renders one active input row keyed on own guess count — changing only when you submit, not when opponents do, so your cursor position is preserved. Fills remaining slots with disabled placeholder rows.

### `GuessRow.vue`

Renders a single row of `NumberTile` components. Manages `activeTileIndex` internally for focus tracking. Emits `submit` with the full guess array when the last tile is filled. Accepts a `shake` prop that triggers the horizontal wiggle animation on invalid input.

### `NumberTile.vue`

Four render states:

- **Input** — active editable tile when the row is enabled and owned by the current player
- **Colored** — past own guess tile showing correct / present / absent color with flip animation
- **Opponent** — neutral grey tile showing the digit only, no color feedback
- **Placeholder** — empty bordered tile for future rows

Triggers a pop animation on digit entry. Focuses automatically via `onMounted` and a `isFocused` prop watch.

### `BaseModal.vue`

Controlled via `v-model`. Uses nested `<Transition>` components — the backdrop fades independently while the inner card slides up from below. Accepts a `closeable` prop. Game over modals pass `:closeable="false"` to prevent dismissal during the countdown.

### `FloatingNumbers.vue`

Generates 30 random digit spans on mount with randomized position, size, opacity, animation speed, and color drawn from the game's theme palette. Negative animation delays stagger the starting heights so digits appear at different points on the screen immediately rather than all launching from the bottom at once.

### `DifficultySelector.vue`

A controlled radio group component. Fully decoupled from the store — accepts and emits `modelValue` so it works with local state in `LobbyView`. Displays a hint showing digit count and attempt count for the selected mode.

---

## Composables

### `useSocket.ts`

Singleton raw WebSocket wrapper. The connection is created once at module level and reused across all imports. Recreates the socket automatically if found in a `CLOSED` state.

Exposes:

- `emit(event, payload)` — serializes and sends a typed envelope
- `on(event, callback)` — registers a message handler with deduplication
- `off(event, callback?)` — removes a specific handler or clears all handlers for an event
- `connected()` — returns current connection state

Handles `ping` → `pong` heartbeat internally. No other layer is aware of it.

### `useGameSync.ts`

Registers all server-to-client event listeners in `initListeners()`. Guards against double registration with an `areListenersInitialized()` check. Every listener delegates directly to the corresponding `gameStore` action with no additional logic. Called once in `App.vue` on mount.

---

## Routing

| Path     | Name    | View        | Description                        |
| -------- | ------- | ----------- | ---------------------------------- |
| `/`      | `home`  | `HomeView`  | Username entry                     |
| `/lobby` | `lobby` | `LobbyView` | Difficulty selection               |
| `/game`  | `game`  | `GameView`  | Waiting room and game board        |
| `/*`     | —       | redirect    | All unknown paths redirect to home |

### Navigation Guards

- `/game` requires `store.username` to be set. Direct navigation without going through the home screen redirects to `/`
- `GameView` checks `store.joinedQueue` on mount. If false (e.g. after a page refresh), the user is redirected home instead of showing a stale waiting room

Page transitions use Vue's `<Transition>` with `mode="out-in"` — the outgoing page fades up while the incoming page fades in from slightly below.

---

## Styling & Animations

### Theme Variables (`main.css`)

| Variable             | Value     | Usage                                    |
| -------------------- | --------- | ---------------------------------------- |
| `--color-main`       | `#0d1f13` | App background                           |
| `--color-btn-bg`     | `#f5c518` | Primary accent, buttons, misplaced tiles |
| `--color-btn-text`   | `#0d1f13` | Text on accent-colored elements          |
| `--color-btn-hover`  | `#fdd835` | Button hover state                       |
| `--color-correct`    | `#00b894` | Correct digit and position               |
| `--color-misplaced`  | `#f5c518` | Correct digit, wrong position            |
| `--color-incorrect`  | `#E76F51` | Digit not in secret                      |
| `--color-text-main`  | `#f1f1f1` | Primary text                             |
| `--color-text-muted` | `#9ca3af` | Secondary and hint text                  |

### Animations (`animations.css`)

| Class / Transition        | Trigger          | Description                                 |
| ------------------------- | ---------------- | ------------------------------------------- |
| `animate-float`           | On mount         | Background digits drift upward indefinitely |
| `animate-pop`             | Digit typed      | Tile scales up briefly on input             |
| `animate-shake`           | Invalid guess    | Row wiggles horizontally                    |
| `animate-flip`            | Row submitted    | Tile flips on Y axis revealing result color |
| `animate-bounce-in`       | Page load        | Element drops in with spring overshoot      |
| `animate-bounce-in-delay` | Page load        | Same with 150ms delay for staggered entry   |
| `.backdrop-enter/leave`   | Modal open/close | Backdrop fades independently                |
| `.card-enter`             | Modal open       | Card slides up from below                   |
| `.page-enter/leave`       | Route change     | Page fades and shifts vertically            |
| `.fade-enter/leave`       | Error message    | Error text fades in and out                 |

---

## Known Bugs & Limitations

### Active Bugs

- **Mobile keyboard variance** — some Android keyboards behave unexpectedly with `inputmode="numeric"`, occasionally requiring a manual tap to focus the next tile

### Architectural Limitations

- **No reconnection recovery** — if the WebSocket drops mid-game the player cannot rejoin the room. The server does not support reconnection. The remaining player is declared winner
- **In-memory only** — the backend stores all state in memory. A server restart clears all active rooms and queues
- **Cold start delay** — the backend is hosted on a free Render instance which spins down after inactivity. The first connection after a period of inactivity may take 30–60 seconds
- **Opponent result colors** — the server does not include evaluation results in `guess_made` broadcasts, so opponent tiles on the shared board show digits only without color feedback

---

## Roadmap

### Near Term

- [ ] Sound effects on correct, incorrect, win, and lose events
- [ ] Animate opponent panel cards when a new guess arrives
- [ ] Match summary screen showing the full board state after game over

### Dependent on Backend

- [ ] Opponent tile colors — requires `result` array in `guess_made` payload
- [ ] Reconnection support — requires server-side session persistence

### Future

- [ ] Player profiles and match history
- [ ] ELO ranking system
- [ ] Spectator mode
- [ ] Progressive Web App (PWA) support for mobile home screen installation

---

## Contributing

Contributions are welcome. This project is split across two repositories:

- **Frontend** — this repository
- **Backend** — https://github.com/Ace-ux-cmd/guess.io/tree/master

### Frontend Contributions

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run the build to confirm no errors: `npm run build`
5. Open a pull request with a clear description of what you changed and why

### Reporting Issues

Open a GitHub issue with:

- A clear description of the bug or feature request
- Steps to reproduce (for bugs)
- Browser and device information

### Code Style

- Vue 3 Composition API with `<script setup>` syntax
- TypeScript throughout — avoid `any` where possible
- Pinia for all shared state — no component-level state that belongs in the store
- Tailwind utility classes for styling — avoid inline styles

---

## License

MIT
