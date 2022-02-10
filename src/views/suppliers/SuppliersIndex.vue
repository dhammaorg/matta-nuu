<template>

  <img class="page-background" style="opacity: .2" src="@/assets/undraw_shop.svg"/>

  <div class="page-content">
    <div class="table-header">
      <Button v-tooltip.top="'Add Supplier'" icon="pi pi-plus" class="p-button-rounded"
              @click="$refs.form.show()" />
      <h2>Suppliers</h2>
      <span class="p-input-icon-left search">
        <i class="pi pi-search" />
        <InputText v-model="filters['global'].value" placeholder="Search..." />
      </span>
    </div>

    <DataTable :value="$root.suppliersArray" dataKey="id"
      :paginator="true" :rows="20" :filters="filters">

      <Column field="name" header="Name" :sortable="true"></Column>
      <Column class="text-end">
        <template #body="{data}">
          <Button icon="pi pi-pencil" class="p-button-text p-button-primary"
                  @click="$refs.form.show(data)" v-tooltip="'Edit'"/>
          <Button icon="pi pi-trash" class="p-button-text p-button-danger"
                  @click="deleteSupplier(data)" />
        </template>
      </Column>
    </DataTable>

    <SupplierForm ref="form"></SupplierForm>
  </div>
</template>

<script>
import { FilterMatchMode } from 'primevue/api'
import SupplierForm from './SupplierForm.vue'

export default {
  components: { SupplierForm },
  data() {
    return {
      filters: {},
    }
  },
  created() {
    this.initFilters()
  },
  methods: {
    deleteSupplier(supplier) {
      this.$confirm.require({
        message: `
          Are you sure you want to delete ${supplier.name} ? 
          All references to this supplier will be lost`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          this.dbDestroy('suppliers', supplier)
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
