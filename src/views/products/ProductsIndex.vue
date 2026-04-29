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
          <InputUnit :modelValue="data.unit" @update:modelValue="updateUnit(data, $event)" />
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

      <!-- Price -->
      <Column v-if="isColumnVisible('price')" field="price" header="Price" style="max-width: 10rem">
        <template #body="{ data }">
          <div class="d-flex flex-nowrap align-items-center product-price-row">
            <InputNumber class="product-price-input flex-shrink-1" :modelValue="getDisplayedPriceValue(data)"
              @update:modelValue="updateDraftPrice(data, $event)" @blur="commitDraftPrice(data)" :maxFractionDigits="2"
              inputClass="pe-1 product-price-input-field text-start" />
            <Dropdown v-if="getPriceInputUnitOptions(data).length > 1" :modelValue="getPriceInputUnit(data)"
              @update:modelValue="syncPriceInputUnit(data, $event)" :options="getPriceInputUnitOptions(data)"
              optionLabel="label" optionValue="value" class="product-price-unit-dropdown" />
            <span v-else class="product-price-unit-label">{{ `€/${getDisplayedPriceUnitLabel(data)}` }}</span>
          </div>
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
              :maxFractionDigits="5" :disabled="!data.fixed_stock" />
            <div class="px-3">{{ data.unit }}</div>
          </div>
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
import Dropdown from 'primevue/dropdown'
import ProductForm from './ProductForm.vue'
import InputSupplier from '@/components/InputSupplier.vue'
import InputCategory from '@/components/InputCategory.vue'
import InputUnit from '@/components/InputUnit.vue'
import RecipieForm from '@/views/recipies/RecipieForm.vue'
import {
  canUseParentPrice, canUsePiecePrice, convertPriceFromBaseUnit, convertPriceToBaseUnit, getDefaultPriceInputUnit, getPriceInputUnitLabel, normalizePriceInputUnit, unitParent,
} from '@/services/units'

const PRODUCT_COLUMNS_STORAGE_KEY = 'productsIndexVisibleColumns'
const PRODUCT_PRICE_INPUT_UNIT_STORAGE_KEY = 'productPriceInputUnits'
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

/** Plain ISO strings for jsonb — avoids losing nested Date objects during bulk upsert */
function serializePriceHistoryForUpsert(prices) {
  if (!Array.isArray(prices)) return prices
  return prices.map((price) => ({
    ...price,
    date:
      price.date instanceof Date
        ? price.date.toISOString()
        : price.date,
  }))
}

function serializeProductRowForUpsert(product) {
  return {
    ...product,
    prices: serializePriceHistoryForUpsert(product.prices),
  }
}

export default {
  components: {
    ProductForm, RecipieForm, InputSupplier, InputCategory, InputUnit, Chip, InputText, InputNumber, MultiSelect, Checkbox, Dropdown,
  },
  data() {
    return {
      loading: false,
      filters: {},
      productsChanged: [],
      priceDrafts: {},
      priceInputUnits: {},
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
    updateUnit(product, value) {
      product.unit = value
      this.syncPriceInputUnit(product)
    },
    updatePackagingConditioning(product, value) {
      product.packaging_conditioning = value
      if (!value) {
        product.packaging_convert_to_piece = false
        product.case_pack_size = null
      }
      this.syncPriceInputUnit(product)
    },
    updatePackagingConvertToPiece(product, value) {
      if (!product.packaging_conditioning) {
        product.packaging_convert_to_piece = false
        product.case_pack_size = null
        this.syncPriceInputUnit(product)
        return
      }
      product.packaging_convert_to_piece = value
      if (!this.canShowCasePackSize(product)) product.case_pack_size = null
      this.syncPriceInputUnit(product)
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
      Object.keys(this.priceDrafts).forEach((draftProductId) => {
        const product = this.$root.products[draftProductId]
        if (product) this.commitDraftPrice(product)
      })

      const rows = this.$root.productsArray.map((product) => serializeProductRowForUpsert(product))
      const { error } = await this.$db.from('products').upsert(rows)
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
    getSavedPriceInputUnits() {
      try {
        return JSON.parse(localStorage.getItem(PRODUCT_PRICE_INPUT_UNIT_STORAGE_KEY) || '{}')
      } catch (error) {
        return {}
      }
    },
    getSavedProductPriceInputUnit(productId) {
      const product = this.$root.products[productId]
      if (!productId || !product) return 'base'
      return this.getSavedPriceInputUnits()[productId] || getDefaultPriceInputUnit(product)
    },
    persistProductPriceInputUnit(productId, priceInputUnit, product) {
      if (!productId) return
      const priceInputUnits = this.getSavedPriceInputUnits()
      priceInputUnits[productId] = normalizePriceInputUnit(priceInputUnit, product)
      localStorage.setItem(PRODUCT_PRICE_INPUT_UNIT_STORAGE_KEY, JSON.stringify(priceInputUnits))
    },
    getPriceInputUnitOptions(product) {
      const options = []
      if (canUseParentPrice(product)) {
        options.push({ label: `€/${unitParent(product.unit)}`, value: 'parent' })
      } else {
        options.push({ label: `€/${product.unit || 'unit'}`, value: 'base' })
      }
      if (canUsePiecePrice(product)) options.push({ label: '€/piece', value: 'piece' })
      return options
    },
    getDisplayedPriceUnitLabel(product) {
      return getPriceInputUnitLabel(this.getPriceInputUnit(product), product)
    },
    getPriceInputUnit(product) {
      return normalizePriceInputUnit(
        this.priceInputUnits[product.id] || this.getSavedProductPriceInputUnit(product.id),
        product,
      )
    },
    syncPriceInputUnit(product, nextUnit = null) {
      const normalizedUnit = normalizePriceInputUnit(nextUnit || this.getPriceInputUnit(product), product)
      this.priceInputUnits = {
        ...this.priceInputUnits,
        [product.id]: normalizedUnit,
      }
      this.persistProductPriceInputUnit(product.id, normalizedUnit, product)
    },
    getDisplayedPriceValue(product) {
      const priceInputUnit = this.getPriceInputUnit(product)
      const basePrice = Object.prototype.hasOwnProperty.call(this.priceDrafts, product.id)
        ? this.priceDrafts[product.id]
        : this.$root.getCurrentProductPriceValue(product.id)
      return convertPriceFromBaseUnit(basePrice, priceInputUnit, product)
    },
    updateDraftPrice(product, value) {
      this.priceDrafts = {
        ...this.priceDrafts,
        [product.id]: convertPriceToBaseUnit(value, this.getPriceInputUnit(product), product),
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

    .product-price-row {
      gap: 0.125rem;
      min-width: 0;

      .product-price-input.p-inputnumber {
        flex: 1 1 35%;
        min-width: 0;
        width: auto !important;
        max-width: 100%;
      }

      .product-price-input-field {
        min-width: 0;
        text-align: left !important;
      }

      .product-price-input .p-inputnumber-input {
        text-align: left !important;
      }

      .product-price-unit-label {
        flex: 0 0 auto;
        padding-right: 1rem;
        line-height: 1.2;
        white-space: nowrap;
      }

      .product-price-unit-dropdown.p-dropdown {
        flex: 0 0 auto;
        width: auto !important;
        min-width: 0 !important;

        .p-dropdown-label {
          padding: 0.2rem .5rem 0.2rem 0.3rem !important;
          line-height: 1.2 !important;
        }

        .p-dropdown-trigger {
          width: auto !important;
          padding: 0 0.5rem 0 0 !important;

          .pi {
            font-size: 0.75rem !important;
          }
        }
      }
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
