<template>
    <div class="inventario">
      <h1>Inventario de Insumos Agropecuarios</h1>
  
      <div class="top-bar">
        <button class="crear-btn btna" @click="abrirModal">+ Agregar Insumo</button>
  
        <div class="filter-bar">
          <label for="filtroCategoria">Filtrar por categoría:</label>
          <select v-model="filtroCategoria" id="filtroCategoria">
            <option value="">Todas</option>
            <option v-for="categoria in categoriasUnicas" :key="categoria" :value="categoria">{{ categoria }}</option>
          </select>
          <input
            type="text"
            v-model="busqueda"
            placeholder="Buscar insumo"
            @input="filterData"
            class="search-input"
          />
        </div>
      </div>
  
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Insumo</th>
              <th>Categoría</th>
              <th>Cantidad</th>
              <th>Precio Unitario (C$)</th>
              <th>Precio Total (C$)</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in registrosFiltrados" :key="item.id">
              <td>{{ item.nombre }}</td>
              <td>{{ item.categoria }}</td>
              <td>{{ item.cantidad }}</td>
              <td>{{ item.precioUnitario }}</td>
              <td>{{ item.precioUnitario *  item.cantidad}}</td>
              <td>{{ formatearFecha(item.fechaRegistro) }}</td>
              <td>
                <button @click="editRecord(item)">Editar</button>
                <button @click="showDeleteModal(item)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Modal para Crear/Editar -->
      <div class="modal" v-if="mostrarModal">
        <div class="modal-content">
          <h2>{{ isEditing ? 'Editar Insumo' : 'Nuevo Insumo' }}</h2>
          <form @submit.prevent="isEditing ? updateRecord() : createRecord()" class="form">
            <input v-model="form.nombre" placeholder="Insumo" required />
            <input v-model="form.categoria" placeholder="Categoría" required />
            <input v-model.number="form.cantidad" placeholder="Cantidad" type="number" required />
            <input v-model.number="form.precioUnitario" placeholder="Precio Unitario" type="number" required />
            <input v-model="form.fechaRegistro" placeholder="Fecha Registro" type="date" required />
            <div class="modal-actions">
              <button type="submit">{{ isEditing ? 'Actualizar' : 'Guardar' }}</button>
              <button type="button" class="cancelar" @click="cerrarModal">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
  
      <!-- Modal de Confirmación para Eliminar -->
      <div class="modal" v-if="mostrarModalEliminar">
        <div class="modal-content">
          <h2>¿Estás seguro de eliminar este insumo?</h2>
          <div class="modal-actions">
            <button @click="deleteRecord(confirmDeleteId)">Eliminar</button>
            <button @click="cerrarModalEliminar">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  
  const API_URL = 'https://script.google.com/macros/s/AKfycbzK7nj4MSmrnVLBXAS2MQorCi5oSMj1tcNBJweUdpRLt_GC5RR7TtfHIF2aR6mFPpIk/exec'
  
  const registros = ref([])
  const form = ref({ id: null, nombre: '', categoria: '', cantidad: 0, precioUnitario: 0, fechaRegistro: '' })
  const isEditing = ref(false)
  const filtroCategoria = ref('')
  const busqueda = ref('')
  const mostrarModal = ref(false)
  const mostrarModalEliminar = ref(false)
  const confirmDeleteId = ref(null)
  
  const fetchData = async () => {
    const res = await fetch(API_URL + '?action=read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'read' })
    })
    registros.value = await res.json()
  }
  
  const createRecord = async () => {
    const params = new URLSearchParams({ action: 'create', ...form.value })
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })
    clearForm()
    fetchData()
    cerrarModal()
  }
  
  const editRecord = (item) => {
    form.value = { ...item }
    isEditing.value = true
    mostrarModal.value = true
  }
  
  const updateRecord = async () => {
    const params = new URLSearchParams({ action: 'update', ...form.value })
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })
    clearForm()
    fetchData()
    cerrarModal()
  }
  
  const deleteRecord = async (id) => {
    const params = new URLSearchParams({ action: 'delete', id })
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })
    fetchData()
    cerrarModalEliminar()
  }
  
  const showDeleteModal = (item) => {
    confirmDeleteId.value = item.id
    mostrarModalEliminar.value = true
  }
  
  const clearForm = () => {
    form.value = { id: null, nombre: '', categoria: '', cantidad: '', precioUnitario: '', fechaRegistro: '' }
    isEditing.value = false
  }
  
  const abrirModal = () => {
    mostrarModal.value = true
    clearForm()
  }
  
  const cerrarModal = () => {
    mostrarModal.value = false
  }
  
  const cerrarModalEliminar = () => {
    mostrarModalEliminar.value = false
  }
  
  const registrosFiltrados = computed(() => {
    return registros.value.filter(r => {
      const coincideCategoria = !filtroCategoria.value || r.categoria === filtroCategoria.value
      const texto = `${r.nombre} ${r.categoria} ${r.fechaRegistro} ${r.precioUnitario}`.toLowerCase()
      const coincideBusqueda = !busqueda.value || texto.includes(busqueda.value.toLowerCase())
      return coincideCategoria && coincideBusqueda
    })
  })
  
  const categoriasUnicas = computed(() => {
    const categorias = registros.value.map(r => r.categoria)
    return [...new Set(categorias)]
  })
  
  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('es-NI', options); // O 'es-MX' si prefieres formato mexicano
  }
  
  onMounted(fetchData)
  </script>
  
  <style scoped>
  .inventario {
    font-family: 'Segoe UI', sans-serif;
    width: 98%;
    margin: 30px auto;
  }
  
  h1 {
    text-align: center;
    margin-bottom: 20px;
    color: #2c3e50;
  }
  
  .top-bar {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  
  .search-input {
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #ccc;
    background-color: white;
    color: #333;
    font-size: 14px;
    margin-top: 10px;
  }
  
  .crear-btn {
    background-color: #4caf50;
    color: white;
    padding: 10px 6px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  
  .filter-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  
  .filter-btn {
    padding: 8px 16px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .filter-btn:hover {
    background-color: #45a049;
  }
  
  .table-wrapper {
    overflow-x: auto;
    margin-top: 10px;
    width: 100%;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border: 1px solid #ddd;
  }
  
  th, td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: left;
  }
  
  th {
    background-color: #eee;
  }
  
  button {
    margin-right: 5px;
    padding: 6px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:first-of-type {
    background-color: #4caf50;
    color: white;
  }
  
  button:last-of-type {
    background-color: #f44336;
    color: white;
  }
  
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }
  
  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 0 10px rgba(0,0,0,0.3);
  }
  
  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .form input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 6px;
  }
  
  .modal-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }
  
  .modal-actions button {
    flex: 1;
    margin: 5px;
    padding: 10px;
  }
  
  .modal-actions .cancelar {
    background-color: #999;
    color: white;
  }
  .btna {
    width: 10%;
    width: 25vw;
    background-color: #45a049;
  }
  </style>
  