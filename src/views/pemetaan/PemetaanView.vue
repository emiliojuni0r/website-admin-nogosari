<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'

const router = useRouter()

// --- STATE BATAS WILAYAH ---
const isSavingBatas = ref(false)
const batasForm = ref({
    utara: '',
    timur: '',
    selatan: '',
    barat: ''
})

// --- STATE PETA DESA ---
const petas = ref([])
const isLoadingPeta = ref(false)

const IMAGE_URL = import.meta.env.VITE_API_URL

const getImageUrl = (path) => {
    if (!path) return '/default-image.png'

    if (path.startsWith('http')) {
        return path
    }

    return `${IMAGE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

// --- FUNGSI BATAS WILAYAH ---
const fetchBatasWilayah = async () => {
    try {
        const res = await api.get('/pemetaan/batas') // Sesuaikan prefix rute backend kamu
        if (res.data.data) {
            batasForm.value = res.data.data
        }
    } catch (error) {
        console.error("Gagal mengambil data batas wilayah")
    }
}

const submitBatasWilayah = async () => {
    isSavingBatas.value = true
    try {
        // Mengirim JSON biasa karena tidak ada file gambar
        await api.put('/pemetaan/batas', batasForm.value)
        alert('Batas wilayah berhasil diperbarui!')
    } catch (error) {
        alert(error.response?.data?.message || 'Gagal menyimpan batas wilayah')
    } finally {
        isSavingBatas.value = false
    }
}

// --- FUNGSI PETA DESA ---
const fetchPeta = async () => {
    isLoadingPeta.value = true
    try {
        const res = await api.get('/pemetaan/peta')
        petas.value = res.data.data
    } catch (error) {
        console.error("Gagal mengambil data peta")
    } finally {
        isLoadingPeta.value = false
    }
}

const deletePeta = async (id) => {
    if (confirm('Yakin ingin menghapus peta ini?')) {
        try {
            await api.delete(`/pemetaan/peta/${id}`)
            fetchPeta() // Refresh data peta
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal menghapus peta')
        }
    }
}

onMounted(() => {
    fetchBatasWilayah()
    fetchPeta()
})
</script>

<template>
    <div class="space-y-8">

        <!-- BAGIAN 1: BATAS WILAYAH -->
        <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-600">
            <h2 class="text-2xl font-bold mb-4">Kelola Batas Wilayah</h2>

            <form @submit.prevent="submitBatasWilayah" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block font-medium mb-1 text-gray-700">Sebelah Utara</label>
                    <input v-model="batasForm.utara" type="text"
                        class="w-full border rounded p-2 focus:border-green-500 focus:outline-none"
                        placeholder="Contoh: Desa A / Hutan Lindung" />
                </div>
                <div>
                    <label class="block font-medium mb-1 text-gray-700">Sebelah Timur</label>
                    <input v-model="batasForm.timur" type="text"
                        class="w-full border rounded p-2 focus:border-green-500 focus:outline-none"
                        placeholder="Contoh: Sungai B / Kecamatan C" />
                </div>
                <div>
                    <label class="block font-medium mb-1 text-gray-700">Sebelah Selatan</label>
                    <input v-model="batasForm.selatan" type="text"
                        class="w-full border rounded p-2 focus:border-green-500 focus:outline-none"
                        placeholder="Contoh: Desa D" />
                </div>
                <div>
                    <label class="block font-medium mb-1 text-gray-700">Sebelah Barat</label>
                    <input v-model="batasForm.barat" type="text"
                        class="w-full border rounded p-2 focus:border-green-500 focus:outline-none"
                        placeholder="Contoh: Jalan Raya / Laut" />
                </div>

                <div class="md:col-span-2 flex justify-end mt-2">
                    <button type="submit" :disabled="isSavingBatas"
                        class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400">
                        {{ isSavingBatas ? 'Menyimpan...' : 'Simpan Batas Wilayah' }}
                    </button>
                </div>
            </form>
        </div>

        <!-- BAGIAN 2: DAFTAR PETA DESA -->
        <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold">Daftar Peta Desa</h2>
                <button @click="router.push({ name: 'form-peta' })"
                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    + Tambah Peta
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-100 border-b">
                            <th class="p-3 w-32">Gambar Peta</th>
                            <th class="p-3">Tipe Peta</th>
                            <th class="p-3">Judul / Keterangan</th>
                            <th class="p-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="isLoadingPeta">
                            <td colspan="4" class="text-center p-4">Memuat data...</td>
                        </tr>
                        <tr v-else-if="petas.length === 0">
                            <td colspan="4" class="text-center p-4 text-gray-500">Belum ada data peta.</td>
                        </tr>
                        <tr v-for="item in petas" :key="item.id" class="border-b hover:bg-gray-50">
                            <td class="p-3">
                                <img :src="`${getImageUrl(item.image)}`"
                                    class="w-24 h-16 object-cover rounded shadow border" />
                            </td>
                            <td class="p-3">
                                <span class="bg-blue-100 text-blue-800 font-semibold px-2 py-1 rounded text-sm">
                                    {{ item.type }}
                                </span>
                            </td>
                            <td class="p-3 font-medium">{{ item.title }}</td>
                            <td class="p-3 flex justify-center gap-2 mt-3">
                                <button @click="router.push({ name: 'form-peta', params: { id: item.id } })"
                                    class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm">
                                    Edit
                                </button>
                                <button @click="deletePeta(item.id)"
                                    class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">
                                    Hapus
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</template>