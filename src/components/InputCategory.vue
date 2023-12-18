<template>
  <MultiSelect v-if="multiple"
               :options="categories" optionLabel="name" optionValue="id" placeholder="Categories"
               v-bind="$attrs">
    <template #footer v-if="btnAdd">
      <div class="p-multiselect-header">
        <Button icon="pi pi-plus" :label="`${type} Category`" class="p-button-sm"
                @click="$refs.form.show({ name: filterValue, type })" />
      </div>
    </template>
  </MultiSelect>

  <Dropdown v-else :options="categories" optionLabel="name" optionValue="id" :showClear="true"
            placeholder="Category" :filter="true" filterPlaceholder="" class="w-100" v-bind="$attrs"
            @filter="filterValue = $event.value">
    <template #footer v-if="btnAdd">
      <div class="p-dropdown-header">
        <Button icon="pi pi-plus" :label="`${type} Category`" class="p-button-sm"
                @click="$refs.form.show({ name: filterValue, type })" />
      </div>
    </template>
  </Dropdown>

  <CategoryForm ref="form" @created="onNewCategory($event.id)"></CategoryForm>
</template>

<script>
import MultiSelect from 'primevue/multiselect'
import CategoryForm from './CategoryForm.vue'

export default {
  props: {
    type: {
      type: String,
      required: true,
    },
    btnAdd: {
      type: Boolean,
      default: true,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
  },
  components: { CategoryForm, MultiSelect },
  data() {
    return {
      filterValue: '',
    }
  },
  computed: {
    categories() {
      return Object.values(this.$root.categories).filter((c) => c.type === this.type)
    },
  },
  methods: {
    onNewCategory(catId) {
      if (this.multiple) {
        const currentValue = this.$attrs.modelValue || []
        currentValue.push(catId)
        this.$emit('update:modelValue', currentValue)
      } else {
        this.$emit('update:modelValue', catId)
      }
    },
  },
}
</script>
