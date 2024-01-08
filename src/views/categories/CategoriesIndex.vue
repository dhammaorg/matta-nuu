<template>
  <div class="page-content">

    <div class="table-header">
      <Button icon="pi pi-plus" class="p-button-rounded" v-tooltip.top="'New Template'"
              @click="$refs.form.show({ name: filters['global'].value, type })" />
      <h2>{{ headerLabel }}</h2>
      <span class="p-input-icon-left search">
        <i class="pi pi-search" />
        <InputText v-model="filters['global'].value" placeholder="Search..." />
      </span>
    </div>

    <DataTable :value="categories" dataKey="id"
               :paginator="true" :rows="20" :filters="filters">
      <Column field="name" header="Name" />
      <Column class="text-end">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" class="p-button-text p-button-primary"
                  @click="$refs.form.show(data)" v-tooltip="'Edit'" />
          <Button icon="pi pi-trash" class="p-button-text p-button-danger"
                  @click="deleteTemplate(data)" />
        </template>
      </Column>
    </Datatable>

    <CategoryForm ref="form"></CategoryForm>
  </div>
</template>

<script>
import { FilterMatchMode } from 'primevue/api'
import CategoryForm from '@/views/categories/CategoryForm.vue'

export default {
  components: { CategoryForm },
  data() {
    return {
      filters: {},
    }
  },
  created() {
    this.filters = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    }
  },
  computed: {
    type() {
      return this.$route.params.type
    },
    headerLabel() {
      return this.type === 'StorageArea' ? 'Storage Areas' : `${this.type} Categories`
    },
    categories() {
      return Object.values(this.$root.categories).filter((c) => c.type === this.type)
    },
  },
  methods: {
    deleteTemplate(category) {
      this.$confirm.require({
        message: `Are you sure you want to delete ${category.name} ?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          this.dbDestroy('categories', category)
        },
      })
    },
  },
}
</script>

<style lang='scss' scoped></style>
