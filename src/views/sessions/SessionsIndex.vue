<template>
  <img class="page-background" src="@/assets/undraw_events.svg" />

  <HelpMessage>
    A <strong>Session</strong> is where you can manage <strong>consumptions, stocks, orders..</strong>
    A session is composed of one or many sub Events
  </HelpMessage>

  <div class="page-content">
    <div class="mb-3">
      <Button label="New Session" icon="pi pi-plus" class="me-2"
              @click="$refs.newSessionModal.open()" />
      <span class="p-input-icon-left float-end">
        <i class="pi pi-search" />
        <InputText v-model="filters['global'].value" placeholder="Search..." />
      </span>
    </div>

    <DataTable :value="$root.sessionsArray" dataKey="id"
      :paginator="true" :rows="20" :filters="filters">

      <Column field="name" header="Name" :sortable="true"></Column>
      <Column class="text-end">
        <template #body="{data}">
          <router-link :to="{ name: 'session_schedule', params: { id: data.id }}">
            <Button icon="pi pi-pencil" class="p-button-text" v-tooltip="'Edit'"/>
          </router-link>
          <Button icon="pi pi-copy" class="p-button-text" v-tooltip="'Duplicate'"
                  @click="duplicateSession(data)"/>
          <Button icon="pi pi-trash" class="p-button-text p-button-danger"
                  @click="deleteSession(data)" v-tooltip="'Delete'"/>
        </template>
      </Column>
    </DataTable>

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
    async duplicateSession(session) {
      session = await this.$root.fetchSession(session.id)
      const newSession = { ...session, ...{ realStocks: {}, buys: {} } }
      delete newSession.id
      newSession.name = `${session.name} (COPY)`
      this.dbCreate('sessions', newSession)
    },
    initFilters() {
      this.filters = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      }
    },
  },
}
</script>
