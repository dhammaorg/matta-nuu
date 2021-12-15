<template>
  <Dialog v-model:visible="visible" :style="{width: '600px'}" header="Recipie Details"
          :modal="true" class="p-fluid">
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
        <InputProduct v-model="product.name" class="me-2 w-50" placeholder="Name"/>
        <InputNumber v-model="product.amount" mode="decimal" :maxFractionDigits="5"
                    class="me-2 w-25" placeholder="Amount"/>
        <Dropdown v-model="product.unit" :options="units" placeholder="Unit" class="w-25" />
        <Button icon="pi pi-times" class="p-button-text p-button-danger"
                @click="removeProduct(product)"/>
      </div>
    </div>

    <Button icon="pi pi-plus" class="p-button-rounded p-button-primary"
            @click="recipie.products.push({})"></Button>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false"/>
      <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveRecipie" />
    </template>
  </Dialog>
</template>

<script>

import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import InputProduct from '@/components/InputProduct.vue'

import { UNITS } from '@/services/units'

export default {
  components: { InputNumber, Dropdown, InputProduct },
  data() {
    return {
      visible: false,
      recipie: {},
    }
  },
  computed: {
    units() { return UNITS },
  },
  methods: {
    show(object = {}) {
      this.recipie = { ...object }
      this.recipie.products ||= []
      this.recipie.people_count ||= 10
      this.visible = true
    },
    async saveRecipie() {
      if (this.recipie.name.trim()) {
        if (this.recipie.id) {
          this.dbUpdate('recipies', this.recipie)
        } else {
          this.dbCreate('recipies', this.recipie)
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
