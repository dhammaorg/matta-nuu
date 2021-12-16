<template>
  <h1>{{ session.name }}</h1>

  <DataTable :value="rows" dataKey="id">
    <ColumnGroup type="header">
      <Row>
        <Column header="" :rowspan="3" />
        <Column v-for="event in events" :colspan="event.days.length" :key="event"
                class="event-start event-end">
          <template #header="slotProps">
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
    <Column>
      <template #body="slotProps">
        <span v-if="slotProps.data.type == 'product'">{{ slotProps.data.product }}</span>
        <span v-if="slotProps.data.type == 'recipie'">{{ slotProps.data.recipie.name }}</span>
        <span v-else>{{ slotProps.data.label }}</span>
      </template>
    </Column>

    <!-- Cell for each row/day -->
    <Column v-for="day in allDays" :key="day" :class="day.class">
      <template #body="slotProps">
        0
      </template>
    </Column>

  </DataTable>
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
    border-left: 1rem solid #dee2e6 !important;
  }
</style>
