import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import '@fortawesome/fontawesome-free/css/all.css'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import store from './stores'

import App from './App.vue'

const pinia = createPinia() // 创建pinia实例
const app = createApp(App) // 创建vue实例

app.use(pinia) // 使用pinia实例
app.use(router) // 使用路由实例
pinia.use(createPersistedState()) // 使用pinia插件
app.use(Antd)
app.use(store)
app.mount('#app')
