import Vue from 'vue'
import Router from 'vue-router'
// import Login from './components/login'

const login = () => import('./components/login.vue')

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path:'',
      redirect:'/login'
    },
    {
      path: '/login',
      component: login
    }
  ]
})
