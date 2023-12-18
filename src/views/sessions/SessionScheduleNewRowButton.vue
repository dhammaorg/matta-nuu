<template>
  <Button type="button" icon="pi pi-plus" class="p-button-sm" label="Row"
          @click="$refs.addRowMenu.toggle($event)" />
  <TieredMenu ref="addRowMenu" :model="rowTypes" :popup="true">
    <template #item="{ item }">
      <a class="p-menuitem-link" v-tooltip.right="item.help">
        <span class="p-menuitem-text" @click="addRow(item.id)">
          {{ item.label }}
        </span>
      </a>
    </template>
  </TieredMenu>
</template>

<script>
import TieredMenu from 'primevue/tieredmenu'

export default {
  components: { TieredMenu },
  emits: ['add-row'],
  data() {
    return {
      rowTypes: [
        { id: 'product', label: 'Single Product Row', help: 'If you need some product every day (Example = Bread)' },
        { id: 'products', label: 'Variable Products Row', help: 'Each day you can choose a product (Example : Day 0 = Apples, Day 1 = Pears)' },
        { id: 'recipie', label: 'Single Recipie Row', help: 'If you cook a recipie every day (Example = Porridge)' },
        { id: 'recipies', label: 'Variable Recipies Row', help: 'Create a general row like "Lunch" and choose a different recipie to cook on each day' },
      ],
    }
  },
  methods: {
    addRow(rowType) {
      this.$emit('add-row', rowType)
    },
  },
}
</script>

<style lang='scss' scoped></style>
