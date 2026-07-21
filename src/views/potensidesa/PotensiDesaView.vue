<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'

const router = useRouter()
const potensis = ref([])
const isLoading = ref(false)
const searchQuery = ref('')

const fetchPotensi = async () => {
    isLoading.value = true
    try {
        // Memanfaatkan fitur search dari backend kamu
        const response = await api.get(`/potensi?search=${searchQuery.value}`)
        potensis.value = response.data.data
    } catch (error) {
        console.error("Gagal mengambil data", error)
    } finally {
        isLoading.value = false
    }
}

const deletePotensi = async (id) => {
    if (confirm('Yakin ingin menghapus potensi desa ini beserta semua gambarnya?')) {
        try {
            await api.delete(`/potensi/${id}`)
            fetchPotensi() // Refresh tabel
        } catch (error) {
            alert('Gagal menghapus data')
        }
    }
}


const IMAGE_URL = import.meta.env.VITE_API_URL

// Fitur pencarian sederhana
const handleSearch = () => {
    fetchPotensi()
}

onMounted(() => {
    fetchPotensi()
})
</script>

<template>
    <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 class="text-2xl font-bold">Kelola Potensi Desa</h2>

            <div class="flex gap-2">
                <input v-model="searchQuery" @keyup.enter="handleSearch" type="text" placeholder="Cari potensi..."
                    class="border rounded-md px-3 py-2 focus:outline-blue-500" />
                <button @click="handleSearch" class="bg-gray-200 px-3 py-2 rounded-md hover:bg-gray-300">
                    Cari
                </button>
                <button @click="router.push({ name: 'form-potensidesa' })"
                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                    + Tambah Potensi
                </button>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-100 border-b">
                        <th class="p-3 w-24">Gambar</th>
                        <th class="p-3">Judul</th>
                        <th class="p-3 text-center">Jml Gambar</th>
                        <th class="p-3 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="isLoading">
                        <td colspan="4" class="text-center p-4">Memuat data...</td>
                    </tr>
                    <tr v-else-if="potensis.length === 0">
                        <td colspan="4" class="text-center p-4 text-gray-500">Tidak ada data ditemukan.</td>
                    </tr>
                    <tr v-for="item in potensis" :key="item.id" class="border-b hover:bg-gray-50">
                        <td class="p-3">
                            <!-- Menampilkan gambar pertama dari array images -->
                            <img v-if="item.images && item.images.length > 0"
                                :src="`${IMAGE_URL}${item.images[0].imageUrl}`" class="w-16 h-16 object-cover rounded"
                                alt="Thumbnail" />
                            <div v-else
                                class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                No Image
                            </div>
                        </td>
                        <td class="p-3 font-medium">{{ item.title }}</td>
                        <td class="p-3 text-center">
                            <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                {{ item.images?.length || 0 }} File
                            </span>
                        </td>
                        <td class="p-3 flex justify-center gap-2 mt-3">
                            <button @click="router.push({ name: 'form-potensidesa', params: { id: item.id } })"
                                class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm">
                                Edit
                            </button>
                            <button @click="deletePotensi(item.id)"
                                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">
                                Hapus
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>