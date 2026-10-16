<template>
  <ion-page>
    <ion-content :fullscreen="true" class="premium-detail">

      <!-- ========================================
           BACKGROUND DECORATION
           ======================================== -->
      <div class="bg-decoration">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="blob blob-3"></div>
      </div>


      <!-- ========================================
           HERO SECTION
           ======================================== -->
      <div
        class="hero-section"
        :class="report?.type"
      >

        <div class="hero-pattern"></div>

        <!-- Tombol Kembali -->
        <ion-buttons
          slot="start"
          class="back-btn-wrapper"
        >
          <ion-back-button
            default-href="/tabs/tab1"
            color="light"
            text=""
          ></ion-back-button>
        </ion-buttons>


        <div class="hero-content">

          <div
            class="hero-badge"
            :class="report?.type"
          >
            <ion-icon
              :icon="
                report?.type === 'lost'
                  ? sadOutline
                  : happyOutline
              "
            ></ion-icon>
          </div>


          <h1 class="hero-title">
            {{ report?.name || 'Memuat...' }}
          </h1>


          <div class="hero-status-row">

            <div class="status-pill type">

              <span class="dot"></span>

              {{
                report?.type === 'lost'
                  ? 'Barang Hilang'
                  : 'Ditemukan'
              }}

            </div>


            <div
              class="status-pill"
              :class="report?.status"
            >
              {{ report?.status?.toUpperCase() }}
            </div>

          </div>

        </div>


        <!-- Floating Stats -->
        <div class="floating-stats">

          <div class="stat-item">

            <ion-icon
              :icon="timeOutline"
            ></ion-icon>

            <span>
              {{ formatDate(report?.created_at) }}
            </span>

          </div>

        </div>

      </div>


      <!-- ========================================
           LOADING STATE
           ======================================== -->
      <div
        v-if="loading"
        class="skeleton-container"
      >

        <div class="skeleton-card"></div>

        <div class="skeleton-card short"></div>

      </div>


      <!-- ========================================
           MAIN CONTENT
           ======================================== -->
      <div
        v-else-if="report"
        class="content-wrapper"
      >

        <!-- ========================================
             INFO CARDS
             ======================================== -->
        <div class="info-cards">

          <!-- Lokasi -->
          <div class="glass-card location-card">

            <div class="card-icon-wrapper location">

              <ion-icon
                :icon="locationOutline"
              ></ion-icon>

            </div>


            <div class="card-content">

              <span class="card-label">
                Lokasi
              </span>

              <span class="card-value">
                {{ report.location }}
              </span>

            </div>

          </div>


          <!-- Tanggal -->
          <div class="glass-card date-card">

            <div class="card-icon-wrapper date">

              <ion-icon
                :icon="calendarOutline"
              ></ion-icon>

            </div>


            <div class="card-content">

              <span class="card-label">
                Dilaporkan
              </span>

              <span class="card-value">
                {{ formatFullDate(report.created_at) }}
              </span>

            </div>

          </div>

        </div>


        <!-- ========================================
             DESCRIPTION CARD
             ======================================== -->
        <div class="description-card">

          <div class="card-header-row">

            <div class="header-icon">

              <ion-icon
                :icon="documentTextOutline"
              ></ion-icon>

            </div>

            <h3>
              Deskripsi Barang
            </h3>

          </div>


          <p class="description-text">
            {{ report.description }}
          </p>

        </div>


        <!-- ========================================
             ACTION BUTTON
             HANYA EDIT
             ======================================== -->
        <div class="action-buttons-container">

          <button
            class="action-btn edit-btn"
            @click="showEditForm = !showEditForm"
          >

            <div class="btn-icon">

              <ion-icon
                :icon="createOutline"
              ></ion-icon>

            </div>

            <span>
              {{
                showEditForm
                  ? 'Tutup'
                  : 'Edit'
              }}
            </span>

          </button>

        </div>


        <!-- ========================================
             EDIT FORM
             ======================================== -->
        <div
          v-if="showEditForm"
          class="edit-form-container"
        >

          <div class="form-header">

            <h3>
              ✏️ Edit Laporan
            </h3>

          </div>


          <!-- Nama Barang -->
          <div class="form-group">

            <label>
              Nama Barang
            </label>

            <input
              v-model="editForm.name"
              type="text"
              placeholder="Masukkan nama barang"
            >

          </div>


          <!-- Lokasi -->
          <div class="form-group">

            <label>
              Lokasi
            </label>

            <input
              v-model="editForm.location"
              type="text"
              placeholder="Lokasi barang"
            >

          </div>


          <!-- Deskripsi -->
          <div class="form-group">

            <label>
              Deskripsi
            </label>

            <textarea
              v-model="editForm.description"
              rows="3"
              placeholder="Deskripsi detail"
            ></textarea>

          </div>


          <!-- Status -->
          <div class="form-group">

            <label>
              Status
            </label>

            <select
              v-model="editForm.status"
            >

              <option value="pending">
                ⏳ Pending
              </option>

              <option value="matched">
                Matched
              </option>

              <option value="resolved">
                ✅ Resolved
              </option>

            </select>

          </div>


          <!-- Simpan -->
          <button
            class="save-btn"
            @click="updateReport"
          >

            <ion-icon
              :icon="checkmarkOutline"
            ></ion-icon>

            Simpan Perubahan

          </button>

        </div>

      </div>


      <!-- ========================================
           ERROR STATE
           ======================================== -->
      <div
        v-else
        class="error-state-premium"
      >

        <div class="error-icon-wrapper">

          <ion-icon
            :icon="alertCircleOutline"
          ></ion-icon>

        </div>


        <h3>
          Data Tidak Ditemukan
        </h3>


        <p>
          Laporan yang Anda cari tidak ada
          dalam sistem.
        </p>

      </div>

    </ion-content>
  </ion-page>
</template>


<script setup>

import {
  ref,
  onMounted
} from 'vue';

import {
  useRoute
} from 'vue-router';

import {
  IonPage,
  IonContent,
  IonButtons,
  IonBackButton,
  IonIcon
} from '@ionic/vue';

import {
  locationOutline,
  calendarOutline,
  documentTextOutline,
  sadOutline,
  happyOutline,
  createOutline,
  alertCircleOutline,
  timeOutline,
  checkmarkOutline
} from 'ionicons/icons';

import api from '../services/api';


// ========================================
// ROUTE
// ========================================

const route = useRoute();


// ========================================
// DATA
// ========================================

const report = ref(null);

const loading = ref(true);

const showEditForm = ref(false);


// ========================================
// EDIT FORM
// ========================================

const editForm = ref({

  name: '',

  location: '',

  description: '',

  status: 'pending'

});


// ========================================
// FORMAT TANGGAL SINGKAT
// ========================================

function formatDate(date) {

  if (!date) {
    return '-';
  }

  return new Date(date).toLocaleDateString(
    'id-ID',
    {
      day: 'numeric',
      month: 'short'
    }
  );

}


// ========================================
// FORMAT TANGGAL LENGKAP
// ========================================

function formatFullDate(date) {

  if (!date) {
    return '-';
  }

  return new Date(date).toLocaleDateString(
    'id-ID',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }
  );

}


// ========================================
// AMBIL DATA LAPORAN
// ========================================

async function fetchReport() {

  try {

    const response =
      await api.get(
        `/reports/${route.params.id}`
      );

    report.value =
      response.data;


    // Isi form edit
    editForm.value = {

      name:
        report.value.name,

      location:
        report.value.location,

      description:
        report.value.description,

      status:
        report.value.status

    };

  } catch (error) {

    console.error(
      'Gagal memuat laporan:',
      error
    );

  } finally {

    loading.value = false;

  }

}


// ========================================
// UPDATE LAPORAN
// ========================================

async function updateReport() {

  try {

    await api.put(
      `/reports/${route.params.id}`,
      editForm.value
    );


    alert(
      '✅ Laporan berhasil diupdate!'
    );


    showEditForm.value = false;


    await fetchReport();

  } catch (error) {

    console.error(
      'Gagal mengupdate laporan:',
      error
    );

    alert(
      '❌ Gagal mengupdate laporan'
    );

  }

}


// ========================================
// ON MOUNTED
// ========================================

onMounted(() => {

  fetchReport();

});

</script>


<style scoped>

/* ========================================
   BASE STYLING & ANIMATIONS
   ======================================== */

.premium-detail {

  --background: #0f172a;

  --color: #f8fafc;

  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;

}


@keyframes float {

  0%,
  100% {

    transform:
      translate(0, 0)
      scale(1);

  }

  33% {

    transform:
      translate(30px, -50px)
      scale(1.1);

  }

  66% {

    transform:
      translate(-20px, 20px)
      scale(0.9);

  }

}


@keyframes fadeInUp {

  from {

    opacity: 0;

    transform:
      translateY(30px);

  }

  to {

    opacity: 1;

    transform:
      translateY(0);

  }

}


@keyframes pulse {

  0%,
  100% {

    transform:
      scale(1);

    opacity: 1;

  }

  50% {

    transform:
      scale(1.05);

    opacity: 0.8;

  }

}


@keyframes shimmer {

  0% {

    background-position:
      -200% 0;

  }

  100% {

    background-position:
      200% 0;

  }

}


/* ========================================
   BACKGROUND DECORATION
   ======================================== */

.bg-decoration {

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

  animation:
    float 20s
    ease-in-out
    infinite;

}


.blob-1 {

  width: 400px;

  height: 400px;

  background: #6366f1;

  top: -100px;

  left: -100px;

}


.blob-2 {

  width: 350px;

  height: 350px;

  background: #8b5cf6;

  bottom: -100px;

  right: -100px;

  animation-delay: 5s;

}


.blob-3 {

  width: 300px;

  height: 300px;

  background: #ec4899;

  top: 50%;

  left: 50%;

  animation-delay: 10s;

}


/* ========================================
   HERO SECTION
   ======================================== */

.hero-section {

  position: relative;

  padding:
    50px 20px 40px;

  border-radius:
    0 0 40px 40px;

  overflow: hidden;

  animation:
    fadeInUp 0.8s ease-out;

}


.hero-section.lost {

  background:
    linear-gradient(
      135deg,
      #dc2626 0%,
      #ef4444 50%,
      #f87171 100%
    );

}


.hero-section.found {

  background:
    linear-gradient(
      135deg,
      #059669 0%,
      #10b981 50%,
      #34d399 100%
    );

}


.hero-pattern {

  position: absolute;

  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  background-image:
    radial-gradient(
      circle at 20% 50%,
      rgba(255,255,255,0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 80%,
      rgba(255,255,255,0.1) 0%,
      transparent 50%
    );

  pointer-events: none;

}


.back-btn-wrapper {

  position: absolute;

  top: 20px;

  left: 10px;

  z-index: 10;

}


.hero-content {

  text-align: center;

  color: white;

  position: relative;

  z-index: 1;

}


.hero-badge {

  width: 90px;

  height: 90px;

  margin:
    0 auto 20px;

  background:
    rgba(255,255,255,0.2);

  backdrop-filter:
    blur(20px);

  border-radius: 50%;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 45px;

  border:
    3px solid
    rgba(255,255,255,0.3);

  box-shadow:
    0 10px 40px
    rgba(0,0,0,0.2);

  animation:
    pulse 3s
    ease-in-out
    infinite;

}


.hero-title {

  font-size: 2em;

  font-weight: 800;

  margin:
    0 0 20px;

  text-shadow:
    0 2px 10px
    rgba(0,0,0,0.2);

  letter-spacing:
    -0.5px;

}


.hero-status-row {

  display: flex;

  justify-content:
    center;

  gap: 12px;

  flex-wrap:
    wrap;

}


.status-pill {

  padding:
    8px 16px;

  border-radius:
    20px;

  font-size:
    0.8em;

  font-weight:
    700;

  display: flex;

  align-items:
    center;

  gap:
    6px;

  backdrop-filter:
    blur(10px);

}


.status-pill.type {

  background:
    rgba(255,255,255,0.2);

  color:
    white;

}


.status-pill .dot {

  width: 8px;

  height: 8px;

  border-radius: 50%;

  background:
    currentColor;

}


.status-pill.pending {

  background:
    rgba(251,191,36,0.9);

  color:
    #78350f;

}


.status-pill.matched {

  background:
    rgba(99,102,241,0.9);

  color:
    white;

}


.status-pill.resolved {

  background:
    rgba(16,185,129,0.9);

  color:
    white;

}


.floating-stats {

  position: absolute;

  bottom: -25px;

  left: 50%;

  transform:
    translateX(-50%);

  background:
    rgba(15,23,42,0.9);

  backdrop-filter:
    blur(20px);

  padding:
    12px 24px;

  border-radius:
    30px;

  display: flex;

  align-items:
    center;

  gap:
    8px;

  color:
    white;

  font-size:
    0.85em;

  font-weight:
    600;

  box-shadow:
    0 10px 30px
    rgba(0,0,0,0.3);

  border:
    1px solid
    rgba(255,255,255,0.1);

}


/* ========================================
   CONTENT WRAPPER
   ======================================== */

.content-wrapper {

  position: relative;

  z-index: 1;

  padding:
    40px 20px 20px;

}


/* ========================================
   INFO CARDS
   ======================================== */

.info-cards {

  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap:
    12px;

  margin-bottom:
    16px;

  animation:
    fadeInUp 0.8s
    ease-out 0.2s
    backwards;

}


.glass-card {

  background:
    rgba(30,41,59,0.7);

  backdrop-filter:
    blur(20px);

  border:
    1px solid
    rgba(255,255,255,0.1);

  border-radius:
    20px;

  padding:
    16px;

  display: flex;

  align-items:
    center;

  gap:
    12px;

  transition:
    all 0.3s ease;

}


.glass-card:active {

  transform:
    scale(0.95);

}


.card-icon-wrapper {

  width: 45px;

  height: 45px;

  border-radius:
    14px;

  display: flex;

  align-items:
    center;

  justify-content:
    center;

  font-size:
    22px;

  flex-shrink:
    0;

}


.card-icon-wrapper.location {

  background:
    linear-gradient(
      135deg,
      #3b82f6 0%,
      #60a5fa 100%
    );

  color:
    white;

}


.card-icon-wrapper.date {

  background:
    linear-gradient(
      135deg,
      #a855f7 0%,
      #c084fc 100%
    );

  color:
    white;

}


.card-content {

  display: flex;

  flex-direction:
    column;

  flex: 1;

  min-width:
    0;

}


.card-label {

  font-size:
    0.7em;

  color:
    #94a3b8;

  font-weight:
    600;

  text-transform:
    uppercase;

  letter-spacing:
    0.5px;

  margin-bottom:
    4px;

}


.card-value {

  font-size:
    0.9em;

  color:
    #f8fafc;

  font-weight:
    700;

  white-space:
    nowrap;

  overflow:
    hidden;

  text-overflow:
    ellipsis;

}


/* ========================================
   DESCRIPTION CARD
   ======================================== */

.description-card {

  background:
    rgba(30,41,59,0.7);

  backdrop-filter:
    blur(20px);

  border:
    1px solid
    rgba(255,255,255,0.1);

  border-radius:
    20px;

  padding:
    20px;

  margin-bottom:
    16px;

  animation:
    fadeInUp 0.8s
    ease-out 0.3s
    backwards;

}


.card-header-row {

  display: flex;

  align-items:
    center;

  gap:
    12px;

  margin-bottom:
    12px;

}


.header-icon {

  width: 40px;

  height: 40px;

  background:
    linear-gradient(
      135deg,
      #f59e0b 0%,
      #fbbf24 100%
    );

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


.description-card h3 {

  margin:
    0;

  font-size:
    1.1em;

  color:
    #f8fafc;

  font-weight:
    700;

}


.description-text {

  margin:
    0;

  color:
    #cbd5e1;

  line-height:
    1.7;

  font-size:
    0.95em;

}


/* ========================================
   ACTION BUTTON
   HANYA EDIT
   ======================================== */

.action-buttons-container {

  display: grid;

  grid-template-columns:
    1fr;

  gap:
    12px;

  margin-bottom:
    16px;

  animation:
    fadeInUp 0.8s
    ease-out 0.4s
    backwards;

}


.action-btn {

  border:
    none;

  padding:
    16px;

  border-radius:
    16px;

  font-weight:
    700;

  font-size:
    0.9em;

  display: flex;

  align-items:
    center;

  justify-content:
    center;

  gap:
    8px;

  cursor:
    pointer;

  transition:
    all 0.3s ease;

  position:
    relative;

  overflow:
    hidden;

  color:
    white;

}


.action-btn:active {

  transform:
    scale(0.95);

}


.edit-btn {

  background:
    rgba(71,85,105,0.8);

  backdrop-filter:
    blur(10px);

  border:
    1px solid
    rgba(255,255,255,0.1);

}


.btn-icon {

  width: 32px;

  height: 32px;

  background:
    rgba(255,255,255,0.2);

  border-radius:
    10px;

  display: flex;

  align-items:
    center;

  justify-content:
    center;

  font-size:
    18px;

}


/* ========================================
   EDIT FORM
   ======================================== */

.edit-form-container {

  background:
    rgba(30,41,59,0.9);

  backdrop-filter:
    blur(20px);

  border:
    1px solid
    rgba(255,255,255,0.1);

  border-radius:
    20px;

  padding:
    24px;

  margin-bottom:
    16px;

  animation:
    fadeInUp 0.5s
    ease-out;

}


.form-header h3 {

  margin:
    0 0 20px;

  color:
    #f8fafc;

  font-size:
    1.2em;

}


.form-group {

  margin-bottom:
    16px;

}


.form-group label {

  display:
    block;

  font-size:
    0.8em;

  color:
    #94a3b8;

  font-weight:
    600;

  margin-bottom:
    8px;

  text-transform:
    uppercase;

  letter-spacing:
    0.5px;

}


.form-group input,
.form-group textarea,
.form-group select {

  width:
    100%;

  padding:
    14px;

  background:
    rgba(15,23,42,0.8);

  border:
    2px solid
    rgba(255,255,255,0.1);

  border-radius:
    12px;

  color:
    #f8fafc;

  font-size:
    0.95em;

  font-family:
    inherit;

  transition:
    all 0.3s ease;

  box-sizing:
    border-box;

}


.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {

  outline:
    none;

  border-color:
    #6366f1;

  background:
    rgba(15,23,42,1);

}


.save-btn {

  width:
    100%;

  padding:
    16px;

  background:
    linear-gradient(
      135deg,
      #10b981 0%,
      #34d399 100%
    );

  color:
    white;

  border:
    none;

  border-radius:
    14px;

  font-weight:
    700;

  font-size:
    1em;

  cursor:
    pointer;

  display: flex;

  align-items:
    center;

  justify-content:
    center;

  gap:
    8px;

  transition:
    all 0.3s ease;

  box-shadow:
    0 8px 20px
    rgba(16,185,129,0.3);

}


.save-btn:active {

  transform:
    scale(0.97);

}


/* ========================================
   SKELETON LOADING
   ======================================== */

.skeleton-container {

  padding:
    40px 20px;

}


.skeleton-card {

  background:
    linear-gradient(
      90deg,
      rgba(30,41,59,0.7) 25%,
      rgba(51,65,85,0.7) 50%,
      rgba(30,41,59,0.7) 75%
    );

  background-size:
    200% 100%;

  animation:
    shimmer 1.5s infinite;

  border-radius:
    20px;

  height:
    120px;

  margin-bottom:
    16px;

}


.skeleton-card.short {

  height:
    80px;

}


/* ========================================
   ERROR STATE
   ======================================== */

.error-state-premium {

  display: flex;

  flex-direction:
    column;

  align-items:
    center;

  justify-content:
    center;

  height:
    60vh;

  text-align:
    center;

  padding:
    20px;

}


.error-icon-wrapper {

  width:
    100px;

  height:
    100px;

  background:
    rgba(239,68,68,0.1);

  border-radius:
    50%;

  display: flex;

  align-items:
    center;

  justify-content:
    center;

  font-size:
    50px;

  color:
    #ef4444;

  margin-bottom:
    20px;

}


.error-state-premium h3 {

  margin:
    0 0 8px;

  color:
    #f8fafc;

  font-size:
    1.3em;

}


.error-state-premium p {

  margin:
    0;

  color:
    #94a3b8;

  font-size:
    0.95em;

}

</style>