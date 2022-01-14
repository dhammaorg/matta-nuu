import { createRouter, createWebHashHistory } from 'vue-router'
import SessionsIndex from '@/views/sessions/SessionsIndex.vue'
import Session from '@/views/sessions/Session.vue'
import SessionSchedule from '@/views/sessions/SessionSchedule.vue'
import SessionStocks from '@/views/sessions/SessionStocks.vue'
import SessionOrdersIndex from '@/views/sessions/SessionOrdersIndex.vue'
import SessionOrder from '@/views/sessions/SessionOrder.vue'
import SessionSuppliers from '@/views/sessions/SessionSuppliers.vue'
import RecipiesIndex from '@/views/recipies/RecipiesIndex.vue'
import TemplatesIndex from '@/views/templates/TemplatesIndex.vue'
import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
  },
  {
    path: '/',
    name: 'sessions',
    component: SessionsIndex,
  },
  {
    path: '/sessions/:id',
    name: 'session',
    component: Session,
    children: [
      {
        path: 'schedule',
        name: 'session_schedule',
        component: SessionSchedule,
      },
      {
        path: 'stocks',
        name: 'session_stocks',
        component: SessionStocks,
      },
      {
        path: 'suppliers',
        name: 'session_suppliers',
        component: SessionSuppliers,
      },
      {
        path: 'orders',
        name: 'session_orders',
        component: SessionOrdersIndex,
      },
      {
        path: 'order/:order_id',
        name: 'session_order',
        component: SessionOrder,
      },
    ],
  },
  {
    path: '/recipes',
    name: 'recipies',
    component: RecipiesIndex,
  },
  {
    path: '/templates',
    name: 'templates',
    component: TemplatesIndex,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
