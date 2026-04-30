import { io, Socket } from "socket.io-client";

// might move to env later
const socket: Socket = io("https://guess-io.onrender.com", {
	autoConnect: false,
});

export const useSocket = () => {
	const connect = () => socket.connect();
	const disconnect = () => socket.disconnect();

	const emit = (event: string, payload: any) => {
		socket.emit(event, payload);
	};

	const on = (event: string, callback: (data: any) => void) => {
		socket.on(event, callback);
	};

	const off = (event: string, callback?: (data: any) => void) => {
		socket.off(event, callback);
	};

	return {
		connect,
		disconnect,
		emit,
		on,
		off,
		// for checking connection status in the UI
		connected: () => socket.connected,
	};
};
