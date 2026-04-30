<template>
  <Dialog v-model:visible="visible" :style="{ width: '1100px', maxWidth: '95vw' }"
    :header="`Price History for ${product.name}`" position="top" :modal="true" class="p-fluid">

    <Button icon="pi pi-plus" class="p-button-primary p-button-sm w-auto" label="Price" @click="newRow">
    </Button>

    <DataTable :value="product.prices" class="price-history-table mt-3" responsiveLayout="scroll" showGridlines>
      <Column header="Date" headerStyle="width: 12rem">
        <template #body="{ data }">
          <Calendar v-model="data.date" required="true" dateFormat="d MM yy" placeholder="Date"
            class="w-100" inputClass="history-input history-date-input" />
        </template>
      </Column>

      <Column header="Value" headerStyle="width: 14rem">
        <template #body="{ data }">
          <div class="p-inputgroup value-input-group">
            <InputNumber v-model="data.value" :maxFractionDigits="2" placeholder="Value"
              inputClass="history-input history-value-input" />
            <span class="p-inputgroup-addon">€ / {{ displayedPriceUnitLabel }}</span>
          </div>
        </template>
      </Column>

      <Column header="Packaging Name / Reference">
        <template #body="{ data }">
          <InputText v-model.trim="data.packaging_reference" class="history-input w-100" />
        </template>
      </Column>

      <Column header="Supplier">
        <template #body="{ data }">
          <InputText v-model.trim="data.supplier_name" class="history-input w-100" />
        </template>
      </Column>

      <Column header="Actions" headerStyle="width: 5rem">
        <template #body="{ data }">
          <Button icon="pi pi-times" class="p-button-text p-button-danger" @click="removeRow(data)" />
        </template>
      </Column>
    </DataTable>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false" />
      <Button label="Save" icon="pi pi-check" class="p-button-text" :loading="loading" @click="savePrice" />
    </template>
  </Dialog>
</template>

<script>

import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'
import { convertPriceFromBaseUnit, convertPriceToBaseUnit, getDefaultPriceInputUnit, getPriceInputUnitLabel } from '@/services/units'

export default {
  components: {
    InputNumber, Calendar,
  },
  data() {
    return {
      visible: false,
      loading: false,
      product: {},
    }
  },
  computed: {
    displayedPriceUnitLabel() {
      return getPriceInputUnitLabel(this.getHistoryPriceInputUnit(), this.product)
    },
  },
  methods: {
    getCurrentSupplierName(product = this.product) {
      return this.$root.getSupplier(product?.supplier_id)?.name || ''
    },
    getDefaultPriceHistoryFields(product = this.product) {
      return {
        packaging_reference: product?.packaging_reference || '',
        supplier_name: this.getCurrentSupplierName(product),
      }
    },
    getHistoryPriceInputUnit(product = this.product) {
      return getDefaultPriceInputUnit(product)
    },
    cloneEditablePrices(prices = []) {
      return prices.map((price) => ({
        ...price,
        date: price?.date ? new Date(price.date) : null,
        value:
          price?.value == null || price?.value === ''
            ? price?.value
            : Number(price.value),
        packaging_reference: price?.packaging_reference || '',
        supplier_name: price?.supplier_name || '',
      }))
    },
    clonePrices(prices = [], product = this.product) {
      const priceInputUnit = this.getHistoryPriceInputUnit(product)

      return this.cloneEditablePrices(prices).map((price) => ({
        ...price,
        value:
          price?.value == null || price?.value === ''
            ? price?.value
            : convertPriceFromBaseUnit(price.value, priceInputUnit, product),
      }))
    },
    show(object = {}) {
      this.product = {
        ...object,
        prices: Array.isArray(object.prices) && object.prices.length > 0
          ? this.clonePrices(object.prices, object)
          : [this.getDefaultPriceHistoryFields(object)],
      }
      this.visible = true
    },
    newRow() {
      this.product.prices.push(this.getDefaultPriceHistoryFields())
    },
    async savePrice() {
      if (!this.product.prices) return

      const priceInputUnit = this.getHistoryPriceInputUnit()
      this.product.prices = this.$root.normalizeProductPrices(
        this.cloneEditablePrices(this.product.prices)
          .filter((p) => p.date)
          .map((price) => ({
            ...price,
            value:
              price.value == null || price.value === ''
                ? null
                : convertPriceToBaseUnit(price.value, priceInputUnit, this.product),
          })),
      )

      if (this.product.id) {
        await this.dbUpdate('products', this.product)
        this.$emit('updatedPrices', this.product.prices)
        this.visible = false
        this.product = { prices: [{}] }
      }
    },
    removeRow(price) {
      this.product.prices = this.product.prices.filter((p) => p !== price)
    },
  },
}
</script>

<style lang="scss">
.price-history-table {
  .p-datatable-thead>tr>th,
  .p-datatable-tbody>tr>td {
    border-color: var(--gray-400) !important;
    text-align: left;
  }

  .p-datatable-thead>tr>th {
    background-color: var(--surface-ground);
    color: black;
    font-weight: 600;
    white-space: nowrap;
  }

  .p-datatable-tbody>tr>td {
    padding: .5rem;
    vertical-align: top;
  }

  .p-calendar,
  .p-inputnumber,
  .p-inputgroup {
    width: 100%;
  }

  .history-input,
  .history-date-input,
  .history-value-input,
  .p-inputgroup-addon {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
    text-align: left !important;
  }

  .history-input,
  .history-date-input,
  .history-value-input {
    padding-left: 0;
    padding-right: 0;
  }

  .value-input-group .p-inputgroup-addon {
    white-space: nowrap;
    padding-left: 0;
  }
}
</style>
