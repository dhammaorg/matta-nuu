<template>
  <SessionMenu ref="menu"/>

  <div style="height: calc(100vh - 7.5rem)" v-if="$root.isSessionFullyLoaded">
    <router-view :all-days="allDays"></router-view>
  </div>

  <ConfirmDialog></ConfirmDialog>

</template>

<script>
import SessionMenu from './SessionMenu.vue'

export default {
  components: { SessionMenu },
  computed: {
    session() {
      return this.$root.session
    },
    allDays() {
      const days = []
      this.session.events.forEach((event) => {
        event.days.forEach((day, index) => {
          const classes = []
          if (index === 0) classes.push('event-start')
          if (index === (event.days.length - 1)) classes.push('event-end')
          const date = event.start_date.addDays(index)
          const dateHeader = date.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' })
          days.push({
            id: date.toDateString(), label: day, event, date, class: classes.join(' '), dateHeader,
          })
        })
      })
      return days
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
  },
  methods: {
    initDaysValuesForEachRow() {
      this.allDays.forEach((day) => {
        this.session.rows.forEach((row) => {
          if (!row.values[day.id]) row.values[day.id] = {}
        })
      })
    },
  },
  watch: {
    allDays: {
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
    border-right-color: var(--text-color-secondary) !important;
  }
  .first-column {
    width: 200px;
    min-width: 200px !important;
    max-width: 200px !important;
    justify-content: flex-start !important;
  }
  td.first-column {
    background-color: var(--text-color-secondary) !important;
    color: white;
    font-weight: bold;
  }
  td.reorder-column {
    width: 50px;
    min-width: 50px !important;
    max-width: 50px !important;
    padding: 0 !important;
    .p-datatable-reorderablerow-handle {
      padding: 1rem;
      cursor: move;
    }
  }
  th.top-left-cell {
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
    min-width: 130px !important;
    justify-content: center;
    position: relative;

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

    .btn-on-hover { display: none; }
    &:hover .btn-on-hover {
      display: block;
      position: absolute;
      right: 0;
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
