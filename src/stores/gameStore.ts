import { defineStore } from "pinia";
import type { CellStatus, Difficulty, GuessResult, Player } from "../types/types";
import { GAME_MODES } from "@/constants/gameConfig";

interface GameState {
    // session & Profile
	username: string;
	difficulty: Difficulty;
    gameId: string;
    opponents: Player[]
    

    // Game logic state
    guesses: GuessResult[]
    currentGuess: (string | number)[];
    currentAttemptIndex: number;


    
    // Status

    isWinner: boolean
    isGameOver: boolean

    // config
    guessLength: number,
    guessAttempts: number

}

export const useGameStore = defineStore("game", {
    state: (): GameState => ({
        username: '',
        difficulty: '' as Difficulty,
        gameId: '',
        opponents: [] as Player[],

        guesses: [] as GuessResult[],
        currentGuess: [],
        currentAttemptIndex: 0,

        isWinner: false,
        isGameOver: false,

        guessLength: 0,
        guessAttempts: 0
    }),
    actions: {
        setCurentGuess(newGuess: (string | number)[]) {
            // update the current row as the user types
            this.currentGuess = newGuess
        },

        // Save current guess to history and reset for the next turn
        submitGuess() {
            // Push the current guess into the history array as a GuessResult object

            this.guesses.push({
                guess: [...this.currentGuess],
                result: Array(this.guessLength).fill('empty') as CellStatus[]

            })

            this.currentAttemptIndex++

            this.currentGuess = Array(this.guessLength).fill('')

        },

        initializeGame(difficulty: Difficulty) {
            this.difficulty = difficulty

            const settings = GAME_MODES[difficulty]

            this.guessLength = settings.codeLength
            this.guessAttempts = settings.maxAttempts

            this.currentGuess = Array(this.guessLength).fill('')
            this.guesses = []
            this.currentAttemptIndex = 0
            this.isGameOver = false
            this.isWinner = false
        },

        initializeProfile() {
            const storedUsername = localStorage.getItem("username");
            if (storedUsername) {
                this.username = storedUsername;
            }

        }
    }
});
