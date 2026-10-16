<template>
  <ion-page>
    <!-- PENTING: Hapus :fullscreen="true" agar Tab Bar tidak tertutup -->
    <ion-content class="premium-profile">
      
      <!-- Animated Background Orbs -->
      <div class="bg-mesh">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
      </div>

      <!-- 1. PROFILE HEADER CARD -->
      <div class="profile-header-card">
        <div class="avatar-wrapper">
          <div class="avatar-glow"></div>
          <div class="avatar-ring">
            <span class="avatar-initial">{{ userInitial }}</span>
          </div>
          <div class="status-dot"></div>
        </div>
        
        <h1 class="username">{{ user?.username || 'Guest User' }}</h1>
        <p class="email">{{ user?.email || 'user@lostfound.com' }}</p>
        
        <div class="pro-badge">
          <ion-icon :icon="starOutline"></ion-icon>
          <span>Active Reporter</span>
        </div>
      </div>

      <!-- 2. BENTO GRID STATS -->
      <div class="bento-stats">
        <div class="bento-box primary">
          <div class="box-icon"><ion-icon :icon="fileTrayOutline"></ion-icon></div>
          <div class="box-content">
            <span class="box-value">{{ totalReports }}</span>
            <span class="box-label">Total Laporan</span>
          </div>
        </div>
        
        <div class="bento-box success">
          <div class="box-icon"><ion-icon :icon="checkmarkCircleOutline"></ion-icon></div>
          <div class="box-content">
            <span class="box-value">{{ resolvedReports }}</span>
            <span class="box-label">Selesai</span>
          </div>
        </div>

        <div class="bento-box warning full-width">
          <div class="box-icon"><ion-icon :icon="sparklesOutline"></ion-icon></div>
          <div class="box-content">
            <span class="box-value">{{ matchedReports }}</span>
            <span class="box-label">AI Match Berhasil</span>
          </div>
          <div class="box-trend">
            <ion-icon :icon="trendingUpOutline"></ion-icon>
            <span>Smart Match</span>
          </div>
        </div>
      </div>

      <!-- 3. MENU GRID -->
      <div class="bento-menu">
        <h3 class="section-title">Menu Utama</h3>
        
        <div class="menu-grid">
          <button class="menu-box" @click="$router.push('/tabs/tab4')">
            <div class="menu-icon-wrap" style="background: rgba(99, 102, 241, 0.15); color: #6366f1;">
              <ion-icon :icon="listOutline"></ion-icon>
            </div>
            <div class="menu-text">
              <h4>Laporan Saya</h4>
              <p>Riwayat aktivitas</p>
            </div>
            <ion-icon :icon="chevronForwardOutline" class="menu-arrow"></ion-icon>
          </button>

          <button class="menu-box" @click="$router.push('/tabs/tab5')">
            <div class="menu-icon-wrap" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
              <ion-icon :icon="searchOutline"></ion-icon>
            </div>
            <div class="menu-text">
              <h4>Pencarian</h4>
              <p>Cari barang</p>
            </div>
            <ion-icon :icon="chevronForwardOutline" class="menu-arrow"></ion-icon>
          </button>

          <button class="menu-box" @click="$router.push('/tabs/tab2')">
            <div class="menu-icon-wrap" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">
              <ion-icon :icon="addCircleOutline"></ion-icon>
            </div>
            <div class="menu-text">
              <h4>Buat Laporan</h4>
              <p>Input data baru</p>
            </div>
            <ion-icon :icon="chevronForwardOutline" class="menu-arrow"></ion-icon>
          </button>

          <button class="menu-box" @click="$router.push('/tabs/tab1')">
            <div class="menu-icon-wrap" style="background: rgba(236, 72, 153, 0.15); color: #ec4899;">
              <ion-icon :icon="homeOutline"></ion-icon>
            </div>
            <div class="menu-text">
              <h4>Dashboard</h4>
              <p>Beranda utama</p>
            </div>
            <ion-icon :icon="chevronForwardOutline" class="menu-arrow"></ion-icon>
          </button>
        </div>
      </div>

      <!-- 4. LOGOUT & FOOTER -->
      <div class="logout-section">
        <button class="logout-btn" @click="handleLogout">
          <ion-icon :icon="logOutOutline"></ion-icon>
          <span>Keluar dari Akun</span>
        </button>
        
        <div class="app-version">
          <span>LostFound App v1.0.0</span>
          <span>Vue 3 • Ionic • SQLite</span>
        </div>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { 
  fileTrayOutline, checkmarkCircleOutline, listOutline, 
  searchOutline, sparklesOutline, logOutOutline, chevronForwardOutline,
  starOutline, trendingUpOutline, addCircleOutline, homeOutline
} from 'ionicons/icons';
import api from '../services/api';
import { getItem } from '../services/idb';

const router = useRouter();
const user = ref(null);
const reports = ref([]);

const userInitial = computed(() => {
  return user.value?.username?.charAt(0)?.toUpperCase() || 'G';
});

const totalReports = computed(() => reports.value.length);
const resolvedReports = computed(() => reports.value.filter(r => r.status === 'resolved').length);
const matchedReports = computed(() => reports.value.filter(r => r.status === 'matched').length);

async function fetchProfile() {
  try {
    // Ambil user dari sumber yang sama dengan Dashboard
    const userStr = await getItem('user');

    if (!userStr) {
      user.value = null;
      reports.value = [];
      return;
    }

    user.value = typeof userStr === 'string'
      ? JSON.parse(userStr)
      : userStr;

    console.log('User Profile:', user.value);

    if (!user.value?.id) {
      console.warn('ID user tidak ditemukan');
      reports.value = [];
      return;
    }

    // Ambil laporan berdasarkan ID user
    const response = await api.get(`/reports/user/${user.value.id}`);

    reports.value = response.data;

    console.log('Laporan User:', reports.value);

  } catch (error) {
    console.error('Gagal memuat profile:', error);
    reports.value = [];
  }
}

import { removeItem } from '@/services/idb.js';

async function handleLogout() {
  if (confirm('Yakin ingin keluar dari aplikasi?')) {
    try {
      // Hapus data login dari localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      // Hapus data login dari IndexedDB
      await removeItem('user');
      await removeItem('token');

      // Arahkan ke halaman login
      await router.replace('/login');
    } catch (error) {
      console.error('Gagal logout:', error);
      alert('Terjadi kesalahan saat keluar dari akun.');
    }
  }
}

onMounted(() => { fetchProfile(); });
</script>

<style scoped>
/* ==========================================
   BASE & BACKGROUND (DISESUAIKAN DENGAN TAB LAIN)
   ========================================== */
.premium-profile {
  --background: #0f172a !important; /* Warna Slate 900 yang konsisten */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.bg-mesh {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.15;
  animation: floatOrb 18s ease-in-out infinite;
}

.orb-1 {
  width: 280px; height: 280px;
  top: -100px; left: -100px;
  background: #6366f1; /* Indigo */
}

.orb-2 {
  width: 240px; height: 240px;
  right: -80px; bottom: 10%;
  background: #8b5cf6; /* Purple */
  animation-delay: -9s;
}

@keyframes floatOrb {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(25px, -25px); }
}

/* ==========================================
   PROFILE CARD (GLASSMORPHISM)
   ========================================== */
.profile-header-card {
  position: relative;
  z-index: 1;
  margin: 30px 20px 20px;
  padding: 30px 20px 26px;
  text-align: center;
  
  background: rgba(30, 41, 59, 0.7); /* Slate 800 transparan */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.avatar-wrapper {
  position: relative;
  width: 90px; height: 90px;
  margin: 0 auto 16px;
}

.avatar-glow {
  position: absolute;
  inset: -15px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.4), transparent 70%);
  animation: avatarPulse 3s ease-in-out infinite;
}

@keyframes avatarPulse {
  0%, 100% { opacity: 0.5; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.08); }
}

.avatar-ring {
  position: relative;
  width: 100%; height: 100%;
  padding: 3px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.avatar-initial {
  display: flex;
  width: 100%; height: 100%;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #1e293b;
  color: #f8fafc;
  font-size: 36px;
  font-weight: 800;
}

.status-dot {
  position: absolute;
  right: 2px; bottom: 2px;
  width: 18px; height: 18px;
  border: 3px solid #1e293b;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.username {
  margin: 0 0 6px;
  color: #f8fafc;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.email {
  margin: 0 0 16px;
  color: #94a3b8;
  font-size: 0.85rem;
}

.pro-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
  font-size: 0.75rem;
  font-weight: 700;
}

/* ==========================================
   BENTO STATS
   ========================================== */
.bento-stats {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 0 20px 24px;
}

.bento-box {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  transition: transform 0.2s ease;
}

.bento-box:active { transform: scale(0.96); }

.bento-box.full-width {
  grid-column: 1 / -1;
  flex-direction: row;
  align-items: center;
}

.box-icon {
  display: flex;
  width: 42px; height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  font-size: 20px;
}

.bento-box.primary .box-icon { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
.bento-box.success .box-icon { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.bento-box.warning .box-icon { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }

.box-content { display: flex; flex-direction: column; gap: 4px; }

.box-value {
  color: #f8fafc;
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1;
}

.box-label {
  color: #94a3b8;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.box-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.1);
  color: #818cf8;
  font-size: 0.7rem;
  font-weight: 700;
}

/* ==========================================
   MENU GRID
   ========================================== */
.bento-menu {
  position: relative;
  z-index: 1;
  margin: 0 20px 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px 4px;
  color: #f8fafc;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.menu-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.menu-box {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  min-height: 120px;
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-box:active {
  transform: scale(0.96);
  background: rgba(30, 41, 59, 0.9);
}

.menu-icon-wrap {
  display: flex;
  width: 42px; height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  font-size: 20px;
}

.menu-text h4 {
  margin: 0;
  color: #f8fafc;
  font-size: 0.9rem;
  font-weight: 700;
}

.menu-text p {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 0.7rem;
}

.menu-arrow {
  position: absolute;
  top: 16px; right: 16px;
  color: #64748b;
  font-size: 16px;
}

/* ==========================================
   LOGOUT & FOOTER
   ========================================== */
.logout-section {
  position: relative;
  z-index: 1;
  padding: 0 20px 40px;
  text-align: center;
}

.logout-btn {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:active {
  transform: scale(0.98);
  background: rgba(239, 68, 68, 0.2);
}

.app-version {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.app-version span {
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 500; 
}
</style>