<template>
  <MultiSelect v-if="multiple"
               :options="categories" optionLabel="name" optionValue="id"
               v-bind="$attrs">
    <template #footer v-if="btnAdd">
      <div class="p-multiselect-header">
        <Button icon="pi pi-plus" :label="`${type} Category`" class="p-button-sm"
                @click="$refs.form.show({ name: filterValue, type })" />
      </div>
    </template>
  </MultiSelect>

  <Dropdown v-else :options="categories" optionLabel="name" optionValue="id" :showClear="true"
            :filter="true" filterPlaceholder="" class="w-100" v-bind="$attrs"
            @filter="filterValue = $event.value">
    <template #footer v-if="btnAdd">
      <div class="p-dropdown-header">
        <Button icon="pi pi-plus" :label="btnAddLabel" class="p-button-sm"
                @click="$refs.form.show({ name: filterValue, type })" />
      </div>
    </template>
  </Dropdown>

  <CategoryForm ref="form" @created="onNewCategory($event.id)"></CategoryForm>
</template>

<script>
import MultiSelect from 'primevue/multiselect'
import CategoryForm from '@/views/categories/CategoryForm.vue'

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
    btnAddLabel: {
      type: String,
      default(props) { return props.type === 'StorageArea' ? 'Storage Area' : `${props.type} Category` },
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
  mounted() {
    this.removeNonExistingCategories()
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
    // Manage missing categories (we do not have delete persist operaton on array)
    // This apply only on multiple fields, cause for simple field we have cascade delete
    // configured at database level
    removeNonExistingCategories() {
      if (!this.multiple) return

      const currentValue = this.$attrs.modelValue || []
      const existing = this.categories.map((cat) => cat.id)
      const filteredValue = currentValue.filter((catId) => existing.includes(catId))
      if (filteredValue.length !== currentValue.length) {
        this.$emit('update:modelValue', filteredValue)
      }
    },
  },
}
</script>
