<template>
  <div class="day">
    {{ event.name }} {{ day }}
  </div>
</template>

<script>
export default {
  props: ['event', 'day'],
}
</script>
