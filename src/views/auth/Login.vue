<template>
  <img class="page-background" src="@/assets/undraw_login.svg" />

  <div class="page-content" style="max-width: 400px">
    <h2 class="text-center mt-0">Login</h2>

    <div class="mb-3 text-center">
      <span class="">Don't have an account?</span>
      <router-link :to="{ name: 'register' }" class="ms-1">Create now!</router-link>
    </div>
    <form>
      <InputText placeholder="Email" v-model="user.email" class="w-100 mb-3" name="email"
                 autocomplete="email" />
      <InputText placeholder="Password" type="password" v-model="user.password" class="w-100 mb-3"
                 @keyup.enter="signIn" autocomplete="current-password" />
      <Button label="Sign In" type="submit" :loading="loading" class="w-100"
              @click.prevent="signIn" />
      <div class="mt-3 text-center">
        <router-link :to="{ name: 'reset-password' }">Forgot your password?</router-link>
      </div>
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
    }
  },
  methods: {
    async signIn() {
      if (!this.user.email || !this.user.password) {
        this.toastError('Please provide both email and password')
        return
      }
      if (this.loading) return
      this.loading = true
      const { data, error } = await supabase.auth.signInWithPassword({
        email: this.user.email,
        password: this.user.password,
      })
      const { user } = data
      this.loading = false
      if (error) this.toastError(error)
      else {
        this.$root.user = user
        this.$router.push({ name: 'sessions' })
      }
    },
  },
}
</script>

<style lang='scss' scoped></style>
