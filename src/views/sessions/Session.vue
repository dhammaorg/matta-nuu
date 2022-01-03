<template>
  <SessionMenu />

  <div style="height: calc(100vh - 9rem)" v-if="session.fullyLoaded">
    <router-view :all-days="allDays"></router-view>
  </div>

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
          days.push({
            id: date.toDateString(), label: day, event, date, class: classes.join(' '),
          })
        })
      })
      return days
    },
  },
  async mounted() {
    if (this.session.fullyLoaded) return // if already loaded do nothing

    const { data } = await this.$db.from('sessions').select().match({ id: this.$route.params.id }).single()
    data.events ||= []
    data.events.forEach((e) => { e.start_date = new Date(e.start_date) })
    data.rows ||= []
    data.fullyLoaded = true
    this.$root.session = data
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
}
</script>
