import { createRouter, createWebHashHistory } from 'vue-router'
import SessionsIndex from '@/views/sessions/SessionsIndex.vue'
import Session from '@/views/sessions/Session.vue'
import RecipiesIndex from '@/views/recipies/RecipiesIndex.vue'

const routes = [
  {
    path: '/',
    name: 'sessions',
    component: SessionsIndex,
  },
  {
    path: '/sessions/:id',
    name: 'edit_session',
    component: Session,
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
