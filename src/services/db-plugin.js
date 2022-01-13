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
            if (dbName === 'sessions') (data.events || []).forEach((e) => { e.start_date = new Date(e.start_date) })
            this.$root[dbName][data.id] = data
            this.toastSuccess(data, 'created')
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
            if (data.delivery_date) data.delivery_date = new Date(data.delivery_date)
            if (data.target_date) data.target_date = new Date(data.target_date)
            this.$root[dbName][object.id] = data
            this.toastSuccess(data, 'updated')
          }
          this.loading = false
        },
        async dbDestroy(dbName, object) {
          this.loading = true
          if (dbName == 'sessions') {
            const { error } = await this.$db.from('orders').delete().match({ session_id: object.id })
            if (error) this.toastError(error)
          }
          const { error } = await this.$db.from(dbName).delete().match({ id: object.id }).single()

          if (error) this.toastError(error)
          else {
            delete this.$root[dbName][object.id]
          }
          this.loading = false
        },
        toastError(error) {
          if (typeof error === 'string') error = { message: 'Error', details: error }
          this.$toast.add({
            severity: 'error', summary: error.message, detail: error.details, life: 8000,
          })
        },
        toastSuccess(object, action) {
          const message = object.name ? `${object.name} successfully ${action}` : `Successfully ${action}`
          this.$toast.add({
            severity: 'success', summary: 'Success', detail: message, life: 8000,
          })
        },
      },
    })
  },
}
