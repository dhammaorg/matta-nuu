<template>
  <div class="page-content">
    <h1 class="mt-0">Import data from another account</h1>
    <div class="p-field">
      <Dropdown :options="accounts" optionLabel="account_name" optionValue="user_id" v-model="targetUserId"
        placeholder="Select account" :filter="true" filterPlaceholder="" class="w-100" />
    </div>

    <div v-if="targetUserId">
      <Divider />
      <div class="p-field mt-3">
        <label>Templates to import</label>
        <Multiselect :options="target.templates" optionLabel="name" v-model="selected.templates" class="w-100" />
        <small>All recipies and products used by those templates will be imported as well</small>
      </div>

      <div class="p-field">
        <label>Recipies to import</label>
        <Multiselect :options="target.recipies" optionLabel="name" v-model="selected.recipies" class="w-100" />
        <small>All products used by those recipies will be imported as well</small>
      </div>

      <div class="p-field mt-4">
        <Button label="Import" icon="pi pi-cloud-download" @click="importData" :loading="importing" />
      </div>

      <template v-for="object in objects" :key="object">
        <Message v-if="existing[object].length" severity="info" :closable="false">
          <strong>{{ existing[object].length }} {{ object }} not imported cause already exists :
          </strong>
          {{ existing[object].join(', ') }}
        </Message>
        <Message v-if="imported[object].length" severity="success" :closable="false">
          <strong>{{ imported[object].length }} {{ object }} imported : </strong>
          {{ imported[object].join(', ') }}
        </Message>
      </template>

    </div>
  </div>
</template>

<script>
import Multiselect from 'primevue/multiselect'
import Divider from 'primevue/divider'
import Message from 'primevue/message'

export default {
  components: { Multiselect, Divider, Message },
  data() {
    return {
      accounts: [],
      targetUserId: null,

      objects: ['products', 'recipies', 'templates'],

      target: {},
      selected: {},
      prepared: {},
      imported: {},
      existing: {},
      idMap: { products: {}, recipies: {} },

      importing: false,
    }
  },
  mounted() {
    this.$db.from('users').select().then((result) => {
      this.accounts = result.data.sort((a, b) => a.account_name.localeCompare(b.account_name))
    })
  },
  methods: {
    async retrieveData() {
      ['target', 'selected', 'imported', 'existing'].forEach((prop) => {
        this.objects.forEach((o) => { this[prop][o] = [] })
      })

      this.$db.from('products').select('id, name, unit').match({ user_id: this.targetUserId }).then((result) => {
        this.target.products = result.data
      })
      this.$db.from('recipies').select().match({ user_id: this.targetUserId }).order('name')
        .then((result) => {
          this.target.recipies = result.data
        })
      this.$db.from('sessions').select().match({ is_template: true, user_id: this.targetUserId }).order('name')
        .then((result) => {
          this.target.templates = result.data
        })
    },
    async importData() {
      ['imported', 'existing', 'prepared'].forEach((prop) => {
        this.objects.forEach((o) => { this[prop][o] = [] })
      })
      this.idMap = { products: {}, recipies: {} }
      this.importing = true
      const productsToImport = new Set()
      const recipiesToImport = new Set(this.selected.recipies)

      this.selected.templates.forEach((template) => {
        const existingTemplate = this.$root.templatesArray.find((t) => t.name == template.name)
        if (existingTemplate) {
          this.existing.templates.push(template.name)
        } else {
          template.rows.forEach((row) => {
            if (row.type === 'product') {
              productsToImport.add(this.target.products.find((p) => p.id === row.product_id))
            } else if (row.type === 'products') {
              Object.values(row.values).forEach((value) => {
                productsToImport.add(this.target.products.find((p) => p.id === value.product_id))
              })
            } else if (row.type === 'recipie') {
              recipiesToImport.add(this.target.recipies.find((p) => p.id === row.recipie_id))
            } else if (row.type === 'recipies') {
              Object.values(row.values).forEach((value) => {
                recipiesToImport.add(this.target.recipies.find((p) => p.id === value.recipie_id))
              })
            }
          })
          this.prepareToImport('templates', template)
        }
      })
      Array.from(recipiesToImport).filter((r) => !!r).forEach((recipie) => {
        const existingRecipie = this.$root.recipiesArray.find((r) => r.name == recipie.name)
        if (existingRecipie) {
          this.existing.recipies.push(recipie.name)
          this.idMap.recipies[recipie.id] = existingRecipie.id
        } else {
          recipie.products.forEach((product) => {
            productsToImport.add(this.target.products.find((p) => p.id === product.id))
          })
          this.prepareToImport('recipies', recipie)
        }
      })
      // Import Products
      Array.from(productsToImport).filter((r) => !!r).forEach((product) => {
        const existingProduct = this.$root.productsArray.find((p) => p.name == product.name && p.unit == product.unit)
        if (existingProduct) {
          this.existing.products.push(product.name)
          this.idMap.products[product.id] = existingProduct.id
        } else {
          this.prepareToImport('products', product)
        }
      })
      await this.batchCreate('products')

      // Import Recipies
      this.prepared.recipies.forEach((recipie) => {
        recipie.products = recipie.products.map((productValue) => this.mapId(productValue, 'products', 'id'))
        if (recipie.products_to_list_on_day_before?.length) {
          recipie.products_to_list_on_day_before = recipie.products_to_list_on_day_before
            .map((productId) => this.idMap.products[productId] || productId)
        }
      })
      await this.batchCreate('recipies')

      // Import Templates
      this.prepared.templates.forEach((template) => {
        template.rows = template.rows.map((row) => {
          if (row.type === 'product') {
            return this.mapId(row, 'products', 'product_id')
          }
          if (row.type === 'recipie') {
            return this.mapId(row, 'recipies', 'recipie_id')
          }
          if (row.type === 'products') {
            const values = { ...row.values }
            Object.entries(values).forEach(([key, value]) => {
              values[key] = this.mapId(value, 'products', 'product_id')
            })
            return { ...row, values }
          }
          if (row.type === 'recipies') {
            const values = { ...row.values }
            Object.entries(values).forEach(([key, value]) => {
              values[key] = this.mapId(value, 'recipies', 'recipie_id')
            })
            return { ...row, values }
          }
          return row
        })
      })
      await this.batchCreate('templates', 'sessions')

      this.importing = false
    },
    prepareToImport(type, object) {
      const oldId = object.id
      const data = { ...object, user_id: this.$root.user.id }
      delete data.id
      data._importOldId = oldId
      this.prepared[type].push(data)
    },
    async batchCreate(type, dbname = type) {
      const payload = this.prepared[type].map(({ _importOldId, ...rest }) => rest)
      const { data, error } = await this.$db.from(dbname).insert(payload)
      if (error) this.toastError(error)
      else {
        (data || []).forEach((objectCreated, index) => {
          const oldId = this.prepared[type][index]._importOldId
          if (oldId) this.idMap[type][oldId] = objectCreated.id
          this.imported[type].push(objectCreated.name)
          this.$root[dbname][objectCreated.id] = objectCreated
        })
      }
    },
    mapId(data, type, propId) {
      if (!data) return data
      const oldId = data[propId]
      if (!oldId) return data

      let newId = this.idMap[type][oldId]
      if (!newId) {
        const oldObject = this.target[type]?.find((p) => p.id === oldId)
        if (!oldObject) return data
        const newObject = this.$root[`${type}Array`].find((p) => p.name === oldObject.name
          && (p.unit === oldObject.unit || type !== 'products'))
        if (!newObject) return data
        newId = newObject.id
        this.idMap[type][oldId] = newId
      }

      return { ...data, [propId]: newId }
    },
  },
  watch: {
    targetUserId() {
      this.retrieveData()
    },
  },
}
</script>

<style lang='scss' scoped>
.p-field small {
  opacity: .6;
  margin: 5px 0;
  display: block;
}
</style>
