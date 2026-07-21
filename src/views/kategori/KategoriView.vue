<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const categories = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)

// State untuk Form
const isEditMode = ref(false)
const form = ref({
    id: null,
    name: ''
})

// --- FUNGSI AMBIL DATA ---
const fetchCategories = async () => {
    isLoading.value = true
    try {
        // Sesuaikan endpoint ini jika di express route kamu namanya berbeda
        const response = await api.get('/categoryartikel')
        categories.value = response.data.data
    } catch (error) {
        console.error("Gagal mengambil data kategori")
    } finally {
        isLoading.value = false
    }
}

// --- FUNGSI SUBMIT (CREATE / UPDATE) ---
const submitForm = async () => {
    if (!form.value.name.trim()) return

    isSubmitting.value = true
    try {
        if (isEditMode.value) {
            // Update
            await api.put(`/categoryartikel/${form.value.id}`, { name: form.value.name })
            alert('Kategori berhasil diperbarui!')
        } else {
            // Create
            await api.post('/categoryartikel', { name: form.value.name })
            alert('Kategori berhasil ditambahkan!')
        }

        resetForm()
        fetchCategories() // Refresh tabel
    } catch (error) {
        alert(error.response?.data?.message || 'Terjadi kesalahan')
    } finally {
        isSubmitting.value = false
    }
}

// --- FUNGSI EDIT (Mengisi form dengan data lama) ---
const editCategory = (category) => {
    isEditMode.value = true
    form.value.id = category.id
    form.value.name = category.name
}

// --- FUNGSI BATAL EDIT ---
const resetForm = () => {
    isEditMode.value = false
    form.value.id = null
    form.value.name = ''
}

// --- FUNGSI HAPUS ---
const deleteCategory = async (id) => {
    // Peringatan keras karena relasi Cascade akan menghapus artikelnya juga
    if (confirm('PERINGATAN: Menghapus kategori ini juga akan MENGHAPUS SEMUA ARTIKEL yang memiliki kategori ini. Anda yakin?')) {
        try {
            await api.delete(`/categoryartikel/${id}`)

            // Jika kategori yang sedang diedit ternyata dihapus, reset form
            if (form.value.id === id) resetForm()

            fetchCategories()
        } catch (error) {
            alert('Gagal menghapus kategori')
        }
    }
}

onMounted(() => {
    fetchCategories()
})
</script>

<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-bold">Kelola Kategori Artikel</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

            <!-- BAGIAN KIRI: FORM TAMBAH / EDIT -->
            <div class="md:col-span-1">
                <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600">
                    <h3 class="text-lg font-bold mb-4">{{ isEditMode ? 'Edit Kategori' : 'Tambah Kategori Baru' }}</h3>

                    <form @submit.prevent="submitForm" class="space-y-4">
                        <div>
                            <label class="block font-medium mb-1 text-gray-700">Nama Kategori</label>
                            <input v-model="form.name" type="text" required placeholder="Contoh: Pengumuman"
                                class="w-full border rounded p-2 focus:border-blue-500 focus:outline-none bg-gray-50 focus:bg-white" />
                        </div>

                        <div class="flex flex-col gap-2 pt-2">
                            <button type="submit" :disabled="isSubmitting"
                                class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition">
                                {{ isSubmitting ? 'Menyimpan...' : (isEditMode ? 'Update Data' : 'Simpan Kategori') }}
                            </button>

                            <button v-if="isEditMode" type="button" @click="resetForm"
                                class="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition">
                                Batal Edit
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- BAGIAN KANAN: TABEL DAFTAR KATEGORI -->
            <div class="md:col-span-2">
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-lg font-bold mb-4">Daftar Kategori</h3>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-gray-100 border-b">
                                    <th class="p-3 w-16 text-center">No</th>
                                    <th class="p-3">Nama Kategori</th>
                                    <th class="p-3 w-40 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="isLoading">
                                    <td colspan="3" class="text-center p-4">Memuat data...</td>
                                </tr>
                                <tr v-else-if="categories.length === 0">
                                    <td colspan="3" class="text-center p-4 text-gray-500">Belum ada kategori.</td>
                                </tr>
                                <tr v-for="(item, index) in categories" :key="item.id"
                                    class="border-b hover:bg-gray-50 transition"
                                    :class="{ 'bg-blue-50': isEditMode && form.id === item.id }">
                                    <td class="p-3 text-center text-gray-500">{{ index + 1 }}</td>
                                    <td class="p-3 font-medium text-gray-800">{{ item.name }}</td>
                                    <td class="p-3 flex justify-center gap-2">
                                        <button @click="editCategory(item)"
                                            class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm shadow-sm">
                                            Edit
                                        </button>
                                        <button @click="deleteCategory(item.id)"
                                            class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm shadow-sm">
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