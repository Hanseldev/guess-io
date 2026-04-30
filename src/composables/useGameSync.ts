import { useSocket } from "./useSocket";
import { useGameStore } from "@/stores/gameStore";
// Import your types to fix the 'payload' squiggles
import type {
	MatchFoundPayload,
	GuessResultPayload,
	GameOverPayload,
	ErrorPayload,
} from "@/types/types";

export const useGameSync = () => {
	const socket = useSocket();
	const store = useGameStore();

	const initListeners = () => {
		// Match found, join game
		socket.on("match_found", (payload: MatchFoundPayload) => {
			console.log("Match found:", payload);
			store.handleMatchFound(payload);
		});

		// when user guesses
		socket.on("guess_result", (payload: GuessResultPayload) => {
			console.log("Guess result received", payload);
			store.handleGuessResult(payload);
		});

		// when opponents guess
		socket.on("guess_made", (payload: { username: string; guess: string }) => {
			store.handleOpponentGuess(payload);
		});

		socket.on("game_over", (payload: GameOverPayload) => {
			console.log("Game Over", payload);
			store.handleGameOver(payload);
		});

		socket.on("error", (payload: ErrorPayload) => {
			console.error("Socket Error:", payload.message);
			store.setError(payload.message);
		});
	};

	const removeListeners = () => {
		socket.off("match_found");
		socket.off("guess_result");
		socket.off("game_over");
		socket.off("error");
	};

	return { initListeners, removeListeners };
};
