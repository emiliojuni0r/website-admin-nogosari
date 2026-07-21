<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api' // Axios instance kamu

const router = useRouter()
const articles = ref([])
const isLoading = ref(false)

// Ambil data artikel (Gunakan endpoint API kamu, misal: /articles)
const fetchArticles = async () => {
    isLoading.value = true
    try {
        const response = await api.get('/artikel')
        articles.value = response.data.data
    } catch (error) {
        console.error("Gagal mengambil data", error)
    } finally {
        isLoading.value = false
    }
}

// Hapus artikel
const deleteArticle = async (id) => {
    if (confirm('Yakin ingin menghapus artikel ini?')) {
        try {
            await api.delete(`/artikel/${id}`)
            fetchArticles() // Refresh data setelah dihapus
        } catch (error) {
            alert('Gagal menghapus artikel')
        }
    }
}

onMounted(() => {
    fetchArticles()
})
</script>

<template>
    <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Kelola Artikel</h2>
            <button @click="router.push({ name: 'form-artikel' })"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                + Tambah Berita
            </button>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-100 border-b">
                        <th class="p-3">Judul</th>
                        <th class="p-3">Kategori</th>
                        <th class="p-3">Tanggal</th>
                        <th class="p-3 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="isLoading">
                        <td colspan="4" class="text-center p-4">Memuat data...</td>
                    </tr>
                    <tr v-for="item in articles" :key="item.id" class="border-b hover:bg-gray-50">
                        <td class="p-3">{{ item.title }}</td>
                        <td class="p-3">{{ item.category?.name || 'Tanpa Kategori' }}</td>
                        <td class="p-3">{{ new Date(item.date).toLocaleDateString('id-ID') }}</td>
                        <td class="p-3 flex justify-center gap-2">
                            <button @click="router.push({ name: 'form-artikel', params: { slug: item.slug } })"
                                class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm">
                                Edit
                            </button>
                            <button @click="deleteArticle(item.id)"
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