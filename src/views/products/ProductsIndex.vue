<template>
  <div class="page-full-content">
    <div class="mb-3 d-flex align-items-center gap-2 flex-wrap">
      <Button label="Add Product" icon="pi pi-plus" class="me-2" @click="$refs.form.show()" />
      <span class="p-input-icon-left">
        <i class="pi pi-search" />
        <InputText v-model="filters['global'].value" placeholder="Search..." />
      </span>
      <MultiSelect v-model="selectedColumnKeys" :options="availableColumns" optionLabel="label" optionValue="key"
        placeholder="Columns" class="columns-selector">
        <template #value>
          <i class="pi pi-filter me-2"></i>
          <span>Columns</span>
        </template>
      </MultiSelect>
      <Button label="Save" icon="pi pi-save" class="p-button-success ms-auto" @click="save" :loading="loading" />
    </div>

    <DataTable :value="$root.productsArray" showGridlines :scrollable="true" scrollHeight="calc(100vh - 11rem)"
      class="editable-cells-table session-table products-table" v-model:filters="filters" sortField="name"
      :sortOrder="1" filterDisplay="menu">

      <!-- Name -->
      <Column field="name" header="Name" class="product-column w-auto justify-content-start" :sortable="true"
        style="max-width: 20rem">
        <template #body="{ data }">
          {{ data.name }} ({{ data.unit }})
        </template>
      </Column>

      <!-- Unit -->
      <Column v-if="isColumnVisible('unit')" field="unit" header="Unit" :sortable="true" style="max-width: 10rem">
        <template #body="{ data }">
          <InputUnit v-model="data.unit" />
        </template>
      </Column>

      <!-- Category -->
      <Column v-if="isColumnVisible('category_id')" field="category_id" header="Category" :sortable="true"
        style="max-width: 12rem" filterField="category_id" :showFilterMatchModes="false"
        :filterMenuStyle="{ 'width': '14rem' }">
        <template #body="{ data }">
          <InputCategory type="Product" v-model="data.category_id" placeholder="" />
        </template>
        <template #filter="{ filterModel }">
          <InputCategory type="Product" v-model="filterModel.value" class="p-column-filter" :btnAdd="false"
            :showClear="false" />
        </template>
      </Column>

      <!-- Supplier -->
      <Column v-if="isColumnVisible('supplier_id')" field="supplier_id" header="Supplier" :sortable="true"
        style="max-width: 14rem" filterField="supplier_id" :showFilterMatchModes="false"
        :filterMenuStyle="{ 'width': '14rem' }">
        <template #body="{ data }">
          <InputSupplier v-model="data.supplier_id" placeholder="" />
        </template>
        <template #filter="{ filterModel }">
          <InputSupplier v-model="filterModel.value" class="p-column-filter" :btnAdd="false" :showClear="false" />
        </template>
      </Column>

      <!-- Packaging Name / Reference -->
      <Column v-if="isColumnVisible('packaging_reference')" field="packaging_reference"
        header="Packaging Name / Reference" :sortable="true" style="max-width: 16rem">
        <template #body="{ data }">
          <InputText v-model.trim="data.packaging_reference" placeholder="" class="text-start" />
        </template>
      </Column>

      <!-- Packaging Conditioning -->
      <Column v-if="isColumnVisible('packaging_conditioning')" field="packaging_conditioning"
        header="Packaging Conditioning" :sortable="true" style="max-width: 12rem">
        <template #body="{ data }">
          <div class="d-flex align-items-center">
            <InputNumber :modelValue="data.packaging_conditioning"
              @update:modelValue="updatePackagingConditioning(data, $event)" :maxFractionDigits="5" class="w-50" />
            <div class="w-50 px-2">{{ data.unit }}</div>
          </div>
        </template>
      </Column>

      <!-- Convert to Piece -->
      <Column v-if="isColumnVisible('packaging_convert_to_piece')" field="packaging_convert_to_piece"
        header="Convert to Piece" :sortable="true" style="max-width: 9rem">
        <template #body="{ data }">
          <div class="d-flex justify-content-center align-items-center h-100">
            <Checkbox :modelValue="!!data.packaging_convert_to_piece"
              @update:modelValue="updatePackagingConvertToPiece(data, $event)" :binary="true"
              :disabled="!data.packaging_conditioning" />
          </div>
        </template>
      </Column>

      <!-- Pieces per Case -->
      <Column v-if="isColumnVisible('case_pack_size')" field="case_pack_size" header="Pieces per Case" :sortable="true"
        style="max-width: 10rem">
        <template #body="{ data }">
          <InputNumber :modelValue="getDisplayedCasePackSize(data)"
            @update:modelValue="updateCasePackSize(data, $event)" :min="2" :maxFractionDigits="0"
            :disabled="!canShowCasePackSize(data)" />
        </template>
      </Column>

      <!-- Storage Areas -->
      <Column v-if="isColumnVisible('storage_area_ids')" field="storage_area_ids" header="Storage Areas"
        :sortable="true" style="max-width: 14rem" filterField="storage_area_ids" :showFilterMatchModes="false"
        :filterMenuStyle="{ 'width': '14rem' }">
        <template #body="{ data }">
          <InputCategory type="StorageArea" :multiple="true" v-model="data.storage_area_ids" />
        </template>
        <template #filter="{ filterModel }">
          <InputCategory type="StorageArea" v-model="filterModel.value" class="p-column-filter"
            placeholder="Storage Areas" :btnAdd="false" :showClear="false" />
        </template>
      </Column>

      <!-- Fixed Stock -->
      <Column v-if="isColumnVisible('fixed_stock')" field="fixed_stock" header="Fixed Stock" :sortable="true"
        style="max-width: 8rem">
        <template #body="{ data }">
          <div class="d-flex justify-content-center align-items-center h-100">
            <Checkbox :modelValue="!!data.fixed_stock" @update:modelValue="updateFixedStock(data, $event)"
              :binary="true" />
          </div>
        </template>
      </Column>

      <!-- Fixed Stock Value -->
      <Column v-if="isColumnVisible('fixed_stock_value')" field="fixed_stock_value" header="Fixed Stock Value"
        :sortable="true" style="max-width: 12rem">
        <template #body="{ data }">
          <div class="d-flex align-items-center">
            <InputNumber :modelValue="data.fixed_stock_value" @update:modelValue="updateFixedStockValue(data, $event)"
              :maxFractionDigits="5" class="w-50" :disabled="!data.fixed_stock" />
            <div class="w-50 px-2">{{ data.unit }}</div>
          </div>
        </template>
      </Column>

      <!-- Price -->
      <Column v-if="isColumnVisible('price')" field="price" header="Price" style="max-width: 10rem">
        <template #body="{ data }">
          <InputNumber :modelValue="getDisplayedPriceValue(data)" @update:modelValue="updateDraftPrice(data.id, $event)"
            @blur="commitDraftPrice(data)" :maxFractionDigits="2" class="w-50" />
          <div class="w-50">{{ "€/" + data.unit }}</div>
        </template>
      </Column>

      <!-- Actions -->
      <Column class="text-end" style="max-width: 40px" header="Actions">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" class="p-button-text" @click="$refs.form.show(data)" />
          <Button icon="pi pi-trash" class="p-button-text p-button-danger" @click="deleteProduct(data)" />
        </template>
      </Column>

      <!-- Recipies -->
      <Column v-if="isColumnVisible('recipies')" field="recipies" header="Used by" class="recipies">
        <template #body="{ data }">
          <Chip v-for="recipie in recipiesUsingProduct(data)" :key="`${data.id}_${recipie.id}`" :label="recipie.name"
            icon="pi pi-pencil" class="edit-recipie-chip" @click="$refs.recipieForm.show(recipie)"
            v-tooltip="'Edit this recipie'" />
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
import InputNumber from 'primevue/inputnumber'
import MultiSelect from 'primevue/multiselect'
import Checkbox from 'primevue/checkbox'
import ProductForm from './ProductForm.vue'
import InputSupplier from '@/components/InputSupplier.vue'
import InputCategory from '@/components/InputCategory.vue'
import InputUnit from '@/components/InputUnit.vue'
import RecipieForm from '@/views/recipies/RecipieForm.vue'

const PRODUCT_COLUMNS_STORAGE_KEY = 'productsIndexVisibleColumns'
const PRODUCT_COLUMN_OPTIONS = [
  { key: 'unit', label: 'Unit' },
  { key: 'category_id', label: 'Category' },
  { key: 'supplier_id', label: 'Supplier' },
  { key: 'packaging_reference', label: 'Packaging Name / Reference' },
  { key: 'packaging_conditioning', label: 'Packaging Conditioning' },
  { key: 'packaging_convert_to_piece', label: 'Convert to Piece' },
  { key: 'case_pack_size', label: 'Pieces per Case' },
  { key: 'price', label: 'Price' },
  { key: 'storage_area_ids', label: 'Storage Areas' },
  { key: 'fixed_stock', label: 'Fixed Stock' },
  { key: 'fixed_stock_value', label: 'Fixed Stock Value' },
  { key: 'recipies', label: 'Used by' },
]
const DEFAULT_VISIBLE_COLUMN_KEYS = ['category_id', 'supplier_id', 'storage_area_ids', 'recipies']

export default {
  components: {
    ProductForm, RecipieForm, InputSupplier, InputCategory, InputUnit, Chip, InputText, InputNumber, MultiSelect, Checkbox,
  },
  data() {
    return {
      loading: false,
      filters: {},
      productsChanged: [],
      priceDrafts: {},
      selectedColumnKeys: DEFAULT_VISIBLE_COLUMN_KEYS,
      availableColumns: PRODUCT_COLUMN_OPTIONS,
    }
  },
  created() {
    this.initFilters()
    this.selectedColumnKeys = this.loadSelectedColumnKeys()
  },
  watch: {
    selectedColumnKeys: {
      handler(value) {
        const validColumnKeys = this.getValidColumnKeys(value)
        if (JSON.stringify(validColumnKeys) !== JSON.stringify(value)) {
          this.selectedColumnKeys = validColumnKeys
          return
        }
        this.persistSelectedColumnKeys(validColumnKeys)
      },
      deep: true,
    },
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
    getValidColumnKeys(columnKeys) {
      const availableColumnKeys = this.availableColumns.map((column) => column.key)
      if (!Array.isArray(columnKeys)) return [...DEFAULT_VISIBLE_COLUMN_KEYS]

      const validKeys = columnKeys.filter((key, index) => availableColumnKeys.includes(key) && columnKeys.indexOf(key) === index)
      return validKeys.length > 0 ? validKeys : [...DEFAULT_VISIBLE_COLUMN_KEYS]
    },
    loadSelectedColumnKeys() {
      try {
        const savedValue = localStorage.getItem(PRODUCT_COLUMNS_STORAGE_KEY)
        if (!savedValue) return [...DEFAULT_VISIBLE_COLUMN_KEYS]
        return this.getValidColumnKeys(JSON.parse(savedValue))
      } catch (error) {
        return [...DEFAULT_VISIBLE_COLUMN_KEYS]
      }
    },
    persistSelectedColumnKeys(columnKeys) {
      localStorage.setItem(PRODUCT_COLUMNS_STORAGE_KEY, JSON.stringify(this.getValidColumnKeys(columnKeys)))
    },
    isColumnVisible(columnKey) {
      return this.selectedColumnKeys.includes(columnKey)
    },
    canShowCasePackSize(product) {
      return product.unit === 'piece' || !!product.packaging_convert_to_piece
    },
    updatePackagingConditioning(product, value) {
      product.packaging_conditioning = value
      if (!value) {
        product.packaging_convert_to_piece = false
        product.case_pack_size = null
      }
    },
    updatePackagingConvertToPiece(product, value) {
      if (!product.packaging_conditioning) {
        product.packaging_convert_to_piece = false
        product.case_pack_size = null
        return
      }
      product.packaging_convert_to_piece = value
      if (!this.canShowCasePackSize(product)) product.case_pack_size = null
    },
    getDisplayedCasePackSize(product) {
      return this.canShowCasePackSize(product) ? product.case_pack_size : null
    },
    updateCasePackSize(product, value) {
      product.case_pack_size = this.canShowCasePackSize(product) ? value : null
    },
    updateFixedStock(product, value) {
      product.fixed_stock = value
      if (!value) product.fixed_stock_value = null
    },
    updateFixedStockValue(product, value) {
      product.fixed_stock_value = product.fixed_stock ? value : null
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
    getDisplayedPriceValue(product) {
      return Object.prototype.hasOwnProperty.call(this.priceDrafts, product.id)
        ? this.priceDrafts[product.id]
        : this.$root.getCurrentProductPriceValue(product.id)
    },
    updateDraftPrice(productId, value) {
      this.priceDrafts = {
        ...this.priceDrafts,
        [productId]: value,
      }
    },
    clearDraftPrice(productId) {
      const remainingDrafts = { ...this.priceDrafts }
      delete remainingDrafts[productId]
      this.priceDrafts = remainingDrafts
    },
    commitDraftPrice(product) {
      if (!Object.prototype.hasOwnProperty.call(this.priceDrafts, product.id)) return

      const draftPrice = this.priceDrafts[product.id]
      const currentPrice = this.$root.getCurrentProductPriceValue(product.id)

      if (draftPrice != null && draftPrice !== '' && (currentPrice == null || Number(draftPrice) !== Number(currentPrice))) {
        this.$root.addProductPrice(draftPrice, product)
      }

      this.clearDraftPrice(product.id)
    },
  }
}
</script>

<style lang="scss">
.columns-selector.p-multiselect {
  font-weight: 600;
  background-color: var(--bluegray-500) !important;
  color: var(--bluegray-50);

  .p-multiselect-trigger {
    color: var(--bluegray-50);
  }
}

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
