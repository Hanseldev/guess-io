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
	opponentLastGuesses: Record<string, string[]>;

	// Game logic state
	guesses: GuessResult[];
	currentGuess: (string | number)[];
	currentAttemptIndex: number;

	// Status

	isWinner: boolean;
	isGameOver: boolean;
	secret: string;
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
		opponentLastGuesses: {},

		guesses: [] as GuessResult[],
		currentGuess: [],
		currentAttemptIndex: 0,
		secret: '',

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
			const guessString = this.currentGuess.join("");

			// 2. We do NOT push to this.guesses here anymore.
			// We let handleGuessResult do that so the UI stays "Authoritative."

			this.currentAttemptIndex++;
			this.currentGuess = Array(this.guessLength).fill("");

			return guessString;
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
			// 1. Set the core game identifiers
			this.gameId = payload.roomId;
			this.difficulty = payload.difficulty;
			this.guessLength = payload.digit; // 'digit' from backend defines the code length

			const settings = GAME_MODES[payload.difficulty];
			if (settings) {
				this.guessAttempts = settings.maxAttempts; // e.g., 10, 12, or 15[cite: 1]
			}

			// 2. Initialize the board based on the digit length provided by the server
			this.currentGuess = Array(this.guessLength).fill("");
			this.guesses = [];
			this.currentAttemptIndex = 0;

			// 3. Set up Opponents (filtering out the local user)[cite: 1]
			// We map the string array from the server into your Player object structure
			this.opponents = payload.players
				.filter((name) => name !== this.username)
				.map((name) => ({
					id: name, // Using name as ID since the backend uses usernames for identification[cite: 1]
					name: name,
					progress: [],
				}));

			// 4. Initialize the tracking for opponent guess history
			this.opponents.forEach((opponent) => {
				this.opponentLastGuesses[opponent.name] = [];
			});

			// 5. Activate the game view
			this.isActive = true;
			this.isGameOver = false;
			this.isWinner = false;
		},

		handleGuessResult(payload: GuessResultPayload) {
			// 1. Add the official result to your history
			// We split the guess string back into an array for your tile components
			this.guesses.push({
				guess: payload.guess.split(""),
				result: payload.result,
			});

			// 2. Check for Win condition based on the 'correct' status
			const isAllCorrect = payload.result.every((s) => s === "correct");

			if (isAllCorrect) {
				this.isWinner = true;
				this.isGameOver = true;
			}
			// 3. Check for Loss (Out of attempts)
			else if (this.guesses.length >= this.guessAttempts) {
				this.isGameOver = true;
				this.isWinner = false;
			}
		},

		handleOpponentGuess(payload: { username: string; guess: string }) {
			if (!this.opponentLastGuesses[payload.username]) {
				this.opponentLastGuesses[payload.username] = [];
			}

			// 2. Add the new guess string to their history
			this.opponentLastGuesses[payload.username]?.push(payload.guess);

			// 3. Optional: Update the opponent's visual progress
			// The backend says we don't get the result (colors) for others
			const opponent = this.opponents.find((p) => p.name === payload.username);
			if (opponent) {
				opponent.progress.push("empty");
			}
		},

		handleGameOver(payload: GameOverPayload) {
			this.isActive = false;
			this.isGameOver = true;
			// payload.winner will be the username of the winner or null
			this.secret = payload.secret
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
