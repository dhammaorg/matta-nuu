<template>
  <div class="page-content mb-5">
    <h2 class="mb-3 mt-0">Templates</h2>
    <div class="text-muted mb-2">Preconfigured inventories. URL to share with people doing the inventories</div>
    <div class="mb-4"><a :href="publicUrl" target="_blank">{{ publicUrl }}</a></div>
    <div class="mb-3">
      <Button label="New Inventory Template" icon="pi pi-plus" class="me-2" @click="$refs.templateForm.show()" />
    </div>

    <DataTable :value="inventoryTemplates" dataKey="id" :paginator="true" :rows="20" sortField="template_name"
      :sortOrder="1" removableSort v-model:filters="templateFilters" filterDisplay="menu">
      <Column field="template_name" header="Name" :sortable="true">
      </Column>

      <Column field="storage_areas" header="Storage Areas" :sortable="false">
        <template #body="{ data }">
          <Tag v-for="areaId in data.storage_area_ids" :key="areaId" :value="$root.getCategory(areaId)?.name"
            class="me-1" />
          <span v-if="data.storage_area_ids.length === 0" class="text-muted">All</span>
        </template>
      </Column>

      <Column field="suppliers" header="Suppliers" :sortable="false">
        <template #body="{ data }">
          <Tag v-for="supplierId in data.supplier_ids" :key="supplierId" :value="$root.getSupplier(supplierId)?.name"
            class="me-1" />
          <span v-if="data.supplier_ids.length === 0" class="text-muted">All</span>
        </template>
      </Column>

      <Column field="product_categories" header="Categories" :sortable="false">
        <template #body="{ data }">
          <Tag v-for="categoryId in data.product_category_ids" :key="categoryId"
            :value="$root.getCategory(categoryId)?.name" class="me-1" />
          <span v-if="data.product_category_ids.length === 0" class="text-muted">All</span>
        </template>
      </Column>

      <Column class="text-end">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" class="p-button-text p-button-primary" @click="$refs.templateForm.show(data)" />
          <Button icon="pi pi-trash" class="p-button-text p-button-danger" @click="destroy(data)" />
        </template>
      </Column>
    </DataTable>
  </div>
  <div class="page-content">
    <h2 class="mt-0">Past Inventories</h2>
    <div class="mb-3">
      <Button label="New Inventory" icon="pi pi-plus" class="me-2" @click="$refs.inventoryForm.show()" />
    </div>

    <DataTable :value="realInventories" dataKey="id" :paginator="true" :rows="20" sortField="day_date" :sortOrder="-1"
      removableSort v-model:filters="filters" filterDisplay="menu">

      <Column field="day_label" header="Day" bodyClass="text-capitalize" :sortable="true" sort-field="day_date">
      </Column>

      <Column field="storage_areas" header="Storage Areas" :sortable="false">
        <template #body="{ data }">
          <Tag v-for="areaId in data.storage_area_ids" :key="areaId" :value="$root.getCategory(areaId)?.name"
            class="me-1" />
          <span v-if="data.storage_area_ids.length === 0" class="text-muted">All</span>
        </template>
      </Column>

      <Column field="suppliers" header="Suppliers" :sortable="false">
        <template #body="{ data }">
          <Tag v-for="supplierId in data.supplier_ids" :key="supplierId" :value="$root.getSupplier(supplierId)?.name"
            class="me-1" />
          <span v-if="data.supplier_ids.length === 0" class="text-muted">All</span>
        </template>
      </Column>

      <Column field="product_categories" header="Categories" :sortable="false">
        <template #body="{ data }">
          <Tag v-for="categoryId in data.product_category_ids" :key="categoryId"
            :value="$root.getCategory(categoryId)?.name" class="me-1" />
          <span v-if="data.product_category_ids.length === 0" class="text-muted">All</span>
        </template>
      </Column>

      <Column class="text-end">
        <template #body="{ data }">
          <router-link :to="{ name: 'session_inventory', params: { id: $route.params.id, inventory_id: data.id } }">
            <Button icon="pi pi-pencil" class="p-button-text p-button-primary" />
          </router-link>
          <Button icon="pi pi-trash" class="p-button-text p-button-danger" @click="destroy(data)" />
        </template>
      </Column>
    </DataTable>
    <InventoryNewDialog ref="inventoryForm" />
    <InventoryTemplateDialog ref="templateForm" />
  </div>
</template>

<script>
import Tag from 'primevue/tag'
import InventoryNewDialog from './InventoryNewDialog.vue'
import InventoryTemplateDialog from './InventoryTemplateDialog.vue'

export default {
  inject: ['sessionDays', 'stockDays', 'sessionInventories'],
  components: { InventoryNewDialog, InventoryTemplateDialog, Tag },
  data() {
    return {
      filters: {},
      templateFilters: {},
    }
  },
  async created() {
    this.initFilters()
  },
  computed: {
    inventoryTemplates() {
      return this.sessionInventories
        .filter((inv) => inv.is_template === true)
        .sort((a, b) => (a.template_name || '').localeCompare(b.template_name || ''))
    },
    realInventories() {
      return this.sessionInventories
        .filter((inv) => !inv.is_template)
        .map((inv) => {
          const result = { ...inv }
          const dayObject = this.stockDays.find((d) => d.id == inv.day) || {}
          result.day_label = dayObject.dateHeader || ''
          result.day_date = dayObject.date || new Date(0)
          return result
        })
    },
    publicUrl() {
      const resolved = this.$router.resolve({
        name: 'inventories_public',
        params: { id: this.$route.params.id }
      })
      return window.location.origin + window.location.pathname + resolved.href
    },
  },
  methods: {
    initFilters() {
      this.filters = {}
      this.templateFilters = {}
    },
    destroy(inventory) {
      this.$confirm.require({
        message: `Are you sure you want to delete this ${inventory.is_template ? 'template' : 'inventory'} ?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          this.dbDestroy('inventories', inventory)
        },
      })
    },
  },
}
</script>

<style lang='scss' scoped></style>
