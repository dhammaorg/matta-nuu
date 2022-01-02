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
      sessions: [],
      recipies: [],
    }
  },
  created() {
    this.$db.from('recipies').select().order('id', { ascending: false }).then((result) => {
      this.$root.recipies = result.data
    })
  },
  computed: {
    products() {
      const result = []
      this.recipies.forEach((recipie) => {
        recipie.products.forEach((product) => {
          if (!result.includes(product.name)) result.push(product.name)
        })
      })
      return result.sort()
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
