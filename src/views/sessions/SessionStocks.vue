<template>
  <DataTable :value="stocks" showGridlines v-if="session.events.length > 0"
             :scrollable="true" scrollHeight="flex"
             editMode="cell" class="editable-cells-table" @cell-edit-complete="onCellEditComplete">
    <ColumnGroup type="header">
      <Row>
        <!-- Top Left Cell -->
        <Column class="top-left-cell" frozen :rowspan="3" :colspan="2"/>
        <!-- Event Header -->
        <Column v-for="event in session.events" :colspan="event.days.length" :key="event.id"
                class="event-start event-end">
          <template #header>
            {{ event.name }}
          </template>
        </Column>
      </Row>
      <Row>
        <!-- Day Date Header -->
        <Column v-for="day in allDays" :key="`header-date-${day.id}`" :class="day.class"
                :header="day.dateHeader" />
      </Row>
      <Row>
        <!-- Day Name Header -->
        <Column v-for="day in allDays" :header="day.label" :key="`header-${day.id}`"
                :class="day.class" class="fw-normal" />
      </Row>
    </ColumnGroup>

    <!-- First Column : Product -->
    <Column frozen class="first-column">
      <template #body="{ data }">
        {{ data.label }}
      </template>
      <template #editor="{ data }">
        Edit
      </template>
    </Column>

    <!-- Cells -->
    <Column v-for="day in allDays" :key="`cell-${day.id}`" :field="day.id"
            :class="day.class">
      <template #body="{ data, field }">
        {{ data.stocks[field] }}
      </template>
      <template #editor="{ data, field }">
        Edit Stock
      </template>
    </Column>

  </DataTable>

</template>

<script>
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'

export default {
  props: ['allDays'],
  components: {
    ColumnGroup, Row,
  },
  computed: {
    session() {
      return this.$root.session
    },
    stocks() {
      return this.$root.products.map((product) => {
        const stocks = {}
        let previousStock = 0
        this.allDays.forEach((day) => {
          stocks[day.id] = previousStock - this.consumption(product, day)
          previousStock = stocks[day.id]
        })
        return { label: product, stocks }
      })
    },
  },
  methods: {
    onCellEditComplete(event) {
      // const { data, newData } = event
      // data.label = newData.label
      // data.product = newData.product
      // data.unit = newData.unit
      // data.recipie = newData.recipie
    },
    consumption(product, day) {
      let result = 0
      this.session.rows.forEach((row) => {
        const dayValue = row.values[day.id]
        const dayAmount = dayValue.amount || 0
        const dayProduct = row.product || dayValue.product
        if (dayProduct && dayProduct === product) {
          result += dayAmount
          return
        }
        const dayRecipie = row.recipie || dayValue.recipie
        if (!dayRecipie) return
        dayRecipie.products.forEach((recipieProduct) => {
          if (recipieProduct.name === product) {
            result += (dayAmount / dayRecipie.people_count) * recipieProduct.amount
          }
        })
      })
      return result
    },
  },
}
</script>

<style lang="scss" scoped>
  ::v-deep th.top-left-cell {
    width: 200px;
    min-width: 200px !important;
    max-width: 200px !important;
  }
</style>
