<template>

  <HelpMessage>
    <strong>Event Templates</strong> allows you to easily reuse events.
    To create a template, first create an event within a session, and then use
    <span class="pi pi-save"></span> button
  </HelpMessage>

  <div class="page-content">

    <div class="mb-3 d-flex align-items-center justify-content-between">
      <h2 class="m-0">Templates</h2>
      <Button label="New Template" icon="pi pi-plus" class="me-2"
              @click="$refs.newSessionModal.open({is_template: true})" />
      <span class="p-input-icon-left float-end">
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
