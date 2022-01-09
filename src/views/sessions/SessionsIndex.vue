<template>
  <div class="page-content">
    <div class="mb-3">
      <Button label="New Session" icon="pi pi-plus" class="me-2"
              @click="$refs.newSessionModal.open()" />
      <span class="p-input-icon-left float-end">
        <i class="pi pi-search" />
        <InputText v-model="filters['global'].value" placeholder="Search..." />
      </span>
    </div>

    <DataTable :value="Object.values($root.sessions)" dataKey="id"
      :paginator="true" :rows="20" :filters="filters">

      <Column field="name" header="Name" :sortable="true"></Column>
      <Column class="text-end">
        <template #body="{data}">
          <router-link :to="{ name: 'session_schedule', params: { id: data.id }}">
            <Button icon="pi pi-pencil" class="p-button-text p-button-primary" />
          </router-link>
          <Button icon="pi pi-trash" class="p-button-text p-button-danger"
                  @click="deleteSession(data)" />
        </template>
      </Column>
    </DataTable>
    <ConfirmDialog></ConfirmDialog>

    <SessionNew ref="newSessionModal"></SessionNew>
  </div>
</template>

<script>
import { FilterMatchMode } from 'primevue/api'
import SessionNew from './SessionNew.vue'

export default {
  components: { SessionNew },
  data() {
    return {
      filters: {},
    }
  },
  created() {
    this.initFilters()
  },
  methods: {
    deleteSession(session) {
      this.$confirm.require({
        message: `Are you sure you want to delete ${session.name} ?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          this.dbDestroy('sessions', session)
        },
      })
    },
    initFilters() {
      this.filters = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      }
    },
  },
}
</script>
