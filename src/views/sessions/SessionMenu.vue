<template>
  <div class="px-3 d-flex align-items-center">
    <div class="d-flex align-items-center flex-grow-1">
      <Inplace :closable="true">
        <template #display>
          <h1 class="me-3" title="Edit">{{ session.name }}</h1>
        </template>
        <template #content>
          <InputText v-model="session.name" autoFocus />
        </template>
      </Inplace>
      <TabMenu :model="items"/>
    </div>
    <Button type="button" icon="pi pi-undo" label="Undo" class="p-button-sm me-3"
            @click="$emit('undo')" :disabled="history.length <= 1" v-if="history" />
    <Button icon="pi pi-save" label="Save" class="p-button-success"
            @click="$emit('save')" :loading="saving" />
  </div>
</template>

<script>
import TabMenu from 'primevue/tabmenu'
import Inplace from 'primevue/inplace'

export default {
  props: ['session', 'saving', 'history'],
  components: { TabMenu, Inplace },
  data() {
    return {
      items: [
        { label: 'Consumption', icon: 'pi pi-calendar', to: { name: 'session_consumption', params: { id: this.$route.params.id } } },
        { label: 'Stocks', icon: 'pi pi-box', to: { name: 'session_stocks', params: { id: this.$route.params.id } } },
      ],
    }
  },
}
</script>

<style lang='scss' scoped>
  ::v-deep .p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link {
    border: none;
  }
  ::v-deep .p-inplace-display {
    display: flex;
  }
  ::v-deep .p-inplace .p-inplace-display:not(.p-disabled):hover {
    background: transparent;
  }
  h1 {
    margin: 0;
  }
</style>
