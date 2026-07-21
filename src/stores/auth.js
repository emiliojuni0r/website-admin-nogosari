import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(null)
    const admin = ref(null)

    // Fungsi untuk menyimpan data saat login sukses
    const setAuth = (data) => {
        token.value = data.token
        admin.value = data.admin
    }

    // Fungsi untuk menghapus data saat logout
    const clearAuth = () => {
        token.value = null
        admin.value = null
    }

    // Getter untuk mengecek apakah user sudah login
    const isAuthenticated = () => {
        return token.value !== null
    }

    return { token, admin, setAuth, clearAuth, isAuthenticated }
}, {
    // Opsi ini akan menyimpan state ke localStorage otomatis
    persist: true
})