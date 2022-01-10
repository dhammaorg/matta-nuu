<template>
  <Button type="button" icon="pi pi-print" class="p-button-sm p-button-rounded"
          @click="$refs.printMenu.toggle($event)" />
  <TieredMenu ref="printMenu" :model="menu" :popup="true" class="d-print-none" />
</template>

<script>
import TieredMenu from 'primevue/tieredmenu'

export default {
  components: { TieredMenu },
  data() {
    return {
      menu: [
        { label: 'Print with amounts', icon: 'pi pi-print', command: () => { this.print(true) } },
        { label: 'Print without amounts (blank)', icon: 'pi pi-print', command: () => { this.print(false) } },
      ],
    }
  },
  methods: {
    print(withAmount) {
      const { classList } = document.querySelector('.session-table')
      if (withAmount) classList.remove('hide-amounts')
      else classList.add('hide-amounts')
      window.print()
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
