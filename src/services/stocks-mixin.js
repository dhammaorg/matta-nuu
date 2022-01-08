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
    stocks() {
      return this.$root.products.map((product) => {
        const values = {}
        let previousStock = 0
        this.stockDays.forEach((day) => {
          let bought = (this.session.buys[product] || {})[day.id] || 0
          this.orders.filter((order) => order.delivery_date.getTime() === day.date.getTime()).forEach((order) => {
            if (order.values[product]) bought += order.values[product].value
          })
          const consumption = this.consumption(product, day)
          const real = (this.session.realStocks[product] || {})[day.id]
          const theoric = previousStock - consumption + bought
          const value = real != null ? real : theoric
          values[day.id] = {
            real, bought, consumption, theoric, value,
          }
          previousStock = value
        })
        return { product, values }
      })
    },
    orders() {
      return Object.values(this.$root.orders).filter((order) => order.report_values_in_stocks && order.values)
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
        const dayRecipie = row.recipie || dayValue.recipie
        if (!dayRecipie) return
        dayRecipie.products.forEach((recipieProduct) => {
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
  },
}
