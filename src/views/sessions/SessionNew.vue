<template>
  <Dialog v-model:visible="visible" :style="{ width: '600px' }"
    :header="`New ${session.is_template ? 'Template' : 'Session'}`" :modal="true" class="p-fluid">

    <div class="p-field">
      <InputText id="name" v-model.trim="session.name" required="true" placeholder="Name" autofocus />
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false" />
      <Button label="Save" icon="pi pi-check" :loading="loading" class="p-button-text" @click="save" />
    </template>
  </Dialog>
</template>

<script>

export default {
  data() {
    return {
      visible: false,
      session: {},
      loading: false,
    }
  },
  methods: {
    open(session = {}) {
      this.session = session
      this.visible = true
    },
    async save() {
      if (this.session.name) {
        if (this.session.is_template) {
          // create event with same name
          this.session.events = [{
            id: 1, name: this.session.name, days: ['Day 0', 'Day 1'], people_count: 10,
          }]
        }
        this.dbCreate('sessions', this.session, (session) => {
          this.visible = false
          this.$router.push({ name: 'session_schedule', params: { id: session.id } })
          this.session = {}
        })
      }
    },
  },
}
</script>
