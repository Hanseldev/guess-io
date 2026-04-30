import { defineStore } from "pinia";
import type {
	CellStatus,
	Difficulty,
	GuessResult,
	Player,
	MatchFoundPayload,
	GuessResultPayload,
	GameOverPayload,
} from "../types/types";
import { GAME_MODES } from "@/constants/gameConfig";

interface GameState {
	// session & Profile
	username: string;
	difficulty: Difficulty;
	gameId: string;
	opponents: Player[];

	// Game logic state
	guesses: GuessResult[];
	currentGuess: (string | number)[];
	currentAttemptIndex: number;

	// Status

	isWinner: boolean;
	isGameOver: boolean;

	isActive: boolean; // Indicates if the player is currently in a game session
	error: string | null;

	// config
	guessLength: number;
	guessAttempts: number;
}

export const useGameStore = defineStore("game", {
	state: (): GameState => ({
		username: "",
		difficulty: "" as Difficulty,
		gameId: "",
		opponents: [] as Player[],

		guesses: [] as GuessResult[],
		currentGuess: [],
		currentAttemptIndex: 0,

		isWinner: false,
		isGameOver: false,
		isActive: false,
		error: null,

		guessLength: 0,
		guessAttempts: 0,
	}),
	actions: {
		setCurrentGuess(newGuess: (string | number)[]) {
			// update the current row as the user types
			this.currentGuess = newGuess;
		},

		// Save current guess to history and reset for the next turn
		submitGuess() {
			// Push the current guess into the history array as a GuessResult object

			this.guesses.push({
				guess: [...this.currentGuess],
				result: Array(this.guessLength).fill("empty") as CellStatus[],
			});

			this.currentAttemptIndex++;

			this.currentGuess = Array(this.guessLength).fill("");
		},

		initializeGame(difficulty: Difficulty) {
			this.difficulty = difficulty;

			const settings = GAME_MODES[difficulty];

			this.guessLength = settings.codeLength;
			this.guessAttempts = settings.maxAttempts;

			this.currentGuess = Array(this.guessLength).fill("");
			this.guesses = [];
			this.currentAttemptIndex = 0;
			this.isGameOver = false;
			this.isWinner = false;
		},

		initializeProfile() {
			const storedUsername = localStorage.getItem("username");
			if (storedUsername) {
				this.username = storedUsername;
			}
		},

		handleMatchFound(payload: MatchFoundPayload) {
			// Use your existing initializeGame logic but with server data
			this.initializeGame(payload.difficulty);
			this.gameId = payload.roomId;
			// Optionally set opponents here if needed
			this.isActive = true; // You might want to add 'isActive' to your State
		},

		handleGuessResult(payload: GuessResultPayload) {
			// Find the guess that matches what the server just validated
			// Usually, this is the most recent guess in your list
			const lastGuess = this.guesses[this.guesses.length - 1];
			if (lastGuess) {
				lastGuess.result = payload.result;
			}

			if (payload.result.every((s) => s === "correct")) {
				this.isWinner = true;
				this.isGameOver = true;
			}
		},

		handleGameOver(payload: GameOverPayload) {
			this.isActive = false;
			this.isGameOver = true;
			// payload.winner will be the username of the winner or null
			this.isWinner = payload.winner === this.username;
		},

		setError(message: string) {
			// Add an 'error' string to your State to show in the UI
			this.error = message;
			this.isActive = false; // Optionally set the game as inactive on error
			console.error("Game Error:", message);
		},
	},
});
