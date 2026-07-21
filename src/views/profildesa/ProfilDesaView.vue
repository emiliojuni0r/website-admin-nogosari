<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const isLoading = ref(false)

const form = ref({
    sejarahDescription: '',
    visi: '',
    misi: '',
    videoProfilUrl: '',
})

// Menyimpan file fisik jika ada yang diupload
const files = ref({
    sejarahImage: null,
    baganOrganisasi: null
})

// Menyimpan preview/URL gambar saat ini
const previews = ref({
    sejarahImage: null,
    baganOrganisasi: null
})

const IMAGE_URL = import.meta.env.VITE_API_URL

const loadProfil = async () => {
    try {
        // Asumsi base url backend digabung menjadi '/profil'
        const res = await api.get('/profildesa')
        const data = res.data.data

        if (data && Object.keys(data).length > 0) {
            form.value.sejarahDescription = data.sejarahDescription || ''
            form.value.visi = data.visi || ''
            form.value.misi = data.misi || ''
            form.value.videoProfilUrl = data.videoProfilUrl || ''

            if (data.sejarahImage) previews.value.sejarahImage = `${IMAGE_URL}${data.sejarahImage}`
            if (data.baganOrganisasi) previews.value.baganOrganisasi = `${IMAGE_URL}${data.baganOrganisasi}`
        }
    } catch (error) {
        console.error('Gagal memuat profil desa')
    }
}

const handleFileChange = (event, fieldName) => {
    const file = event.target.files[0]
    if (file) {
        files.value[fieldName] = file
        previews.value[fieldName] = URL.createObjectURL(file)
    } else {
        files.value[fieldName] = null
    }
}

const submitForm = async () => {
    isLoading.value = true

    const formData = new FormData()
    formData.append('sejarahDescription', form.value.sejarahDescription)
    formData.append('visi', form.value.visi)
    formData.append('misi', form.value.misi)
    formData.append('videoProfilUrl', form.value.videoProfilUrl)

    // Pastikan nama append sesuai dengan req.files['...'] di backend
    if (files.value.sejarahImage) formData.append('sejarahImage', files.value.sejarahImage)
    if (files.value.baganOrganisasi) formData.append('baganOrganisasi', files.value.baganOrganisasi)

    try {
        await api.put('/profildesa', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        alert('Profil Desa berhasil diperbarui!')
        loadProfil()
    } catch (error) {
        alert(error.response?.data?.message || 'Terjadi kesalahan')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    loadProfil()
})
</script>

<template>
    <div class="bg-white p-6 rounded-lg shadow-md max-w-5xl mx-auto mb-10">
        <h2 class="text-2xl font-bold mb-6">Kelola Profil Desa (Sejarah, Visi Misi, Bagan)</h2>

        <form @submit.prevent="submitForm" class="space-y-8">
            <!-- SEJARAH DESA -->
            <div class="border p-4 rounded bg-gray-50 space-y-4">
                <h3 class="text-xl font-semibold border-b pb-2">1. Sejarah Desa</h3>

                <div>
                    <label class="block font-medium mb-1">Foto/Gambar Sejarah Desa</label>
                    <div v-if="previews.sejarahImage" class="mb-2">
                        <img :src="previews.sejarahImage" class="h-40 object-cover rounded border" />
                    </div>
                    <input type="file" accept="image/*" @change="e => handleFileChange(e, 'sejarahImage')"
                        class="w-full border rounded p-2 bg-white" />
                </div>

                <div class="flex flex-col">
                    <label class="block font-medium mb-1">Deskripsi Sejarah</label>
                    <div class="bg-white border rounded">
                        <QuillEditor v-model:content="form.sejarahDescription" contentType="html" theme="snow"
                            class="min-h-[200px]" />
                    </div>
                </div>
            </div>

            <!-- VISI MISI -->
            <div class="border p-4 rounded bg-gray-50 space-y-4">
                <h3 class="text-xl font-semibold border-b pb-2">2. Visi & Misi</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex flex-col">
                        <label class="block font-medium mb-1">Visi</label>
                        <div class="bg-white border rounded">
                            <QuillEditor v-model:content="form.visi" contentType="html" theme="snow"
                                class="min-h-[200px]" />
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <label class="block font-medium mb-1">Misi</label>
                        <div class="bg-white border rounded">
                            <QuillEditor v-model:content="form.misi" contentType="html" theme="snow"
                                class="min-h-[200px]" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- BAGAN & VIDEO -->
            <div class="border p-4 rounded bg-gray-50 space-y-4">
                <h3 class="text-xl font-semibold border-b pb-2">3. Media Tambahan</h3>

                <div>
                    <label class="block font-medium mb-1">URL Video Profil (Opsional)</label>
                    <input v-model="form.videoProfilUrl" type="url" placeholder="Contoh: https://youtube.com/..."
                        class="w-full border rounded p-2 focus:border-blue-500" />
                </div>

                <div>
                    <label class="block font-medium mb-1">Gambar Bagan Organisasi Keseluruhan</label>
                    <div v-if="previews.baganOrganisasi" class="mb-2">
                        <img :src="previews.baganOrganisasi" class="h-40 object-cover rounded border bg-white" />
                    </div>
                    <input type="file" accept="image/*" @change="e => handleFileChange(e, 'baganOrganisasi')"
                        class="w-full border rounded p-2 bg-white" />
                </div>
            </div>

            <div class="flex justify-end pt-4">
                <button type="submit" :disabled="isLoading"
                    class="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-bold transition">
                    {{ isLoading ? 'Menyimpan...' : 'Simpan Seluruh Profil' }}
                </button>
            </div>
        </form>
    </div>
</template>