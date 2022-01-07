<template>
  <div style="max-width: 800px" class="mx-auto">

    <div class="mb-3">
      <p>{{ order.supplier }}</p>

      <Inplace :closable="true" class="mb-4">
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

      <div class="p-inputgroup mt-3 d-print-none">
        <span class="p-inputgroup-addon">Quantities until</span>
        <InputDay v-model="order.target_date" :days="sessionDays" />
        <Button label="Calculate" icon="pi pi-refresh" @click="calculate" />
      </div>

    </div>

    <DataTable :value="values" class="mb-3" showGridlines>
      <Column field="name" header="Product" body-class="form-cell" style="width: 50%" header-class="text-start">
        <template #body="{ data }">
          <InputText v-model="data.name" class="text-start" />
        </template>
      </Column>
      <Column field="value" header="Amount" body-class="form-cell">
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
      <Column field="needed" header="Needed" class="text-center needed d-print-none" />

      <template #empty>
        No products in this order yet
      </template>
    </DataTable>

    <div class="d-flex justify-content-between">
      <div class="p-inputgroup d-inline-flex d-print-none" style="width: 200px">
        <InputProduct v-model="newProduct" :dropdown="false" placeholder="Add Product" />
        <Button :disabled="!newProduct" icon="pi pi-plus" @click="addProduct" />
      </div>
      <div>
        <Button label="Print" :disabled="values.length == 0" class="p-button-success" icon="pi pi-print" @click="print()" />
      </div>
    </div>

  </div>

</template>

<script>
import InputNumber from 'primevue/inputnumber'
import Inplace from 'primevue/inplace'
import InputDay from '@/components/InputDay.vue'
import InputUnit from '@/components/InputUnit.vue'
import InputProduct from '@/components/InputProduct.vue'
import StockMixin from '@/services/stocks-mixin'

export default {
  inject: ['sessionDays', 'stockDays'],
  mixins: [StockMixin],
  components: {
    InputDay, InputProduct, InputNumber, InputUnit, Inplace,
  },
  data() {
    return {
      order: {
        values: {},
      },
      newProduct: '',
    }
  },
  async mounted() {
    const { data } = await this.$db.from('orders').select().match({ id: this.$route.params.order_id }).single()
    data.target_date = new Date(data.target_date)
    data.values ||= {}
    this.order = data
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

<style lang='scss'>
  td.unit {
    background-color: var(--surface-b);
  }
  td.needed {
    background-color: var(--surface-c);
  }
</style>
