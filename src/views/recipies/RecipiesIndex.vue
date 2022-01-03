<template>
  <div class="page-content">
    <div class="mb-3">
      <Button label="New Recipie" icon="pi pi-plus" class="p-button-success me-2" @click="$refs.form.show()" />
      <span class="p-input-icon-left float-end">
        <i class="pi pi-search" />
        <InputText v-model="filters['global'].value" placeholder="Search..." />
      </span>
    </div>

    <DataTable :value="$root.recipiesArray" dataKey="id"
      :paginator="true" :rows="20" :filters="filters">

      <Column field="name" header="Name" :sortable="true"></Column>
      <Column class="text-end">
        <template #body="{data}">
          <Button icon="pi pi-pencil" class="p-button-text p-button-primary"
                  @click="$refs.form.show(data)" />
          <Button icon="pi pi-trash" class="p-button-text p-button-danger"
                  @click="deleteRecipie(data)" />
        </template>
      </Column>
    </DataTable>
    <ConfirmDialog></ConfirmDialog>

    <RecipieForm ref="form"></RecipieForm>
  </div>
</template>

<script>
import { FilterMatchMode } from 'primevue/api'
import RecipieForm from './RecipieForm.vue'

export default {
  components: { RecipieForm },
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
      }
    },
  },
}
</script>
