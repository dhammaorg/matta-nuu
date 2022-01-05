<template>
  <AutoComplete v-bind="$attrs"
                :suggestions="suggestions" :dropdown="true"
                @complete="search($event)"/>
</template>

<script>
import AutoComplete from 'primevue/autocomplete'

export default {
  components: { AutoComplete },
  data() {
    return {
      suggestions: [],
    }
  },
  computed: {
    allSuppliers() {
      console.log('compute suppliers')
      const result = Object.values(this.$root.session.products).map((p) => p.supplier).filter((p) => !!p)
      return [...new Set(result)] // uniqueness
    },
  },
  methods: {
    search(event) {
      this.suggestions = this.allSuppliers.filter((p) => p.toLowerCase().includes(event.query.toLowerCase()))
    },
  },
}
</script>
