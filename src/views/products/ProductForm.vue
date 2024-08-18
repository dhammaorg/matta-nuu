<template>
  <Dialog v-model:visible="visible" :style="{ width: '600px' }" header="Product"
          :modal="true" class="p-fluid product-dialog">
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

      <div class="p-field-checkbox w-100 mb-3" v-if="product.packaging_conditioning">
        <Checkbox id="convert" v-model="product.packaging_convert_to_piece" :binary="true" />
        <label for="convert" class="ms-2">Convert "{{ product.packaging_conditioning }}{{
          product.unit
          }}" to 1 piece in orders</label>
      </div>

      <div class="p-field w-100 mt-0 mb-3">
        <label>Storage Areas</label>
        <InputCategory type="StorageArea" :multiple="true" v-model="product.storage_area_ids"
                       placeholder="Storage Areas" />
      </div>

      <!-- Unit Price -->
      <div class="p-field w-100 mt-0 mb-3">
        <label>Unit Price (Excluding Tax)</label>
        <div class="p-inputgroup">
          <InputNumber :value="getLastPriceValue(product)" disabled
                       placeholder="Unit Price (Excluding Tax)"
                       :maxFractionDigits="2" />

          <Button icon="pi pi-history" class="p-button-text"
                  @click="$refs.productsPriceHistoryForm.show(this.product)" />
        </div>

      </div>

    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false" />
      <Button label="Save" icon="pi pi-check" class="p-button-text" :loading="loading"
              @click="saveProduct" />
    </template>
  </Dialog>

  <ProductsPriceHistory @updatedPrices="handleUpdatedPrices" ref="productsPriceHistoryForm">
  </ProductsPriceHistory>
</template>

<script>

import InputNumber from 'primevue/inputnumber'
import Divider from 'primevue/divider'
import Checkbox from 'primevue/checkbox'
import InputUnit from '@/components/InputUnit.vue'
import InputSupplier from '@/components/InputSupplier.vue'
import InputCategory from '@/components/InputCategory.vue'
import Calendar from 'primevue/calendar';
import ProductsPriceHistory from './ProductsPriceHistory.vue'


export default {
  components: {
    InputUnit, InputSupplier, InputNumber, InputCategory, Divider, Checkbox, Calendar, ProductsPriceHistory,
  },
  data() {
    return {
      visible: false,
      loading: false,
      product: {},
    }
  },
  methods: {
    show(object = {}) {
      this.product = { ...object }
      this.visible = true
    },
    async saveProduct() {
      if (this.product.name) {
        if (this.product.id) {
          this.dbUpdate('products', this.product)
        } else {
          const newProduct = await this.dbCreate('products', this.product)
          this.$emit('created', newProduct)
        }
        this.visible = false
        this.product = {}
      }
    },
    handleUpdatedPrices(updatedProductData) {
      this.visible = false
      this.product = {}
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
      return lastPrice ? lastPrice.value + " € / " + product.unit : null;
    }
  },
  watch: {
    'product.packaging_conditioning': function (newVal, oldVal) {
      //  reset convert_to_piece to false when no packaging_conditioning is present
      if (!newVal) this.product.packaging_convert_to_piece = false
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
</style>
