<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/api'

const route = useRoute()
const router = useRouter()

const isEditMode = ref(false)
const petaId = ref(null)
const isLoading = ref(false)

// Kumpulan Tipe Peta Sesuai Schema Database
const mapTypes = [
    { value: 'ADMIN', label: 'Peta Administrasi' },
    { value: 'DUSUN', label: 'Peta Dusun / Wilayah' },
    { value: 'PENGGUNA_LAHAN', label: 'Peta Penggunaan Lahan' },
    { value: 'PHBS', label: 'Peta PHBS (Perilaku Hidup Bersih)' },
    { value: 'LERENG', label: 'Peta Kemiringan Lereng' },
    { value: 'KESESUAIAN_LAHAN', label: 'Peta Kesesuaian Lahan' }
]

const form = ref({
    type: '',
    title: '',
    image: null
})

const existingImage = ref(null)
const imagePreview = ref(null)

const IMAGE_URL = import.meta.env.VITE_API_URL

const getImageUrl = (path) => {
    if (!path) return '/default-image.png'

    if (path.startsWith('http')) {
        return path
    }

    return `${IMAGE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

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

const loadPetaData = async (id) => {
    try {
        const res = await api.get('/pemetaan/peta')
        const petaList = res.data.data
        const peta = petaList.find(p => p.id === parseInt(id))

        if (peta) {
            petaId.value = peta.id
            form.value.type = peta.type
            form.value.title = peta.title
            existingImage.value = `${getImageUrl(peta.image)}`
        } else {
            alert('Data peta tidak ditemukan')
            router.push({ name: 'pemetaan' })
        }
    } catch (error) {
        alert('Gagal memuat data')
    }
}

const submitForm = async () => {
    isLoading.value = true

    const formData = new FormData()
    formData.append('type', form.value.type)
    formData.append('title', form.value.title)

    if (form.value.image) {
        formData.append('image', form.value.image) // 'image' disesuaikan dgn nama field di backend
    }

    try {
        if (isEditMode.value) {
            await api.put(`/pemetaan/peta/${petaId.value}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            alert('Peta berhasil diperbarui!')
        } else {
            await api.post('/pemetaan/peta', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            alert('Peta berhasil ditambahkan!')
        }
        router.push({ name: 'pemetaan' })
    } catch (error) {
        // Backend sudah memiliki pengecekan P2002 dan mengirim respon 400 khusus
        alert(error.response?.data?.message || 'Terjadi kesalahan')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    if (route.params.id) {
        isEditMode.value = true
        loadPetaData(route.params.id)
    }
})
</script>

<template>
    <div class="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">{{ isEditMode ? 'Edit Peta' : 'Tambah Peta Desa' }}</h2>
            <button @click="router.push({ name: 'pemetaan' })" class="text-gray-500 hover:text-gray-700">
                Kembali
            </button>
        </div>

        <form @submit.prevent="submitForm" class="space-y-6">

            <div>
                <label class="block font-medium mb-1">Tipe Peta</label>
                <select v-model="form.type" required class="w-full border rounded p-2 focus:border-blue-500 bg-white">
                    <option value="" disabled>-- Pilih Tipe Peta --</option>
                    <option v-for="type in mapTypes" :key="type.value" :value="type.value">
                        {{ type.label }} ({{ type.value }})
                    </option>
                </select>
                <p class="text-xs text-gray-500 mt-1">
                    *Masing-masing tipe peta hanya boleh ada 1 (satu) gambar. Jika ingin mengubah peta yang sudah ada,
                    gunakan fitur Edit pada tabel.
                </p>
            </div>

            <div>
                <label class="block font-medium mb-1">Judul / Keterangan Peta</label>
                <input v-model="form.title" type="text" required class="w-full border rounded p-2 focus:border-blue-500"
                    placeholder="Contoh: Peta Administrasi Desa Tahun 2024" />
            </div>

            <div>
                <label class="block font-medium mb-2">Unggah Gambar Peta</label>

                <div v-if="imagePreview || existingImage" class="mb-3">
                    <img :src="imagePreview || existingImage"
                        class="w-full h-auto max-h-64 object-contain rounded-md border bg-gray-100" />
                </div>

                <input type="file" accept="image/*" @change="handleFileChange" :required="!isEditMode"
                    class="w-full border rounded p-2 bg-gray-50" />
                <p v-if="isEditMode" class="text-sm text-red-500 mt-1">
                    *Biarkan kosong jika tidak ingin mengganti gambar peta.
                </p>
            </div>

            <div class="flex justify-end pt-4">
                <button type="submit" :disabled="isLoading"
                    class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                    {{ isLoading ? 'Menyimpan...' : (isEditMode ? 'Update Peta' : 'Simpan Peta') }}
                </button>
            </div>
        </form>
    </div>
</template>