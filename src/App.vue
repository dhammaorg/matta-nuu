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

const emptySession = {
  rows: [], events: [], stocks: {}, realStocks: {}, buys: {}, products: {},
}
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
          this.sessions[session.id] = { ...session, ...emptySession }
        }
      })
    })
  },
  computed: {
    session: {
      get() {
        return this.sessions[this.$route.params.id] || emptySession
      },
      set(value) {
        this.sessions[this.$route.params.id] = value
      },
    },
    isSessionFullyLoaded() {
      return this.fullyLoadedSessions.includes(parseInt(this.$route.params.id, 10))
    },
    products() {
      const result = new Set()
      this.recipiesArray.forEach((recipie) => {
        recipie.products.forEach((product) => {
          result.add(product.name)
        })
      })
      Object.values(this.sessions).forEach((session) => {
        session.rows.forEach((row) => {
          if (row.type === 'product') {
            result.add(row.product)
          } else if (row.type === 'products') {
            Object.values(row.values).forEach((value) => {
              result.add(value.product)
            })
          }
        })
      })
      return Array.from(result).filter((r) => !!r).sort()
    },
    suppliers() {
      const result = Object.values(this.session.products).map((p) => p.supplier).filter((p) => !!p)
      return [...new Set(result)] // uniqueness
    },
    recipiesArray() {
      return Object.values(this.$root.recipies).slice().sort((a, b) => (a.id < b.id ? 1 : -1))
    },
  },
  watch: {
    products: {
      deep: true,
      handler() {
        this.products.forEach((p) => {
          this.session.realStocks[p] ||= {}
          this.session.buys[p] ||= {}
          this.session.products[p] ||= {}
        })
      },
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
    font-size: 15px;
    text-color: var(--text-color);
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
