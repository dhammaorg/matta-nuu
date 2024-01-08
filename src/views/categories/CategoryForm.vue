<template>
  <Dialog v-model:visible="visible" :style="{ width: '600px' }" :header="headerLabel"
          :modal="true" class="p-fluid category-dialog">

    <div class="p-field">
      <InputText id="name" v-model.trim="category.name" required="true" placeholder="Name"
                 autofocus />
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="visible = false" />
      <Button label="Save" icon="pi pi-check" class="p-button-text" :loading="loading"
              @click="saveCategory" />
    </template>
  </Dialog>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      loading: false,
      category: {},
    }
  },
  computed: {
    headerLabel() {
      return this.category.type === 'StorageArea' ? 'Storage Area' : `${this.category.type} Category`
    },
  },
  methods: {
    show(object = {}) {
      this.category = { ...object }
      this.visible = true
    },
    async saveCategory() {
      if (this.category.name) {
        if (this.category.id) {
          this.dbUpdate('categories', this.category)
        } else {
          const newCategory = await this.dbCreate('categories', this.category)
          this.$emit('created', newCategory)
        }
        this.visible = false
        this.category = {}
      }
    },
  },
}
</script>

<style lang='scss' scoped></style>
