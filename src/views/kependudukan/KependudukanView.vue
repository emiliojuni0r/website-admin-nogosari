<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

// Import komponen dari vue-chartjs dan chart.js
import { Bar, Pie } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js'

// Registrasi modul Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
)

const fileExcel = ref(null)
const isLoadingUpload = ref(false)
const isLoadingData = ref(true)

// State untuk menyimpan data dari API
const summary = ref({ totalPenduduk: 0 })
const charts = ref(null)

// --- FUNGSI UPLOAD EXCEL ---
const handleFileChange = (event) => {
    fileExcel.value = event.target.files[0]
}

const submitUpload = async () => {
    if (!fileExcel.value) {
        alert("Pilih file Excel terlebih dahulu!")
        return
    }

    isLoadingUpload.value = true
    const formData = new FormData()
    // Pastikan nama field 'file_excel' sesuai dengan multer di backend
    formData.append('file_excel', fileExcel.value)

    try {
        await api.post('/kependudukan/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        alert('Data Kependudukan berhasil diperbarui dari Excel!')
        fileExcel.value = null // Reset input file

        // Muat ulang grafik setelah upload sukses
        fetchDataKependudukan()
    } catch (error) {
        alert(error.response?.data?.message || 'Gagal mengunggah file Excel.')
    } finally {
        isLoadingUpload.value = false
    }
}

// --- FUNGSI AMBIL DATA GRAFIK ---
const fetchDataKependudukan = async () => {
    isLoadingData.value = true
    try {
        const res = await api.get('/kependudukan')
        summary.value = res.data.summary
        charts.value = res.data.charts
    } catch (error) {
        console.error("Gagal memuat data grafik kependudukan")
    } finally {
        isLoadingData.value = false
    }
}

// --- OPSI KONFIGURASI CHART (Sama seperti versi React kamu) ---
const chartOptionsStandard = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' }
    }
}

const chartOptionsPekerjaan = {
    indexAxis: 'y', // Horizontal Bar
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { color: 'rgba(0,0,0,0.05)' } },
        y: { grid: { display: false } }
    }
}

const chartOptionsPendidikan = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.05)' } }
    }
}

const chartOptionsRT = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        }
    },
    scales: {
        x: {
            beginAtZero: true,
            grid: {
                color: 'rgba(0,0,0,0.05)'
            }
        },
        y: {
            grid: {
                display: false
            }
        }
    }
}

const chartOptionsLahirMati = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: { label: (context) => ` ${context.raw} Jiwa` }
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: '#05391E', font: { size: 14, weight: 'bold' } }
        },
        y: {
            grid: { color: 'rgba(239, 235, 191, 0.1)' },
            ticks: { color: '#05391E', font: { size: 14 } }
        }
    }
};

onMounted(() => {
    fetchDataKependudukan()
})
</script>

<template>
    <div class="bg-transparent space-y-6">

        <!-- HEADER & UPLOAD SECTION -->
        <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-4">Kelola Data Kependudukan</h2>

            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-blue-700 text-sm mb-6">
                <p><strong>Cara Update Data:</strong> Unggah file Excel (.xlsx) yang diekspor dari sistem pencatatan
                    desa. Pastikan terdapat sheet bernama <strong>"DATA FIX"</strong>
                    sesuai dengan format standar</p>
                <p>
                    dan pastikan file .xslx memiliki format kolom seperti berikut:
                </p>
                <img src="/example/format_anu.png" />
            </div>

            <form @submit.prevent="submitUpload" class="flex items-end gap-4 bg-gray-50 p-4 border rounded-md">
                <div class="flex-1">
                    <label class="block font-medium mb-2 text-gray-700">Pilih Berkas Excel Kependudukan</label>
                    <input type="file" accept=".xlsx, .xls" @change="handleFileChange"
                        class="w-full border bg-white rounded p-2" />
                </div>
                <button type="submit" :disabled="isLoadingUpload || !fileExcel"
                    class="bg-green-600 text-white px-6 py-2 h-11 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition whitespace-nowrap">
                    {{ isLoadingUpload ? 'Memproses...' : 'Upload & Proses Data' }}
                </button>
            </form>
        </div>

        <!-- PREVIEW GRAFIK SECTION -->
        <div v-if="!isLoadingData && charts" class="bg-white p-6 rounded-lg shadow-md">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-gray-800">Preview Data Statistik</h3>
                <div class="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold">
                    Total Penduduk: {{ summary.totalPenduduk.toLocaleString('id-ID') }} Jiwa
                </div>
            </div>

            <!-- Grid untuk Chart -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

                <!-- Chart Umur (Full Width) -->
                <div class="col-span-1 md:col-span-2 border rounded-lg p-4 bg-gray-50">
                    <h4 class="text-center font-bold mb-4 text-gray-700">Kependudukan Berdasarkan Umur</h4>
                    <div class="h-[300px]">
                        <Bar :data="charts.chartDataUmur" :options="chartOptionsStandard" />
                    </div>
                </div>

                <!-- Chart RT (Full Width) -->
                <div class="col-span-1 md:col-span-2 border rounded-lg p-4 bg-gray-50">
                    <h4 class="text-center font-bold mb-4 text-gray-700">
                        Sebaran Penduduk per RT
                    </h4>

                    <div class="h-[600px]">
                        <Bar :data="charts.chartDataRT" :options="chartOptionsRT" />
                    </div>
                </div>

                <!-- Chart Dusun -->
                <div class="border rounded-lg p-4 bg-gray-50">
                    <h4 class="text-center font-bold mb-4 text-gray-700">Sebaran per Dusun</h4>
                    <div class="h-[300px]">
                        <Pie :data="charts.chartDataDusun" :options="chartOptionsStandard" />
                    </div>
                </div>

                <!-- Chart Agama -->
                <div class="border rounded-lg p-4 bg-gray-50">
                    <h4 class="text-center font-bold mb-4 text-gray-700">Berdasarkan Agama</h4>
                    <div class="h-[300px]">
                        <Pie :data="charts.chartDataAgama" :options="chartOptionsStandard" />
                    </div>
                </div>

                <!-- Chart Pendidikan (Full Width) -->
                <div class="col-span-1 md:col-span-2 border rounded-lg p-4 bg-gray-50">
                    <h4 class="text-center font-bold mb-4 text-gray-700">Tingkat Pendidikan Terakhir</h4>
                    <div class="h-[300px]">
                        <Bar :data="charts.chartDataPendidikan" :options="chartOptionsPendidikan" />
                    </div>
                </div>

                <!-- Chart Pekerjaan (Full Width - Horizontal) -->
                <div class="col-span-1 md:col-span-2 border rounded-lg p-4 bg-gray-50">
                    <h4 class="text-center font-bold mb-4 text-gray-700">Mata Pencaharian / Pekerjaan</h4>
                    <div class="h-[600px]">
                        <Bar :data="charts.chartDataPekerjaan" :options="chartOptionsPekerjaan" />
                    </div>
                </div>

                <!-- Chart kematian/kelahiran (Full Width) -->
                <div class="col-span-1 md:col-span-2 border rounded-lg p-4 bg-gray-50">
                    <h4 class="text-center font-bold mb-4 text-gray-700">Statistik Kelahiran & Kematian</h4>
                    <!-- Tinggi disesuaikan menjadi 400px agar batang grafik tidak terlalu kurus memanjang -->
                    <div class="h-[400px]">
                        <!-- TYPO DIPERBAIKI: Menggunakan chartDataLahirMati -->
                        <Bar :data="charts.chartDataLahirMati" :options="chartOptionsLahirMati" />
                    </div>
                </div>

            </div>
        </div>

        <!-- Loading State Data -->
        <div v-else-if="isLoadingData" class="bg-white p-6 rounded-lg shadow-md text-center py-12">
            <p class="text-gray-500 font-medium animate-pulse">Memuat data statistik kependudukan...</p>
        </div>

    </div>
</template>