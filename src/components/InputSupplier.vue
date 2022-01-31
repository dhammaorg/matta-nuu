<template>
  <Dropdown v-bind="$attrs" :options="$root.suppliersArray" optionLabel="name" optionValue="id"
            placeholder="Supplier" :filter="true" filterPlaceholder="">
    <template #footer>
      <div class="p-dropdown-header">
        <Button icon="pi pi-plus" label="Supplier" class="p-button-sm"
                @click="$refs.form.show()" />
      </div>
    </template>
  </Dropdown>

  <SupplierForm ref="form" @created="$emit('update:modelValue', $event.id)"></SupplierForm>
</template>

<script>
import SupplierForm from '@/views/suppliers/SupplierForm.vue'

export default {
  components: { SupplierForm },
}
</script>
