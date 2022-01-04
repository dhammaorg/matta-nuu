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
        {{ data.id }}
        <span v-show="productsUnits[data.id]" class="ms-1 fw-normal">({{ productsUnits[data.id] }})</span>
      </template>
      <template #editor="{ data }">
        Edit
      </template>
    </Column>

    <!-- Cells -->
    <Column v-for="day in allDays" :key="`cell-${day.id}`" :field="day.id"
            :class="day.class" class="cell-stock">
      <template #body="{ data, field }">
        <span>
          <span class="consumption" v-if="data.values[field].consumption > 0">-{{ round(data.values[field].consumption) }}</span>
        </span>
        <span class="stock-value" :class="{'fw-bold text-primary': data.values[field].real }">
          {{ round(data.values[field].real || data.values[field].theoric) }}
        </span>
        <span>
          <span class="bought" v-if="data.values[field].bought > 0">+{{ data.values[field].bought }}</span>
        </span>
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
import { unitFactor, unitParent } from '@/services/units'

export default {
  props: ['allDays'],
  components: {
    ColumnGroup, Row,
  },
  data() {
    return {
      productsUnits: {},
      realStock: {
        Pain: {
          'Sat Mar 12 2022': 20,
        },
      },
      buys: {
        Pain: {
          'Mon Mar 14 2022': 5,
        },
      },
    }
  },
  computed: {
    session() {
      return this.$root.session
    },
    stocks() {
      return this.$root.products.map((product) => {
        const values = {}
        let previousStock = 0
        this.allDays.forEach((day) => {
          const bought = (this.buys[product] || {})[day.id] || 0
          const consumption = this.consumption(product, day)
          values[day.id] = {
            real: (this.realStock[product] || {})[day.id],
            bought,
            consumption,
            theoric: previousStock - consumption + bought,
          }
          previousStock = values[day.id].real || values[day.id].theoric
        })
        return { id: product, values }
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
  th.top-left-cell {
    width: 200px;
    min-width: 200px !important;
    max-width: 200px !important;
  }
  .cell-stock {
    padding: 0 !important;
    span {
      display: flex;
      width: 33%;
      height: 100%;
      align-items: center;
      justify-content: center;
      &.bought {
        color: #22C55E;
        font-size: .8rem;
      }
      &.consumption {
        opacity: .6;
        font-size: .7rem;
      }
    }
  }
</style>
