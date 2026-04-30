<template>
  <div class="submenu px-3 d-flex align-items-center d-print-none overflow-auto flex-shrink-0">
    <h2 v-if="session.is_template" class="flex-grow-1 py-2">Event Template</h2>
    <template v-else>
      <div class="session-context d-flex align-items-center flex-shrink-0">
        <Button type="button" label="Switch" icon="pi pi-arrow-right-arrow-left" iconPos="left"
          class="session-switch-trigger p-button-outlined p-button-sm me-3 flex-shrink-0"
          :loading="isSessionSwitching" :disabled="isSessionSwitching"
          @click="openSessionSwitchPanel($event)" />
        <Inplace :closable="true">
          <template #display>
            <h2 class="m-0" title="Edit Name">
              {{ session.name }}
              <span class="ms-2 pi pi-pencil xs"></span>
            </h2>
          </template>
          <template #content>
            <InputText v-model="session.name" autoFocus />
          </template>
        </Inplace>

        <Button type="button" :icon="isSessionStarred(session) ? 'pi pi-star-fill' : 'pi pi-star'"
          class="session-star-toggle p-button-text ms-2 pb-2 p-button-sm flex-shrink-0"
          :class="{ 'is-starred': isSessionStarred(session) }"
          v-tooltip.top="isSessionStarred(session) ? 'Remove star' : 'Star session'"
          @click.stop="toggleSessionStarred(session)" />

        <OverlayPanel ref="sessionPanel" appendTo="body" class="session-switch-overlay" @show="onSessionSwitchShow">
          <div class="session-switch-panel-inner">
            <Listbox v-model="switchPanelSelection" :options="sortedSessionSwitchOptions" optionLabel="name"
              dataKey="id" filter filterPlaceholder="Search by name…" emptyFilterMessage="No sessions match."
              emptyMessage="No sessions yet." listStyle="max-height: 240px" class="w-100 session-switch-listbox mb-2"
              @change="onSessionListboxChange">
              <template #option="{ option }">
                <div class="d-flex align-items-center w-100 gap-3">
                  <i v-if="option.starred === true" class="pi pi-star-fill text-warning flex-shrink-0"
                    title="Starred session" aria-label="Starred session" style="font-size: .85rem;" />
                  <span class="text-truncate">{{ option.name }}</span>
                  <i v-if="Number($route.params.id) === Number(option.id)" class="pi pi-check text-primary ms-auto"
                    aria-hidden="true" />
                </div>
              </template>
            </Listbox>
            <Button type="button" label="New session"
              class="p-button-secondary p-button-sm w-100 justify-content-start mt-2"
              @click="openNewSessionFromSwitcher" />
            <Button type="button" label="Manage all sessions"
              class="mt-2 p-button-sm p-button-primary w-100 justify-content-start" @click="goSessionsIndex()" />
          </div>
        </OverlayPanel>
      </div>
      <div class="flex-grow-1 flex-shrink-0 text-center">
        <TabMenu :model="tabMenuItems" :activeIndex="activeTabIndex" class="d-flex justify-content-center" />
      </div>
    </template>

    <div class="d-flex flex-shrink-0" style="min-width: 160px;">
      <template v-if="['session_orders', 'session_order'].includes($route.name)">
        <Button label="New Order" icon="pi pi-plus" class="btn-new-order p-button-outlined p-button-sm"
          @click="$refs.orderForm.show()" style="margin-left: 4.5rem" />
      </template>
      <template v-else-if="['session_schedule', 'session_stocks'].includes($route.name)">
        <Button type="button" icon="pi pi-undo" label="Undo" class="p-button-sm me-2" @click="undo"
          :disabled="history.length <= 1" v-if="history" />
        <Button icon="pi pi-save" label="Save" class="p-button-success" @click="save" :loading="saving"
          :disabled="!unsavedChanges" />
      </template>
    </div>

    <OrderNewDialog ref="orderForm" :days="sessionDays" />
    <SessionNew ref="sessionNewModal" />
  </div>
</template>

<script>
import TabMenu from 'primevue/tabmenu'
import Inplace from 'primevue/inplace'
import OverlayPanel from 'primevue/overlaypanel'
import Listbox from 'primevue/listbox'
import OrderNewDialog from './OrderNewDialog.vue'
import SessionNew from './SessionNew.vue'

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function areSnapshotsEqual(left, right) {
  if (left === right) return true
  if (left instanceof Date && right instanceof Date) return left.getTime() === right.getTime()
  if (left == null || right == null) return left === right
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false
    return left.every((item, index) => areSnapshotsEqual(item, right[index]))
  }
  if (!isPlainObject(left) || !isPlainObject(right)) return left === right
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  if (leftKeys.length !== rightKeys.length) return false
  return leftKeys.every((key) => areSnapshotsEqual(left[key], right[key]))
}

const SESSION_TAB_ROUTE_NAMES = [
  'session_overview',
  'session_schedule',
  'session_inventories',
  'session_stocks',
  'session_orders',
]

function normalizeSessionTabRouteName(routeName) {
  if (SESSION_TAB_ROUTE_NAMES.includes(routeName)) return routeName
  if (routeName === 'session_order') return 'session_orders'
  if (routeName === 'session_inventory') return 'session_inventories'
  return 'session_overview'
}

export default {
  inject: ['sessionDays'],
  components: {
    TabMenu, Inplace, OrderNewDialog, OverlayPanel, Listbox, SessionNew,
  },
  data() {
    return {
      saving: false,
      history: [],
      historyRecordTimeout: null,
      pendingTabRouteName: null,
      unsavedChanges: false,
      switchPanelSelection: null,
    }
  },
  mounted() {
    window.onbeforeunload = () => {
      this.flushPendingHistoryRecord()
      if (this.unsavedChangesWarning) return 'You have unsaved changes, are you sure to quit?'
    }
    window.addEventListener('keydown', (e) => {
      if (e.keyCode === 90 && e.ctrlKey) this.undo()
      if (e.keyCode === 83 && e.ctrlKey) {
        e.preventDefault()
        e.stopPropagation()
        this.save()
      }
    })
  },
  beforeUnmount() {
    this.clearPendingHistoryRecord()
  },
  computed: {
    session() {
      return this.$root.session
    },
    tabMenuItems() {
      const id = this.$route.params.id
      return [
        { label: 'Overview', icon: 'pi pi-compass', command: () => this.navigateToTab('session_overview', id) },
        { label: 'Schedule', icon: 'pi pi-calendar', command: () => this.navigateToTab('session_schedule', id) },
        { label: 'Inventories', icon: 'pi pi-file-edit', command: () => this.navigateToTab('session_inventories', id) },
        { label: 'Stocks', icon: 'pi pi-box', command: () => this.navigateToTab('session_stocks', id) },
        { label: 'Orders', icon: 'pi pi-dollar', command: () => this.navigateToTab('session_orders', id) },
      ]
    },
    activeTabRouteName() {
      return normalizeSessionTabRouteName(this.pendingTabRouteName || this.$route.name)
    },
    activeTabIndex() {
      return SESSION_TAB_ROUTE_NAMES.indexOf(this.activeTabRouteName)
    },
    sortedSessionSwitchOptions() {
      return this.$root.sessionsArray.slice().sort((a, b) => {
        if (this.isSessionStarred(a) !== this.isSessionStarred(b)) {
          return this.isSessionStarred(a) ? -1 : 1
        }
        const createdAtA = new Date(a.created_at || 0).getTime()
        const createdAtB = new Date(b.created_at || 0).getTime()
        if (createdAtA !== createdAtB) return createdAtB - createdAtA
        return Number(b.id) - Number(a.id)
      })
    },
    unsavedChangesWarning() {
      return this.unsavedChanges && window.location.hostname !== 'localhost'
    },
    isSessionSwitching() {
      return this.$root.isSessionLoading
    },
  },
  methods: {
    navigateToTab(routeName, id = this.$route.params.id) {
      if (this.activeTabRouteName === routeName) return
      this.pendingTabRouteName = routeName
      this.$router.push({ name: routeName, params: { id } }).finally(() => {
        if (normalizeSessionTabRouteName(this.$route.name) !== routeName) {
          this.pendingTabRouteName = null
        }
      })
    },
    isSessionStarred(session) {
      return session?.starred === true
    },
    syncSwitchPanelSelection() {
      const id = parseInt(this.$route.params.id, 10)
      const list = this.sortedSessionSwitchOptions
      this.switchPanelSelection = list.find((s) => Number(s.id) === id) ?? null
    },
    toggleSessionStarred(session) {
      this.dbUpdate('sessions', { id: session.id, starred: !this.isSessionStarred(session) })
    },
    openSessionSwitchPanel(event) {
      this.syncSwitchPanelSelection()
      this.$refs.sessionPanel.toggle(event)
    },
    onSessionSwitchShow() {
      this.syncSwitchPanelSelection()
    },
    onSessionListboxChange({ value }) {
      if (!value) return
      this.goToSession(value)
    },
    openNewSessionFromSwitcher() {
      this.$refs.sessionPanel.hide()
      this.$refs.sessionNewModal.open({})
    },
    goToSession(sess) {
      this.flushPendingHistoryRecord()
      const newId = sess.id
      const currentId = parseInt(this.$route.params.id, 10)
      if (newId === currentId) {
        this.$refs.sessionPanel.hide()
        return
      }
      const run = () => {
        this.$refs.sessionPanel.hide()
        this.syncSwitchPanelSelection()
        this.$root.persistLastSessionId(newId)
        const name = this.$route.name
        if (['session_overview', 'session_schedule', 'session_stocks', 'session_orders', 'session_inventories'].includes(name)) {
          this.$router.push({ name, params: { id: newId } })
          return
        }
        if (name === 'session_order') {
          this.$router.push({ name: 'session_orders', params: { id: newId } })
          return
        }
        if (name === 'session_inventory') {
          this.$router.push({ name: 'session_inventories', params: { id: newId } })
          return
        }
        if (name === 'inventories_public') {
          this.$router.push({ name: 'inventories_public', params: { id: newId } })
          return
        }
        this.$router.push({ name: 'session_overview', params: { id: newId } })
      }
      if (this.unsavedChanges) {
        this.$confirm.require({
          message: 'You have unsaved changes !',
          acceptLabel: 'Quit without saving',
          rejectLabel: 'Cancel',
          header: 'Warning',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.$root.fullyLoadedSessions = this.$root.fullyLoadedSessions.filter((id) => id !== this.session.id)
            run()
          },
        })
        return
      }
      run()
    },
    goSessionsIndex() {
      this.flushPendingHistoryRecord()
      const run = () => {
        this.$refs.sessionPanel.hide()
        this.syncSwitchPanelSelection()
        this.$router.push({ name: 'sessions' })
      }
      if (this.unsavedChanges) {
        this.$confirm.require({
          message: 'You have unsaved changes !',
          acceptLabel: 'Quit without saving',
          rejectLabel: 'Cancel',
          header: 'Warning',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.$root.fullyLoadedSessions = this.$root.fullyLoadedSessions.filter((id) => id !== this.session.id)
            run()
          },
        })
        return
      }
      run()
    },
    async save() {
      this.saving = true
      // For template, session name is the event template name
      if (this.session.is_template) this.session.name = this.session.events.at(0).name
      const { error } = await this.$db.from('sessions')
        .update(this.session)
        .match({ id: this.$route.params.id })

      if (error) this.toastError(error)
      this.saving = false
      this.unsavedChanges = false
    },
    undo() {
      if (this.history.length <= 1) return
      // poping twice the history, cause last history value is the same as current value
      let lastSession = this.history.pop()
      lastSession = this.history.pop()
      lastSession.events.forEach((e) => { e.start_date = new Date(e.start_date) })
      this.$root.session = lastSession
    },
    clearPendingHistoryRecord() {
      if (this.historyRecordTimeout !== null) {
        clearTimeout(this.historyRecordTimeout)
        this.historyRecordTimeout = null
      }
    },
    flushPendingHistoryRecord() {
      if (this.historyRecordTimeout === null) return
      this.clearPendingHistoryRecord()
      this.recordHistorySnapshot()
    },
    scheduleHistoryRecord() {
      this.clearPendingHistoryRecord()
      this.historyRecordTimeout = setTimeout(() => {
        this.historyRecordTimeout = null
        this.recordHistorySnapshot()
      }, 120)
    },
    recordHistorySnapshot() {
      if (!this.$root.isSessionFullyLoaded()) return
      const snapshot = this.cloneSessionSnapshot()
      const previousSnapshot = this.history[this.history.length - 1]
      if (previousSnapshot && areSnapshotsEqual(snapshot, previousSnapshot)) return
      if (this.history.length !== 0) this.unsavedChanges = true
      this.history.push(snapshot)
    },
    cloneSessionSnapshot() {
      const snapshot = JSON.parse(JSON.stringify(this.session))
      snapshot.events.forEach((event) => {
        event.start_date = new Date(event.start_date)
      })
      return snapshot
    },
  },
  watch: {
    '$route.name'() {
      this.pendingTabRouteName = null
    },
    '$route.params.id'() {
      this.clearPendingHistoryRecord()
      this.history = []
      this.pendingTabRouteName = null
      this.unsavedChanges = false
      this.switchPanelSelection = null
    },
    session: {
      deep: true,
      handler() {
        this.scheduleHistoryRecord()
      },
    },
  },
}
</script>

<style lang='scss' scoped>
$background-color: var(--indigo-500);
$active-color: white;
$inactive-color: var(--indigo-100);

:deep(.p-tabmenu .p-tabmenu-nav) {
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
    font-weight: 600;
  }

  .p-tabmenuitem:hover .p-menuitem-link {
    color: $active-color !important;
  }
}

.submenu {
  background-color: $background-color;

  h2 {
    color: var(--indigo-50) !important;
    font-size: 1rem;
    font-weight: 500;
  }
}

.session-context {
  min-width: 0;
}

.session-switch-trigger {
  color: var(--indigo-50) !important;
  border-color: rgba(255, 255, 255, 0.55) !important;

  &:hover {
    background: rgba(255, 255, 255, 0.12) !important;
    border-color: #fff !important;
  }
}

.session-star-toggle {
  color: var(--indigo-50) !important;

  &:hover {
    background: rgba(255, 255, 255, 0.12) !important;
  }

  &.is-starred {
    color: #facc15 !important;
  }
}

.btn-new-order {
  background-color: var(--surface-0) !important;
}
</style>

<style lang='scss'>
.session-switch-overlay.p-overlaypanel .p-overlaypanel-content {
  padding: 0;
  border-radius: var(--border-radius, 8px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

.session-switch-panel-inner {
  padding: 0.85rem 1rem;
  width: min(21rem, 92vw);
}

.session-switch-listbox {
  :deep(.p-listbox-filter-container) .p-inputtext {
    padding-left: 1.85rem;
  }

  :deep(.p-listbox-filter-icon) {
    color: var(--text-color-secondary);
  }

  :deep(.p-listbox-list .p-listbox-item) {
    padding-top: 0.55rem;
    padding-bottom: 0.55rem;
  }
}
</style>
