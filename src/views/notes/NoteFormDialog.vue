<template>
  <Dialog v-model:visible="visible" :style="{width: '600px'}"
          :header="note.id ? 'Update Note' : 'Add Note'"
          :modal="true" class="p-fluid recipie-dialog">

    <div class="p-field">
      <Calendar v-model="note.date" required="true" dateFormat="d MM yy" icon="pi pi-calendar" placeholder="Date"/>
    </div>

    <div class="p-field">
      <InputText id="name" v-model.trim="note.title" required="true" placeholder="Title" autofocus/>
    </div>

    <div class="p-field">
      <Textarea v-model="note.content" :autoResize="true" rows="4" placeholder="Content" class="w-100 mb-3"/>
    </div>

    <template #footer>
      <Button label="Delete" icon="pi pi-trash" class="p-button-text p-button-danger float-start" :loading="loading" @click="destroy" />

      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false"/>
      <Button label="Save" icon="pi pi-check" class="p-button" :loading="loading" @click="save" />
    </template>
  </Dialog>
</template>

<script>

import Textarea from 'primevue/textarea'
import Calendar from 'primevue/calendar'

export default {
  components: {
    Textarea, Calendar,
  },
  data() {
    return {
      visible: false,
      loading: false,
      note: {},
    }
  },
  methods: {
    show(object = {}) {
      this.note = { ...object, ...{ session_id: this.$root.session.id } }
      this.visible = true
    },
    async save() {
      if (this.note.title) {
        if (this.note.id) {
          this.dbUpdate('notes', this.note)
        } else {
          const newNote = await this.dbCreate('notes', this.note)
          this.$emit('created', newNote)
        }

        this.visible = false
        this.note = {}
      }
    },
    destroy() {
      this.$confirm.require({
        message: 'Are you sure you want to delete this note ?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          this.dbDestroy('notes', this.note)
          this.visible = false
          this.note = {}
        },
      })
    },
  },
}
</script>

<style lang="scss">
</style>
