import { io, Socket } from "socket.io-client";

// 1. Define a global type for TypeScript
declare global {
	interface Window {
		__GAME_SOCKET__?: Socket;
	}
}

const getSocket = (): Socket => {
	// 2. Check the global window object instead of a local variable
	if (!window.__GAME_SOCKET__) {
		window.__GAME_SOCKET__ = io("https://guess-io.onrender.com", {
			transports: ["websocket"],
			withCredentials: true,
			autoConnect: true,
		});

		window.__GAME_SOCKET__.on("connect", () => {
			console.log("✅ Socket Connected:", window.__GAME_SOCKET__?.id);
		});
	}
	return window.__GAME_SOCKET__;
};

export const socket = getSocket();

export const useSocket = () => {
	return {
		socket, // Export the raw socket for convenience
		emit: (event: string, payload: any) => socket.emit(event, payload),
		on: (event: string, callback: (data: any) => void) =>
			socket.on(event, callback),
		off: (event: string, callback?: (data: any) => void) =>
			socket.off(event, callback),
		connected: () => socket.connected,
	};
};
