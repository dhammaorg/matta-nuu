<template>
  <h1 class="px-3">{{ session.name }}</h1>

  <div style="height: calc(100vh - 9rem)">
    <DataTable :value="rows" dataKey="id" showGridlines
              :scrollable="true" scrollHeight="flex"
              editMode="cell" class="editable-cells-table" @cell-edit-complete="onCellEditComplete">
      <ColumnGroup type="header">
        <Row>
          <Column class="first-column" frozen :rowspan="3">
            <template #header>
              <Button icon="pi pi-plus" label="Row" class="p-button-sm"
                      @click="rows.push({ id: 9, type: 'custom', label: 'Desserts', values: {} })" />
            </template>
          </Column>
          <Column v-for="event in events" :colspan="event.days.length" :key="event.id"
                  class="event-start event-end">
            <template #header>
              <div class="d-flex align-items-center justify-content-between w-100">
                {{ event.name }}
                <Button icon="pi pi-plus" label="Day" class="float-end p-button-sm"
                        @click="event.days.push('New Day')" />
              </div>
            </template>
          </Column>
        </Row>
        <Row>
          <Column v-for="day in allDays" :key="`header-date-${day.id}`" :class="day.class">
            <template #header>
              {{ day.date.toLocaleDateString([], { weekday: 'short', month: "2-digit", day: 'numeric' }) }}
            </template>
          </Column>
        </Row>
        <Row>
          <Column v-for="day in allDays" :key="`header-${day.id}`" :class="day.class">
            <template #header>
              <InputText v-model="day.label" class="day-input" />
            </template>
          </Column>
        </Row>
      </ColumnGroup>

      <!-- First Column : Row Type -->
      <Column frozen class="first-column">
        <template #body="{ data }">
          <span v-if="data.type == 'product'">
            {{ data.product }}
            <span v-if="data.unit">({{ data.unit }})</span>
          </span>
          <span v-else-if="data.type == 'recipie'">{{ data.recipie.name }}</span>
          <span v-else>{{ data.label }}</span>
        </template>
        <template #editor="{ data }">
          <template v-if="data.type == 'product'">
            <InputProduct v-model="data.product" />
            <InputUnit v-model="data.unit" />
          </template>
          <InputRecipie v-else-if="data.type == 'recipie'" v-model="data.recipie" />
          <InputText    v-else v-model="data.label" />
        </template>
      </Column>

      <!-- Cells -->
      <Column v-for="day in allDays" :key="`cell-${day.id}`" :field="day.id"
              :class="day.class">
        <template #body="{ data, field }">
          <template v-if="data.values[field]" >
            <label v-if="data.type == 'products'">
              {{ data.values[field].product }}
              <span v-if="data.values[field].unit">({{ data.values[field].unit }})</span>
            </label>
            <label v-if="data.type == 'recipies' && data.values[field].recipie">
              {{ data.values[field].recipie.name }}
            </label>
            <div class="amount">{{ data.values[field].amount }}</div>
          </template>
        </template>
        <template #editor="{ data, field }">
          <template v-if="data.type == 'products'">
            <InputProduct v-model="data.values[field].product" />
            <InputUnit v-model="data.values[field].unit" />
          </template>
          <InputRecipie v-else-if="data.type == 'recipies'" v-model="data.values[field].recipie" />
          <InputNumber v-model="data.values[field].amount" inputClass="text-center"
                       placeholder="Amount" autofocus />
        </template>
      </Column>

    </DataTable>
  </div>
</template>

<script>
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import InputNumber from 'primevue/inputnumber'
import InputProduct from '@/components/InputProduct.vue'
import InputRecipie from '@/components/InputRecipie.vue'
import InputUnit from '@/components/InputUnit.vue'

export default {
  components: {
    ColumnGroup, Row, InputProduct, InputRecipie, InputUnit, InputNumber,
  },
  data() {
    return {
      session: {
        name: 'Session de test',
      },
      events: [
        {
          id: 0, name: 'Install', start_date: new Date(2022, 2, 12), days: ['Prepa', 'J0'],
        },
        {
          id: 1, name: '3d course', start_date: new Date(2022, 2, 14), days: ['J1', 'J2 - VipDay', 'J3'],
        },
      ],
      rows: [
        {
          id: 1, type: 'product', product: 'Bread', unit: 'kg', values: {},
        },
        {
          id: 2, type: 'recipie', recipie: { name: 'Crumble' }, values: {},
        },
        {
          id: 3, type: 'recipies', label: 'Desserts', values: {},
        },
        {
          id: 4, type: 'products', label: 'Desserts', values: {},
        },
      ],
    }
  },
  computed: {
    allDays() {
      const days = []
      this.events.forEach((event) => {
        event.days.forEach((day, index) => {
          const classes = []
          if (index === 0) classes.push('event-start')
          if (index === (event.days.length - 1)) classes.push('event-end')
          const date = event.start_date.addDays(index)
          days.push({
            id: date.toDateString(), label: day, event, date, class: classes.join(' '),
          })
        })
      })
      return days
    },
  },
  async mounted() {
    // this.$db.from('sessions').select().match({ id: this.$route.params.id }).then((result) => {
    //   this.events = result.data[0].events || []
    //   this.rows = result.data[0].rows || []
    // })

    this.initDaysValuesForEachRow()
  },
  watch: {
    allDays: {
      deep: true,
      handler() { this.initDaysValuesForEachRow() },
    },
  },
  methods: {
    initDaysValuesForEachRow() {
      this.allDays.forEach((day) => {
        this.rows.forEach((row) => {
          if (!row.values[day.id]) row.values[day.id] = {}
        })
      })
    },
    onCellEditComplete(event) {
      const { data, newData } = event
      data.label = newData.label
      data.product = newData.product
      data.unit = newData.unit
      data.recipie = newData.recipie
    },
  },
}
</script>

<style lang="scss">
  .event-end:not(:last-child) {
    border-right-color: var(--text-color-secondary) !important;
  }
  .first-column {
    width: 200px;
    min-width: 200px !important;
    justify-content: flex-start !important;
  }
  td.first-column {
    background-color: var(--text-color-secondary) !important;
    color: white;
    font-weight: bold;
  }
  th.first-column {
    background-color: var(--surface-0) !important;
  }
  td.p-editable-column {
    flex-wrap: wrap;
    &:not(.first-column) {
      flex-basis: 100px !important;
      flex-grow: 1 !important;
    }
    input, select, .p-dropdown {
      border-radius: 0 !important;
    }
  }
  td, th {
    min-width: 100px !important;
    justify-content: center;
    label {
      width: 100%;
      text-align: center;
      font-weight: bold;
      font-size: .8rem;
      margin-bottom: 5px;
    }
    .amount {
      font-size: 1.2rem;
    }
  }
  .p-datatable .p-column-header-content {
    justify-content: center;
  }
  .day-input {
    width: auto;
    min-width: 0;
    background-color: transparent !important;
    border: none !important;
    padding: 0 !important;
    outline: none !important;
    box-shadow: none !important;
    text-align: center;
  }
</style>
