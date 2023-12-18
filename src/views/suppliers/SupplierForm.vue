<template>
  <Dialog v-model:visible="visible" :style="{ width: '600px' }" header="Supplier"
          :modal="true" class="p-fluid supplier-dialog">
    <div class="p-field">
      <InputText id="name" v-model.trim="supplier.name" required="true" placeholder="Name"
                 autofocus />
    </div>

    <div class="p-field">
      <label>Description</label>
      <Textarea v-model="supplier.description" :autoResize="true" rows="2" />
    </div>

    <Divider align="center" class="mt-4">Order Informations</Divider>

    <div class="p-field">
      <label>Contact Details</label>
      <Textarea v-model="supplier.contact_details" :autoResize="true" rows="2"
                placeholder="Name, Address, Phone, Email..." />
    </div>

    <div class="p-field">
      <label>Default Header</label>
      <Textarea v-model="supplier.order_header" :autoResize="true" rows="1" />
    </div>

    <div class="p-field">
      <label>Default Footer</label>
      <Textarea v-model="supplier.order_footer" :autoResize="true" rows="1"
                placeholder="With kind regards" />
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false" />
      <Button label="Save" icon="pi pi-check" class="p-button-text" :loading="loading"
              @click="saveSupplier" />
    </template>
  </Dialog>
</template>

<script>
import Textarea from 'primevue/textarea'
import Divider from 'primevue/divider'

export default {
  components: { Textarea, Divider },
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

<style lang='scss' scoped></style>
