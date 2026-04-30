let socketInstance: WebSocket | null = null;
let messageHandlers: Record<string, ((data: any) => void)[]> = {};
let listenersInitialized = false; // ✅ guard

export const useSocket = () => {
	if (!socketInstance || socketInstance.readyState === WebSocket.CLOSED) {
		listenersInitialized = false; // ✅ reset if socket was recreated
		socketInstance = new WebSocket("wss://guess-io.onrender.com");

		socketInstance.onopen = () => {
			console.log("✅ Connected to Game Server");
		};

		socketInstance.onclose = (event) => {
			console.warn("❌ Disconnected:", event.code, event.reason);
		};

		socketInstance.onerror = (err) => {
			console.error("🔴 WebSocket error:", err);
		};

		socketInstance.onmessage = (event) => {
			try {
				const { type, payload } = JSON.parse(event.data);
				console.log("📨 IN:", type, payload);

				if (type === "ping") {
					socketInstance?.send(JSON.stringify({ type: "pong", payload: {} }));
					return;
				}

				const handlers = messageHandlers[type] ?? [];
				handlers.forEach((fn) => fn(payload));
			} catch (e) {
				console.error("Failed to parse message:", event.data);
			}
		};
	}

	const emit = (event: string, payload: any) => {
		if (socketInstance?.readyState === WebSocket.OPEN) {
			socketInstance.send(JSON.stringify({ type: event, payload }));
			console.log("📤 OUT:", event, payload);
		} else {
			console.warn("⚠️ Socket not open, cannot emit:", event);
		}
	};

	const on = (event: string, callback: (data: any) => void) => {
		if (!messageHandlers[event]) messageHandlers[event] = [];
		// ✅ Prevent duplicate handlers
		if (!messageHandlers[event].includes(callback)) {
			messageHandlers[event].push(callback);
		}
	};

	const off = (event: string, callback?: (data: any) => void) => {
		if (!callback) {
			messageHandlers[event] = [];
		} else {
			messageHandlers[event] = (messageHandlers[event] ?? []).filter(
				(fn) => fn !== callback,
			);
		}
	};

	// ✅ Expose whether listeners have been initialized
	const markListenersInitialized = () => {
		listenersInitialized = true;
	};
	const areListenersInitialized = () => listenersInitialized;

	return {
		socket: socketInstance,
		emit,
		on,
		off,
		connected: () => socketInstance?.readyState === WebSocket.OPEN,
		markListenersInitialized,
		areListenersInitialized,
	};
};
