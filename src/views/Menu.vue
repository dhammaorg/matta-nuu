<template>
  <Menubar :model="navItems" class="d-print-none">
    <template #start>
      <div class="d-flex align-items-center">
        <img src="../assets/logo.png" class="me-4" height="50" style="margin-top: -5px" />
      </div>
    </template>
    <template #end>
      <ToggleButton v-model="$root.help"
                    class="p-button-sm p-button-text me-3 d-none d-md-inline-block"
                    style="height: 2rem"
                    onLabel="Help" offLabel="Help" onIcon="pi pi-question-circle"
                    offIcon="pi pi-question-circle" />

      <Button icon="pi pi-user" @click="this.$refs.menu.toggle($event)" v-if="$root.user"
              class="btn-user p-button-rounded me-2" />
      <TieredMenu ref="menu" :model="userItems" :popup="true" />
    </template>
  </Menubar>
</template>

<script>
import Menubar from 'primevue/menubar'
import ToggleButton from 'primevue/togglebutton'
import TieredMenu from 'primevue/tieredmenu'
import supabase from '@/services/supabase'

export default {
  components: { Menubar, ToggleButton, TieredMenu },
  data() {
    return {
      navItems: [
        { label: 'Sessions', to: { name: 'sessions' }, icon: 'pi pi-folder-open' },
        { label: 'Products', to: { name: 'products' }, icon: 'pi pi-apple' },
        { label: 'Suppliers', to: { name: 'suppliers' }, icon: 'pi pi-shopping-cart' },
        { label: 'Recipies', to: { name: 'recipies' }, icon: 'pi pi-palette' },
        { label: 'Event Templates', to: { name: 'templates' }, icon: 'pi pi-file' },
        {
          label: 'More',
          items: [
            { label: 'Product Categories', to: { name: 'categories', params: { type: 'Product' } } },
            { label: 'Recipie Categories', to: { name: 'categories', params: { type: 'Recipie' } } },
            { label: 'Storage Areas', to: { name: 'categories', params: { type: 'StorageArea' } } },
          ],
        },
      ],
      userItems: [
        { label: this.$root.userData.account_name, disabled: true },
        { separator: true },
        { label: 'Settings', to: { name: 'profile' }, icon: 'pi pi-cog' },
        { label: 'Import Data', to: { name: 'import' }, icon: 'pi pi-cloud-download' },
        { label: 'Logout', command: () => { this.logout() }, icon: 'pi pi-sign-out' },
      ],
    }
  },
  methods: {
    async logout() {
      await supabase.auth.signOut()
      this.$root.user = null
      this.$router.push({ name: 'login' })
    },
  },
}
</script>

<style lang='scss'>
.matta-nuu .p-menubar {
  border-radius: 0;
  border: none;
  background: var(--bluegray-900);
  color: var(--indigo-100);

  h1 {
    color: var(--indigo-100);
  }

  .p-submenu-list {
    z-index: 1000;
  }
}

.matta-nuu .p-menubar .p-menubar-root-list>.p-menuitem>.p-menuitem-link {
  box-shadow: none !important;

  &:hover {
    background-color: var(--primary-color) !important;

    .p-menuitem-icon,
    .p-menuitem-text {
      color: var(--surface-0) !important;
    }
  }

  .p-menuitem-icon,
  .p-menuitem-text {
    color: var(--indigo-200) !important;
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
  color: var(--indigo-200);
}

.btn-user {
  background: var(--indigo-200);
  color: var(--bluegray-900);
  border: none;
}
</style>
