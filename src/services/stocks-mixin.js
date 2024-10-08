import { convertToUnit } from '@/services/units'
import supabase from '@/services/supabase'
import { debounce } from '@/services/debounce'

export default {
  inject: ['sessionDays', 'stockDays', 'sessionInventories'],
  data() {
    return {
      stocks: [],
      sessionProducts: [],
    }
  },
  mounted() {
    this.reCalculateAll()

    const onNewDataRetrieved = debounce(() => {
      this.reCalculateAll()
    }, 300)
    // we listen for current session change so we recalculate stock if needed
    supabase.channel(`session-changes-${this.session.id}`).on('postgres_changes', {
      event: '*', schema: '*', table: 'sessions', filter: `id=eq.${this.session.id}`,
    }, onNewDataRetrieved).subscribe()
    supabase.channel(`session-orders-${this.session.id}`).on('postgres_changes', {
      event: '*', schema: '*', table: 'orders', filter: `session_id=eq.${this.session.id}`,
    }, onNewDataRetrieved).subscribe()
    supabase.channel(`session-inventories-${this.session.id}`).on('postgres_changes', {
      event: '*', schema: '*', table: 'inventories', filter: `session_id=eq.${this.session.id}`,
    }, onNewDataRetrieved).subscribe()
    supabase.channel(`products-callback-${this.$root.user.id}`).on('postgres_changes', {
      event: '*', schema: '*', table: 'products', filter: `user_id=eq.${this.$root.user.id}`,
    }, onNewDataRetrieved).subscribe()
    supabase.channel(`recipies-callback-${this.$root.user.id}`).on('postgres_changes', {
      event: '*', schema: '*', table: 'recipies', filter: `user_id=eq.${this.$root.user.id}`,
    }, onNewDataRetrieved).subscribe()
  },
  computed: {
    session() {
      return this.$root.session
    },
    orders() {
      /* We exclude current edited order */
      const orderIdToIgnore = this.order && this.order.id ? this.order.id : this.$route.params.order_id
      return Object.values(this.$root.orders)
        .filter((order) => order.report_values_in_stocks
          && order.values
          && order.session_id === this.session.id
          && order.id != orderIdToIgnore)
    },
    missingProductsPerDay() {
      const missingProducts = {}
      this.stocks.forEach((productStock) => {
        Object.entries(productStock.values).forEach(([dayId, dayStock]) => {
          if (dayStock.value < 0) {
            missingProducts[dayId] ||= []
            missingProducts[dayId].push(productStock)
          }
        })
      })
      return missingProducts
    },
  },
  methods: {
    reCalculateAll() {
      this.stocks = []
      this.sessionProducts = []
      this.calculateSessionProducts()
      this.calculateAllStocks()
    },
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
      const result = this.calculateStockFor(productId, fromDayId)
      this.stocks.splice(index, 1, result)
      return result
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
          // Bought / Ordered
          const manuallyBought = (this.session.buys[productId] || {})[day.id]
          let bought = manuallyBought || 0
          const ordered = []
          const boughtLabels = []
          if (manuallyBought) boughtLabels.push(`+${manuallyBought} ${product.unit} FromManualStock bought`)
          this.orders.filter((order) => order.delivery_day === day.id).forEach((order) => {
            if (order.values[productId] && order.values[productId].value) {
              // in the order, 2500g is converted to 2.5kg, so need to convert it back here
              const value = convertToUnit(order.values[productId].value, order.values[productId].unit, product)
              bought += value
              ordered.push({ value, id: order.id, name: order.name })
              boughtLabels.push(`+${value} ${product.unit} from ${order.name}`)
            }
          })

          // Consumption is always the same, so reusing previously calculated value if exists
          let { consumption } = values[day.id] || {}
          let { consumptionLabels } = values[day.id] || {}
          if (consumption === undefined) {
            ({ consumption, consumptionLabels } = this.consumption(productId, day))
          }

          // Real stocks / Inventories
          const realFromManualStock = (this.session.realStocks[productId] || {})[day.id]
          const realFromInventories = []
          const inventories = this.sessionInventories.filter((inv) => inv.day === day.id)
          inventories.forEach((inventory) => {
            let productVal
            const areas = []
            Object.entries(inventory.values[productId] || {}).forEach(([areaId, areaVal]) => {
              if (areaVal.value !== undefined && areaVal.value !== null) {
                const value = convertToUnit(areaVal.value, areaVal.unit, product)
                productVal ||= 0
                productVal += value
                const area = this.$root.getCategory(areaId)
                areas.push(area.name || 'Other')
              }
            })
            let title = 'Stock from inventory'
            if (areas.length > 0) title += ` (${areas.join(', ')})`
            if (productVal !== undefined) realFromInventories.push({ value: productVal, title, id: inventory.id })
          })
          let real = realFromManualStock
          if (realFromInventories.length > 0) {
            real = realFromInventories.reduce((acc, obj) => acc + obj.value, 0)
          }

          let theoric = previousStock
          // a negative previousStock is just theorical, as soon as we buy something, we consider
          // this previous negative stock to be equal to 0
          if (bought > 0) theoric = Math.max(theoric, 0)
          theoric = theoric - consumption + bought

          let value = 0
          // for initial stock, even if we supply a realStock we still want to take into account
          // the bought value
          if (day.id === 'initial') value = (real || 0) + bought
          else value = (real != null) ? real : theoric

          // stockDiff - the real stock is quite different from theoretical stock.
          // we use the total previous consumption since last inventory to determine the thresold
          let stockDiff = 0
          if (day.id !== 'initial' && real != null) {
            let totalConsFromLastInventory = 0
            let inThePast = true
            Object.entries(values).forEach(([iteratorDayId, iteratorValue]) => {
              if (inThePast) {
                if (iteratorValue.consumption) totalConsFromLastInventory += iteratorValue.consumption
                inThePast = iteratorDayId !== day.id
                if (iteratorValue.real != null && inThePast) totalConsFromLastInventory = 0
              }
            })
            // + 0.0000001 is to avoid division by 0
            if (totalConsFromLastInventory === 0) stockDiff = Math.abs(real - theoric) / (Math.max(real, theoric) + 0.0000001)
            else stockDiff = Math.abs(real - theoric) / totalConsFromLastInventory
          }
          // 5 3  5-3/5

          values[day.id] = {
            real,
            realFromManualStock,
            realFromInventories,
            bought,
            boughtLabels,
            manuallyBought,
            ordered,
            consumption,
            consumptionLabels,
            theoric,
            value,
            stockDiff,
          }

          previousStock = value
        } else {
          previousStock = values[day.id].value
        }
      })

      // missingDay - the day from which the product is missing. If today real date is inside the session,
      // we consider only days in the future
      let missingDay = false
      const today = new Date()
      const todayInSession = this.stockDays[0].date <= today && this.stockDays.last().date >= today
      Object.entries(values).forEach(([dayId, stock], index) => {
        const day = this.stockDays.find((d) => d.id == dayId)
        if (stock.value < 0 && !missingDay && (!todayInSession || day.date.isTodayOrAfter())) {
          missingDay = index
        }
      })

      return {
        product_id: productId,
        product_name: product.name,
        product_unit: product.unit,
        category: this.$root.getCategory(product.category_id),
        supplier: this.$root.getSupplier(product.supplier_id),
        missingDay,
        values,
      }
    },
    consumption(productId, day) {
      let result = 0
      const labels = []
      if (day.initial) return 0
      this.session.rows.forEach((row) => {
        const dayValue = row.values[day.id]
        const dayAmount = dayValue.amount || 0

        if (['product', 'products'].includes(row.type)) {
          const dayProductId = row.type === 'product' ? row.product_id : dayValue.product_id
          if (dayProductId && dayProductId === productId) {
            result += dayAmount
            if (row.type == 'products') labels.push(`-${dayAmount} by ${row.label}`)
            else labels.push(`-${dayAmount} by daily consumption`)
            return
          }
        }

        if (['recipie', 'recipies'].includes(row.type)) {
          const dayRecipieId = row.type === 'recipie' ? row.recipie_id : dayValue.recipie_id
          const dayRecipie = this.$root.getRecipie(dayRecipieId)
          if (row.type.includes('recipie') && dayRecipie.id && (!dayRecipie.prepare_day_before || day.index === 0)) {
            (dayRecipie.products || []).forEach((recipieProduct) => {
              if (recipieProduct.id === productId) {
                const value = (dayAmount / dayRecipie.people_count) * recipieProduct.amount
                labels.push(`-${value.round()} by ${dayRecipie.name}`)
                result += value
              }
            })
          }

          // Check recipie planned for next day that need to be prepared on the day before
          const dayAfterValue = row.values[`Event${day.event.id}_${day.index + 1}`] || {}
          const dayAfterRecipieId = row.type == 'recipie' ? row.recipie_id : dayAfterValue.recipie_id
          const dayAfterRecipie = this.$root.getRecipie(dayAfterRecipieId)
          if (row.type.includes('recipie') && dayAfterRecipie && dayAfterRecipie.prepare_day_before && dayAfterValue.amount) {
            (dayAfterRecipie.products || []).forEach((recipieProduct) => {
              if (recipieProduct.id === productId) {
                const value = (dayAfterValue.amount / dayAfterRecipie.people_count) * recipieProduct.amount
                labels.push(`-${value.round()} by ${dayAfterRecipie.name}`)
                result += value
              }
            })
          }
        }
      })
      return { consumption: result, consumptionLabels: labels }
    },
    recipieProducts(recipieId) {
      return this.$root.getRecipie(recipieId).products || []
    },
    theoricStockFor(productId, day) {
      if (!this.stocks || !day) return null
      const { values } = this.stocks.find((s) => s.product_id == productId) || {}
      return values && values[day] ? values[day].theoric.round() : 0
    },
  },
}
