import { useSocket } from "./useSocket";
import { useGameStore } from "@/stores/gameStore";
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
		if (socket.areListenersInitialized()) return; // ✅ don't double-register
		socket.markListenersInitialized();
		// ✅ Removed socket.socket.onAny — that was socket.io only

		socket.on("match_found", (payload: MatchFoundPayload) => {
			console.log("🎮 Match found:", payload);
			store.handleMatchFound(payload);
		});

		socket.on("guess_result", (payload: GuessResultPayload) => {
			console.log("Guess result received", payload);
			store.handleGuessResult(payload);
		});

		socket.on("guess_made", (payload: { username: string; guess: string }) => {
			console.log("👥 Opponent guess received:", payload);
			console.log(
				"👥 Known opponents:",
				JSON.stringify(store.opponents.map((o) => o.name)),
			);
			store.handleOpponentGuess(payload);
		});

		socket.on("game_over", (payload: GameOverPayload) => {
			console.log("Game Over", payload);
			store.handleGameOver(payload);
		});

		socket.on("error", (payload: ErrorPayload) => {
			console.error("Socket Error:", payload.message);
			const message =
				typeof payload === "string"
					? payload
					: (payload?.message ?? "Unknown error");
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
