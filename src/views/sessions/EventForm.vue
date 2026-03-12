<template>
  <Dialog v-model:visible="visible" :style="{ width: '600px' }"
    :header="isNew ? 'Add an Event to the Session' : 'Edit Event'" :modal="true" class="p-fluid">
    <div class="p-field" v-if="isNew">
      <label v-if="template">Template</label>
      <Dropdown :options="$root.templatesArray" optionLabel="name" v-model="template"
        placeholder="Use a template (optional)" :filter="true" showClear filterPlaceholder="" class="w-100" />
    </div>

    <div class="p-field">
      <label v-if="event.name">Event Name</label>
      <InputText v-model.trim="event.name" required="true" placeholder="Name" autofocus />
    </div>

    <div class="p-field" v-if="!dayByDay">
      <label>Number of People</label>
      <InputNumber v-model="event.people_count" class="w-auto" @input="amountChanged = true" />
    </div>

    <div class="p-field-checkbox mt-3" v-if="!isNew && event.days && event.days.length">
      <Checkbox id="event-day-by-day" v-model="dayByDay" :binary="true" @change="onDayByDayChange" />
      <label for="event-day-by-day" class="ms-2">Manage number of people per day</label>
    </div>

    <div class="p-field-checkbox mt-3" v-if="!isNew"
      v-tooltip.top="'Example: if you change number of people from 20 to 40, amounts will be scaled by 2'">
      <Checkbox id="event-proportional-update" v-model="updateAmounts" :binary="true" />
      <label for="event-proportional-update" class="ms-2">Proportionally update amounts</label>
    </div>
    <small class="d-block text-muted mt-1 mb-3" v-if="dayByDay">Each day's quantities will be scaled by that day's
      factor
      only.</small>

    <template v-if="dayByDay && event.days && event.days.length">
      <div class="p-field" v-for="(dayLabel, dayIndex) in event.days" :key="dayIndex">
        <div class="p-inputgroup">
          <span class="p-inputgroup-addon">{{ dayLabel }}</span>
          <InputNumber v-model="event.people_count_by_day[dayIndex]" class="w-auto" @input="amountChanged = true" />
        </div>
      </div>
    </template>

    <div class="p-field mt-3" v-if="!isTemplate">
      <label>Start Date</label>
      <Calendar v-model="event.start_date" required="true" dateFormat="d MM yy" icon="pi pi-calendar"
        :disabledDates="disabledDates" />
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false" />
      <Button :label="isNew ? 'Add' : 'Save'" icon="pi pi-check" class="p-button-text" @click="save" />
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
      dayByDay: false,
      previousPeopleCountByDay: null,
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
      if (this.event.people_count_by_day && Object.keys(this.event.people_count_by_day).length > 0) {
        this.dayByDay = true
        this.event.people_count_by_day = { ...this.event.people_count_by_day }
        this.event.days.forEach((_, i) => {
          if (this.event.people_count_by_day[i] == null) {
            this.event.people_count_by_day[i] = this.event.people_count
          }
        })
        this.previousPeopleCountByDay = { ...this.event.people_count_by_day }
      } else {
        this.dayByDay = false
        this.previousPeopleCountByDay = null
      }
      this.previousPeopleCount = this.event.people_count
      if (!this.event.start_date) this.event.start_date = this.defaultDate
      this.visible = true
    },
    onDayByDayChange() {
      if (this.dayByDay && this.event.days) {
        if (!this.event.people_count_by_day) this.event.people_count_by_day = {}
        this.event.days.forEach((_, i) => {
          if (this.event.people_count_by_day[i] == null) {
            this.event.people_count_by_day[i] = this.event.people_count
          }
        })
        this.previousPeopleCountByDay = { ...this.event.people_count_by_day }
      } else {
        this.previousPeopleCountByDay = null
      }
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

        // Normalize when switching from day-by-day to single
        if (!this.dayByDay && this.event.people_count_by_day) {
          const firstVal = this.event.days && this.event.days.length
            ? (this.event.people_count_by_day[0] ?? this.event.people_count)
            : this.event.people_count
          this.event.people_count = firstVal
          delete this.event.people_count_by_day
        }

        // Proportionally update amounts
        if (this.updateAmounts) {
          const eventIdPrefix = `Event${this.event.id}_`
          if (this.dayByDay && this.event.people_count_by_day && this.previousPeopleCountByDay) {
            this.event.days.forEach((_, dayIndex) => {
              const prev = this.previousPeopleCountByDay[dayIndex]
              const next = this.event.people_count_by_day[dayIndex]
              if (prev != null && next != null && prev !== next) {
                const factor = next / prev
                const dayKey = `${eventIdPrefix}${dayIndex}`
                this.$root.session.rows.forEach((row) => {
                  const value = row.values[dayKey]
                  if (value && value.amount) {
                    let amount = Math.round(value.amount * factor)
                    if (amount > 80) amount = Math.round(amount / 10) * 10
                    else if (amount > 30) amount = Math.round(amount / 5) * 5
                    value.amount = amount
                  }
                })
              }
            })
          } else if (!this.dayByDay && this.previousPeopleCount && this.previousPeopleCount !== this.event.people_count) {
            const factor = this.event.people_count / this.previousPeopleCount
            this.$root.session.rows.forEach((row) => {
              Object.entries(row.values).forEach(([day, value]) => {
                if (day.startsWith(eventIdPrefix) && value.amount) {
                  let amount = Math.round(value.amount * factor)
                  if (amount > 80) amount = Math.round(amount / 10) * 10
                  else if (amount > 30) amount = Math.round(amount / 5) * 5
                  value.amount = amount
                }
              })
            })
          }
        }

        if (!this.event.days) this.event.days = ['Day 0']
        this.$emit('save', this.event)
        this.visible = false
        this.event = {}
        this.template = undefined
        this.updateAmounts = true
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

<style lang="scss" scoped></style>
