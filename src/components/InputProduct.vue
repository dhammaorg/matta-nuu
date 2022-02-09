<template>
  <div class="p-inputgroup">
    <Dropdown :options="$root.productsArray" optionLabel="name" optionValue="id" :showClear="true"
              placeholder="Choose a Product" :filter="true" filterPlaceholder="" v-bind="$attrs"
              @filter="filterValue = $event.value" >
      <template #footer>
        <div class="p-dropdown-header">
          <Button icon="pi pi-plus" label="Product" class="p-button-sm"
                  @click="$refs.form.show({ name: filterValue })" />
        </div>
      </template>
    </Dropdown>
    <Button icon="pi pi-pencil" v-if="editable && value" @click="$refs.form.show($root.getProduct(value))"
            v-tooltip="'Edit Product'" class="flex-shrink-0"/>
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
  },
  data() {
    return {
      filterValue: '',
    }
  },
  computed: {
    value() {
      return this.$attrs.modelValue
    },
  },
}
</script>
