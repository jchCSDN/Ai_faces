<template>
  <div class="contrast">
    <catalog></catalog>
    <user></user>
    <div class="main">
      <div class="option">
        <div class="org">
          <label>面板操作：</label>
          <span>图一：</span>
          <input
            type="file"
            id="file"
            ref="fileId1"
            accept="image/png, image/jpeg"
            @change="fnChange($event, 'org')"
          />
          <span>图二：</span>
          <input
            type="file"
            id="file"
            ref="fileId2"
            accept="image/png, image/jpeg"
            @change="fnChange($event, 'det')"
          />
          <el-button type="success" @click="contrast" :loading="loader"
            >开始对比</el-button
          >
        </div>
      </div>
      <div class="alert">
        <el-alert
          :title="title"
          :type="type"
          :description="detail"
          show-icon
        >
        </el-alert>
      </div>
      <div class="see">
        <div class="title">图一
        <div class="back">
          <img src="../assets/img/img.svg" id="orgImg" />
        </div>
        </div>
        <div class="bord"></div>
        <div class="title">图二
        <div class="back">
          <img src="../assets/img/img.svg" id="detImg" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as faceapi from "face-api.js";
import catalog from "../components/catalog.vue";
import user from '@/components/user'
import User from '@/components/user.vue';
export default {
  name: "contrast",
  components: { catalog,user, User},
  data() {
    return {
      desc: [], // 样本矩阵
      orgImgEl: null,
      detImgEl: null,
      title: "提示",
      type: "info",
      detail: "请在上面控制面板选择两张图片进行对比",
      xlsxFile1: "",
      xlsxFile2: "",
      loader: false,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.fnInit();
    });
  },
  methods: {
    // 初始化模型加载
    getFile() {
      //获取file内容
      let files1 = this.$refs.fileId1.files[0];
      this.xlsxFile1 = files1 || "";
      let files2 = this.$refs.fileId2.files[0];
      this.xlsxFile2 = files2 || "";
    },
    fnInit() {
      // 节点属性化
      this.orgImgEl = document.getElementById("orgImg");
      this.detImgEl = document.getElementById("detImg");
    },

    contrast() {
      let that = this;
      if (that.xlsxFile2 == "" || that.xlsxFile1 == "") {
         this.$message({
          showClose: true,
          message: '请先添加图片，再上传到后台对比'
        });
        return
      } else {
        that.loader = true;
      }

      // vue 中使用 window.FormData(),否则会报 'FormData isn't definded'
      //创建一个FormData对象，然后通过append() 方法向对象中添加键值对
      let formData = new window.FormData();
      formData.append("picture1", that.xlsxFile1);
      formData.append("picture2", that.xlsxFile2);
      // that.importUrl 上传的接口url
      that.axios
        .post("face/similar", formData)
        .then(function (response) {
          that.$message({
          showClose: true,
          message: '上传成功',
          type: "success"
        });
        let similar = Number(response.data.similar).toFixed(2)
        if(response.data.similar>0.8||response.data.similar==0.8){
         that.title = "成功";
            that.type = "success";
            that.detail = "人脸相似度"+similar+',可以判定为同一个人';
        }
        if(response.data.similar<0.8&&response.data.similar>0){
         that.title = "警告";
            that.type = "error";
            that.detail = "人脸相似度"+similar+',不可以判定为同一个人';
        }
        if(response.data.similar== -1 ){
         that.title = "警告";
            that.type = "warning";
            that.detail = "未检测出人脸";
        }
          
          that.loader = false;
        
        })
        .catch(function (error) {
          if (error.response) {
            // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            // 请求已经成功发起，但没有收到响应
            // `error.request` 在浏览器中是 XMLHttpRequest 的实例，
            // 而在node.js中是 http.ClientRequest 的实例
            that.title = "错误";
            that.type = "error";
            that.detail = "请求已经成功发起，但没有收到响应";
            console.log("sdsd");
          } else {
            // 发送请求时出了点问题
            console.log("Error", error.message);
          }
          // console.log(error.config);
          that.loader = false;
        });
    },
    fnChange(e, el) {
      if (!e.target.files.length) return;
      // 将文件显示为图像并识别
      faceapi.bufferToImage(e.target.files[0]).then((img) => {
        this[el + "ImgEl"].src = img.src;
        this.getFile();
      });
    },
  },
};
</script>

<style scoped>
.contrast {
  display: flex;
  height: 100%;
}
.see img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.see{
  padding: 30px;
}
.bord {
  width: 1px;
  height: 400px;
  background-color: rgb(92, 87, 87);
}
.back {
  width: 400px;
  height: 400px;
  border: 2px solid rgb(0, 0, 0);
  background-color: #718FEF;
}

</style>
