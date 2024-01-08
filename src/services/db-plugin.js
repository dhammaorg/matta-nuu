import supabase from '@/services/supabase'

export default {
  install: (app) => {
    app.config.globalProperties.$db = supabase

    app.mixin({
      methods: {
        async dbCreate(dbName, object, onSuccess) {
          this.loading = true
          let { data, error } = await this.$db.from(dbName).insert([this.addUserId(object)]).single()
          if (error) this.toastError(error)
          else {
            data = this.fixData(data, dbName)
            this.$root[dbName][data.id] = data
            this.toastSuccess(data, 'created')
            if (onSuccess) onSuccess(data)
          }
          this.loading = false
          return data
        },
        async dbUpdate(dbName, object) {
          this.loading = true
          let { data, error } = await this.$db.from(dbName)
            .update(this.addUserId(object))
            .match({ id: object.id })
            .single()

          if (error) this.toastError(error)
          else {
            data = this.fixData(data, dbName)
            this.$root[dbName][object.id] = data
            this.toastSuccess(data, 'updated')
          }
          this.loading = false
        },
        async dbDestroy(dbName, object) {
          this.loading = true

          // Delete the object
          const { error } = await this.$db.from(dbName).delete().match({ id: object.id }).single()
          if (error) this.toastError(error)
          else delete this.$root[dbName][object.id]

          this.loading = false
        },
        addUserId(object) {
          return { ...object, ...{ user_id: supabase.auth.user().id } }
        },
        toastError(error) {
          if (typeof error === 'string') error = { message: 'Error', details: error }
          if (error.code === 401) {
            this.$router.push({ name: 'login' })
          } else {
            this.$toast.add({
              severity: 'error', summary: error.message, detail: error.details, life: 8000,
            })
          }
        },
        toastSuccess(object, action) {
          const message = object.name ? `${object.name} successfully ${action}` : `Successfully ${action}`
          this.$toast.add({
            severity: 'success', summary: 'Success', detail: message, life: 4000,
          })
        },
        fixData(data, dbName = '') {
          if (dbName === 'sessions') (data.events || []).forEach((e) => { e.start_date = new Date(e.start_date) })
          return data
        },
      },
    })
  },
}
