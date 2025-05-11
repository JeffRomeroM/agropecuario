<template>
  <div class="app-container">
    <MenuTop />
    <ButtomMenu />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import ButtomMenu from './components/ButtomMenu.vue';
import MenuTop from './components/MenuTop.vue';
</script>

<style>
.app-container {
  width: 100%;
  margin: auto;
}
.main-content {
  width: 100%;
}

</style>
