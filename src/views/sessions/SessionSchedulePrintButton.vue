<template>
  <Button type="button" icon="pi pi-print" class="p-button-sm p-button-rounded"
          @click="visible = true" />

  <Dialog v-model:visible="visible" :style="{width: '600px'}" :modal="true" class="p-fluid"
          header="Print">

    <div class="p-field mb-3" v-if="$root.session.events.length > 1">
      <MultiSelect v-model="events" :options="$root.session.events"
                   placeholder="Select Events to Print"
                   optionLabel="name" optionValue="id" :multiple="true" />
    </div>

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
import MultiSelect from 'primevue/multiselect'

export default {
  components: { Checkbox, MultiSelect },
  data() {
    return {
      visible: false,
      events: [],
      hide: {
        amounts: false,
        dates: false,
      },
    }
  },
  methods: {
    print() {
      const { classList } = document.querySelector('.session-table')

      // Hide some part fo the table
      Object.entries(this.hide).forEach(([key, value]) => {
        if (value) classList.add(`hide-${key}-on-print`)
        else classList.remove(`hide-${key}-on-print`)
      })

      // Hide events by adding css
      let style = '@media print {'
      if (this.$root.session.events.length > 1) {
        this.$root.session.events.forEach((event) => {
          if (!this.events.includes(event.id)) {
            style += `.event-${event.id} { display: none !important }`
          }
        })
      }
      style += '}'
      document.getElementById('print-event-filtering').innerHTML = style
      window.print()
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
