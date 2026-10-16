<template>
  <ion-page>
    <ion-tabs>
      <!-- Router Outlet HARUS di atas -->
      <ion-router-outlet></ion-router-outlet>
      
      <!-- Tab Bar HARUS di dalam ion-tabs, bukan di luar -->
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="tab1" href="/tabs/tab1">
          <ion-icon :icon="homeOutline"></ion-icon>
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab4" href="/tabs/tab4">
          <ion-icon :icon="fileTrayOutline"></ion-icon>
          <ion-label>Laporan</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/tabs/tab2">
          <div class="center-btn">
            <ion-icon :icon="addOutline"></ion-icon>
          </div>
          <ion-label>Tambah</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab5" href="/tabs/tab5">
          <ion-icon :icon="searchOutline"></ion-icon>
          <ion-label>Cari</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" href="/tabs/tab3">
          <ion-icon :icon="personOutline"></ion-icon>
          <ion-label>Profil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup>
import { IonPage, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/vue';
import { homeOutline, addOutline, personOutline, fileTrayOutline, searchOutline } from 'ionicons/icons';
</script>

<style>
.center-btn {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
  margin-bottom: 4px;
}

.center-btn ion-icon {
  font-size: 28px;
  color: white;
}

ion-tab-button {
  --color-selected: #6366f1;
  --color: #64748b;
}
</style>