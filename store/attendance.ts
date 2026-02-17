import { defineStore } from 'pinia'
import { attendanceService, type ClientData } from '~/services/attendance.service'

export const useAttendanceStore = defineStore('attendance', {
    state: () => ({
        status: 'waiting' as 'waiting' | 'active' | 'tabulating' | 'checkout',
        clientData: null as ClientData | null,
        timer: 0,
        timerInterval: null as NodeJS.Timeout | null,
        currentIdClicamptel: null as string | null,
        socketConnected: false,
        loading: false,
    }),
    actions: {
        setSocketConnected(isConnected: boolean) {
            this.socketConnected = isConnected
        },
        async startAttendance(idclicamptel: string) {
            if (this.status !== 'waiting') return // Prevent interrupting ongoing attendance if not handled? Or should we queue? Assuming simple flow for now.

            this.loading = true
            this.currentIdClicamptel = idclicamptel
            try {
                const data = await attendanceService.getClientData(idclicamptel)
                this.clientData = data
                this.status = 'active'
                this.startTimer()
            } catch (error) {
                console.error('Failed to fetch client data', error)
                // Handle error (notify user, reset state?)
                this.resetState()
            } finally {
                this.loading = false
            }
        },
        startTimer() {
            if (this.timerInterval) clearInterval(this.timerInterval)
            this.timer = 0
            this.timerInterval = setInterval(() => {
                this.timer++
            }, 1000)
        },
        stopTimer() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval)
                this.timerInterval = null
            }
        },
        async loadTabulation() {
            this.status = 'tabulating'
            // Logic to maybe load options if not already loaded
        },
        openCheckout() {
            this.status = 'checkout'
        },
        async closeAttendance() {
            this.stopTimer()
            this.resetState()
        },
        resetState() {
            this.status = 'waiting'
            this.clientData = null
            this.currentIdClicamptel = null
            this.timer = 0
            if (this.timerInterval) {
                clearInterval(this.timerInterval)
                this.timerInterval = null
            }
        }
    }
})
