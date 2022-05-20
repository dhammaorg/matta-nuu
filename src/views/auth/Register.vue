<template>
   <img class="page-background" src="@/assets/undraw_welcoming.svg"/>

  <div class="page-content" style="max-width: 400px">
    <h2 class="text-center mt-0">Register</h2>
    <form>
      <InputText placeholder="Email" v-model="user.email" class="w-100 mb-3"
                autocomplete="email" name="email"/>
      <InputText placeholder="Password" type="password" v-model="user.password" class="w-100 mb-3"
                autocomplete="new-password" name="password"/>
      <Button label="Create my account" class="w-100" @click.prevent="signUp" type="submit"/>
    </form>
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
        this.$root.help = true
        this.$router.push({ name: 'profile', query: { firstVisit: true } })
      }
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
