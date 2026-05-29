import { defineStore } from "pinia";
import type {
	Player,
	MatchFoundPayload,
	GuessResultPayload,
	GameOverPayload,
	GuessResult,
} from "../types/types";
import { useSocket } from "@/composables/useSocket";

interface GameState {
	// Session & Profile
	username: string;
	gameId: string;
	opponents: Player[];
	opponentLastGuesses: Record<string, string[]>;

	// Gamestate
	guesses: GuessResult[];
	currentGuess: (string | number)[];
	currentAttemptIndex: number;
	totalGuesses: number;
	currentMode: "easy" | "medium" | "hard" | "";
	queuePlayers: string[];
	wasDisconnect: boolean;

	// Status
	isWinner: boolean;
	isGameOver: boolean;
	isActive: boolean;
	isSubmitting: boolean;
	secret: string;
	error: string | null;
	shakeActive: boolean;

	// Config (owned by server)
	guessLength: number;
	guessAttempts: number;
}

export const useGameStore = defineStore("game", {
	state: (): GameState => ({
		username: "",
		gameId: "",
		opponents: [] as Player[],
		opponentLastGuesses: {},

		guesses: [] as GuessResult[],
		currentGuess: [],
		currentAttemptIndex: 0,
		secret: "",
		currentMode: "",
		queuePlayers: [],
		wasDisconnect: false,

		isWinner: false,
		isGameOver: false,
		isActive: false,
		isSubmitting: false,
		error: null,
		shakeActive: false,

		guessLength: 0,
		guessAttempts: 0,
		totalGuesses: 0,
	}),

	actions: {
		setCurrentGuess(newGuess: (string | number)[]) {
			this.currentGuess = newGuess;
		},

		initializeProfile() {
			const storedUsername = localStorage.getItem("username");
			if (storedUsername) {
				this.username = storedUsername;
			}
		},

		resetGame() {
			this.guesses = [];
			this.totalGuesses = 0;
			this.currentGuess = Array(this.guessLength).fill("");
			this.currentAttemptIndex = 0;
			this.isGameOver = false;
			this.isWinner = false;
			this.isActive = false;
			this.isSubmitting = false;
			this.wasDisconnect = false;
			this.secret = "";
			this.queuePlayers = [];
			this.error = null;
			this.shakeActive = false;
		},

		joinQueue(mode: "easy" | "medium" | "hard") {
			this.currentMode = mode;
			this.resetGame();

			if (!this.username) {
				this.username = "Player";
			}

			const { emit } = useSocket();
			emit("play", { username: this.username, mode });
			console.log(`Joined queue (${mode}) as ${this.username}`);
		},

		submitGuess(guess: (string | number)[]) {
			if (this.isSubmitting) return;

			const guessString = guess.join("");

			if (guessString.length !== this.guessLength) {
				this.setError(`Guess must be ${this.guessLength} digits.`);
				return;
			}

			const unique = new Set(guessString.split(""));
			if (unique.size !== guessString.length) {
				this.setError("No duplicate digits allowed.");
				return;
			}

			this.error = null;
			this.isSubmitting = true;

			const { emit } = useSocket();
			emit("guess", { guess: guessString });
			console.log("Emitted guess to server:", guessString);
		},

		handleGuessResult(payload: GuessResultPayload) {
			this.isSubmitting = false;
			this.totalGuesses++;
			this.currentAttemptIndex++;
			this.currentGuess = Array(this.guessLength).fill("");

			this.guesses.push({
				guess: payload.guess.split(""),
				result: payload.result,
				isOwn: true, // your guess
			});

			const isAllCorrect = payload.result.every((s) => s === "correct");
			if (isAllCorrect) {
				this.isWinner = true;
				this.isGameOver = true;
			} else if (this.guesses.length >= this.guessAttempts) {
				this.isGameOver = true;
				this.isWinner = false;
			}
		},

		handleMatchFound(payload: MatchFoundPayload) {
			this.gameId = payload.roomId;
			this.guessLength = payload.digit;
			this.guessAttempts = payload.tries;

			this.currentGuess = Array(this.guessLength).fill("");
			this.guesses = [];
			this.currentAttemptIndex = 0;

			this.opponents = payload.players
				.filter((p) => p.username !== this.username) // filter by username
				.map((p) => ({
					id: p.id,
					name: p.username, // store username as name
					progress: [],
				}));

			this.opponents.forEach((opponent) => {
				this.opponentLastGuesses[opponent.name] = []; // keyed by username string
			});

			this.isActive = true;
			this.isGameOver = false;
			this.isWinner = false;
		},

		handleOpponentGuess(payload: { username?: string; guess: string }) {
			this.totalGuesses++;
			this.currentAttemptIndex++;

			this.guesses.push({
				guess: payload.guess.split(""),
				result: null,
				isOwn: false,
			});

			// Only update the specific opponent who guessed
			if (payload.username) {
				const current = this.opponentLastGuesses[payload.username] ?? [];
				this.opponentLastGuesses = {
					...this.opponentLastGuesses,
					[payload.username]: [...current, payload.guess],
				};

				const opponent = this.opponents.find(
					(o) => o.name === payload.username,
				);
				if (opponent) {
					opponent.progress = [...opponent.progress, "empty"];
				}
			}
		},

		handleGameOver(payload: GameOverPayload) {
			this.isActive = false;
			this.isGameOver = true;
			this.secret = payload.secret;
			this.isWinner = payload.winner === this.username;
			this.wasDisconnect = payload.reason === "Player Left";

			console.log("🎮 Game over:", {
				reason: payload.reason,
				winner: payload.winner,
				isWinner: this.isWinner,
				wasDisconnect: this.wasDisconnect,
			});
		},

		setError(message: string) {
			this.error = message;
			this.shakeActive = true;

			// shake clears quickly
			setTimeout(() => {
				this.shakeActive = false;
			}, 400);

			// error message stays visible for 3 seconds
			setTimeout(() => {
				this.error = null;
			}, 3000);
		},

		handleQueueUpdate(payload: {
			usernames: string[];
			playersInQueue: number;
		}) {
			this.queuePlayers = payload.usernames.filter((u) => u !== this.username);
		},
	},
});
