<template>
  <div class="text-center mx-auto" style="max-width: 600px;">
    <div class="d-flex mb-4">
      <h1 class="m-0">Inventory - {{ inventory.day_label }}</h1>
      <Button v-if="!finished" icon="pi pi-save" title="Save"
              class="p-button-success p-button-sm ms-auto"
              @click="save" :loading="saving" />
    </div>
    <h3 v-if="currentStorageArea" :class="{ 'text-primary': storageState === 'chooseNext' }">
      <i v-if="storageState === 'chooseNext'" class="pi pi-check-circle me-2 fs-5"></i>
      {{ currentStorageArea.name }}
    </h3>
    <div v-if="storageState == 'inProgress'">
      <Card class="shadow-none border" v-if="inventory.values[currentProduct.id]">
        <template #title>{{ currentProduct.name }}</template>
        <template #content>
          <div class="p-inputgroup">
            <InputNumber v-model="inventory.values[currentProduct.id].value" :maxFractionDigits="5"
                         placeholder="Stock" ref="stockInput"
                         @keyup.enter="onInputStockKeyEnter" />
            <!-- <span class="p-inputgroup-addon" style="width: 5rem;" v-if="day"
                v-tooltip.top="'Theoretical stock'">
            {{ stockValueFor(stock.product_id) }}
          </span> -->
            <span class="p-inputgroup-addon" style="width: 5rem;">
              {{ inventory.values[currentProduct.id].unit }}
            </span>
          </div>
        </template>
        <template #footer>
          <div class="d-flex align-items-center justify-content-between">
            <Button label="Prev" icon="pi pi-chevron-left" class="p-button-secondary"
                    @click="productIndex = Math.max(productIndex - 1, 0)"
                    :disabled="productIndex == 0" />
            <div>{{ productIndex + 1 }} / {{ currentProducts.length }}</div>

            <Button v-if="productIndex == currentProducts.length - 1"
                    label="Finish"
                    @click="finishArea" ref="nextButton" />
            <Button v-else label="Next" icon="pi pi-chevron-right"
                    @click="productIndex = productIndex + 1" ref="nextButton" />
          </div>
        </template>
      </Card>
    </div>

    <div class="text-center" v-if="storageState == 'chooseNext'">
      <template v-if="finished">
        <h1>Inventory is finished !</h1>
        <Button icon="pi pi-save" label="Save" class="p-button-success"
                @click="save" :loading="saving" />

      </template>
      <template v-else>
        <div class="p-field">
          <label>{{ currentStorageArea ? 'Next Storage is' : 'Choose the area to start' }}</label>
          <InputCategory type="StorageArea" v-model="nextStorageAreaId" :list="nextStorageAreas"
                         :btnAdd="false" :showClear="false" />
        </div>

        <Button label="Continue" class="w-100 mt-3"
                @click="currentStorageAreaId = nextStorageAreaId" />
      </template>
    </div>
  </div>
</template>

<script>
import Card from 'primevue/card'
import InputNumber from 'primevue/inputnumber'
import StockMixin from '@/services/stocks-mixin'
import InputCategory from '@/components/InputCategory.vue'

export default {
  inject: ['sessionDays', 'stockDays', 'sessionInventories'],
  mixins: [StockMixin],
  components: { Card, InputNumber, InputCategory },
  data() {
    return {
      inventory: {
        storage_area_ids: [],
        product_category_ids: [],
        supplier_ids: [],
        values: {},
      },
      completedStorageAreaIds: [],
      currentStorageAreaId: undefined,
      nextStorageAreaId: undefined,
      storageState: '',
      productIndex: 0,
      saving: false,
    }
  },
  beforeMount() {
    this.inventory = this.sessionInventories.find((inv) => inv.id == this.$route.params.inventory_id)
    this.nextStorageAreaId = this.nextStorageAreas.at(0)?.id
    if (this.storageAreas.length === 1) {
      this.currentStorageAreaId = this.storageAreas.at(0)
      this.storageState = 'inProgress'
    } else {
      this.storageState = 'chooseNext'
    }
  },
  computed: {
    storageAreas() {
      let result = Object.values(this.$root.categories).filter((c) => c.type === 'StorageArea')
      if (this.inventory.storage_area_ids.length > 0) {
        result = result.filter((c) => this.inventory.storage_area_ids.includes(c.id))
      } else {
        result.push({ name: 'Other Products', id: 'other' })
      }

      return result
    },
    currentStorageArea() {
      if (this.storageAreas.length === 1) return this.storageAreas.at(0)

      return this.storageAreas.find((area) => this.currentStorageAreaId == area.id)
    },
    nextStorageAreas() {
      return this.storageAreas.filter((area) => !this.completedStorageAreaIds.includes(area.id))
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
    currentProducts() {
      if (!this.currentStorageArea) return []

      return this.products.filter((product) => {
        if (this.currentStorageArea.id === 'other') return product.storage_area_ids.length == 0
        return product.storage_area_ids.includes(this.currentStorageArea.id)
      })
    },
    currentProduct() {
      return this.currentProducts.at(this.productIndex) || {}
    },
    finished() {
      return !this.nextStorageAreaId
    },
  },
  methods: {
    finishArea() {
      this.completedStorageAreaIds.push(this.currentStorageArea.id)
      this.nextStorageAreaId = this.nextStorageAreas.at(0)?.id
      this.storageState = 'chooseNext'
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
      this.saving = false
    },
  },
  watch: {
    products() {
      if (!this.products || this.products.length == 0) return

      this.products.forEach((product) => { this.inventory.values[product.id] ||= { unit: product.unit } })
    },
    currentStorageAreaId() {
      this.storageState = 'inProgress'
      this.productIndex = 0
    },
    async currentProduct() {
      this.focusStockInput()
    },
    async storageState() {
      if (this.storageState === 'inProgress') this.focusStockInput()
    },
  },
}
</script>
