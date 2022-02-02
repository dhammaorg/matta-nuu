<template>
  <div class="quantities-print">
    TODO quantities table day by day
    <template v-for="event in events">
      <QuantitiesDay v-for="day in event.days" :day="day" :event="event" :key="day.id" />
    </template>
  </div>
</template>

<script>
import QuantitiesDay from './SessionScheduleQuantitiesDay.vue'

export default {
  props: ['events'],
  components: { QuantitiesDay },
}
</script>

<style lang='scss'>
  .quantities-print {
    position: fixed;
    left: 0; right: 0; top: 0; bottom: 0;
    background: white;
    z-index: 500;
    font-weight: normal;
  }
</style>
