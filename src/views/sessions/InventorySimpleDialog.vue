<template>
  <Dialog v-model:visible="visible" :style="{ width: '600px' }" :modal="true" class="p-fluid"
    header="New Simple Inventory" position="top" :maximizable="true">

    <!-- Date -->
    <div class="p-field">
      <label>Day of the inventory</label>
      <InputDay v-model="day" :days="stockDays" class="w-100" />
    </div>

    <div class="fw-bold mb-3 mt-4">Products Stocks at the end of the day</div>
    <div v-for="stock in inventory" class="d-flex mb-2" :key="stock" ref="rows">
      <div class="p-inputgroup">
        <InputProduct v-model="stock.product_id" :showClear="false" :editable="false"
          :showCreateButton="false" class="product-input" :filterProducts="productsFor(stock)"
          style="border-top-right-radius: 0; border-bottom-right-radius: 0" />
        <InputNumber v-model="stock.value" :maxFractionDigits="5" placeholder="Stock"
          inputClass="border-start-0" />
        <span class="p-inputgroup-addon" style="width: 5rem;" v-if="day"
          v-tooltip.top="'Theoretical stock'">
          {{ stockValueFor(stock.product_id) }}
        </span>
        <span class="p-inputgroup-addon" style="width: 5rem;">{{
          $root.getProduct(stock.product_id).unit }}</span>
      </div>
      <Button icon="pi pi-times" class="p-button-text p-button-danger" @click="removeRow(stock)" />
    </div>
    <Button icon="pi pi-plus" class="p-button-rounded p-button-primary p-button-sm mt-2"
      @click="newRow" />

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false" />
      <Button label="Save" icon="pi pi-check" class="p-button-primary" @click="save" />
    </template>
  </Dialog>
</template>

<script>
import InputNumber from 'primevue/inputnumber'
import InputDay from '@/components/InputDay.vue'
import InputProduct from '@/components/InputProduct.vue'

export default {
  props: ['products', 'stocks'],
  inject: ['stockDays'],
  components: { InputDay, InputNumber, InputProduct },
  data() {
    return {
      visible: false,
      inventory: [],
      day: null,
    }
  },
  mounted() {
    this.resetData()
  },
  methods: {
    resetData() {
      this.day = (this.stockDays.find((d) => d.class.includes('today')) || {}).id
      this.inventory = [{}]
    },
    show() {
      this.visible = true
    },
    newRow(event) {
      this.inventory.push({})
      this.$nextTick(() => {
        event.target.scrollIntoView()
        setTimeout(() => {
          this.$refs.rows.at(-1).querySelector('.product-input').click()
        }, 0)
      })
    },
    removeRow(stock) {
      this.inventory = this.inventory.filter((s) => s.product_id !== stock.product_id)
    },
    save() {
      if (!this.day) {
        this.$toastError('You need to choose a day')
        return
      }
      this.inventory.filter((s) => s.product_id).forEach((stock) => {
        this.$root.session.realStocks[stock.product_id][this.day] = stock.value
        this.$parent.reCalculateStockFor(stock.product_id, this.day)
      })
      this.resetData()
      this.visible = false
    },
    productsFor(stock) {
      const alreadySet = this.inventory.map((s) => s.product_id)
      return this.products.filter((p) => !alreadySet.includes(p) || p == stock.product_id)
    },
    stockValueFor(productId) {
      if (!this.stocks || !this.day) return
      const { values } = this.stocks.find((s) => s.product_id == productId) || {}
      return values && values[this.day] ? values[this.day].value.round() : 0
    },
  },
}
</script>

<style lang='scss' scoped></style>
