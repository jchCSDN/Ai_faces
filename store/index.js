import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
const store = new Vuex.Store({
    state:{
        pathName: "",
      
    },
    mutations:{
        // 保存当前菜单栏的路径
        savePath(state,pathName){
            state.pathName = pathName;
        },
 
    }
})
export default store