import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '@/views/TabsPage.vue';
import { getItem } from '@/services/idb.js';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('@/views/LoginPage.vue')
  },
  {
    path: '/detail/:id',
    component: () => import('@/views/DetailPage.vue')
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      { path: '', redirect: '/tabs/tab1' },
      { path: 'tab1', component: () => import('@/views/Tab1Page.vue') },
      { path: 'tab2', component: () => import('@/views/Tab2Page.vue') },
      { path: 'tab3', component: () => import('@/views/ProfilePage.vue') }, // Profile jadi Tab 3
      { path: 'tab4', component: () => import('@/views/Tab4Page.vue') },    // Laporan Saya
      { path: 'tab5', component: () => import('@/views/Tab5Page.vue') }     // Pencarian
    ]
  }
];



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Guard untuk Auto-Login & Proteksi Halaman
router.beforeEach(async (to) => {
  try {
    const token = await getItem('token');

    // Jika belum login, hanya boleh membuka halaman publik
    if (!token && to.path.startsWith('/tabs')) {
      return '/login';
    }

    // Jika masih login dan membuka halaman login,
    // arahkan ke Dashboard
    if (token && to.path === '/login') {
      return '/tabs/tab1';
    }

    return true;
  } catch (error) {
    console.error('Gagal memeriksa status login:', error);
    return '/login';
  }
});

export default router;