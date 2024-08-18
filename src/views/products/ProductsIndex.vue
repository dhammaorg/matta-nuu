<template>
  <div class="page-full-content">
    <div class="mb-3">
      <Button label="Add Product" icon="pi pi-plus" class="me-2" @click="$refs.form.show()" />
      <span class="p-input-icon-left">
        <i class="pi pi-search" />
        <InputText v-model="filters['global'].value" placeholder="Search..." />
      </span>
      <Button label="Save" icon="pi pi-save" class="p-button-success float-end" @click="save"
              :loading="loading" />
    </div>

    <DataTable :value="$root.productsArray" showGridlines :scrollable="true"
               scrollHeight="calc(100vh - 11rem)"
               class="editable-cells-table session-table products-table" v-model:filters="filters"
               sortField="name" :sortOrder="1" filterDisplay="menu">

      <!-- Name -->
      <Column field="name" header="Name" class="product-column w-auto justify-content-start"
              :sortable="true" style="max-width: 20rem">
        <template #body="{ data }">
          {{ data.name }} ({{ data.unit }})
        </template>
      </Column>

      <!-- Category -->
      <Column field="category_id" header="Category" :sortable="true" style="max-width: 12rem"
              filterField="category_id" :showFilterMatchModes="false"
              :filterMenuStyle="{ 'width': '14rem' }">
        <template #body="{ data }">
          <InputCategory type="Product" v-model="data.category_id" placeholder="" />
        </template>
        <template #filter="{ filterModel }">
          <InputCategory type="Product" v-model="filterModel.value" class="p-column-filter"
                         :btnAdd="false" :showClear="false" />
        </template>
      </Column>

      <!-- Supplier -->
      <Column field="supplier_id" header="Supplier" :sortable="true" style="max-width: 14rem"
              filterField="supplier_id" :showFilterMatchModes="false"
              :filterMenuStyle="{ 'width': '14rem' }">
        <template #body="{ data }">
          <InputSupplier v-model="data.supplier_id" placeholder="" />
        </template>
        <template #filter="{ filterModel }">
          <InputSupplier v-model="filterModel.value" class="p-column-filter"
                         :btnAdd="false" :showClear="false" />
        </template>
      </Column>

      <!-- Storage Areas -->
      <Column field="storage_area_ids" header="Storage Areas" :sortable="true"
              style="max-width: 14rem"
              filterField="storage_area_ids" :showFilterMatchModes="false"
              :filterMenuStyle="{ 'width': '14rem' }">
        <template #body="{ data }">
          <InputCategory type="StorageArea" :multiple="true" v-model="data.storage_area_ids" />
        </template>
        <template #filter="{ filterModel }">
          <InputCategory type="StorageArea" v-model="filterModel.value" class="p-column-filter"
                         placeholder="Storage Areas" :btnAdd="false" :showClear="false" />
        </template>
      </Column>

      <!-- Price -->
      <Column field="price" header="Unit Price" style="max-width: 14rem">
        <template #body="{ data }">
          <InputText :value="getLastPriceValue(data)" disabled
                     :maxFractionDigits="2" />
        </template>
      </Column>


      <!-- Actions -->
      <Column class="text-end" style="max-width: 40px" header="Actions">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" class="p-button-text" @click="$refs.form.show(data)" />
          <Button icon="pi pi-trash" class="p-button-text p-button-danger"
                  @click="deleteProduct(data)" />
        </template>
      </Column>

      <!-- Recipies -->
      <Column field="recipies" header="Used by" class="recipies">
        <template #body="{ data }">
          <Chip v-for="recipie in recipiesUsingProduct(data)" :key="`${data.id}_${recipie.id}`"
                :label="recipie.name" icon="pi pi-pencil" class="edit-recipie-chip"
                @click="$refs.recipieForm.show(recipie)" v-tooltip="'Edit this recipie'" />
        </template>
      </Column>
    </DataTable>

    <ProductForm ref="form"></ProductForm>
    <RecipieForm ref="recipieForm"></RecipieForm>
  </div>
</template>

<script>
import { FilterMatchMode } from 'primevue/api'
import Chip from 'primevue/chip'
import InputText from 'primevue/inputtext'
import ProductForm from './ProductForm.vue'
import InputSupplier from '@/components/InputSupplier.vue'
import InputCategory from '@/components/InputCategory.vue'
import RecipieForm from '@/views/recipies/RecipieForm.vue'

export default {
  components: {
    ProductForm, RecipieForm, InputSupplier, InputCategory, Chip, InputText,
  },
  data() {
    return {
      loading: false,
      filters: {},
      productsChanged: [],
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
        supplier_id: { value: null, matchMode: FilterMatchMode.EQUALS },
        category_id: { value: null, matchMode: FilterMatchMode.EQUALS },
        storage_area_ids: { value: null, matchMode: FilterMatchMode.CONTAINS },
      }
    },
    onCellEditComplete(event) {
      const { data, newData } = event
      data.packaging_reference = newData.packaging_reference
    },
    async save() {
      this.loading = true
      const { error } = await this.$db.from('products').upsert(this.$root.productsArray)
      if (error) this.toastError(error)
      else {
        this.$toast.add({
          severity: 'success', summary: 'Success', detail: 'All products sucessfully updated', life: 4000,
        })
      }
      this.loading = false
    },
    recipiesUsingProduct(product) {
      return this.$root.recipiesArray.filter((r) => r.products.some((p) => p.id == product.id))
    },
    getProductLastPrice(prices) {
      if (!prices || prices.length === 0) {
        return null;
      }

      const lastPrice = prices.reduce((latest, current) => {
        return new Date(current.date) > new Date(latest.date) ? current : latest;
      });

      return lastPrice;
    },
    getLastPriceValue(product) {
      const lastPrice = this.getProductLastPrice(product.prices);
      return lastPrice ? lastPrice.value + "€/" + product.unit : null;
    }
  }
}
</script>

<style lang="scss">
.products-table {
  td {
    &:not(.product-column) {
      padding: 0 !important;
    }

    &.product-column input {
      background-color: transparent;
      color: inherit;
      text-align: left;
    }

    input,
    .p-dropdown,
    .p-multiselect {
      border: none !important;
      width: 100%;
    }

    &.recipies {
      justify-content: flex-start;
      padding-left: .5rem !important;
    }
  }

  .edit-recipie-chip {
    cursor: pointer;
    font-size: .8rem;
    margin: 4px 4px 0 0;

    .pi {
      font-size: inherit;
    }
  }
}
</style>
