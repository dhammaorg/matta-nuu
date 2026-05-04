<template>
  <div class="session-order mx-auto">

    <div class="mb-3 d-flex align-items-center">
      <div class="flex-grow-1">
        <Inplace :closable="true">
          <template #display>
            <h2 class="m-0 me-3 d-inline-flex align-items-center" title="Edit">
              {{ order.name }}
              <span class="ms-2 pi pi-pencil xs d-print-none"></span>
            </h2>
          </template>
          <template #content>
            <InputText v-model="order.name" autofocus />
          </template>
        </Inplace>
      </div>
      <div class="d-print-none">
        <Button class="p-button-text p-button-danger" icon="pi pi-trash" @click="destroy" />
        <Button label="Print" class="me-2" :disabled="values.length == 0" icon="pi pi-print" @click="print()" />
        <Button label="Save" class="p-button-success" icon="pi pi-save" @click="save" :loading="loading" />
      </div>
    </div>

    <p class="d-print-none" style="white-space: pre-line;">
      {{ supplier.description }}
    </p>

    <hr class="d-print-none">

    <div class="order-options mb-4 d-print-none">
      <div class="p-inputgroup mb-3">
        <span class="p-inputgroup-addon text-start">Delivery Date</span>
        <InputDay v-model="order.delivery_day" :days="stockDays" />
      </div>
      <div class="p-inputgroup mb-3">
        <span class="p-inputgroup-addon">Quantities until (last day included)</span>
        <InputDay v-model="order.target_day" :days="sessionDays" />
      </div>
      <div class="p-inputgroup mb-3">
        <span class="p-inputgroup-addon">Restrict to some categories</span>
        <InputCategory type="Product" :multiple="true" v-model="order.product_category_ids" :btnAdd="false" />
      </div>
      <div class="p-inputgroup mb-3">
        <span class="p-inputgroup-addon">Increase consumption by</span>
        <InputNumber v-model="order.increase_by_percent" :maxFractionDigits="2" />
        <span class="p-inputgroup-addon">%</span>
      </div>
      <div class="d-flex mb-3 gap-5">
        <span class="d-flex align-items-center">
          <Checkbox v-model="order.group_by_category" :binary="true" />
          <label class="ms-2">Group by category</label>
        </span>
        <span class="d-flex align-items-center">
          <Checkbox v-model="order.report_values_in_stocks" :binary="true" />
          <label class="ms-2">Report values in Stocks</label>
        </span>
        <span class="d-flex align-items-center">
          <Checkbox v-model="showPriceDetail" :binary="true" />
          <label class="ms-2">Price detail</label>
        </span>
        <Button label="Calculate" icon="pi pi-refresh" class="ms-auto p-button-secondary" @click="calculate"
          :loading="isCalculating" />
      </div>
    </div>

    <hr class="d-print-none">

    <div class="card">

      <div class="d-flex mb-4" style="white-space: pre-line;">
        <div class="orderer w-50">
          <div class="mb-2"><b>{{ $root.userData.org_name }}</b></div>
          {{ $root.userData.org_details }}
        </div>
        <div class="supplier w-50">
          <div class="mb-2"><b>{{ supplier.name }}</b></div>
          {{ supplier.contact_details }}
        </div>
      </div>

      <Textarea v-model="order.header" :autoResize="true" rows="1" placeholder="Header" class="w-100 mb-3" />

      <DataTable :value="values" class="mb-3 border border-bottom-0" :class="{ 'p-datatable-sm': values.length > 15 }"
        :rowGroupMode="order.group_by_category ? 'subheader' : null"
        :groupRowsBy="order.group_by_category ? 'category' : null">
        <Column field="name" header="Product" body-class="form-cell" style="width: 60%">
          <template #body="{ data }">
            <Textarea :value="data.name" :autoResize="true" rows="1" @change="data.name = $event.target.value"
              class="product-textarea" />
          </template>
        </Column>
        <Column field="value" header="Amount" class="text-center" body-class="form-cell">
          <template #body="{ data }">
            <InputNumber v-model="data.value" :maxFractionDigits="2" />
          </template>
        </Column>
        <Column field="unit" header="Unit" style="width: 250px; min-width: 250px" class="unit text-center"
          body-class="form-cell unit">
          <template #body="{ data }">
            <Dropdown v-model="data.unit" :options="rowUnitOptions(data)" optionLabel="label" optionValue="value"
              class="d-print-none" />
            <div class="text-center d-none d-print-block">{{ rowUnitLabel(data) }}</div>
          </template>
        </Column>
        <Column v-if="showPriceDetail" field="unitPrice" header="Price/Unit"
          class="price text-center d-print-none" body-class="price text-center d-print-none">
        </Column>
        <Column v-if="showPriceDetail" field="productPrice" header="Price"
          class="price text-center d-print-none" body-class="price text-center d-print-none">
          <template #body="{ data }">
            {{ data.productPrice }} €
          </template>
        </Column>
        <Column v-if="order.increase_by_percent > 0" field="neededIncreased" :header="`+${order.increase_by_percent}%`"
          class="needed text-center d-print-none" body-class="needed text-center d-print-none" />
        <Column field="needed" header="Needed" class="needed text-center d-print-none"
          body-class="needed text-center d-print-none" />
        <Column field="id" class="d-print-none actions w-auto" body-class="actions d-print-none">
          <template #body="{ data }">
            <Button icon="pi pi-times" class="p-button-text p-0" @click="deleteRow(data)" />
          </template>
        </Column>

        <template #empty>
          No products in this order yet
        </template>

        <template #groupheader="{ data }">
          <span>{{ data.category || "Autre" }}</span>
        </template>
      </DataTable>

      <div class="d-flex justify-content-between d-print-none">
        <div class="p-inputgroup d-inline-flex" style="width: 200px">
          <InputProduct v-model="newProduct" optionValue="" placeholder="Add Product" @keyup.enter="addProduct"
            :showClear="false" :editable="false" />
          <Button :disabled="!newProduct" icon="pi pi-plus" @click="addProduct" class="flex-shrink-0" />
        </div>

        <div class="fw-bold p-3 total-price ">
          <span>Total {{ orderTotalPrice }} €</span>
          <i v-if="missingProductPrices && missingProductPrices.length > 0" class="ms-2 pi pi-exclamation-triangle"
            v-tooltip="missingProductPrices" type="text"></i>
        </div>
      </div>

      <Textarea v-model="order.footer" :autoResize="true" rows="1" placeholder="Footer" class="mt-3 w-100" />
    </div>

  </div>
</template>

<script>

import Checkbox from 'primevue/checkbox'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Inplace from 'primevue/inplace'
import Textarea from 'primevue/textarea'
import InputDay from '@/components/InputDay.vue'
import InputProduct from '@/components/InputProduct.vue'
import StockMixin from '@/services/stocks-mixin'
import {
  canConvertToPiece, canUseCasePack, casePackFactor, convertToBestUnit, convertToUnit, normalizeQuantityUnit,
} from '@/services/units'
import InputCategory from '@/components/InputCategory.vue'

export default {
  inject: ['sessionDays', 'stockDays'],
  mixins: [StockMixin],
  components: {
    InputDay, InputProduct, InputNumber, Inplace, Checkbox, Textarea, InputCategory, Dropdown,
  },
  data() {
    return {
      order: {
        values: {},
      },
      showPriceDetail: false,
      newProduct: '',
      loading: false,
      isCalculating: false,
    }
  },
  async mounted() {
    this.fetchOrder(this.$route.params.order_id)
    this.$root.setPrintMode('portrait')
  },
  async beforeRouteUpdate(to, from) {
    await this.fetchOrder(to.params.order_id)
  },
  computed: {
    supplier() {
      return this.$root.getSupplier(this.order.supplier_id)
    },
    values() {
      let values = this.order.values || {}
      // Sort by key == product
      values = Object.keys(values).sort().reduce((result, key) => {
        result[key] = values[key]
        // Fix missing id bug, so adding it in case it was not there
        if (!result[key].id) result[key].id = key
        return result
      }, {})
      return Object.values(values).sort((a, b) => {
        // sort first by category (if groupBy activated), then by name
        const aValue = a.category || 'xxxx'
        const bValue = b.category || 'xxxx'
        if (!this.order.group_by_category || !aValue || aValue === bValue) {
          return a.name.localeCompare(b.name)
        }
        return aValue.localeCompare(bValue)
      })
    },
    orderTotalPrice() {
      let orderTotal = 0
      this.values.forEach(item => {
        if (item.productPrice && !isNaN(item.productPrice)) {
          orderTotal = Number(orderTotal) + Number(item.productPrice)
        }
      });
      return orderTotal.toFixed(2)
    },
    missingProductPrices() {
      return this.$root.getOrderMissingProductPrices(this.values)
    },
  },
  methods: {
    print() {
      this.$root.setPageTitle(this.order.name)
      window.print()
    },
    async fetchOrder(orderId) {
      let order = {}
      if (this.$root.orders[orderId]) {
        order = { ...this.$root.orders[orderId] }
      } else {
        const { data } = await this.$db.from('orders').select().match({ id: orderId }).single()
        if (data === null) {
          this.toastError('Could not find the order')
          this.order = { values: {} }
          this.$router.push({ name: 'session_orders', params: { id: this.$route.params.id } })
          return
        }
        order = this.fixData(data)
        order.values ||= {}
      }
      delete order.show_price_detail
      this.normalizeOrderValues(order)
      this.order = order
      const firstInit = Object.values(this.order.values || {}).length === 0

      if (firstInit && this.order.target_day) this.calculate()
    },
    calculate() {
      this.isCalculating = true
      setTimeout(() => {
        this.calculateAllStocks()
        this.order.values = {}
        this.stocks.forEach(({ product_id, values }) => {
          const product = this.$root.getProduct(product_id)
          if (product.supplier_id !== this.order.supplier_id) return
          if (this.order.product_category_ids.length > 0 &&
            !this.order.product_category_ids.includes(product.category_id)) return

          const targetStock = product.fixed_stock ? (product.fixed_stock_value || 0) : 0
          const needed = targetStock - (values[this.order.target_day] || {}).value
          const neededIncreased = targetStock - (values[this.order.target_day] || {}).valueIncreased

          if (neededIncreased > 0) {
            let targetValue = neededIncreased
            if (product.packaging_conditioning) {
              targetValue = Math.ceil(targetValue / product.packaging_conditioning) * product.packaging_conditioning
            } else if (canUseCasePack(product)) {
              targetValue = Math.ceil(targetValue / casePackFactor(product)) * casePackFactor(product)
            }
            let { unit, value } = convertToBestUnit(product.unit, targetValue)

            if (canUseCasePack(product)) {
              value = Math.ceil(targetValue / casePackFactor(product))
              unit = 'case'
            } else if (product.packaging_convert_to_piece) {
              value = Math.ceil(targetValue / product.packaging_conditioning)
              unit = 'piece'
            }

            const category = this.$root.getCategory(product.category_id)
            this.order.values[product_id] = {
              id: product.id,
              name: product.packaging_reference || product.name,
              category: category.name,
              value: Math.ceil(value),
              unit,
              needed: `${needed > 0 ? needed.toFixed(3) : '0'} ${product.unit}`,
              neededIncreased: `${neededIncreased.toFixed(3)} ${product.unit}`,
              unitPrice: this.displayUnitPrice(product.id, unit),
            }
          }
        })
        this.isCalculating = false
      }, 10)
    },
    async save() {
      this.normalizeOrderValues(this.order)
      this.dbUpdate('orders', this.order)
    },
    destroy() {
      this.$confirm.require({
        message: `Are you sure you want to delete ${this.order.name} ?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          this.dbDestroy('orders', this.order)
          this.$router.push({ name: 'session_orders', params: { id: this.$route.params.id } })
        },
      })
    },
    defaultOrderUnit(product = {}) {
      if (canUseCasePack(product)) return 'case'
      return canConvertToPiece(product) ? 'piece' : product.unit
    },
    pieceUnitLabel(product = {}) {
      if (product.unit === 'piece' || !product.packaging_conditioning) return 'piece'
      return `piece (${product.packaging_conditioning}${product.unit})`
    },
    caseUnitLabel(product = {}) {
      if (product.packaging_convert_to_piece && product.packaging_conditioning) {
        const totalCaseWeight = product.case_pack_size * product.packaging_conditioning
        const formattedWeight = totalCaseWeight.toLocaleString('fr-FR', { maximumFractionDigits: 5 })
        return `case of ${product.case_pack_size} (${formattedWeight} ${product.unit})`
      }
      return `case of ${product.case_pack_size}`
    },
    rowUnitOptions(row) {
      const product = this.$root.getProduct(row.id) || {}
      const options = []
      const seen = new Set()
      const addOption = (value, label = value) => {
        if (!value || seen.has(value)) return
        seen.add(value)
        options.push({ label, value })
      }
      const addStandardUnit = (unit) => {
        if (unit === 'piece' && canConvertToPiece(product)) {
          addOption(unit, this.pieceUnitLabel(product))
          return
        }
        if (unit === 'case' && canUseCasePack(product)) {
          addOption(unit, this.caseUnitLabel(product))
          return
        }
        addOption(unit)
      }

        ;[
          product.unit,
          row.unit,
        ].forEach((unit) => addStandardUnit(unit))

      if (canConvertToPiece(product)) addOption('piece', this.pieceUnitLabel(product))
      if (canUseCasePack(product)) addOption('case', this.caseUnitLabel(product))

      return options
    },
    rowUnitLabel(row) {
      const option = this.rowUnitOptions(row).find(({ value }) => value === row.unit)
      return option ? option.label : row.unit
    },
    normalizeOrderValues(order) {
      Object.values(order.values || {}).forEach((row) => {
        const product = this.$root.getProduct(row.id) || {}

        if (row.productPrice == null && row.total != null) row.productPrice = row.total
        delete row.total
        row.unit = normalizeQuantityUnit(row.unit, product)
        if (!row.unit) row.unit = this.defaultOrderUnit(product)
      })
    },
    addProduct() {
      if (this.order.values[this.newProduct.id]) {
        this.$toast.add({
          severity: 'error', summary: 'Error', detail: `"${this.newProduct.name}" is already in the order`, life: 4000,
        })
      } else {
        this.order.values[this.newProduct.id] = {
          id: this.newProduct.id,
          name: this.newProduct.packaging_reference || this.newProduct.name,
          unit: this.defaultOrderUnit(this.newProduct),
          unitPrice: this.displayUnitPrice(this.newProduct.id, this.defaultOrderUnit(this.newProduct)),
        }
      }
      this.newProduct = ''
    },
    deleteRow(row) {
      delete this.order.values[row.id]
    },
    displayUnitPrice(productId, unit = this.$root.getProduct(productId).unit) {
      const product = this.$root.getProduct(productId)
      const currentPrice = this.$root.getCurrentProductPriceValue(productId)
      const quantityInBaseUnit = convertToUnit(1, unit, product)

      if (currentPrice == null || quantityInBaseUnit == null) return null

      return `${(Number(currentPrice) * Number(quantityInBaseUnit)).toFixed(2)} €/${unit}`
    },
  },
  watch: {
    'values': {
      deep: true,
      handler(newValue, oldValue) {
        newValue.forEach(item => {
          item.unitPrice = this.displayUnitPrice(item.id, item.unit)
          item.productPrice = this.$root.computePrice(convertToUnit(item.value, item.unit, this.$root.getProduct(item.id)), item.id) ?? 0
        });
      },
    },
  },
}
</script>

<style lang='scss' scoped>
.session-order {
  max-width: 900px;
}

:deep(.form-cell.unit .p-dropdown),
:deep(.form-cell.unit .p-dropdown-label) {
  width: 100%;
}

::deep(.form-cell.unit .p-dropdown-label) {
  white-space: nowrap;
}

:deep(td.needed),
:deep(td.actions),
:deep(td.price),
.total-price {
  background-color: var(--indigo-50) !important;
}

.p-inputgroup-addon {
  background-color: var(--surface-b);
}

:deep(.p-input-group .p-dropdown) {
  background-color: var(--surface-b);
}

.order-options {
  margin: 0 auto;
  width: 80%;
  font-size: .9rem;

  .p-checkbox {
    transform: scale(0.8);
    height: 1rem;
    margin-top: -5px;
  }
}

:deep(.order-options) {

  .p-button,
  .p-multiselect,
  .p-inputtext {
    font-size: .9rem;
  }

  .p-multiselect {
    color: #4f4d47;
  }
}

:deep(td),
:deep(th) {
  min-width: 100px !important;
}

:deep(.form-cell.unit .p-inputtext) {
  justify-content: flex-end;
}

:deep(.p-rowgroup-header td) {
  background-color: transparent;
}

.product-textarea {
  border: none;
  border-radius: 0;
  width: 99%;

  &:focus {
    border: 1px solid black;
  }
}

::deep(td.unit),
::deep(th.unit) {
  white-space: nowrap;
}

@media print {
  .session-order {
    max-width: 700px;
    margin-top: 2rem;
  }

  ::deep(td.unit),
  ::deep(th.unit) {
    white-space: nowrap;
  }

  .card {
    margin-top: 2rem;
  }

  .p-inputtextarea {
    border: none;
    padding: 0px;
    margin-bottom: 0 !important;
    font-weight: 500;
  }

  table .p-inputtextarea {
    padding: 10px;
  }
}
</style>
