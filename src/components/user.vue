<template>
  <div id="user">
      <div class="bg">
          <i class="el-icon-user-solid"></i>
      </div>
      <div class="font">{{username}}</div>
  </div>
</template>

<script>
export default {
  name: "user",
  data(){
    return{
      username: ""  
    }
  },
  mounted(){
    this.username =   this.$store.state.pathName
  }
}
</script>

<style>
   #user {
       position: absolute;
       top: 2%;
       right: 1%;
   }
   .bg{
       background-color: rgb(92, 92, 91);
       width: 45px;
       height: 45px;
       border-radius: 50%;
       text-align: center;
       line-height: 45px;
       font-size: 30px;
       color: white;
   }
   .font {
       margin-top: 2px;
       text-align: center;
       color: rgb(5, 5, 5);
   }
</style>