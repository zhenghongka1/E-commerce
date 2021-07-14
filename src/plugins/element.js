import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'



Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)

// Message弹窗要在全局配置下
Vue.prototype.$message = Message