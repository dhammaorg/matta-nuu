<template>
  <Dialog v-model:visible="visible" :style="{width: '600px'}" :modal="true" class="p-fluid"
          header="New Order">

    <div class="p-field">
      <InputText v-model="order.name" placeholder="Order Name"/>
    </div>

    <div class="p-field" v-if="$root.suppliers.length > 0">
      <Dropdown v-model="order.supplier" :options="$root.suppliers" placeholder="Supplier" />
    </div>

    <!-- Date -->
    <div class="p-field">
      <label>Calculate quantities needed unil</label>
      <InputDay v-model="order.target_date" :days="sessionDays" class="w-100"/>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false"/>
      <Button label="Create Order" icon="pi pi-check" class="p-button-text" @click="createOrder" />
    </template>
  </Dialog>
</template>

<script>
import Dropdown from 'primevue/dropdown'
import InputDay from '@/components/InputDay.vue'

export default {
  inject: ['sessionDays', 'stockDays'],
  components: { Dropdown, InputDay },
  data() {
    return {
      visible: false,
      order: {},
    }
  },
  methods: {
    show() {
      this.order = {
        target_date: this.sessionDays.at(-1).date,
        session_id: this.$root.session.id,
        report_values_in_stocks: true,
        delivery_date: this.stockDays.at(0).date,
      }
      if (this.$root.suppliers.length === 1) [this.order.supplier] = this.$root.supplier
      this.visible = true
    },
    async createOrder() {
      if (this.order.supplier || this.$root.suppliers.length === 0) {
        this.dbCreate('orders', this.order, (order) => {
          this.visible = false
          this.$router.push({ name: 'session_order', params: { id: this.$route.params.id, order_id: order.id } })
          this.order = {}
        })
      }
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
