<template>

  <HelpMessage>
    <strong>Event Templates</strong> allows you to easily reuse events.
    To create a template, first create an event within a session, and then use
    <span class="pi pi-save"></span> button
  </HelpMessage>

  <div class="page-content">

    <div class="mb-3 d-flex align-items-center justify-content-between">
      <h2 class="m-0">Templates</h2>
      <span class="p-input-icon-left float-end">
        <i class="pi pi-search" />
        <InputText v-model="filters['global'].value" placeholder="Search..." />
      </span>
    </div>

    <DataTable :value="Object.values($root.templates)" dataKey="id"
               :paginator="true" :rows="20" :filters="filters">
      <Column field="name" header="Template Name" />
      <Column class="text-end">
        <template #body="{data}">
          <Button icon="pi pi-trash" class="p-button-text p-button-danger"
                  @click="deleteTemplate(data)" />
        </template>
      </Column>
    </Datatable>
  </div>
</template>

<script>
import { FilterMatchMode } from 'primevue/api'

export default {
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
      console.log('delete', template)
      this.$confirm.require({
        message: `Are you sure you want to delete ${template.name} ?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          this.dbDestroy('templates', template)
        },
      })
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
