import supabase from '@/services/supabase'

const DB_TIMEOUT = 15000 // 15 seconds

export default {
  install: (app) => {
    app.config.globalProperties.$db = supabase
    app.mixin({
      methods: {
        listenDbChanges(user) {
          if (!user) return
          // Don't know why, but having a loop with a object of tableName does not work...
          supabase
            .channel(`products-changes-${user.id}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: '*',
                table: 'products',
                filter: `user_id=eq.${user.id}`,
              },
              this.handleUpdateOrInsert
            )
            .subscribe()
          supabase
            .channel(`recipies-changes-${user.id}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: '*',
                table: 'recipies',
                filter: `user_id=eq.${user.id}`,
              },
              this.handleUpdateOrInsert
            )
            .subscribe()
          supabase
            .channel(`suppliers-changes-${user.id}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: '*',
                table: 'suppliers',
                filter: `user_id=eq.${user.id}`,
              },
              this.handleUpdateOrInsert
            )
            .subscribe()
          supabase
            .channel(`categories-changes-${user.id}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: '*',
                table: 'categories',
                filter: `user_id=eq.${user.id}`,
              },
              this.handleUpdateOrInsert
            )
            .subscribe()
          supabase
            .channel(`notes-changes-${user.id}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: '*',
                table: 'notes',
                filter: `user_id=eq.${user.id}`,
              },
              this.handleUpdateOrInsert
            )
            .subscribe()
          supabase
            .channel(`inventories-changes-${user.id}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: '*',
                table: 'inventories',
                filter: `user_id=eq.${user.id}`,
              },
              this.handleUpdateOrInsert
            )
            .subscribe()
          supabase
            .channel(`orders-changes-${user.id}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: '*',
                table: 'orders',
                filter: `user_id=eq.${user.id}`,
              },
              this.handleUpdateOrInsert
            )
            .subscribe()
          supabase
            .channel(`sessions-changes-${user.id}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: '*',
                table: 'sessions',
                filter: `user_id=eq.${user.id}`,
              },
              this.handleSessionChange
            )
            .subscribe()

          // Watch delete events separatly because filtering by user_id does not work
          // so listening to all deletes
          supabase
            .channel(`db-deletion-${user.id}`)
            .on(
              'postgres_changes',
              {
                event: 'DELETE',
                schema: 'public',
              },
              (payload) => {
                // console.log(payload.eventType, payload.table, payload.old.id)
                delete this[payload.table][payload.old.id]
              }
            )
            .subscribe()
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
            let attrs = ['name', 'events', 'rows', 'starred']
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
                if (!oldVal[productId]) currentVal[productId] = newVal[productId]
                else if (values) {
                  // check if one day value have changed
                  Object.entries(values).forEach(([dayId, dayValue]) => {
                    if (oldVal[productId][dayId] != dayValue)
                      currentVal[productId][dayId] = dayValue
                  })
                }
              })
            })
          }
        },
        deepEqual(obj1, obj2) {
          if (obj1 === obj2) return true

          if (
            typeof obj1 !== 'object' ||
            typeof obj2 !== 'object' ||
            obj1 === null ||
            obj2 === null
          ) {
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
        isNetworkError(error) {
          if (!error) return false
          const errorMessage = error.message?.toLowerCase() || ''
          const errorCode = error.code?.toLowerCase() || ''
          const errorDetails = error.details?.toLowerCase() || ''
          return (
            errorMessage.includes('failed to fetch') ||
            errorMessage.includes('networkerror') ||
            errorMessage.includes('network request failed') ||
            errorMessage.includes('load failed') ||
            errorCode === 'err_internet_disconnected' ||
            errorCode === 'err_network_changed' ||
            errorCode === 'err_connection_refused' ||
            errorDetails.includes('fetch') ||
            (!navigator.onLine && (errorMessage.includes('fetch') || errorMessage.includes('network')))
          )
        },
        async executeWithTimeout(dbPromise) {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), DB_TIMEOUT)
          )
          try {
            const result = await Promise.race([dbPromise, timeoutPromise])
            // Check if Supabase returned an error that might be network-related
            if (result?.error && this.isNetworkError(result.error)) {
              throw {
                message: 'No internet connection',
                details: 'Please check your internet connection and try again.',
              }
            }
            return result
          } catch (error) {
            if (this.isNetworkError(error)) {
              throw {
                message: 'No internet connection',
                details: 'Please check your internet connection and try again.',
              }
            }
            if (error.message === 'Request timeout') {
              throw {
                message: 'Connection timeout',
                details: 'The request took too long. Please check your internet connection and try again.',
              }
            }
            throw error
          }
        },
        async dbCreate(tableName, object, onSuccess) {
          this.loading = true
          try {
            const dbPromise = this.$db
              .from(tableName)
              .insert([this.addUserId(this.stripTransientFields(object))])
              .select()
            const { data, error } = await this.executeWithTimeout(dbPromise)
            if (error) this.toastError(error)
            else {
              // don't know why but .single() does not work here, so getting first element with data[0]
              const fixedData = this.fixData(data[0], tableName)
              this.$root[tableName][fixedData.id] = fixedData
              this.toastSuccess(fixedData, 'created')
              if (onSuccess) onSuccess(fixedData)
              return fixedData
            }
            return null
          } catch (error) {
            this.toastError(error)
            return null
          } finally {
            this.loading = false
          }
        },
        async dbUpdate(tableName, object) {
          this.loading = true
          try {
            const dbPromise = this.$db
              .from(tableName)
              .update(this.addUserId(this.stripTransientFields(object)))
              .eq('id', object.id)
              .select()
            const { data, error } = await this.executeWithTimeout(dbPromise)
            if (error) this.toastError(error)
            else {
              // don't know why but .single() does not work here, so getting first element with data[0]
              const fixedData = this.fixData(data[0], tableName)
              this.$root[tableName][object.id] = fixedData
              this.toastSuccess(fixedData, 'updated')
            }
          } catch (error) {
            this.toastError(error)
          } finally {
            this.loading = false
          }
        },
        async dbDestroy(tableName, object) {
          this.loading = true
          try {
            const dbPromise = this.$db.from(tableName).delete().eq('id', object.id)
            const { error } = await this.executeWithTimeout(dbPromise)
            if (error) this.toastError(error)
            else delete this.$root[tableName][object.id]
          } catch (error) {
            this.toastError(error)
          } finally {
            this.loading = false
          }
        },
        addUserId(object) {
          return { ...object, ...{ user_id: this.$root.user.id } }
        },
        stripTransientFields(object) {
          return Object.fromEntries(
            Object.entries(object).filter(([key]) => !key.startsWith('_'))
          )
        },
        toastError(error) {
          if (typeof error === 'string') error = { message: 'Error', details: error }
          if (error.code === 401) {
            this.$router.push({ name: 'login' })
          } else {
            this.$toast.add({
              severity: 'error',
              summary: error.message,
              detail: error.details,
              life: 8000,
            })
          }
        },
        toastSuccess(object, action) {
          const message = object.name
            ? `${object.name} successfully ${action}`
            : `Successfully ${action}`
          this.$toast.add({
            severity: 'success',
            summary: 'Success',
            detail: message,
            life: 4000,
          })
        },
        fixData(data, tableName = '') {
          if (tableName === 'sessions')
            (data.events || []).forEach((e) => {
              e.start_date = new Date(e.start_date)
            })
          return data
        },
      },
    })
  },
}
