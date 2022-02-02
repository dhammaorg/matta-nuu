<template>
  <HelpMessage>
    <strong>Schedule</strong> is where you organize the consumptions.
    <ol>
      <li>Adds <strong>Days</strong> to Event (hover the event name to display actions)</li>
      <li>Adds <strong>Rows</strong></li>
    </ol>
  </HelpMessage>

  <DataTable :value="session.rows" dataKey="id" showGridlines v-if="session.events.length > 0"
             :scrollable="true" scrollHeight="flex"
             @rowReorder="session.rows = $event.value"
             editMode="cell" class="editable-cells-table session-table" @cell-edit-complete="onCellEditComplete"
             :rowClass="rowClass">
    <ColumnGroup type="header">
      <Row>
        <!-- Top Left Cell -->
        <Column class="top-left-cell transparent hide-print" frozen :rowspan="3" :colspan="2">
          <template #header>
            <PrintButton />
            <div class="d-flex flex-column ms-4">
              <NewRowButton @add-row="addRow"/>
              <Button type="button" icon="pi pi-plus" label="Event" class="mt-2 p-button-sm p-button-outlined"
                      @click="$refs.eventForm.show()" />

            </div>
          </template>
        </Column>
        <!-- Event Header -->
        <Column v-for="(event, index) in session.events" :colspan="event.days.length" :key="event.id"
                class="event-start event-end header-group event-editor">
          <template #header>
            <div class="d-flex align-items-center w-100">
              <span class="flex-grow-1 text-center">
                {{ event.name }}
                <span v-if="event.people_count" class="fw-normal ms-2 xs d-inline-flex align-items-center">
                  {{ event.people_count }}
                  <span class="pi pi-users xs ms-1"></span>
                </span>
              </span>
              <span class="d-print-none btn-on-hover">
                <Button icon="pi pi-save" @click="$refs.saveTemplate.show(event)"
                        class="p-button-sm p-button-success p-button-text"
                        v-tooltip.top="'Save as template'" />
                <Button icon="pi pi-pencil" @click="$refs.eventForm.show(event)"
                        class="p-button-sm p-button-text" />
                <Button icon="pi pi-trash" @click="session.events.splice(index, 1)"
                        class="p-button-sm p-button-danger p-button-text" />
                <Button icon="pi pi-plus" label="Day" class="p-button-sm p-button-secondary btn-add-day"
                        @click="event.days.push(`Day ${event.days.length}`)"
                        :disabled="disableAddDayFor(event)" />
              </span>
            </div>
          </template>
        </Column>
      </Row>
      <Row>
        <!-- Day Date Header -->
        <Column v-for="day in sessionDays" :key="`header-date-${day.id}`" :class="[day.class, 'day-date']">
          <template #header>
            <span>{{ day.dateHeader }}</span>
            <div class="btn-on-hover w-100 justify-content-center">
              <Button icon="pi pi-trash" class="p-button-danger p-button-text p-0"
                      v-if="day.class.includes('event-end') && day.event.days.length > 1"
                      @click="day.event.days.pop()" />
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

    <Column :rowReorder="true" class="reorder-column d-print-none" frozen />

    <!-- First Column : Row Type -->
    <Column frozen class="product-column">
      <template #body="{ data }">
        <span v-if="data.type == 'product'">
          {{ $root.getProduct(data.product_id).name }}
          <span v-if="$root.getProduct(data.product_id).unit">({{ $root.getProduct(data.product_id).unit }})</span>
        </span>
        <span v-else-if="data.type == 'recipie'">{{ $root.getRecipie(data.recipie_id).name }}</span>
        <span v-else>{{ data.label }}</span>
        <span class="btn-on-hover d-print-none">
          <ToggleButton v-model="data.printable" onIcon="pi pi-print" offIcon="pi pi-print slash" @click.stop
                        title="Printable ?" class="p-button-sm"/>
          <Button icon="pi pi-trash" @click.prevent="deleteRow(data)"
                class=" p-button-small p-button-danger p-button-text" />
        </span>
      </template>
      <template #editor="{ data }">
        <InputProduct v-if="data.type == 'product'" v-model="data.product_id" class="editor-sm w-100" />
        <InputRecipie v-else-if="data.type == 'recipie'" v-model="data.recipie_id" />
        <InputText    v-else v-model="data.label" placeholder="Row Name" />
      </template>
    </Column>

    <!-- Cells -->
    <Column v-for="day in sessionDays" :key="`cell-${day.id}`" :field="day.id"
            :class="day.class">
      <template #body="{ data, field }">
        <template v-if="data.values[field]" >
          <label v-if="data.type == 'products'">
            {{ $root.getProduct(data.values[field].product_id).name }}
            <span v-if="$root.getProduct(data.values[field].product_id).unit">({{ $root.getProduct(data.values[field].product_id).unit }})</span>
          </label>
          <label v-if="data.type == 'recipies' && data.values[field].recipie_id">
            {{ $root.getRecipie(data.values[field].recipie_id).name }}
          </label>
          <div class="amount">{{ data.values[field].amount }}</div>
        </template>
      </template>
      <template #editor="{ data, field }">
        <div :class="{'editor-sm': ['products', 'recipies'].includes(data.type)}">
          <InputProduct v-if="data.type == 'products'" v-model="data.values[field].product_id" class="w-100" />
          <InputRecipie v-else-if="data.type == 'recipies'" v-model="data.values[field].recipie_id" />
          <div class="p-inputgroup">
            <InputNumber v-model="data.values[field].amount" placeholder="Amount" autofocus :maxFractionDigits="2" />
            <span class="p-inputgroup-addon rounded-0 p-0" v-show="data.values[field].product_id">
              {{ $root.getProduct(data.values[field].product_id).unit }}
            </span>
          </div>
        </div>
      </template>
    </Column>

  </DataTable>

  <EventForm ref="eventForm" @save="createOrUpdateEvent($event)"
             :disabled-dates="sessionDays.map(d => d.date)"
             :default-date="sessionDays.length > 1 ? sessionDays.at(-1).date.addDays(1) : null"/>

  <SaveTemplate ref="saveTemplate"/>

</template>

<script>
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import InputNumber from 'primevue/inputnumber'
import ToggleButton from 'primevue/togglebutton'
import InputProduct from '@/components/InputProduct.vue'
import InputRecipie from '@/components/InputRecipie.vue'
import EventForm from './EventForm.vue'
import NewRowButton from './SessionNewRowButton.vue'
import PrintButton from './SessionSchedulePrintButton.vue'
import SaveTemplate from '@/views/templates/SaveTemplateDialog.vue'

export default {
  inject: ['sessionDays'],
  components: {
    ColumnGroup,
    Row,
    InputProduct,
    InputRecipie,
    InputNumber,
    NewRowButton,
    EventForm,
    ToggleButton,
    PrintButton,
    SaveTemplate,
  },
  mounted() {
    if (this.session.events.length === 0) this.$refs.eventForm.show()
    this.$root.setPrintMode('landscape')
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
      // When creating an object from a modal any click on a dropdown inside the modal was
      // interpreted as a click to close the cell edit, so preventing it
      if (document.querySelector('.p-dialog')) {
        event.preventDefault()
        return
      }
      const { data, newData } = event
      data.label = newData.label
      data.product_id = newData.product_id
      data.recipie_id = newData.recipie_id
    },
    rowClass(data) {
      return data.printable ? null : 'd-print-none'
    },
    addRow(type) {
      const row = {
        id: this.newId(this.session.rows), type, label: '', values: {}, printable: true,
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
        const newEventId = this.newId(this.session.events)
        if (event.templateRows) {
          event.templateRows.forEach((templateRow) => {
            const existingRow = this.session.rows.find((r) => ['label', 'product', 'type', 'unit'].every((prop) => r[prop] === templateRow[prop]))
            if (existingRow) {
              templateRow.values.forEach((rowValue, rowIndex) => {
                existingRow.values[`Event${newEventId}_${rowIndex}`] = rowValue
              })
            } else {
              const values = {}
              templateRow.values.forEach((rowValue, rowIndex) => {
                values[`Event${newEventId}_${rowIndex}`] = rowValue
              })
              this.session.rows.push({ ...templateRow, ...{ id: this.newId(this.session.rows), values } })
            }
          })
          delete event.templateRows
        }
        this.session.events.push({ ...event, ...{ id: newEventId } })
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
    @media screen {
      // Reorder column width + product width
      width: 249px;
      min-width: 249px !important;
      max-width: 249px !important;
    }
    @media print {
      // Product width
      width: 200px;
      min-width: 200px !important;
      max-width: 200px !important;
    }
  }
  ::v-deep th.event-editor {
    padding: .7rem 1rem !important;
    .p-button.p-button-sm.btn-add-day {
      padding: 0.0rem 0.5rem;
      border-radius: 4px;
      height: 2rem;
      align-self: center;
      margin-right: .5rem;
      margin-left: .25rem;
      .p-button-icon {
        font-size: .7rem;
        line-height: 1.5;
        margin-right: 5px;
      }
    }
  }

  ::v-deep .pi.pi-print.slash {
    position: relative;
    color: var(--bluegray-300) !important;
    &:after {
      content: "";
      width: 20px;
      height: 2px;
      background-color: var(--bluegray-500);
      position: absolute;
      left: -4px;
      top: 45%;
      transform: rotate(45deg);
    }
  }

  @media print {
    .session-table.hide-amounts .amount {
      visibility: hidden;
    }
  }

  td, th {
    .btn-on-hover { display: none; }
    &:hover .btn-on-hover {
      display: flex;
      position: absolute;
      right: 0;
    }
    &:not(:hover) .d-hover { display: none; }
  }
  th .btn-on-hover {
    background-color: var(--bluegray-50);
  }
</style>
