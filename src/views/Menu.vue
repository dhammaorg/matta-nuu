<template>
  <Menubar :model="navItems" class="d-print-none">
    <template #start>
      <div class="d-flex align-items-center">
        <img src="../assets/logo.png" class="me-4" height="50" style="margin-top: -5px"/>
      </div>
    </template>
    <template #end>
      <ToggleButton v-model="$root.help" class="p-button-sm p-button-text me-3" style="height: 2rem"
                    onLabel="Help" offLabel="Help" onIcon="pi pi-question-circle" offIcon="pi pi-question-circle" />
      <Button icon="pi pi-sign-out" class="p-button-rounded p-button-text me-2" @click="logout"
              v-if="$root.user" v-tooltip.left="'Logout'"/>
    </template>
  </Menubar>
</template>

<script>
import Menubar from 'primevue/menubar'
import ToggleButton from 'primevue/togglebutton'
import supabase from '@/services/supabase'

export default {
  components: { Menubar, ToggleButton },
  data() {
    return {
      navItems: [
        { label: 'Sessions', to: { name: 'sessions' }, icon: 'pi pi-folder-open' },
        { label: 'Products', to: { name: 'products' }, icon: 'pi pi-apple' },
        { label: 'Suppliers', to: { name: 'suppliers' }, icon: 'pi pi-shopping-cart' },
        { label: 'Recipies', to: { name: 'recipies' }, icon: 'pi pi-palette' },
        { label: 'Event Templates', to: { name: 'templates' }, icon: 'pi pi-file' },
      ],
    }
  },
  methods: {
    async logout() {
      const { error } = await supabase.auth.signOut()
      if (error) this.toastError(error)
      else {
        this.$root.user = null
        this.$router.push({ name: 'login' })
      }
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
    h1 { color: var(--indigo-100); }
  }
  .matta-nuu .p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-link {
    box-shadow: none !important;
    &:hover {
      background-color: var(--primary-color) !important;
      .p-menuitem-icon, .p-menuitem-text {
        color: var(--surface-0) !important;
      }
    }
    .p-menuitem-icon, .p-menuitem-text {
      color: var(--indigo-200) !important;
    }
    .p-menuitem-text {
      font-weight: 600 !important;
    }
  }
  .p-menubar-start, .p-menubar-end {
    display: flex;
    align-items: center;
  }
  .p-menubar .p-button.p-button-text {
    color: var(--indigo-200);
  }
</style>
