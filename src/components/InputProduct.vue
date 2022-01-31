<template>
  <Dropdown :options="$root.productsArray" optionLabel="name" optionValue="id"
            placeholder="Choose a Product" :filter="true" filterPlaceholder="" v-bind="$attrs" >
    <template #footer>
      <div class="p-dropdown-header">
        <Button icon="pi pi-plus" label="Product" class="p-button-sm"
                @click="$refs.form.show()" />
      </div>
    </template>
  </Dropdown>

  <ProductForm ref="form" @created="$emit('update:modelValue', $event.id)"></ProductForm>
</template>

<script>
import ProductForm from '@/views/products/ProductForm.vue'

export default {
  components: { ProductForm },
}
</script>
