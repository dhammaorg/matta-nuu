<template>
  <Dropdown :options="daysOptions" optionLabel="fullLabel" optionValue="date" v-bind="$attrs" />
</template>

<script>
export default {
  props: ['days'],
  computed: {
    daysOptions() {
      return this.days.map((day) => {
        day.fullLabel = day.dateHeader
        day.fullLabel += this.$root.session.events.length > 1 && day.event ? ` - ${day.event.name}` : ''
        day.fullLabel += ` - ${day.label}`
        return day
      })
    },
  },
}
</script>
