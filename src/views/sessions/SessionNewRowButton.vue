<template>
  <Button type="button" icon="pi pi-plus" class="mb-2 p-button-sm" label="Row"
          @click="$refs.addRowMenu.toggle($event)" />
  <TieredMenu ref="addRowMenu" :model="rowTypes" :popup="true" />
</template>

<script>
import TieredMenu from 'primevue/tieredmenu'

export default {
  components: { TieredMenu },
  emits: ['add-row'],
  data() {
    return {
      rowTypes: [
        {
          id: 'product', label: 'Single Product Row', command: () => { this.addRow('product') },
        },
        {
          id: 'products', label: 'Variable Products Row', command: () => { this.addRow('products') },
        },
        {
          id: 'recipie', label: 'Single Recipie Row', command: () => { this.addRow('recipie') },
        },
        {
          id: 'recipies', label: 'Variable Recipies Row', command: () => { this.addRow('recipies') },
        },
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

<style lang='scss' scoped>

</style>
