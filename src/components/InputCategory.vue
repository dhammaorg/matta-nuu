<template>
  <Dropdown :options="categories" optionLabel="name" optionValue="id" :showClear="true"
            placeholder="Category" :filter="true" filterPlaceholder="" class="w-100" v-bind="$attrs"
            @filter="filterValue = $event.value" >
    <template #footer v-if="btnAdd">
      <div class="p-dropdown-header">
        <Button icon="pi pi-plus" :label="`${type} Category`" class="p-button-sm"
                @click="$refs.form.show({ name: filterValue, type })" />
      </div>
    </template>
  </Dropdown>

  <CategoryForm ref="form" @created="$emit('update:modelValue', $event.id)"></CategoryForm>
</template>

<script>
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
  },
  components: { CategoryForm },
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
}
</script>
