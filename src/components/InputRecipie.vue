<template>
  <div class="p-inputgroup">
    <Dropdown v-bind="$attrs" :options="$root.recipiesArray" optionLabel="name" optionValue="id"
              placeholder="Recipie" :filter="true" filterPlaceholder="" :showClear="true"
              class="w-100" @filter="filterValue = $event.value">
      <template #footer>
        <div class="p-dropdown-header">
          <Button icon="pi pi-plus" label="Recipie" class="p-button-sm"
                  @click="$refs.form.show({ name: filterValue })" />
        </div>
      </template>
    </Dropdown>
    <Button icon="pi pi-pencil" v-if="value" @click="$refs.form.show($root.getRecipie(value))"
            v-tooltip="'Edit Recipie'"/>
  </div>
  <RecipieForm ref="form" @created="$emit('update:modelValue', $event.id)"></RecipieForm>
</template>

<script>
import RecipieForm from '@/views/recipies/RecipieForm.vue'

export default {
  components: { RecipieForm },
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
