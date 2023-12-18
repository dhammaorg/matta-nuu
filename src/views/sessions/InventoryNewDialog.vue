<template>
  <Dialog v-model:visible="visible" :style="{ width: '600px' }" :modal="true" class="p-fluid"
          header="Start a full Inventory" position="top">

    <!-- Date -->
    <div class="p-field">
      <label>Day of the inventory</label>
      <InputDay v-model="inventory.day" :days="stockDays" class="w-100" />
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false" />
      <Button label="Start the inventory" class="p-button-primary" @click="createInventory" />
    </template>
  </Dialog>
</template>

<script>
import InputDay from '@/components/InputDay.vue'

export default {
  inject: ['sessionDays', 'stockDays'],
  components: { InputDay },
  data() {
    return {
      visible: false,
      inventory: {},
    }
  },
  mounted() {
  },
  methods: {
    show() {
      this.inventory = {
        day: this.sessionDays.find((day) => day.date.isToday())?.id,
        session_id: this.$root.session.id,
        storage_areas: [],
        categories: [],
        values: {},
      }
      this.visible = true
    },
    async createInventory() {
      this.dbCreate('inventories', this.inventory, (inventory) => {
        this.visible = false
        this.$router.push({ name: 'session_inventory', params: { id: this.$route.params.id, inventory_id: inventory.id } })
        this.inventory = {}
      })
    },
  },
}
</script>

<style lang='scss' scoped></style>
