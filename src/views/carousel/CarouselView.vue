<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'

const router = useRouter()
const carousels = ref([])
const isLoading = ref(false)

const IMAGE_URL = import.meta.env.VITE_API_URL

const fetchCarousels = async () => {
    isLoading.value = true
    try {
        const response = await api.get('/homepage/carousel')
        carousels.value = response.data.data
    } catch (error) {
        console.error("Gagal mengambil data carousel")
    } finally {
        isLoading.value = false
    }
}

const deleteCarousel = async (id) => {
    if (confirm('Yakin ingin menghapus carousel ini? Gambar akan dihapus permanen dari server.')) {
        try {
            await api.delete(`/homepage/carousel/${id}`)
            fetchCarousels()
        } catch (error) {
            alert('Gagal menghapus carousel')
        }
    }
}

onMounted(() => {
    fetchCarousels()
})
</script>

<template>
    <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Kelola Banner / Carousel</h2>
            <button @click="router.push({ name: 'form-carousel' })"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                + Tambah Carousel
            </button>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-100 border-b">
                        <th class="p-3 w-32">Gambar</th>
                        <th class="p-3">Judul Utama (Title)</th>
                        <th class="p-3">Sub-judul (Subtitle)</th>
                        <th class="p-3 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="isLoading">
                        <td colspan="4" class="text-center p-4">Memuat data...</td>
                    </tr>
                    <tr v-else-if="carousels.length === 0">
                        <td colspan="4" class="text-center p-4 text-gray-500">Belum ada carousel.</td>
                    </tr>
                    <tr v-for="item in carousels" :key="item.id" class="border-b hover:bg-gray-50">
                        <td class="p-3">
                            <img :src="`${IMAGE_URL}${item.image}`" class="w-24 h-12 object-cover rounded shadow" />
                        </td>
                        <td class="p-3 font-medium">{{ item.title || '-' }}</td>
                        <td class="p-3 text-gray-600">{{ item.subtitle || '-' }}</td>
                        <td class="p-3 flex justify-center gap-2 mt-1">
                            <button @click="router.push({ name: 'form-carousel', params: { id: item.id } })"
                                class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm">
                                Edit
                            </button>
                            <button @click="deleteCarousel(item.id)"
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