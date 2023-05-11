<template>
  <FullCalendar ref="fullCalendar" :options="calendarOptions" v-if="session && session.events">
    <!-- Custom Event Display -->
    <template #eventContent="arg">
      <!-- Order -->
      <template v-if="arg.event.extendedProps.order">
        <i class="pi pi-shopping-cart"></i>
        <b>{{ arg.event.title }}</b>
      </template>
      <!-- Note -->
      <template v-else-if="arg.event.extendedProps.note">
        <i class="pi pi-circle-fill"></i>
        <b>{{ arg.event.title }}</b>
      </template>
      <!-- Alert -->
      <template v-else-if="arg.event.extendedProps.alert">
        <i class="pi pi-info-circle"></i>
        <b>{{ arg.event.title }}</b>
      </template>
      <!-- Other -->
      <template v-else>
        {{ arg.event.title }}
      </template>
    </template>

    <!-- DayCell add DayLabel (D0, D2...) -->
    <template #dayCellContent="arg">
      <span class="day-label" v-if="dayLabel(arg.date)">{{ dayLabel(arg.date) }}</span>
      {{ arg.dayNumberText }}
    </template>
  </FullCalendar>

  <NoteFormDialog ref="noteForm"/>
  <OrderNewDialog ref="orderForm" />
  <InventoryDialog ref="inventoryForm" :products="sessionProducts" :stocks="stocks" />

</template>

<script>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import NoteFormDialog from '@/views/notes/NoteFormDialog.vue'
import InventoryDialog from './InventoryDialog.vue'
import OrderNewDialog from './OrderNewDialog.vue'
import StockMixin from '@/services/stocks-mixin'

export default {
  inject: ['sessionOrders', 'sessionDays', 'stockDays'],
  mixins: [StockMixin],
  components: {
    FullCalendar, NoteFormDialog, OrderNewDialog, InventoryDialog,
  },
  data() {
    return {
      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        height: '80vh',
        events: [],
        firstDay: 1,
        dateClick: this.handleDateClick,
        eventClick: this.handleEventClick,
        datesSet(dateInfo) {
          console.log(dateInfo)
        },
        customButtons: {
          addNote: { text: '+ Note', click: this.newEvent },
          addInventory: { text: '+ Inventory', click: this.newInventory },
          addOrder: { text: '+ Order', click: this.newOrder },
        },
        headerToolbar: {
          left: 'addInventory addOrder addNote',
          center: 'title',
          right: 'today prev,next',
        },
      },
    }
  },
  computed: {
    session() {
      return this.$root.session
    },
    calendar() {
      return this.$refs.fullCalendar.getApi()
    },
    convertedEvents() {
      return this.session.events.map((event) => ({
        title: event.name,
        start: event.start_date,
        end: event.start_date.addDays(event.days.length),
        extendedProps: {
          people_count: event.people_count,
        },
        className: 'event',
        backgroundColor: 'var(--indigo-100)',
        borderColor: 'var(--indigo-100)',
        textColor: 'var(--indigo-900)',
      }))
    },
    convertedOrders() {
      return this.sessionOrders.map((order) => ({
        title: order.name,
        date: new Date(order.delivery_day_date).setHours(2),
        className: 'order',
        display: 'list-item',
        extendedProps: { order },
      }))
    },
    convertedNotes() {
      return Object.values(this.$root.notes)
        .filter((order) => order.session_id === this.$root.session.id)
        .map((note) => ({
          title: note.title,
          date: new Date(note.date).setHours(3),
          className: 'note',
          display: 'list-item',
          extendedProps: { note },
        }))
    },
    convertedAlerts() {
      const result = []
      Object.entries(this.missingProductsPerDay).forEach(([dayId, productIds]) => {
        let title = `${productIds.length} products missing`
        if (productIds.length < 4) {
          title = productIds.map((id) => this.$root.getProduct(id).name.crop(6)).join(', ')
        }
        result.push({
          date: new Date(this.stockDays.find((d) => d.id == dayId).date).setHours(1),
          title,
          className: 'alert',
          display: 'list-item',
          extendedProps: { alert: productIds },
        })
      })
      return result
    },
    eventsToDisplay() {
      return this.convertedEvents
        .concat(this.convertedOrders)
        .concat(this.convertedNotes)
        .concat(this.convertedAlerts)
    },
  },
  mounted() {
    if (this.session.events.length > 0) {
      this.calendar.gotoDate(this.session.events[0].start_date)
      this.calendarOptions.events = this.eventsToDisplay
    }
  },
  methods: {
    dayLabel(date) {
      const day = this.sessionDays.find((d) => d.date.getTime() == date.getTime())
      return day ? day.label : ''
    },
    handleDateClick(info) {
      this.$refs.noteForm.show({ date: new Date(info.dateStr) })
    },
    handleEventClick(info) {
      if (info.event.extendedProps.note) {
        this.$refs.noteForm.show(info.event.extendedProps.note)
      } else if (info.event.extendedProps.order) {
        this.$router.push({
          name: 'session_order',
          params: {
            id: this.$route.params.id,
            order_id: info.event.extendedProps.order.id,
          },
        })
      }
    },
    newEvent() {
      this.$refs.noteForm.show()
    },
    newOrder() {
      this.$refs.orderForm.show()
    },
    newInventory() {
      this.$refs.inventoryForm.show()
    },
  },
  watch: {
    eventsToDisplay: {
      deep: true,
      handler() {
        this.calendarOptions.events = this.eventsToDisplay
      },
    },
  },
}
</script>

<style lang="scss">
  .fc .fc-daygrid-day-number {
    display: flex;
    align-items: center;
    .day-label {
      margin-right: .5rem;
      background-color: var(--indigo-100);
      padding: 0 3px;
      border-radius: 4px;
      font-size: .9rem;
      color: var(--indigo-800);
    }
  }
  .fc-day.fc-daygrid-day {
    cursor: pointer;
    &:after {
      content: "+";
      opacity: 0;
      transition: opacity .4s;
      position: absolute;
      bottom: 0.5rem;
      right: 1rem;
      width: 1.2rem;
      height: 1.2rem;
      line-height: 1rem;
      background-color: var(--blue-50);
      color: var(--blue-200);
      font-weight: bold;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    &:hover:after {
      opacity: 1;
    }
  }
  .fc-event {
    overflow: hidden;
    i {
      font-size: .8rem;
      margin-right: 5px;
    }

    &.event {
      padding-left: .5rem;
      border-radius: 4px;
    }

    &.order {
      cursor: pointer;
      color: var(--purple-600);
      &:hover {
        color: var(--purple-700) !important;
        background-color: var(--purple-50) !important;
      }
    }
    &.note {
      cursor: pointer;
      color: var(--blue-600);
      &:hover {
        color: var(--blue-700) !important;
        background-color: var(--blue-50) !important;
      }
      i {
        transform: scale(.8);
      }
    }
    &.alert {
      color: var(--bluegray-500);
      &:hover {
        color: var(--bluegray-600) !important;
        background-color: var(--bluegray-50) !important;
      }
    }
  }
  .fc-addNote-button {
    background-color: var(--blue-600) !important;
    border-color: var(--blue-600) !important;
  }
  .fc-addOrder-button {
    background-color: var(--purple-600) !important;
    border-color: var(--purple-600) !important;
  }
  .fc-addInventory-button {
    background-color: var(--bluegray-600) !important;
    border-color: var(--bluegray-600) !important;
  }

</style>
