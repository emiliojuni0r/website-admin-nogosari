<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const isLoading = ref(false)

const form = ref({
    name: '',
    content: '',
    image: null
})

const existingImage = ref(null) // Menyimpan URL gambar dari backend
const imagePreview = ref(null) // Menyimpan URL preview gambar baru

const IMAGE_URL = import.meta.env.VITE_API_URL

// Ambil data saat ini
const loadSambutan = async () => {
    try {
        const res = await api.get('homepage/sambutan')
        const data = res.data.data

        if (data) {
            form.value.name = data.name
            form.value.content = data.content
            if (data.image) {
                existingImage.value = `${IMAGE_URL}${data.image}`
            }
        }
    } catch (error) {
        console.error('Gagal memuat data sambutan')
    }
}

// Handle file gambar
const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
        form.value.image = file
        imagePreview.value = URL.createObjectURL(file) // Buat preview
    } else {
        form.value.image = null
        imagePreview.value = null
    }
}

// Simpan data (Upsert - PUT)
const submitForm = async () => {
    isLoading.value = true

    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('content', form.value.content)

    if (form.value.image) {
        formData.append('image', form.value.image)
    }

    try {
        await api.put('homepage/sambutan', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        alert('Sambutan Kepala Desa berhasil diperbarui!')
        loadSambutan() // Reload gambar & data terbaru
        imagePreview.value = null // Reset preview baru
    } catch (error) {
        alert(error.response?.data?.message || 'Terjadi kesalahan')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    loadSambutan()
})
</script>

<template>
    <div class="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold mb-6">Kelola Sambutan Kepala Desa</h2>

        <form @submit.prevent="submitForm" class="space-y-6">
            <div>
                <label class="block font-medium mb-1">Nama Kepala Desa</label>
                <input v-model="form.name" type="text" class="w-full border rounded p-2 focus:border-blue-500"
                    required />
            </div>

            <div>
                <label class="block font-medium mb-2">Foto Kepala Desa</label>
                <div class="flex items-start gap-6">
                    <!-- Tampilkan foto lama / preview foto baru -->
                    <div v-if="imagePreview || existingImage"
                        class="w-32 h-32 shrink-0 border rounded-md overflow-hidden bg-gray-100">
                        <img :src="imagePreview || existingImage" class="w-full h-full object-cover" />
                    </div>
                    <div class="flex-1">
                        <input type="file" accept="image/*" @change="handleFileChange"
                            class="w-full border rounded p-2 bg-gray-50" />
                        <p class="text-sm text-gray-500 mt-1">
                            *Unggah foto baru untuk mengganti foto lama. Biarkan kosong jika tidak ingin mengubah.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Rich Text Editor -->
            <div class="flex flex-col">
                <label class="block font-medium mb-1">Isi Sambutan</label>
                <div class="bg-white border rounded min-h-[300px]">
                    <QuillEditor v-model:content="form.content" contentType="html" theme="snow" class="min-h-[250px]" />
                </div>
            </div>

            <div class="flex justify-end pt-4">
                <button type="submit" :disabled="isLoading"
                    class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                    {{ isLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}
                </button>
            </div>
        </form>
    </div>
</template>