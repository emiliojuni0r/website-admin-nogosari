<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/utils/api'

// --- STATE DATA ---
const galeriList = ref([])
const kategoriList = ref([])
const pagination = ref({ currentPage: 1, totalPage: 1 })
const selectedKategoriId = ref('') // Filter

const isLoading = ref(false)

// --- STATE MODAL UPLOAD GAMBAR ---
const showUploadModal = ref(false)
const isSubmittingUpload = ref(false)
const formUpload = ref({ title: '', kategoriId: '', image: null })
const imagePreview = ref(null)
const fileInputRef = ref(null)

// --- STATE MODAL KATEGORI ---
const showKategoriModal = ref(false)
const newKategoriName = ref('')
const isSubmittingKategori = ref(false)

// ==========================================
// FUNGSI GALERI GAMBAR
// ==========================================
const fetchGaleri = async (page = 1) => {
    isLoading.value = true
    try {
        let url = `/galeri?page=${page}&limit=9`
        if (selectedKategoriId.value) url += `&kategoriId=${selectedKategoriId.value}`

        const response = await api.get(url)
        galeriList.value = response.data.data
        pagination.value = response.data.pagination
    } catch (error) {
        console.error("Gagal mengambil galeri")
    } finally {
        isLoading.value = false
    }
}

// Trigger saat dropdown filter berubah
watch(selectedKategoriId, () => {
    fetchGaleri(1)
})

const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
        formUpload.value.image = file
        imagePreview.value = URL.createObjectURL(file)
    } else {
        formUpload.value.image = null
        imagePreview.value = null
    }
}

const submitUpload = async () => {
    if (!formUpload.value.image) {
        alert("Pilih gambar terlebih dahulu!")
        return
    }

    isSubmittingUpload.value = true
    const formData = new FormData()
    formData.append('title', formUpload.value.title)
    formData.append('kategoriId', formUpload.value.kategoriId)
    formData.append('image', formUpload.value.image)

    try {
        await api.post('/galeri', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        alert("Gambar berhasil ditambahkan ke Galeri!")
        showUploadModal.value = false
        // Reset form
        formUpload.value = { title: '', kategoriId: '', image: null }
        imagePreview.value = null
        if (fileInputRef.value) fileInputRef.value.value = ''

        fetchGaleri(1) // Refresh galeri
    } catch (error) {
        alert(error.response?.data?.message || 'Gagal mengupload gambar')
    } finally {
        isSubmittingUpload.value = false
    }
}

const deleteGaleri = async (id) => {
    if (confirm('Yakin ingin menghapus gambar ini?')) {
        try {
            await api.delete(`/galeri/${id}`)
            fetchGaleri(pagination.value.currentPage)
        } catch (error) {
            alert('Gagal menghapus gambar')
        }
    }
}

// ==========================================
// FUNGSI KATEGORI GALERI
// ==========================================
const fetchKategori = async () => {
    try {
        const response = await api.get('/galeri/kategori')
        kategoriList.value = response.data.data
    } catch (error) {
        console.error("Gagal mengambil kategori galeri")
    }
}

const submitKategori = async () => {
    if (!newKategoriName.value.trim()) return
    isSubmittingKategori.value = true
    try {
        await api.post('/galeri/kategori', { name: newKategoriName.value })
        newKategoriName.value = ''
        fetchKategori() // Refresh dropdown & list modal
    } catch (error) {
        alert('Gagal menambahkan kategori')
    } finally {
        isSubmittingKategori.value = false
    }
}

const deleteKategori = async (id) => {
    if (confirm('PERINGATAN: Menghapus kategori ini juga akan menghapus SEMUA GAMBAR di dalamnya. Lanjutkan?')) {
        try {
            await api.delete(`/galeri/kategori/${id}`)
            fetchKategori()
            fetchGaleri(1) // Refresh galeri utama karena gambarnya hilang
        } catch (error) {
            alert('Gagal menghapus kategori')
        }
    }
}

const apiUrl = import.meta.env.VITE_API_URL;

onMounted(() => {
    fetchKategori()
    fetchGaleri()
})
</script>

<template>
    <div class="space-y-6">

        <!-- HEADER & TOOLBAR -->
        <div class="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h2 class="text-2xl font-bold">Galeri Desa</h2>
                <p class="text-sm text-gray-500">Kelola dokumentasi foto kegiatan dan fasilitas desa.</p>
            </div>

            <div class="flex gap-3 w-full md:w-auto">
                <!-- Dropdown Filter -->
                <select v-model="selectedKategoriId"
                    class="border rounded-md px-3 py-2 bg-gray-50 focus:outline-blue-500 flex-1 md:w-48">
                    <option value="">Semua Kategori</option>
                    <option v-for="cat in kategoriList" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>

                <!-- Tombol Atur Kategori -->
                <button @click="showKategoriModal = true"
                    class="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 font-medium">
                    Atur Kategori
                </button>

                <!-- Tombol Upload -->
                <button @click="showUploadModal = true"
                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium shadow-sm">
                    + Upload Foto
                </button>
            </div>
        </div>

        <!-- GRID GALERI -->
        <div v-if="isLoading" class="text-center py-12 text-gray-500 font-medium animate-pulse">
            Memuat galeri foto...
        </div>

        <div v-else-if="galeriList.length === 0" class="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
            Tidak ada gambar yang ditemukan.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div v-for="item in galeriList" :key="item.id" class="bg-white rounded-lg shadow-md overflow-hidden group">
                <div class="relative h-48 bg-gray-200">
                    <img :src="`${apiUrl}${item.image}`" class="w-full h-full object-cover" />
                    <!-- Tombol Hapus Muncul Saat di Hover -->
                    <div
                        class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-300">
                        <button @click="deleteGaleri(item.id)"
                            class="bg-red-600 text-white px-4 py-2 rounded font-medium shadow-lg hover:bg-red-700 transform hover:scale-105 transition">
                            Hapus Foto
                        </button>
                    </div>
                </div>
                <div class="p-4">
                    <p class="font-bold text-gray-800 truncate">{{ item.title || 'Tanpa Judul' }}</p>
                    <p class="text-xs text-blue-600 font-semibold mt-1">{{ item.kategori?.name }}</p>
                </div>
            </div>
        </div>

        <!-- PAGINATION -->
        <div v-if="pagination.totalPage > 1" class="flex justify-center gap-2 mt-6">
            <button @click="fetchGaleri(pagination.currentPage - 1)" :disabled="pagination.currentPage === 1"
                class="px-4 py-2 rounded border bg-white hover:bg-gray-100 disabled:opacity-50">
                Sebelumnya
            </button>
            <span class="px-4 py-2 font-medium">Halaman {{ pagination.currentPage }} dari {{ pagination.totalPage
            }}</span>
            <button @click="fetchGaleri(pagination.currentPage + 1)"
                :disabled="pagination.currentPage === pagination.totalPage"
                class="px-4 py-2 rounded border bg-white hover:bg-gray-100 disabled:opacity-50">
                Selanjutnya
            </button>
        </div>


        <!-- ============================================== -->
        <!-- MODAL UPLOAD FOTO -->
        <!-- ============================================== -->
        <div v-if="showUploadModal"
            class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
                <div class="flex justify-between items-center mb-5 border-b pb-3">
                    <h3 class="text-lg font-bold text-gray-800">Upload Foto Galeri</h3>
                    <button @click="showUploadModal = false"
                        class="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                </div>

                <form @submit.prevent="submitUpload" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Judul / Keterangan</label>
                        <input v-model="formUpload.title" type="text"
                            class="w-full border rounded-md p-2 focus:border-blue-500"
                            placeholder="Keterangan singkat foto..." />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                        <select v-model="formUpload.kategoriId" required
                            class="w-full border rounded-md p-2 focus:border-blue-500">
                            <option value="" disabled>Pilih Kategori</option>
                            <option v-for="cat in kategoriList" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">File Gambar</label>
                        <div v-if="imagePreview" class="mb-2">
                            <img :src="imagePreview" class="h-32 w-full object-cover rounded border" />
                        </div>
                        <input type="file" ref="fileInputRef" accept="image/*" @change="handleFileChange" required
                            class="w-full border rounded p-2 text-sm bg-gray-50" />
                    </div>

                    <div class="flex justify-end gap-3 pt-4 border-t mt-6">
                        <button type="button" @click="showUploadModal = false"
                            class="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200">Batal</button>
                        <button type="submit" :disabled="isSubmittingUpload"
                            class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                            {{ isSubmittingUpload ? 'Mengupload...' : 'Upload' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- ============================================== -->
        <!-- MODAL KELOLA KATEGORI GALERI -->
        <!-- ============================================== -->
        <div v-if="showKategoriModal"
            class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
                <div class="flex justify-between items-center mb-5 border-b pb-3">
                    <h3 class="text-lg font-bold text-gray-800">Kelola Kategori Galeri</h3>
                    <button @click="showKategoriModal = false"
                        class="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                </div>

                <!-- Form Tambah Kategori -->
                <form @submit.prevent="submitKategori" class="flex gap-2 mb-6">
                    <input v-model="newKategoriName" type="text" required placeholder="Nama Kategori Baru..."
                        class="flex-1 border rounded-md p-2 focus:border-blue-500 outline-none" />
                    <button type="submit" :disabled="isSubmittingKategori"
                        class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400">
                        Tambah
                    </button>
                </form>

                <!-- List Kategori -->
                <div class="max-h-60 overflow-y-auto border rounded-md">
                    <table class="w-full text-left">
                        <tbody>
                            <tr v-if="kategoriList.length === 0">
                                <td class="p-4 text-center text-gray-500">Belum ada kategori.</td>
                            </tr>
                            <tr v-for="cat in kategoriList" :key="cat.id" class="border-b hover:bg-gray-50">
                                <td class="p-3 font-medium">{{ cat.name }}</td>
                                <td class="p-3 text-right">
                                    <button @click="deleteKategori(cat.id)"
                                        class="text-red-500 hover:text-red-700 font-bold text-sm">Hapus</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    </div>
</template>