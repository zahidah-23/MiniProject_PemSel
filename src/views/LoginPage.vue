<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-content">
      <div class="login-container">
        <!-- Animated Background Shapes -->
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>
        <div class="bg-shape shape-3"></div>

        <div class="logo-section">
          <div class="logo-icon">
            <ion-icon :icon="searchOutline"></ion-icon>
          </div>
          <h1>LostFound</h1>
          <p>Temukan barang hilangmu di sini</p>
        </div>

        <ion-card class="glass-card">
          <ion-card-content>
            <ion-segment v-model="authMode" class="custom-segment">
              <ion-segment-button value="login">
                <ion-label class="segment-label">Masuk</ion-label>
              </ion-segment-button>
              <ion-segment-button value="register">
                <ion-label class="segment-label">Daftar</ion-label>
              </ion-segment-button>
            </ion-segment>

            <!-- Form Login -->
            <div v-if="authMode === 'login'" class="form-container">
              <div class="input-wrapper">
                <ion-icon :icon="mailOutline" class="input-icon"></ion-icon>
                <ion-input v-model="loginForm.email" type="email" placeholder="Email" class="custom-input"></ion-input>
              </div>
              <div class="input-wrapper">
                <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
                <ion-input v-model="loginForm.password" type="password" placeholder="Password" class="custom-input"></ion-input>
              </div>
              <ion-button expand="block" class="btn-primary" @click="handleLogin" :disabled="isProcessing">
                <span v-if="!isProcessing">Masuk</span>
                <ion-spinner v-else name="crescent" size="small"></ion-spinner>
              </ion-button>
            </div>

            <!-- Form Register -->
<div v-else class="form-container">
  <div class="input-wrapper">
    <ion-icon :icon="personOutline" class="input-icon"></ion-icon>
    <ion-input v-model="registerForm.username" placeholder="Username" class="custom-input"></ion-input>
  </div>
  
  <div class="input-wrapper">
    <ion-icon :icon="mailOutline" class="input-icon"></ion-icon>
    <ion-input v-model="registerForm.email" type="email" placeholder="Email" class="custom-input"></ion-input>
  </div>

  <!-- TAMBAHKAN KODE INI UNTUK NOMOR HP 👇 -->
  <div class="input-wrapper">
    <ion-icon :icon="callOutline" class="input-icon"></ion-icon>
    <ion-input v-model="registerForm.phone" type="tel" placeholder="Nomor HP (08xx)" class="custom-input"></ion-input>
  </div>
  <!-- AKHIR KODE NOMOR HP 👆 -->

  <div class="input-wrapper">
    <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
    <ion-input v-model="registerForm.password" type="password" placeholder="Password" class="custom-input"></ion-input>
  </div>
  
  <ion-button expand="block" class="btn-primary" @click="handleRegister" :disabled="isProcessing">
    {{ isProcessing ? 'Memproses...' : 'Daftar Akun' }}
  </ion-button>
</div>

            <div v-if="errorMessage" class="error-message">
              <ion-icon :icon="alertCircleOutline"></ion-icon>
              {{ errorMessage }}
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonContent, IonCard, IonCardContent,
  IonInput, IonIcon, IonButton, IonSegment,
  IonSegmentButton, IonLabel, IonSpinner
} from '@ionic/vue';
import { searchOutline, mailOutline, lockClosedOutline, personOutline, alertCircleOutline, callOutline } from 'ionicons/icons';
import api from '../services/api';
import { setItem } from '../services/idb';

const router = useRouter();
const authMode = ref('login');
const isProcessing = ref(false);
const errorMessage = ref('');
const loginForm = ref({ email: '', password: '' });
const registerForm = ref({ username: '', email: '', password: '', phone: ''});

async function handleLogin() {
  if (!loginForm.value.email || !loginForm.value.password) {
    errorMessage.value = 'Email dan password wajib diisi!';
    return;
  }
  isProcessing.value = true;
  errorMessage.value = '';
  try {
    const response = await api.post('/auth/login', loginForm.value);
    await setItem('user', JSON.stringify(response.data.user));
    await setItem('token', response.data.token);
    router.push('/tabs/tab1');
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Login gagal';
  } finally {
    isProcessing.value = false;
  }
}

async function handleRegister() {
  // ... (validasi biarkan saja) ...
  try {
    // Kirim semua data termasuk phone ke backend
    await api.post('/auth/register', registerForm.value); 
    alert('Registrasi berhasil! Silakan login.');
    authMode.value = 'login';
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Registrasi gagal';
  } finally {
    isProcessing.value = false;
  }
}
</script>

<style scoped>
.login-content {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.login-container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
  z-index: 1;
}

/* Animated Background Shapes */
.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.6;
  animation: float 8s ease-in-out infinite;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.3);
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 250px;
  height: 250px;
  background: rgba(255, 255, 255, 0.2);
  bottom: -80px;
  right: -80px;
  animation-delay: 2s;
}

.shape-3 {
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.25);
  top: 50%;
  left: 50%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
  color: white;
  animation: slideDown 0.8s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

.logo-icon {
  width: 90px;
  height: 90px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 45px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.logo-section h1 {
  font-size: 2.8em;
  margin: 0 0 8px;
  font-weight: 800;
  letter-spacing: -1px;
}

.logo-section p {
  margin: 0;
  opacity: 0.95;
  font-size: 1.1em;
  font-weight: 400;
}

.glass-card {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: slideUp 0.8s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-segment {
  margin-bottom: 25px;
  --background: #f1f5f9;
  border-radius: 16px;
  padding: 5px;
}

.segment-label {
  font-weight: 700;
  text-transform: none;
  font-size: 0.95em;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 16px;
  padding: 14px 18px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #6366f1;
  background: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.input-icon {
  color: #94a3b8;
  margin-right: 14px;
  font-size: 22px;
}

.custom-input {
  --background: transparent;
  --color: #1e293b;
  --placeholder-color: #94a3b8;
  font-size: 1em;
}

.btn-primary {
  --background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  --border-radius: 16px;
  height: 52px;
  font-weight: 700;
  font-size: 1em;
  margin-top: 10px;
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
  letter-spacing: 0.5px;
}

.btn-primary:active {
  transform: scale(0.97);
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #f43f5e;
  text-align: center;
  margin-top: 18px;
  font-size: 0.9em;
  font-weight: 600;
  padding: 12px;
  background: rgba(244, 63, 94, 0.1);
  border-radius: 12px;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
</style>