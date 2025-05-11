<template>
  <div class="agricultura">
    <h1>Registro de Cultivos</h1>

    <div class="top-bar">
      <button class="crear-btn btna" @click="abrirModal">+ Agregar </button>

      <div class="filter-bar">
        <label for="filtroCultivo">Filtrar por cultivo:</label>
        <select v-model="filtroCultivo" id="filtroCultivo">
          <option value="">Todos</option>
          <option v-for="cultivo in cultivosUnicos" :key="cultivo" :value="cultivo">{{ cultivo }}</option>
        </select>

        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar"
          @input="fetchData"
          style="padding: 8px; border-radius: 6px; border: 1px solid #ccc;"
        />

        <span class="total-gasto">Total: C$ {{ totalGasto }}</span>
      </div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Cultivo</th>
            <th>Gasto (C$)</th>
            <th>Concepto</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in registrosFiltrados" :key="item.id">
            <td>{{ item.cultivo }}</td>
            <td>{{ item.gasto }}</td>
            <td>{{ item.concepto }}</td>
            <td>{{ formatearFecha(item.fecha) }}</td>
            <td>
              <button @click="editRecord(item)">✏️</button>
              <button @click="showDeleteModal(item)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para Crear/Editar -->
    <div class="modal" v-if="mostrarModal">
      <div class="modal-content">
        <h2>{{ isEditing ? 'Editar Cultivo' : 'Nuevo Cultivo' }}</h2>
        <form @submit.prevent="isEditing ? updateRecord() : createRecord()" class="form">
          <input v-model="form.cultivo" list="cultivoList" placeholder="Cultivo" required />
          <datalist id="cultivoList">
            <option v-for="cultivo in cultivosUnicos" :key="cultivo" :value="cultivo"></option>
          </datalist>
          <input v-model.number="form.gasto" placeholder="Gasto" type="number" required />
          <input v-model="form.concepto" placeholder="Concepto" required />
          <input v-model="form.fecha" placeholder="Fecha" type="date" required />
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
        <h2>¿Estás seguro de eliminar este gasto?</h2>
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

const API_URL = 'https://script.google.com/macros/s/AKfycbyyMT34lZpLZIw2sqwvVK2m2R9mnx2Kzooh8kF0HCB2ErITgB2t54PXp0N4MYjAjIQD/exec'

const registros = ref([])
const form = ref({ id: null, cultivo: '', gasto: '', concepto: '', fecha: '' })
const isEditing = ref(false)
const filtroCultivo = ref('')
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
  form.value = { id: null, cultivo: '', gasto: '', concepto: '', fecha: '' }
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
    const coincideCultivo = !filtroCultivo.value || r.cultivo === filtroCultivo.value
    const texto = `${r.cultivo} ${r.concepto} ${r.fecha} ${r.gasto}`.toLowerCase()
    const coincideBusqueda = !busqueda.value || texto.includes(busqueda.value.toLowerCase())
    return coincideCultivo && coincideBusqueda
  })
})

const totalGasto = computed(() => {
  return registrosFiltrados.value.reduce((acc, r) => acc + Number(r.gasto), 0).toFixed(2)
})

const cultivosUnicos = computed(() => {
  const cultivos = registros.value.map(r => r.cultivo)
  return [...new Set(cultivos)]
})

onMounted(fetchData)

const formatearFecha = (fecha) => {
  const date = new Date(fecha);
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return date.toLocaleDateString('es-NI', options); // O puedes usar 'es-MX' para otros países
}

</script>


<style>
.agricultura {
  font-family: 'Segoe UI', sans-serif;
  width: 98%;
  margin: 30px auto;
}

h1 {
  text-align: center;
  margin-top: 80px;
  color: #2c3e50;
  font-size: 20px;
}

.top-bar {
  display: flex;
  flex-direction: column;
  width: 100%;
}

select {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: white;
  color: #333;
  font-size: 14px;
}

.buscar-input {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  width: 250px;
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

.total-gasto {
  font-weight: bold;
  color: #2a7;
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
  padding: 5px;
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

/* Modal */
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
  width: 25vw;
  background-color: #45a049;
  margin-bottom: 5px;
}
</style>
