<template>

  <Toast position="top-center" />

  <Menubar :model="navItems">
    <template #start>
      <span class="mx-3 fw-bold">Matta Nuu</span>
    </template>
  </Menubar>

  <router-view/>

</template>

<script>
import Menubar from 'primevue/menubar'
import Toast from 'primevue/toast'

export default {
  components: { Menubar, Toast },
  data() {
    return {
      navItems: [
        { label: 'Sessions', to: { name: 'sessions' } },
        { label: 'Recipies', to: { name: 'recipies' } },
      ],
      sessions: {},
      recipies: {},
      fullyLoadedSessions: [],
    }
  },
  created() {
    this.$db.from('recipies').select().order('id', { ascending: false }).then((result) => {
      result.data.forEach((recipie) => {
        this.recipies[recipie.id] = recipie
      })
    })
    this.$db.from('sessions').select('id, name').then((result) => {
      result.data.forEach((session) => {
        if (!this.sessions[session.id]) {
          this.sessions[session.id] = { ...session, ...{ rows: [], events: [] } }
        }
      })
    })
  },
  computed: {
    session: {
      get() {
        return this.sessions[this.$route.params.id] || { rows: [], events: [] }
      },
      set(value) {
        this.sessions[this.$route.params.id] = value
      },
    },
    isSessionFullyLoaded() {
      return this.fullyLoadedSessions.includes(parseInt(this.$route.params.id))
    },
    products() {
      const result = []
      this.recipiesArray.forEach((recipie) => {
        recipie.products.forEach((product) => {
          if (!result.includes(product.name)) result.push(product.name)
        })
      })
      return result.sort()
    },
    recipiesArray() {
      return Object.values(this.$root.recipies).slice().sort((a, b) => (a.id < b.id ? 1 : -1))
    },
  },
}
</script>

<style lang="scss">
  #app, body, html {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }
  .matta-nuu .p-menubar {
    border-radius: 0;
    border-top: none;
    border-left: none;
    border-right: none;
  }
  .page-content {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }
</style>
