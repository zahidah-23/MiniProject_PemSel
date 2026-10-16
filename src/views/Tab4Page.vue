<template>
  <ion-page>
    <ion-content :fullscreen="true" class="myreports-page">

      <div class="bg-blobs">
        <div class="blob blob-1"></div>
      </div>

      <div class="page-header">
        <h1>Laporan Saya</h1>
        <p>Riwayat laporan yang Anda buat</p>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat data...</p>
      </div>

      <!-- EMPTY -->
      <div v-else-if="reports.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>Belum ada laporan</h3>
        <p>Anda belum membuat laporan apapun</p>

        <button class="cta-btn" @click="$router.push('/tabs/tab2')">
          <ion-icon :icon="addOutline"></ion-icon>
          Buat Laporan Pertama
        </button>
      </div>

      <!-- LIST LAPORAN -->
      <div v-else class="reports-list">

        <div
          v-for="report in reports"
          :key="report.id"
          class="report-card"
        >

          <div class="card-type" :class="report.type">
            <ion-icon
              :icon="report.type === 'lost' ? sadOutline : happyOutline"
            ></ion-icon>
          </div>

          <div class="card-body">

            <div class="card-top">
              <h4>{{ report.name }}</h4>

              <span
                class="status-badge"
                :class="report.status"
              >
                {{ report.status }}
              </span>
            </div>

            <div class="card-location">
              <ion-icon :icon="locationOutline"></ion-icon>
              {{ report.location }}
            </div>

            <p class="card-desc">
              {{ report.description }}
            </p>

            <div class="card-date">
              <ion-icon :icon="timeOutline"></ion-icon>
              {{ formatDate(report.created_at) }}
            </div>

            <!-- TOMBOL CARI KECOCOKAN -->
            <button
              class="match-btn"
              @click.stop="findMatches(report.id)"
            >
              <span v-if="activeMatchId !== report.id">
                🤖 Cari Kecocokan
              </span>

              <span v-else-if="isMatching">
                🔄 Mencari...
              </span>

              <span v-else>
                🤖 Lihat Kecocokan
              </span>
            </button>

            <!-- HASIL MATCH -->
            <div
              v-if="
                activeMatchId === report.id &&
                matchedItems.length > 0 &&
                !isMatching
              "
              class="match-results"
            >

              <div class="match-title">
                <span>🤖</span>
                <strong>Kecocokan Ditemukan</strong>
              </div>

              <div
                v-for="match in matchedItems"
                :key="match.id"
                class="match-item"
              >

                <div class="match-score">
                  {{ (match.match_score * 100).toFixed(0) }}%
                </div>

                <div class="match-info">
                  <h5>{{ match.name }}</h5>

                  <p>
                    {{ match.description }}
                  </p>

                  <small>
                    👤 {{ match.contact_name || 'Anonim' }}
                  </small>

                  <small>
                    📱 {{ match.contact_phone || 'Nomor tidak tersedia' }}
                  </small>
                </div>

                <!-- WHATSAPP -->
                <button
                  class="wa-btn"
                  @click.stop="
                    bukaWhatsApp(
                      match.contact_phone,
                      match.name
                    )
                  "
                >
                  <ion-icon :icon="logoWhatsapp"></ion-icon>
                </button>

              </div>

            </div>

            <!-- TIDAK ADA MATCH -->
            <div
              v-if="
                activeMatchId === report.id &&
                matchedItems.length === 0 &&
                !isMatching
              "
              class="no-match"
            >
              Tidak ditemukan laporan yang cocok.
            </div>

          </div>
        </div>

      </div>

    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  ref,
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
  sadOutline,
  happyOutline,
  locationOutline,
  timeOutline,
  addOutline,
  logoWhatsapp
} from 'ionicons/icons';

import api from '../services/api';
import { getItem } from '../services/idb';


// ==========================================
// DATA LAPORAN
// ==========================================

const reports = ref([]);
const loading = ref(true);

let refreshInterval = null;


// ==========================================
// DATA AI MATCH
// ==========================================

const activeMatchId = ref(null);
const isMatching = ref(false);
const matchedItems = ref([]);


// ==========================================
// FORMAT TANGGAL
// ==========================================

function formatDate(date) {

  if (!date) {
    return '-';
  }

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return '-';
  }

  return parsedDate.toLocaleDateString(
    'id-ID',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }
  );

}


// ==========================================
// AMBIL LAPORAN SAYA
// ==========================================

async function fetchMyReports(showLoading = false) {

  try {

    // Loading hanya ditampilkan saat pertama
    // kali masuk ke halaman
    if (showLoading) {
      loading.value = true;
    }

    // Ambil data user dari IndexedDB
    const userStr = await getItem('user');

    const user = JSON.parse(
      userStr || '{}'
    );

    if (!user.id) {

      console.error(
        'Data user tidak ditemukan'
      );

      reports.value = [];

      return;
    }


    // Ambil laporan milik user
    const response = await api.get(
      `/reports/user/${user.id}`
    );


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

  } finally {

    loading.value = false;

  }

}


// ==========================================
// AUTO REFRESH
// ==========================================

function startAutoRefresh() {

  // Hentikan interval lama terlebih dahulu
  stopAutoRefresh();


  // Refresh setiap 5 detik
  refreshInterval = setInterval(() => {

    fetchMyReports(false);

  }, 5000);

}


function stopAutoRefresh() {

  if (refreshInterval) {

    clearInterval(refreshInterval);

    refreshInterval = null;

  }

}


// ==========================================
// AI CARI KECOCOKAN
// ==========================================

async function findMatches(id) {

  // Jika tombol yang sama ditekan lagi
  if (
    activeMatchId.value === id &&
    !isMatching.value
  ) {

    matchedItems.value = [];

    activeMatchId.value = null;

    return;

  }


  activeMatchId.value = id;

  isMatching.value = true;

  matchedItems.value = [];


  try {

    const response = await api.get(
      `/matches/find/${id}`
    );


    console.log(
      'HASIL MATCH TAB 4:',
      response.data
    );


    matchedItems.value =
      response.data || [];


  } catch (error) {

    console.error(
      'Gagal mencari kecocokan:',
      error
    );

    matchedItems.value = [];


  } finally {

    isMatching.value = false;

  }

}


// ==========================================
// BUKA WHATSAPP
// ==========================================

function bukaWhatsApp(
  nomorHP,
  namaBarang
) {

  console.log(
    'Nomor WhatsApp dari hasil match:',
    nomorHP
  );


  if (
    !nomorHP ||
    nomorHP === '-'
  ) {

    alert(
      'Nomor WhatsApp tidak tersedia.'
    );

    return;

  }


  // Hanya menyisakan angka
  let cleanNumber = String(nomorHP)
    .replace(/\D/g, '');


  // 0821xxxx → 62821xxxx
  if (
    cleanNumber.startsWith('0')
  ) {

    cleanNumber =
      '62' +
      cleanNumber.substring(1);

  }


  const pesan =
    `Halo, saya melihat laporan "${namaBarang}" di LostFound.`;


  window.open(
    `https://wa.me/${cleanNumber}?text=${encodeURIComponent(pesan)}`,
    '_system'
  );

}


// ==========================================
// SAAT MASUK TAB4
// ==========================================

onIonViewWillEnter(async () => {

  // Ambil laporan terbaru
  await fetchMyReports(true);

  // Mulai auto refresh
  startAutoRefresh();

});


// ==========================================
// SAAT MENINGGALKAN TAB4
// ==========================================

onIonViewDidLeave(() => {

  // Hentikan auto refresh
  stopAutoRefresh();

});


// ==========================================
// SAAT COMPONENT DIHAPUS
// ==========================================

onUnmounted(() => {

  // Pastikan interval dihentikan
  stopAutoRefresh();

});

</script>

<style scoped>
.myreports-page {
  --background: #0f172a;
}

.bg-blobs {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
}

.blob-1 {
  width: 300px;
  height: 300px;
  background: #6366f1;
  top: -100px;
  right: -100px;
}

.page-header {
  padding: 50px 20px 24px;
  position: relative;
  z-index: 1;
}

.page-header h1 {
  margin: 0;
  color: #f8fafc;
  font-size: 1.8em;
  font-weight: 800;
}

.page-header p {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 0.9em;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  position: relative;
  z-index: 1;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p,
.empty-state p {
  color: #94a3b8;
  margin: 0 0 24px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px;
  color: #f8fafc;
  font-size: 1.3em;
}

.cta-btn {
  background: linear-gradient(
    135deg,
    #6366f1 0%,
    #8b5cf6 100%
  );

  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.95em;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  cursor: pointer;

  box-shadow:
    0 8px 20px rgba(99, 102, 241, 0.4);
}

.reports-list {
  padding: 0 20px 40px;

  display: flex;
  flex-direction: column;
  gap: 12px;

  position: relative;
  z-index: 1;
}

.report-card {
  background: rgba(30, 41, 59, 0.8);

  backdrop-filter: blur(20px);

  border: 1px solid rgba(255,255,255,0.08);

  border-radius: 20px;

  padding: 16px;

  display: flex;

  gap: 14px;

  cursor: pointer;

  transition: all 0.3s ease;
}

.report-card:active {
  transform: scale(0.98);
}

.card-type {
  width: 50px;
  height: 50px;

  border-radius: 14px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 24px;

  flex-shrink: 0;
}

.card-type.lost {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.card-type.found {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  margin-bottom: 6px;
}

.card-top h4 {
  margin: 0;

  color: #f8fafc;

  font-size: 1em;

  font-weight: 700;

  flex: 1;
}

.status-badge {
  padding: 4px 10px;

  border-radius: 10px;

  font-size: 0.7em;

  font-weight: 700;

  text-transform: uppercase;

  flex-shrink: 0;

  margin-left: 8px;
}

.status-badge.pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.status-badge.matched {
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
}

.status-badge.resolved {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.card-location {
  display: flex;
  align-items: center;

  gap: 4px;

  color: #6366f1;

  font-size: 0.8em;

  font-weight: 600;

  margin-bottom: 8px;
}

.card-location ion-icon {
  font-size: 14px;
}

.card-desc {
  margin: 0 0 10px;

  color: #94a3b8;

  font-size: 0.85em;

  line-height: 1.5;

  display: -webkit-box;

  -webkit-line-clamp: 2;

  -webkit-box-orient: vertical;

  overflow: hidden;
}

.card-date {
  display: flex;
  align-items: center;

  gap: 4px;

  color: #64748b;

  font-size: 0.75em;

  font-weight: 600;
}

.card-date ion-icon {
  font-size: 12px;
}

/* ================================
   TOMBOL AI MATCH
================================ */

.match-btn {
  width: 100%;

  margin-top: 14px;

  padding: 11px 14px;

  border: none;

  border-radius: 12px;

  background: linear-gradient(
    135deg,
    #6366f1,
    #8b5cf6
  );

  color: white;

  font-size: 0.85em;

  font-weight: 700;

  cursor: pointer;

  box-shadow:
    0 5px 15px rgba(99, 102, 241, 0.25);
}

.match-btn:active {
  transform: scale(0.98);
}

/* ================================
   HASIL MATCH
================================ */

.match-results {
  margin-top: 14px;

  padding: 12px;

  border-radius: 14px;

  background: rgba(15, 23, 42, 0.7);

  border: 1px solid rgba(99, 102, 241, 0.2);
}

.match-title {
  display: flex;

  align-items: center;

  gap: 7px;

  color: #f8fafc;

  font-size: 0.85em;

  margin-bottom: 10px;
}

.match-item {
  display: flex;

  align-items: center;

  gap: 10px;

  padding: 10px;

  margin-top: 8px;

  border-radius: 12px;

  background: rgba(30, 41, 59, 0.8);
}

.match-score {
  min-width: 45px;

  height: 45px;

  border-radius: 50%;

  display: flex;

  align-items: center;
  justify-content: center;

  background: rgba(99, 102, 241, 0.15);

  color: #818cf8;

  font-size: 0.75em;

  font-weight: 800;
}

.match-info {
  flex: 1;

  min-width: 0;
}

.match-info h5 {
  margin: 0 0 4px;

  color: #f8fafc;

  font-size: 0.85em;

  font-weight: 700;
}

.match-info p {
  margin: 0 0 5px;

  color: #94a3b8;

  font-size: 0.75em;

  line-height: 1.4;

  display: -webkit-box;

  -webkit-line-clamp: 2;

  -webkit-box-orient: vertical;

  overflow: hidden;
}

.match-info small {
  display: block;

  color: #64748b;

  font-size: 0.7em;

  margin-top: 2px;
}

/* ================================
   WHATSAPP
================================ */

.wa-btn {
  width: 40px;

  height: 40px;

  flex-shrink: 0;

  border: none;

  border-radius: 50%;

  background: #25D366;

  color: white;

  display: flex;

  align-items: center;
  justify-content: center;

  font-size: 20px;

  cursor: pointer;
}

.wa-btn:active {
  transform: scale(0.9);
}

/* ================================
   TIDAK ADA MATCH
================================ */

.no-match {
  margin-top: 12px;

  padding: 12px;

  border-radius: 12px;

  background: rgba(100, 116, 139, 0.1);

  color: #94a3b8;

  font-size: 0.8em;

  text-align: center;
}
</style>