<template>
  <Dropdown :options="units" placeholder="Unit" class="w-100" />
</template>

<script>
import Dropdown from 'primevue/dropdown'
import { UNITS } from '@/services/units'

export default {
  components: { Dropdown },
  computed: {
    units() { return UNITS },
  },
}
</script>
