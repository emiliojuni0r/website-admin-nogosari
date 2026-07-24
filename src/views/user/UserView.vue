<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loggedInAdminId = authStore.admin?.id

const admins = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)

// State untuk Modal
const showModal = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const formMode = ref('CREATE')
const form = ref({
    id: null,
    username: '',
    password: '',
    confirmPassword: ''
})

// --- FORMAT TANGGAL ---
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

// --- FUNGSI AMBIL DATA ---
const fetchAdmins = async () => {
    isLoading.value = true
    try {
        // PERBAIKAN: Ubah admin/users menjadi /users agar sesuai dengan backend
        const response = await api.get('admin/users')
        admins.value = response.data.data
    } catch (error) {
        console.error("Gagal mengambil data admin")
    } finally {
        isLoading.value = false
    }
}

// --- FUNGSI SUBMIT (CREATE / UPDATE PASSWORD) ---
const submitForm = async () => {
    if (!form.value.password.trim()) {
        alert("Password tidak boleh kosong!")
        return
    }

    // PERBAIKAN: Validasi ini sekarang berlaku untuk CREATE dan UPDATE agar aman dari salah ketik
    if (form.value.password !== form.value.confirmPassword) {
        alert("Password dan Confirm Password tidak sama.")
        return
    }

    isSubmitting.value = true

    try {
        if (formMode.value === "CREATE") {
            // PERBAIKAN: Ubah admin/users menjadi /users
            await api.post("admin/users", {
                username: form.value.username,
                password: form.value.password
            })
            alert("Akun admin berhasil ditambahkan!")
        } else {
            await api.put(`admin/users/${form.value.id}/password`, {
                newPassword: form.value.password
            })
            alert("Password berhasil diperbarui!")
        }

        resetForm()
        showModal.value = false
        fetchAdmins()
    } catch (error) {
        alert(error.response?.data?.message || "Terjadi kesalahan")
    } finally {
        isSubmitting.value = false
    }
}

// --- FUNGSI BATAL / RESET ---
const resetForm = () => {
    formMode.value = "CREATE"
    form.value = {
        id: null,
        username: "",
        password: "",
        confirmPassword: ""
    }
    showPassword.value = false
    showConfirmPassword.value = false
}

// --- FUNGSI HAPUS ---
const deleteAdmin = async (id) => {
    if (id === loggedInAdminId) {
        alert("Akses ditolak: Anda tidak dapat menghapus akun Anda sendiri saat sedang login.")
        return
    }

    if (confirm('Yakin ingin menghapus akun admin ini? Tindakan ini tidak bisa dibatalkan.')) {
        try {
            await api.delete(`/users/${id}`)
            if (form.value.id === id) resetForm()
            fetchAdmins()
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal menghapus admin')
        }
    }
}

// --- FUNGSI TRIGGER MODAL ---
const openCreateModal = () => {
    resetForm()
    formMode.value = "CREATE"
    showModal.value = true
}

const prepareUpdatePassword = (admin) => {
    resetForm()
    formMode.value = "UPDATE_PASSWORD"
    form.value.id = admin.id
    form.value.username = admin.username
    showModal.value = true
}

onMounted(() => {
    fetchAdmins()
})
</script>

<template>
    <div class="space-y-6">

        <!-- MODAL POPUP -->
        <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4 animate-fade-in-up">

                <div class="flex justify-between items-center mb-5 border-b pb-3">
                    <h3 class="text-lg font-bold text-gray-800">
                        {{ formMode === 'CREATE' ? 'Tambah Admin Baru' : 'Ganti Password' }}
                    </h3>
                    <button @click="showModal = false"
                        class="text-gray-400 hover:text-red-500 text-xl font-bold transition">
                        ✕
                    </button>
                </div>

                <form @submit.prevent="submitForm" class="space-y-4">
                    <!-- Username -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Username</label>
                        <input v-model="form.username" :disabled="formMode === 'UPDATE_PASSWORD'" required
                            class="w-full border rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
                            :class="formMode === 'UPDATE_PASSWORD' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'" />
                    </div>

                    <!-- Password -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700">
                            {{ formMode === 'CREATE' ? 'Password' : 'Password Baru' }}
                        </label>
                        <div class="relative mt-1">
                            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required
                                class="w-full border rounded-md p-2 pr-16 focus:ring-blue-500 focus:border-blue-500" />
                            <button type="button" @click="showPassword = !showPassword"
                                class="absolute right-3 top-2.5 text-sm font-semibold text-blue-600 hover:text-blue-800">
                                {{ showPassword ? 'Hide' : 'Show' }}
                            </button>
                        </div>
                    </div>

                    <!-- Confirm Password -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <div class="relative mt-1">
                            <input v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                                required
                                class="w-full border rounded-md p-2 pr-16 focus:ring-blue-500 focus:border-blue-500" />
                            <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                                class="absolute right-3 top-2.5 text-sm font-semibold text-blue-600 hover:text-blue-800">
                                {{ showConfirmPassword ? 'Hide' : 'Show' }}
                            </button>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex justify-end gap-3 pt-4 border-t mt-6">
                        <button type="button" @click="showModal = false"
                            class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium">
                            Batal
                        </button>
                        <button type="submit" :disabled="isSubmitting"
                            class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition font-medium">
                            {{ isSubmitting ? 'Menyimpan...' : (formMode === 'CREATE' ? 'Simpan' : 'Update Password') }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- HEADER & TABEL (FULL WIDTH) -->
        <div class="bg-white p-6 rounded-lg shadow-md">
            <!-- PERBAIKAN: Hapus H3 yang ganda dan layout diatur ulang -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b pb-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Kelola Akun Admin</h2>
                    <p class="text-sm text-gray-500 mt-1">Daftar pengguna yang memiliki akses ke dashboard ini.</p>
                </div>
                <button @click="openCreateModal"
                    class="bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 transition font-medium shadow-sm flex items-center gap-2">
                    <span>+ Tambah Admin</span>
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b border-t border-gray-200 text-gray-600 text-sm">
                            <th class="p-4 w-16 text-center font-semibold">No</th>
                            <th class="p-4 font-semibold">Username</th>
                            <th class="p-4 font-semibold">Tgl Dibuat</th>
                            <th class="p-4 text-center font-semibold">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="isLoading">
                            <td colspan="4" class="text-center p-8 text-gray-500 animate-pulse">Memuat data...</td>
                        </tr>
                        <tr v-else-if="admins.length === 0">
                            <td colspan="4" class="text-center p-8 text-gray-500">Belum ada data admin.</td>
                        </tr>
                        <tr v-for="(item, index) in admins" :key="item.id"
                            class="border-b hover:bg-blue-50/50 transition duration-150">
                            <td class="p-4 text-center text-gray-500">{{ index + 1 }}</td>

                            <td class="p-4 font-medium text-gray-800 flex items-center gap-3">
                                {{ item.username }}
                                <span v-if="item.id === loggedInAdminId"
                                    class="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-bold tracking-wide">
                                    ANDA
                                </span>
                            </td>

                            <td class="p-4 text-sm text-gray-600">{{ formatDate(item.createdAt) }}</td>

                            <td class="p-4 flex justify-center gap-2">
                                <button @click="prepareUpdatePassword(item)"
                                    class="bg-yellow-500 text-white px-3.5 py-1.5 rounded hover:bg-yellow-600 text-sm shadow-sm transition font-medium">
                                    Ganti Password
                                </button>

                                <button @click="deleteAdmin(item.id)" :disabled="item.id === loggedInAdminId"
                                    class="px-3.5 py-1.5 rounded text-sm shadow-sm transition text-white font-medium disabled:opacity-50"
                                    :class="item.id === loggedInAdminId ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'"
                                    :title="item.id === loggedInAdminId ? 'Tidak bisa menghapus akun sendiri' : 'Hapus Admin'">
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

<style scoped>
/* Opsional: Animasi muncul untuk Modal agar terasa lebih premium */
.animate-fade-in-up {
    animation: fadeInUp 0.3s ease-out forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
</style>