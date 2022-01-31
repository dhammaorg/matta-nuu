<template>
  <Dialog v-model:visible="visible" :style="{width: '600px'}" header="Supplier"
          :modal="true" class="p-fluid supplier-dialog">
    <div class="p-field">
      <InputText id="name" v-model.trim="supplier.name" required="true" placeholder="Name" autofocus/>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false"/>
      <Button label="Save" icon="pi pi-check" class="p-button-text" :loading="loading" @click="saveSupplier" />
    </template>
  </Dialog>
</template>

<script>

export default {
  data() {
    return {
      visible: false,
      loading: false,
      supplier: {},
    }
  },
  methods: {
    show(object = {}) {
      this.supplier = { ...object }
      this.visible = true
    },
    async saveSupplier() {
      if (this.supplier.name) {
        if (this.supplier.id) {
          this.dbUpdate('suppliers', this.supplier)
        } else {
          const newSupplier = await this.dbCreate('suppliers', this.supplier)
          this.$emit('created', newSupplier)
        }
        this.visible = false
        this.supplier = {}
      }
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
