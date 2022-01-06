<template>
  <DataTable :value="products" showGridlines :scrollable="true" scrollHeight="flex"
             editMode="cell" class="editable-cells-table suppliers-table">
    <ColumnGroup type="header">
      <Row>
          <Column class="transparent" :colspan="2" />
          <Column class="header-group" header="Custom Packaging" :colspan="2" />
      </Row>
      <Row>
        <Column header="Product" />
        <Column header="Supplier" />
        <Column header="Name / Reference" />
        <Column header="Conditioning" />
      </Row>
    </ColumnGroup>

    <Column field="product" class="product-column w-auto" />
    <Column field="supplier" class="p-0">
      <template #body="{ data, field }">
        <InputSupplier v-model="session.products[data.product][field]" />
      </template>
    </Column>
    <Column field="reference">
      <template #editor="{ data, field }">
        <input class="p-inputtext p-component" v-model.lazy="session.products[data.product][field]" />
      </template>
    </Column>
    <Column field="conditioning">
      <template #editor="{ data, field }">
        <input class="p-inputtext p-component" type="number" v-model.lazy="session.products[data.product][field]" />
      </template>
    </Column>
  </DataTable>

</template>

<script>
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import InputSupplier from '@/components/InputSupplier.vue'

export default {
  components: {
    ColumnGroup, Row, InputSupplier,
  },
  computed: {
    session() {
      return this.$root.session
    },
    products() {
      const result = []
      this.$root.products.forEach((prod) => {
        result.push({ ...{ product: prod }, ...this.session.products[prod] })
      })
      return result
    },
  },
}
</script>

<style lang="scss">
  .suppliers-table.p-datatable .p-datatable-tbody > tr > td, th.header-group,
  .suppliers-table.editable-cells-table .p-editable-column.p-cell-editing input {
    padding: .7rem;
  }
</style>
