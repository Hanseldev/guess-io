import { io } from "socket.io-client";

const socket = io('', {
    autoConnect: false
})

export const useSocket = () => {
    const connect = () => socket.connect()
    const disconnect = () => socket.disconnect()

    const emit = (event: string, payload: any) => socket.emit(event, payload)
    const on = (event: string, callback: (data: any) => void) => socket.on(event, callback) 
    const off = (event: string, callback?: (data: any) => void) => socket.off(event, callback)

    return {
        connect,
        disconnect,
        emit,
        on,
        off
    }
}