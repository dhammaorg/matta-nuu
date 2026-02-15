<template>
  <Dialog v-model:visible="visible" :style="{ width: '600px' }" :modal="true" class="p-fluid"
    :header="isEditing ? 'Update Template' : 'Create Inventory Template'">

    <!-- Template Name -->
    <div class="p-field">
      <label>Template Name</label>
      <InputText v-model="inventory.template_name" placeholder="Wekkly Inventory" />
    </div>

    <!-- Template Description -->
    <div class="p-field">
      <label>Template Description</label>
      <Textarea v-model="inventory.template_description" :autoResize="true" rows="3" />
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
      <Button v-if="isEditing" label="Update" class="p-button-primary" @click="updateTemplate" />
      <Button v-else label="Create Template" class="p-button-primary" @click="createTemplate" />
    </template>
  </Dialog>
</template>

<script>
import Divider from 'primevue/divider'
import Textarea from 'primevue/textarea'
import InputCategory from '@/components/InputCategory.vue'
import InputSupplier from '@/components/InputSupplier.vue'

export default {
  inject: ['sessionDays', 'stockDays'],
  components: {
    InputCategory, InputSupplier, Divider, Textarea,
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
          session_id: this.$root.session.id,
          is_template: true,
          template_name: '',
          template_description: '',
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
    async createTemplate() {
      this.dbCreate('inventories', this.inventory, (inventory) => {
        this.visible = false
        this.inventory = {}
      })
    },
    async updateTemplate() {
      await this.dbUpdate('inventories', this.inventory)
      this.$emit('template-updated', this.inventory)
      this.visible = false
      this.inventory = {}
    },
  },
}
</script>

<style lang='scss' scoped></style>
