<template>
  <Dialog v-model:visible="visible" :style="{ width: '600px' }" header="Product" :modal="true"
    class="p-fluid product-dialog">
    <div class="p-field">
      <InputText v-model.trim="product.name" required="true" placeholder="Name" autofocus />
    </div>

    <div class="p-field">
      <InputUnit v-model="product.unit" required="true" />
    </div>

    <Divider />

    <div class="product-form">
      <div class="p-field">
        <label>Category</label>
        <InputCategory type="Product" v-model="product.category_id" placeholder="Category" />
      </div>

      <div class="p-field">
        <label>Supplier</label>
        <InputSupplier v-model="product.supplier_id" />
      </div>

      <div class="p-field">
        <label>Packaging Name / Reference</label>
        <InputText v-model="product.packaging_reference" placeholder="Packaging Name / Reference" />
      </div>

      <div class="p-field">
        <label>Packaging Conditioning</label>
        <div class="p-inputgroup">
          <InputNumber v-model="product.packaging_conditioning" placeholder="Packaging Conditioning"
            :maxFractionDigits="5" />
          <span class="p-inputgroup-addon" style="width: 4rem;">{{ product.unit }}</span>
        </div>
      </div>

      <div class="p-field-checkbox w-100 mb-3 packaging-convert-field" v-if="product.packaging_conditioning">
        <Checkbox id="convert" v-model="product.packaging_convert_to_piece" :binary="true" />
        <label for="convert" class="ms-2 d-flex align-items-center gap-2">
          <span>Convert</span>
          <span class="packaging-chip">{{ product.packaging_conditioning }} {{ product.unit }}</span>
          <span>to 1 piece in orders</span>
        </label>
      </div>

      <div class="p-field w-100 mt-0 mb-3" v-if="showCasePackSize">
        <label>Pieces per Case</label>
        <div class="p-inputgroup">
          <InputNumber v-model="product.case_pack_size" placeholder="Pieces per Case" :min="2" :maxFractionDigits="0" />
          <span class="p-inputgroup-addon">Supplier sells this product by case of N pieces.</span>
        </div>
      </div>

      <div class="p-field w-100 mt-0 mb-3">
        <label>Price <span v-if="productPriceDate">({{ productPriceDate }})</span></label>
        <div class="p-inputgroup">
          <InputNumber v-model="productPriceValue" placeholder="Price" :maxFractionDigits="2" />
          <Dropdown v-if="getPriceInputUnitOptions().length > 1" :modelValue="productPriceInputUnit"
            @update:modelValue="syncProductPriceInputUnit($event)" :options="getPriceInputUnitOptions()"
            optionLabel="label" optionValue="value" class="price-unit-dropdown" />
          <span v-else class="p-inputgroup-addon" style="width: 6rem;">€ / {{ product.unit }}</span>
          <Button icon="pi pi-history" v-if="product.id && product.prices && product.prices.length > 0"
            @click="$refs.productsPriceHistoryForm.show(this.product)" />
        </div>
      </div>

      <div class="p-field w-100 mt-0 mb-3">
        <label>Storage Areas</label>
        <InputCategory type="StorageArea" :multiple="true" v-model="product.storage_area_ids"
          placeholder="Storage Areas" />
      </div>

      <div class="p-field-checkbox w-100 mb-3">
        <Checkbox id="fixed_stock" v-model="product.fixed_stock" :binary="true" />
        <label for="fixed_stock" class="ms-2">Fixed Stock</label>
      </div>

      <div class="p-field w-100 mt-0" v-if="product.fixed_stock">
        <label>Fixed Stock Value</label>
        <div class="p-inputgroup">
          <InputNumber v-model="product.fixed_stock_value" placeholder="Target stock level" :maxFractionDigits="5" />
          <span class="p-inputgroup-addon" style="width: 4rem;">{{ product.unit }}</span>
        </div>
      </div>


    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false" />
      <Button label="Save" icon="pi pi-check" class="p-button-text" :loading="loading" @click="saveProduct" />
    </template>
  </Dialog>

  <ProductsPriceHistory @updatedPrices="handleUpdatedPrices" ref="productsPriceHistoryForm">
  </ProductsPriceHistory>
</template>

<script>

import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Divider from 'primevue/divider'
import Checkbox from 'primevue/checkbox'
import InputUnit from '@/components/InputUnit.vue'
import InputSupplier from '@/components/InputSupplier.vue'
import InputCategory from '@/components/InputCategory.vue'
import ProductsPriceHistory from './ProductsPriceHistory.vue'
import {
  canUsePiecePrice, convertPriceFromBaseUnit, convertPriceToBaseUnit, normalizePriceInputUnit,
} from '@/services/units'

const PRODUCT_PRICE_INPUT_UNIT_STORAGE_KEY = 'productPriceInputUnits'


export default {
  components: {
    InputUnit, InputSupplier, InputNumber, InputCategory, Divider, Checkbox, ProductsPriceHistory, Dropdown,
  },
  emits: ['created'],
  data() {
    return {
      visible: false,
      loading: false,
      product: {},
      productPriceValue: null,
      productPriceDate: null,
      productPriceInputUnit: 'base',
    }
  },
  methods: {
    show(object = {}) {
      this.product = { ...object }
      this.visible = true
      this.productPriceInputUnit = this.getSavedProductPriceInputUnit(this.product.id)
      this.syncProductPriceInputUnit()
      this.productPriceValue = this.getDisplayedProductPriceValue(this.product.id)
      this.productPriceDate = this.formatDate(this.$root.getCurrentProductPriceDate(this.product.id))
    },
    canShowCasePackSize() {
      return this.product.unit === 'piece' || !!this.product.packaging_convert_to_piece
    },
    getPriceInputUnitOptions(product = this.product) {
      const options = [
        { label: `EUR / ${product.unit || 'unit'}`, value: 'base' },
      ]
      if (canUsePiecePrice(product)) options.push({ label: 'EUR / piece', value: 'piece' })
      return options
    },
    getSavedPriceInputUnits() {
      try {
        return JSON.parse(localStorage.getItem(PRODUCT_PRICE_INPUT_UNIT_STORAGE_KEY) || '{}')
      } catch (error) {
        return {}
      }
    },
    getSavedProductPriceInputUnit(productId) {
      if (!productId) return 'base'
      return this.getSavedPriceInputUnits()[productId] || 'base'
    },
    persistProductPriceInputUnit(productId, priceInputUnit) {
      if (!productId) return
      const priceInputUnits = this.getSavedPriceInputUnits()
      priceInputUnits[productId] = normalizePriceInputUnit(priceInputUnit, this.product)
      localStorage.setItem(PRODUCT_PRICE_INPUT_UNIT_STORAGE_KEY, JSON.stringify(priceInputUnits))
    },
    getDisplayedProductPriceValue(productId) {
      const currentPrice = this.$root.getCurrentProductPriceValue(productId)
      return convertPriceFromBaseUnit(currentPrice, this.productPriceInputUnit, this.product)
    },
    syncProductPriceInputUnit(nextUnit = this.productPriceInputUnit, previousPieceConditioning = this.product.packaging_conditioning) {
      const previousUnit = this.productPriceInputUnit
      const normalizedUnit = normalizePriceInputUnit(nextUnit, this.product)
      let basePrice = this.productPriceValue

      if (basePrice != null && basePrice !== '') {
        if (previousUnit === 'piece' && previousPieceConditioning) {
          basePrice = Number(basePrice) / Number(previousPieceConditioning)
        } else {
          basePrice = Number(basePrice)
        }
      }

      this.productPriceInputUnit = normalizedUnit
      this.productPriceValue = convertPriceFromBaseUnit(basePrice, normalizedUnit, this.product)
      this.persistProductPriceInputUnit(this.product.id, normalizedUnit)
    },
    async saveProduct() {
      if (this.product.name) {
        const currentProductPriceValue = this.$root.getCurrentProductPriceValue(this.product.id)
        const nextProductPriceValue = convertPriceToBaseUnit(this.productPriceValue, this.productPriceInputUnit, this.product)
        if (!this.canShowCasePackSize()) this.product.case_pack_size = null
        else if (!this.product.case_pack_size || this.product.case_pack_size < 2) this.product.case_pack_size = null
        else this.product.case_pack_size = Math.round(this.product.case_pack_size)
        if (nextProductPriceValue != null
          && nextProductPriceValue !== ''
          && !(Number(nextProductPriceValue) === Number(currentProductPriceValue))) {
          this.$root.addProductPrice(nextProductPriceValue, this.product)
        } else if ((nextProductPriceValue == null || nextProductPriceValue === '')
          && currentProductPriceValue != null) {
          if (!Array.isArray(this.product.prices)) {
            this.product.prices = []
          }
          this.product.prices = this.$root.normalizeProductPrices(this.product.prices)
          const today = new Date()
          const mostRecentPrice = this.product.prices[0]
          if (mostRecentPrice && mostRecentPrice.date && today.equals(mostRecentPrice.date)) {
            mostRecentPrice.value = null
          } else {
            this.product.prices.push({
              date: today,
              value: null,
            })
          }
          this.product.prices = this.$root.normalizeProductPrices(this.product.prices)
        }
        if (this.product.id) {
          this.dbUpdate('products', this.product)
          this.persistProductPriceInputUnit(this.product.id, this.productPriceInputUnit)
        } else {
          const newProduct = await this.dbCreate('products', this.product)
          this.persistProductPriceInputUnit(newProduct?.id, this.productPriceInputUnit)
          this.$emit('created', newProduct)
        }
        this.visible = false
        this.product = {}
      }
    },
    handleUpdatedPrices(updatedProductPrices) {
      this.product.prices = updatedProductPrices
      this.productPriceValue = this.getDisplayedProductPriceValue(this.product.id)
      this.productPriceDate = this.formatDate(this.$root.getCurrentProductPriceDate(this.product.id))
    },
    formatDate(dateString) {
      return dateString ? new Intl.DateTimeFormat('default', { dateStyle: 'short' }).format(new Date(dateString)) : null;
    },
  },
  computed: {
    showCasePackSize() {
      return this.canShowCasePackSize()
    },
  },
  watch: {
    'product.packaging_conditioning': function (newVal, oldVal) {
      if (!newVal) this.product.packaging_convert_to_piece = false
      this.syncProductPriceInputUnit(this.productPriceInputUnit, oldVal)
    },
    'product.packaging_convert_to_piece': function () {
      this.syncProductPriceInputUnit()
    },
    'product.unit': function () {
      this.syncProductPriceInputUnit()
    },
    'product.fixed_stock': function (newVal) {
      if (!newVal) this.product.fixed_stock_value = null
    },
  },
}
</script>

<style lang='scss'>
.product-form {
  display: flex;
  flex-wrap: wrap;

  .p-field:not(.w-100) {
    width: calc(50% - .5rem);
    margin: 0 0 1rem 0 !important;

    &:nth-child(even) {
      margin-left: 1rem !important;
    }
  }
}

.packaging-convert-field {
  .packaging-chip {
    display: inline-flex;
    align-items: center;
    padding: .1rem .5rem;
    border-radius: 999px;
    background: var(--bluegray-600);
    color: white;
    font-size: .85rem;
    line-height: 1.2;
    font-weight: 600;
  }
}

.price-unit-dropdown {
  min-width: 9.5rem;
}
</style>
