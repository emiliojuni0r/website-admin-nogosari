import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '', // Jika akses '/' langsung diarahkan ke '/dashboard'
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
      },
      {
        path: 'artikel',
        name: 'artikel',
        component: () => import('@/views/artikel/ArtikelView.vue'),
      },
      {
        // Form ini akan dipakai untuk Create dan Edit
        path: 'artikel/form/:slug?',
        name: 'form-artikel',
        component: () => import('@/views/artikel/FormArtikelView.vue'),
      },
      {
        path: 'potensidesa',
        name: 'potensidesa',
        component: () => import('@/views/potensidesa/PotensiDesaView.vue'),
      },
      {
        path: 'potensidesa/form/:id?',
        name: 'form-potensidesa',
        component: () => import('@/views/potensidesa/FormPotensiDesaView.vue'),
      },
      {
        // Halaman Sambutan (Hanya 1 halaman Form)
        path: 'sambutan',
        name: 'sambutan',
        component: () => import('@/views/sambutan/SambutanView.vue'),
      },
      {
        path: 'carousel',
        name: 'carousel',
        component: () => import('@/views/carousel/CarouselView.vue'),
      },
      {
        path: 'carousel/form/:id?',
        name: 'form-carousel',
        component: () => import('@/views/carousel/FormCarouselView.vue'),
      },
      {
        path: 'footer',
        name: 'footer',
        component: () => import('@/views/footer/FooterView.vue'),
      },
      {
        path: 'kependudukan',
        name: 'kependudukan',
        component: () => import('@/views/kependudukan/KependudukanView.vue'),
      },
      {
        path: 'profildesa',
        name: 'profildesa',
        component: () => import('@/views/profildesa/ProfilDesaView.vue'),
      },
      {
        path: 'perangkatdesa',
        name: 'perangkatdesa',
        component: () => import('@/views/perangkatdesa/PerangkatDesaView.vue'),
      },
      {
        path: 'perangkat/form/:id?',
        name: 'form-perangkatdesa',
        component: () => import('@/views/perangkatdesa/FormPerangkatDesaView.vue'),
      },
      {
        path: 'kategori',
        name: 'kategori',
        component: () => import('@/views/kategori/KategoriView.vue'),
      },
      {
        path: 'pemetaan',
        name: 'pemetaan',
        component: () => import('@/views/pemetaan/PemetaanView.vue'),
      },
      {
        path: 'pemetaan/form-peta/:id?',
        name: 'form-peta',
        component: () => import('@/views/pemetaan/FormPetaView.vue'),
      },
      {
        path: 'user',
        name: 'user',
        component: () => import('@/views/user/UserView.vue'),
      },
      {
        path: 'apbdes',
        name: 'apbdes',
        component: () => import('@/views/apbdes/ApbdesView.vue'),
      },
      {
        path: 'regulasi',
        name: 'regulasi',
        component: () => import('@/views/regulasi/RegulasiView.vue'),
      },
      {
        path: 'galeri',
        name: 'galeri',
        component: () => import('@/views/galeri/GaleriView.vue'),
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard: Pengecekan sebelum pindah halaman
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated()

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Mau akses dashboard tapi belum login? Lempar ke login.
    next({ name: 'login' })
  } else if (to.meta.requiresGuest && isAuthenticated) {
    // Sudah login tapi mau akses halaman login lagi? Lempar ke dashboard.
    next({ name: 'dashboard' })
  } else {
    // Sisanya, biarkan lewat
    next()
  }
})

export default router

// import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'

// const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
//   routes: [
//     {
//       path: '/',
//       name: 'home',
//       component: HomeView,
//     },
//     {
//       path: '/about',
//       name: 'about',
//       // route level code-splitting
//       // this generates a separate chunk (About.[hash].js) for this route
//       // which is lazy-loaded when the route is visited.
//       component: () => import('../views/AboutView.vue'),
//     },
//   ],
// })

// export default router