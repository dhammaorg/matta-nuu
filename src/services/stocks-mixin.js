export default {
  computed: {
    session() {
      return this.$root.session
    },
    sessionProducts() {
      const result = new Set()
      this.session.rows.forEach((row) => {
        if (row.type === 'product') {
          result.add(row.product_id)
        } else if (row.type === 'products') {
          Object.values(row.values).forEach((value) => {
            result.add(value.product_id)
          })
        } else if (row.type === 'recipie') {
          this.recipieProducts(row.recipie_id).forEach((product) => { result.add(product.id) })
        } else if (row.type === 'recipies') {
          Object.values(row.values).forEach((value) => {
            this.recipieProducts(value.recipie_id).forEach((product) => { result.add(product.id) })
          })
        }
      })
      return Array.from(result).filter((r) => !!r).sort()
    },
    stocks() {
      return this.sessionProducts.map((productId) => {
        const values = {}
        let previousStock = 0
        this.stockDays.forEach((day) => {
          let bought = (this.session.buys[productId] || {})[day.id] || 0
          const ordered = []
          this.orders.filter((order) => order.delivery_day === day.id).forEach((order) => {
            if (order.values[productId]) {
              const { value } = order.values[productId]
              bought += value
              ordered.push({ value, id: order.id, name: order.name })
            }
          })
          const consumption = this.consumption(productId, day)
          const real = (this.session.realStocks[productId] || {})[day.id]
          const theoric = previousStock - consumption + bought
          const value = real != null ? real : theoric
          values[day.id] = {
            real, bought, consumption, theoric, value, ordered,
          }
          previousStock = value
        })
        return { product_id: productId, values }
      })
    },
    orders() {
      return Object.values(this.$root.orders)
        .filter((order) => order.report_values_in_stocks
          && order.values
          && order.id != this.$route.params.order_id /* We exclude current edited order so we can recalculate */)
    },
  },
  methods: {
    consumption(productId, day) {
      let result = 0
      if (day.initial) return 0
      this.session.rows.forEach((row) => {
        const dayValue = row.values[day.id]
        const dayAmount = dayValue.amount || 0
        const dayProduct = row.product_id || dayValue.product_id
        if (dayProduct && dayProduct === productId) {
          result += dayAmount
          return
        }
        const dayRecipie = this.$root.getRecipie(row.recipie_id || dayValue.recipie_id);
        (dayRecipie.products || []).forEach((recipieProduct) => {
          if (recipieProduct.id === productId) {
            result += (dayAmount / dayRecipie.people_count) * recipieProduct.amount
          }
        })
      })
      return result
    },
    recipieProducts(recipieId) {
      return this.$root.getRecipie(recipieId).products || []
    },
  },
}
