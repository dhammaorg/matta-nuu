<template>
  <!-- Simplified menu for public mode -->
  <div
    v-if="$root.isPublicMode"
    class="p-menubar d-flex justify-content-between align-items-center"
  >
    <div class="d-flex align-items-center">
      <span class="app-logo">Matta Nuu</span>
    </div>
    <span v-if="$route.name === 'inventories_public'">{{ this.$root.userData.account_name }}</span>
    <Button
      v-else
      label="Inventories"
      icon="pi pi-home"
      class="p-button-text"
      @click="$router.push({ name: 'inventories_public', params: { id: $root.session.id } })"
    />
    <Button icon="pi pi-sign-out" class="p-button-text" @click="logout" />
  </div>

  <!-- Standard Menu -->
  <Menubar v-else :model="navItems" class="d-print-none">
    <template #start>
      <div class="d-flex align-items-center me-4">
        <span class="app-logo">Matta Nuu</span>
      </div>
    </template>
    <template #end>
      <ToggleButton
        v-model="$root.help"
        class="p-button-sm p-button-text me-3 d-none d-md-inline-block"
        style="height: 2rem"
        onLabel="Help"
        offLabel="Help"
        onIcon="pi pi-question-circle"
        offIcon="pi pi-question-circle"
      />

      <Button
        icon="pi pi-user"
        @click="this.$refs.menu.toggle($event)"
        v-if="$root.user"
        class="btn-user p-button-rounded me-2"
      />
      <TieredMenu ref="menu" :model="userItems" :popup="true" />
    </template>
  </Menubar>
</template>

<script>
import Menubar from 'primevue/menubar'
import ToggleButton from 'primevue/togglebutton'
import TieredMenu from 'primevue/tieredmenu'
import {
  readLastSessionId,
  readLastSessionRouteName,
  resolveDefaultSessionId,
} from '@/services/session-nav-storage'
import supabase from '@/services/supabase'

export default {
  components: { Menubar, ToggleButton, TieredMenu },
  computed: {
    navItems() {
      return [
        { label: 'Sessions', icon: 'pi pi-folder-open', command: () => this.goSessionsShortcut() },
        { label: 'Products', to: { name: 'products' }, icon: 'pi pi-apple' },
        { label: 'Suppliers', to: { name: 'suppliers' }, icon: 'pi pi-shopping-cart' },
        { label: 'Recipies', to: { name: 'recipies' }, icon: 'pi pi-palette' },
        { label: 'Event Templates', to: { name: 'templates' }, icon: 'pi pi-file' },
        {
          label: 'More',
          items: [
            {
              label: 'Product Categories',
              to: { name: 'categories', params: { type: 'Product' } },
            },
            {
              label: 'Recipie Categories',
              to: { name: 'categories', params: { type: 'Recipie' } },
            },
            { label: 'Storage Areas', to: { name: 'categories', params: { type: 'StorageArea' } } },
          ],
        },
      ]
    },
    userItems() {
      return [
        { label: this.$root.userData.account_name || 'Account', disabled: true },
        { separator: true },
        { label: 'Settings', to: { name: 'profile' }, icon: 'pi pi-cog' },
        { label: 'Import Data', to: { name: 'import' }, icon: 'pi pi-cloud-download' },
        {
          label: 'Logout',
          command: () => {
            this.logout()
          },
          icon: 'pi pi-sign-out',
        },
      ]
    },
  },
  methods: {
    goSessionsShortcut() {
      let id = readLastSessionId()
      const { sessions } = this.$root
      if (!id || !sessions[id]) id = resolveDefaultSessionId(sessions)
      if (id && sessions[id]) {
        this.$router.push({ name: readLastSessionRouteName(), params: { id } })
      } else this.$router.push({ name: 'sessions' })
    },
    async logout() {
      await supabase.auth.signOut()
      this.$root.user = null
      this.$router.push({ name: 'login' })
    },
  },
}
</script>

<style lang="scss">
.matta-nuu .p-menubar {
  border-radius: 0;
  border: none;
  border-bottom: 1px solid var(--surface-border);
  background: var(--bs-gold-200);
  color: var(--bs-blue-800);
  padding: 0.5rem 1rem;

  h1 {
    color: var(--bs-blue-800);
  }

  .p-submenu-list {
    z-index: 1000;
  }
}

.matta-nuu .p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-link {
  box-shadow: none !important;

  &:hover {
    background-color: rgba(0, 0, 0, 0) !important;

    .p-menuitem-icon,
    .p-menuitem-text {
      color: var(--bs-gold-600) !important;
    }
  }

  .p-menuitem-icon,
  .p-menuitem-text {
    color: var(--bs-blue-800) !important;
  }

  .p-menuitem-text {
    font-weight: 600 !important;
  }
}

.p-menubar-start,
.p-menubar-end {
  display: flex;
  align-items: center;
}

.p-menubar .p-button.p-button-text {
  color: var(--bs-blue-800);

  &:hover {
    color: var(--bs-gold-600);
    background: rgba(var(--bs-secondary-rgb), 0.08) !important;
  }
}

.btn-user {
  background: var(--bs-blue-800);
  color: var(--bs-gold-200);
  border: none;
}

.app-logo {
  font-family: 'Amiri', serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--bs-gold-500);
  letter-spacing: 0.04em;
  white-space: nowrap;
}
</style>
