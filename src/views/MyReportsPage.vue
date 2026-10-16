<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/tab1"></ion-back-button>
        </ion-buttons>
        <ion-title>Laporan Saya</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div v-if="loading" class="ion-text-center ion-padding">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Memuat laporan...</p>
      </div>

      <div v-else-if="reports.length === 0" class="ion-text-center ion-padding">
        <ion-icon :icon="folderOpenOutline" size="large" color="medium"></ion-icon>
        <p>Anda belum memiliki laporan</p>
        <ion-button fill="clear" @click="$router.push('/tabs/tab1')">
          Buat Laporan Pertama
        </ion-button>
      </div>

      <ion-list v-else>
        <ion-item-sliding v-for="report in reports" :key="report.id">
          <ion-item button @click="$router.push(`/detail/${report.id}`)">
            <ion-icon 
              :icon="report.type === 'lost' ? sadOutline : happyOutline" 
              slot="start" 
              :color="report.type === 'lost' ? 'danger' : 'success'"
              size="large"
            ></ion-icon>
            <ion-label>
              <h2>{{ report.name }}</h2>
              <p>📍 {{ report.location }}</p>
              <ion-badge :color="getStatusColor(report.status)">
                {{ report.status }}
              </ion-badge>
            </ion-label>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option color="danger" @click="deleteReport(report.id)">
              Hapus
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton,
  IonList, IonItem, IonItemSliding, IonItemOptions, IonItemOption,
  IonLabel, IonIcon, IonBadge, IonButton, IonSpinner
} from '@ionic/vue';
import { sadOutline, happyOutline, folderOpenOutline } from 'ionicons/icons';
import api from '../services/api';
import { getItem } from '../services/idb';

const reports = ref([]);
const loading = ref(true);

function getStatusColor(status) {
  const colors = { pending: 'warning', matched: 'primary', resolved: 'success' };
  return colors[status] || 'medium';
}

async function fetchMyReports() {
  const userStr = await getItem('user');
  const user = JSON.parse(userStr || '{"id":1}');
  try {
    const response = await api.get(`/reports/user/${user.id}`);
    reports.value = response.data;
  } catch (error) {
    console.error('Gagal memuat laporan:', error);
  } finally {
    loading.value = false;
  }
}

async function deleteReport(id) {
  if (confirm('Yakin ingin menghapus?')) {
    try {
      await api.delete(`/reports/${id}`);
      fetchMyReports();
    } catch (error) {
      alert('Gagal menghapus');
    }
  }
}

onMounted(() => {
  fetchMyReports();
});
</script>