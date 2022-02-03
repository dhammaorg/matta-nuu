<template>
   <img class="page-background" src="@/assets/undraw_welcoming.svg"/>

  <div class="page-content" style="max-width: 400px">
    <h2 class="text-center mt-0">Register</h2>

    <InputText placeholder="Email" v-model="user.email" class="w-100 mb-3"/>
    <InputText placeholder="Password" type="password" v-model="user.password" class="w-100 mb-3"/>
    <Button label="Create my account" class="w-100" @click="signUp"/>
  </div>
</template>

<script>
import supabase from '@/services/supabase'

export default {
  data() {
    return {
      user: {},
    }
  },
  methods: {
    async signUp() {
      const { user, error } = await supabase.auth.signUp({
        email: this.user.email,
        password: this.user.password,
      })
      if (error) this.toastError(error)
      else {
        this.$root.user = user
        this.$router.push({ name: 'sessions' })
        this.$root.help = true
        this.$toast.add({
          severity: 'success',
          summary: 'Welcome to Matta-Nuu !!',
          detail: 'The HELP has been activated to help you doing your first steps. You can toggle HELP any time from main menu',
          life: 8000,
        })
      }
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
