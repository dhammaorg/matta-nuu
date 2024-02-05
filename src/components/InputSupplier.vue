<template>
  <MultiSelect v-if="multiple"
               :options="suppliers" optionLabel="name" optionValue="id"
               v-bind="$attrs">
    <template #footer v-if="btnAdd">
      <div class="p-multiselect-header">
        <Button icon="pi pi-plus" label="Supplier" class="p-button-sm"
                @click="$refs.form.show({ name: filterValue })" />
      </div>
    </template>
  </MultiSelect>

  <Dropdown v-else :options="suppliers" optionLabel="name" optionValue="id"
            :showClear="true"
            placeholder="Supplier" :filter="true" filterPlaceholder="" class="w-100" v-bind="$attrs"
            @filter="filterValue = $event.value">
    <template #footer v-if="btnAdd">
      <div class="p-dropdown-header">
        <Button icon="pi pi-plus" label="Supplier" class="p-button-sm"
                @click="$refs.form.show({ name: filterValue })" />
      </div>
    </template>
  </Dropdown>

  <SupplierForm ref="form" @created="$emit('update:modelValue', $event.id)"></SupplierForm>
</template>

<script>
import MultiSelect from 'primevue/multiselect'
import SupplierForm from '@/views/suppliers/SupplierForm.vue'

export default {
  components: { SupplierForm, MultiSelect },
  props: {
    btnAdd: {
      type: Boolean,
      default: true,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      filterValue: '',
    }
  },
  computed: {
    suppliers() {
      return [...this.$root.suppliersArray].sort((a, b) => a.name.localeCompare(b.name))
    },
  },
}
</script>
