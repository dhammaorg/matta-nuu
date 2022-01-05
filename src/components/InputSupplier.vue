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
  methods: {
    search(event) {
      this.suggestions = this.$root.suppliers.filter((p) => p.toLowerCase().includes(event.query.toLowerCase()))
    },
  },
}
</script>
