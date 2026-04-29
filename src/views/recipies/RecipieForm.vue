<template>
  <Dialog v-model:visible="visible" :style="{ width: '600px' }" header="Recipie Details"
          :modal="true" class="p-fluid recipie-dialog">
    <div class="p-field">
      <InputText id="name" v-model.trim="recipie.name" required="true" placeholder="Name"
                 autofocus />
    </div>

    <div class="p-field">
      <InputCategory v-model="recipie.category_ids" type="Recipie" :multiple="true" />
    </div>

    <div class="ingredients my-4 py-2">
      <div class="d-flex justify-content-between my-3">
        <div class="fw-bold">
          <span>Ingredients for</span>
          <InputNumber v-model="recipie.people_count" class="d-inline-block w-auto mx-2"
                       inputStyle="width: 4rem" inputClass="text-center" />
          <span>People</span>
        </div>
        <div class="fw-bold my-auto">
          <span>{{ recipiePrice }} € for 1 person </span>
          <i v-if="missingProductPrices && missingProductPrices.length > 0"
             class="pi pi-exclamation-triangle" v-tooltip="missingProductPrices" type="text"></i>
        </div>
      </div>

      <div v-for="product in recipie.products" class="d-flex mb-2" :key="product">
        <div class="p-inputgroup">
          <InputProduct v-model="product.id" :showClear="false" :editable="true"
                        style="border-top-right-radius: 0; border-bottom-right-radius: 0" />
          <InputNumber v-model="product.amount" :maxFractionDigits="5" placeholder="Amount"
                       inputClass="border-start-0 input-amount" />
          <span class="p-inputgroup-addon" style="width: 4rem;">{{ $root.getProduct(product.id).unit
            }}</span>
          <span v-if="this.$root.computePrice(product.amount, product.id)"
                class="p-inputgroup-addon"
                style="width: 6rem;">
            {{
              this.$root.computePrice(product.amount, product.id)
            }} €
          </span>
          <span v-else
                class="p-inputgroup-addon"
                style="width: 6rem;">
            <!-- <i class="pi pi-exclamation-triangle"></i> -->
          </span>
        </div>
        <Button icon="pi pi-times" class="p-button-text p-button-danger"
                @click="removeProduct(product)" />
      </div>
      <Button icon="pi pi-plus" class="p-button-primary p-button-sm w-auto mt-2" label="Ingredient"
              @click="recipie.products.push({})"></Button>
    </div>

    <div class="p-field-checkbox">
      <Checkbox id="day_before" v-model="recipie.prepare_day_before" :binary="true" />
      <label for="day_before" class="ms-2">Need to be prepared the day before</label>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false" />
      <Button label="Save" icon="pi pi-check" class="p-button-text" :loading="loading"
              @click="saveRecipie" />
    </template>
  </Dialog>
</template>

<script>

import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import InputProduct from '@/components/InputProduct.vue'
import InputCategory from '@/components/InputCategory.vue'

export default {
  components: {
    InputNumber, InputProduct, Checkbox, InputCategory,
  },
  data() {
    return {
      visible: false,
      loading: false,
      recipie: {},
    }
  },
  computed: {
    recipiePrice() {
      return this.$root.getRecipiePrice(this.recipie.id)
    },
    missingProductPrices() {
      return this.$root.getRecipieMissingProductPrices(this.recipie.id)
    },
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

<style lang="scss">
.ingredients {
  .input-product-wrapper {
    width: 20% !important;
  }

  .p-inputgroup {
    &:hover>.btn-edit-product {
      border-color: var(--primary-color);
    }

    .btn-edit-product {
      border-radius: 0 !important;
      background-color: transparent;
      border-color: #ced4da;
      border-left: none !important;
      width: 2.5rem !important;
      justify-content: flex-start;
      padding-left: .25rem !important;
      color: var(--text-color);

      .pi {
        font-size: .9rem;
      }

      &:hover {
        background-color: transparent !important;
        color: var(--primary-color);
        border-color: #ced4da;
      }
    }
  }

  .input-product {
    border-right: none;
  }
}
</style>
