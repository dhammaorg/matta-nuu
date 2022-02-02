<template>
  <Button type="button" icon="pi pi-print" class="p-button-sm p-button-rounded"
          @click="visible = true" />

  <Dialog v-model:visible="visible" :style="{width: '600px'}" :modal="true" class="p-fluid"
          header="Print">

    <div class="mb-3">
      <Checkbox id="amount" v-model="hide.amounts" :binary="true" />
      <label for="amount" class="ms-2">Hide Amounts</label>
    </div>

    <div class="mb-3">
      <Checkbox id="dates" v-model="hide.dates" :binary="true" />
      <label for="dates" class="ms-2">Hide Dates</label>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false"/>
      <Button label="Print" icon="pi pi-print" @click="print" />
    </template>
  </Dialog>
</template>

<script>
import Checkbox from 'primevue/checkbox'

export default {
  components: { Checkbox },
  data() {
    return {
      visible: false,
      hide: {
        amounts: false,
        dates: false,
      },
    }
  },
  methods: {
    print() {
      const { classList } = document.querySelector('.session-table')

      Object.entries(this.hide).forEach(([key, value]) => {
        if (value) classList.add(`hide-${key}-on-print`)
        else classList.remove(`hide-${key}-on-print`)
      })

      window.print()
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
