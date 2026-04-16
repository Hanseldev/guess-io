import { defineStore } from "pinia";
import type { Difficulty, GuessResult, Player } from "../types/types";

interface GameState {
    // session info
	username: string;
	difficulty: Difficulty;
    gameId: string;
    

    // Player's progress
    guesses: GuessResult[]
    currentGuess: string;

    opponents: Player[];

    isWinner: boolean
    isGameOver: boolean

    guessLength: number | null,
    guessAttempts: number | null

}

export const useGameStore = defineStore("game", {
    state: (): GameState => ({
        username: '',
        difficulty: '' as Difficulty,
        gameId: '',
        guesses: [] as GuessResult[],
        currentGuess: '',
        opponents: [] as Player[],
        isWinner: false,
        isGameOver: false,
        guessLength: null,
        guessAttempts: null
    }),
    actions: {
        initializeProfile() {
            const storedUsername = localStorage.getItem("username");
            if (storedUsername) {
                this.username = storedUsername;
            }

        }
    }
});
