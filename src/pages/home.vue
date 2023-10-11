<template class="home">
  <div class="Base-Color">
    <h3 class="title">安全的人脸识别认证系统</h3>
    <div class="show">
      <img src="../../public/people.webp" class="people" />
    </div>
      <router-link to="/shou" class="confirm">人脸注册</router-link>
    <router-link to="/index" class="confirm">开始人脸验证</router-link>  
  </div>
</template>

<script>
export default {
  name: "home",
  data() {
    return {};
  },
  mounted() {},
  methods: {},
};
</script>

<style scoped>
.Base-Color {
  text-align: center;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  background-image: url(/public/homeback.webp);
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  overflow: auto;
}
.title {
  margin: 0;
  height: 50px;
  line-height: 50px;
  font-size: 20px;
  color: aliceblue;
  background-color: #1F99F4;
}
.show {
  margin: 50px auto;
  border-radius: 40px;
  width: 666.66px;
  height: 400px;
  background-color: rgb(0, 0, 0, 0.5);
}
.people {
  width: 400px;
}
.confirm {
  font-weight: bolder;
  margin-right: 30px;
  text-decoration: none;
  display: inline-block;
  width: 150px;
  line-height: 50px;
  height: 50px;
  color: rgb(0, 0, 0);
  border-radius: 50px;
  background-color: #6bcbf8;
  transition: all 0.5s;
  font-size: 18px;
}
.confirm:hover {
  background-color: rgb(60, 87, 226);
  color: aliceblue;
}
</style>