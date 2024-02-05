<template>
  <Button type="button" icon="pi pi-sliders-h" class="p-button-sm p-button-secondary"
          :class="{ 'p-button-warning': filtersPresent > 0 }"
          :badge="filtersPresent && filtersPresent.toString()"
          label="Filters / Display" @click="show" />

  <Dialog v-model:visible="visible" :style="{ width: '600px' }"
          header="Configure Filters and Display options"
          :modal="true" class="p-fluid recipie-dialog">
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
    <div class="p-field mb-3">
      <label v-if="options.supplierId">By Supplier</label>
      <InputSupplier v-model="options.supplierId" showClear class="w-100" placeholder="By Supplier"
                     :btnAdd="false" />
    </div>
    <div class="p-field mb-3">
      <label v-if="options.categoryId">By Category</label>
      <InputCategory v-model="options.categoryId" type="Product" showClear class="w-100"
                     placeholder="By Category"
                     :btnAdd="false" />
    </div>
    <div class="mb-3">
      <Checkbox v-model="options.onlyProductsWithSupplier" id="onlyProductsWithSupplierInput"
                :binary="true" />
      <label for="onlyProductsWithSupplierInput" class="ms-2">Only with supplier</label>
    </div>

    <div class="mb-4">
      <Checkbox v-model="options.onlyMissingProducts" id="onlyMissingProductsId" :binary="true" />
      <label for="onlyMissingProductsId" class="ms-2">Only missing in the future</label>
    </div>

    <!-- Actions -->
    <template #footer>
      <Button v-if="filtersPresent" @click="clearAll" label="Clear all filters"
              class="p-button-warning float-start"></Button>
      <Button label="Cancel" @click="visible = false" class="p-button-text"></Button>
      <Button label="Apply" icon="pi pi-check" @click="apply"></Button>
    </template>
  </Dialog>
</template>

<script>
import RadioButton from 'primevue/radiobutton'
import Checkbox from 'primevue/checkbox'
import InputSupplier from '@/components/InputSupplier.vue'
import InputCategory from '@/components/InputCategory.vue'

export default {
  props: ['modelValue'],
  components: {
    RadioButton, Checkbox, InputSupplier, InputCategory,
  },
  data() {
    return {
      options: {},
      visible: false,
    }
  },
  computed: {
    filtersPresent() {
      const options = { ...this.modelValue }
      delete options.groupBy
      return Object.values(options).filter((val) => !!val).length
    },
  },
  methods: {
    show(event) {
      this.options = { ...this.modelValue }
      this.visible = true
    },
    apply() {
      this.visible = false
      this.$emit('update:modelValue', this.options)
    },
    async clearAll() {
      this.visible = false
      await this.$nextTick()
      this.$emit('update:modelValue', {
        groupBy: this.options.groupBy,
        supplierId: null,
        categoryId: null,
        onlyProductsWithSupplier: false,
        onlyMissingProducts: false,
      })
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
