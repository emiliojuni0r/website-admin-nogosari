<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'

const router = useRouter()
const perangkats = ref([])
const isLoading = ref(false)

const fetchPerangkat = async () => {
    isLoading.value = true
    try {
        const response = await api.get('profildesa/perangkat')
        perangkats.value = response.data.data
    } catch (error) {
        console.error("Gagal mengambil data perangkat")
    } finally {
        isLoading.value = false
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

const deletePerangkat = async (id) => {
    if (confirm('Yakin ingin menghapus anggota perangkat desa ini?')) {
        try {
            await api.delete(`/profildesa/perangkat/${id}`)
            fetchPerangkat()
        } catch (error) {
            alert('Gagal menghapus perangkat')
        }
    }
}

onMounted(() => {
    fetchPerangkat()
})
</script>

<template>
    <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Kelola Anggota Perangkat Desa</h2>
            <button @click="router.push({ name: 'form-perangkatdesa' })"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                + Tambah Anggota
            </button>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-100 border-b">
                        <th class="p-3 w-20 text-center">Urutan</th>
                        <th class="p-3 w-24">Foto</th>
                        <th class="p-3">Nama Lengkap</th>
                        <th class="p-3">Jabatan</th>
                        <th class="p-3 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="isLoading">
                        <td colspan="5" class="text-center p-4">Memuat data...</td>
                    </tr>
                    <tr v-else-if="perangkats.length === 0">
                        <td colspan="5" class="text-center p-4 text-gray-500">Belum ada perangkat desa.</td>
                    </tr>
                    <tr v-for="item in perangkats" :key="item.id" class="border-b hover:bg-gray-50">
                        <td class="p-3 text-center font-bold text-gray-500">{{ item.order }}</td>
                        <td class="p-3">
                            <img :src="getImageUrl(item.photo)"
                                class="w-16 h-16 object-cover object-top rounded shadow" />
                        </td>
                        <td class="p-3 font-medium">{{ item.name }}</td>
                        <td class="p-3"><span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">{{
                            item.position }}</span></td>
                        <td class="p-3 flex justify-center gap-2 mt-2">
                            <button @click="router.push({ name: 'form-perangkatdesa', params: { id: item.id } })"
                                class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm">
                                Edit
                            </button>
                            <button @click="deletePerangkat(item.id)"
                                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">
                                Hapus
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>