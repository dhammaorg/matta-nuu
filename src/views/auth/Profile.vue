<template>
  <Message v-if="$route.query.firstVisit" severity="success" :closable="true" icon="pi pi-question" class="help-message">
    <strong>Welcome to Matta-Nuu !!</strong>
    <p>The HELP has been activated to help you doing your first steps</p>
    <p>You can toggle HELP any time from main menu</p>
  </Message>

  <div class="page-content">
    <h1 class="m-0">Your Profile</h1>
    <div class="mb-4 pb-2 mt-2" v-if="$root.user">{{ $root.user.email }}</div>
    <Divider align="center" class="mt-4">Informations to prefill Orders</Divider>
    <div class="p-field">
      <label>Organisation Name</label>
      <InputText v-model="$root.userData.org_name" class="w-100 "/>
    </div>
    <div class="p-field">
      <label>Organisation Contact Details</label>
      <Textarea placeholder="Address, Phone, Email..." v-model="$root.userData.org_details"
                :autoResize="true" :rows="2" class="w-100"/>
    </div>

    <Button label="Save" :loading="loading" icon="pi pi-save" class="mt-3" @click="submit"></Button>
  </div>
</template>

<script>
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'
import Divider from 'primevue/divider'

export default {
  components: { Textarea, Message, Divider },
  data() {
    return {
      loading: false,
    }
  },
  methods: {
    async submit() {
      this.loading = true
      const { error } = await this.$db.from('users').upsert({
        ...this.$root.userData,
        ...{ user_id: this.$root.user.id },
      }).single()
      if (error) this.toastError(error)
      else this.toastSuccess({ name: 'Settings' }, 'updated')
      this.loading = false
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
