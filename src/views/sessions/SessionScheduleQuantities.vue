<template>
  <div class="quantities-container">
    <div class="quantities-content">

      <template v-for="event in events" :key="event">
        <!-- In case some recipie from first day need to be prepare the day before, we add a fake index -1 -->
        <QuantitiesDay day="Before" :dayIndex="-1" :event="event" :numbers="numbers"  />
        <QuantitiesDay v-for="(day, dayIndex) in event.days" :key="day.id"
                      :day="day" :dayIndex="dayIndex" :event="event"
                      :numbers="numbers"  />
      </template>
    </div>
  </div>
</template>

<script>
import QuantitiesDay from './SessionScheduleQuantitiesDay.vue'

export default {
  props: ['events', 'numbers'],
  components: { QuantitiesDay },
}
</script>

<style lang='scss'>
  .quantities-container {
    background-color: white;
    font-weight: normal;
    overflow: auto;
    padding: 0 2rem;
  }
  @media print {
    .quantities-container {
      padding: 0;
      overflow: visible;
    }
  }
</style>
