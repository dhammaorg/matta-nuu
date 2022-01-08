<template>
  <div style="max-width: 800px" class="mx-auto">

    <div class="mb-3 d-flex">
      <div class="flex-grow-1">
        <Inplace :closable="true" class="mb-2">
          <template #display>
            <h2 class="m-0 me-3" title="Edit">
              {{ order.name }}
              <span class="ms-2 pi pi-pencil xs d-print-none"></span>
            </h2>
          </template>
          <template #content>
            <InputText v-model="order.name" autofocus/>
          </template>
        </Inplace>
        <p class="mb-0">{{ order.supplier }}</p>
      </div>
      <div class="d-print-none">
        <Button class="p-button-text p-button-danger" icon="pi pi-trash" @click="destroy"/>
        <Button label="Save" class="p-button-success" icon="pi pi-save" @click="save" :loading="loading"/>
      </div>
    </div>

    <hr class="d-print-none">

    <div class="order-options mb-4">
      <div class="p-inputgroup mb-3 d-print-none">
        <span class="p-inputgroup-addon text-start">Delivery Date</span>
        <InputDay v-model="order.delivery_date" :days="stockDays" />
        <span class="p-inputgroup-addon w-auto">
          <Checkbox v-model="order.report_values_in_stocks" :binary="true" />
          <label class="ms-2">Report values in Stocks</label>
        </span>
      </div>
      <div class="p-inputgroup mb-3 d-print-none">
        <span class="p-inputgroup-addon">Quantities until</span>
        <InputDay v-model="order.target_date" :days="sessionDays" />
        <Button label="Refresh" icon="pi pi-refresh" class="btn-right p-button-secondary" @click="calculate" />
      </div>
    </div>

    <hr class="d-print-none">

    <DataTable :value="values" class="mb-3">
      <Column field="name" header="Product" body-class="form-cell" style="width: 80%">
        <template #body="{ data }">
          <InputText v-model="data.name" class="text-start" />
        </template>
      </Column>
      <Column field="value" header="Amount" class="text-center" body-class="form-cell">
        <template #body="{ data }">
          <InputNumber v-model="data.value" />
        </template>
      </Column>
      <Column field="unit" header="Unit" style="max-width: 50px" class="unit text-center" body-class="form-cell">
        <template #body="{ data }">
          <InputUnit v-if="!data.needed" v-model="data.unit" />
          <span v-else>{{ data.unit }}</span>
        </template>
      </Column>
      <Column field="needed" header="Needed" class="needed text-center d-print-none" />

      <template #empty>
        No products in this order yet
      </template>
    </DataTable>

    <div class="d-flex justify-content-between d-print-none">
      <div class="p-inputgroup d-inline-flex" style="width: 200px">
        <InputProduct v-model="newProduct" :dropdown="false" placeholder="Add Product" />
        <Button :disabled="!newProduct" icon="pi pi-plus" @click="addProduct" />
      </div>
      <div class="p-buttonset">
        <Button label="New Order" class="p-button-outlined" @click="$refs.orderForm.show()" />
        <Button label="Print" class="btn-right" :disabled="values.length == 0" icon="pi pi-print" onclick="print()" />
      </div>
    </div>

    <OrderNewDialog ref="orderForm" :days="sessionDays"/>

  </div>

</template>

<script>

import Checkbox from 'primevue/checkbox'
import InputNumber from 'primevue/inputnumber'
import Inplace from 'primevue/inplace'
import InputDay from '@/components/InputDay.vue'
import InputUnit from '@/components/InputUnit.vue'
import InputProduct from '@/components/InputProduct.vue'
import StockMixin from '@/services/stocks-mixin'
import OrderNewDialog from './OrderNewDialog.vue'

export default {
  inject: ['sessionDays', 'stockDays'],
  mixins: [StockMixin],
  components: {
    InputDay, InputProduct, InputNumber, InputUnit, Inplace, OrderNewDialog, Checkbox,
  },
  data() {
    return {
      order: {
        values: {},
      },
      newProduct: '',
      loading: false,
    }
  },
  async mounted() {
    this.fetchOrder(this.$route.params.order_id)
  },
  async beforeRouteUpdate(to, from) {
    this.fetchOrder(to.params.order_id)
  },
  computed: {
    products() {
      const result = []
      Object.entries(this.session.products).forEach(([product, config]) => {
        if (config.supplier === this.order.supplier) result.push(product)
      })
      return result
    },
    values() {
      return Object.values(this.order.values)
    },
  },
  methods: {
    async fetchOrder(orderId) {
      const { data } = await this.$db.from('orders').select().match({ id: orderId }).single()
      if (data === null) {
        this.toastError('Could not find the order')
        this.$router.push({ name: 'session_orders', params: { id: this.$route.params.id } })
      } else {
        data.target_date = new Date(data.target_date)
        data.delivery_date = new Date(data.delivery_date)
        this.order = data
        if (!this.order.values && this.order.target_date) this.calculate()
      }
    },
    calculate() {
      this.order.values = {}
      this.stocks.forEach(({ product, values }) => {
        const config = this.session.products[product] || {}
        if (this.order.supplier && config.supplier !== this.order.supplier) return
        const needed = 0 - (values[this.order.target_date.toDateString()] || {}).value
        if (needed > 0) {
          this.order.values[product] = {
            name: config.reference || product,
            value: Math.ceil(needed / (config.conditioning || 1)),
            unit: config.conditioning ? '' : this.productsUnits[product],
            needed,
          }
        }
      })
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
      if (this.order.values[this.newProduct]) {
        this.$toast.add({
          severity: 'error', summary: 'Error', detail: `"${this.newProduct}" is already in the order`, life: 4000,
        })
      } else {
        this.order.values[this.newProduct] = { name: this.newProduct }
      }
      this.newProduct = ''
    },
  },
}
</script>

<style lang='scss' scoped>
  ::v-deep td.needed {
    background-color: var(--surface-c);
  }
  .btn-right {
    width: 120px;
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
    .p-button, .p-inputtext {
      font-size: .9rem;
    }
  }
</style>
