<template>
  <Button type="button" icon="pi pi-print" class="p-button-sm p-button-rounded" @click="visible = true" />

  <Dialog v-model:visible="visible" :style="{ width: '600px' }" class="p-fluid" header="Print">
    <SelectButton v-model="printOption" :options="printOptions" class="mb-3" optionLabel="label" optionValue="value" />

    <div class="p-field mb-3" v-if="$root.session.events.length > 1">
      <MultiSelect v-model="eventsToPrint" :options="$root.session.events" placeholder="Select Events to Print"
        optionLabel="name" :multiple="true" />
    </div>

    <template v-if="printOption == 'schedule'">
      <div class="mb-3">
        <Checkbox id="amount" v-model="hide.amounts" :binary="true" />
        <label for="amount" class="ms-2">Hide Amounts</label>
      </div>

      <div class="mb-3" v-if="!$root.session.is_template">
        <Checkbox id="dates" v-model="hide.dates" :binary="true" />
        <label for="dates" class="ms-2">Hide Dates</label>
      </div>
    </template>

    <template v-if="printOption == 'quantities'">
      <div class="p-field mb-3">
        <label>Numbers to be calculated, separated by comas</label>
        <InputText v-model.lazy="numbersString" />
      </div>
    </template>

    <template v-if="printOption == 'menu'">
      <div class="p-field mb-3">
        <label>Numbers to be calculated, separated by comas</label>
        <InputText v-model.lazy="numbersString" />
      </div>
      <div class="p-field mb-3">
        <label>"Leftovers" title translation</label>
        <InputText v-model="leftoversTitle" placeholder="Leftovers" />
      </div>
    </template>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false" />
      <Button label="Print" icon="pi pi-print" @click="print" />
    </template>
  </Dialog>

  <teleport to="#app">
    <ScheduleQuantities :events="eventsToPrint" v-if="showQuantities" :numbers="numbers" />
    <ScheduleMenu :events="eventsToPrint" v-if="showMenu" :numbers="numbers" :leftoversTitle="leftoversTitle" />
  </teleport>
</template>

<script>
import Checkbox from 'primevue/checkbox'
import MultiSelect from 'primevue/multiselect'
import SelectButton from 'primevue/selectbutton'
import ScheduleQuantities from './SessionScheduleQuantities.vue'
import ScheduleMenu from './SessionScheduleMenu.vue'

export default {
  components: {
    Checkbox,
    MultiSelect,
    ScheduleQuantities,
    ScheduleMenu,
    SelectButton,
  },
  data() {
    return {
      printOption: 'schedule',
      printOptions: [
        { value: 'schedule', label: 'Print Schedule' },
        { value: 'quantities', label: 'Print Quantities' },
        { value: 'menu', label: 'Print Menu' },
      ],
      visible: false,
      eventsToPrint: [],
      hide: {
        amounts: false,
        dates: true,
      },
      numbersString: '10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160',
      leftoversTitle: null
    }
  },
  created() {
    const value = window.localStorage.getItem('numbersString')
    if (value) this.numbersString = value
    const leftoversTitle = window.localStorage.getItem('leftoversTitle')
    if (leftoversTitle) this.leftoversTitle = leftoversTitle
  },
  mounted() {
    if (this.$root.session.events.length === 1) this.eventsToPrint = this.$root.session.events
  },
  computed: {
    showQuantities() {
      return this.visible && this.printOption === 'quantities'
    },
    showMenu() {
      return this.visible && this.printOption === 'menu'
    },
    numbers() {
      return this.numbersString.split(',').map((n) => Number(n))
    },
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

      let title = this.$root.session.name
      if (this.eventsToPrint.length > 1) title += ` (${this.eventsToPrint.map((e) => e.name).join(', ')})`
      title += ` - ${this.printOption.replace(/^\w/, (c) => c.toUpperCase())}`
      if (this.printOption == 'schedule' && this.hide.amounts) title += ' Without Amounts'
      this.$root.setPageTitle(title)

      window.print()
    },
    updatePageVisibility() {
      // Hide page-content so we can display the print pages
      const pageClass = document.querySelector('.page-full-content').classList
      if (this.showQuantities || this.showMenu) {
        pageClass.add('d-none')
      } else {
        pageClass.remove('d-none')
      }
    },
  },
  watch: {
    showQuantities() {
      this.updatePageVisibility()
    },
    showMenu() {
      this.updatePageVisibility()
    },
    numbersString() {
      window.localStorage.setItem('numbersString', this.numbersString)
    },
    printOption() {
      this.$root.setPrintMode(this.printOption === 'menu' ? 'portrait' : 'landscape')
    },
    leftoversTitle() {
      window.localStorage.setItem('leftoversTitle', this.leftoversTitle)
    }
  },
}
</script>
