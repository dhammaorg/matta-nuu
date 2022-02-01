<template>
  <Dialog v-model:visible="visible" :style="{width: '600px'}" header="Recipie Details"
          :modal="true" class="p-fluid recipie-dialog">
    <div class="p-field">
      <InputText id="name" v-model.trim="recipie.name" required="true" placeholder="Name" autofocus/>
    </div>

    <div class="fw-bold my-3">
      <span>Ingredients for</span>
      <InputNumber v-model="recipie.people_count" class="d-inline-block w-auto mx-2"
                   inputStyle="width: 4rem" inputClass="text-center"/>
      <span>People</span>
    </div>

    <div class="mb-3">
      <div v-for="product in recipie.products" class="d-flex mb-2" :key="product">
        <div class="p-inputgroup">
          <InputProduct v-model="product.id" />
          <InputNumber v-model="product.amount" :maxFractionDigits="5" placeholder="Amount"
                       inputClass="border-start-0" />
          <span class="p-inputgroup-addon" style="width: 5rem;">{{ $root.getProduct(product.id).unit }}</span>
        </div>
        <Button icon="pi pi-times" class="p-button-text p-button-danger"
                @click="removeProduct(product)"/>
      </div>
    </div>

    <Button icon="pi pi-plus" class="p-button-rounded p-button-primary"
            @click="recipie.products.push({})"></Button>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false"/>
      <Button label="Save" icon="pi pi-check" class="p-button-text" :loading="loading" @click="saveRecipie" />
    </template>
  </Dialog>
</template>

<script>

import InputNumber from 'primevue/inputnumber'
import InputProduct from '@/components/InputProduct.vue'

export default {
  components: { InputNumber, InputProduct },
  data() {
    return {
      visible: false,
      loading: false,
      recipie: {},
    }
  },
  methods: {
    show(object = {}) {
      this.recipie = { ...object }
      this.recipie.products ||= [{}]
      this.recipie.people_count ||= 10
      this.visible = true
    },
    async saveRecipie() {
      if (this.recipie.name) {
        if (this.recipie.id) {
          this.dbUpdate('recipies', this.recipie)
        } else {
          const newRecipie = await this.dbCreate('recipies', this.recipie)
          this.$emit('created', newRecipie)
        }
        this.visible = false
        this.recipie = {}
      }
    },
    removeProduct(product) {
      this.recipie.products = this.recipie.products.filter((p) => p.name !== product.name)
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
