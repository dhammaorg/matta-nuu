<template>
  <div class="mb-3">
    <Button label="New Order" icon="pi pi-plus" class="p-button-success me-2"
            @click="$refs.orderForm.show()" />
    <span class="p-input-icon-left float-end">
      <i class="pi pi-search" />
      <InputText v-model="filters['global'].value" placeholder="Search..." />
    </span>
  </div>

  <DataTable :value="orders" dataKey="id"
             :paginator="true" :rows="20" :filters="filters">

    <Column field="name" header="Name" :sortable="true" header-class="text-start"></Column>
    <Column field="supplier" header="Supplier" :sortable="true"></Column>
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

export default {
  inject: ['sessionDays'],
  components: { OrderNewDialog },
  data() {
    return {
      filters: {},
    }
  },
  async created() {
    this.initFilters()
    this.$db.from('orders').select('id, name, created_at, session_id, supplier').match({ session_id: this.$route.params.id }).then((result) => {
      result.data.forEach((order) => {
        if (!this.$root.orders[order.id]) {
          this.$root.orders[order.id] = order
        }
      })
    })
  },
  computed: {
    orders() {
      return Object.values(this.$root.orders).filter((order) => order.session_id === this.$root.session.id)
    },
  },
  methods: {
    initFilters() {
      this.filters = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
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
