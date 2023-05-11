<template>
  <template v-if="dataFetched || !user">
    <Menu />
    <router-view/>

    <Toast position="top-center" />
    <ConfirmDialog></ConfirmDialog>
  </template>
  <Spinner v-else/>

</template>

<script>

import Toast from 'primevue/toast'
import supabase from '@/services/supabase'
import Menu from '@/views/Menu.vue'
import Spinner from '@/components/Spinner.vue'

const emptySession = {
  rows: [], events: [], realStocks: {}, buys: {}, products: {},
}
export default {
  components: { Toast, Menu, Spinner },
  data() {
    return {
      dataFetchedCount: 0,
      products: {},
      suppliers: {},
      recipies: {},
      sessions: {},
      orders: {},
      notes: {},
      categories: {},
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
    sessionsArray() {
      return Object.values(this.sessions).filter((s) => !s.is_template)
    },
    templatesArray() {
      return Object.values(this.sessions).filter((s) => s.is_template)
    },
    dataFetched() {
      return this.dataFetchedCount === 6
    },
  },
  watch: {
    products: {
      deep: true,
      handler() {
        this.initProductsForSession()
      },
    },
    user(newUser, oldUser) {
      // New login
      if (newUser && !oldUser) {
        this.resetData()
        setTimeout(() => this.fetchData(), 0)
      }
    },
    help() {
      localStorage.setItem('help', this.help)
    },
  },
  methods: {
    resetData() {
      this.dataFetchedCount = 0
      this.recipies = {}
      this.sessions = {}
      this.userData = {}
      this.products = {}
      this.suppliers = {}
      this.categories = {}
      this.notes = {}
    },
    initProductsForSession() {
      if (!this.productsArray) return
      this.productsArray.forEach((p) => {
        this.session.realStocks[p.id] ||= {}
        this.session.buys[p.id] ||= {}
      })
    },
    fetchData() {
      if (!this.user) return

      this.$db.from('recipies').select().match({ user_id: this.user.id }).order('id', { ascending: false })
        .then((result) => {
          result.data.forEach((recipie) => {
            this.recipies[recipie.id] = recipie
          })
          this.handleDataFetched()
        })
      this.$db.from('products').select().match({ user_id: this.user.id }).order('id', { ascending: false })
        .then((result) => {
          result.data.forEach((product) => {
            this.products[product.id] = product
          })
          this.handleDataFetched()
        })
      this.$db.from('categories').select().match({ user_id: this.user.id }).order('id', { ascending: false })
        .then((result) => {
          result.data.forEach((category) => {
            this.categories[category.id] = category
          })
          this.handleDataFetched()
        })
      this.$db.from('suppliers').select().match({ user_id: this.user.id }).order('id', { ascending: false })
        .then((result) => {
          result.data.forEach((supplier) => {
            this.suppliers[supplier.id] = supplier
          })
          this.handleDataFetched()
        })
      this.$db.from('sessions').select('id, name, is_template')
        .match({ user_id: this.user.id }).order('id', { ascending: false })
        .then((result) => {
          result.data.forEach((session) => {
            if (!this.sessions[session.id]) {
              this.sessions[session.id] = { ...session, ...emptySession }
            }
          })
          this.handleDataFetched()
        })
      this.$db.from('users').select().match({ user_id: this.user.id }).single()
        .then((result) => {
          this.userData = result.data || {}
          this.handleDataFetched()
        })
    },
    handleDataFetched() {
      this.dataFetchedCount += 1
    },
    // Inially we load only the session name in order to make smaller requests
    // so we need to fetch again the full session individually
    async fetchSession(sessionId = parseInt(this.$route.params.id, 10)) {
      if (this.isSessionFullyLoaded(sessionId)) return this.sessions[sessionId]
      const { error, data } = await this.$db.from('sessions').select().match({ id: sessionId }).single()
      if (error) return this.toastError(error)
      // Adds default values
      const session = {
        ...{
          realStocks: {}, rows: [], events: [], buys: {},
        },
        ...data,
      }
      session.events.forEach((e) => { e.start_date = new Date(e.start_date) })

      // Loads associated orders and notes
      if (!session.is_template) {
        let result = await this.$db.from('orders').select().match({ session_id: this.$route.params.id })
        if (result.error) return this.toastError(result.error)
        result.data.forEach((order) => {
          if (!this.$root.orders[order.id]) {
            this.$root.orders[order.id] = order
          }
        })

        result = await this.$db.from('notes').select().match({ session_id: this.$route.params.id })
        if (result.error) return this.toastError(result.error)
        result.data.forEach((note) => {
          if (!this.$root.notes[note.id]) {
            this.$root.notes[note.id] = note
          }
        })
      }
      this.sessions[sessionId] = session
      this.initProductsForSession()
      this.fullyLoadedSessions.push(sessionId)
      return session
    },
    setPageTitle(title) {
      document.getElementById('title').innerHTML = title
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
    getCategory(id) {
      return this.categories[id] || {}
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

    // Adjust color for more contrast
    .p-datatable .p-datatable-thead > tr > th,
    .p-datatable .p-datatable-tbody > tr {
      color: black !important;
    }
    .p-rowgroup-header td {
      color: var(--bluegray-700);
    }
    .p-datatable .p-datatable-thead > tr > th,
    .p-datatable .p-datatable-tbody > tr > td {
      border-color: var(--gray-400) !important;
    }
    .p-toast { display: none; }

  }
  #app, body, html {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    font-size: 14px;
    overflow-x: hidden;
    color: var(--text-color);
    @media screen { background-color:var(--surface-ground); }
    color-adjust: exact;
    -webkit-print-color-adjust: exact;
    @media print {
      overflow: visible !important;
      height: auto !important;
    }
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
