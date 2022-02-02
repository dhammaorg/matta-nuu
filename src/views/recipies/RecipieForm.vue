<template>
  <Dialog v-model:visible="visible" :style="{width: '600px'}" header="Recipie Details"
          :modal="true" class="p-fluid recipie-dialog">
    <div class="p-field">
      <InputText id="name" v-model.trim="recipie.name" required="true" placeholder="Name" autofocus/>
    </div>

    <div class="ingredients my-4 py-2">
      <div class="fw-bold mb-3">
        <span>Ingredients for</span>
        <InputNumber v-model="recipie.people_count" class="d-inline-block w-auto mx-2"
                    inputStyle="width: 4rem" inputClass="text-center"/>
        <span>People</span>

        <Button icon="pi pi-plus" class="p-button-rounded p-button-primary p-button-sm float-end"
              @click="recipie.products.push({})"></Button>
      </div>
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

    <div class="field-checkbox">
      <Checkbox id="day_before" v-model="recipie.prepare_day_before" :binary="true" />
      <label for="day_before" class="ms-2">Need to be prepared the day before</label>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false"/>
      <Button label="Save" icon="pi pi-check" class="p-button-text" :loading="loading" @click="saveRecipie" />
    </template>
  </Dialog>
</template>

<script>

import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import InputProduct from '@/components/InputProduct.vue'

export default {
  components: { InputNumber, InputProduct, Checkbox },
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
        // filter empty ingredients
        this.recipie.products = this.recipie.products.filter((p) => p.id && p.amount)

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
      this.recipie.products = this.recipie.products.filter((p) => p.id !== product.id)
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
