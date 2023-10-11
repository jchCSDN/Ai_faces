<template>
  <div id="catalog">
    
    <div id="nav">
      <div class="logo"><i class="iconfont icon-renlian"></i><div>安全的人脸识别认证系统</div></div>
      <ul>
        <li class="iconfont" :class="{'checked':item.path===$route.path}" v-for="(item, index) in $router.options.routes" :key="index">
          <router-link :to="item.path" v-text="item.name"></router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "catalog",
};
</script>

<style>

#catalog {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  flex-direction: row;
}
.logo{
  width: 13vw;
  height: 10vh;
  padding: 2vh;
  text-align: center;
  background-color: #36304a;
  font-weight: bolder;
  color: whitesmoke;

}
#nav {
 min-width: 13vw;
  border-right: 1px solid #f1ebeb;
  background-color: #fff;
 background:linear-gradient(to bottom, #35354f, #2e727b);
}


#nav li {
  color: white;
 box-sizing: border-box;
 padding-left: 20%;
  list-style: none; 
  width: 100%;
  line-height: 50px;
  text-align: left;
 letter-spacing: 1px;
}
#nav li a{
  display: inline-block;
  width: 9vw;
  color: white;
}
#nav li::before{
  font-size: 20px;
   padding-right: 10px;
}
#nav li:nth-child(1)::before {
  content: "\e64f";
}
#nav li:nth-child(2) {
  display: none;
}
#nav li:nth-child(3) {
  display: none;
}
#nav li:nth-child(4)::before {
  content: "\e665";
}
#nav li:nth-child(5)::before {
   content: "\e6d6";
}
#nav li:nth-child(6)::before {
    content: "\e9d4";
}
#nav li:nth-child(7)::before{
  content: "\e8a4";
}
#nav li:nth-child(8)::before{
    content: "\e628";
    font-size: 15px;
}
#nav li:nth-child(9)::before{
    content: "\e6e5";
    font-size: 16px;
}
#nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
 
}

#nav a.router-link-exact-active {
  color: #5dd6f1;
  
}
.checked {
  background-color: #1d243e;
  border-left: 4px solid #4095ce;
  color: #5dd6f1;
}
.checked::before {
  color: #5dd6f1;
}
#nav li:hover::before{
  color: #5dd6f1;
}
#nav a:hover 
{
 color: #5dd6f1;
 transition: all 0.5s;
  
}

</style>

