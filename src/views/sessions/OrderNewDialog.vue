<template>
  <Dialog v-model:visible="visible" :style="{ width: '600px' }" :modal="true" class="p-fluid" header="New Order">

    <div class="p-field" v-if="$root.suppliersArray.length > 0">
      <InputSupplier v-model="order.supplier_id" />
    </div>

    <!-- Date -->
    <div class="p-field">
      <label>Calculate quantities needed until (last day included)</label>
      <InputDay v-model="order.target_day" :days="sessionDays" class="w-100" />
    </div>

    <!-- Delivery Date -->
    <div class="p-field">
      <label>Delivery date</label>
      <InputDay v-model="order.delivery_day" :days="stockDays" class="w-100" />
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false" />
      <Button label="Create Order" @click="createOrder" />
    </template>
  </Dialog>
</template>

<script>
import InputDay from '@/components/InputDay.vue'
import InputSupplier from '../../components/InputSupplier.vue'

export default {
  inject: ['sessionDays', 'stockDays'],
  components: { InputDay, InputSupplier },
  data() {
    return {
      visible: false,
      order: {},
    }
  },
  methods: {
    show(data) {
      this.order = {
        ...{
          target_day: this.sessionDays.at(-1).id,
          session_id: this.$root.session.id,
          report_values_in_stocks: true,
          group_by_category: true,
          delivery_day: this.stockDays.at(0).id,
        },
        ...data,
      }
      this.visible = true
    },
    async createOrder() {
      const supplier = this.$root.getSupplier(this.order.supplier_id)
      const otherOrdersForSupplier = Object.values(this.$root.orders).filter((o) => o.supplier_id == this.order.supplier_id)
      this.order.name = `${supplier.name || 'Order'} #${otherOrdersForSupplier.length + 1}`
      this.order.header = supplier.order_header
      this.order.footer = supplier.order_footer
      this.dbCreate('orders', this.order, (order) => {
        this.visible = false
        this.$router.push({ name: 'session_order', params: { id: this.$route.params.id, order_id: order.id } })
        this.order = {}
      })
    },
  },
}
</script>

<style lang='scss' scoped></style>
