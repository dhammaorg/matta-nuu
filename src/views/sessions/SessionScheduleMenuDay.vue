<template>
  <div class="day-menu" v-if="recipies.length > 0">
    <div class="day-title">
      <h1 class="text-center">
        {{ event.name }}<span v-if="day"> - {{ day }}</span>
      </h1>

      <h3 v-for="recipie in recipies" :key="`recipie-${recipie.id}`" class="text-center my-2">
        {{ recipie.name }} <span v-if="recipie.forDayAfter"> ({{ event.days[dayIndex + 1] }})</span>
      </h3>
      <div class="timeline mt-5 pt-4">
        <div v-for="step in timeline" :key="step" class="d-flex align-items-baseline gap-3">
          <label style="font-family: ui-monospace">{{ step.time }}</label>
          <div class="step-text" v-html="step.text"></div>
        </div>
      </div>
      <div class="leftovers my-5" v-if="leftovers.length > 0">
        <h2 class="text-center">{{ leftoversTitle ? leftoversTitle : 'Leftovers' }}</h2>
        <div v-for="recipie in leftovers" :key="`recipie-${recipie.id}`" class="d-flex align-items-baseline gap-3">
          <label>{{ recipie.name }}</label>
          <div class="leftovers-instructions" v-html="recipie.leftovers_instructions"></div>
        </div>
      </div>
    </div>

    <!-- don't show if all instructions are on the day before -->
    <template v-for="recipie in recipies" :key="`recipie-${recipie.id}`">
      <div v-if="!(recipie.prepare_day_before && !recipie.forDayAfter && !recipie.instructions)"
        class="recipie-section">
        <div class="recipie-header">
          <h2 class="recipie-name">
            {{ recipie.name }}
            <span class="fw-normal" v-if="recipie.forDayAfter">
              ({{ event.days[dayIndex + 1] }})</span>
            <span class="p-chip fw-normal ms-2" v-if="recipie.row.label">{{ recipie.row.label }}</span>
          </h2>
        </div>

        <!-- Quantities Table -->
        <div class="p-datatable p-component p-datatable-responsive-stack p-datatable-gridlines p-datatable-sm">
          <div class="p-datatable-wrapper">
            <table class="p-datatable-table quantities-table">
              <thead class="p-datatable-thead" role="rowgroup">
                <tr>
                  <th class="ingredient-column">
                    <div class="p-column-header-content">Ingredients</div>
                  </th>
                  <th v-for="number in numbers" :key="`column-${number}`">
                    <div class="p-column-header-content">{{ number }}</div>
                  </th>
                  <th class="unit-column">
                    <div class="p-column-header-content">Unit</div>
                  </th>
                </tr>
              </thead>
              <tbody class="p-datatable-tbody">
                <tr v-for="product in recipie.products" :key="product.id">
                  <td class="ingredient-column fw-normal">{{ product.name }}</td>
                  <td v-for="number in numbers" :key="`cell-${recipie.id}-${product.id}-${number}`">
                    {{ product.values[number].round(3) }}
                  </td>
                  <td class="unit-column fw-bold">{{ product.unit }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Instructions -->
        <div class="instructions" v-if="!recipie.forDayAfter && recipie.instructions">
          <h3>Instructions</h3>
          <div class="instructions-content" v-html="recipie.instructions"></div>
        </div>
        <div class="instructions" v-if="recipie.forDayAfter && recipie.instructions_day_before">
          <h3>Instructions</h3>
          <div class="instructions-content" v-html="recipie.instructions_day_before"></div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { unitChild, unitParent } from '@/services/units'

export default {
  props: ['event', 'day', 'dayIndex', 'numbers', 'leftoversTitle'],
  computed: {
    timeline() {
      return this.recipies.reduce((acc, recipie) => {
        return acc.concat(recipie.forDayAfter ? recipie.timeline_day_before : recipie.timeline)
      }, [])
        .filter((step) => step && step.time && step.text)
        .sort((a, b) => new Date(`1970-01-01T${a.time || '00:00'}:00`) - new Date(`1970-01-01T${b.time || '00:00'}:00`))
    },
    leftovers() {
      if (this.dayIndex < 1) return []

      const result = []
      this.$root.session.rows.forEach((row) => {
        if (row.printable === false) return

        const forDayAfterValue = row.values[`Event${this.event.id}_${this.dayIndex - 1}`] || {}
        const forDayAfterRecipie = this.$root.getRecipie(row.recipie_id || forDayAfterValue.recipie_id)
        if (forDayAfterRecipie.id && forDayAfterRecipie.leftovers_instructions) {
          result.push({ ...forDayAfterRecipie, ...{ row } })
        }
      })
      return result
    },
    recipies() {
      const result = []
      // Recipie to be prepare for this day
      if (this.dayIndex >= 0) {
        this.$root.session.rows.forEach((row) => {
          if (row.printable === false) return
          const dayValue = row.values[`Event${this.event.id}_${this.dayIndex}`] || {}
          const dayRecipie = this.$root.getRecipie(row.recipie_id || dayValue.recipie_id)
          if (dayRecipie.id && dayValue.amount) {
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
          result.push({ ...dayAfterRecipie, ...{ row }, ...{ forDayAfter: true } })
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
            this.numbers.forEach((number) => {
              product.values[number] *= 1000
            })
          } else if (['g', 'mL'].includes(product.unit) && bigValuesCount > threshold) {
            product.unit = unitParent(product.unit)
            this.numbers.forEach((number) => {
              product.values[number] /= 1000
            })
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
:root {
  --text-color: black !important;
}

.day-menu {
  min-height: 297mm;
  page-break-inside: avoid;
  padding: 0 3rem;

  .day-title {
    page-break-after: always;
  }

  .day-title,
  .recipie-section {
    page-break-inside: avoid;
    padding: 2rem 0;
  }

  .recipie-name {
    .p-chip {
      font-size: .9rem;
    }
  }

  .instructions-content li {
    margin-bottom: 1rem;
  }

  .quantities-table {
    width: auto;

    td,
    tr {
      $width: 3rem;
      min-width: $width !important;
      max-width: $width !important;
      width: $width !important;

      &.ingredient-column {
        $width: 200px;
        min-width: $width !important;
        max-width: $width !important;
        width: $width !important;
      }
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

    td {
      padding: 0.35rem 0.5rem !important;
    }
  }

  .timeline,
  .leftovers {
    label {
      font-weight: 600;
      width: 6rem;
      flex-shrink: 0;
      text-align: right;
    }
  }

  .step-text {
    line-height: 1.5;

    p {
      margin-top: 0;
      margin-bottom: .5rem;
    }
  }
}
</style>
