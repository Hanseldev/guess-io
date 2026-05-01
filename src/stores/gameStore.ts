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

	// Game logic state
	guesses: GuessResult[];
	currentGuess: (string | number)[];
	currentAttemptIndex: number;

	// Status
	isWinner: boolean;
	isGameOver: boolean;
	isActive: boolean;
	secret: string;
	error: string | null;

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

		isWinner: false,
		isGameOver: false,
		isActive: false,
		error: null,

		guessLength: 0,
		guessAttempts: 0,
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
			this.currentGuess = Array(this.guessLength).fill("");
			this.currentAttemptIndex = 0;
			this.isGameOver = false;
			this.isWinner = false;
			this.isActive = false;
			this.secret = "";
			this.error = null;
		},

		joinQueue(mode: "easy" | "medium" | "hard") {
			this.resetGame();

			if (!this.username) {
				this.username = "Player";
			}

			const { emit } = useSocket();
			emit("play", { username: this.username, mode });
			console.log(`🎮 Joined queue (${mode}) as ${this.username}`);
		},

		submitGuess(guess: (string | number)[]) {
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

			const { emit } = useSocket();
			emit("guess", { guess: guessString });
			console.log("📤 Emitted guess to server:", guessString);

			// ✅ Removed: currentAttemptIndex++ and currentGuess reset
			// These now happen in handleGuessResult when server confirms
		},

		handleGuessResult(payload: GuessResultPayload) {
			this.guesses.push({
				guess: payload.guess.split(""),
				result: payload.result,
			});

			// ✅ Move index advancement here — only on server confirmation
			this.currentAttemptIndex++;
			this.currentGuess = Array(this.guessLength).fill("");

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
				.filter((p) => p.username !== this.username) // ✅ filter by username
				.map((p) => ({
					id: p.id,
					name: p.username, // ✅ store username as name
					progress: [],
				}));

			this.opponents.forEach((opponent) => {
				this.opponentLastGuesses[opponent.name] = []; // ✅ keyed by username string
			});

			this.isActive = true;
			this.isGameOver = false;
			this.isWinner = false;
		},

		handleOpponentGuess(payload: { username?: string; guess: string }) {
			// Server doesn't send username in guess_made, so update all opponents
			// In easy mode this is always one person; in medium/hard update all
			this.opponents.forEach((opponent) => {
				const current = this.opponentLastGuesses[opponent.name] ?? [];
				this.opponentLastGuesses = {
					...this.opponentLastGuesses,
					[opponent.name]: [...current, payload.guess],
				};
				opponent.progress = [...opponent.progress, "empty"];
			});
		},
		
		handleGameOver(payload: GameOverPayload) {
			this.isActive = false;
			this.isGameOver = true;
			this.secret = payload.secret;
			this.isWinner = payload.winner === this.username;
		},

		setError(message: string) {
			this.error = message;
			console.error("Game Error:", message);
		},
	},
});
