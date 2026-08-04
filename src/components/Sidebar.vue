<script setup>
import { useAuthStore } from '@/stores/auth';

// Menerima props isOpen dari parent (Layout)
defineProps({
    isOpen: {
        type: Boolean,
        default: false
    }
})

// Mendefinisikan emit untuk menutup sidebar dari dalam komponen ini
const emit = defineEmits(['close'])

const authStore = useAuthStore()

const closeSidebar = () => {
    emit('close')
}
</script>

<template>
    <!-- Sidebar -->
    <aside :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
        class="fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0">
        <div class="h-16 flex items-center justify-between px-6 border-b border-gray-700">
            <h1 class="text-xl font-bold">Admin Desa</h1>

            <!-- Tombol Close (Silang) hanya tampil di Mobile -->
            <button @click="closeSidebar" class="lg:hidden text-gray-400 hover:text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                    </path>
                </svg>
            </button>
        </div>

        <!-- Tambahkan overflow-y-auto agar menu bisa discroll jika layarnya pendek -->
        <!-- Tambahkan @click="closeSidebar" agar sidebar otomatis tertutup saat link diklik di HP -->
        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto" @click="closeSidebar">
            <router-link to="/dashboard" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition"
                active-class="bg-blue-600 hover:bg-blue-600">
                Dashboard
            </router-link>
            <router-link to="/carousel" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition"
                active-class="bg-blue-600 hover:bg-blue-600">
                Carousel
            </router-link>
            <router-link to="/sambutan" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition"
                active-class="bg-blue-600 hover:bg-blue-600">
                Sambutan
            </router-link>
            <router-link to="/profildesa" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition"
                active-class="bg-blue-600 hover:bg-blue-600">
                Profil Desa
            </router-link>
            <router-link to="/apbdes" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition"
                active-class="bg-blue-600 hover:bg-blue-600">
                Laporan Keuangan
            </router-link>
            <router-link to="/perangkatdesa" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition"
                active-class="bg-blue-600 hover:bg-blue-600">
                Perangkat Desa
            </router-link>
            <router-link to="/kependudukan" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition"
                active-class="bg-blue-600 hover:bg-blue-600">
                Kependudukan
            </router-link>
            <router-link to="/pemetaan" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition"
                active-class="bg-blue-600 hover:bg-blue-600">
                Pemetaan
            </router-link>
            <router-link to="/artikel" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition"
                active-class="bg-blue-600 hover:bg-blue-600">
                Artikel
            </router-link>
            <router-link to="/kategori" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition"
                active-class="bg-blue-600 hover:bg-blue-600">
                Kategori Artikel
            </router-link>
            <router-link to="/potensidesa" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition"
                active-class="bg-blue-600 hover:bg-blue-600">
                Potensi Desa
            </router-link>
            <router-link to="/galeri" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition"
                active-class="bg-blue-600 hover:bg-blue-600">
                galeri
            </router-link>
            <router-link to="/regulasi" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition"
                active-class="bg-blue-600 hover:bg-blue-600">
                Regulasi
            </router-link>
            <router-link to="/footer" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition"
                active-class="bg-blue-600 hover:bg-blue-600">
                Footer
            </router-link>
            <router-link to="/user" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition"
                active-class="bg-blue-600 hover:bg-blue-600">
                Kelola Akun
            </router-link>
        </nav>

        <!-- Bagian Bawah Sidebar (Admin Info) -->
        <div class="p-4 border-t border-gray-700">
            <p class="text-sm text-gray-400 mb-2">Login sebagai:</p>
            <p class="font-semibold">{{ authStore.admin?.username || 'Admin' }}</p>
        </div>
    </aside>
</template>