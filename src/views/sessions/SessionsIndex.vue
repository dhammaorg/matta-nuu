<template>
  <img class="page-background" src="@/assets/undraw_events.svg" />

  <HelpMessage>
    A <strong>Session</strong> is where you can manage <strong>consumptions, stocks, orders..</strong>
    A session is composed of one or many sub Events
  </HelpMessage>

  <div class="page-content">
    <div class="table-header">
      <Button v-tooltip.top="'New Session'" icon="pi pi-plus" class="p-button-rounded"
        @click="$refs.newSessionModal.open()" />
      <h2>Sessions</h2>
      <span class="p-input-icon-left search">
        <i class="pi pi-search" />
        <InputText v-model="filters['global'].value" placeholder="Search..." />
      </span>
    </div>

    <DataTable class="table-clickable" :value="$root.sessionsArray" dataKey="id" :paginator="true" :rows="20"
      :filters="filters" @row-click="onRowClick">

      <Column field="name" header="Name" :sortable="true"></Column>
      <Column class="text-end">
        <template #body="{ data }">
          <Button :icon="isSessionStarred(data) ? 'pi pi-star-fill' : 'pi pi-star'"
            class="p-button-text star-toggle-button" :style="isSessionStarred(data) ? 'color: #b78730' : ''"
            v-tooltip.top="isSessionStarred(data) ? 'Remove star' : 'Star session'"
            @click.stop="toggleSessionStarred(data)" />

          <Button icon="pi pi-arrow-right" class="p-button-text" v-tooltip="'Open'" @click.stop="openSession(data)" />
          <Button icon="pi pi-copy" class="p-button-text" v-tooltip="'Duplicate'"
            @click.stop="duplicateSession(data)" />
          <Button icon="pi pi-trash" class="p-button-text p-button-danger" @click.stop="deleteSession(data)"
            v-tooltip="'Delete'" />
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
    isSessionStarred(session) {
      return session.starred === true
    },
    onRowClick(e) {
      this.openSession(e.data)
    },
    openSession(session) {
      this.$router.push({ name: 'session_overview', params: { id: session.id } })
    },
    toggleSessionStarred(session) {
      this.dbUpdate('sessions', { id: session.id, starred: !this.isSessionStarred(session) })
    },
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

<style lang='scss' scoped></style>
