<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/utils/api'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
    try {
        const response = await api.post('/admin/login', {
            username: username.value,
            password: password.value
        })

        console.log(response)

        const { token, admin } = response.data

        authStore.setAuth({ token, admin })

        console.log(authStore.admin)
        console.log(admin?.username)

        router.push({ name: 'dashboard' })
    } catch (error) {
        errorMessage.value =
            error.response?.data?.message || 'Gagal login'
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="w-full max-w-md rounded-xl bg-white p-8 shadow-lg relative">
            <h1 class="mb-3 text-center text-3xl font-bold text-gray-800">
                Login Admin
            </h1>

            <img src="/logo/logo_bondowoso.png" alt="logo bondowoso" class="mx-auto w-14">

            <form @submit.prevent="handleLogin" class="space-y-5">
                <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700">
                        Username
                    </label>
                    <input v-model="username" type="text" placeholder="Masukkan username"
                        class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input v-model="password" type="password" placeholder="Masukkan password"
                        class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <p v-if="errorMessage"
                    class="absolute -bottom-20 left-1/2 -translate-x-1/2 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-600 whitespace-nowrap">
                    {{ errorMessage }}
                </p>

                <button type="submit"
                    class="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700 active:scale-95">
                    Login
                </button>
            </form>
        </div>
    </div>
</template>