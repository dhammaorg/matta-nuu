<template>
  <Dropdown v-bind="$attrs" :options="recipies" optionLabel="name"
            placeholder="Recipie" :filter="true" filterPlaceholder=""
            class="w-100">
    <template #footer>
      <div class="p-dropdown-header">
        <Button icon="pi pi-plus" label="Recipie" class="p-button-sm"
                @click="$refs.form.show()" />
      </div>
    </template>
  </Dropdown>

  <RecipieForm ref="form" @created="$emit('update:modelValue', $event)"></RecipieForm>
</template>

<script>
import RecipieForm from '@/views/recipies/RecipieForm.vue'

export default {
  components: { RecipieForm },
  computed: {
    recipies() {
      // sort by last created
      return this.$root.recipies.slice().sort((a, b) => (a.id < b.id ? 1 : -1))
    },
  },
}
</script>
