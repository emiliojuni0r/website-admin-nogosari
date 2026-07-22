<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore()
const router = useRouter()

</script>

<template>
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-800 text-white flex flex-col">
        <div class="h-16 flex items-center justify-center border-b border-gray-700">
            <h1 class="text-xl font-bold">Admin Desa</h1>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-2">
            <!-- Gunakan exact-active-class dari Vue Router untuk styling menu aktif -->
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
            <router-link to="/footer" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition"
                active-class="bg-blue-600 hover:bg-blue-600">
                Footer
            </router-link>
            <router-link to="/user" class="block px-4 py-2 rounded-md hover:bg-gray-700 transition"
                active-class="bg-blue-600 hover:bg-blue-600">
                Kelola Akun
            </router-link>
            <!-- Tambahkan menu lain di sini -->
        </nav>

        <!-- Bagian Bawah Sidebar (Admin Info) -->
        <div class="p-4 border-t border-gray-700">
            <p class="text-sm text-gray-400 mb-2">Login sebagai:</p>
            <p class="font-semibold">{{ useAuthStore.admin?.username || 'Admin' }}</p>
        </div>
    </aside>
</template>