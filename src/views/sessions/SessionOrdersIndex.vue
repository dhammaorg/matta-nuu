<template>
  <div class="mb-3">
    <Button label="New Order" icon="pi pi-plus" class="me-2"
            @click="$refs.orderForm.show()" />
    <span class="p-input-icon-left float-end">
      <i class="pi pi-search" />
      <InputText v-model="filters['global'].value" placeholder="Search..." />
    </span>
  </div>

  <DataTable :value="orders" dataKey="id"
             :paginator="true" :rows="20"
             sortField="delivery_day_date" :sortOrder="-1" removableSort
             v-model:filters="filters" filterDisplay="menu">

    <Column field="delivery_day_label" header="Delivery Date" bodyClass="text-capitalize"
            :sortable="true" sort-field="delivery_day_date">
    </Column>

    <Column field="name" header="Name" header-class="text-start"></Column>
    <Column field="supplier_id" header="Supplier" :sortable="true" :showFilterMatchModes="false">
      <template #body="{data}">
        {{ $root.getSupplier(data.supplier_id).name }}
      </template>
      <template #filter="{filterModel}">
        <InputSupplier v-model="filterModel.value" class="p-column-filter"
                       :btnAdd="false" :showClear="false"/>
      </template>
    </Column>

    <Column class="text-end">
      <template #body="{data}">
        <router-link :to="{ name: 'session_order', params: { id: $route.params.id, order_id: data.id }}">
          <Button icon="pi pi-pencil" class="p-button-text p-button-primary" />
        </router-link>
        <Button icon="pi pi-trash" class="p-button-text p-button-danger" @click="destroy(data)" />
      </template>
    </Column>
  </DataTable>
  <OrderNewDialog ref="orderForm" :days="sessionDays"/>
</template>

<script>
import { FilterMatchMode } from 'primevue/api'
import OrderNewDialog from './OrderNewDialog.vue'
import InputSupplier from '@/components/InputSupplier.vue'

export default {
  inject: ['sessionDays', 'stockDays'],
  components: { OrderNewDialog, InputSupplier },
  data() {
    return {
      filters: {},
    }
  },
  async created() {
    this.initFilters()
  },
  computed: {
    orders() {
      return Object.values(this.$root.orders).filter((order) => order.session_id === this.$root.session.id)
        .sort((a, b) => (a.id < b.id ? 1 : -1))
        .map((o) => {
          o.delivery_day_object = this.stockDays.find((d) => d.id == o.delivery_day) || {}
          o.delivery_day_label = o.delivery_day_object.dateHeader
          o.delivery_day_date = o.delivery_day_object.date
          return o
        })
    },
  },
  methods: {
    initFilters() {
      this.filters = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        supplier_id: { value: null, matchMode: FilterMatchMode.EQUALS },
      }
    },
    destroy(order) {
      this.$confirm.require({
        message: `Are you sure you want to delete ${order.name} ?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          this.dbDestroy('orders', order)
        },
      })
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
