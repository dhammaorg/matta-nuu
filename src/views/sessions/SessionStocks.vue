<template>
  <DataTable :value="stocks" showGridlines v-if="session.events.length > 0"
             :scrollable="true" scrollHeight="flex"
             editMode="cell" class="editable-cells-table stocks-table">
    <ColumnGroup type="header">
      <Row>
        <!-- Top Left Cell -->
        <Column class="top-left-cell" frozen :rowspan="3">
          <template #header>
            <Button type="button" icon="pi pi-plus" label="Order" class="p-button-sm"
                      @click="$refs.orderForm.show()" />
          </template>
        </Column>
        <!-- Initial Stocks -->
        <Column class="event-start event-end text-center" :rowspan="3" header="Initial Stocks"/>
        <!-- Event Header -->
        <Column v-for="event in session.events" :colspan="event.days.length" :key="event.id"
                class="event-start event-end header-group">
          <template #header>
            {{ event.name }}
          </template>
        </Column>
      </Row>
      <Row>
        <!-- Day Date Header -->
        <Column v-for="day in sessionDays" :key="`header-date-${day.id}`" :class="day.class" class="day-date"
                :header="day.dateHeader" />
      </Row>
      <Row>
        <!-- Day Name Header -->
        <Column v-for="day in sessionDays" :header="day.label" :key="`header-${day.id}`"
                :class="day.class" class="fw-normal day-label" />
      </Row>
    </ColumnGroup>

    <!-- First Column : Product -->
    <Column frozen class="product-column">
      <template #body="{ data }">
        {{ data.product }}
        <span v-show="productsUnits[data.product]" class="ms-1 fw-normal">({{ productsUnits[data.product] }})</span>
      </template>
    </Column>

    <!-- Cells -->
    <Column v-for="day in days" :key="`cell-${day.id}`" :field="day.id" :class="day.class" class="cell-stock editor-sm">
      <template #body="{ data, field }">
        <div class="cell-content" :class="{'negative-value': round(data.values[field].value) < 0 }">
          <span class="stock-value">
            <span class="consumption" v-if="data.values[field].consumption > 0">-{{ round(data.values[field].consumption) }}</span>
          </span>
          <span class="stock-value" :class="{'fw-bold text-primary': data.values[field].real != null }">
            {{ round(data.values[field].value) }}
          </span>
          <span class="stock-value">
            <span class="bought" v-if="data.values[field].bought > 0">+{{ data.values[field].bought }}</span>
          </span>
        </div>
      </template>
      <template #editor="{ data, field }">
        <InputNumber v-model="session.realStocks[data.product][field]" placeholder="Stock" />
        <InputNumber v-model="session.buys[data.product][field]" placeholder="Bought" />
      </template>
    </Column>

  </DataTable>

  <OrderForm ref="orderForm" :days="days" />

</template>

<script>
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import InputNumber from 'primevue/inputnumber'
import OrderForm from './OrderForm.vue'
import { unitFactor, unitParent } from '@/services/units'

export default {
  props: ['sessionDays'],
  components: {
    ColumnGroup, Row, InputNumber, OrderForm,
  },
  data() {
    return {
      productsUnits: {},
    }
  },
  computed: {
    session() {
      return this.$root.session
    },
    days() {
      if (this.sessionDays.length === 0) return []
      // Adds a fake day for initial stocks
      const firstDay = this.sessionDays[0]
      const days = [...this.sessionDays]
      const date = firstDay.date.removeDays(1)
      days.unshift({
        id: date.toDateString(), class: 'event-start event-end', label: 'Initial Stocks', date, initial: true,
      })
      return days
    },
    stocks() {
      return this.$root.products.map((product) => {
        const values = {}
        let previousStock = 0
        this.days.forEach((day) => {
          const bought = (this.session.buys[product] || {})[day.id] || 0
          const consumption = this.consumption(product, day)
          const real = (this.session.realStocks[product] || {})[day.id]
          const theoric = previousStock - consumption + bought
          const value = real != null ? real : theoric
          values[day.id] = {
            real, bought, consumption, theoric, value,
          }
          previousStock = value
        })
        return { product, values }
      })
    },
  },
  methods: {
    consumption(product, day) {
      let result = 0
      if (day.initial) return 0
      this.session.rows.forEach((row) => {
        const dayValue = row.values[day.id]
        const dayAmount = dayValue.amount || 0
        const dayProduct = row.product || dayValue.product
        const dayUnit = row.unit || dayValue.unit
        if (dayProduct && dayProduct === product) {
          this.productsUnits[product] = unitParent(dayUnit)
          result += dayAmount * unitFactor(dayUnit)
          return
        }
        const dayRecipie = row.recipie || dayValue.recipie
        if (!dayRecipie) return
        dayRecipie.products.forEach((recipieProduct) => {
          if (recipieProduct.name === product) {
            this.productsUnits[product] = unitParent(recipieProduct.unit)
            result += (dayAmount / dayRecipie.people_count) * recipieProduct.amount * unitFactor(recipieProduct.unit)
          }
        })
      })
      return result
    },
    round(n, decimals = 2) {
      return Number(`${Math.round(`${n}e${decimals}`)}e-${decimals}`)
    },
  },
}
</script>

<style lang="scss">
  .stocks-table td:not(.product-column), .stocks-table th {
    min-width: 70px !important;
  }
  th.top-left-cell {
    width: 200px;
    min-width: 200px !important;
    max-width: 200px !important;
  }
  .cell-stock {
    padding: 0 !important;
    .cell-content {
      width: 100%;
      height: 100%;
      display: flex;
      &.negative-value { background-color: var(--pink-50); }

      .stock-value {
        display: flex;
        width: 33%;
        height: 100%;
        align-items: center;
        justify-content: center;
        .bought {
          color: #22C55E;
          font-size: .8rem;
        }
        .consumption {
          opacity: .6;
          font-size: .7rem;
        }
      }
    }
  }
</style>
