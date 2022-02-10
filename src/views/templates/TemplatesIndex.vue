<template>

  <HelpMessage>
    <strong>Event Templates</strong> allows you to easily reuse events.
    When creating an event within a session you will be able to use such templates
    <span class="pi pi-save"></span> button
  </HelpMessage>

  <div class="page-content">

    <div class="table-header">
      <Button icon="pi pi-plus" class="p-button-rounded" v-tooltip.top="'New Template'"
              @click="$refs.newSessionModal.open({is_template: true})" />
      <h2>Templates</h2>
      <span class="p-input-icon-left search">
        <i class="pi pi-search" />
        <InputText v-model="filters['global'].value" placeholder="Search..." />
      </span>
    </div>

    <DataTable :value="$root.templatesArray" dataKey="id"
               :paginator="true" :rows="20" :filters="filters">
      <Column field="name" header="Template Name" />
      <Column class="text-end">
        <template #body="{data}">
          <router-link :to="{ name: 'session_schedule', params: { id: data.id }}">
            <Button icon="pi pi-pencil" class="p-button-text" v-tooltip="'Edit'"/>
          </router-link>
          <Button icon="pi pi-trash" class="p-button-text p-button-danger"
                  @click="deleteTemplate(data)" />
        </template>
      </Column>
    </Datatable>

    <SessionNew ref="newSessionModal"></SessionNew>
  </div>
</template>

<script>
import { FilterMatchMode } from 'primevue/api'
import SessionNew from '@/views/sessions/SessionNew.vue'

export default {
  components: { SessionNew },
  data() {
    return {
      filters: {},
    }
  },
  created() {
    this.filters = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    }
  },
  methods: {
    deleteTemplate(template) {
      this.$confirm.require({
        message: `Are you sure you want to delete ${template.name} ?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          this.dbDestroy('sessions', template)
        },
      })
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
