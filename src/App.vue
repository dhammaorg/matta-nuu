<template>
  <Menubar :model="navItems">
    <template #start>
      <span class="mx-3 fw-bold">Matta Nuu</span>
    </template>
  </Menubar>
  <div class="main-content p-component mx-auto p-3">
    <router-view/>
  </div>
</template>

<script>
import Menubar from 'primevue/menubar'

export default {
  components: { Menubar },
  data() {
    return {
      navItems: [
        { label: 'Sessions', to: { name: 'sessions' } },
        { label: 'Recipies', to: { name: 'recipies' } },
      ],
      sessions: [],
      recipies: [],
    }
  },
  mounted() {
    this.$db.from('recipies').select().then((result) => {
      this.recipies = result.data
    })
    this.$db.from('sessions').select().then((result) => {
      this.sessions = result.data
    })
  },
}
</script>

<style lang="scss">
  body, html {
    margin: 0;
    padding: 0;
  }
  .matta-nuu .p-menubar {
    border-radius: 0;
    border-top: none;
    border-left: none;
    border-right: none;
  }
  .main-content {
    max-width: 800px;
  }
</style>
