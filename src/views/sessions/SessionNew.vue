<template>
  <Dialog v-model:visible="visible" :style="{width: '600px'}" header="New Session"
          :modal="true" class="p-fluid">

    <div class="p-field">
      <InputText id="name" v-model.trim="session.name" required="true" placeholder="Name" autofocus/>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false"/>
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
    open() {
      this.session = {}
      this.visible = true
    },
    async save() {
      if (this.session.name) {
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
