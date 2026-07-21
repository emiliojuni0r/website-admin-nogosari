<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/api'

const route = useRoute()
const router = useRouter()

const isEditMode = ref(false)
const perangkatId = ref(null)
const isLoading = ref(false)

const form = ref({
    name: '',
    position: '',
    order: 1, // Default urutan
    photo: null
})

const existingPhoto = ref(null)
const photoPreview = ref(null)

const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
        form.value.photo = file
        photoPreview.value = URL.createObjectURL(file)
    } else {
        form.value.photo = null
        photoPreview.value = null
    }
}

const IMAGE_URL = import.meta.env.VITE_API_URL

const getImageUrl = (path) => {
    if (!path) return '/default-image.png'

    if (path.startsWith('http')) {
        return path
    }

    return `${IMAGE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

const loadPerangkatData = async (id) => {
    try {
        const res = await api.get('/profildesa/perangkat')
        const data = res.data.data
        const perangkat = data.find(p => p.id === parseInt(id))

        if (perangkat) {
            perangkatId.value = perangkat.id
            form.value.name = perangkat.name
            form.value.position = perangkat.position
            form.value.order = perangkat.order
            existingPhoto.value = `${getImageUrl(perangkat.photo)}`
        } else {
            alert('Data tidak ditemukan')
            router.push({ name: 'kelola-perangkat' })
        }
    } catch (error) {
        alert('Gagal memuat data')
    }
}

const submitForm = async () => {
    isLoading.value = true

    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('position', form.value.position)
    formData.append('order', form.value.order)

    if (form.value.photo) {
        formData.append('photo', form.value.photo)
    }

    try {
        if (isEditMode.value) {
            await api.put(`/profildesa/perangkat/${perangkatId.value}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            alert('Data anggota berhasil diperbarui!')
        } else {
            await api.post('/profildesa/perangkat', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            alert('Data anggota berhasil ditambahkan!')
        }
        router.push({ name: 'perangkatdesa' })
    } catch (error) {
        alert(error.response?.data?.message || 'Terjadi kesalahan')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    if (route.params.id) {
        isEditMode.value = true
        loadPerangkatData(route.params.id)
    }
})
</script>

<template>
    <div class="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">{{ isEditMode ? 'Edit Anggota Perangkat' : 'Tambah Anggota Perangkat' }}</h2>
            <button @click="router.push({ name: 'perangkatdesa' })" class="text-gray-500 hover:text-gray-700">
                Kembali
            </button>
        </div>

        <form @submit.prevent="submitForm" class="space-y-5">
            <div>
                <label class="block font-medium mb-1">Nama Lengkap (Beserta Gelar)</label>
                <input v-model="form.name" type="text" required class="w-full border rounded p-2 focus:border-blue-500"
                    placeholder="Contoh: Budi Santoso, S.E." />
            </div>

            <div>
                <label class="block font-medium mb-1">Jabatan</label>
                <input v-model="form.position" type="text" required
                    class="w-full border rounded p-2 focus:border-blue-500" placeholder="Contoh: Kepala Desa" />
            </div>

            <div>
                <label class="block font-medium mb-1">Nomor Urut Tampil (Hierarki)</label>
                <input v-model="form.order" type="number" required
                    class="w-full border rounded p-2 focus:border-blue-500"
                    placeholder="1 untuk Kades, 2 untuk Sekdes, dst." />
                <p class="text-xs text-gray-500 mt-1">Angka yang lebih kecil akan tampil lebih dulu (di atas).</p>
            </div>

            <div>
                <label class="block font-medium mb-2">Pas Foto Resmi</label>

                <div v-if="photoPreview || existingPhoto" class="mb-3">
                    <img :src="photoPreview || existingPhoto" class="w-32 h-40 object-cover rounded-md border" />
                </div>

                <input type="file" accept="image/*" @change="handleFileChange" :required="!isEditMode"
                    class="w-full border rounded p-2 bg-gray-50" />
                <p v-if="isEditMode" class="text-sm text-red-500 mt-1">
                    *Biarkan kosong jika tidak ingin mengganti foto.
                </p>
            </div>

            <div class="flex justify-end pt-4">
                <button type="submit" :disabled="isLoading"
                    class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                    {{ isLoading ? 'Menyimpan...' : (isEditMode ? 'Update Anggota' : 'Simpan Anggota') }}
                </button>
            </div>
        </form>
    </div>
</template>