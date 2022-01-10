<template>
  <DataTable :value="stocks" showGridlines v-if="session.events.length > 0"
             :scrollable="true" scrollHeight="flex"
             editMode="cell" class="editable-cells-table stocks-table session-table">
    <ColumnGroup type="header">
      <Row>
        <!-- Top Left Cell -->
        <Column class="top-left-cell transparent" frozen :rowspan="3">
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
    <Column v-for="day in stockDays" :key="`cell-${day.id}`" :field="day.id" :class="day.class" class="cell-stock editor-sm">
      <template #body="{ data, field }">
        <div class="cell-content" :class="{'negative-value': round(data.values[field].value) < 0 }">
          <span class="stock-value">
            <span class="consumption" v-if="data.values[field].consumption > 0">-{{ round(data.values[field].consumption) }}</span>
          </span>
          <span class="stock-value" :class="{'fw-bold text-primary': data.values[field].real != null }">
            {{ round(data.values[field].value) }}
          </span>
          <span class="stock-value">
            <span class="bought" v-if="data.values[field].bought > 0">+{{ round(data.values[field].bought) }}</span>
          </span>
        </div>
      </template>
      <template #editor="{ data, field }">
        <InputNumber v-model="session.realStocks[data.product][field]" placeholder="Stock" />
        <InputNumber v-model="session.buys[data.product][field]" placeholder="Bought" />
        <div v-for="order in data.values[field].ordered" :key="day + field + order.id"
             :title="`Ordered Amount from ${order.name}`" class="p-2">
          <router-link :to="{ name: 'session_order', params: { id: $route.params.id, order_id: order.id }}">
            <strong>+ {{ round(order.value) }}</strong>
            <Button icon="pi pi-pencil" class="p-button-text p-button-sm p-0 px-2 w-auto" />
          </router-link>
        </div>
      </template>
    </Column>

  </DataTable>

  <OrderNewDialog ref="orderForm" :days="sessionDays" />

</template>

<script>
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import InputNumber from 'primevue/inputnumber'
import OrderNewDialog from './OrderNewDialog.vue'
import StockMixin from '@/services/stocks-mixin'

export default {
  inject: ['sessionDays', 'stockDays'],
  mixins: [StockMixin],
  components: {
    ColumnGroup, Row, InputNumber, OrderNewDialog,
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
  .stocks-table .cell-stock {
    padding: 0 !important;
    .cell-content {
      width: 100%;
      height: 100%;
      display: flex;
      &.negative-value {
        color: white;
        background-color: var(--bluegray-700);
      }

      .stock-value {
        display: flex;
        width: 33%;
        height: 100%;
        align-items: center;
        justify-content: center;
        .bought {
          color: #22C55E;
          font-size: .8rem;
          font-weight: bold;
        }
        .consumption {
          opacity: .6;
          font-size: .7rem;
        }
      }
    }
  }
</style>
