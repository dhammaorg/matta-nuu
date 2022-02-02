<template>
  <div class="quantities-container">
    <div class="quantities-content">
      <template v-for="event in events">
        <QuantitiesDay v-for="(day, dayIndex) in event.days" :key="day.id"
                      :day="day" :dayIndex="dayIndex" :event="event"
                      :numbers="[10,20,40,60,80,100,120,140,150,160,180,200]"  />
      </template>
    </div>
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
  .quantities-container {
    background-color: white;
    font-weight: normal;
    overflow: auto;
    padding: 0 2rem;
  }
  @media print {
    .quantities-container { padding: 0; }
  }
</style>
