<template>
   <img class="page-background" src="@/assets/undraw_welcoming.svg"/>

  <div class="page-content" style="max-width: 400px">
    <h2 class="text-center mt-0">Register</h2>
    <form>
      <InputText placeholder="Account Name" v-model="accountName" class="w-100 mb-3" required/>
      <InputText placeholder="Email" v-model="user.email" class="w-100 mb-3"
                autocomplete="email" name="email" required/>
      <InputText placeholder="Password" type="password" v-model="user.password" class="w-100 mb-3"
                autocomplete="new-password" name="password" required/>
      <Button label="Create my account" :loading="loading" class="w-100" @click.prevent="signUp" type="submit"/>
    </form>
  </div>
</template>

<script>
import supabase from '@/services/supabase'

export default {
  data() {
    return {
      loading: false,
      user: {},
      accountName: '',
    }
  },
  methods: {
    async signUp() {
      if (!this.accountName || !this.user.email || !this.user.password) {
        this.toastError('Please complete all fields')
        return
      }
      if (this.loading) return
      this.loading = true
      const { user, error } = await supabase.auth.signUp({
        email: this.user.email,
        password: this.user.password,
      })
      if (error) {
        this.loading = false
        this.toastError(error)
      } else {
        this.$root.user = user

        // Update account name (it's a different table)
        const result = await this.$db.from('users').upsert({
          account_name: this.accountName,
          email: user.email,
          user_id: this.$root.user.id,
        }).single()
        this.loading = false
        if (error) this.toastError(error)
        else this.$root.userData = result.data

        this.$root.help = true
        this.$router.push({ name: 'profile', query: { firstVisit: true } })
      }
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
