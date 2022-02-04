<template>

  <Menu />
  <router-view/>

  <Toast position="top-center" />
  <ConfirmDialog></ConfirmDialog>

</template>

<script>

import Toast from 'primevue/toast'
import supabase from '@/services/supabase'
import Menu from '@/views/Menu.vue'

const emptySession = {
  rows: [], events: [], realStocks: {}, buys: {}, products: {},
}
export default {
  components: { Toast, Menu },
  data() {
    return {
      products: {},
      suppliers: {},
      recipies: {},
      sessions: {},
      templates: {},
      orders: {},
      fullyLoadedSessions: [], // In list mode we load only name and id. Full object is fetch in Session route
      user: null, // current user, null if nobody is loggued in
      userData: {}, // users preferences
      help: false, // Displaying or not help messages
    }
  },
  created() {
    this.user = supabase.auth.user()
    this.help = localStorage.getItem('help') === 'true'
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
    recipiesArray() {
      return Object.values(this.recipies).slice().sort((a, b) => (a.id < b.id ? 1 : -1))
    },
    productsArray() {
      return Object.values(this.products).slice().sort((a, b) => (a.id < b.id ? 1 : -1))
    },
    suppliersArray() {
      return Object.values(this.suppliers).slice().sort((a, b) => (a.id < b.id ? 1 : -1))
    },
    templatesArray() {
      return Object.values(this.templates)
    },
  },
  watch: {
    products: {
      deep: true,
      handler() {
        (this.productsArray || []).forEach((p) => {
          this.session.realStocks[p.id] ||= {}
          this.session.buys[p.id] ||= {}
        })
      },
    },
    user() {
      this.fetchData()
    },
    help() {
      localStorage.setItem('help', this.help)
    },
  },
  methods: {
    resetData() {
      this.recipies = {}
      this.templates = {}
      this.sessions = {}
      this.userData = {}
      this.products = {}
      this.suppliers = {}
    },
    fetchData() {
      this.resetData()
      if (!this.user) return

      this.$db.from('recipies').select().order('id', { ascending: false }).then((result) => {
        result.data.forEach((recipie) => {
          this.recipies[recipie.id] = recipie
        })
      })
      this.$db.from('products').select().order('id', { ascending: false }).then((result) => {
        result.data.forEach((product) => {
          this.products[product.id] = product
        })
      })
      this.$db.from('suppliers').select().order('id', { ascending: false }).then((result) => {
        result.data.forEach((supplier) => {
          this.suppliers[supplier.id] = supplier
        })
      })
      this.$db.from('templates').select('id, name').order('id', { ascending: false }).then((result) => {
        result.data.forEach((template) => {
          this.templates[template.id] = template
        })
      })
      this.$db.from('sessions').select('id, name').order('id', { ascending: false }).then((result) => {
        result.data.forEach((session) => {
          if (!this.sessions[session.id]) {
            this.sessions[session.id] = { ...session, ...emptySession }
          }
        })
      })
      this.$db.from('users').select().single().then((result) => {
        this.userData = result.data || {}
      })
    },
    setPrintMode(mode) {
      // @page can be declared only once. As vuejs use same page for every page
      // We do this trick of changing directly the DOM
      document.getElementById('print-orientation').innerHTML = `@page { size: ${mode}; }`
    },
    isSessionFullyLoaded(id = parseInt(this.$route.params.id, 10)) {
      return this.fullyLoadedSessions.includes(id)
    },
    getProduct(id) {
      return this.products[id] || {}
    },
    getRecipie(id) {
      return this.recipies[id] || {}
    },
    getSupplier(id) {
      return this.suppliers[id] || {}
    },
  },
}
</script>

<style lang="scss">
  @media print {
    // Hide header and footer added while printed with website url and date
    @page { margin: 0; }
    body { padding: 30px !important; }
  }
  #app, body, html {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    font-size: 15px;
    overflow-x: hidden;
    color: var(--text-color);
    @media screen { background-color:var(--surface-ground); }
    color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  .page-content {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding-top: 2.5rem;
    margin-top: 3rem;
    position: relative;
    @extend .card;
  }
  .p-message + .page-content {
    margin-top: 1rem;
  }
  .card {
    background: white;
    padding: 3rem;
    border-radius: 10px;
    box-shadow: 0 3px 5px rgba(0,0,0,.02),0 0 2px rgba(0,0,0,.05),0 1px 4px rgba(0,0,0,.08);
    @media print {
      padding: 0;
      background: transparent;
      box-shadow: none;
    }
  }
  .page-full-content {
    padding: 2rem;
    padding-bottom: 0;
    @media print { padding: 0; }
  }
</style>
