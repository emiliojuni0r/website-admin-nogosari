<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const isLoading = ref(false)

// State untuk menyimpan teks form
const form = ref({
    narasiApbdes: '',
    narasiRealisasi: ''
})

// State untuk menyimpan file fisik gambar yang diunggah
const files = ref({
    fotoApbdes: null,
    fotoRealisasi: null
})

// State untuk URL preview gambar
const previews = ref({
    fotoApbdes: null,
    fotoRealisasi: null
})

const lastUpdated = ref(null)


const IMAGE_URL = import.meta.env.VITE_API_URL

const getImageUrl = (path) => {
    if (!path) return '/default-image.png'

    if (path.startsWith('http')) {
        return path
    }

    return `${IMAGE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

// --- FUNGSI AMBIL DATA ---
const loadApbdes = async () => {
    try {
        const res = await api.get('/apbdes')
        const data = res.data.data

        if (data && Object.keys(data).length > 0) {
            form.value.narasiApbdes = data.narasiApbdes || ''
            form.value.narasiRealisasi = data.narasiRealisasi || ''

            lastUpdated.value = data.updatedAt || ''


            if (data.fotoApbdes) previews.value.fotoApbdes = `${getImageUrl(data.fotoApbdes)}`
            if (data.fotoRealisasi) previews.value.fotoRealisasi = `${getImageUrl(data.fotoRealisasi)}`
        }
    } catch (error) {
        console.error('Gagal memuat data APBDes')
    }
}

const formatDate = (date) => {
    if (!date) return '-'

    return new Date(date).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
    })
}

// --- FUNGSI HANDLE GAMBAR ---
const handleFileChange = (event, fieldName) => {
    const file = event.target.files[0]
    if (file) {
        files.value[fieldName] = file
        previews.value[fieldName] = URL.createObjectURL(file) // Tampilkan preview lokal
    } else {
        files.value[fieldName] = null
    }
}

// --- FUNGSI SUBMIT (UPSERT) ---
const submitForm = async () => {
    isLoading.value = true

    const formData = new FormData()
    formData.append('narasiApbdes', form.value.narasiApbdes)
    formData.append('narasiRealisasi', form.value.narasiRealisasi)

    // Nama key di append ('fotoApbdes' & 'fotoRealisasi') harus sesuai dengan yang ditangkap backend
    if (files.value.fotoApbdes) formData.append('fotoApbdes', files.value.fotoApbdes)
    if (files.value.fotoRealisasi) formData.append('fotoRealisasi', files.value.fotoRealisasi)

    try {
        await api.put('/apbdes', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        alert('Data Laporan Keuangan (APBDes) berhasil diperbarui!')
        loadApbdes() // Refresh data dari server
    } catch (error) {
        alert(error.response?.data?.message || 'Terjadi kesalahan')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    loadApbdes()
})
</script>

<template>
    <div class="bg-white p-6 rounded-lg shadow-md max-w-5xl mx-auto mb-10">
        <div class="mb-6 border-b pb-4">
            <h2 class="text-2xl font-bold text-gray-800">Kelola Laporan Keuangan (APBDes)</h2>
            <p class="text-gray-500 mt-1">Publikasikan infografis dan narasi transparansi anggaran desa Anda di sini.
            </p>
            <p v-if="lastUpdated" class="text-sm text-gray-500 mt-2">
                Terakhir diperbarui:
                <span class="font-medium">{{ formatDate(lastUpdated) }}</span>
            </p>
        </div>



        <form @submit.prevent="submitForm" class="space-y-8">

            <!-- BAGIAN 1: RENCANA APBDES -->
            <div class="border border-blue-200 p-5 rounded-lg bg-blue-50/30 space-y-4">
                <h3 class="text-xl font-bold text-blue-800 flex items-center gap-2">
                    <span>📊</span> Bagian 1: Rencana APBDes (Anggaran)
                </h3>

                <div>
                    <label class="block font-medium mb-1 text-gray-700">Gambar / Infografis APBDes</label>
                    <div v-if="previews.fotoApbdes" class="mb-3">
                        <img :src="previews.fotoApbdes"
                            class="h-64 w-full object-contain bg-white rounded border shadow-sm" alt="Preview APBDes" />
                    </div>
                    <input type="file" accept="image/*" @change="e => handleFileChange(e, 'fotoApbdes')"
                        class="w-full border rounded p-2 bg-white" />
                    <p class="text-xs text-gray-500 mt-1">*Abaikan jika tidak ingin mengganti gambar saat ini.</p>
                </div>

                <div class="flex flex-col">
                    <label class="block font-medium mb-1 text-gray-700">Narasi Penjelasan APBDes</label>
                    <div class="bg-white border rounded">
                        <QuillEditor v-model:content="form.narasiApbdes" contentType="html" theme="snow"
                            class="min-h-[250px]"
                            placeholder="Tulis rincian atau penjelasan anggaran desa di sini..." />
                    </div>
                </div>
            </div>

            <!-- BAGIAN 2: REALISASI APBDES -->
            <div class="border border-green-200 p-5 rounded-lg bg-green-50/30 space-y-4">
                <h3 class="text-xl font-bold text-green-800 flex items-center gap-2">
                    <span>✅</span> Bagian 2: Realisasi APBDes (Pengeluaran)
                </h3>

                <div>
                    <label class="block font-medium mb-1 text-gray-700">Gambar / Infografis Realisasi</label>
                    <div v-if="previews.fotoRealisasi" class="mb-3">
                        <img :src="previews.fotoRealisasi"
                            class="h-64 w-full object-contain bg-white rounded border shadow-sm"
                            alt="Preview Realisasi" />
                    </div>
                    <input type="file" accept="image/*" @change="e => handleFileChange(e, 'fotoRealisasi')"
                        class="w-full border rounded p-2 bg-white" />
                    <p class="text-xs text-gray-500 mt-1">*Abaikan jika tidak ingin mengganti gambar saat ini.</p>
                </div>

                <div class="flex flex-col">
                    <label class="block font-medium mb-1 text-gray-700">Narasi Penjelasan Realisasi</label>
                    <div class="bg-white border rounded">
                        <QuillEditor v-model:content="form.narasiRealisasi" contentType="html" theme="snow"
                            class="min-h-[250px]"
                            placeholder="Tulis laporan pertanggungjawaban atau capaian realisasi di sini..." />
                    </div>
                </div>
            </div>

            <!-- TOMBOL SIMPAN KESELURUHAN -->
            <div class="flex justify-end pt-4 border-t">
                <button type="submit" :disabled="isLoading"
                    class="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-bold transition shadow">
                    {{ isLoading ? 'Menyimpan...' : 'Simpan Laporan APBDes' }}
                </button>
            </div>

        </form>
    </div>
</template>