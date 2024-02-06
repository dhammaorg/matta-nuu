<template>
  <div class="d-flex flex-column h-100 pb-4 mx-auto justify-content-between"
       style="max-width: 600px; max-height: 800px;">

    <!-- Header -->
    <div class="header">
      <div class="d-flex">
        <h1 class="m-0">
          <span class="d-none d-md-inline">Inventory - </span>
          {{ this.stockDays.find((d) => d.id == inventory.day)?.dateHeader }}
        </h1>
        <div class="ms-auto">
          <Button icon="pi pi-pencil" title="Edit"
                  class="p-button-text p-button-secondary"
                  @click="$refs.form.show(inventory)" />
          <Button icon="pi pi-trash" title="Delete"
                  class="p-button-text p-button-danger me-3"
                  @click="destroy" :loading="loading" />
          <Button icon="pi pi-save" title="Save"
                  class="p-button-success"
                  @click="save" :loading="loading" />
        </div>
      </div>
      <h3 v-if="currentArea" class="d-flex align-items-center mt-0 pt-3">
        <i class=" me-2 fs-5 pi pi-map-marker"></i>
        {{ currentArea.name }}
        <Button v-if="areas.length > 1" icon="pi pi-pencil" title="Change Area"
                class="p-button-text p-button-secondary"
                @click="currentArea = null" />
        <Tag v-if="currentCategory" :value="currentCategory" class="ms-1 p-tag-secondary" />
      </h3>
    </div>

    <!-- Choose Area -->
    <template v-if="!currentArea">
      <div class="content">
        <h3 class="text-primary">
          <span v-if="allAreasCompleted">Inventory done !</span>
          <span v-else-if="noneAreaCompleted">Choose the Area to Start</span>
          <span v-else>Choose the Next Area</span>
        </h3>
        <div v-for="area in areas" :key="area.id"
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
        <Button label="Save" class="w-100 p-button-success" @click="save" :loading="loading" />
      </div>
    </template>

    <!-- Fill Area Stocks -->
    <template v-if="currentArea && (inventory.values[currentProduct.id] || {})[currentArea?.id]">
      <!-- Stock & Unit inputs -->
      <div class="content">
        <h3 class="mb-4">{{ currentProduct.name }}</h3>
        <!-- Unit -->
        <div v-if="currentProduct.packaging_convert_to_piece"
             class="d-flex align-items-center mb-4 justify-content-center">
          <RadioButton v-model="inventory.values[currentProduct.id][currentArea.id].unit"
                       id="unit-default" name="unit"
                       :value="currentProduct.unit" />
          <label for="unit-default" class="ms-2 me-4">{{ currentProduct.unit }}</label>
          <RadioButton v-model="inventory.values[currentProduct.id][currentArea.id].unit"
                       id="unit-piece" name="unit" value="piece" />
          <label for="unit-piece" class="ms-2">
            piece ({{ currentProduct.packaging_conditioning }}{{ currentProduct.unit }})
            <Tag :value="currentProduct.packaging_reference" class="ms-2 p-tag-secondary" />
          </label>
        </div>
        <!-- Stock -->
        <div class="p-inputgroup">
          <InputNumber v-model="inventory.values[currentProduct.id][currentArea.id].value"
                       :maxFractionDigits="5"
                       placeholder="Stock" ref="stockInput"
                       @keyup.enter="finishProduct" />
          <span class="p-inputgroup-addon" style="width: 5rem;">
            {{ inventory.values[currentProduct.id][currentArea.id].unit }}
          </span>
        </div>
        <!-- Theoritical Stock -->
        <div class="fst-italic mt-4">
          <template v-if="currentProduct.storage_area_ids.length <= 1">Theoritical Stock</template>
          <template v-else>Total Theoritical Stock ({{ currentProduct.storage_area_ids.map(id =>
            $root.getCategory(id).name).join(' + ') }})</template>
          = {{ currentTheoriticalStock }}
        </div>
      </div>

      <!-- Navigation -->
      <div class="footer d-flex align-items-center justify-content-between">
        <Button label="Prev" icon="pi pi-chevron-left" class="p-button-secondary"
                @click="productIndex = Math.max(productIndex - 1, 0)"
                :disabled="productIndex == 0" />
        <div>{{ productIndex + 1 }} / {{ currentProducts.length }}</div>

        <Button v-if="productIndex == currentProducts.length - 1" label="Finish"
                @click="finishProduct" />
        <Button v-else label="Next" icon="pi pi-chevron-right"
                @click="finishProduct" />
      </div>
    </template>
  </div>

  <InventoryNewDialog ref="form" @inventory-updated="onInventoryUpdated($event)" />
</template>

<script>
import InputNumber from 'primevue/inputnumber'
import Tag from 'primevue/tag'
import RadioButton from 'primevue/radiobutton'
import StockMixin from '@/services/stocks-mixin'
import InventoryNewDialog from './InventoryNewDialog.vue'

export default {
  inject: ['sessionInventories'],
  mixins: [StockMixin],
  components: {
    InputNumber, RadioButton, Tag, InventoryNewDialog,
  },
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
      currentArea: undefined,
      productIndex: 0,
      loading: false,
    }
  },
  beforeMount() {
    this.inventory = this.sessionInventories.find((inv) => inv.id == this.$route.params.inventory_id)
    // if (this.areas.length === 1) this.currentArea = this.areas.at(0)
  },
  computed: {
    areas() {
      let result = Object.values(this.$root.categories)
        .filter((c) => c.type === 'StorageArea')
        .sort((a, b) => a.name.localeCompare(b.name))

      let areasIdsInUse = this.products.reduce((acc, product) => acc.concat(product.storage_area_ids), [])
      areasIdsInUse = Array.from(new Set(areasIdsInUse))
      if (areasIdsInUse.lentgh > 0) result = result.filter((c) => areasIdsInUse.includes(c.id))

      if (this.inventory.storage_area_ids.length > 0) {
        result = result.filter((c) => this.inventory.storage_area_ids.includes(c.id))
      } else {
        result.push(this.otherArea)
      }

      return result
    },
    isAreaCompleteds() {
      return this.areas.filter((area) => this.inventory.completed_storage_areas_ids.includes(area.id))
    },
    products() {
      let result = this.sessionProducts.map((productId) => this.$root.getProduct(productId))
      if (this.inventory.supplier_ids.length > 0) {
        result = result.filter((product) => this.inventory.supplier_ids.includes(product.supplier_id))
      }
      if (this.inventory.product_category_ids.length > 0) {
        result = result.filter((product) => this.inventory.product_category_ids.includes(product.category_id))
      }
      result = result.sort((a, b) => {
        // sort first by category, then by name
        const aValue = this.$root.getCategory(a.category_id).name || 'xxxx'
        const bValue = this.$root.getCategory(b.category_id).name || 'xxxx'
        if (!aValue || aValue === bValue) {
          return a.name.localeCompare(b.name)
        }
        return aValue.localeCompare(bValue)
      })
      return result
    },
    // Products related to currentArea
    currentProducts() {
      return this.currentArea ? this.productsForArea(this.currentArea) : []
    },
    currentProduct() {
      return this.currentProducts.at(this.productIndex) || {}
    },
    currentCategory() {
      return this.$root.getCategory(this.currentProduct.category_id).name
    },
    currentUnit() {
      return this.inventory.values[this.currentProduct.id][this.currentArea.id].unit
    },
    currentValue() {
      return this.inventory.values[this.currentProduct.id][this.currentArea.id].value
    },
    currentTheoriticalStock() {
      const theoricValue = Math.max(0, this.theoricStockFor(this.currentProduct.id, this.inventory.day))
      const theoricLabel = `${theoricValue.round()} ${this.currentProduct.unit}`
      if (this.currentProduct.packaging_convert_to_piece && this.currentUnit === 'piece') {
        return `${(theoricValue / this.currentProduct.packaging_conditioning).round()} pieces (${theoricLabel})`
      }
      return theoricLabel
    },
    allAreasCompleted() {
      return this.areas.length === this.isAreaCompleteds.length
    },
    noneAreaCompleted() {
      return this.isAreaCompleteds.length === 0
    },
  },
  methods: {
    startArea(area) {
      this.currentArea = area
      this.productIndex = 0
      this.focusStockInput()
    },
    finishProduct() {
      const newStock = this.reCalculateStockFor(this.currentProduct.id, this.inventory.day)

      // If the product have only one storage area, then we got the whole stock for
      // this product, and we can compare it with theotical stock
      if (this.currentProduct.storage_area_ids.length <= 1) {
        const newValue = newStock.values[this.inventory.day]
        const theoricVal = Math.max(0, newValue.theoric)
        // Special case: if theoric is -5 but real stock is 0, then stockDiff will be big,
        // although it does not make sens to display the warning in such case cause
        // user will see theotic = 0, real = 0
        if (newValue.stockDiff > 0.3 && this.currentValue !== null && (theoricVal !== 0 || newValue.real !== 0)) {
          let theoric = `${theoricVal.round()} ${newStock.product_unit}`
          let real = `${newValue.real} ${newStock.product_unit}`
          if (this.currentProduct.packaging_convert_to_piece && this.currentUnit === 'piece') {
            theoric = `${(theoricVal / this.currentProduct.packaging_conditioning).round()} pieces (${theoric})`
            real = `${this.currentValue} (${real})`
          }
          this.$confirm.require({
            header: 'The stock seems wrong',
            message: `Theoretical stock is ${theoric}
              but you entered ${real}

              Are you sure this is the correct value?
            `,
            rejectLabel: 'Cancel',
            acceptLabel: "Yes I'm sure",
            accept: async () => {
              this.goToNextProductOrArea()
            },
          })
          return
        }
      }

      this.goToNextProductOrArea()
    },
    goToNextProductOrArea() {
      if (this.productIndex === this.currentProducts.length - 1) this.finishCurrentArea()
      else this.productIndex += 1
    },
    finishCurrentArea() {
      this.inventory.completed_storage_areas_ids.push(this.currentArea.id)
      this.currentArea = null
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
      return this.productsForArea(area).filter((product) => (this.inventory.values[product.id] || {})[area.id]?.value)
    },
    focusStockInput() {
      this.$nextTick(() => {
        if (this.$refs.stockInput) this.$refs.stockInput.$refs.input.$el.focus()
      })
    },
    async save() {
      this.dbUpdate('inventories', this.inventory)
    },
    destroy() {
      this.$confirm.require({
        message: 'Are you sure you want to this inventory ?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          this.dbDestroy('inventories', this.inventory)
          this.$router.push({ name: 'session_overview', params: { id: this.$route.params.id } })
        },
      })
    },
    onInventoryUpdated(data) {
      this.inventory = data
      this.currentArea = null
    },
  },
  watch: {
    // initialize values for each product
    products() {
      if (!this.products || this.products.length === 0) return
      this.products.forEach((product) => {
        const areasIds = product.storage_area_ids.length > 0 ? product.storage_area_ids : ['other']
        this.inventory.values[product.id] ||= {}
        areasIds.forEach((areaId) => {
          this.inventory.values[product.id][areaId] ||= { unit: product.unit }
        })
      })
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

.p-tag-secondary {
  color: inherit;
  background-color: var(--bluegray-100);
}

.p-confirm-dialog-message {
  margin-left: 0;
  line-height: 1.8;
}
</style>
