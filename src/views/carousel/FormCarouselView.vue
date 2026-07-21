<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/api'

const route = useRoute()
const router = useRouter()

const isEditMode = ref(false)
const carouselId = ref(null)
const isLoading = ref(false)

const form = ref({
    title: '',
    subtitle: '',
    image: null
})

const existingImage = ref(null)
const imagePreview = ref(null)

const IMAGE_URL = import.meta.env.VITE_API_URL


const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
        form.value.image = file
        imagePreview.value = URL.createObjectURL(file)
    } else {
        form.value.image = null
        imagePreview.value = null
    }
}

// Saat mode Edit, API kamu belum memiliki rute GET /carousel/:id 
// Jadi kita bisa akali dengan mengambil semua data lalu filter (atau kamu tambahkan route GET by id di backend nanti)
const loadCarouselData = async (id) => {
    try {
        const res = await api.get('homepage/carousel')
        const data = res.data.data
        // Cari data yang ID nya cocok
        const carousel = data.find(c => c.id === parseInt(id))

        if (carousel) {
            carouselId.value = carousel.id
            form.value.title = carousel.title
            form.value.subtitle = carousel.subtitle
            existingImage.value = `${IMAGE_URL}${carousel.image}`
        } else {
            alert('Data tidak ditemukan')
            router.push({ name: 'carousel' })
        }
    } catch (error) {
        alert('Gagal memuat data')
    }
}

const submitForm = async () => {
    isLoading.value = true

    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('subtitle', form.value.subtitle)

    if (form.value.image) {
        formData.append('image', form.value.image)
    }

    try {
        if (isEditMode.value) {
            await api.put(`homepage/carousel/${carouselId.value}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            alert('Carousel berhasil diperbarui!')
        } else {
            await api.post('homepage/carousel', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            alert('Carousel berhasil ditambahkan!')
        }
        router.push({ name: 'carousel' })
    } catch (error) {
        alert(error.response?.data?.message || 'Terjadi kesalahan')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    if (route.params.id) {
        isEditMode.value = true
        loadCarouselData(route.params.id)
    }
})
</script>

<template>
    <div class="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">{{ isEditMode ? 'Edit Carousel' : 'Tambah Carousel' }}</h2>
            <button @click="router.push({ name: 'carousel' })" class="text-gray-500 hover:text-gray-700">
                Kembali
            </button>
        </div>

        <form @submit.prevent="submitForm" class="space-y-6">
            <div>
                <label class="block font-medium mb-1">Judul Utama (Opsional)</label>
                <input v-model="form.title" type="text" class="w-full border rounded p-2 focus:border-blue-500"
                    placeholder="Contoh: Selamat Datang di Desa..." />
            </div>

            <div>
                <label class="block font-medium mb-1">Sub-judul / Keterangan (Opsional)</label>
                <input v-model="form.subtitle" type="text" class="w-full border rounded p-2 focus:border-blue-500"
                    placeholder="Contoh: Desa Wisata dan Budaya" />
            </div>

            <div>
                <label class="block font-medium mb-2">Gambar Banner / Carousel</label>

                <!-- Preview Gambar -->
                <div v-if="imagePreview || existingImage" class="mb-3">
                    <img :src="imagePreview || existingImage" class="w-full h-48 object-cover rounded-md border" />
                </div>

                <input type="file" accept="image/*" @change="handleFileChange" :required="!isEditMode"
                    class="w-full border rounded p-2 bg-gray-50" />
                <p v-if="isEditMode" class="text-sm text-red-500 mt-1">
                    *Biarkan kosong jika tidak ingin mengganti gambar.
                </p>
                <p v-else class="text-sm text-gray-500 mt-1">
                    *Gambar landscape direkomendasikan.
                </p>
            </div>

            <div class="flex justify-end pt-4">
                <button type="submit" :disabled="isLoading"
                    class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                    {{ isLoading ? 'Menyimpan...' : (isEditMode ? 'Update Carousel' : 'Simpan Carousel') }}
                </button>
            </div>
        </form>
    </div>
</template>