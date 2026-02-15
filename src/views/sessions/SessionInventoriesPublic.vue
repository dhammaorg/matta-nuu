<template>
  <div class="p-3" style="max-width: 600px; margin: 0 auto; width: 100%;">
    <div v-if="inventoryTemplates.length === 0" class="text-muted mb-3">No inventory templates available</div>
    <div class="d-flex gap-4 flex-wrap" v-else>
      <div v-for="template in inventoryTemplates" :key="template.id" class="card w-100 d-flex flex-column">
        <h3 class="mt-0">{{ template.template_name }}</h3>
        <div class="text-muted mb-4 flex-grow-1">
          {{ template.template_description }}
        </div>
        <Button label="Start" @click="createFromTemplate(template)" class="w-100" />
      </div>
    </div>

    <template v-if="realInventories.length > 0">
      <h2 class="mb-4 mt-5 text-center">Previous Inventories</h2>
      <div class="d-flex flex-column gap-3">
        <div v-for="inventory in sortedInventories" :key="inventory.id"
          class="card py-3 d-flex justify-content-between align-items-center">
          <span class="text-capitalize">{{ inventory.day_label }}</span>
          <span class="text-muted">{{ inventory.template_name }}</span>
          <div class="d-flex gap-2">
            <router-link
              :to="{ name: 'session_inventory', params: { id: $route.params.id, inventory_id: inventory.id }, query: { public: 'true' } }">
              <Button icon="pi pi-pencil" class="p-button-text p-button-primary" />
            </router-link>
            <Button icon="pi pi-trash" class="p-button-text p-button-danger" @click="destroy(inventory)" />
          </div>
        </div>
      </div>
    </template>
  </div>

  <InventoryNewDialog ref="inventoryForm" />
</template>

<script>
import { computed } from 'vue'
import InventoryNewDialog from './InventoryNewDialog.vue'
import StockMixin from '@/services/stocks-mixin'

export default {
  mixins: [StockMixin],
  components: { InventoryNewDialog },
  provide() {
    return {
      sessionDays: computed(() => this.sessionDays),
      stockDays: computed(() => this.stockDays),
    }
  },
  computed: {
    session() {
      return this.$root.session
    },
    inventoryTemplates() {
      return this.sessionInventories
        .filter((inv) => inv.is_template === true)
    },
    realInventories() {
      return this.sessionInventories
        .filter((inv) => !inv.is_template && inv.template_name)
        .map((inv) => {
          const result = { ...inv }
          const dayObject = this.stockDays.find((d) => d.id == inv.day) || {}
          result.day_label = dayObject.dateHeader || ''
          result.day_date = dayObject.date || new Date(0)
          return result
        })
    },
    sortedInventories() {
      return [...this.realInventories].sort((a, b) => {
        return new Date(b.day_date) - new Date(a.day_date)
      })
    },
  },
  methods: {
    createFromTemplate(template) {
      let today = this.stockDays.find((day) => day.date.isToday())
      if (!today) {
        this.toastError(`The current session "${this.$root.session.name}"" do not have an event configured for today`)
        return
      }
      let inventory = {
        day: today.id,
        session_id: this.$root.session.id,
        storage_area_ids: [...(template.storage_area_ids || [])],
        product_category_ids: [...(template.product_category_ids || [])],
        supplier_ids: [...(template.supplier_ids || [])],
        completed_storage_areas_ids: [],
        values: {},
        template_name: template.template_name,
      }
      this.dbCreate('inventories', inventory, (inventory) => {
        this.$router.push({
          name: 'session_inventory',
          params: { id: this.$route.params.id, inventory_id: inventory.id },
          query: { public: 'true' },
        })
      })
    },
    destroy(inventory) {
      this.$confirm.require({
        message: `Are you sure you want to delete this inventory ?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          this.dbDestroy('inventories', inventory)
          await this.loadData()
        },
      })
    },
    onInventoryCreated(inventory) {
      // Navigate to the inventory with public mode
      this.$router.push({
        name: 'session_inventory',
        params: { id: this.$route.params.session_id, inventory_id: inventory.id },
        query: { public: 'true' },
      })
    },
  }
}
</script>

<style lang='scss' scoped>
.card {
  padding: 2rem;
}
</style>
