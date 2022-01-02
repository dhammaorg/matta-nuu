<template>
  <Dialog v-model:visible="visible" :style="{width: '600px'}" header="Event"
          :modal="true" class="p-fluid">
    <div class="p-field">
      <InputText v-model.trim="event.name" required="true" placeholder="Name" autofocus/>
    </div>

    <div class="p-field">
      <label>Start Date</label>
      <Calendar v-model="event.start_date" required="true" dateFormat="d MM yy" :disabledDates="[]" />
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false"/>
      <Button label="Save" icon="pi pi-check" class="p-button-text" @click="save" />
    </template>
  </Dialog>
</template>

<script>
import Calendar from 'primevue/calendar'

export default {
  components: { Calendar },
  data() {
    return {
      visible: false,
      event: {},
    }
  },
  methods: {
    show(object = {}) {
      this.event = { ...object }
      this.visible = true
    },
    save() {
      if (this.event.name.trim()) {
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
