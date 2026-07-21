<script setup>
import Sidebar from '@/components/Sidebar.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
    authStore.clearAuth()
    router.push({ name: 'login' })
}
</script>

<template>
    <div class="flex h-screen bg-gray-100">
        <sidebar />

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col overflow-hidden">
            <!-- Topbar -->
            <header class="h-16 bg-white shadow flex items-center justify-end px-6">
                <!-- <h2 class="text-xl font-semibold text-gray-800">Sistem Informasi Desa</h2> -->
                <button @click="handleLogout"
                    class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition">
                    Logout
                </button>
            </header>

            <!-- Area Halaman Utama (Dinamic) -->
            <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                <!-- Di sinilah DashboardView atau Halaman lain akan dirender -->
                <router-view />
            </main>
        </div>
    </div>
</template>