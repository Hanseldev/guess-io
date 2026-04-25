import { useSocket } from "./useSocket";
import { useGameStore } from "@/stores/gameStore";

export const useGameSync = () => {
    const socket = useSocket()
    const store = useGameStore()

    const initListeners = () => {
        // Match found, join game
        socket.on('match_found', (payload) => {
            console.log('Match found:', payload);
            // store.handleMatchFound(payload)
        })
    }
        return {initListeners}
}