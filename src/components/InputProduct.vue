<template>
  <div class="p-inputgroup input-product-wrapper">
    <Dropdown :options="options" optionLabel="name" optionValue="id" :showClear="true"
              placeholder="Choose a Product" :filter="true" filterPlaceholder="" v-bind="$attrs"
              @filter="filterValue = $event.value" class="input-product">
      <template #footer>
        <div class="p-dropdown-header" v-if="showCreateButton">
          <Button icon="pi pi-plus" label="Product" class="p-button-sm"
                  @click="$refs.form.show({ name: filterValue })" />
        </div>
      </template>
    </Dropdown>
    <Button icon="pi pi-pencil" v-if="editable && value"
            @click="$refs.form.show($root.getProduct(value))"
            v-tooltip="'Edit Product'" class="flex-shrink-0 btn-edit-product" />
  </div>

  <ProductForm ref="form" @created="$emit('update:modelValue', $event.id)"></ProductForm>
</template>

<script>
import ProductForm from '@/views/products/ProductForm.vue'

export default {
  components: { ProductForm },
  props: {
    editable: {
      type: Boolean,
      default: true,
    },
    showCreateButton: {
      type: Boolean,
      default: true,
    },
    filterProducts: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      filterValue: '',
    }
  },
  computed: {
    options() {
      return this.$root.productsArray.filter((p) => this.filterProducts === null || this.filterProducts.includes(p.id))
    },
    value() {
      return this.$attrs.modelValue
    },
  },
}
</script>
