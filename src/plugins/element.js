import Vue from 'vue'
import {
    Aside, Breadcrumb, BreadcrumbItem, Button, Card, Col, Container, Dialog, Form, FormItem, Header, Input, Main, Menu,
    MenuItem, MenuItemGroup, Message, Option, Pagination, Row, Submenu, Switch, Table, TableColumn, Tooltip,MessageBox
} from 'element-ui'



Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItemGroup)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Option)
Vue.use(Col)
Vue.use(Row)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)


// Message弹窗要在全局配置下
Vue.prototype.$message = Message

Vue.prototype.$confirm = MessageBox.confirm