<template>
  <img class="page-background" src="@/assets/undraw_chef.svg" />

  <HelpMessage>
    <strong>Recipies</strong> can be used in any sessions. Changing one recipie will update all
    sessions using it
  </HelpMessage>

  <div class="page-content">
    <div class="table-header">
      <Button v-tooltip.top="'New Recipie'" icon="pi pi-plus" class="p-button-rounded" @click="$refs.form.show()" />
      <h2>Recipies</h2>
      <span class="p-input-icon-left search">
        <i class="pi pi-search" />
        <InputText v-model="filters['global'].value" placeholder="Search..." />
      </span>
      <Button label="Save" icon="pi pi-save" class="p-button-success ms-3" @click="save" :loading="loading" />
    </div>

    <DataTable :value="$root.recipiesArray" dataKey="id" :paginator="true" :rows="20" v-model:filters="filters"
      filterDisplay="menu" class="editable-cells-table recipies-table" sortField="name" :sortOrder="1">

      <Column field="name" header="Name" class="recipie-name-column" :sortable="true">
        <template #body="{ data }">
          <InputText v-model.trim="data.name" placeholder="" />
        </template>
      </Column>

      <!-- Category -->
      <Column field="category_ids" header="Categories" :sortable="true" filterField="category_ids"
        :showFilterMatchModes="false">
        <template #body="{ data }">
          <InputCategory type="Recipie" :multiple="true" v-model="data.category_ids" placeholder="" />
        </template>
        <template #filter="{ filterModel }">
          <InputCategory type="Recipie" v-model="filterModel.value" class="p-column-filter" :btnAdd="false"
            :showClear="false" />
        </template>
      </Column>

      <!-- Price -->
      <Column field="price" sortField="_pricePerPersonSort" header="Price / person" :sortable="true"
        class="price text-center d-print-none">
        <template #body="{ data }">
          <div>
            <span> {{ this.$root.getRecipiePrice(data.id) }} € </span>
            <i v-if="this.$root.getRecipieMissingProductPrices(data.id).length > 0" class="pi pi-exclamation-triangle"
              v-tooltip="this.$root.getRecipieMissingProductPrices(data.id)" type="text"></i>
          </div>
        </template>
      </Column>

      <!-- Actions -->
      <Column class="text-end">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" class="p-button-text p-button-primary" @click="$refs.form.show(data)"
            v-tooltip="'Edit'" />
          <Button icon="pi pi-trash" class="p-button-text p-button-danger" @click="deleteRecipie(data)" />
        </template>
      </Column>
    </DataTable>

    <RecipieForm ref="form"></RecipieForm>
  </div>
</template>

<script>
import { FilterMatchMode } from 'primevue/api'
import InputText from 'primevue/inputtext'
import RecipieForm from './RecipieForm.vue'
import InputCategory from '@/components/InputCategory.vue'

function serializeRecipieForUpsert(recipie) {
  const { _pricePerPersonSort, ...row } = recipie
  return {
    ...row,
    category_ids: [...(row.category_ids || [])],
    products: (row.products || []).map((product) => ({ ...product })),
    timeline: (row.timeline || []).map((step) => ({ ...step })),
    timeline_day_before: (row.timeline_day_before || []).map((step) => ({ ...step })),
  }
}

export default {
  components: { RecipieForm, InputCategory, InputText },
  data() {
    return {
      loading: false,
      filters: {},
    }
  },
  computed: {
    priceSortSignature() {
      return this.$root.recipiesArray
        .map((recipie) => `${recipie.id}:${this.$root.getRecipiePrice(recipie.id)}`)
        .join('|')
    },
  },
  created() {
    this.initFilters()
    this.syncPriceSortKeys()
  },
  watch: {
    priceSortSignature() {
      this.syncPriceSortKeys()
    },
  },
  methods: {
    deleteRecipie(recipie) {
      this.$confirm.require({
        message: `Are you sure you want to delete ${recipie.name} ?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          this.dbDestroy('recipies', recipie)
        },
      })
    },
    initFilters() {
      this.filters = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        category_ids: { value: null, matchMode: FilterMatchMode.CONTAINS },
      }
    },
    syncPriceSortKeys() {
      this.$root.recipiesArray.forEach((recipie) => {
        recipie._pricePerPersonSort = Number.parseFloat(this.$root.getRecipiePrice(recipie.id)) || 0
      })
    },
    async save() {
      this.loading = true
      const rows = this.$root.recipiesArray.map((recipie) => serializeRecipieForUpsert(recipie))
      const { error } = await this.$db.from('recipies').upsert(rows)

      if (error) this.toastError(error)
      else {
        this.syncPriceSortKeys()
        this.$toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'All recipies sucessfully updated',
          life: 4000,
        })
      }

      this.loading = false
    },
  },
}
</script>

<style lang="scss">
.recipies-table {
  td {
    &.recipie-name-column input {
      color: inherit;
      text-align: left;
    }

    input,
    .p-dropdown,
    .p-multiselect {
      border: none !important;
      background-color: transparent !important;
      box-shadow: none !important;
      width: 100%;
    }

    .p-dropdown-label,
    .p-multiselect-label {
      background-color: transparent !important;
      color: inherit;
    }

    .p-dropdown-trigger,
    .p-multiselect-trigger {
      background-color: transparent !important;
      color: inherit;
    }
  }
}
</style>
