<template>
  <SessionMenu :session="session" :saving="saving" :history="history" @save="save" @undo="undo" />

  <div style="height: calc(100vh - 9rem)" v-if="session.events.length > 0">
    <router-view :all-days="allDays"></router-view>
  </div>

</template>

<script>
import SessionMenu from './SessionMenu.vue'
import store from './SessionStore'

export default {
  components: { SessionMenu },
  data() {
    return {
      saving: false,
      history: [],
      session: store.session,
    }
  },
  computed: {
    allDays() {
      const days = []
      this.session.events.forEach((event) => {
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
    const { data } = await this.$db.from('sessions').select().match({ id: this.$route.params.id }).single()
    data.events ||= []
    data.events.forEach((e) => { e.start_date = new Date(e.start_date) })
    data.rows ||= []
    this.session.rows = data.rows
    this.session.events = data.events
    this.session.name = data.name
    this.session.id = data.id
    this.initDaysValuesForEachRow()
  },
  watch: {
    session: {
      deep: true,
      handler() {
        const sessionJson = JSON.stringify(this.session)
        // Check for fake change
        if (sessionJson !== JSON.stringify(this.history[this.history.length - 1])) {
          // Parse + stringify makes object deep copy
          const newValue = JSON.parse(sessionJson)
          this.history.push(newValue)
        }
      },
    },
    allDays: {
      deep: true,
      handler() { this.initDaysValuesForEachRow() },
    },
  },
  methods: {
    async save() {
      this.saving = true
      const { error } = await this.$db.from('sessions')
        .update(this.session)
        .match({ id: this.$route.params.id })

      if (error) this.toastError(error)
      this.saving = false
    },
    undo() {
      // poping twice the history, cause last history value is the same as current value
      let lastSession = this.history.pop()
      lastSession = this.history.pop()
      lastSession.events.forEach((e) => { e.start_date = new Date(e.start_date) })
      this.session = lastSession
    },
    initDaysValuesForEachRow() {
      this.allDays.forEach((day) => {
        this.session.rows.forEach((row) => {
          if (!row.values[day.id]) row.values[day.id] = {}
        })
      })
    },
  },
}
</script>
