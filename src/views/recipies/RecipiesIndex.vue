<template>
  <img class="page-background" src="@/assets/undraw_chef.svg" />

  <HelpMessage>
    <strong>Recipies</strong> can be used in any sessions. Changing one recipie will update all
    sessions using it
  </HelpMessage>

  <div class="page-content">
    <div class="table-header">
      <Button v-tooltip.top="'New Recipie'" icon="pi pi-plus" class="p-button-rounded"
              @click="$refs.form.show()" />
      <h2>Recipies</h2>
      <span class="p-input-icon-left search">
        <i class="pi pi-search" />
        <InputText v-model="filters['global'].value" placeholder="Search..." />
      </span>
    </div>

    <DataTable :value="$root.recipiesArray" dataKey="id"
               :paginator="true" :rows="20" v-model:filters="filters" filterDisplay="menu">

      <Column field="name" header="Name" :sortable="true"></Column>

      <!-- Category -->
      <Column field="category_ids" header="Categories" :sortable="true"
              filterField="category_ids" :showFilterMatchModes="false">
        <template #body="{ data }">
          <Chip v-for="catId in data.category_ids" :key="catId" class="me-2"
                :label="$root.getCategory(catId).name" />
        </template>
        <template #filter="{ filterModel }">
          <InputCategory type="Recipie" v-model="filterModel.value" class="p-column-filter"
                         :btnAdd="false" :showClear="false" />
        </template>
      </Column>

      <!-- Price -->
      <Column field="price" header="Price / person" class="price text-center d-print-none">
        <template #body="{ data }">
          <div>
            <span> {{ this.$root.getRecipiePrice(data.id) }} € </span>
            <i v-if="this.$root.getRecipieMissingProductPrices(data.id).length > 0"
               class="pi pi-exclamation-triangle"
               v-tooltip="this.$root.getRecipieMissingProductPrices(data.id)" type="text"></i>
          </div>
        </template>
      </Column>

      <!-- Actions -->
      <Column class="text-end">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" class="p-button-text p-button-primary"
                  @click="$refs.form.show(data)" v-tooltip="'Edit'" />
          <Button icon="pi pi-trash" class="p-button-text p-button-danger"
                  @click="deleteRecipie(data)" />
        </template>
      </Column>
    </DataTable>

    <RecipieForm ref="form"></RecipieForm>
  </div>
</template>

<script>
import { FilterMatchMode } from 'primevue/api'
import Chip from 'primevue/chip'
import RecipieForm from './RecipieForm.vue'
import InputCategory from '@/components/InputCategory.vue'

export default {
  components: { RecipieForm, InputCategory, Chip },
  data() {
    return {
      filters: {},
    }
  },
  created() {
    this.initFilters()
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
  },
}
</script>
