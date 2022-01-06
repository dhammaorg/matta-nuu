<template>
  <div class="submenu px-3 d-flex align-items-center">
    <TabMenu :model="items" class="flex-shrink-0"/>
    <div class="d-flex justify-content-center flex-grow-1">
      <Inplace :closable="true">
        <template #display>
          <h2 class="m-0 me-3" title="Edit">{{ session.name }}</h2>
        </template>
        <template #content>
          <InputText v-model="session.name" autoFocus />
        </template>
      </Inplace>

    </div>
    <Button type="button" icon="pi pi-undo" label="Undo" class="p-button-sm me-3"
            @click="undo" :disabled="history.length <= 1" v-if="history" />
    <Button icon="pi pi-save" label="Save" class="p-button-success"
            @click="save" :loading="saving" :disabled="!unsavedChanges" />
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
        { label: 'Schedule', icon: 'pi pi-calendar', to: { name: 'session_schedule', params: { id: this.$route.params.id } } },
        { label: 'Stocks', icon: 'pi pi-box', to: { name: 'session_stocks', params: { id: this.$route.params.id } } },
        { label: 'Suppliers', icon: 'pi pi-shopping-cart', to: { name: 'session_suppliers', params: { id: this.$route.params.id } } },
      ],
      saving: false,
      history: [],
      unsavedChanges: false,
    }
  },
  mounted() {
    window.onbeforeunload = () => {
      if (this.unsavedChangesWarning) return 'You have unsaved changes, are you sure to quit?'
    }
  },
  computed: {
    session() {
      return this.$root.session
    },
    unsavedChangesWarning() {
      return this.unsavedChanges && window.location.hostname !== 'localhost'
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
      this.unsavedChanges = false
    },
    undo() {
      // poping twice the history, cause last history value is the same as current value
      let lastSession = this.history.pop()
      lastSession = this.history.pop()
      lastSession.events.forEach((e) => { e.start_date = new Date(e.start_date) })
      this.$root.session = lastSession
    },
  },
  watch: {
    session: {
      deep: true,
      handler() {
        const sessionJson = JSON.stringify(this.session)
        // Check for fake change
        if (sessionJson !== JSON.stringify(this.history[this.history.length - 1]) && this.$root.isSessionFullyLoaded) {
          // Parse + stringify makes object deep copy
          const newValue = JSON.parse(sessionJson)
          if (this.history.length !== 0) this.unsavedChanges = true
          this.history.push(newValue)
        }
      },
    },
  },
}
</script>

<style lang='scss' scoped>
  $background-color: var(--indigo-500);
  $active-color: white;
  $inactive-color: var(--indigo-100);

  ::v-deep .p-tabmenu .p-tabmenu-nav {
    .p-tabmenuitem .p-menuitem-link {
      border-color: $background-color !important;
      padding-top: 1.5rem;
      background-color: transparent !important;
      color: $inactive-color !important;
      box-shadow: none !important;
      font-weight: normal;
    }
    background-color: transparent;
    .p-tabmenuitem.p-highlight .p-menuitem-link {
      border-color: $active-color !important;
      color: $active-color !important;
      font-weight: 700;
    }
    .p-tabmenuitem:hover .p-menuitem-link {
      color: $active-color !important;
    }
  }
  ::v-deep .p-inplace-display {
    display: flex;
  }
  ::v-deep .p-inplace .p-inplace-display:not(.p-disabled):hover {
    background: transparent;
  }
  .submenu {
    background-color: $background-color;
    h2 {
      color: var(--indigo-50) !important;
      font-size: 1.2rem;
      font-weight: normal;
    }
  }
</style>
