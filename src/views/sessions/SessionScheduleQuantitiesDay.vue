<template>
  <div class="day-quantities" v-if="recipies.length > 0">

    <div
         class="p-datatable p-component p-datatable-responsive-stack p-datatable-gridlines p-datatable-sm">
      <div class="p-datatable-wrapper">
        <table class="p-datatable-table">
          <thead class="p-datatable-thead" role="rowgroup">
            <tr class="day-title">
              <td :colspan="numbers.length + 2">
                {{ event.name }}<span v-if="day"> - {{ day }}</span>
              </td>
            </tr>
            <tr>
              <th class="first-column">People Count</th>
              <th v-for="number in numbers" :key="`column-${number}`">
                <div class="p-column-header-content">{{ number }}</div>
              </th>
              <th>
                <div class="p-column-header-content">Unit</div>
              </th>
            </tr>
          </thead>
          <tbody class="p-datatable-tbody" v-for="recipie in recipies"
                 :key="`recipie-${recipie.id}`">
            <tr class="p-rowgroup-header">
              <td :colspan="numbers.length + 2">
                <h3 class="recipie-name">
                  {{ recipie.name }}
                  <span class="fw-normal" v-if="recipie.prepare_day_before"> ({{ event.days[dayIndex
                    +
                    1] }})</span>
                  <span class="p-chip fw-normal ms-2" v-if="recipie.row.label">{{
                    recipie.row.label }}</span>
                </h3>
              </td>
            </tr>
            <tr v-for="product in recipie.products" :key="product.id">
              <td class="first-column">{{ product.name }}</td>
              <td v-for="number in numbers" :key="`cell-${recipie.id}-${product.id}-${number}`">
                {{ product.values[number].round(3) }}
              </td>
              <td>
                <span style="font-weight: 500">{{ product.unit }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script>
import { unitChild, unitParent } from '@/services/units'

export default {
  props: ['event', 'day', 'dayIndex', 'numbers'],
  computed: {
    recipies() {
      const result = []
      // Recipie to be prepare for this day (not need for dayIndex == -1)
      if (this.dayIndex >= 0) {
        this.$root.session.rows.forEach((row) => {
          if (row.printable === false) return
          const dayValue = row.values[`Event${this.event.id}_${this.dayIndex}`] || {}
          const dayRecipie = this.$root.getRecipie(row.recipie_id || dayValue.recipie_id)
          if (dayRecipie.id && dayValue.amount && !dayRecipie.prepare_day_before) {
            result.push({ ...dayRecipie, ...{ row } })
          }
        })
      }

      // Add recipie to be prepare for the next day
      this.$root.session.rows.forEach((row) => {
        if (row.printable === false) return
        const dayAfterValue = row.values[`Event${this.event.id}_${this.dayIndex + 1}`] || {}
        const dayAfterRecipie = this.$root.getRecipie(row.recipie_id || dayAfterValue.recipie_id)
        if (dayAfterRecipie.id && dayAfterValue.amount && dayAfterRecipie.prepare_day_before) {
          result.push({ ...dayAfterRecipie, ...{ row } })
        }
      })

      result.forEach((recipie) => {
        recipie.products = recipie.products.map((p) => {
          const product = { ...p, ...this.$root.getProduct(p.id) }
          product.values = {}
          // Pre calculate values for each number
          this.numbers.forEach((number) => {
            product.values[number] = number * (product.amount / recipie.people_count)
          })

          // Adjust the values by changing the unit if all values are small or big
          const smallValuesCount = Object.values(product.values).filter((v) => v < 1).length
          const bigValuesCount = Object.values(product.values).filter((v) => v > 1000).length
          const threshold = this.numbers.length / 2
          if (['kg', 'L'].includes(product.unit) && smallValuesCount > threshold) {
            product.unit = unitChild(product.unit)
            this.numbers.forEach((number) => { product.values[number] *= 1000 })
          } else if (['g', 'mL'].includes(product.unit) && bigValuesCount > threshold) {
            product.unit = unitParent(product.unit)
            this.numbers.forEach((number) => { product.values[number] /= 1000 })
          }
          return product
        })
        return recipie
      })
      return result
    },
  },
}
</script>

<style lang="scss">
.day-quantities {
  page-break-inside: avoid;

  table {
    page-break-inside: avoid;

    thead {
      // Display thead on each page even if there is a line break
      display: table-header-group;
    }

    tbody {
      page-break-inside: avoid;
    }

    .day-title td {
      text-align: center;
      font-size: 2rem;
      font-weight: bold;
      color: black;
      background-color: var(--surface-0) !important;
      padding-bottom: 1rem !important;
    }

    td,
    tr {
      $width: 3rem;
      min-width: $width !important;
      max-width: $width !important;
      width: $width !important;

      &.first-column {
        $width: 150px;
        min-width: $width !important;
        max-width: $width !important;
        width: $width !important;
      }
    }
  }

  padding-top: 2rem;

  &:first-child {
    padding-top: 0;
  }

  td {
    padding: 0.35rem 0.5rem !important;
  }

  th,
  td {
    min-width: 0 !important;
  }

  tr>td:nth-child(even),
  .p-datatable .p-datatable-thead>tr>th:nth-child(even) {
    background-color: var(--bluegray-50);

    @media print {
      background-color: #E7E7E7;
    }
  }

  tr>th:nth-child(odd):not(:last-child) {
    background-color: var(--surface-0) !important;
  }

  td:not(:first-child) {
    text-align: center !important;
  }

  td:last-child,
  th:last-child {
    background-color: var(--bluegray-100) !important;

    @media print {
      background-color: var(--gray-400) !important;
    }
  }

  th:not(:first-child) .p-column-header-content {
    justify-content: center;
  }

  .recipie-name {
    margin-bottom: 0;
    font-size: 1rem;
    margin: .5rem 0 .25rem 0;

    @media print {
      color: black !important;
    }
  }

  .p-rowgroup-header>td {
    border: none !important;
    background-color: var(--surface-0) !important;

    .p-chip {
      font-size: .9rem;
    }
  }
}
</style>
