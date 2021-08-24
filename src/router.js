import Vue from 'vue'
import Router from 'vue-router'

const login = () => import('./components/login.vue')
const home = () => import('./components/home.vue')
const come = () => import('./components/come')
const user = () => import('./components/user/user')
const rights = () => import('./components/power/rights')
const roles = () => import('./components/power/roles')
const cate = () => import('./components/goods/Cate')

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '',
      redirect: '/login'
    },
    {
      path: '/login',
      component: login
    },
    {
      path: '/home',
      component: home,
      redirect: '/come',

      children: [
        {
          path: '/come',
          component: come
        },
        {
          path: '/users',
          component: user
        },
        {
          path: '/rights',
          component: rights
        },
        {
          path: '/roles',
          component: roles
        },
        {
          path: '/categories',
          component: cate
        },
      ]
    },
  ]
})

// 导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()

  const tokenStr = window.sessionStorage.getItem('token')

  if (!tokenStr) return next('/login')

  next()
})

export default router
