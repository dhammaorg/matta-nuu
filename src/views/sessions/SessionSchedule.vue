<template>
  <DataTable :value="session.rows" dataKey="id" showGridlines v-if="session.events.length > 0"
             :scrollable="true" scrollHeight="flex"
             @rowReorder="session.rows = $event.value"
             editMode="cell" class="editable-cells-table" @cell-edit-complete="onCellEditComplete">
    <ColumnGroup type="header">
      <Row>
        <!-- Top Left Cell -->
        <Column class="top-left-cell transparent" frozen :rowspan="3" :colspan="2">
          <template #header>
            <div class="d-flex flex-column">
              <NewRowButton @add-row="addRow"/>
              <Button type="button" icon="pi pi-plus" label="Event" class="p-button-sm p-button-outlined"
                      @click="$refs.eventForm.show()" />
            </div>
          </template>
        </Column>
        <!-- Event Header -->
        <Column v-for="(event, index) in session.events" :colspan="event.days.length" :key="event.id"
                class="event-start event-end header-group event-editor">
          <template #header>
            <div class="d-flex align-items-center w-100">
              <span class="flex-grow-1 text-center">{{ event.name }}</span>
              <Button icon="pi pi-pencil" @click="$refs.eventForm.show(event)"
                      class="p-button-sm p-button-secondary p-button-text pe-0" />
              <Button icon="pi pi-trash" @click="session.events.splice(index, 1)"
                      class="p-button-sm p-button-danger p-button-text" />
              <Button icon="pi pi-plus" label="Day" class="p-button-sm p-button-secondary btn-add-day"
                      @click="event.days.push(event.days.length)"
                      :disabled="disableAddDayFor(event)" />
            </div>
          </template>
        </Column>
      </Row>
      <Row>
        <!-- Day Date Header -->
        <Column v-for="day in sessionDays" :key="`header-date-${day.id}`" :class="[day.class, 'day-date', {'p-0': dayHover == day.id}]">
          <template #header>
            <div @mouseover="dayHover = day.id" @mouseleave="dayHover = null" >
                <Button icon="pi pi-trash" class="p-button-danger p-button-text p-0"
                        v-if="dayHover == day.id && day.class.includes('event-end') && day.event.days.length > 1"
                        @click="day.event.days.pop()" />
                <span v-else>{{ day.dateHeader }}</span>
            </div>
          </template>
        </Column>
      </Row>
      <Row>
        <!-- Day Name Header -->
        <Column v-for="day in sessionDays" :key="`header-${day.id}`" :class="day.class" class="day-label">
          <template #header>
            <InputText :value="day.label" @change="day.event.days[day.index] = $event.target.value" class="day-input" />
          </template>
        </Column>
      </Row>
    </ColumnGroup>

    <Column :rowReorder="true" class="reorder-column" frozen />

    <!-- First Column : Row Type -->
    <Column frozen class="product-column">
      <template #body="{ data }">
        <span v-if="data.type == 'product'">
          {{ data.product }}
          <span v-if="data.unit">({{ data.unit }})</span>
        </span>
        <span v-else-if="data.type == 'recipie'">{{ data.recipie ? data.recipie.name : '' }}</span>
        <span v-else>{{ data.label }}</span>
        <Button icon="pi pi-trash" @click.prevent="deleteRow(data)"
                class="btn-on-hover p-button-small p-button-danger p-button-text" />
      </template>
      <template #editor="{ data }">
        <div v-if="data.type == 'product'" class="editor-sm">
          <InputProduct v-model="data.product" />
          <InputUnit v-model="data.unit" />
        </div>
        <InputRecipie v-else-if="data.type == 'recipie'" v-model="data.recipie" />
        <InputText    v-else v-model="data.label" placeholder="Row Name" />
      </template>
    </Column>

    <!-- Cells -->
    <Column v-for="day in sessionDays" :key="`cell-${day.id}`" :field="day.id"
            :class="day.class">
      <template #body="{ data, field }">
        <template v-if="data.values[field]" >
          <label v-if="data.type == 'products'">
            {{ data.values[field].product }}
            <span v-if="data.values[field].unit">({{ data.values[field].unit }})</span>
          </label>
          <label v-if="data.type == 'recipies' && data.values[field].recipie">
            {{ data.values[field].recipie.name }}
          </label>
          <div class="amount">{{ data.values[field].amount }}</div>
        </template>
      </template>
      <template #editor="{ data, field }">
        <div :class="{'editor-sm': ['products', 'recipies'].includes(data.type)}">
          <template v-if="data.type == 'products'">
            <InputProduct v-model="data.values[field].product" />
            <InputUnit v-model="data.values[field].unit" />
          </template>
          <InputRecipie v-else-if="data.type == 'recipies'" v-model="data.values[field].recipie" />
          <InputNumber v-model="data.values[field].amount" placeholder="Amount" autofocus />
        </div>
      </template>
    </Column>

  </DataTable>

  <EventForm ref="eventForm" @save="createOrUpdateEvent($event)"
             :disabled-dates="sessionDays.map(d => d.date)"
             :default-date="sessionDays.length > 1 ? sessionDays.at(-1).date.addDays(1) : null"/>
</template>

<script>
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import InputNumber from 'primevue/inputnumber'
import InputProduct from '@/components/InputProduct.vue'
import InputRecipie from '@/components/InputRecipie.vue'
import InputUnit from '@/components/InputUnit.vue'
import EventForm from './EventForm.vue'
import NewRowButton from './SessionNewRowButton.vue'

export default {
  inject: ['sessionDays'],
  components: {
    ColumnGroup, Row, InputProduct, InputRecipie, InputUnit, InputNumber, NewRowButton, EventForm,
  },
  data() {
    return {
      dayHover: null,
    }
  },
  mounted() {
    if (this.session.events.length === 0) this.$refs.eventForm.show()
  },
  computed: {
    session() {
      return this.$root.session
    },
  },
  methods: {
    disableAddDayFor(event) {
      const newDate = event.start_date.addDays(event.days.length)
      return this.sessionDays.find((day) => day.date.toDateString() === newDate.toDateString())
    },
    onCellEditComplete(event) {
      // When creating a recipie from the InputRecipie any click on a dropdown inside the dialog was
      // interpreted as a click to close the cell edit, so preventing it
      if (document.querySelector('.recipie-dialog')) {
        event.preventDefault()
        return
      }
      const { data, newData } = event
      data.label = newData.label
      data.product = newData.product
      data.unit = newData.unit
      data.recipie = newData.recipie
    },
    addRow(type) {
      const row = {
        id: this.newId(this.session.rows), type, label: '', values: {},
      }
      this.sessionDays.forEach((day) => { row.values[day.id] = {} })
      this.session.rows.push(row)
      this.$nextTick(() => {
        setTimeout(() => {
          const datatableDom = document.querySelector('.p-datatable-wrapper')
          datatableDom.scrollTo(0, datatableDom.scrollHeight)
          document.querySelector('.p-datatable-tbody tr:last-child td.product-column').click()
        }, 0)
      })
    },
    deleteRow(row) {
      this.session.rows = this.session.rows.filter((r) => r.id !== row.id)
    },
    createOrUpdateEvent(event) {
      const index = this.session.events.findIndex((e) => e.id === event.id)
      if (index > -1) {
        // update existing
        this.session.events[index] = event
      } else {
        // createNew
        this.session.events.push({ ...event, ...{ id: this.newId(this.session.events) } })
      }
      this.session.events.sort((a, b) => (a.start_date > b.start_date ? 1 : -1))
    },
    newId(values) {
      if (values.length === 0) return 1
      return Math.max(...values.map((r) => r.id)) + 1
    },
  },
}
</script>

<style lang="scss" scoped>
  ::v-deep th.top-left-cell {
    width: 249px;
    min-width: 249px !important;
    max-width: 249px !important;
  }
  ::v-deep th.event-editor {
    padding: .7rem 1rem !important;
    .p-button.p-button-sm.btn-add-day {
      padding: .45rem .6rem;
      border-radius: 4px;
      .p-button-icon {
        font-size: .7rem;
        line-height: 1.5;
        margin-right: 5px;
      }
    }
  }
</style>
