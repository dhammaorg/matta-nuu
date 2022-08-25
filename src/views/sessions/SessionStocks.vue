<template>
  <HelpMessage>
    <p>
      Theorical <strong>Stocks</strong> are calculated based on the <strong>Schedule</strong>.
      You can adjust real values per day
    </p>
    <p>
      Everything you buy should be displayed here. You can either enter manually bought amount on each cell, or use the
      <strong>orders</strong> feature to help you manage them
    </p>
    <p>
      <strong>All stocks amounts are the ones at the end of the day</strong>
    </p>
  </HelpMessage>

  <div v-if="!isMounted" :style="{height: 'calc(100vh - 11rem)'}">
    <Spinner/>
  </div>

  <!-- Search outside of the table so it's not refresh when table is refresh -->
  <InputText :value="filters['product_name'].value" @change="filters['product_name'].value = $event.target.value"
             v-debounce="250" class="stocks-search-input" placeholder="Search Product..." />

  <DataTable :value="stocks" showGridlines v-if="session.events.length > 0 && isMounted"
             :scrollable="true" scrollHeight="calc(100vh - 11rem)"
             @cell-edit-complete="onCellEditComplete"  v-model:filters="filters"
             rowGroupMode="subheader" groupRowsBy="category.name" sortField="category.name" :sortOrder="1"
             editMode="cell" class="editable-cells-table stocks-table session-table">
    <ColumnGroup type="header">
      <Row>
        <!-- Top Left Cell -->
        <Column class="top-left-cell transparent align-top" frozen :rowspan="3">
          <template #header>
            <div class="d-flex flex-column gap-1">
              <Button type="button" icon="pi pi-plus" label="Order" class="p-button-sm"
                        @click="$refs.orderForm.show()" />
              <Button type="button" icon="pi pi-plus" label="Inventory" class="p-button-sm"
                        @click="$refs.inventoryForm.show()" />
            </div>
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
        {{ data.product_name }}
        <span v-show="data.product_unit" class="ms-1 fw-normal">({{ data.product_unit }})</span>
      </template>
    </Column>

    <!-- Cells -->
    <Column v-for="day in stockDays" :key="`cell-${day.id}`" :field="day.id" :class="`cell-stock editor-sm ${day.class} ${day.id}`">
      <template #body="{ data, field }">
        <div class="cell-content" :class="{'negative-value': data.values[field].value.round() < 0 }">
          <span class="stock-value-container d-flex flex-column align-items-center">
            <span class="stock-value consumption" v-if="data.values[field].consumption > 0">
              -{{ data.values[field].consumption.round() }}
            </span>
            <span class="stock-value bought" v-if="data.values[field].bought > 0">
              +{{ data.values[field].bought.round() }}
            </span>
          </span>
          <span class="stock-value-container stock-value" :class="{'fw-bold text-primary': data.values[field].real != null }">
            <template v-if="day.id == 'initial'">{{ (data.values[field].real || 0).round() }}</template>
            <template v-else>{{ data.values[field].value.round() }}</template>
          </span>
          <span class="stock-value-container"></span>
        </div>
      </template>
      <template #editor="{ data, field }">
        <InputNumber v-model="data.values[field].real" placeholder="Stock" :maxFractionDigits="2" />
        <InputNumber v-model="data.values[field].manuallyBought" placeholder="Bought" :maxFractionDigits="2" />
        <div v-for="order in data.values[field].ordered" :key="day + field + order.id"
             :title="`Ordered Amount from ${order.name}`" class="p-2">
          <router-link :to="{ name: 'session_order', params: { id: $route.params.id, order_id: order.id }}">
            <strong>+ {{ order.value.round() }}</strong>
            <Button icon="pi pi-pencil" class="p-button-text p-button-sm p-0 px-2 w-auto" />
          </router-link>
        </div>
      </template>
    </Column>

    <template #groupheader="{ data }">
      <span style="position: sticky; left: .7rem">{{ data.category.name || "Others" }}</span>
    </template>

  </DataTable>

  <OrderNewDialog ref="orderForm" />

  <InventoryDialog ref="inventoryForm" :products="sessionProducts" :stocks="stocks" />

</template>

<script>
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import InputNumber from 'primevue/inputnumber'
import OrderNewDialog from './OrderNewDialog.vue'
import StockMixin from '@/services/stocks-mixin'
import CalendarMixin from '@/services/calendar-mixin'
import Spinner from '@/components/Spinner.vue'
import InventoryDialog from './InventoryDialog.vue'

export default {
  inject: ['sessionDays', 'stockDays'],
  mixins: [StockMixin, CalendarMixin],
  components: {
    ColumnGroup, Row, InputNumber, OrderNewDialog, Spinner, InventoryDialog,
  },
  data() {
    return {
      filters: { product_name: { value: null, matchMode: 'contains' } },
    }
  },
  methods: {
    onCellEditComplete(event) {
      const { data, field: day } = event
      const newReal = data.values[day].real
      const newBought = data.values[day].manuallyBought
      // recalculate only the data we need
      /* eslint-disable eqeqeq */
      if (this.session.realStocks[data.product_id][day] != newReal
       || this.session.buys[data.product_id][day] != newBought) {
        this.session.realStocks[data.product_id][day] = newReal
        this.session.buys[data.product_id][day] = newBought
        this.reCalculateStockFor(data.product_id, day)
      }
      /* eslint-enable eqeqeq */
    },
  },
}
</script>

<style lang="scss">
  .stocks-table td:not(.product-column), .stocks-table th {
    // min-width: 70px !important;
  }
  .stocks-search-input {
    position: absolute;
    left: 2rem;
    z-index: 1000;
    width: 201px;
    margin-top: 81px !important;
    border-radius: 0 !important;
  }
  th.top-left-cell {
    width: 200px;
    min-width: 200px !important;
    max-width: 200px !important;
    height: 120px;
    padding: 0 !important;
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
      .stock-value-container {
        width: 33%;
        order: 1;
      }
      .stock-value {
        display: flex;
        height: 100%;
        align-items: center;
        justify-content: center;
        &.bought {
          color: #22C55E;
          font-size: .8rem;
          font-weight: bold;
        }
        &.consumption {
          opacity: .6;
          font-size: .7rem;
        }
      }
    }
    &.initial .stock-value-container {
      &:first-child {
        order: 3;
        padding-right: .4rem;
      }
      &:last-child { order: 0 }
    }
  }
  .p-rowgroup-header {
    z-index: 500 !important;
  }
  .p-rowgroup-header td {
    justify-content: flex-start;
    background-color: var(--surface-ground);
    border: none !important;
    font-weight: bold;
    text-transform: uppercase;
    padding-top: 1.5rem !important;
    color: var(--bluegray-500);
  }
</style>
