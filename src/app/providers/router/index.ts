import { createRouter, createWebHistory } from 'vue-router'
import { useSessionStore } from '@/entities/session'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    title?: string
    layout?: 'default' | 'auth'
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/home'),
      meta: { title: 'Home', layout: 'default' },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/pages/about'),
      meta: { title: 'About author', layout: 'default' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/login'),
      meta: { title: 'Login', layout: 'auth' },
    },
    {
      path: '/users',
      component: () => import('@/pages/users'),
      meta: { requiresAuth: true, layout: 'default', title: 'Users' },
      children: [
        {
          path: '',
          name: 'users',
          component: () => import('@/pages/users').then((module) => module.UsersListPage),
          meta: { title: 'Users' },
        },
        {
          path: ':id',
          component: () => import('@/pages/user-details').then((module) => module.UserProfileLayout),
          props: true,
          children: [
            {
              path: '',
              name: 'user-details',
              component: () => import('@/pages/user-details'),
              props: true,
              meta: { title: 'User details' },
            },
            {
              path: 'edit',
              name: 'user-edit',
              component: () => import('@/pages/user-edit'),
              props: true,
              meta: { title: 'Edit user' },
            },
          ],
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/not-found'),
      meta: { title: 'Page not found', layout: 'default' },
    },
  ],
})

router.beforeEach(async (to) => {
  const session = useSessionStore()
  await session.initialize()

  if (to.meta.requiresAuth && !session.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && session.isAuthenticated) {
    return { name: 'users' }
  }
})

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'Vue Lottery App'} | Vue Lottery App`
})

export default router
