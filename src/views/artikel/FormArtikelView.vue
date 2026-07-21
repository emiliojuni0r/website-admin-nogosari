<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/api'

// Import Quill Editor dan CSS-nya
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const route = useRoute()
const router = useRouter()

const isEditMode = ref(false)
const articleId = ref(null) // Disimpan untuk endpoint PUT
const isLoading = ref(false)

const form = ref({
    title: '',
    categoryId: '',
    content: '',
    thumbnail: null // File di-handle terpisah dari string
})

const categories = ref([]) // Untuk dropdown kategori

// Tangkap file dari input type="file"
const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
        form.value.thumbnail = file
    }
}

// Ambil Kategori untuk Select
const fetchCategories = async () => {
    try {
        const res = await api.get('/categoryartikel') // Sesuaikan endpoint kategori kamu
        categories.value = res.data.data || []
    } catch (error) {
        console.error("Gagal ambil kategori")
    }
}

// Load data jika sedang dalam mode Edit
const loadArticleData = async (slug) => {
    try {
        const res = await api.get(`/artikel/${slug}`)
        const article = res.data.data

        articleId.value = article.id // Simpan ID untuk update
        form.value.title = article.title
        form.value.categoryId = article.categoryId
        form.value.content = article.content
        form.value.thumbnail = article.thumbnail
        // Thumbnail tidak di-load ke input file (keamanan browser), biarkan null kecuali user mengunggah baru
    } catch (error) {
        alert('Gagal memuat data artikel')
        router.push({ name: 'artikel' })
    }
}

// Handle Submit (Create / Update)
const submitForm = async () => {
    isLoading.value = true

    // WAJIB: Gunakan FormData karena ada file (gambar)
    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('categoryId', form.value.categoryId)
    formData.append('content', form.value.content)

    if (form.value.thumbnail) {
        formData.append('thumbnail', form.value.thumbnail)
    }

    try {
        if (isEditMode.value) {
            // Endpoint update butuh ID
            await api.put(`/artikel/${articleId.value}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            alert('Artikel berhasil diperbarui!')
        } else {
            await api.post('/artikel', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            alert('Artikel berhasil diterbitkan!')
        }
        router.push({ name: 'artikel' })
    } catch (error) {
        alert(error.response?.data?.message || 'Terjadi kesalahan')
    } finally {
        isLoading.value = false
    }
}

const IMAGE_URL = import.meta.env.VITE_API_URL

const thumbnailPreview = computed(() => {
    if (!form.value.thumbnail) return ''

    // kalau File baru dipilih
    if (form.value.thumbnail instanceof File) {
        return URL.createObjectURL(form.value.thumbnail)
    }

    // kalau string dari database
    return IMAGE_URL + form.value.thumbnail
})

onMounted(() => {
    fetchCategories()

    // Cek apakah URL memiliki parameter slug
    if (route.params.slug) {
        isEditMode.value = true
        loadArticleData(route.params.slug)
    }

    console.log("thumbnail:", form.value.thumbnail)
    console.log("preview:", thumbnailPreview.value)
})
</script>

<template>
    <div class="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">{{ isEditMode ? 'Edit Artikel' : 'Tulis Artikel Baru' }}</h2>
            <button @click="router.push({ name: 'artikel' })" class="text-gray-500 hover:text-gray-700">
                Kembali
            </button>
        </div>

        <form @submit.prevent="submitForm" class="space-y-6 flex flex-col">
            <!-- Judul -->
            <div>
                <label class="block font-medium mb-1">Judul Artikel</label>
                <input v-model="form.title" type="text" required
                    class="w-full border rounded p-2 focus:outline-none focus:border-blue-500"
                    placeholder="Masukkan judul..." />
            </div>

            <!-- Kategori & Thumbnail (Grid) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block font-medium mb-1">Kategori</label>
                    <select v-model="form.categoryId" required
                        class="w-full border rounded p-2 focus:outline-none focus:border-blue-500">
                        <option value="" disabled>Pilih Kategori</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                            {{ cat.name }}
                        </option>
                    </select>
                </div>

                <div>
                    <label class="block font-medium mb-1">Thumbnail Gambar</label>
                    <input type="file" accept="image/*" @change="handleFileChange" :required="!isEditMode"
                        class="w-full border rounded p-1" />
                    <p v-if="isEditMode" class="text-sm text-gray-500 mt-1">
                        *Biarkan kosong jika tidak ingin mengubah gambar
                    </p>
                </div>
            </div>

            <div class="mx-auto">
                <h1>Preview thumbnail</h1>
                <img v-if="thumbnailPreview" :src="thumbnailPreview" class="w-64 rounded" alt="Thumbnail" />
            </div>

            <!-- Rich Text Editor (Vue Quill) -->
            <div class="flex flex-col">
                <label class="block font-medium mb-1">Konten Artikel</label>
                <!-- Pastikan contentType="html" agar yang dikirim berupa tag HTML, bukan JSON format Quill -->
                <div class="bg-white border rounded min-h-[300px]">
                    <QuillEditor v-model:content="form.content" contentType="html" theme="snow" class="min-h-[250px]" />
                </div>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end pt-4">
                <button type="submit" :disabled="isLoading"
                    class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition">
                    {{ isLoading ? 'Menyimpan...' : (isEditMode ? 'Update Artikel' : 'Terbitkan Artikel') }}
                </button>
            </div>
        </form>
    </div>
</template>

<style>
/* Perbaikan tampilan Quill Editor supaya menyatu dengan Tailwind */
.ql-container {
    font-family: inherit;
    font-size: 1rem;
}

.ql-editor {
    min-height: 250px;
}
</style>