<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// State untuk mengatur sidebar di mode mobile
const isSidebarOpen = ref(false)

const handleLogout = () => {
    authStore.clearAuth()
    router.push({ name: 'login' })
}

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
    <div class="flex h-screen bg-gray-100 overflow-hidden">

        <!-- Overlay Gelap untuk Mobile (Muncul saat sidebar terbuka) -->
        <div v-if="isSidebarOpen" @click="isSidebarOpen = false"
            class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity"></div>

        <!-- Sidebar Component -->
        <Sidebar :isOpen="isSidebarOpen" @close="isSidebarOpen = false" />

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col overflow-hidden w-full">
            <!-- Topbar -->
            <header class="h-16 bg-white shadow flex items-center justify-between lg:justify-end px-4 lg:px-6 z-10">

                <!-- Hamburger Button (Hanya tampil di Mobile) -->
                <button @click="toggleSidebar"
                    class="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>

                <!-- Tombol Logout -->
                <button @click="handleLogout"
                    class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition text-sm lg:text-base">
                    Logout
                </button>
            </header>

            <!-- Area Halaman Utama (Dinamic) -->
            <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 lg:p-6">
                <router-view />
            </main>
        </div>
    </div>
</template>