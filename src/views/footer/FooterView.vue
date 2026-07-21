<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const isLoading = ref(false)

// State form dengan nilai default kosong
const form = ref({
    address: '',
    phone: '',
    email: ''
})

// Fungsi untuk mengambil data footer saat ini
// Catatan: Asumsi endpoint backend kamu digabung di express menjadi '/api/footer'
const loadFooter = async () => {
    try {
        const res = await api.get('/footer')
        const data = res.data.data

        // Jika data ada, masukkan ke form
        if (data) {
            form.value.address = data.address !== '-' ? data.address : ''
            form.value.phone = data.phone !== '-' ? data.phone : ''
            form.value.email = data.email !== '-' ? data.email : ''
        }
    } catch (error) {
        console.error('Gagal memuat data footer:', error)
    }
}

// Fungsi untuk menyimpan perubahan
const submitForm = async () => {
    isLoading.value = true

    try {
        // KARENA TIDAK ADA GAMBAR, KITA LANGSUNG KIRIM OBJEK JSON (form.value)
        await api.put('/footer', {
            address: form.value.address,
            phone: form.value.phone,
            email: form.value.email
        })

        alert('Informasi Footer berhasil diperbarui!')
        loadFooter() // Muat ulang data terbaru untuk memastikan
    } catch (error) {
        alert(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    loadFooter()
})
</script>

<template>
    <div class="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
        <h2 class="text-2xl font-bold mb-6">Kelola Informasi Kontak & Footer</h2>

        <div class="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-blue-700 text-sm">
            <p><strong>Informasi:</strong> Data di bawah ini akan ditampilkan pada bagian paling bawah (footer) website
            </p>
        </div>

        <form @submit.prevent="submitForm" class="space-y-6">
            <!-- Input Alamat -->
            <div>
                <label class="block font-medium mb-1">Alamat Kantor Desa</label>
                <!-- Menggunakan textarea karena alamat bisa lebih dari 1 baris -->
                <textarea v-model="form.address" rows="3"
                    class="w-full border rounded p-2 focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition"
                    placeholder="Contoh: Jl. Raya Desa No. 123, Kec. Contoh, Kab. Contoh, Provinsi, 12345"></textarea>
            </div>

            <!-- Input Telepon -->
            <div>
                <label class="block font-medium mb-1">Nomor Telepon / WhatsApp</label>
                <input v-model="form.phone" type="text"
                    class="w-full border rounded p-2 focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition"
                    placeholder="Contoh: 081234567890" />
            </div>

            <!-- Input Email -->
            <div>
                <label class="block font-medium mb-1">Alamat Email Resmi</label>
                <input v-model="form.email" type="email"
                    class="w-full border rounded p-2 focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition"
                    placeholder="Contoh: pemdes@namadesa.go.id" />
            </div>

            <!-- Tombol Submit -->
            <div class="flex justify-end pt-4 border-t">
                <button type="submit" :disabled="isLoading"
                    class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition">
                    {{ isLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}
                </button>
            </div>
        </form>
    </div>
</template>