<template>
  <Button type="button" icon="pi pi-sliders-h" class="p-button-sm p-button-secondary"
          :class="{ 'p-button-warning': modelValue.onlyMissingProducts }"
          label="Display Options" @click="toggle" />

  <TieredMenu ref="menu" :model="[{}]" :popup="true">
    <template #item>
      <div class="p-3">
        <div class="mb-4">

          <!-- Group by -->
          <h5>Group by</h5>
          <div class="d-flex align-items-center mb-2">
              <RadioButton v-model="options.groupBy" id="groupByCategory" value="category" />
              <label for="groupByCategory" class="ms-2">Categories</label>
          </div>
          <div class="d-flex align-items-center mb-2">
              <RadioButton v-model="options.groupBy" id="groupBySupplier" value="supplier" />
              <label for="groupBySupplier" class="ms-2">Supplier</label>
          </div>
          <div class="d-flex align-items-center mb-2">
              <RadioButton v-model="options.groupBy" id="groupByNone" value="" />
              <label for="groupByNone" class="ms-2">None</label>
          </div>
        </div>

        <!-- Filters -->
        <h5>Filter products</h5>
        <div class="mb-3">
          <Checkbox v-model="options.onlyProductsWithSupplier" id="onlyProductsWithSupplierInput" :binary="true"/>
          <label for="onlyProductsWithSupplierInput" class="ms-2">Only with supplier</label>
        </div>
        <div class="mb-4">
          <Checkbox v-model="options.onlyMissingProducts" id="onlyMissingProductsId" :binary="true"/>
          <label for="onlyMissingProductsId" class="ms-2">Only missing in the future</label>
        </div>

        <!-- Actions -->
        <Button label="Apply" icon="pi pi-check" @click="apply"></Button>
        <Button label="Cancel" @click="$refs.menu.hide()" class="p-button-text float-end"></Button>
      </div>
    </template>
  </TieredMenu>
</template>

<script>
import TieredMenu from 'primevue/tieredmenu'
import RadioButton from 'primevue/radiobutton'
import Checkbox from 'primevue/checkbox'

export default {
  props: ['modelValue'],
  components: { TieredMenu, RadioButton, Checkbox },
  data() {
    return {
      options: {},
    }
  },
  methods: {
    toggle(event) {
      this.options = { ...this.modelValue }
      this.$refs.menu.toggle(event)
    },
    apply() {
      this.$refs.menu.hide()
      this.$emit('update:modelValue', this.options)
    },
  },
}
</script>

<style lang='scss' scoped>
  h5 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
  }
</style>
