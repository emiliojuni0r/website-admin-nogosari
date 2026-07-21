<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/utils/api'

const router = useRouter()
const authStore = useAuthStore()

const adminName = authStore.admin?.username || 'Admin'
const isLoading = ref(true)

// State untuk menyimpan angka statistik
const stats = ref({
    totalArtikel: 0,
    totalPotensi: 0,
    totalPenduduk: 0,
    totalPerangkat: 0
})

// State untuk 5 berita terbaru
const recentArticles = ref([])

// Fungsi untuk format tanggal bahasa Indonesia
const formatDate = (dateString) => {
    if (!dateString) return '-'
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('id-ID', options)
}

const currentDate = formatDate(new Date())

// Mengambil semua data ringkasan secara bersamaan
const fetchDashboardData = async () => {
    isLoading.value = true
    try {
        // Jalankan semua request secara paralel agar lebih cepat
        const [resArtikel, resPotensi, resPenduduk, resPerangkat] = await Promise.all([
            api.get('/articles?limit=5'), // Ambil sekalian 5 data terbaru
            api.get('/potensi?limit=1'),  // Cukup limit 1 karena kita cuma butuh totalData-nya
            api.get('/kependudukan'),     // Ambil summary kependudukan
            api.get('/profil/perangkat')  // Ambil daftar perangkat
        ])

        // Masukkan data ke state statistik
        stats.value.totalArtikel = resArtikel.data.pagination?.totalData || 0
        stats.value.totalPotensi = resPotensi.data.pagination?.totalData || 0
        stats.value.totalPenduduk = resPenduduk.data.summary?.totalPenduduk || 0
        stats.value.totalPerangkat = resPerangkat.data.data?.length || 0

        // Masukkan 5 berita terbaru ke state
        recentArticles.value = resArtikel.data.data || []

    } catch (error) {
        console.error("Gagal memuat data dashboard:", error)
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchDashboardData()
})
</script>

<template>
    <div class="space-y-6">

        <!-- HEADER WELCOME -->
        <div
            class="bg-gradient-to-r from-blue-700 to-blue-500 rounded-lg shadow-lg p-6 text-white flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-bold mb-2">Selamat Datang, {{ adminName }}! 👋</h1>
                <!-- <p class="text-blue-100">Ini adalah pusat kendali Website Sistem Informasi Desa. Anda memiliki kendali
                    penuh.</p> -->
            </div>
            <div class="hidden md:block text-right">
                <p class="text-sm text-blue-200">Tanggal Hari Ini</p>
                <p class="text-lg font-semibold">{{ currentDate }}</p>
            </div>
        </div>

        <!-- LOADING STATE -->
        <div v-if="isLoading" class="flex justify-center items-center h-40">
            <p class="text-gray-500 font-medium animate-pulse">Menyiapkan data dashboard...</p>
        </div>

        <div v-else class="space-y-6">

            <!-- WIDGET STATISTIK (4 Kolom) -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Card Artikel -->
                <div
                    class="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500 flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500 font-medium uppercase">Total Berita</p>
                        <h3 class="text-3xl font-bold text-gray-800">{{ stats.totalArtikel }}</h3>
                    </div>
                    <div class="p-3 bg-blue-100 text-blue-600 rounded-full">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z">
                            </path>
                        </svg>
                    </div>
                </div>

                <!-- Card Potensi -->
                <div
                    class="bg-white p-6 rounded-lg shadow border-l-4 border-green-500 flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500 font-medium uppercase">Potensi Desa</p>
                        <h3 class="text-3xl font-bold text-gray-800">{{ stats.totalPotensi }}</h3>
                    </div>
                    <div class="p-3 bg-green-100 text-green-600 rounded-full">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z">
                            </path>
                        </svg>
                    </div>
                </div>

                <!-- Card Penduduk -->
                <div
                    class="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500 flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500 font-medium uppercase">Total Penduduk</p>
                        <h3 class="text-3xl font-bold text-gray-800">{{ stats.totalPenduduk.toLocaleString('id-ID') }}
                        </h3>
                    </div>
                    <div class="p-3 bg-yellow-100 text-yellow-600 rounded-full">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                            </path>
                        </svg>
                    </div>
                </div>

                <!-- Card Perangkat -->
                <div
                    class="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500 flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500 font-medium uppercase">Perangkat Desa</p>
                        <h3 class="text-3xl font-bold text-gray-800">{{ stats.totalPerangkat }}</h3>
                    </div>
                    <div class="p-3 bg-purple-100 text-purple-600 rounded-full">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
                            </path>
                        </svg>
                    </div>
                </div>
            </div>

            <!-- BAWAH: QUICK ACTIONS & RECENT ARTIKEL -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <!-- Kolom Kiri (Akses Cepat) -->
                <div class="lg:col-span-1 space-y-6">
                    <div class="bg-white p-6 rounded-lg shadow">
                        <h3 class="text-lg font-bold mb-4 border-b pb-2">Akses Cepat</h3>
                        <div class="grid grid-cols-1 gap-3">
                            <button @click="router.push({ name: 'form-artikel' })"
                                class="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-medium transition flex justify-between items-center">
                                <span>📝 Tulis Berita Baru</span>
                                <span>→</span>
                            </button>
                            <button @click="router.push({ name: 'kependudukan' })"
                                class="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-md font-medium transition flex justify-between items-center">
                                <span>📊 Update Kependudukan</span>
                                <span>→</span>
                            </button>
                            <button @click="router.push({ name: 'sambutan' })"
                                class="w-full text-left px-4 py-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-md font-medium transition flex justify-between items-center">
                                <span>🎤 Edit Sambutan Kades</span>
                                <span>→</span>
                            </button>
                            <button @click="router.push({ name: 'carousel' })"
                                class="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md font-medium transition flex justify-between items-center">
                                <span>🖼️ Ganti Banner Utama (carousel)</span>
                                <span>→</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Kolom Kanan (Berita Terbaru) -->
                <div class="lg:col-span-2">
                    <div class="bg-white p-6 rounded-lg shadow h-full">
                        <div class="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 class="text-lg font-bold">5 Berita / Artikel Terakhir</h3>
                            <button @click="router.push({ name: 'kelola-berita' })"
                                class="text-sm text-blue-600 hover:underline">Lihat Semua</button>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <tbody>
                                    <tr v-if="recentArticles.length === 0">
                                        <td class="py-4 text-center text-gray-500">Belum ada berita yang diterbitkan.
                                        </td>
                                    </tr>
                                    <tr v-for="artikel in recentArticles" :key="artikel.id"
                                        class="border-b last:border-0 hover:bg-gray-50">
                                        <td class="py-3 pr-4">
                                            <p class="font-medium text-gray-800 line-clamp-1">{{ artikel.title }}</p>
                                            <p class="text-xs text-gray-500 mt-1">{{ artikel.category?.name ||
                                                'Tanpa Kategori' }}</p>
                                        </td>
                                        <td class="py-3 text-right whitespace-nowrap">
                                            <span class="text-sm text-gray-500">{{ formatDate(artikel.date) }}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    </div>
</template>