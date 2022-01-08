<template>

  <Toast position="top-center" />

  <Menubar :model="navItems" class="d-print-none">
    <template #start>
      <div class="d-flex align-items-center">
        <img src="./assets/logo.png" class="ms-2 me-4" height="50" style="margin-top: -5px"/>
      </div>
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
        { label: 'Sessions', to: { name: 'sessions' }, icon: 'pi pi-folder-open' },
        { label: 'Recipies', to: { name: 'recipies' }, icon: 'pi pi-palette' },
      ],
      sessions: {},
      recipies: {},
      orders: {},
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
    background-color:var(--surface-ground);
  }
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
  .page-content {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding-top: 2.5rem;
    margin-top: 3rem;
    @extend .card;
  }
  .card {
    background: white;
    padding: 3rem;
    border-radius: 10px;
    box-shadow: 0 3px 5px rgba(0,0,0,.02),0 0 2px rgba(0,0,0,.05),0 1px 4px rgba(0,0,0,.08)!important;
  }
  .page-full-content {
    padding: 2rem;
    padding-bottom: 0;
  }
</style>
