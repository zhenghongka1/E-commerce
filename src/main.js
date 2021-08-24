import Vue from 'vue'
import App from './App.vue'
import router from './router'
import less from 'less'
import './assets/CSS/common.css'
// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'
import './plugins/element'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'

// axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'

axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'

axios.interceptors.request.use(config =>{
  // console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 必须return出来
  return config
})

Vue.prototype.$http = axios

// 关闭vue的生产提示
Vue.config.productionTip = false

Vue.use(less)
// Vue.use(ElementUI)

Vue.component('tree-table',TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
