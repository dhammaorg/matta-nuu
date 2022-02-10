<template>
  <Dialog v-model:visible="visible" :style="{width: '600px'}"
          header="Create Event Template" :modal="true" class="p-fluid">

    <div class="p-field">
      <InputText v-model="template.name" placeholder="Template Name"/>
    </div>

    <div class="p-field d-flex">
      <div class="p-inputgroup">
        <span class="p-inputgroup-addon">For</span>
        <InputText v-model="template.people_count" class="text-center" />
        <span class="p-inputgroup-addon">people</span>
      </div>

      <Button label="Create Template" @click="save" class="ms-3"/>
    </div>

    <hr>

    <DataTable :value="$root.templatesArray" dataKey="id" class="table-clickable mt-3"
               :paginator="$root.templatesArray.length > 10" :rows="10"
               v-if="$root.templatesArray.length > 0"
               @row-click="overrideTemplate($event)">
      <Column field="name" header="Or override existing template" />
    </Datatable>
  </Dialog>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      template: {},
    }
  },
  methods: {
    show(event = {}) {
      this.template = { ...event }
      this.visible = true
    },
    save() {
      const existingTemplate = this.$root.templatesArray.find((t) => t.name == this.template.name)
      if (existingTemplate) {
        this.template.id = existingTemplate.id
        this.confirmOveride('A template with that name already exists, would you like to override it?')
      } else {
        delete this.template.id // ensure id is null
        this.dbCreate('sessions', this.template, () => { this.visible = false })
      }
    },
    overrideTemplate(e) {
      this.template.id = e.data.id
      this.template.name = e.data.name
      this.confirmOveride('Are you sure to override this template?')
    },
    confirmOveride(message) {
      this.$confirm.require({
        message,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          // We encapsulate the eventTemplate inside a session in order to facilitate storage and usage
          const sessionTemplate = {
            name: this.template.name,
            events: [this.template],
            rows: this.getEventRows(this.template),
          }
          this.dbUpdate('sessions', sessionTemplate, () => { this.visible = false })
        },
      })
    },
    // When we save a template from a standard session where there are multiple events,
    // we filter the session rows associated with this particular event
    getEventRows(event) {
      const result = []
      const eventId = `Event${event.id}_`
      this.$root.session.rows.forEach((row) => {
        const values = []
        // filters values associated to this event
        Object.entries(row.values).forEach(([key, value]) => {
          if (key.includes(eventId)) values.push(value)
        })
        // If this row is used by the event (i.e. there is at least on value for this row in this event)
        if (values.find((v) => Object.values(v).length > 0)) result.push({ ...row, ...{ values } })
      })
      return result
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
