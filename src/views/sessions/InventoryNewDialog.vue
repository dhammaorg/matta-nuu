<template>
  <Dialog v-model:visible="visible" :style="{ width: '600px' }" :modal="true" class="p-fluid"
    :header="isEditing ? 'Update Inventory' : 'Start a full Inventory'">

    <!-- Date -->
    <div class="p-field">
      <label>Day of the inventory</label>
      <InputDay v-model="inventory.day" :days="stockDays" class="w-100" />
    </div>

    <Divider />

    <!-- Storage Areas -->
    <div class="p-field">
      <label>Restrict to some storage areas</label>
      <InputCategory type="StorageArea" :multiple="true" v-model="inventory.storage_area_ids" :btnAdd="false" />
    </div>

    <!-- Suppliers -->
    <div class="p-field">
      <label>Restrict to some suppliers</label>
      <InputSupplier :multiple="true" v-model="inventory.supplier_ids" :btnAdd="false" />
    </div>

    <!-- Product Categories -->
    <div class="p-field">
      <label>Restrict to some categories</label>
      <InputCategory type="Product" :multiple="true" v-model="inventory.product_category_ids" :btnAdd="false" />
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false" />
      <Button v-if="isEditing" label="Update" class="p-button-primary" @click="updateInventory" />
      <Button v-else label="Start the inventory" class="p-button-primary" @click="createInventory" />
    </template>
  </Dialog>
</template>

<script>
import Divider from 'primevue/divider'
import InputDay from '@/components/InputDay.vue'
import InputCategory from '@/components/InputCategory.vue'
import InputSupplier from '@/components/InputSupplier.vue'

export default {
  inject: ['sessionDays', 'stockDays'],
  components: {
    InputDay, InputCategory, InputSupplier, Divider,
  },
  data() {
    return {
      visible: false,
      inventory: {},
    }
  },
  computed: {
    isEditing() {
      return this.inventory.id
    },
  },
  methods: {
    show(object) {
      this.inventory = {
        ...{
          day: this.sessionDays.find((day) => day.date.isToday())?.id,
          session_id: this.$root.session.id,
          storage_area_ids: [],
          product_category_ids: [],
          completed_storage_areas_ids: [],
          supplier_ids: [],
          values: {},
        },
        ...object,
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
    async updateInventory() {
      await this.dbUpdate('inventories', this.inventory)
      this.$emit('inventory-updated', this.inventory)
      this.visible = false
      this.inventory = {}
    },
  },
}
</script>

<style lang='scss' scoped></style>
