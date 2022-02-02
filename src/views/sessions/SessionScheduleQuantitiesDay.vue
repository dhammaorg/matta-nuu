<template>
  <div class="day-quantities mb-3">
    <h1 class="text-center">{{ event.name }} - {{ day }}</h1>

    <DataTable :value="products" showGridlines rowGroupMode="subheader" groupRowsBy="recipie.name"
               class="p-datatable-sm">
      <template #groupheader="{ data }">
        <h3 class="recipie-name">
          {{ data.recipie.name}}
          <span class="p-chip fw-normal fs-6 ms-2" v-if="data.recipie.row.label">{{ data.recipie.row.label}}</span>
        </h3>
      </template>
      <Column field="recipie.name" header="Recipie"></Column>
      <Column header="People Count">
        <template #body="{ data }">
          {{ $root.getProduct(data.id).name }}
        </template>
      </Column>
      <Column v-for="number in numbers" :header="number" :key="`column-${number}`">
        <template #body="{ data }">
          {{ (data.amount * number / data.recipie.people_count).round(3) }}
        </template>
      </Column>
      <Column header="Unit">
        <template #body="{ data }">
          <span style="font-weight: 500">{{ $root.getProduct(data.id).unit }}</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script>
export default {
  props: ['event', 'day', 'dayIndex', 'numbers'],
  computed: {
    recipies() {
      const result = []
      this.$root.session.rows.forEach((row) => {
        const dayValue = row.values[`Event${this.event.id}_${this.dayIndex}`]
        const dayRecipie = this.$root.getRecipie(row.recipie_id || dayValue.recipie_id)
        if (dayRecipie.id) result.push({ ...dayRecipie, ...{ row } })
      })
      return result
    },
    products() {
      const result = []
      this.recipies.forEach((recipie) => {
        recipie.products.forEach((product) => {
          result.push({ ...product, ...{ recipie } })
        })
      })
      return result
    },
  },
}
</script>

<style lang="scss">
  .day-quantities {
    page-break-after: always;
    page-break-inside: avoid;

    td {
      padding: 0.35rem 0.5rem !important;
    }
    th, td {
      min-width: 0 !important;
    }
    tr > td:nth-child(even) {
      background-color: var(--bluegray-50);
    }
    tr > th:nth-child(odd) {
      background-color: var(--surface-0) !important;
    }
    td:not(:first-child) {
      text-align: center !important;
    }
    td:last-child, th:last-child {
      background-color: var(--bluegray-100) !important;
    }
    th:not(:first-child) .p-column-header-content {
      justify-content: center;
    }
    .recipie-name {
      margin-bottom: 0;
      font-size: 1.1rem;
      margin: 1rem 0 .25rem 0;
    }
    .p-rowgroup-header > td {
      border: none !important;
      background-color: var(--surface-0) !important;
    }
  }
  .day-quantities:not(:first-child) {
    margin-top: 3rem;
  }
</style>
