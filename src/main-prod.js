import Vue from 'vue'
import App from './App.vue'
import router from './router'
import less from 'less'
import './assets/CSS/common.css'
// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'
// import './plugins/element'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'

// 导入富文本
import VueQuillEditor from 'vue-quill-editor'


// 引入加载进度条对应的JS和CSS
import NProgress from 'nprogress'

// axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'

// axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'

axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'



axios.interceptors.request.use(config => {
  // 在request发起请求的时候加载进度条
  NProgress.start();
  // console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 必须return出来
  return config
})
axios.interceptors.response.use(config => {
  // 在response发起请求的时候加载进度条
  NProgress.done();
  return config

})

Vue.prototype.$http = axios

// 关闭vue的生产提示
Vue.config.productionTip = false

Vue.use(less)
// Vue.use(ElementUI)

Vue.component('tree-table', TreeTable)

// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

// 时间过滤器
Vue.filter('dateFormate', function (time) {
  const date = new Date(time)
  const years = date.getFullYear()
  // padStart第一个代表总长度为多少位，第二个表示如果不足多少位，用来填充
  const months = (date.getMonth() + 1 + '').padStart(2, '0')
  const days = (date.getDay() + '').padStart(2, '0')

  const hours = (date.getHours() + '').padStart(2, '0')
  const minutes = (date.getMinutes() + '').padStart(2, '0')

  const seconds = (date.getSeconds() + '').padStart(2, '0')

  return `${years}-${months}-${days} ${hours}:${minutes}:${seconds}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')