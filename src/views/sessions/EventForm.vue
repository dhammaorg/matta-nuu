<template>
  <Dialog v-model:visible="visible" :style="{width: '600px'}"
          :header="isNew ? 'Add an Event to the Session' : 'Edit Event'"
          :modal="true" class="p-fluid">
    <div class="p-field">
      <InputText v-model.trim="event.name" required="true" placeholder="Name" autofocus/>
    </div>

    <div class="p-field">
      <label>Number of People</label>
      <InputNumber v-model="event.people_count" />
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

export default {
  components: { Calendar, InputNumber },
  props: ['disabledDates', 'defaultDate'],
  data() {
    return {
      visible: false,
      event: {},
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
      if (!this.event.start_date) this.event.start_date = this.defaultDate
      this.visible = true
    },
    save() {
      if (this.event.name && this.event.start_date) {
        if (!this.event.days) this.event.days = ['0']
        this.$emit('save', this.event)
        this.visible = false
        this.event = {}
      }
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
