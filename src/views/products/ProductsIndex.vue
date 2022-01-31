<template>
  <div class="page-content">
    <div class="mb-3">
      <Button label="Add Product" icon="pi pi-plus" class="me-2" @click="$refs.form.show()" />
      <span class="p-input-icon-left float-end">
        <i class="pi pi-search" />
        <InputText v-model="filters['global'].value" placeholder="Search..." />
      </span>
    </div>

    <DataTable :value="$root.productsArray" dataKey="id"
      :paginator="true" :rows="20" :filters="filters">

      <Column field="name" header="Name" :sortable="true"></Column>
      <Column class="text-end">
        <template #body="{data}">
          <Button icon="pi pi-pencil" class="p-button-text p-button-primary"
                  @click="$refs.form.show(data)" />
          <Button icon="pi pi-trash" class="p-button-text p-button-danger"
                  @click="deleteProduct(data)" />
        </template>
      </Column>
    </DataTable>

    <ProductForm ref="form"></ProductForm>
  </div>
</template>

<script>
import { FilterMatchMode } from 'primevue/api'
import ProductForm from './ProductForm.vue'

export default {
  components: { ProductForm },
  data() {
    return {
      filters: {},
    }
  },
  created() {
    this.initFilters()
  },
  methods: {
    deleteProduct(product) {
      this.$confirm.require({
        message: `
          Are you sure you want to delete ${product.name} ? 
          All references to this product in any Sessions or Recipies will be lost as well`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          this.dbDestroy('products', product)
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
