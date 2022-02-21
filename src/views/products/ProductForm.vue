<template>
  <Dialog v-model:visible="visible" :style="{width: '600px'}" header="Product"
          :modal="true" class="p-fluid product-dialog">
    <div class="p-field">
      <InputText v-model.trim="product.name" required="true" placeholder="Name" autofocus/>
    </div>

    <div class="p-field">
      <InputUnit v-model="product.unit" required="true" />
    </div>

    <div class="p-field">
      <InputCategory type="Product" v-model="product.category_id" placeholder="Category" />
    </div>

    <div class="p-field">
      <InputSupplier v-model="product.supplier_id" />
    </div>

    <div class="p-field">
      <InputText v-model="product.packaging_reference" placeholder="Packaging Name / Reference"/>
    </div>

    <div class="p-field">
      <InputNumber v-model="product.packaging_conditioning" placeholder="Packaging Conditioning"
                   :suffix="' ' + product.unit" />
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false"/>
      <Button label="Save" icon="pi pi-check" class="p-button-text" :loading="loading" @click="saveProduct" />
    </template>
  </Dialog>
</template>

<script>

import InputNumber from 'primevue/inputnumber'
import InputUnit from '@/components/InputUnit.vue'
import InputSupplier from '@/components/InputSupplier.vue'
import InputCategory from '@/components/InputCategory.vue'

export default {
  components: {
    InputUnit, InputSupplier, InputNumber, InputCategory,
  },
  data() {
    return {
      visible: false,
      loading: false,
      product: {},
    }
  },
  methods: {
    show(object = {}) {
      this.product = { ...object }
      this.visible = true
    },
    async saveProduct() {
      if (this.product.name) {
        if (this.product.id) {
          this.dbUpdate('products', this.product)
        } else {
          const newProduct = await this.dbCreate('products', this.product)
          this.$emit('created', newProduct)
        }
        this.visible = false
        this.product = {}
      }
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
