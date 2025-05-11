<template>
    <footer class="bottom-menu">
      <router-link to="/" class="menu-item" exact>
        <img src="../assets/home.png" alt="" width="25">
        <span class="label">Inicio</span>
      </router-link>
      <router-link to="/ganaderia" class="menu-item">
        <img src="../assets/ganaderia.png" alt="" width="25">
        <span class="label">Ganadería</span>
      </router-link>
      <router-link to="/agricultura" class="menu-item">
        
        <img src="../assets/agricultura.png" alt="" width="25">
        <span class="label">Agricultura</span>
      </router-link>
      <router-link to="/inventario" class="menu-item">
        
        <img src="../assets/inventario.png" alt="" width="25">
        <span class="label">Inventario</span>
      </router-link>
    </footer>
  </template>
  
  <style scoped>
  .bottom-menu {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    width: 100%;
    background-color: white;
    border-top: 1px solid #ddd;
    display: flex;
    justify-content: space-around;
    align-items: center;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.05);
    z-index: 1000;
  }
  
  .menu-item {
    text-decoration: none;
    color: #555;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 12px;
    transition: color 0.2s ease;
  }
  
  .menu-item .icon {
    font-size: 20px;
  }
  
  .menu-item.router-link-exact-active,
  .menu-item.router-link-active {
    color: #1a73e8;
  }
  
  @media (min-width: 769px) {
    .bottom-menu {
      display: none;
    }
  }
  </style>
  