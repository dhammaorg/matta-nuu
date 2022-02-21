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
        this.confirmOveride('A template with that name already exists, would you like to override it?', existingTemplate.id)
      } else {
        const newTemplate = this.sessionTemplate()
        delete newTemplate.id // ensure id is null
        this.dbCreate('sessions', newTemplate, () => { this.visible = false })
      }
    },
    overrideTemplate(e) {
      this.template.name = e.data.name
      this.confirmOveride('Are you sure to override this template?', e.data.id)
    },
    confirmOveride(message, templateId) {
      const newTemplate = this.sessionTemplate()
      newTemplate.id = templateId
      this.$confirm.require({
        message,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          this.dbUpdate('sessions', newTemplate, () => { this.visible = false })
        },
      })
    },
    // We encapsulate the eventTemplate inside a session in order to facilitate storage and usage
    sessionTemplate() {
      return {
        name: this.template.name,
        events: [this.template],
        rows: this.getEventRows(this.template),
        is_template: true,
      }
    },
    // When we save a template from a standard session where there are multiple events,
    // we filter the session rows associated with this particular event
    getEventRows(event) {
      const result = []
      const eventId = `Event${event.id}_`
      this.$root.session.rows.forEach((row) => {
        const values = {}
        let dayIndex = 0
        // filters values associated to this event
        Object.entries(row.values).forEach(([key, value]) => {
          if (key.includes(eventId)) {
            values[`Event1_${dayIndex}`] = value
            dayIndex += 1
          }
        })
        // If this row is used by the event (i.e. there is at least one value for this row in this event)
        if (Object.values(values).find((v) => Object.values(v).length > 0)) result.push({ ...row, ...{ values } })
      })
      return result
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
