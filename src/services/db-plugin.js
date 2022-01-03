import supabase from '@/services/supabase'

export default {
  install: (app) => {
    app.config.globalProperties.$db = supabase

    app.mixin({
      methods: {
        async dbCreate(dbName, object, onSuccess) {
          this.loading = true
          const { data, error } = await this.$db.from(dbName).insert([object]).single()
          if (error) this.toastError(error)
          else {
            this.$root[dbName][data.id] = data

            if (onSuccess) onSuccess(data)
          }
          this.loading = false
          return data
        },
        async dbUpdate(dbName, object) {
          this.loading = true
          const { data, error } = await this.$db.from(dbName)
            .update(object)
            .match({ id: object.id })
            .single()

          if (error) this.toastError(error)
          else {
            this.$root[dbName][object.id] = data
          }
          this.loading = false
        },
        async dbDestroy(dbName, object) {
          this.loading = true
          const { error } = await this.$db.from(dbName).delete().match({ id: object.id }).single()

          if (error) this.toastError(error)
          else {
            delete this.$root[dbName][object.id]
          }
          this.loading = false
        },
        toastError(error) {
          this.$toast.add({
            severity: 'error', summary: error.message, detail: error.details, life: 3000,
          })
        },
      },
    })
  },
}
