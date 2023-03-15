<template>
  <Dropdown :options="units" placeholder="Unit" />
</template>

<script>
import Dropdown from 'primevue/dropdown'
import { UNITS, unitChild, unitParent } from '@/services/units'

export default {
  components: { Dropdown },
  props: ['onlySiblings'],
  computed: {
    units() {
      const val = this.$attrs.modelValue
      if (val && this.onlySiblings) return [...new Set([val, unitChild(val), unitParent(val)])]
      return Object.keys(UNITS)
    },
  },
}
</script>

<style lang="scss" scoped>
  .p-dropdown {
    width: 100%;
  }
</style>
