<template>
  <Button type="button" icon="pi pi-print" class="p-button-sm p-button-rounded"
          @click="visible = true" />

  <Dialog v-model:visible="visible" :style="{width: '600px'}" :modal="true" class="p-fluid"
          header="Print">

    <SelectButton v-model="printOption" :options="printOptions" class="mb-3"
                  optionLabel="label" optionValue="value" />

    <div class="p-field mb-3" v-if="$root.session.events.length > 1">
      <MultiSelect v-model="eventsToPrint" :options="$root.session.events"
                  placeholder="Select Events to Print" optionLabel="name" :multiple="true" />
    </div>

    <template v-if="printOption == 'schedule'">
      <div class="mb-3">
        <Checkbox id="amount" v-model="hide.amounts" :binary="true" />
        <label for="amount" class="ms-2">Hide Amounts</label>
      </div>

      <div class="mb-3">
        <Checkbox id="dates" v-model="hide.dates" :binary="true" />
        <label for="dates" class="ms-2">Hide Dates</label>
      </div>
    </template>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false"/>
      <Button label="Print" icon="pi pi-print" @click="print" />
    </template>
  </Dialog>

  <teleport to="#app">
    <ScheduleQuantities :events="eventsToPrint" v-if="visible && printOption == 'quantities'" />
  </teleport>
</template>

<script>
import Checkbox from 'primevue/checkbox'
import MultiSelect from 'primevue/multiselect'
import SelectButton from 'primevue/selectbutton'
import ScheduleQuantities from './SessionScheduleQuantities.vue'

export default {
  components: {
    Checkbox, MultiSelect, ScheduleQuantities, SelectButton,
  },
  data() {
    return {
      printOption: 'schedule',
      printOptions: [
        { value: 'schedule', label: 'Print Schedule' },
        { value: 'quantities', label: 'Print Quantities' },
      ],
      visible: false,
      eventsToPrint: [],
      hide: {
        amounts: false,
        dates: true,
      },
    }
  },
  mounted() {
    if (this.$root.session.events.length === 1) this.eventsToPrint = this.$root.session.events
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
      this.$root.session.events.forEach((event) => {
        if (!this.eventsToPrint.includes(event)) {
          style += `.event-${event.id} { display: none !important }`
        }
      })
      style += '}'
      document.getElementById('print-event-filtering').innerHTML = style
      window.print()
    },
  },
}
</script>
