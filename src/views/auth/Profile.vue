<template>
  <Message v-if="$route.query.firstVisit" severity="success" :closable="true" icon="pi pi-question"
           class="help-message">
    <strong>Welcome to Matta-Nuu !!</strong>
    <p>The HELP has been activated to help you doing your first steps</p>
    <p>You can toggle HELP any time from main menu</p>
  </Message>

  <div class="page-content" v-if="$root.user">
    <h1 class="mt-0">Your Profile</h1>
    <div class="p-field mb-4">{{ $root.user.email }}</div>
    <div class="p-field">
      <label>Account Name</label>
      <InputText v-model="$root.userData.account_name" class="w-100 " />
    </div>
    <div class="p-field">
      <label>Change your password</label>
      <InputText v-model="newPassword" placeholder="New Password" type="password" class="w-100 " />
    </div>
    <Divider align="center" class="mt-4">Informations to prefill Orders</Divider>
    <div class="p-field">
      <label>Organisation Name</label>
      <InputText v-model="$root.userData.org_name" class="w-100 " />
    </div>
    <div class="p-field">
      <label>Organisation Contact Details</label>
      <Textarea placeholder="Address, Phone, Email..." v-model="$root.userData.org_details"
                :autoResize="true" :rows="2" class="w-100" />
    </div>
    <Divider align="center" class="mt-4">Inventories</Divider>
    <div class="p-field-checkbox w-100 mb-3">
      <Checkbox v-model="$root.userData.inventory_stock_diff_alert" id="stock-diff"
                :binary="true" />
      <label for="stock-diff" class="ms-2">Display an alert if the stock entered by the user is too
        different from the theoretical stock</label>
    </div>
    <div class="p-field" v-show="$root.userData.inventory_stock_diff_alert">
      <label>Alert threshold percent</label>
      <InputNumber v-model="$root.userData.inventory_stock_diff_threshold_percent" class="w-100"
                   suffix=" %" />
    </div>

    <Button label="Save" :loading="loading" icon="pi pi-save" class="mt-3" @click="submit"></Button>
  </div>
</template>

<script>
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'
import Divider from 'primevue/divider'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import supabase from '@/services/supabase'

export default {
  components: {
    Textarea, Message, Divider, InputNumber, Checkbox,
  },
  data() {
    return {
      loading: false,
      newPassword: null,
    }
  },
  methods: {
    async submit() {
      this.loading = true
      let error2 = null
      const { error } = await this.$db.from('users').upsert({
        ...this.$root.userData,
        ...{ user_id: this.$root.user.id },
      }).single()
      if (this.newPassword) {
        error2 = await supabase.auth.updateUser({
          password: this.newPassword,
        }).error
      }
      if (error) this.toastError(error)
      else if (error2) this.toastError(error2)
      else this.toastSuccess({ name: 'Settings' }, 'updated')
      this.loading = false
    },
  },
}
</script>

<style lang='scss' scoped></style>
