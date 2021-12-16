<template>
  <h1 class="px-3">{{ session.name }}</h1>

  <div style="height: calc(100vh - 9rem)">
    <DataTable :value="rows" dataKey="id"
              :scrollable="true" scrollHeight="flex">
      <ColumnGroup type="header">
        <Row>
          <Column class="first-column" frozen :rowspan="3" />
          <Column v-for="event in events" :colspan="event.days.length" :key="event"
                  class="event-start event-end">
            <template #header>
              <div class="d-flex align-items-center justify-content-between w-100">
                {{ event.name }}
                <Button icon="pi pi-plus" label="Day" class="float-end p-button-sm"
                        @click="event.days.push('New')" />
              </div>
            </template>
          </Column>
        </Row>
        <Row>
          <Column v-for="day in allDays" :key="day" :class="day.class">
            <template #header>
              {{ day.date.toLocaleDateString([], { weekday: 'short', month: "2-digit", day: 'numeric' }) }}
            </template>
          </Column>
        </Row>
        <Row>
          <Column v-for="day in allDays" :header="day.label" :key="day" :class="day.class" />
        </Row>
      </ColumnGroup>

      <!-- Rows -->
      <Column frozen class="first-column">
        <template #body="{ data }">
          <span v-if="data.type == 'product'">{{ data.product }}</span>
          <span v-if="data.type == 'recipie'">{{ data.recipie.name }}</span>
          <span v-else>{{ data.label }}</span>
        </template>
      </Column>

      <!-- Cell for each row/day -->
      <Column v-for="day in allDays" :key="day" :class="day.class" style="flex-grow:1; flex-basis:100px">
        <template #body>
          0
        </template>
      </Column>

    </DataTable>
  </div>
</template>

<script>
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'

export default {
  components: { ColumnGroup, Row },
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
        { id: 1, type: 'product', product: 'Bread' },
        { id: 2, type: 'recipie', recipie: { name: 'Crumble' } },
        { id: 2, type: 'custom', label: 'Desserts' },
        { id: 2, type: 'custom', label: 'Desserts' },
        { id: 2, type: 'custom', label: 'Desserts' },
        { id: 2, type: 'custom', label: 'Desserts' },
        { id: 2, type: 'custom', label: 'Desserts' },
        { id: 2, type: 'custom', label: 'Desserts' },
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
          days.push({
            label: day, event, date: event.start_date.addDays(index), class: classes.join(' '),
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
  },
}
</script>

<style lang="scss">
  .event-start {
    border-left-width: 1px !important;
  }
  .first-column {
    display: table-cell !important;
    width: 150px;
    flex: none !important;
    background-color: black;
  }
  td.first-column {
    background-color: var(--text-color-secondary) !important;
    color: white;
    font-weight: bold;
  }
  th.first-column {
    background-color: var(--surface-0) !important;
  }
  .p-datatable-scrollable .p-datatable-thead > tr > th, .p-datatable-scrollable .p-datatable-tbody > tr > td, .p-datatable-scrollable .p-datatable-tfoot > tr > td {
    min-width: 100px;
  }
</style>
