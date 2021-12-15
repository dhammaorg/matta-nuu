import supabase from '@/services/supabase'

export default {
  install: (app) => {
    app.config.globalProperties.$db = supabase

    app.mixin({
      methods: {
        async dbCreate(dbName, object) {
          const { data, error } = await this.$db.from(dbName).insert([object])
          if (error) this.toastError(error)
          else {
            this.$root[dbName].push(data[0])
          }
        },
        async dbUpdate(dbName, object) {
          const { data, error } = await this.$db.from(dbName)
            .update(object)
            .match({ id: object.id })

          if (error) this.toastError(error)
          else {
            const index = this.$root[dbName].findIndex((o) => o.id === object.id)
            this.$root[dbName][index] = data[0]
          }
        },
        async dbDestroy(dbName, object) {
          // Delete
          const { error } = await this.$db.from(dbName).delete().match({ id: object.id })

          if (error) this.toastError(error)
          else {
            this.$root[dbName] = this.$root[dbName].filter((val) => val.id !== object.id)
          }
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
