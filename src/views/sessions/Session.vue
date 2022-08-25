<template>
  <SessionMenu ref="menu" />

  <img class="page-background" src="@/assets/undraw_cart.svg" v-if="$route.name == 'session_orders'" />

  <HelpMessage v-if="$route.name == 'session_orders'">
    <strong>Orders</strong> let you easily get the list of products you need to order
  </HelpMessage>

  <div :class="contentFullPage ? 'page-full-content' : 'page-content'">
    <div :style="contentFullPage ? '' : ''" v-if="$root.isSessionFullyLoaded()">
      <router-view></router-view>
    </div>
  </div>

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
          const classes = [`event-${event.id}`]
          if (index === 0) classes.push('event-start')
          if (index === (event.days.length - 1)) classes.push('event-end')
          const date = event.start_date.addDays(index)
          if (date.isToday()) classes.push('today')
          const dateHeader = date.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' })
          days.push({
            id: `Event${event.id}_${index}`, label: day, event, index, date, class: classes.join(' '), dateHeader,
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
      const dateHeader = date.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' })
      days.unshift({
        id: 'initial', class: 'event-start event-end', label: 'Initial Stocks', date, initial: true, dateHeader,
      })
      return days
    },
    contentFullPage() {
      return this.$route.name !== 'session_orders'
    },
  },
  async created() {
    await this.$root.fetchSession()
    this.initDaysValuesForEachRow()
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
      handler(newVal, oldVal) {
        const newIds = newVal.map((d) => d.id)
        const removedDays = oldVal.filter((x) => !newIds.includes(x.id))
        this.session.rows.forEach((row) => {
          removedDays.forEach((dayToRemove) => { delete row.values[dayToRemove.id] })
        })
        this.initDaysValuesForEachRow()
      },
    },
  },
  beforeRouteLeave(to, from, next) {
    if (this.$refs.menu.unsavedChangesWarning) {
      this.$confirm.require({
        message: 'You have unsaved changes !',
        acceptLabel: 'Quit without saving',
        rejectLabel: 'Cancel',
        header: 'Warning',
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
    @media print {
      text-align: center !important;
      width: 160px;
      min-width: 160px !important;
      max-width: 160px !important;
    }
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
    &.today {
      background-color: var(--orange-500) !important;
      color: white !important;
      font-weight: bold !important;
    }
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
