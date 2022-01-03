<template>
  <div class="px-3 d-flex align-items-center">
    <div class="d-flex align-items-center flex-grow-1">
      <Inplace :closable="true">
        <template #display>
          <h1 class="me-3" title="Edit">{{ session.name }}</h1>
        </template>
        <template #content>
          <InputText v-model="session.name" autoFocus />
        </template>
      </Inplace>
      <TabMenu :model="items"/>
    </div>
    <Button type="button" icon="pi pi-undo" label="Undo" class="p-button-sm me-3"
            @click="undo" :disabled="history.length <= 1" v-if="history" />
    <Button icon="pi pi-save" label="Save" class="p-button-success"
            @click="save" :loading="saving" />
  </div>
</template>

<script>
import TabMenu from 'primevue/tabmenu'
import Inplace from 'primevue/inplace'

export default {
  components: { TabMenu, Inplace },
  data() {
    return {
      items: [
        { label: 'Consumption', icon: 'pi pi-calendar', to: { name: 'session_consumption', params: { id: this.$route.params.id } } },
        { label: 'Stocks', icon: 'pi pi-box', to: { name: 'session_stocks', params: { id: this.$route.params.id } } },
      ],
      saving: false,
      history: [],
    }
  },
  computed: {
    session() {
      return this.$root.session
    },
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
  },
  methods: {
    async save() {
      this.saving = true
      const sessionToSave = { ...this.session }
      delete sessionToSave.fullyLoaded
      const { error } = await this.$db.from('sessions')
        .update(sessionToSave)
        .match({ id: this.$route.params.id })

      if (error) this.toastError(error)
      this.saving = false
    },
    undo() {
      // poping twice the history, cause last history value is the same as current value
      let lastSession = this.history.pop()
      lastSession = this.history.pop()
      lastSession.events.forEach((e) => { e.start_date = new Date(e.start_date) })
      this.$root.session = lastSession
    },
  },
}
</script>

<style lang='scss' scoped>
  ::v-deep .p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link {
    border: none;
  }
  ::v-deep .p-inplace-display {
    display: flex;
  }
  ::v-deep .p-inplace .p-inplace-display:not(.p-disabled):hover {
    background: transparent;
  }
  h1 {
    margin: 0;
  }
</style>
