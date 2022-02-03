<template>
  <Dropdown :options="$root.suppliersArray" optionLabel="name" optionValue="id" :showClear="true"
            placeholder="Supplier" :filter="true" filterPlaceholder="" class="w-100" v-bind="$attrs"
            @filter="filterValue = $event.value" >
    <template #footer>
      <div class="p-dropdown-header">
        <Button icon="pi pi-plus" label="Supplier" class="p-button-sm"
                @click="$refs.form.show({ name: filterValue })" />
      </div>
    </template>
  </Dropdown>

  <SupplierForm ref="form" @created="$emit('update:modelValue', $event.id)"></SupplierForm>
</template>

<script>
import SupplierForm from '@/views/suppliers/SupplierForm.vue'

export default {
  components: { SupplierForm },
  data() {
    return {
      filterValue: '',
    }
  },
}
</script>
