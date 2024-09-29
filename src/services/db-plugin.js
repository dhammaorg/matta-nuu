import supabase from '@/services/supabase'

export default {
  install: (app) => {
    app.config.globalProperties.$db = supabase
    app.mixin({
      methods: {
        listenDbChanges(user) {
          if (!user) return
          // Don't know why, but having a loop with a object of tableName does not work...
          supabase.channel(`products-changes-${user.id}`).on('postgres_changes', {
            event: '*', schema: '*', table: 'products', filter: `user_id=eq.${user.id}`,
          }, this.handleUpdateOrInsert).subscribe()
          supabase.channel(`recipies-changes-${user.id}`).on('postgres_changes', {
            event: '*', schema: '*', table: 'recipies', filter: `user_id=eq.${user.id}`,
          }, this.handleUpdateOrInsert).subscribe()
          supabase.channel(`suppliers-changes-${user.id}`).on('postgres_changes', {
            event: '*', schema: '*', table: 'suppliers', filter: `user_id=eq.${user.id}`,
          }, this.handleUpdateOrInsert).subscribe()
          supabase.channel(`categories-changes-${user.id}`).on('postgres_changes', {
            event: '*', schema: '*', table: 'categories', filter: `user_id=eq.${user.id}`,
          }, this.handleUpdateOrInsert).subscribe()
          supabase.channel(`notes-changes-${user.id}`).on('postgres_changes', {
            event: '*', schema: '*', table: 'notes', filter: `user_id=eq.${user.id}`,
          }, this.handleUpdateOrInsert).subscribe()
          supabase.channel(`inventories-changes-${user.id}`).on('postgres_changes', {
            event: '*', schema: '*', table: 'inventories', filter: `user_id=eq.${user.id}`,
          }, this.handleSessionChange).subscribe()
          supabase.channel(`orders-changes-${user.id}`).on('postgres_changes', {
            event: '*', schema: '*', table: 'orders', filter: `user_id=eq.${user.id}`,
          }, this.handleUpdateOrInsert).subscribe()
          supabase.channel(`sessions-changes-${user.id}`).on('postgres_changes', {
            event: '*', schema: '*', table: 'sessions', filter: `user_id=eq.${user.id}`,
          }, this.handleSessionChange).subscribe()

          // Watch delete events separatly because filtering by user_id does not work
          // so listening to all deletes
          supabase.channel(`db-deletion-${user.id}`).on('postgres_changes', {
            event: 'DELETE', schema: 'public',
          }, (payload) => {
            // console.log(payload.eventType, payload.table, payload.old.id)
            delete this[payload.table][payload.old.id]
          }).subscribe()
        },
        handleUpdateOrInsert(payload) {
          // console.log(payload.eventType, payload)
          if (payload.new.user_id !== this.$root.user.id) {
            console.error('receive changes from different user')
          } else {
            const newObject = this.fixData(payload.new, payload.table)
            this.$root[payload.table][payload.new.id] = newObject
          }
        },
        handleSessionChange(payload) {
          const newObject = this.fixData(payload.new, payload.table)
          if (payload.eventType == 'INSERT') {
            this.$root.sessions[newObject.id] = newObject
          } else if (payload.eventType == 'UPDATE') {
            const oldObject = this.fixData(payload.old, payload.table)
            const currentObject = this.$root.sessions[newObject.id]
            let attrs = ['name', 'events', 'rows']
            attrs.forEach((attr) => {
              if (!this.deepEqual(oldObject[attr], newObject[attr])) {
                currentObject[attr] = newObject[attr]
              }
            })
            attrs = ['buys', 'realStocks']
            attrs.forEach((attr) => {
              const oldVal = oldObject[attr]
              const newVal = newObject[attr]
              const currentVal = currentObject[attr]
              Object.entries(newVal).forEach(([productId, values]) => {
                // new produtId added
                if (!oldVal[productId]) currentVal[productId] = newObject.buys[productId]
                else {
                  // check if one day value have changed
                  Object.entries(values).forEach(([dayId, dayValue]) => {
                    if (oldVal[productId][dayId] != dayValue) currentVal[productId][dayId] = dayValue
                  })
                }
              })
            })
          }
        },
        deepEqual(obj1, obj2) {
          if (obj1 === obj2) return true

          if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
            return false
          }

          const keys1 = Object.keys(obj1)
          const keys2 = Object.keys(obj2)

          if (keys1.length !== keys2.length) return false

          for (const key of keys1) {
            if (!this.deepEqual(obj1[key], obj2[key])) return false
          }

          return true
        },
        async dbCreate(tableName, object, onSuccess) {
          this.loading = true
          let { data, error } = await this.$db.from(tableName).insert([this.addUserId(object)]).select()
          data = data[0] // don't know why but .single() does not work here, so getting first element
          if (error) this.toastError(error)
          else {
            data = this.fixData(data, tableName)
            this.$root[tableName][data.id] = data
            this.toastSuccess(data, 'created')
            if (onSuccess) onSuccess(data)
          }
          this.loading = false
          return data
        },
        async dbUpdate(tableName, object) {
          this.loading = true

          let { data, error } = await this.$db.from(tableName)
            .update(this.addUserId(object))
            .eq('id', object.id)
            .select()
          data = data[0] // don't know why but .single() does not work here, so getting first element
          if (error) this.toastError(error)
          else {
            data = this.fixData(data, tableName)
            this.$root[tableName][object.id] = data
            this.toastSuccess(data, 'updated')
          }
          this.loading = false
        },
        async dbDestroy(tableName, object) {
          this.loading = true

          // Delete the object
          const { error } = await this.$db.from(tableName).delete().eq('id', object.id)
          if (error) this.toastError(error)
          else delete this.$root[tableName][object.id]

          this.loading = false
        },
        addUserId(object) {
          return { ...object, ...{ user_id: this.$root.user.id } }
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
        fixData(data, tableName = '') {
          if (tableName === 'sessions') (data.events || []).forEach((e) => { e.start_date = new Date(e.start_date) })
          return data
        },
      },
    })
  },
}
