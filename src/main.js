import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import router from './router'
import axios from 'axios'
import VueAxios from "vue-axios";
import store from '../store'

import "@/assets/scss/iconfont/iconfont.css";
Vue.use(VueAxios, axios);
Vue.use(ElementUI)
axios.defaults.baseURL = "http://8.134.108.219:8080";


Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
