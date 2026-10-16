<template>
  <ion-page>
    <ion-content :fullscreen="true" class="search-page">

      <div class="bg-blobs">
        <div class="blob blob-1"></div>
      </div>

      <!-- HEADER -->
      <div class="page-header">
        <h1>Cari Barang</h1>
        <p>Temukan barang hilang atau ditemukan</p>
      </div>

      <!-- SEARCH -->
      <div class="search-container">
        <div class="search-box">
          <ion-icon :icon="searchOutline"></ion-icon>

          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama, lokasi, atau deskripsi..."
          >

          <button
            v-if="searchQuery"
            class="clear-btn"
            @click="clearSearch"
          >
            <ion-icon :icon="closeOutline"></ion-icon>
          </button>
        </div>

        <!-- FILTER CHIPS -->
        <div class="filter-chips">

          <button
            class="chip"
            :class="{ active: filterType === 'all' }"
            @click="changeFilter('all')"
          >
            Semua
          </button>

          <button
            class="chip lost"
            :class="{ active: filterType === 'lost' }"
            @click="changeFilter('lost')"
          >
            <ion-icon :icon="sadOutline"></ion-icon>
            Hilang
          </button>

          <button
            class="chip found"
            :class="{ active: filterType === 'found' }"
            @click="changeFilter('found')"
          >
            <ion-icon :icon="happyOutline"></ion-icon>
            Ditemukan
          </button>

        </div>
      </div>

      <!-- RESULTS COUNT -->
      <div
        class="results-info"
        v-if="!loading"
      >
        <span>
          Ditemukan
          <strong>{{ filteredReports.length }}</strong>
          laporan
        </span>
      </div>

      <!-- RESULTS LIST -->
      <div
        v-if="!loading && filteredReports.length > 0"
        class="results-list"
      >

        <div
          v-for="report in filteredReports"
          :key="report.id"
          class="result-card"
          @click="goToDetail(report.id)"
        >

          <!-- ICON -->
          <div
            class="result-icon"
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

          <!-- BODY -->
          <div class="result-body">

            <h4>{{ report.name || 'Nama barang tidak tersedia' }}</h4>

            <div class="result-location">
              <ion-icon :icon="locationOutline"></ion-icon>
              {{ report.location || 'Lokasi tidak tersedia' }}
            </div>

            <p>
              {{ report.description || 'Tidak ada deskripsi' }}
            </p>

            <div class="result-footer">

              <span
                class="type-tag"
                :class="report.type"
              >
                {{
                  report.type === 'lost'
                    ? 'Hilang'
                    : 'Ditemukan'
                }}
              </span>

              <span class="date">
                {{ formatDate(report.created_at) }}
              </span>

            </div>

          </div>

        </div>

      </div>

      <!-- EMPTY STATE -->
      <div
        v-else-if="!loading"
        class="empty-state"
      >

        <div class="empty-icon">
          🔍
        </div>

        <h3>
          {{
            searchQuery
              ? 'Barang tidak ditemukan'
              : 'Tidak ada laporan'
          }}
        </h3>

        <p>
          {{
            searchQuery
              ? `Tidak ada barang yang cocok dengan "${searchQuery}"`
              : 'Belum ada laporan barang'
          }}
        </p>

      </div>

      <!-- LOADING -->
      <div
        v-if="loading"
        class="loading-state"
      >
        <div class="spinner"></div>
        <p>Memuat laporan...</p>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';

import {
  searchOutline,
  closeOutline,
  sadOutline,
  happyOutline,
  locationOutline
} from 'ionicons/icons';

import api from '../services/api';


// ======================================================
// DATA
// ======================================================

const allReports = ref([]);

const searchQuery = ref('');

const filterType = ref('all');

const loading = ref(true);


// ======================================================
// FORMAT TANGGAL
// ======================================================

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
      month: 'short'
    }
  );
}


// ======================================================
// NORMALISASI TEKS
// ======================================================

function normalizeText(value) {

  return String(value || '')
    .toLowerCase()
    .trim();

}


// ======================================================
// FILTER LAPORAN
// ======================================================

const filteredReports = computed(() => {

  const query = normalizeText(searchQuery.value);

  return allReports.value.filter(report => {

    // ----------------------------------------------
    // FILTER JENIS
    // ----------------------------------------------

    const matchType =
      filterType.value === 'all' ||
      normalizeText(report.type) === filterType.value;


    // ----------------------------------------------
    // FILTER PENCARIAN
    // ----------------------------------------------

    if (!query) {
      return matchType;
    }


    const name =
      normalizeText(report.name);

    const location =
      normalizeText(report.location);

    const description =
      normalizeText(report.description);


    const matchSearch =
      name.includes(query) ||
      location.includes(query) ||
      description.includes(query);


    return matchSearch && matchType;

  });

});


// ======================================================
// AMBIL DATA LAPORAN
// ======================================================

async function fetchReports() {

  loading.value = true;

  try {

    const response =
      await api.get('/reports');

    if (Array.isArray(response.data)) {

      allReports.value =
        response.data;

    } else {

      allReports.value = [];

      console.error(
        'Data laporan bukan array:',
        response.data
      );

    }

  } catch (error) {

    console.error(
      'Gagal mengambil laporan:',
      error
    );

    allReports.value = [];

  } finally {

    loading.value = false;

  }

}


// ======================================================
// CLEAR SEARCH
// ======================================================

function clearSearch() {

  searchQuery.value = '';

}


// ======================================================
// GANTI FILTER
// ======================================================

function changeFilter(type) {

  filterType.value = type;

}


// ======================================================
// BUKA DETAIL
// ======================================================

function goToDetail(id) {

  if (!id) {
    return;
  }

  window.location.href = `/detail/${id}`;

}


// ======================================================
// LOAD AWAL
// ======================================================

onMounted(() => {

  fetchReports();

});

</script>

<style scoped>

.search-page {
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
  background: #10b981;
  top: -100px;
  left: -100px;
}


/* ========================================
   HEADER
======================================== */

.page-header {
  padding: 50px 20px 20px;
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


/* ========================================
   SEARCH
======================================== */

.search-container {
  padding: 0 20px;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;

  background: rgba(30, 41, 59, 0.8);

  border: 2px solid rgba(255,255,255,0.08);

  border-radius: 16px;

  padding: 14px 18px;

  margin-bottom: 16px;

  transition: all 0.3s;
}

.search-box:focus-within {

  border-color: #6366f1;

  background: rgba(30, 41, 59, 1);

}

.search-box ion-icon {

  color: #94a3b8;

  font-size: 20px;

}

.search-box input {

  flex: 1;

  background: transparent;

  border: none;

  color: #f8fafc;

  font-size: 0.95em;

  outline: none;

}

.search-box input::placeholder {

  color: #64748b;

}


/* ========================================
   CLEAR BUTTON
======================================== */

.clear-btn {

  background: rgba(255,255,255,0.1);

  border: none;

  width: 28px;
  height: 28px;

  border-radius: 8px;

  color: #f8fafc;

  display: flex;

  align-items: center;

  justify-content: center;

  cursor: pointer;

}


/* ========================================
   FILTER CHIPS
======================================== */

.filter-chips {

  display: flex;

  gap: 10px;

  overflow-x: auto;

  padding-bottom: 4px;

}

.chip {

  background: rgba(30, 41, 59, 0.8);

  border: 1px solid rgba(255,255,255,0.08);

  color: #94a3b8;

  padding: 10px 18px;

  border-radius: 14px;

  font-weight: 600;

  font-size: 0.85em;

  display: flex;

  align-items: center;

  gap: 6px;

  cursor: pointer;

  white-space: nowrap;

  transition: all 0.3s;

}

.chip ion-icon {

  font-size: 16px;

}

.chip.active {

  background: linear-gradient(
    135deg,
    #6366f1 0%,
    #8b5cf6 100%
  );

  color: white;

  border-color: transparent;

}

.chip.lost.active {

  background: linear-gradient(
    135deg,
    #ef4444 0%,
    #f87171 100%
  );

}

.chip.found.active {

  background: linear-gradient(
    135deg,
    #10b981 0%,
    #34d399 100%
  );

}


/* ========================================
   RESULTS INFO
======================================== */

.results-info {

  padding: 0 20px 12px;

  color: #94a3b8;

  font-size: 0.85em;

  position: relative;

  z-index: 1;

}

.results-info strong {

  color: #f8fafc;

}


/* ========================================
   RESULTS LIST
======================================== */

.results-list {

  padding: 0 20px 40px;

  display: flex;

  flex-direction: column;

  gap: 12px;

  position: relative;

  z-index: 1;

}

.result-card {

  background: rgba(30, 41, 59, 0.8);

  backdrop-filter: blur(20px);

  border: 1px solid rgba(255,255,255,0.08);

  border-radius: 20px;

  padding: 16px;

  display: flex;

  gap: 14px;

  cursor: pointer;

  transition: all 0.3s;

}

.result-card:active {

  transform: scale(0.98);

}


/* ========================================
   RESULT ICON
======================================== */

.result-icon {

  width: 50px;
  height: 50px;

  border-radius: 14px;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 24px;

  flex-shrink: 0;

}

.result-icon.lost {

  background: rgba(239, 68, 68, 0.15);

  color: #ef4444;

}

.result-icon.found {

  background: rgba(16, 185, 129, 0.15);

  color: #10b981;

}


/* ========================================
   RESULT BODY
======================================== */

.result-body {

  flex: 1;

  min-width: 0;

}

.result-body h4 {

  margin: 0 0 6px;

  color: #f8fafc;

  font-size: 1em;

  font-weight: 700;

}

.result-location {

  display: flex;

  align-items: center;

  gap: 4px;

  color: #6366f1;

  font-size: 0.8em;

  font-weight: 600;

  margin-bottom: 8px;

}

.result-location ion-icon {

  font-size: 14px;

}

.result-body p {

  margin: 0 0 10px;

  color: #94a3b8;

  font-size: 0.85em;

  line-height: 1.5;

  display: -webkit-box;

  -webkit-line-clamp: 2;

  -webkit-box-orient: vertical;

  overflow: hidden;

}


/* ========================================
   FOOTER
======================================== */

.result-footer {

  display: flex;

  justify-content: space-between;

  align-items: center;

}

.type-tag {

  padding: 4px 10px;

  border-radius: 10px;

  font-size: 0.7em;

  font-weight: 700;

  text-transform: uppercase;

}

.type-tag.lost {

  background: rgba(239, 68, 68, 0.15);

  color: #ef4444;

}

.type-tag.found {

  background: rgba(16, 185, 129, 0.15);

  color: #10b981;

}

.date {

  color: #64748b;

  font-size: 0.75em;

  font-weight: 600;

}


/* ========================================
   EMPTY / LOADING
======================================== */

.empty-state,
.loading-state {

  text-align: center;

  padding: 60px 20px;

  position: relative;

  z-index: 1;

}

.empty-icon {

  font-size: 60px;

  margin-bottom: 16px;

}

.empty-state h3,
.loading-state p {

  margin: 0 0 8px;

  color: #f8fafc;

  font-size: 1.2em;

}

.empty-state p {

  margin: 0;

  color: #94a3b8;

}


/* ========================================
   SPINNER
======================================== */

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

</style>