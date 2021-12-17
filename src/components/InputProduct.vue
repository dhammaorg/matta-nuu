<template>
  <AutoComplete v-bind="$attrs" placeholder="Product"
                :suggestions="suggestions" :dropdown="true"
                @complete="searchProduct($event)"/>
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
    allProducts() {
      return this.$root.products
    },
  },
  methods: {
    searchProduct(event) {
      this.suggestions = this.allProducts.filter((p) => p.toLowerCase().includes(event.query.toLowerCase()))
    },
  },
}
</script>
