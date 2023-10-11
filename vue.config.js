const { defineConfig } = require('@vue/cli-service')

const NodePolyfillPlugin = require('node-polyfill-webpack-plugin') 
module.exports ={
  publicPath: './',
    lintOnSave: true,
    configureWebpack: {
        //关闭 webpack 的性能提示
        performance: {
            hints:false
        }
    
    },
  
productionSourceMap:true,
chainWebpack:(config)=>{
  config.plugins.delete('prefetch');
},
  configureWebpack: {
    resolve: {
      alias:{
      'vue$':'vue/dist/vue.js'
      },
      fallback: {
        fs: false,
        net: false,
	      tls: false,
      },
    },
    plugins: [new NodePolyfillPlugin()],
   
  }, 
 
  transpileDependencies: true
}





