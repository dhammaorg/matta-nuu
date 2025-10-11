<template>
  <div class="menu-container">
    <div class="menu-content">
      <template v-for="event in events" :key="event">
        <!-- In case some recipie from first day need to be prepare the day before, we add a fake index -1 -->
        <MenuDay day="Before" :dayIndex="-1" :event="event" :numbers="numbers" :leftoversTitle="leftoversTitle" />
        <MenuDay v-for="(day, dayIndex) in event.days" :key="day.id" :day="day" :dayIndex="dayIndex" :event="event"
          :numbers="numbers" :leftoversTitle="leftoversTitle" />
      </template>
    </div>
  </div>
</template>

<script>
import MenuDay from './SessionScheduleMenuDay.vue'

export default {
  props: ['events', 'numbers', 'leftoversTitle'],
  components: { MenuDay }
}
</script>

<style lang="scss">
.menu-container {
  background-color: white;
  font-weight: normal;
  overflow: auto;
  margin: 0 auto;
  width: 100%;
  max-width: 210mm;

  @media print {
    max-width: 100%;
    overflow: visible;
  }
}
</style>
