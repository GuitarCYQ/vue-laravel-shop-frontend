import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 全局导入公共样式（关键！）
import '@/assets/css/common/common.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)



app.mount('#app')
