<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/api'

import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const route = useRoute()
const router = useRouter()

const isEditMode = ref(false)
const potensiId = ref(null)
const isLoading = ref(false)
const fileInput = ref(null) // Referensi ke input file

const form = ref({
    title: '',
    description: '',
})

// State Khusus Gambar
const existingImages = ref([]) // Menyimpan gambar dari API (mode edit)
const deletedImages = ref([]) // Menyimpan ID gambar lama yang mau dihapus
const newImages = ref([]) // Menyimpan file gambar baru dan URL preview-nya

const IMAGE_URL = import.meta.env.VITE_API_URL

const loadPotensiData = async (id) => {
    try {
        const res = await api.get(`/potensi/${id}`)
        const potensi = res.data.data

        potensiId.value = potensi.id
        form.value.title = potensi.title
        form.value.description = potensi.description

        // Simpan gambar yang sudah ada
        if (potensi.images) {
            existingImages.value = potensi.images
        }
    } catch (error) {
        alert('Gagal memuat data potensi')
        router.push({ name: 'potensidesa' })
    }
}

// Handler saat user memilih file gambar baru
const handleFilesChange = (event) => {
    const files = Array.from(event.target.files)

    files.forEach(file => {
        // Buat objek URL untuk preview dan simpan file aslinya
        newImages.value.push({
            file: file,
            preview: URL.createObjectURL(file)
        })
    })

    // Reset input agar user bisa memilih gambar yang sama jika sebelumnya batal
    if (fileInput.value) fileInput.value.value = ''
}

// Hapus gambar lama dari UI dan catat ID-nya
const removeExistingImage = (id) => {
    deletedImages.value.push(id)
    existingImages.value = existingImages.value.filter(img => img.id !== id)
}

// Hapus gambar baru yang belum di-submit
const removeNewImage = (index) => {
    URL.revokeObjectURL(newImages.value[index].preview) // Bebaskan memory browser
    newImages.value.splice(index, 1)
}

const submitForm = async () => {
    isLoading.value = true

    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('description', form.value.description)

    // Kirim ID gambar lama yang mau dihapus (dijadikan string JSON)
    if (deletedImages.value.length > 0) {
        formData.append('deletedImages', JSON.stringify(deletedImages.value))
    }

    // Kirim gambar baru yang ditambahkan (jika ada)
    if (newImages.value.length > 0) {
        newImages.value.forEach(item => {
            formData.append('images', item.file)
        })
    }

    // Validasi tambahan: Jika mode edit, minimal harus ada 1 gambar (baik lama maupun baru)
    const totalImages = existingImages.value.length + newImages.value.length
    if (totalImages === 0) {
        alert("Minimal harus ada 1 gambar untuk potensi ini!")
        isLoading.value = false
        return
    }

    try {
        if (isEditMode.value) {
            await api.put(`/potensi/${potensiId.value}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            alert('Potensi desa berhasil diperbarui!')
        } else {
            await api.post('/potensi', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            alert('Potensi desa berhasil ditambahkan!')
        }
        router.push({ name: 'potensidesa' })
    } catch (error) {
        alert(error.response?.data?.message || 'Terjadi kesalahan')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    if (route.params.id) {
        isEditMode.value = true
        loadPotensiData(route.params.id)
    }
})
</script>

<template>
    <div class="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">{{ isEditMode ? 'Edit Potensi Desa' : 'Tambah Potensi Desa' }}</h2>
            <button @click="router.push({ name: 'potensidesa' })" class="text-gray-500 hover:text-gray-700">
                Kembali
            </button>
        </div>

        <form @submit.prevent="submitForm" class="space-y-6">
            <div>
                <label class="block font-medium mb-1">Nama / Judul Potensi</label>
                <input v-model="form.title" type="text" required
                    class="w-full border rounded p-2 focus:outline-none focus:border-blue-500" />
            </div>

            <!-- Bagian Kelola Gambar -->
            <div>
                <label class="block font-medium mb-2">Foto Potensi</label>

                <!-- Tombol Pilih Gambar Baru -->
                <div class="mb-4 flex items-center gap-3">
                    <button type="button" @click="fileInput.click()"
                        class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
                        + Browse Gambar Baru
                    </button>
                    <input type="file" accept="image/*" multiple @change="handleFilesChange" ref="fileInput"
                        class="hidden" />
                    <span class="text-sm text-gray-500">*Kamu bisa memilih gambar lebih dari sekali</span>
                </div>

                <!-- Preview Grid (Gabungan Gambar Lama & Baru) -->
                <div
                    class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 border p-4 rounded-md bg-gray-50 min-h-[120px]">

                    <!-- Looping Gambar Lama -->
                    <div v-for="img in existingImages" :key="img.id" class="relative group">
                        <img :src="`${IMAGE_URL}${img.imageUrl}`"
                            class="w-full h-24 object-cover rounded-md border border-gray-300" />
                        <div class="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">Lama
                        </div>
                        <button @click.prevent="removeExistingImage(img.id)"
                            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
                            ✕
                        </button>
                    </div>

                    <!-- Looping Gambar Baru -->
                    <div v-for="(img, index) in newImages" :key="index" class="relative group">
                        <img :src="img.preview" class="w-full h-24 object-cover rounded-md border-2 border-green-400" />
                        <div class="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 rounded shadow">Baru
                        </div>
                        <button @click.prevent="removeNewImage(index)"
                            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
                            ✕
                        </button>
                    </div>

                    <div v-if="existingImages.length === 0 && newImages.length === 0"
                        class="col-span-full flex items-center justify-center text-gray-400 h-24">
                        Belum ada gambar yang dipilih
                    </div>
                </div>
            </div>

            <!-- Rich Text Editor -->
            <div class="flex flex-col">
                <label class="block font-medium mb-1">Deskripsi Detail</label>
                <div class="bg-white border rounded min-h-[300px]">
                    <QuillEditor v-model:content="form.description" contentType="html" theme="snow"
                        class="min-h-[250px]" />
                </div>
            </div>

            <div class="flex justify-end pt-4">
                <button type="submit" :disabled="isLoading"
                    class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                    {{ isLoading ? 'Menyimpan...' : (isEditMode ? 'Update Data' : 'Simpan Data') }}
                </button>
            </div>
        </form>
    </div>
</template>