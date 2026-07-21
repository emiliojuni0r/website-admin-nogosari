import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL + "/api", // Sesuaikan dengan URL API backend kamu
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request Interceptor: Menyelipkan token ke setiap request
api.interceptors.request.use((config) => {
    const authStore = useAuthStore()

    if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
}, (error) => {
    return Promise.reject(error)
})

// Response Interceptor: Menangani error global (seperti token expired)
api.interceptors.response.use((response) => {
    return response
}, (error) => {
    if (error.response && error.response.status === 401) {
        // Jika token tidak valid / expired
        const authStore = useAuthStore()
        authStore.clearAuth()

        // Redirect ke login
        router.push({ name: 'login' })
    }
    return Promise.reject(error)
})

export default api