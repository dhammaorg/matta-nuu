import { unitFactor, unitParent } from '@/services/units'

export default {
  data() {
    return {
      productsUnits: {},
    }
  },
  computed: {
    session() {
      return this.$root.session
    },
    sessionProducts() {
      const result = new Set()
      this.session.rows.forEach((row) => {
        if (row.type === 'product') {
          result.add(row.product)
        } else if (row.type === 'products') {
          Object.values(row.values).forEach((value) => {
            result.add(value.product)
          })
        } else if (row.type === 'recipie') {
          this.recipieProducts(row.recipie_id).forEach((product) => { result.add(product.name) })
        } else if (row.type === 'recipies') {
          Object.values(row.values).forEach((value) => {
            this.recipieProducts(value.recipie_id).forEach((product) => { result.add(product.name) })
          })
        }
      })
      return Array.from(result).filter((r) => !!r).sort()
    },
    stocks() {
      return this.sessionProducts.map((product) => {
        const values = {}
        let previousStock = 0
        this.stockDays.forEach((day) => {
          let bought = (this.session.buys[product] || {})[day.id] || 0
          const ordered = []
          this.orders.filter((order) => order.delivery_date.getTime() === day.date.getTime()).forEach((order) => {
            if (order.values[product]) {
              const config = this.session.products[product] || {}
              const value = order.values[product].value * unitFactor(order.values[product].unit) * (config.conditioning || 1)
              bought += value
              ordered.push({ value, id: order.id, name: order.name })
            }
          })
          const consumption = this.consumption(product, day)
          const real = (this.session.realStocks[product] || {})[day.id]
          const theoric = previousStock - consumption + bought
          const value = real != null ? real : theoric
          values[day.id] = {
            real, bought, consumption, theoric, value, ordered,
          }
          previousStock = value
        })
        return { product, values }
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
    consumption(product, day) {
      let result = 0
      if (day.initial) return 0
      this.session.rows.forEach((row) => {
        const dayValue = row.values[day.id]
        const dayAmount = dayValue.amount || 0
        const dayProduct = row.product || dayValue.product
        const dayUnit = row.unit || dayValue.unit
        if (dayProduct && dayProduct === product) {
          this.productsUnits[product] = unitParent(dayUnit)
          result += dayAmount * unitFactor(dayUnit)
          return
        }
        const dayRecipie = this.$root.getRecipie(row.recipie_id || dayValue.recipie_id);
        (dayRecipie.products || []).forEach((recipieProduct) => {
          if (recipieProduct.name === product) {
            this.productsUnits[product] = unitParent(recipieProduct.unit)
            result += (dayAmount / dayRecipie.people_count) * recipieProduct.amount * unitFactor(recipieProduct.unit)
          }
        })
      })
      return result
    },
    round(n, decimals = 2) {
      return Number(`${Math.round(`${n}e${decimals}`)}e-${decimals}`)
    },
    recipieProducts(recipieId) {
      return this.$root.getRecipie(recipieId).products || []
    },
  },
}
