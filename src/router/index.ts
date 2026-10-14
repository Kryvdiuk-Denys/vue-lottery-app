import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

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
      component: () => import('../views/HomeView.vue'),
      meta: { title: 'Home', layout: 'default' },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { title: 'About author', layout: 'default' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { title: 'Login', layout: 'auth' },
    },
    {
      path: '/users',
      component: () => import('../views/users/UsersLayout.vue'),
      meta: { requiresAuth: true, layout: 'default', title: 'Users' },
      children: [
        {
          path: '',
          name: 'users',
          component: () => import('../views/users/UsersListView.vue'),
          meta: { title: 'Users' },
        },
        {
          path: ':id',
          component: () => import('../views/users/UserProfileLayout.vue'),
          props: true,
          children: [
            {
              path: '',
              name: 'user-details',
              component: () => import('../views/users/UserDetailsView.vue'),
              props: true,
              meta: { title: 'User details' },
            },
            {
              path: 'edit',
              name: 'user-edit',
              component: () => import('../views/users/UserEditView.vue'),
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
      component: () => import('../views/NotFoundView.vue'),
      meta: { title: 'Page not found', layout: 'default' },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.initialize()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'users' }
  }
})

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'Vue Lottery App'} | Vue Lottery App`
})

export default router
