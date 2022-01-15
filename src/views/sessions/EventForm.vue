<template>
  <Dialog v-model:visible="visible" :style="{width: '600px'}"
          :header="isNew ? 'Add an Event to the Session' : 'Edit Event'"
          :modal="true" class="p-fluid">
    <div class="p-field">
      <InputText v-model.trim="event.name" required="true" placeholder="Name" autofocus/>
    </div>

    <div class="p-field" v-if="isNew">
      <Dropdown :options="$root.templatesArray" optionLabel="name" v-model="template"
                placeholder="Use a template (optional)" :filter="true" filterPlaceholder=""
                class="w-100" />
    </div>

    <div class="p-field">
      <label>Number of People</label>
      <div class="p-inputgroup">
        <InputNumber v-model="event.people_count" class="w-auto" />
        <span class="p-inputgroup-addon" v-if="!isNew && event.people_count"
              v-tooltip.top="'Example : if you change number of people from 20 to 40, all amounts will be multiplied by 2'">
          <Checkbox v-model="updateAmounts" :binary="true" />
          <label class="m-0 ms-2">Proportionally update amounts</label>
        </span>
      </div>
    </div>

    <div class="p-field">
      <label>Start Date</label>
      <Calendar v-model="event.start_date" required="true" dateFormat="d MM yy" icon="pi pi-calendar"
                :disabledDates="disabledDates" />
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false"/>
      <Button label="Save" icon="pi pi-check" class="p-button-text" @click="save" />
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
      template: {},
      event: {},
      updateAmounts: false,
      previousPeopleCount: null,
    }
  },
  computed: {
    isNew() {
      return this.event.id === undefined
    },
  },
  methods: {
    show(object = {}) {
      this.event = { ...object }
      this.previousPeopleCount = this.event.people_count
      if (!this.event.start_date) this.event.start_date = this.defaultDate
      this.visible = true
    },
    async save() {
      if (this.event.name && this.event.start_date) {
        if (this.isNew && this.template.id) {
          if (!this.template.rows) {
            const { data } = await this.$db.from('templates').select().match({ id: this.template.id }).single()
            this.$root.templates[this.template.id] = data
            this.template = data
          }
          this.event = { ...this.template, ...this.event }
          this.event.days = this.template.days
          this.event.templateRows = this.template.rows.map((row) => {
            const newRow = { ...row }
            newRow.values.forEach((v) => {
              v.amount = Math.round((v.amount * this.event.people_count) / this.template.people_count)
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
              if (day.includes(eventId) && value.amount) value.amount = Math.round(value.amount * factor)
            })
          })
        }

        if (!this.event.days) this.event.days = ['0']
        this.$emit('save', this.event)
        this.visible = false
        this.event = {}
        this.template = {}
        this.updateAmounts = false
      }
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
