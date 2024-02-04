<template>
  <div class="d-flex flex-column h-100 pb-4 mx-auto justify-content-between"
       style="max-width: 600px; max-height: 800px;">

    <!-- Header -->
    <div class="header">
      <div class="d-flex">
        <h1 class="m-0"><span class="d-none d-md-inline">Inventory - </span>{{ inventory.day_label }}
        </h1>
        <Button v-if="currentStorageArea" icon="pi pi-save" title="Save"
                class="p-button-success ms-auto"
                @click="save" :loading="saving" />
      </div>
      <h3 v-if="currentStorageArea">
        <i class=" me-2 fs-5 pi pi-map-marker"></i>
        {{ currentStorageArea.name }}
      </h3>
    </div>

    <!-- Choose Area -->
    <template v-if="!currentStorageArea">
      <div class="content">
        <h3 class="text-primary">
          <span v-if="allAreasCompleted">Inventory done !</span>
          <span v-else-if="noneAreaCompleted">Choose the Area to Start</span>
          <span v-else>Choose the Next Area</span>
        </h3>
        <div v-for="area in storageAreas" :key="area.id"
             @click="startArea(area)"
             class="storage-area-card border mb-3 rounded-3 p-3"
             :class="{ completed: isAreaCompleted(area) }">
          <i v-if="isAreaCompleted(area)" class="pi-check-circle pi me-2"></i>
          <i v-else class="pi-circle pi me-2"></i>
          {{ area.name }}
          <span class="float-end">
            {{ completedProductsForArea(area).length }} / {{ productsForArea(area).length }}
          </span>
        </div>
      </div>
      <div class="footer">
        <Button label="Save" class="w-100 p-button-success" @click="save" :loading="saving" />
      </div>
    </template>

    <!-- Fill Area Stocks -->
    <template v-if="currentStorageArea && inventory.values[currentProduct.id]">
      <!-- Stock & Unit inputs -->
      <div class="content">
        <h3 class="mb-4">{{ currentProduct.name }}</h3>
        <div class="p-inputgroup">
          <InputNumber v-model="inventory.values[currentProduct.id].value" :maxFractionDigits="5"
                       placeholder="Stock" ref="stockInput"
                       @keyup.enter="onInputStockKeyEnter" />
          <!-- <span class="p-inputgroup-addon" style="width: 5rem;" v-if="day"
              v-tooltip.top="'Theoretical stock'">{{ stockValueFor(stock.product_id) }}
          </span> -->
          <span class="p-inputgroup-addon" style="width: 5rem;">
            {{ inventory.values[currentProduct.id].unit }}
          </span>
        </div>
      </div>

      <!-- Navigation -->
      <div class="footer d-flex align-items-center justify-content-between">
        <Button label="Prev" icon="pi pi-chevron-left" class="p-button-secondary"
                @click="productIndex = Math.max(productIndex - 1, 0)"
                :disabled="productIndex == 0" />
        <div>{{ productIndex + 1 }} / {{ currentProducts.length }}</div>

        <Button v-if="productIndex == currentProducts.length - 1"
                label="Finish"
                @click="finishCurrentArea" ref="nextButton" />
        <Button v-else label="Next" icon="pi pi-chevron-right"
                @click="productIndex = productIndex + 1" ref="nextButton" />
      </div>
    </template>
  </div>
</template>

<script>
import InputNumber from 'primevue/inputnumber'
import StockMixin from '@/services/stocks-mixin'

export default {
  inject: ['sessionDays', 'stockDays', 'sessionInventories'],
  mixins: [StockMixin],
  components: { InputNumber },
  data() {
    return {
      inventory: {
        storage_area_ids: [],
        product_category_ids: [],
        supplier_ids: [],
        completed_storage_areas_ids: [],
        values: {},
      },
      otherArea: { name: 'Other Products', id: 'other' },
      currentStorageArea: undefined,
      productIndex: 0,
      saving: false,
    }
  },
  beforeMount() {
    this.inventory = this.sessionInventories.find((inv) => inv.id == this.$route.params.inventory_id)
    if (this.storageAreas.length === 1) this.currentStorageArea = this.storageAreas.at(0)
  },
  computed: {
    storageAreas() {
      let result = Object.values(this.$root.categories)
        .filter((c) => c.type === 'StorageArea')
        .sort((a, b) => a.name.localeCompare(b.name))

      if (this.inventory.storage_area_ids.length > 0) {
        result = result.filter((c) => this.inventory.storage_area_ids.includes(c.id))
      } else {
        result.push(this.otherArea)
      }

      return result
    },
    isAreaCompleteds() {
      return this.storageAreas.filter((area) => this.inventory.completed_storage_areas_ids.includes(area.id))
    },
    products() {
      let result = this.sessionProducts.map((productId) => this.$root.getProduct(productId))
      if (this.inventory.supplier_ids.length > 0) {
        result = result.filter((product) => this.inventory.supplier_ids.includes(product.supplier_id))
      }
      if (this.inventory.product_category_ids.length > 0) {
        result = result.filter((product) => this.inventory.product_category_ids.includes(product.category_id))
      }
      return result
    },
    // Products related to currentStorageArea
    currentProducts() {
      return this.currentStorageArea ? this.productsForArea(this.currentStorageArea) : []
    },
    currentProduct() {
      return this.currentProducts.at(this.productIndex) || {}
    },
    allAreasCompleted() {
      return this.storageAreas.length === this.isAreaCompleteds.length
    },
    noneAreaCompleted() {
      return this.isAreaCompleteds.length === 0
    },
  },
  methods: {
    startArea(area) {
      this.currentStorageArea = area
      this.productIndex = 0
      this.focusStockInput()
    },
    finishCurrentArea() {
      this.inventory.completed_storage_areas_ids.push(this.currentStorageArea.id)
      this.currentStorageArea = null
    },
    isAreaCompleted(area) {
      return this.inventory.completed_storage_areas_ids.includes(area.id)
    },
    productsForArea(area) {
      return this.products.filter((product) => {
        if (area.id === 'other') return product.storage_area_ids.length === 0
        return product.storage_area_ids.includes(area.id)
      })
    },
    completedProductsForArea(area) {
      return this.productsForArea(area).filter((product) => this.inventory.values[product.id]?.value)
    },
    async onInputStockKeyEnter() {
      await this.$nextTick()
      this.$refs.nextButton.$el.click()
    },
    focusStockInput() {
      this.$nextTick(() => {
        if (this.$refs.stockInput) this.$refs.stockInput.$refs.input.$el.focus()
      })
    },
    async save() {
      this.saving = true
      const inventoryToSave = { ...this.inventory }
      delete inventoryToSave.day_object
      delete inventoryToSave.day_label
      delete inventoryToSave.day_date
      const { error } = await this.$db.from('inventories')
        .update(inventoryToSave)
        .match({ id: this.inventory.id })

      if (error) this.toastError(error)
      else this.toastSuccess({ name: 'Inventory' }, 'saved')
      this.saving = false
    },
  },
  watch: {
    // initialize values for each product
    products() {
      if (!this.products || this.products.length == 0) return
      this.products.forEach((product) => { this.inventory.values[product.id] ||= { unit: product.unit } })
    },
    async currentProduct() {
      this.focusStockInput()
    },
  },
}
</script>
<style lang="scss" scoped>
.header {}

.content {
  text-align: center;
  padding-bottom: 20%;
}

.footer {}

.storage-area-card {
  background-color: white;
  text-align: left;

  &:hover {
    background-color: var(--primary-color);
    color: white;
    // background-color: var(--bluegray-100);
    // font-weight: bold;
    cursor: pointer;
  }

  &.completed {
    opacity: .5;
  }
}
</style>
