import { createApp } from 'vue'

// Commons PrimeVue components
import PrimeVue from 'primevue/config'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import ConfirmationService from 'primevue/confirmationservice'
import ConfirmDialog from 'primevue/confirmdialog'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'

import App from './App.vue'
import router from '@/services/router'
import db from '@/services/db-plugin'
import supabase from '@/services/supabase'
import { utils } from '@/services/utils'

import 'bootstrap/dist/css/bootstrap-utilities.css'
import 'primeicons/primeicons.css'
import 'primevue/resources/themes/lara-light-indigo/theme.css'
import 'primevue/resources/primevue.min.css'
import './main.scss'

utils()

const app = createApp(App)
  .use(router)
  .use(db)
  .use(PrimeVue)
  .use(ConfirmationService)
  .use(ToastService)
  .directive('tooltip', Tooltip)
  .component('Dialog', Dialog)
  .component('Button', Button)
  .component('DataTable', DataTable)
  .component('Column', Column)
  .component('InputText', InputText)
  .component('ConfirmDialog', ConfirmDialog)
  .component('Dropdown', Dropdown)

router.beforeEach((to, from) => {
  const user = supabase.auth.user()
  if (!user && !['login', 'register'].includes(to.name)) return { name: 'login' }
})

app.config.unwrapInjectedRef = true
app.mount('#app')
