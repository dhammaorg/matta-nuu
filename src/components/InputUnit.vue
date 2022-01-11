<template>
  <Dropdown :options="units" placeholder="Unit" />
</template>

<script>
import Dropdown from 'primevue/dropdown'
import { UNITS } from '@/services/units'

export default {
  components: { Dropdown },
  computed: {
    units() { return Object.keys(UNITS) },
  },
}
</script>

<style lang="scss" scoped>
  .p-dropdown {
    width: 100%;
  }
</style>
