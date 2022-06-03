export default {
  data() {
    return {
      stocks: [],
      sessionProducts: [],
    }
  },
  mounted() {
    this.calculateSessionProducts()
    this.calculateAllStocks()
  },
  computed: {
    session() {
      return this.$root.session
    },
    orders() {
      return Object.values(this.$root.orders)
        .filter((order) => order.report_values_in_stocks
          && order.values
          && order.session_id === this.session.id
          && this.order && order.id != this.order.id /* We exclude current edited order so we can recalculate */)
    },
  },
  methods: {
    calculateSessionProducts() {
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
      this.sessionProducts = Array.from(result).filter((r) => !!r).sort()
    },
    calculateAllStocks() {
      this.sessionProducts.forEach((productId) => {
        this.stocks.push(this.calculateStockFor(productId))
      })
    },
    reCalculateStockFor(productId, fromDayId) {
      const index = this.stocks.findIndex((s) => s.product_id === productId)
      this.stocks.splice(index, 1, this.calculateStockFor(productId, fromDayId))
    },
    calculateStockFor(productId, fromDayId) {
      let previousStock = 0
      let doCalculation = fromDayId === undefined
      const row = this.stocks.find((s) => s.product_id === productId) || {}
      const values = row.values || {}
      const product = this.$root.getProduct(productId)

      this.stockDays.forEach((day) => {
        // Prevent recalculating from the beginning when a change occurs not at the beggining
        if (!doCalculation && day.id === fromDayId) doCalculation = true

        if (doCalculation || !values[day.id]) {
          const manuallyBought = (this.session.buys[productId] || {})[day.id]
          let bought = manuallyBought || 0
          const ordered = []
          this.orders.filter((order) => order.delivery_day === day.id).forEach((order) => {
            if (order.values[productId] && order.values[productId].value) {
              const { value } = order.values[productId]
              bought += value
              ordered.push({ value, id: order.id, name: order.name })
            }
          })
          // consumùption is always the same, so reusing previously calculated value if exists
          const consumption = (values[day.id] || {}).consumption || this.consumption(productId, day)
          const real = (this.session.realStocks[productId] || {})[day.id]
          const theoric = previousStock - consumption + bought
          let value = 0
          // for initial stock, even if we supply a realStock we still want to take into account
          // the bought value
          if (day.id === 'initial') value = (real || 0) + bought
          else value = real != null ? real : theoric
          values[day.id] = {
            real, manuallyBought, bought, consumption, theoric, value, ordered,
          }
          previousStock = value
        } else {
          previousStock = values[day.id].value
        }
      })

      return {
        product_id: productId, product_name: product.name, product_unit: product.unit, category: this.$root.getCategory(product.category_id), values,
      }
    },
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
        const dayRecipie = this.$root.getRecipie(row.recipie_id || dayValue.recipie_id)
        if (dayRecipie.id && (!dayRecipie.prepare_day_before || day.index === 0)) {
          (dayRecipie.products || []).forEach((recipieProduct) => {
            if (recipieProduct.id === productId) {
              result += (dayAmount / dayRecipie.people_count) * recipieProduct.amount
            }
          })
        }

        // Check recipie planned for next day that need to be prepared on the day before
        const dayAfterValue = row.values[`Event${day.event.id}_${day.index + 1}`] || {}
        const dayAfterRecipie = this.$root.getRecipie(row.recipie_id || dayAfterValue.recipie_id)
        if (dayAfterRecipie && dayAfterRecipie.prepare_day_before && dayAfterValue.amount) {
          (dayAfterRecipie.products || []).forEach((recipieProduct) => {
            if (recipieProduct.id === productId) {
              result += (dayAfterValue.amount / dayAfterRecipie.people_count) * recipieProduct.amount
            }
          })
        }
      })
      return result
    },
    recipieProducts(recipieId) {
      return this.$root.getRecipie(recipieId).products || []
    },
  },
}
