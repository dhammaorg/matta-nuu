<template>
  <Dialog v-model:visible="visible" :style="{width: '450px'}" header="Recipie Details"
          :modal="true" class="p-fluid">
    <div class="p-field">
      <InputText id="name" v-model.trim="recipie.name" required="true" placeholder="Name" autofocus/>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false"/>
      <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveRecipie" />
    </template>
  </Dialog>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      recipie: {},
    }
  },
  methods: {
    show(object = {}) {
      this.recipie = { ...object }
      this.visible = true
    },
    async saveRecipie() {
      if (this.recipie.name.trim()) {
        if (this.recipie.id) {
          this.dbUpdate('recipies', this.recipie)
        } else {
          this.dbCreate('recipies', this.recipie)
        }
        this.visible = false
        this.recipie = {}
      }
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
