# guess.io — Frontend

A real-time multiplayer number deduction game built with Vue 3, TypeScript, and Pinia. Players race against each other to guess a randomly generated secret number within a shared attempt pool.

---

## Table of Contents

- [guess.io — Frontend](#guessio--frontend)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Development](#development)
    - [Build](#build)
    - [Environment](#environment)
  - [Architecture](#architecture)
    - [WebSocket Singleton](#websocket-singleton)
    - [Event Flow](#event-flow)
    - [Shared Board Model](#shared-board-model)
  - [WebSocket Protocol](#websocket-protocol)
    - [Client → Server](#client--server)
    - [Server → Client](#server--client)
    - [Message Envelope](#message-envelope)
  - [Game Flow](#game-flow)
    - [Attempt Pool](#attempt-pool)
  - [State Management](#state-management)
    - [Key State](#key-state)
    - [Key Actions](#key-actions)
  - [Component Reference](#component-reference)
    - [`GuessGrid.vue`](#guessgridvue)
    - [`GuessRow.vue`](#guessrowvue)
    - [`NumberTile.vue`](#numbertilevue)
    - [`BaseModal.vue`](#basemodalvue)
    - [`FloatingNumbers.vue`](#floatingnumbersvue)
  - [Composables](#composables)
    - [`useSocket.ts`](#usesocketts)
    - [`useGameSync.ts`](#usegamesyncts)
  - [Routing](#routing)
  - [Styling \& Animations](#styling--animations)
    - [Theme Variables (`main.css`)](#theme-variables-maincss)
    - [Animations (`animations.css`)](#animations-animationscss)
  - [Known Limitations](#known-limitations)
  - [Roadmap](#roadmap)

---

## Overview

guess.io is a competitive multiplayer game where 2–4 players share a pool of attempts to crack a secret number. Every guess — regardless of who makes it — consumes from the shared pool. The faster you guess, the more attempts you use, leaving fewer for your opponents.

The frontend is a single-page application that communicates with a Node.js `ws` WebSocket server in real time. All game logic is authoritative on the server; the client is responsible only for rendering state and capturing input.

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
| Font             | Space Mono (Google Fonts)      |

---

## Project Structure

```
src/
├── App.vue                      # Root component, socket initialization
├── main.ts                      # App entry point
│
├── assets/
│   ├── main.css                 # Global styles, Tailwind imports, theme variables
│   └── animations.css           # All keyframe animations and animation utility classes
│
├── components/
│   ├── game/
│   │   ├── GuessGrid.vue        # Renders the full shared board (past rows + active row + placeholders)
│   │   ├── GuessRow.vue         # Single row of tiles, handles shake animation and input routing
│   │   └── NumberTile.vue       # Individual tile — input (active), colored div (past), or placeholder
│   │
│   └── ui/
│       ├── BackButton.vue       # Reusable back navigation button
│       ├── BaseButton.vue       # Primary button component
│       ├── BaseModal.vue        # Animated modal with optional close button, controlled via v-model
│       ├── DifficultySelector.vue  # Radio group for easy/medium/hard, emits v-model
│       ├── FloatingNumbers.vue  # Animated background — random digits floating upward
│       └── TheHeader.vue        # App-wide header with logo and back navigation
│
├── composables/
│   ├── useGameSync.ts           # Registers all WebSocket event listeners and delegates to store
│   └── useSocket.ts             # Singleton WebSocket connection with typed emit/on/off API
│
├── router/
│   └── routes.ts                # Route definitions: /, /lobby, /game
│
├── stores/
│   └── gameStore.ts             # Central Pinia store — all game state and socket event handlers
│
├── types/
│   └── types.ts                 # Shared TypeScript interfaces for payloads, game state, and tiles
│
└── views/
    ├── HomeView.vue             # Username entry and play button
    ├── LobbyView.vue            # Difficulty selection and queue entry
    └── GameView.vue             # Waiting room, game board, opponent panel, and game over modal
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone <repo-url>
cd guess-io-frontend
npm install
```

### Development

```bash
npm run dev
```

Runs the app at `http://localhost:5173`.

### Build

```bash
npm run build
```

### Environment

No `.env` file required. The WebSocket server URL is hardcoded in `useSocket.ts`:

```typescript
new WebSocket("wss://guess-io.onrender.com");
```

Update this value to point to a local or staging server during development.

---

## Architecture

### WebSocket Singleton

`useSocket.ts` creates a single `WebSocket` instance at the module level. Subsequent calls to `useSocket()` return the same connection. This prevents duplicate connections across components and composables.

Messages follow the envelope format required by the server:

```json
{
	"type": "event_name",
	"payload": {}
}
```

Incoming messages are routed to registered handlers via an internal `messageHandlers` record keyed by event type. The `ping`/`pong` heartbeat is handled transparently inside `useSocket` — components and the store never see it.

### Event Flow

```
User Input
    ↓
Component (GuessRow / NumberTile)
    ↓
gameStore.submitGuess()
    ↓
useSocket.emit("guess", payload)
    ↓
    [Server processes and responds]
    ↓
useSocket.onmessage → routes by type
    ↓
useGameSync listener
    ↓
gameStore.handleGuessResult()
    ↓
Pinia state update → Vue reactivity → UI re-render
```

### Shared Board Model

All players share one board. Guesses are rendered in chronological order regardless of who made them:

- **Your guesses** — colored tiles (correct / present / absent)
- **Opponent guesses** — neutral grey tiles showing digits only (server does not send result data for opponent guesses)

The board uses `guesses[]` from the store directly — no index-based row mapping. One active input row sits below all past rows, keyed on `currentAttemptIndex` to force remount on each new turn.

---

## WebSocket Protocol

### Client → Server

| Event         | Payload              | Description                         |
| ------------- | -------------------- | ----------------------------------- |
| `play`        | `{ username, mode }` | Join the matchmaking queue          |
| `guess`       | `{ guess }`          | Submit a guess string e.g. `"1234"` |
| `leave_queue` | none                 | Leave the matchmaking queue         |
| `pong`        | `{}`                 | Heartbeat response to server `ping` |

### Server → Client

| Event          | Payload                                            | Description                           |
| -------------- | -------------------------------------------------- | ------------------------------------- |
| `queue_update` | `{ usernames, playersInQueue }`                    | Real-time queue state while waiting   |
| `queue_left`   | confirmation                                       | Acknowledgement of leaving the queue  |
| `match_found`  | `{ roomId, digit, tries, players }`                | Game is starting                      |
| `match_failed` | `{ success, message }`                             | Still waiting, not enough players yet |
| `guess_result` | `{ guess, result, correctPosition, correctDigit }` | Your guess evaluation                 |
| `guess_made`   | `{ guess }`                                        | An opponent made a guess              |
| `game_over`    | `{ winner, secret, reason }`                       | Game has ended                        |
| `error`        | `{ message }`                                      | Validation or system error            |

### Message Envelope

All messages in both directions are JSON with a `type` and `payload` key:

```json
{ "type": "guess", "payload": { "guess": "1234" } }
```

---

## Game Flow

```
HomeView          → Enter username → click Play
LobbyView         → Select difficulty → click Create Lobby
                  → store.joinQueue(mode) → emit "play"
GameView          → Waiting room (isActive = false)
                  → Server broadcasts "queue_update" as players join
                  → Server emits "match_found" when queue is full
                  → isActive = true → board renders
                  → Players submit guesses → shared board updates
                  → Server emits "game_over" when attempts hit 0 or someone wins
                  → Game over modal → countdown → redirect to HomeView
```

### Attempt Pool

Attempts are shared across all players. The server owns the attempt count. Every `guess_result` or `guess_made` event decrements `totalGuesses` on the client. `remainingGuesses` is computed as:

```typescript
guessAttempts - totalGuesses;
```

---

## State Management

All game state lives in `gameStore.ts` (Pinia). Components read state via `storeToRefs` for reactivity and call actions directly on the store.

### Key State

| Field                 | Type                       | Description                                                        |
| --------------------- | -------------------------- | ------------------------------------------------------------------ |
| `username`            | `string`                   | Current player's username                                          |
| `gameId`              | `string`                   | Active room ID                                                     |
| `guesses`             | `GuessResult[]`            | All past guesses in order (own + opponent)                         |
| `currentGuess`        | `(string\|number)[]`       | Digits typed in the active row                                     |
| `currentAttemptIndex` | `number`                   | How many of your own guesses you've made                           |
| `totalGuesses`        | `number`                   | Total guesses made by all players combined                         |
| `guessLength`         | `number`                   | Digit count for this mode (server-provided)                        |
| `guessAttempts`       | `number`                   | Total attempt pool (server-provided)                               |
| `isActive`            | `boolean`                  | True once `match_found` is received                                |
| `isGameOver`          | `boolean`                  | True once `game_over` is received                                  |
| `isWinner`            | `boolean`                  | True if this player won                                            |
| `isSubmitting`        | `boolean`                  | True while waiting for `guess_result` — prevents double submission |
| `shakeActive`         | `boolean`                  | Triggers shake animation on the active row                         |
| `opponents`           | `Player[]`                 | List of opponents in the room                                      |
| `opponentLastGuesses` | `Record<string, string[]>` | Opponent guess history keyed by username                           |
| `secret`              | `string`                   | Revealed after game over                                           |
| `error`               | `string \| null`           | Current error message, auto-clears after 3 seconds                 |

### Key Actions

| Action                         | Description                                                   |
| ------------------------------ | ------------------------------------------------------------- |
| `joinQueue(mode)`              | Resets state and emits `play` to server                       |
| `submitGuess(guess)`           | Validates locally then emits `guess` to server                |
| `handleMatchFound(payload)`    | Sets up board from server data, flips `isActive`              |
| `handleGuessResult(payload)`   | Pushes result to board, advances attempt index                |
| `handleOpponentGuess(payload)` | Pushes opponent guess to shared board, increments shared pool |
| `handleGameOver(payload)`      | Sets game over state, reveals secret                          |
| `resetGame()`                  | Clears all game state, preserves username                     |

---

## Component Reference

### `GuessGrid.vue`

Renders the shared board. Does not use index-based row mapping — iterates `guesses[]` directly for past rows, renders one active row keyed on `currentAttemptIndex`, and fills remaining slots with disabled placeholder rows.

### `GuessRow.vue`

Renders a single row of `NumberTile` components. Manages `activeTileIndex` for focus tracking within the row. Emits `submit` with the full guess array when the last tile is filled. Accepts a `shake` prop that triggers the shake animation when an invalid guess is attempted.

### `NumberTile.vue`

Three render states:

- **Input** (`!disabled && isOwn`) — active editable tile
- **Colored** (`isOwn && status !== 'empty'`) — past own guess with correct/present/absent color
- **Opponent** (`!isOwn`) — neutral tile showing digit only, no color
- **Placeholder** — empty bordered tile for future rows

Triggers a pop animation on digit entry and a flip animation on mount when status is already set.

### `BaseModal.vue`

Controlled via `v-model`. Uses nested `<Transition>` components — backdrop fades independently, inner card slides up. Accepts a `closeable` prop; game over modals pass `:closeable="false"` to prevent dismissal.

### `FloatingNumbers.vue`

Generates 30 random digit spans on mount with randomized position, size, opacity, speed, and color. Uses a CSS `float` keyframe animation with negative delays so numbers start at staggered heights rather than all launching from the bottom simultaneously.

---

## Composables

### `useSocket.ts`

Singleton WebSocket wrapper. Exposes:

- `emit(event, payload)` — sends a typed envelope to the server
- `on(event, callback)` — registers a message handler (deduped)
- `off(event, callback?)` — removes a handler
- `connected()` — returns current connection state

Handles `ping` → `pong` heartbeat internally. Recreates the socket if it is found in a `CLOSED` state.

### `useGameSync.ts`

Registers all server event listeners on `initListeners()`. Guards against double registration. Delegates every event directly to the corresponding `gameStore` action. Should be called once in `App.vue` on mount.

---

## Routing

| Path     | Name    | View        | Description               |
| -------- | ------- | ----------- | ------------------------- |
| `/`      | `home`  | `HomeView`  | Username entry            |
| `/lobby` | `lobby` | `LobbyView` | Difficulty selection      |
| `/game`  | `game`  | `GameView`  | Waiting room + game board |

Page transitions use Vue's `<Transition>` with `mode="out-in"` — outgoing page fades up, incoming page fades in from below.

---

## Styling & Animations

### Theme Variables (`main.css`)

| Variable             | Value     | Usage                                    |
| -------------------- | --------- | ---------------------------------------- |
| `--color-main`       | `#0d1f13` | App background                           |
| `--color-btn-bg`     | `#f5c518` | Primary accent, buttons, misplaced tiles |
| `--color-btn-text`   | `#0d1f13` | Text on accent elements                  |
| `--color-btn-hover`  | `#fdd835` | Button hover state                       |
| `--color-correct`    | `#00b894` | Correct digit + position                 |
| `--color-misplaced`  | `#f5c518` | Correct digit, wrong position            |
| `--color-incorrect`  | `#E76F51` | Digit not in secret                      |
| `--color-text-main`  | `#f1f1f1` | Primary text                             |
| `--color-text-muted` | `#9ca3af` | Secondary / hint text                    |

### Animations (`animations.css`)

| Class                     | Trigger          | Description                                  |
| ------------------------- | ---------------- | -------------------------------------------- |
| `animate-float`           | On mount         | Background numbers drift upward indefinitely |
| `animate-pop`             | Digit typed      | Tile scales up briefly                       |
| `animate-shake`           | Invalid guess    | Row wiggles horizontally                     |
| `animate-flip`            | Row submitted    | Tile flips on Y axis revealing color         |
| `animate-bounce-in`       | Page load        | Element drops in with overshoot              |
| `animate-bounce-in-delay` | Page load        | Same as above with 150ms delay               |
| `.backdrop-*`             | Modal open/close | Backdrop fades in/out                        |
| `.card-*`                 | Modal open       | Card slides up from below                    |
| `.page-*`                 | Route change     | Page fades and shifts vertically             |

---

## Known Limitations

- **`guess_made` has no `username` field** — in medium/hard mode (3–4 players) opponent guesses cannot be attributed to individual players. All opponent guesses are currently shown as belonging to all opponents equally. Requires a backend fix.
- **No reconnection recovery** — if the WebSocket drops mid-game, the player cannot rejoin the room. The server does not support reconnection.
- **Queue state on server restart** — all in-memory state is lost if the server restarts. Players will need to re-queue.
- **Render server cold start** — the backend is hosted on a free Render instance which spins down after inactivity. Initial connection may take 30–60 seconds on first load.

---

## Roadmap

- Wire up `queue_update` event to show real-time player list in waiting room
- Implement `leave_queue` emit on queue exit
- Add result colors to opponent tiles once server sends `result` in `guess_made`
- Game history / match summary screen
- Sound effects on correct / incorrect guesses
- Mobile keyboard handling improvements
