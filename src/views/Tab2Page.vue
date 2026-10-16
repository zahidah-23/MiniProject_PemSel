<template>
  <ion-page>
    <ion-content :fullscreen="true" class="add-page">
      
      <div class="bg-blobs">
        <div class="blob blob-1"></div>
      </div>

      <div class="page-header">
        <h1>Tambah Laporan</h1>
        <p>Ceritakan barang Anda dengan detail</p>
      </div>

      <div class="form-container">
        <!-- Type Selector -->
        <div class="type-selector">
          <button class="type-btn" :class="{ active: form.type === 'lost', lost: form.type === 'lost' }" @click="form.type = 'lost'">
            <ion-icon :icon="sadOutline"></ion-icon>
            <span>Barang Hilang</span>
          </button>
          <button class="type-btn" :class="{ active: form.type === 'found', found: form.type === 'found' }" @click="form.type = 'found'">
            <ion-icon :icon="happyOutline"></ion-icon>
            <span>Barang Ditemukan</span>
          </button>
        </div>

        <!-- Form Fields -->
        <div class="input-group">
          <label>
            <ion-icon :icon="cubeOutline"></ion-icon>
            Nama Barang
          </label>
          <input v-model="form.name" placeholder="Contoh: Dompet Hitam">
        </div>

        <div class="input-group">
          <label>
            <ion-icon :icon="locationOutline"></ion-icon>
            Lokasi
          </label>
          <input v-model="form.location" placeholder="Contoh: Kantin Gedung B">
        </div>

        <div class="input-group">
          <label>
            <ion-icon :icon="documentTextOutline"></ion-icon>
            Deskripsi Detail
          </label>
          <textarea v-model="form.description" rows="4" placeholder="Deskripsikan ciri-ciri barang untuk AI matching..."></textarea>
        </div>

        <div v-if="errorMessage" class="error-msg">
          <ion-icon :icon="alertCircleOutline"></ion-icon>
          {{ errorMessage }}
        </div>

        <button class="submit-btn" @click="submitReport" :disabled="!isValid || isSubmitting">
          <ion-icon :icon="sendOutline"></ion-icon>
          {{ isSubmitting ? 'Menyimpan...' : 'Simpan Laporan' }}
        </button>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { 
  sadOutline, happyOutline, cubeOutline, locationOutline, 
  documentTextOutline, alertCircleOutline, sendOutline 
} from 'ionicons/icons';
import api from '../services/api';
import { getItem } from '../services/idb';

const router = useRouter();
const isSubmitting = ref(false);
const errorMessage = ref('');

const form = ref({
  type: 'lost',
  name: '',
  location: '',
  description: ''
});

const isValid = computed(() => 
  form.value.name.trim() && form.value.location.trim() && form.value.description.trim()
);

async function submitReport() {
  if (!isValid.value) {
    errorMessage.value = 'Semua field wajib diisi!';
    return;
  }
  
  isSubmitting.value = true;
  errorMessage.value = '';
  
  try {
    const userStr = await getItem('user');
    const user = JSON.parse(userStr || '{"id":1}');
    await api.post('/reports', { ...form.value, user_id: user.id });
    
    form.value = { type: 'lost', name: '', location: '', description: '' };
    alert('✅ Laporan berhasil disimpan!');
    router.push('/tabs/tab1');
  } catch (error) {
    errorMessage.value = 'Gagal menyimpan laporan';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.add-page {
  --background: #0f172a;
}

.bg-blobs {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
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
  width: 300px; height: 300px;
  background: #6366f1;
  top: -100px; right: -100px;
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

.form-container {
  padding: 0 20px 40px;
  position: relative;
  z-index: 1;
}

.type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.type-btn {
  background: rgba(30, 41, 59, 0.8);
  border: 2px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.type-btn ion-icon {
  font-size: 28px;
}

.type-btn.lost.active {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  color: #ef4444;
}

.type-btn.found.active {
  background: rgba(16, 185, 129, 0.15);
  border-color: #10b981;
  color: #10b981;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 0.8em;
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-group label ion-icon {
  color: #6366f1;
  font-size: 16px;
}

.input-group input,
.input-group textarea {
  width: 100%;
  padding: 14px 16px;
  background: rgba(30, 41, 59, 0.8);
  border: 2px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  color: #f8fafc;
  font-size: 0.95em;
  font-family: inherit;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.input-group input:focus,
.input-group textarea:focus {
  outline: none;
  border-color: #6366f1;
  background: rgba(30, 41, 59, 1);
}

.input-group input::placeholder,
.input-group textarea::placeholder {
  color: #64748b;
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 0.9em;
  font-weight: 600;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
  transition: all 0.3s ease;
}

.submit-btn:active {
  transform: scale(0.97);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>