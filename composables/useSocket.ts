import { io, type Socket } from 'socket.io-client'
import { useAttendanceStore } from '~/store/attendance'

let socket: Socket | null = null

export const useSocket = () => {
    const attendanceStore = useAttendanceStore()
    const config = useRuntimeConfig()
    // Assuming backend URL is available via config or environment
    // Use a default or configured URL. 
    // Since env might be different, let's try to get it from public config or default to localhost:3000 if not set (adjust as needed)
    const socketUrl = config.public.apiBaseUrl || 'http://localhost:3000'

    const connect = () => {
        if (socket?.connected) return

        socket = io(socketUrl, {
            transports: ['websocket'],
            autoConnect: true,
        })

        socket.on('connect', () => {
            console.log('Socket connected')
            attendanceStore.setSocketConnected(true)
        })

        socket.on('disconnect', () => {
            console.log('Socket disconnected')
            attendanceStore.setSocketConnected(false)
        })

        socket.on('idclicamptel', (data: { id: string }) => {
            console.log('Received idclicamptel:', data)
            if (data && data.id) {
                attendanceStore.startAttendance(data.id)
            }
        })

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error)
        })
    }

    const disconnect = () => {
        if (socket) {
            socket.disconnect()
            socket = null
        }
    }

    return {
        connect,
        disconnect,
        socket
    }
}
