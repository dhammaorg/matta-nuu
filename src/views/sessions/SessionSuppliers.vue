<template>
  <HelpMessage>
    <p>Here you can link a <strong>Supplier</strong> to each product. It would be helpful to create
    <strong>orders per supplier</strong>.</p>
    <p>You can also customize <strong>how a product is packaged</strong> by the supplier, changing the name and conditioning</p>
  </HelpMessage>

  <DataTable :value="products" showGridlines :scrollable="true" scrollHeight="flex"
             editMode="cell" class="editable-cells-table suppliers-table session-table">
    <ColumnGroup type="header">
      <Row>
          <Column class="transparent" :colspan="2" />
          <Column class="header-group" header="Custom Packaging" :colspan="2" />
      </Row>
      <Row>
        <Column header="Product" />
        <Column header="Supplier" />
        <Column><template #header>
          <span v-tooltip.top="'Change the name of a product. Example : Sugar -> Raw Organic Sugar'">
            Name / Reference
          </span>
        </template></Column>
        <Column><template #header>
          <span v-tooltip.top="'Example : if you buy Rice in 5kg bag, then enter 5 in this column. The order will be adjusted so if you need 24kg it will order 5 bag of 5kg'">
            Conditioning
          </span>
        </template></Column>
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
