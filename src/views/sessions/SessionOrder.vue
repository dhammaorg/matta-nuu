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
        <Button label="Print" class="me-2" :disabled="values.length == 0" icon="pi pi-print"
                @click="print()" />
        <Button label="Save" class="p-button-success" icon="pi pi-save" @click="save"
                :loading="loading" />
      </div>
    </div>

    <p class="d-print-none">
      {{ supplier.description }}
    </p>

    <hr class="d-print-none">

    <div class="order-options mb-4 d-print-none">
      <div class="p-inputgroup mb-3">
        <span class="p-inputgroup-addon text-start">Delivery Date</span>
        <InputDay v-model="order.delivery_day" :days="stockDays" />
        <span class="p-inputgroup-addon w-auto">
          <Checkbox v-model="order.report_values_in_stocks" :binary="true" />
          <label class="ms-2">Report values in Stocks</label>
        </span>
      </div>
      <div class="p-inputgroup mb-4">
        <span class="p-inputgroup-addon">Quantities until (last day included)</span>
        <InputDay v-model="order.target_day" :days="sessionDays" />
        <Button label="Calculate" icon="pi pi-refresh" class="p-button-secondary" @click="calculate"
                :loading="isCalculating" />
      </div>
      <div class="p-inputgroup mb-3 justify-content-center">
        <Checkbox v-model="order.group_by_category" :binary="true" />
        <label class="ms-2">Group by category</label>
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

      <Textarea v-model="order.header" :autoResize="true" rows="1" placeholder="Header"
                class="w-100 mb-3" />

      <DataTable :value="values" class="mb-3 border border-bottom-0"
                 :class="{ 'p-datatable-sm': values.length > 15 }"
                 :rowGroupMode="order.group_by_category ? 'subheader' : null"
                 :groupRowsBy="order.group_by_category ? 'category' : null">
        <Column field="name" header="Product" body-class="form-cell" style="width: 80%">
          <template #body="{ data }">
            <InputText v-model="data.name" class="text-start" />
          </template>
        </Column>
        <Column field="value" header="Amount" class="text-center" body-class="form-cell">
          <template #body="{ data }">
            <InputNumber v-model="data.value" :maxFractionDigits="2" />
          </template>
        </Column>
        <Column field="unit" header="Unit" style="max-width: 50px" class="unit text-center"
                body-class="form-cell">
          <template #body="{ data }">
            <InputUnit v-model="data.unit" :only-siblings="true" class="d-print-none" />
            <div class="text-center d-none d-print-block">{{ data.unit }}</div>
          </template>
        </Column>
        <Column field="needed" header="Needed" class="needed text-center d-print-none" />
        <Column field="id" class="d-print-none actions w-auto">
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
          <InputProduct v-model="newProduct" optionValue="" placeholder="Add Product"
                        @keyup.enter="addProduct"
                        :showClear="false" :editable="false" />
          <Button :disabled="!newProduct" icon="pi pi-plus" @click="addProduct"
                  class="flex-shrink-0" />
        </div>
      </div>

      <Textarea v-model="order.footer" :autoResize="true" rows="1" placeholder="Footer"
                class="mt-3 w-100" />
    </div>

  </div>
</template>

<script>

import Checkbox from 'primevue/checkbox'
import InputNumber from 'primevue/inputnumber'
import Inplace from 'primevue/inplace'
import Textarea from 'primevue/textarea'
import InputDay from '@/components/InputDay.vue'
import InputProduct from '@/components/InputProduct.vue'
import StockMixin from '@/services/stocks-mixin'
import { convertToBestUnit } from '@/services/units'
import InputUnit from '@/components/InputUnit.vue'

export default {
  inject: ['sessionDays', 'stockDays'],
  mixins: [StockMixin],
  components: {
    InputDay, InputProduct, InputNumber, Inplace, Checkbox, Textarea, InputUnit,
  },
  data() {
    return {
      order: {
        values: {},
      },
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
          const needed = 0 - (values[this.order.target_day] || {}).value

          if (needed > 0) {
            let targetValue = needed
            if (product.packaging_conditioning) targetValue = Math.ceil(needed / product.packaging_conditioning) * product.packaging_conditioning
            let { unit, value } = convertToBestUnit(product.unit, targetValue)
            if (product.packaging_convert_to_piece) {
              value = Math.ceil(needed / product.packaging_conditioning)
              unit = 'piece'
            }
            const category = this.$root.getCategory(product.category_id)
            this.order.values[product_id] = {
              id: product.id,
              name: product.packaging_reference || product.name,
              category: category.name,
              value: Math.ceil(value),
              unit,
              needed: `${needed.toFixed(3)} ${product.unit}`,
            }
          }
        })
        this.isCalculating = false
      }, 10)
    },
    async save() {
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
    addProduct() {
      if (this.order.values[this.newProduct.id]) {
        this.$toast.add({
          severity: 'error', summary: 'Error', detail: `"${this.newProduct.name}" is already in the order`, life: 4000,
        })
      } else {
        this.order.values[this.newProduct.id] = {
          id: this.newProduct.id,
          name: this.newProduct.name,
          unit: this.newProduct.unit,
        }
      }
      this.newProduct = ''
    },
    deleteRow(row) {
      delete this.order.values[row.id]
    },
  },
}
</script>

<style lang='scss' scoped>
.session-order {
  max-width: 800px;
}

::v-deep td.needed,
::v-deep td.actions {
  background-color: var(--indigo-50);
}

.p-inputgroup-addon {
  width: 130px;
  background-color: var(--surface-b);
}

::v-deep .p-input-group .p-dropdown {
  background-color: var(--surface-b);
}

.order-options {
  max-width: 80%;
  margin: 0 auto;
  font-size: .9rem;

  .p-checkbox {
    transform: scale(0.8);
    height: 1rem;
    margin-top: -5px;
  }
}

::v-deep .order-options {

  .p-button,
  .p-inputtext {
    font-size: .9rem;
  }
}

::v-deep td,
::v-deep th {
  min-width: 100px !important;
}

::v-deep .form-cell.unit .p-inputtext {
  justify-content: flex-end;
}

::v-deep .p-rowgroup-header td {
  background-color: transparent;
}

@media print {
  .session-order {
    max-width: 600px;
    margin-top: 2rem;
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
}
</style>
