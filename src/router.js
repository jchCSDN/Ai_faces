import Vue from 'vue'
import Router from 'vue-router'
import Home from './pages/home.vue'
import Contrast from './pages/contrast.vue'
import Logon from './pages/logon.vue'
import Login from './pages/login.vue'
import Facedetection from './pages/facedetection.vue'
import Division from './pages/division.vue'
import Gallery from './pages/gallery.vue'
import Index from './pages/index.vue'
import Shou from './pages/shou.vue'
Vue.use(Router);

export default new Router({
    routes:[
        {
            path:'/',
            name:'系统首页',   
            redirect:'/home'
        },
        {
            path:'/home',
            component: Home
        },
        {
            path: '/index',
            component: Index
        },
        {
            path:'/contrast',
            name:'人脸比对',
            component: Contrast     
        },
        {
            path: '/logon',
            name: '人脸录入',
            component: Logon
        },
        {
            path: '/login',
            name: '人脸识别',
            component: Login
        },
        {
            path: '/gallery',
            name: '人员管理',
            component: Gallery
        },
        {
            path: '/face',
            name: '人脸关键点',
            component: Facedetection
        },
        {
            path: '/division',
            name: '人像分割',
            component: Division
        },
        {
            path: '/shou',
            name: '',
            component: Shou
        },

    ]
})