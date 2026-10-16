<template>
  <ion-page>
    <ion-content :fullscreen="true" class="dashboard-page">

      <!-- ==========================================
           1. HERO SECTION PREMIUM
           ========================================== -->
      <div class="hero-section">

        <div class="hero-bg-blobs">
          <div class="blob blob-1"></div>
          <div class="blob blob-2"></div>
        </div>

        <div class="hero-content">

          <!-- Top Bar: Greeting & Notification -->
          <div class="hero-top-bar">

            <div class="user-greeting">
              <p class="sub-greeting">
                {{ greeting }} 👋
              </p>

              <h1 class="main-greeting">
                {{ userName }}
              </h1>
            </div>

            <button
              class="icon-btn"
              @click="$router.push('/tabs/tab4')"
            >
              <ion-icon :icon="notificationsOutline"></ion-icon>

              <span
                v-if="reports.length > 0"
                class="notif-badge"
              >
                {{ reports.length }}
              </span>
            </button>

          </div>


          <!-- Hero Title & Subtitle -->
          <div class="hero-text">

            <h2>
              Apa yang hilang hari ini?
            </h2>

            <p>
              Kami bantu temukan dengan sistem LostFound
            </p>

          </div>


          <!-- Quick Stats Cards -->
          <div class="hero-stats">

            <!-- Barang Hilang -->
            <div class="stat-card glass">

              <div class="stat-icon lost">
                <ion-icon :icon="sadOutline"></ion-icon>
              </div>

              <div class="stat-info">

                <span class="stat-num">
                  {{ lostCount }}
                </span>

                <span class="stat-label">
                  Barang Hilang
                </span>

              </div>

            </div>


            <!-- Barang Ditemukan -->
            <div class="stat-card glass">

              <div class="stat-icon found">
                <ion-icon :icon="happyOutline"></ion-icon>
              </div>

              <div class="stat-info">

                <span class="stat-num">
                  {{ foundCount }}
                </span>

                <span class="stat-label">
                  Barang Ditemukan
                </span>

              </div>

            </div>

          </div>

        </div>
      </div>


      <!-- ==========================================
           2. MAIN CONTENT
           ========================================== -->
      <div class="main-content">

        <!-- Quick Actions -->
        <div class="section-header">

          <h3>
            Aksi Cepat
          </h3>

        </div>


        <div class="quick-actions">

          <!-- Lapor Baru -->
          <button
            class="action-btn primary"
            @click="$router.push('/tabs/tab2')"
          >

            <div class="action-icon">
              <ion-icon :icon="addOutline"></ion-icon>
            </div>

            <span>
              Lapor Baru
            </span>

          </button>


          <!-- Cari Barang -->
          <button
            class="action-btn secondary"
            @click="$router.push('/tabs/tab5')"
          >

            <div class="action-icon">
              <ion-icon :icon="searchOutline"></ion-icon>
            </div>

            <span>
              Cari Barang
            </span>

          </button>


          <!-- Laporan Saya -->
          <button
            class="action-btn tertiary"
            @click="$router.push('/tabs/tab4')"
          >

            <div class="action-icon">
              <ion-icon :icon="fileTrayOutline"></ion-icon>
            </div>

            <span>
              Laporan Saya
            </span>

          </button>

        </div>


        <!-- ==========================================
             RECENT REPORTS
             ========================================== -->
        <div class="section-header">

          <h3>
            Laporan Terbaru
          </h3>

          <span class="section-count">
            {{ reports.length }} item
          </span>

        </div>


        <!-- Reports List -->
        <div
          v-if="reports.length > 0"
          class="reports-list"
        >

          <div
            v-for="report in reports"
            :key="report.id"
            class="report-card"
            @click="$router.push(`/detail/${report.id}`)"
          >

            <!-- Report Type Icon -->
            <div
              class="card-icon"
              :class="report.type"
            >

              <ion-icon
                :icon="
                  report.type === 'lost'
                    ? sadOutline
                    : happyOutline
                "
              ></ion-icon>

            </div>


            <!-- Report Information -->
            <div class="card-body">

              <!-- Header -->
              <div class="card-header-row">

                <h4>
                  {{ report.name }}
                </h4>

                <span class="card-date">
                  {{ formatDate(report.created_at) }}
                </span>

              </div>


              <!-- Location -->
              <div class="card-location">

                <ion-icon
                  :icon="locationOutline"
                ></ion-icon>

                {{ report.location }}

              </div>


              <!-- Description -->
              <p class="card-desc">
                {{ report.description }}
              </p>


              <!-- Footer -->
              <div class="card-footer">

                <span
                  class="status-badge"
                  :class="report.status"
                >
                  {{ report.status }}
                </span>

              </div>

            </div>

          </div>

        </div>


        <!-- Empty State -->
        <div
          v-else
          class="empty-state"
        >

          <div class="empty-icon"></div>

          <h3>
            Tidak ada laporan
          </h3>

          <p>
            Belum ada laporan yang tersedia.
          </p>

        </div>

      </div>

    </ion-content>
  </ion-page>
</template>


<script setup>

import {
  ref,
  computed,
  onUnmounted
} from 'vue';

import {
  IonPage,
  IonContent,
  IonIcon,
  onIonViewWillEnter,
  onIonViewDidLeave
} from '@ionic/vue';

import {
  addOutline,
  sadOutline,
  happyOutline,
  locationOutline,
  fileTrayOutline,
  searchOutline,
  notificationsOutline
} from 'ionicons/icons';

import api from '../services/api';
import { getItem } from '../services/idb';


// ==========================================
// DATA
// ==========================================

const reports = ref([]);

const userName = ref('Teman');

let refreshInterval = null;


// ==========================================
// GREETING
// ==========================================

const greeting = ref('');

function updateGreeting() {

  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) {

    greeting.value = 'Selamat Pagi';

  } else if (hour >= 11 && hour < 15) {

    greeting.value = 'Selamat Siang';

  } else if (hour >= 15 && hour < 18) {

    greeting.value = 'Selamat Sore';

  } else {

    greeting.value = 'Selamat Malam';

  }

}


// ==========================================
// STATISTIK
// ==========================================

const lostCount = computed(() => {

  return reports.value.filter(
    report => report.type === 'lost'
  ).length;

});


const foundCount = computed(() => {

  return reports.value.filter(
    report => report.type === 'found'
  ).length;

});


// ==========================================
// FORMAT TANGGAL
// ==========================================

function formatDate(date) {

  if (!date) return '-';

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return '-';
  }

  return parsedDate.toLocaleDateString(
    'id-ID',
    {
      day: 'numeric',
      month: 'short'
    }
  );

}


// ==========================================
// AMBIL DATA LAPORAN
// ==========================================

async function fetchReports() {

  try {

    const response = await api.get('/reports');

    if (Array.isArray(response.data)) {

      reports.value = response.data;

    } else {

      console.error(
        'Data laporan bukan array:',
        response.data
      );

      reports.value = [];

    }

  } catch (error) {

    console.error(
      'Gagal mengambil laporan:',
      error
    );

  }

}


// ==========================================
// AUTO REFRESH
// ==========================================

function startAutoRefresh() {

  // Pastikan interval sebelumnya dihentikan
  stopAutoRefresh();

  // Ambil data setiap 5 detik
  refreshInterval = setInterval(() => {

    fetchReports();

  }, 5000);

}


function stopAutoRefresh() {

  if (refreshInterval) {

    clearInterval(refreshInterval);

    refreshInterval = null;

  }

}


// ==========================================
// AMBIL DATA USER
// ==========================================

async function fetchUser() {

  try {

    const userStr = await getItem('user');

    const user = JSON.parse(
      userStr || '{}'
    );

    if (user.username) {

      userName.value = user.username;

    }

  } catch (error) {

    console.error(
      'Gagal mengambil data user:',
      error
    );

  }

}


// ==========================================
// SAAT MASUK TAB DASHBOARD
// ==========================================

onIonViewWillEnter(async () => {

  // Update greeting
  updateGreeting();

  // Ambil data user
  await fetchUser();

  // Ambil laporan terbaru
  await fetchReports();

  // Mulai auto refresh
  startAutoRefresh();

});


// ==========================================
// SAAT MENINGGALKAN TAB
// ==========================================

onIonViewDidLeave(() => {

  // Hentikan auto refresh
  stopAutoRefresh();

});


// ==========================================
// SAAT COMPONENT DIHAPUS
// ==========================================

onUnmounted(() => {

  // Pastikan interval tidak tetap berjalan
  stopAutoRefresh();

});

</script>


<style scoped>

/* ==========================================
   BASE
   ========================================== */

.dashboard-page {

  --background: #0f172a;

}


/* ==========================================
   HERO SECTION
   ========================================== */

.hero-section {

  position: relative;

  padding: 50px 20px 30px;

  background:
    linear-gradient(
      145deg,
      #1e1b4b 0%,
      #3730a3 55%,
      #6366f1 100%
    );

  border-radius:
    0 0 40px 40px;

  overflow: hidden;

  box-shadow:
    0 16px 36px
    rgba(49, 46, 129, 0.35);

}


.hero-bg-blobs {

  position: absolute;

  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  pointer-events: none;

}


.blob {

  position: absolute;

  border-radius: 50%;

  filter: blur(60px);

  opacity: 0.3;

  animation:
    float 15s
    ease-in-out
    infinite;

}


.blob-1 {

  width: 200px;
  height: 200px;

  background: #8b5cf6;

  top: -50px;
  left: -50px;

}


.blob-2 {

  width: 150px;
  height: 150px;

  background: #ec4899;

  bottom: -30px;
  right: -30px;

  animation-delay: 5s;

}


@keyframes float {

  0%,
  100% {

    transform:
      translate(0, 0)
      scale(1);

  }

  50% {

    transform:
      translate(20px, -20px)
      scale(1.1);

  }

}


.hero-content {

  position: relative;

  z-index: 1;

}


/* ==========================================
   TOP BAR
   ========================================== */

.hero-top-bar {

  display: flex;

  justify-content:
    space-between;

  align-items:
    flex-start;

  margin-bottom:
    20px;

}


.sub-greeting {

  margin: 0;

  color:
    rgba(255,255,255,0.7);

  font-size:
    0.9em;

  font-weight:
    500;

}


.main-greeting {

  margin:
    4px 0 0;

  color:
    white;

  font-size:
    1.6em;

  font-weight:
    800;

}


.icon-btn {

  position: relative;

  width: 44px;
  height: 44px;

  background:
    rgba(255,255,255,0.1);

  backdrop-filter:
    blur(10px);

  border:
    1px solid
    rgba(255,255,255,0.2);

  border-radius:
    14px;

  display: flex;

  align-items:
    center;

  justify-content:
    center;

  color:
    white;

  font-size:
    22px;

  cursor:
    pointer;

}


.notif-badge {

  position: absolute;

  top: -4px;
  right: -4px;

  background:
    #ef4444;

  color:
    white;

  font-size:
    10px;

  font-weight:
    700;

  padding:
    2px 6px;

  border-radius:
    10px;

  min-width:
    16px;

  text-align:
    center;

  border:
    2px solid
    #312e81;

}


/* ==========================================
   HERO TEXT
   ========================================== */

.hero-text {

  margin-bottom:
    20px;

}


.hero-text h2 {

  margin: 0;

  color:
    white;

  font-size:
    1.4em;

  font-weight:
    700;

}


.hero-text p {

  margin:
    6px 0 0;

  color:
    rgba(255,255,255,0.7);

  font-size:
    0.9em;

}


/* ==========================================
   STATISTICS
   ========================================== */

.hero-stats {

  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap:
    12px;

}


.stat-card {

  background:
    rgba(255,255,255,0.1);

  backdrop-filter:
    blur(10px);

  border:
    1px solid
    rgba(255,255,255,0.15);

  border-radius:
    16px;

  padding:
    14px;

  display: flex;

  align-items:
    center;

  gap:
    12px;

  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

}


.stat-icon {

  width: 40px;
  height: 40px;

  border-radius:
    12px;

  display: flex;

  align-items:
    center;

  justify-content:
    center;

  font-size:
    20px;

  color:
    white;

}


.stat-icon.lost {

  background:
    rgba(239,68,68,0.2);

  color:
    #fca5a5;

}


.stat-icon.found {

  background:
    rgba(16,185,129,0.2);

  color:
    #6ee7b7;

}


.stat-info {

  display: flex;

  flex-direction:
    column;

}


.stat-num {

  color:
    white;

  font-size:
    1.2em;

  font-weight:
    800;

  line-height:
    1;

}


.stat-label {

  color:
    rgba(255,255,255,0.7);

  font-size:
    0.7em;

  font-weight:
    600;

  margin-top:
    4px;

}


/* ==========================================
   MAIN CONTENT
   ========================================== */

.main-content {

  padding:
    24px 20px 40px;

}


.section-header {

  display: flex;

  justify-content:
    space-between;

  align-items:
    center;

  margin-bottom:
    16px;

}


.section-header h3 {

  margin: 0;

  color:
    #f8fafc;

  font-size:
    1.1em;

  font-weight:
    700;

}


.section-count {

  color:
    #94a3b8;

  font-size:
    0.85em;

  font-weight:
    600;

}


/* ==========================================
   QUICK ACTIONS
   ========================================== */

.quick-actions {

  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap:
    12px;

  margin-bottom:
    24px;

}


.action-btn {

  background:
    rgba(30,41,59,0.8);

  border:
    1px solid
    rgba(255,255,255,0.08);

  border-radius:
    16px;

  padding:
    16px 10px;

  display: flex;

  flex-direction:
    column;

  align-items:
    center;

  gap:
    10px;

  cursor:
    pointer;

  transition:
    all 0.3s;

  color:
    inherit;

}


.action-btn:active {

  transform:
    scale(0.95);

}


.action-btn:hover {

  transform:
    translateY(-3px);

  border-color:
    rgba(129,140,248,0.45);

  box-shadow:
    0 12px 28px
    rgba(0,0,0,0.2);

}


.action-icon {

  width: 44px;
  height: 44px;

  border-radius:
    14px;

  display: flex;

  align-items:
    center;

  justify-content:
    center;

  font-size:
    22px;

  color:
    white;

}


.action-btn.primary .action-icon {

  background:
    linear-gradient(
      135deg,
      #6366f1,
      #8b5cf6
    );

}


.action-btn.secondary .action-icon {

  background:
    linear-gradient(
      135deg,
      #10b981,
      #34d399
    );

}


.action-btn.tertiary .action-icon {

  background:
    linear-gradient(
      135deg,
      #f59e0b,
      #fbbf24
    );

}


.action-btn span {

  color:
    #f8fafc;

  font-size:
    0.75em;

  font-weight:
    600;

  text-align:
    center;

}


/* ==========================================
   REPORTS LIST
   ========================================== */

.reports-list {

  display: flex;

  flex-direction:
    column;

  gap:
    12px;

}


.report-card {

  background:
    rgba(30,41,59,0.8);

  backdrop-filter:
    blur(20px);

  border:
    1px solid
    rgba(255,255,255,0.08);

  border-radius:
    20px;

  padding:
    16px;

  display:
    flex;

  gap:
    14px;

  cursor:
    pointer;

  transition:
    all 0.3s;

}


.report-card:hover {

  transform:
    translateY(-3px);

  border-color:
    rgba(129,140,248,0.45);

  box-shadow:
    0 12px 28px
    rgba(0,0,0,0.2);

}


.report-card:active {

  transform:
    scale(0.98);

}


.card-icon {

  width: 48px;
  height: 48px;

  border-radius:
    14px;

  display: flex;

  align-items:
    center;

  justify-content:
    center;

  font-size:
    24px;

  flex-shrink:
    0;

}


.card-icon.lost {

  background:
    rgba(239,68,68,0.15);

  color:
    #ef4444;

}


.card-icon.found {

  background:
    rgba(16,185,129,0.15);

  color:
    #10b981;

}


.card-body {

  flex: 1;

  min-width: 0;

}


.card-header-row {

  display: flex;

  justify-content:
    space-between;

  align-items:
    flex-start;

  margin-bottom:
    6px;

}


.card-header-row h4 {

  margin: 0;

  color:
    #f8fafc;

  font-size:
    1em;

  font-weight:
    700;

  flex: 1;

}


.card-date {

  color:
    #64748b;

  font-size:
    0.75em;

  font-weight:
    600;

  flex-shrink:
    0;

}


.card-location {

  display: flex;

  align-items:
    center;

  gap:
    4px;

  color:
    #6366f1;

  font-size:
    0.8em;

  font-weight:
    600;

  margin-bottom:
    8px;

}


.card-location ion-icon {

  font-size:
    14px;

}


.card-desc {

  margin:
    0 0 12px;

  color:
    #94a3b8;

  font-size:
    0.85em;

  line-height:
    1.5;

  display:
    -webkit-box;

  -webkit-line-clamp:
    2;

  -webkit-box-orient:
    vertical;

  overflow:
    hidden;

}


.card-footer {

  display: flex;

  justify-content:
    flex-start;

  align-items:
    center;

}


.status-badge {

  padding:
    4px 10px;

  border-radius:
    10px;

  font-size:
    0.7em;

  font-weight:
    700;

  text-transform:
    uppercase;

  letter-spacing:
    0.5px;

}


.status-badge.pending {

  background:
    rgba(245,158,11,0.15);

  color:
    #f59e0b;

}


.status-badge.matched {

  background:
    rgba(99,102,241,0.15);

  color:
    #6366f1;

}


.status-badge.resolved {

  background:
    rgba(16,185,129,0.15);

  color:
    #10b981;

}


/* ==========================================
   EMPTY STATE
   ========================================== */

.empty-state {

  text-align:
    center;

  padding:
    40px 20px;

}


.empty-icon {

  font-size:
    60px;

  margin-bottom:
    16px;

}


.empty-icon::before {

  content:
    "🔎";

  display:
    block;

  filter:
    grayscale(0.2);

}


.empty-state h3 {

  margin:
    0 0 8px;

  color:
    #f8fafc;

  font-size:
    1.2em;

}


.empty-state p {

  margin:
    0;

  color:
    #94a3b8;

  font-size:
    0.9em;

}


/* ==========================================
   RESPONSIVE
   ========================================== */

@media (max-width: 360px) {

  .hero-section {

    padding:
      38px 16px 24px;

  }


  .main-content {

    padding-right:
      16px;

    padding-left:
      16px;

  }


  .quick-actions {

    gap:
      8px;

  }


  .action-btn {

    padding-right:
      6px;

    padding-left:
      6px;

  }

}

</style>