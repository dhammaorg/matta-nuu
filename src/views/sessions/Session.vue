<template>
  <div class="px-3 d-flex align-items-center">
    <h1 class="me-3 flex-grow-1">{{ session.name }}</h1>
    <Button type="button" icon="pi pi-plus" label="Event" class="p-button-sm me-3"
            @click="$refs.eventForm.show()" />
    <Button type="button" icon="pi pi-undo" label="Undo" class="p-button-sm me-3"
            @click="undo()" :disabled="history.length <= 1" />
    <Button icon="pi pi-save" :loading="saving" label="Save" class="p-button-success" @click="save()" />
  </div>

  <div style="height: calc(100vh - 9rem)" v-if="events.length > 0">
    <DataTable :value="rows" dataKey="id" showGridlines
              :scrollable="true" scrollHeight="flex"
              @rowReorder="session.rows = $event.value"
              editMode="cell" class="editable-cells-table" @cell-edit-complete="onCellEditComplete">
      <ColumnGroup type="header">
        <Row>
          <Column class="top-left-cell" frozen :rowspan="3" :colspan="2">
            <template #header>
              <div class="d-flex flex-column">
                <Button type="button" icon="pi pi-plus" class="mb-2 p-button-sm" label="Row"
                        @click="$refs.addRowMenu.toggle($event)" />
                <TieredMenu ref="addRowMenu" :model="rowTypes" :popup="true" />
              </div>
            </template>
          </Column>
          <Column v-for="(event, index) in events" :colspan="event.days.length" :key="event.id"
                  class="event-start event-end">
            <template #header>
              <div class="d-flex align-items-center w-100">
                <span style="flex: 1 auto">{{ event.name }}</span>
                <Button icon="pi pi-pencil" @click="$refs.eventForm.show(event)"
                        class="p-button-small p-button-primary p-button-text" />
                <Button icon="pi pi-trash" @click="events.splice(index, 1)"
                        class="p-button-small p-button-danger p-button-text" />
                <Button icon="pi pi-plus" label="Day" class="p-button-sm"
                        @click="event.days.push('New Day')"
                        :disabled="disableAddDayFor(event)" />
              </div>
            </template>
          </Column>
        </Row>
        <Row>
          <Column v-for="day in allDays" :key="`header-date-${day.id}`" :class="[day.class, {'p-0': dayHover == day.id}]">
            <template #header>
              <div @mouseover="dayHover = day.id" @mouseleave="dayHover = null" >
                  <Button icon="pi pi-trash" v-if="dayHover == day.id && day.class.includes('event-end')"
                          class="p-button-small p-button-danger p-button-text"
                          @click="day.event.days.pop()" />
                  <span v-else>{{ day.date.toLocaleDateString([], { weekday: 'short', month: "numeric", day: 'numeric' }) }}</span>
              </div>
            </template>
          </Column>
        </Row>
        <Row>
          <Column v-for="day in allDays" :key="`header-${day.id}`" :class="day.class">
            <template #header>
              <InputText v-model="day.label" class="day-input" />
            </template>
          </Column>
        </Row>
      </ColumnGroup>

      <Column :rowReorder="true" class="reorder-column" frozen />

      <!-- First Column : Row Type -->
      <Column frozen class="first-column">
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
          <template v-if="data.type == 'product'">
            <InputProduct v-model="data.product" />
            <InputUnit v-model="data.unit" />
          </template>
          <InputRecipie v-else-if="data.type == 'recipie'" v-model="data.recipie" />
          <InputText    v-else v-model="data.label" placeholder="Row Name" />
        </template>
      </Column>

      <!-- Cells -->
      <Column v-for="day in allDays" :key="`cell-${day.id}`" :field="day.id"
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
          <template v-if="data.type == 'products'">
            <InputProduct v-model="data.values[field].product" />
            <InputUnit v-model="data.values[field].unit" />
          </template>
          <InputRecipie v-else-if="data.type == 'recipies'" v-model="data.values[field].recipie" />
          <InputNumber v-model="data.values[field].amount" inputClass="text-center"
                       placeholder="Amount" autofocus />
        </template>
      </Column>

    </DataTable>
  </div>

  <EventForm ref="eventForm" @save="createOrUpdateEvent($event)"
             :disabled-dates="allDays.map(d => d.date)"
             :default-date="allDays.length > 1 ? allDays.at(-1).date.addDays(1) : null"/>
</template>

<script>
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import InputNumber from 'primevue/inputnumber'
import TieredMenu from 'primevue/tieredmenu'
import InputProduct from '@/components/InputProduct.vue'
import InputRecipie from '@/components/InputRecipie.vue'
import InputUnit from '@/components/InputUnit.vue'
import EventForm from './EventForm.vue'

export default {
  components: {
    ColumnGroup, Row, InputProduct, InputRecipie, InputUnit, InputNumber, TieredMenu, EventForm,
  },
  data() {
    return {
      saving: false,
      history: [],
      session: {},
      rowTypes: [
        {
          id: 'product', label: 'Single Product Row', command: () => { this.addRow('product') },
        },
        {
          id: 'products', label: 'Variable Products Row', command: () => { this.addRow('products') },
        },
        {
          id: 'recipie', label: 'Single Recipie Row', command: () => { this.addRow('recipie') },
        },
        {
          id: 'recipies', label: 'Variable Recipies Row', command: () => { this.addRow('recipies') },
        },
      ],
      dayHover: null,
    }
  },
  computed: {
    events() {
      return this.session.events || []
    },
    rows() {
      return this.session.rows || []
    },
    allDays() {
      const days = []
      this.events.forEach((event) => {
        event.days.forEach((day, index) => {
          const classes = []
          if (index === 0) classes.push('event-start')
          if (index === (event.days.length - 1)) classes.push('event-end')
          const date = event.start_date.addDays(index)
          days.push({
            id: date.toDateString(), label: day, event, date, class: classes.join(' '),
          })
        })
      })
      return days
    },
  },
  async mounted() {
    const { data } = await this.$db.from('sessions').select().match({ id: this.$route.params.id }).single()
    data.events ||= []
    data.events.forEach((e) => { e.start_date = new Date(e.start_date) })
    data.rows ||= []
    this.session = data
    this.initDaysValuesForEachRow()
    if (this.events.length === 0) this.$refs.eventForm.show()
  },
  watch: {
    session: {
      deep: true,
      handler() {
        const sessionJson = JSON.stringify(this.session)
        // Check for fake change
        if (sessionJson !== JSON.stringify(this.history[this.history.length - 1])) {
          // Parse + stringify makes object deep copy
          const newValue = JSON.parse(sessionJson)
          this.history.push(newValue)
        }
      },
    },
    allDays: {
      deep: true,
      handler() { this.initDaysValuesForEachRow() },
    },
  },
  methods: {
    async save() {
      this.saving = true
      const { error } = await this.$db.from('sessions')
        .update(this.session)
        .match({ id: this.$route.params.id })

      if (error) this.toastError(error)
      this.saving = false
    },
    undo() {
      // poping twice the history, cause last history value is the same as current value
      let lastSession = this.history.pop()
      lastSession = this.history.pop()
      lastSession.events.forEach((e) => { e.start_date = new Date(e.start_date) })
      this.session = lastSession
    },
    disableAddDayFor(event) {
      const newDate = event.start_date.addDays(event.days.length)
      return this.allDays.find((day) => day.date.toDateString() === newDate.toDateString())
    },
    initDaysValuesForEachRow() {
      this.allDays.forEach((day) => {
        this.rows.forEach((row) => {
          if (!row.values[day.id]) row.values[day.id] = {}
        })
      })
    },
    onCellEditComplete(event) {
      const { data, newData } = event
      data.label = newData.label
      data.product = newData.product
      data.unit = newData.unit
      data.recipie = newData.recipie
    },
    addRow(type) {
      const row = {
        id: this.newId(this.rows), type, label: '', values: {},
      }
      this.allDays.forEach((day) => { row.values[day.id] = {} })
      this.session.rows.push(row)
      this.$nextTick(() => {
        setTimeout(() => {
          const datatableDom = document.querySelector('.p-datatable-wrapper')
          datatableDom.scrollTo(0, datatableDom.scrollHeight)
          document.querySelector('.p-datatable-tbody tr:last-child td.first-column').click()
        }, 0)
      })
    },
    deleteRow(row) {
      this.session.rows = this.session.rows.filter((r) => r.id !== row.id)
    },
    newId(values) {
      if (values.length === 0) return 1
      return Math.max(...values.map((r) => r.id)) + 1
    },
    createOrUpdateEvent(event) {
      const index = this.events.findIndex((e) => e.id === event.id)
      if (index > -1) {
        // update existing
        this.events[index] = event
      } else {
        // createNew
        this.events.push({ ...event, ...{ id: this.newId(this.events) } })
      }
      this.events.sort((a, b) => (a.start_date > b.start_date ? 1 : -1))
    },
  },
}
</script>

<style lang="scss">
  .event-end:not(:last-child) {
    border-right-color: var(--text-color-secondary) !important;
  }
  .first-column {
    width: 200px;
    min-width: 200px !important;
    max-width: 200px !important;
    justify-content: flex-start !important;
  }
  td.first-column {
    background-color: var(--text-color-secondary) !important;
    color: white;
    font-weight: bold;
  }
  td.reorder-column {
    width: 50px;
    min-width: 50px !important;
    max-width: 50px !important;
    padding: 0 !important;
    .p-datatable-reorderablerow-handle {
      padding: 1rem;
      cursor: move;
    }
  }
  th.top-left-cell {
    background-color: var(--surface-0) !important;
    width: 249px;
    min-width: 249px !important;
    max-width: 249px !important;
  }
  td.p-editable-column {
    flex-wrap: wrap;
    &:not(.first-column) {
      flex-basis: 100px !important;
      flex-grow: 1 !important;
    }
    input, select, .p-dropdown {
      border-radius: 0 !important;
    }
  }
  td, th {
    min-width: 130px !important;
    justify-content: center;
    position: relative;

    label {
      width: 100%;
      text-align: center;
      font-weight: bold;
      font-size: .8rem;
      margin-bottom: 5px;
    }
    .amount {
      font-size: 1.2rem;
    }

    .btn-on-hover { display: none; }
    &:hover .btn-on-hover {
      display: block;
      position: absolute;
      right: 0;
    }
  }
  .p-datatable .p-column-header-content {
    justify-content: center;
  }
  .day-input {
    width: auto;
    min-width: 0;
    background-color: transparent !important;
    border: none !important;
    padding: 0 !important;
    outline: none !important;
    box-shadow: none !important;
    text-align: center;
  }
</style>
