import { createRouter, createWebHashHistory } from 'vue-router'
import SessionsIndex from '@/views/sessions/SessionsIndex.vue'
import Session from '@/views/sessions/Session.vue'
import SessionSchedule from '@/views/sessions/SessionSchedule.vue'
import SessionStocks from '@/views/sessions/SessionStocks.vue'
import RecipiesIndex from '@/views/recipies/RecipiesIndex.vue'

const routes = [
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
    ],
  },
  {
    path: '/recipes',
    name: 'recipies',
    component: RecipiesIndex,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
