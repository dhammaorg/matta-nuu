<template>
  <Dialog v-model:visible="visible" maximizable position="top" :style="{ width: width }" header="Recipie Details"
    :modal="true" class="p-fluid recipie-dialog">
    <div class="p-field">
      <InputText id="name" v-model.trim="recipie.name" required="true" placeholder="Name" autofocus />
    </div>

    <div class="p-field mb-3">
      <InputCategory v-model="recipie.category_ids" type="Recipie" :multiple="true" />
    </div>

    <SelectButton v-model="tab" :options="tabOptions" class="mb-3" optionLabel="label" optionValue="value" />

    <!-- Ingredients -->
    <template v-if="tab == 'ingredients'">
      <div class="ingredients my-4 py-2">
        <div class="fw-bold mb-3">
          <span>For</span>
          <InputNumber v-model="recipie.people_count" class="d-inline-block w-auto mx-2" inputStyle="width: 4rem"
            inputClass="text-center" />
          <span>People</span>
        </div>
        <div v-for="product in recipie.products" class="d-flex mb-2" :key="product">
          <div class="p-inputgroup">
            <InputProduct v-model="product.id" :showClear="false" :editable="true"
              style="border-top-right-radius: 0; border-bottom-right-radius: 0" />
            <InputNumber v-model="product.amount" :maxFractionDigits="5" placeholder="Amount"
              inputClass="border-start-0 input-amount" />
            <span class="p-inputgroup-addon" style="width: 5rem;">{{
              $root.getProduct(product.id).unit
              }}</span>
          </div>
          <Button icon="pi pi-times" class="p-button-text p-button-danger" @click="removeProduct(product)" />
        </div>
        <Button icon="pi pi-plus" class="p-button-primary p-button-sm w-auto mt-2" label="Ingredient"
          @click="recipie.products.push({})"></Button>
      </div>
    </template>
    <!-- Preparation Instructions Day Before -->
    <template v-if="tab == 'instructions_day_before'">
      <div class="my-4 py-2">
        <Editor v-model="recipie.instructions_day_before" api-key="gld93ttf4tgy3id80qeozfn2kkussyi011pcw85aile0k2z9"
          :init="editorConfig" />
      </div>
    </template>
    <!-- Preparation Instructions -->
    <template v-if="tab == 'instructions'">
      <div class="my-4 py-2">
        <Editor v-model="recipie.instructions" api-key="gld93ttf4tgy3id80qeozfn2kkussyi011pcw85aile0k2z9"
          :init="editorConfig" />
      </div>
    </template>
    <!-- Timeline Day Before -->
    <template v-if="tab == 'timeline_day_before'">
      <div class="my-4 py-2 align-items-center timeline-container">
        <div v-for="step in recipie.timeline_day_before" class="d-flex mb-2" :key="step">
          <input type="time" class="p-inputtext w-auto" placeholder="Time" v-model="step.time" />
          <Editor v-model="step.text" api-key="gld93ttf4tgy3id80qeozfn2kkussyi011pcw85aile0k2z9" :init="editorConfig" />
          <Button icon="pi pi-times" class="p-button-text p-button-danger" @click="removeStepDayBefore(step)" />
        </div>
        <Button icon="pi pi-plus" class="p-button-primary p-button-sm w-auto mt-2" label="Step"
          @click="recipie.timeline_day_before.push({})"></Button>
      </div>
    </template>
    <!-- Timeline -->
    <template v-if="tab == 'timeline'">
      <div class="my-4 py-2 align-items-center timeline-container">
        <div v-for="step in recipie.timeline" class="d-flex mb-2" :key="step">
          <input type="time" class="p-inputtext w-auto" placeholder="Time" v-model="step.time" />
          <Editor v-model="step.text" api-key="gld93ttf4tgy3id80qeozfn2kkussyi011pcw85aile0k2z9" :init="editorConfig" />
          <Button icon="pi pi-times" class="p-button-text p-button-danger" @click="removeStep(step)" />
        </div>
        <Button icon="pi pi-plus" class="p-button-primary p-button-sm w-auto mt-2" label="Step"
          @click="recipie.timeline.push({})"></Button>
      </div>
    </template>
    <!-- Leftovers -->
    <template v-if="tab == 'leftovers'">
      <div class="my-4 py-2">
        <Editor v-model="recipie.leftovers_instructions" api-key="gld93ttf4tgy3id80qeozfn2kkussyi011pcw85aile0k2z9"
          :init="editorConfig" />
      </div>
    </template>
    <div class="p-field-checkbox">
      <Checkbox id="day_before" v-model="recipie.prepare_day_before" :binary="true" />
      <label for="day_before" class="ms-2">Need to be prepared the day before</label>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false" />
      <Button label="Save" icon="pi pi-check" class="p-button-text" :loading="loading" @click="saveRecipie" />
    </template>
  </Dialog>
</template>

<script>

import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import Editor from '@tinymce/tinymce-vue'
import SelectButton from 'primevue/selectbutton'
import InputProduct from '@/components/InputProduct.vue'
import InputCategory from '@/components/InputCategory.vue'
import Calendar from 'primevue/calendar'

export default {
  components: {
    InputNumber, InputProduct, Checkbox, InputCategory, Editor, SelectButton, Calendar,
  },
  data() {
    return {
      visible: false,
      loading: false,
      recipie: {},
      tab: 'ingredients',
      editorConfig: {
        menubar: false,
        plugins: 'advlist anchor autolink charmap image insertdatetime link lists media preview searchreplace table emoticons code',
        toolbar: 'bold italic underline | forecolor backcolor | removeformat | alignleft aligncenter alignright | bullist numlist outdent indent | link image emoticons blockquote | code',
        invalid_styles: { '*': 'font-size,font-family' }
      }
    }
  },
  computed: {
    width() {
      return this.tab === 'ingredients' ? '700px' : '1100px'
    },
    tabOptions() {
      if (this.recipie.prepare_day_before) {
        return [
          { value: 'ingredients', label: 'Ingredients' },
          { value: 'instructions_day_before', label: 'Instr. Day Before' },
          { value: 'instructions', label: 'Instructions' },
          { value: 'timeline_day_before', label: 'Timeline Day Before' },
          { value: 'timeline', label: 'Timeline' },
          { value: 'leftovers', label: 'Leftovers' },
        ]
      }
      return [
        { value: 'ingredients', label: 'Ingredients' },
        { value: 'instructions', label: 'Instructions' },
        { value: 'timeline', label: 'Timeline' },
        { value: 'leftovers', label: 'Leftovers' },
      ]
    },
  },
  methods: {
    show(object = {}) {
      this.recipie = { ...object }
      this.recipie.products ||= [{}]
      this.recipie.timeline ||= [{}]
      this.recipie.timeline.sort((a, b) => new Date(`1970-01-01T${a.time || '00:00'}:00`) - new Date(`1970-01-01T${b.time || '00:00'}:00`))
      this.recipie.timeline_day_before ||= [{}]
      this.recipie.timeline_day_before.sort((a, b) => new Date(`1970-01-01T${a.time || '00:00'}:00`) - new Date(`1970-01-01T${b.time || '00:00'}:00`))
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
    removeStep(step) {
      this.recipie.timeline = this.recipie.timeline.filter((s) => s.time !== step.time)
    },
    removeStepDayBefore(step) {
      this.recipie.timeline_day_before = this.recipie.timeline_day_before.filter((s) => s.time !== step.time)
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

.timeline-container {
  .p-calendar {
    width: 12rem;
  }

  .tox-tinymce {
    height: 150px !important;
    width: 100% !important;
    margin-left: 1rem;
  }
}
</style>
