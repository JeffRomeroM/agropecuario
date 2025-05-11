import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Ganaderia from '../views/Ganaderia.vue'
import Agricultura from '../views/Agricultura.vue'
import Inventario from '../views/Inventario.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/ganaderia', component: Ganaderia },
  { path: '/agricultura', component: Agricultura },
  { path: '/inventario', component: Inventario }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
