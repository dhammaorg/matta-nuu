<template>
  <Dialog v-model:visible="visible" :style="{ width: '600px' }"
          :header="isNew ? 'Add an Event to the Session' : 'Edit Event'"
          :modal="true" class="p-fluid">
    <div class="p-field" v-if="isNew">
      <label v-if="template">Template</label>
      <Dropdown :options="$root.templatesArray" optionLabel="name" v-model="template"
                placeholder="Use a template (optional)" :filter="true" showClear
                filterPlaceholder=""
                class="w-100" />
    </div>

    <div class="p-field">
      <label v-if="event.name">Event Name</label>
      <InputText v-model.trim="event.name" required="true" placeholder="Name" autofocus />
    </div>

    <div class="p-field">
      <label>Number of People</label>
      <div class="p-inputgroup">
        <InputNumber v-model="event.people_count" class="w-auto" @input="amountChanged = true" />
        <span class="p-inputgroup-addon" v-if="!isNew && event.people_count && amountChanged"
              v-tooltip.top="'Example : if you change number of people from 20 to 40, all amounts will be multiplied by 2'">
          <Checkbox v-model="updateAmounts" :binary="true" />
          <label class="m-0 ms-2">Proportionally update amounts</label>
        </span>
      </div>
    </div>

    <div class="p-field" v-if="!isTemplate">
      <label>Start Date</label>
      <Calendar v-model="event.start_date" required="true" dateFormat="d MM yy" icon="pi pi-calendar"
                :disabledDates="disabledDates" />
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false" />
      <Button label="Add" icon="pi pi-check" class="p-button-text" @click="save" />
    </template>
  </Dialog>
</template>

<script>
import Calendar from 'primevue/calendar'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'

export default {
  components: { Calendar, InputNumber, Checkbox },
  props: ['disabledDates', 'defaultDate'],
  data() {
    return {
      visible: false,
      isTemplate: false,
      template: undefined,
      event: {},
      updateAmounts: true,
      amountChanged: false,
      previousPeopleCount: null,
    }
  },
  computed: {
    isNew() {
      return this.event.id === undefined
    },
  },
  methods: {
    show(object = {}, isTemplate = false) {
      this.isTemplate = isTemplate
      this.amountChanged = false
      this.event = { ...object }
      this.previousPeopleCount = this.event.people_count
      if (!this.event.start_date) this.event.start_date = this.defaultDate
      this.visible = true
    },
    async save() {
      if (this.event.name && this.event.start_date) {
        // Fill new event with chosen template
        if (this.isNew && this.template) {
          this.template = await this.$root.fetchSession(this.template.id)
          const eventTemplate = { ...this.template.events.at(0) }
          this.event = { ...eventTemplate, ...this.event, ...{ id: null } }
          this.event.days = [...eventTemplate.days]
          this.event.templateRows = this.template.rows.map((row) => {
            const newRow = { ...row, values: {} }
            Object.entries(row.values).forEach(([day, v]) => {
              const newValue = Math.round((v.amount * this.event.people_count) / eventTemplate.people_count) || null
              newRow.values[day] = { ...v, ...{ amount: newValue } }
            })
            return newRow
          })
        }

        // Proprtionally update amounts
        if (this.updateAmounts && this.previousPeopleCount && this.previousPeopleCount !== this.event.people_count) {
          const eventId = `Event${this.event.id}_`
          const factor = this.event.people_count / this.previousPeopleCount
          this.$root.session.rows.forEach((row) => {
            Object.entries(row.values).forEach(([day, value]) => {
              if (day.includes(eventId) && value.amount) {
                let amount = Math.round(value.amount * factor)
                if (amount > 80) amount = Math.round(amount / 10) * 10
                else if (amount > 30) amount = Math.round(amount / 5) * 5
                value.amount = amount
              }
            })
          })
        }

        if (!this.event.days) this.event.days = ['Day 0']
        this.$emit('save', this.event)
        this.visible = false
        this.event = {}
        this.template = undefined
        this.updateAmounts = false
      }
    },
  },
  watch: {
    // Prefill event name and people_count from event template
    template() {
      if (this.template && this.template.events) {
        const eventTemplate = this.template.events[0]
        this.event.name ||= eventTemplate.name
        this.event.people_count ||= eventTemplate.people_count
      }
    },
  },
}
</script>

<style lang='scss' scoped></style>
