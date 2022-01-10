<template>
  <SessionMenu ref="menu" />

  <div :class="contentFullPage ? 'page-full-content' : 'page-content'">
    <div :style="contentFullPage ? 'height: calc(100vh - 10.5rem)' : ''" v-if="$root.isSessionFullyLoaded">
      <router-view></router-view>
    </div>
  </div>

  <ConfirmDialog></ConfirmDialog>

</template>

<script>
import { computed } from 'vue'
import SessionMenu from './SessionMenu.vue'

export default {
  components: { SessionMenu },
  provide() {
    return {
      sessionDays: computed(() => this.sessionDays),
      stockDays: computed(() => this.stockDays),
    }
  },
  computed: {
    session() {
      return this.$root.session
    },
    sessionDays() {
      const days = []
      this.session.events.forEach((event) => {
        event.days.forEach((day, index) => {
          const classes = []
          if (index === 0) classes.push('event-start')
          if (index === (event.days.length - 1)) classes.push('event-end')
          const date = event.start_date.addDays(index)
          const dateHeader = date.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' })
          days.push({
            id: date.toDateString(), label: day, event, index, date, class: classes.join(' '), dateHeader,
          })
        })
      })
      return days
    },
    stockDays() {
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
    contentFullPage() {
      return this.$route.name !== 'session_orders'
    },
  },
  async mounted() {
    if (this.$root.isSessionFullyLoaded) return // if already loaded do nothing

    const { data } = await this.$db.from('sessions').select().match({ id: this.$route.params.id }).single()
    data.events ||= []
    data.events.forEach((e) => { e.start_date = new Date(e.start_date) })
    data.rows ||= []
    this.$root.session = data
    this.$root.fullyLoadedSessions.push(data.id)
    this.initDaysValuesForEachRow()

    this.$db.from('orders').select().match({ session_id: this.$route.params.id }).then((result) => {
      result.data.forEach((order) => {
        order.target_date = new Date(order.target_date)
        order.delivery_date = new Date(order.delivery_date)
        if (!this.$root.orders[order.id]) {
          this.$root.orders[order.id] = order
        }
      })
    })
  },
  methods: {
    initDaysValuesForEachRow() {
      this.sessionDays.forEach((day) => {
        this.session.rows.forEach((row) => {
          if (!row.values[day.id]) row.values[day.id] = {}
        })
      })
    },
  },
  watch: {
    sessionDays: {
      deep: true,
      handler() { this.initDaysValuesForEachRow() },
    },
  },
  beforeRouteLeave(to, from, next) {
    if (this.$refs.menu.unsavedChangesWarning) {
      this.$confirm.require({
        message: 'You have unsaved changes, are you sure you want to quit?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          // Cancel changes (next time it will be reloaded)
          this.$root.fullyLoadedSessions = this.$root.fullyLoadedSessions.filter((id) => id != this.session.id)
          next()
        },
        reject: () => {
          next(false)
        },
      })
    } else next()
  },
}
</script>

<style lang="scss">
  .event-end:not(:last-child) {
    border-right-color: var(--bluegray-300) !important;
    border-right-width: 2px !important;
  }
  .product-column:not(.w-auto) {
    width: 200px;
    min-width: 200px !important;
    max-width: 200px !important;
    @media screen { justify-content: flex-start !important; }
  }
  td.product-column {
    @media screen {
      background-color: var(--bluegray-500) !important;
      color: var(--bluegray-50);
    }
    @media print {
      background-color: var(--bluegray-50) !important;
      border-left: 1px solid var(--surface-border) !important;
    }
    font-weight: 600;
  }
  td.reorder-column {
    width: 50px;
    min-width: 50px !important;
    max-width: 50px !important;
    background-color: var(--bluegray-50) !important;
    font-size: .9rem;
    padding: 0 !important;
    .p-datatable-reorderablerow-handle {
      padding: 1rem;
      cursor: move;
    }
  }
  th.day-date {
    font-size: .8rem;
    color: var(--bluegray-700) !important;
    font-weight: 600 !important;
  }
  th.day-date:not(.p-0), th.day-label {
    padding: .7rem !important;
  }
  th.transparent {
    background-color: var(--surface-ground) !important;
    @media print { background-color: var(--surface-0) !important; }
    border-top: none !important;
    border-left: none !important;
  }
  td {
    padding: .7rem !important;

    flex-wrap: wrap;
    &:not(.product-column:not(.w-auto)) {
      flex-basis: 100px !important;
      flex-grow: 1 !important;
    }
    input, select, .p-dropdown, .p-autocomplete-dropdown {
      border-radius: 0 !important;
    }
    .p-autocomplete:not(.p-inputwrapper-focus) .p-autocomplete-input {
      border: none !important;
    }
    input {
      text-align: center;
    }
  }
  .matta-nuu .p-datatable .p-datatable-thead > tr > th {
    padding: 1rem .7rem;
  }
  td, th {
    min-width: 110px !important;
    @media print { min-width: 60px !important; }
    justify-content: center;
    position: relative;

    label {
      width: 100%;
      text-align: center;
      font-weight: 600;
      font-size: .8rem;
      margin-bottom: 5px;
      @media screen { color: var(--indigo-500); }
    }
    .amount {
      font-size: 1.2rem;
    }
  }
  .session-table.p-datatable .p-column-header-content {
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
