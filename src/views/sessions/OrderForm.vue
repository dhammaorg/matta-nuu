<template>
  <Dialog v-model:visible="visible" :style="{width: '600px'}" :modal="true" class="p-fluid"
          header="New Order">

    <div class="p-field" v-if="$root.suppliers.length > 0">
      <Dropdown v-model="order.suppliers" :options="$root.suppliers" placeholder="Supplier" />
    </div>
    <!-- Date -->
    <div class="p-field">
      <label>Calculate quantities needed for</label>
      <Dropdown v-model="order.targetDate" :options="daysOptions" class="w-100" optionLabel="fullLabel"/>
    </div>

    <div class="p-field">
      <label>Delivery Date</label>
      <Dropdown v-model="order.delivery" :options="daysOptions" class="w-100" optionLabel="fullLabel"/>
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
  props: ['days'],
  components: { Dropdown },
  data() {
    return {
      visible: false,
      order: {},
    }
  },
  computed: {
    daysOptions() {
      return this.days.map((day) => {
        day.fullLabel = day.event ? `${day.event.name} - ` : ''
        day.fullLabel += `${day.label} - ${day.id}`
        return day
      })
    },
  },
  methods: {
    show() {
      this.order = {
        targetDate: this.days.at(-1),
        delivery: this.days.at(0),
      }
      if (this.$root.suppliers.length === 1) { this.order.supplier = this.$root.supplier[0] }
      this.visible = true
    },
    createOrder() {
      this.visible = false
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
