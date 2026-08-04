<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const regulasiList = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)

// Pilihan input: 'FILE' atau 'LINK'
const inputType = ref('FILE')

const form = ref({
    title: '',
    linkUrl: '',
    file: null
})

const fileInputRef = ref(null)

// --- FORMAT TANGGAL ---
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric', month: 'long', day: 'numeric'
    })
}

// --- FUNGSI AMBIL DATA ---
const fetchRegulasi = async () => {
    isLoading.value = true
    try {
        const response = await api.get('/regulasi')
        regulasiList.value = response.data.data
    } catch (error) {
        console.error("Gagal mengambil data regulasi")
    } finally {
        isLoading.value = false
    }
}

// --- FUNGSI HANDLE FILE ---
const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
        form.value.file = file
    } else {
        form.value.file = null
    }
}

// --- FUNGSI SUBMIT ---
const submitForm = async () => {
    if (inputType.value === 'FILE' && !form.value.file) {
        alert("Silakan pilih file dokumen terlebih dahulu!")
        return
    }
    if (inputType.value === 'LINK' && !form.value.linkUrl) {
        alert("Silakan isi link tautan terlebih dahulu!")
        return
    }

    isSubmitting.value = true
    const formData = new FormData()
    formData.append('title', form.value.title)

    if (inputType.value === 'FILE') {
        formData.append('file', form.value.file)
    } else {
        formData.append('linkUrl', form.value.linkUrl)
    }

    try {
        await api.post('/regulasi', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        alert('Regulasi berhasil ditambahkan!')
        resetForm()
        fetchRegulasi()
    } catch (error) {
        alert(error.response?.data?.message || 'Terjadi kesalahan')
    } finally {
        isSubmitting.value = false
    }
}

// --- FUNGSI BATAL ---
const resetForm = () => {
    form.value.title = ''
    form.value.linkUrl = ''
    form.value.file = null
    if (fileInputRef.value) fileInputRef.value.value = ''
}

// --- FUNGSI HAPUS ---
const deleteRegulasi = async (id) => {
    if (confirm('Yakin ingin menghapus regulasi ini? File dokumen juga akan terhapus permanen.')) {
        try {
            await api.delete(`/regulasi/${id}`)
            fetchRegulasi()
        } catch (error) {
            alert('Gagal menghapus regulasi')
        }
    }
}

const apiUrl = import.meta.env.VITE_API_URL;

onMounted(() => {
    fetchRegulasi()
})
</script>

<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold">Kelola Dokumen Regulasi</h2>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- FORM TAMBAH -->
            <div class="lg:col-span-1">
                <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600">
                    <h3 class="text-lg font-bold mb-4">Tambah Regulasi Baru</h3>

                    <form @submit.prevent="submitForm" class="space-y-4">
                        <div>
                            <label class="block font-medium mb-1 text-gray-700">Judul Regulasi</label>
                            <input v-model="form.title" type="text" required
                                placeholder="Contoh: Perdes No. 1 Tahun 2024"
                                class="w-full border rounded p-2 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white" />
                        </div>

                        <!-- Pilihan Tipe Lampiran -->
                        <div>
                            <label class="block font-medium mb-2 text-gray-700">Tipe Lampiran</label>
                            <div class="flex gap-4">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" v-model="inputType" value="FILE"
                                        class="w-4 h-4 text-blue-600" />
                                    <span>Upload File</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" v-model="inputType" value="LINK"
                                        class="w-4 h-4 text-blue-600" />
                                    <span>Gunakan Link URL</span>
                                </label>
                            </div>
                        </div>

                        <!-- Input File (Muncul jika pilih FILE) -->
                        <div v-if="inputType === 'FILE'">
                            <label class="block font-medium mb-1 text-gray-700">File Dokumen (PDF/Word/Excel)</label>
                            <input type="file" ref="fileInputRef" accept=".pdf,.doc,.docx,.xls,.xlsx"
                                @change="handleFileChange" :required="inputType === 'FILE'"
                                class="w-full border rounded p-2 bg-gray-50" />
                        </div>

                        <!-- Input Link (Muncul jika pilih LINK) -->
                        <div v-if="inputType === 'LINK'">
                            <label class="block font-medium mb-1 text-gray-700">Link URL Eksternal</label>
                            <input v-model="form.linkUrl" type="url" placeholder="https://..."
                                :required="inputType === 'LINK'"
                                class="w-full border rounded p-2 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white" />
                        </div>

                        <div class="pt-2">
                            <button type="submit" :disabled="isSubmitting"
                                class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition">
                                {{ isSubmitting ? 'Mengunggah...' : 'Simpan Regulasi' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- TABEL DAFTAR -->
            <div class="lg:col-span-2">
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-lg font-bold mb-4">Daftar Dokumen Regulasi</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-gray-100 border-b">
                                    <th class="p-3 w-12">No</th>
                                    <th class="p-3">Judul Regulasi</th>
                                    <th class="p-3 text-center">Tipe</th>
                                    <th class="p-3">Tanggal</th>
                                    <th class="p-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="isLoading">
                                    <td colspan="5" class="text-center p-4">Memuat data...</td>
                                </tr>
                                <tr v-else-if="regulasiList.length === 0">
                                    <td colspan="5" class="text-center p-4 text-gray-500">Belum ada dokumen regulasi.
                                    </td>
                                </tr>
                                <tr v-for="(item, index) in regulasiList" :key="item.id"
                                    class="border-b hover:bg-gray-50">
                                    <td class="p-3 text-center text-gray-500">{{ index + 1 }}</td>
                                    <td class="p-3 font-medium text-gray-800">{{ item.title }}</td>
                                    <td class="p-3 text-center">
                                        <span v-if="item.fileUrl"
                                            class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">FILE</span>
                                        <span v-else
                                            class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">LINK</span>
                                    </td>
                                    <td class="p-3 text-sm text-gray-600">{{ formatDate(item.createdAt) }}</td>
                                    <td class="p-3 flex justify-center gap-2">
                                        <!-- Tombol Lihat/Download -->
                                        <a :href="item.fileUrl ? `${apiUrl}${item.fileUrl}` : item.linkUrl"
                                            target="_blank"
                                            class="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-sm shadow-sm transition">
                                            Buka
                                        </a>
                                        <button @click="deleteRegulasi(item.id)"
                                            class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm shadow-sm transition">
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>