<template>
   <img class="page-background" src="@/assets/undraw_welcoming.svg"/>

  <div class="page-content" style="max-width: 400px">
    <h2 class="text-center mt-0">Reset your password</h2>
    <form>
      <InputText placeholder="Your Email" v-model="email" class="w-100 mb-3"
                 autocomplete="email" name="email"/>
      <Button label="Send me reset instructions" class="w-100" :loading="loading"
              @click.prevent="reset" type="submit"/>
    </form>
  </div>
</template>

<script>
import supabase from '@/services/supabase'

export default {
  data() {
    return {
      email: '',
      loading: false,
    }
  },
  methods: {
    async reset() {
      this.loading = true
      const { error } = await supabase.auth.signIn({
        email: this.email,
      }, { redirect_to: 'http://localhost:8081/#/profile' })
      this.loading = false
      if (error) this.toastError(error)
      else {
        this.toastSuccess({}, 'sent reset password instructions. Please check your SPAMs')
        this.$router.push({ name: 'login' })
      }
    },
  },
}
</script>

<style lang='scss' scoped>

</style>
