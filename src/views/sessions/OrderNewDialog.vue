<template>
  <Dialog v-model:visible="visible" :style="{width: '600px'}" :modal="true" class="p-fluid"
          header="New Order">

    <div class="p-field" v-if="$root.suppliers.length > 0">
      <Dropdown v-model="order.supplier" :options="$root.suppliers" placeholder="Supplier" />
    </div>

    <!-- Date -->
    <div class="p-field">
      <label>Calculate quantities needed unil</label>
      <Dropdown v-model="order.target_date" :options="daysOptions" class="w-100"
                optionLabel="fullLabel" optionValue="date"/>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false"/>
      <Button label="Create Order" icon="pi pi-check" class="p-button-text" @click="createOrder" />
    </template>
  </Dialog>
</template>

<script>
import Dropdown from 'primevue/dropdown'

export default {
  inject: ['sessionDays'],
  components: { Dropdown },
  data() {
    return {
      visible: false,
      order: {},
    }
  },
  computed: {
    daysOptions() {
      return this.sessionDays.map((day) => {
        day.fullLabel = this.$root.session.events.length > 1 && day.event ? `${day.event.name} : ` : ''
        day.fullLabel += `${day.label} - ${day.id}`
        return day
      })
    },
  },
  methods: {
    show() {
      this.order = {
        target_date: this.sessionDays.at(-1).date,
        session_id: this.$root.session.id,
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
