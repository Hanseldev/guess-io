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

}

export const useGameStore = defineStore("game", {
    state: (): GameState => ({
        username: '',
        difficulty: 'easy',
        gameId: '',
        guesses: [],
        currentGuess: '',
        opponents: [],
        isWinner: false,
        isGameOver: false
    }),
    
});
