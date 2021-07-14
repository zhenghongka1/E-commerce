import Vue from 'vue'
import App from './App.vue'
import router from './router'
import less from 'less'
import './assets/CSS/common.css'
// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'
import './plugins/element'
import axios from 'axios'

axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
Vue.prototype.$http = axios

// 关闭vue的生产提示
Vue.config.productionTip = false

Vue.use(less)
// Vue.use(ElementUI)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
