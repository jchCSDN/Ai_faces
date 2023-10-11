<template>
  <div class="login">
    <catalog></catalog>
    <user></user>
    <div class="main">
      <div class="option">
        <div>
          <label>面板操作：</label>
          <el-button type="success" @click="fnOpen">启动摄像头</el-button>
          <el-button type="success" @click="fnClose">关闭摄像头</el-button>
        </div>
      </div>
      <div class="alert">
        <el-alert :title="title" :type="type" :description="detail" show-icon>
        </el-alert>
      </div>
      <div class="see">
        <video
          id="myVideo"
          ref="video"
          poster="../assets/img/huoti.svg"
          muted
          loop
          playsinline
          style="margin-left: 1.5px; margin-top: 1.5px"
        ></video>
        <div class="back"></div>
        <canvas id="myCanvas" style="display:none"></canvas>
        <div class="btn">
          <el-button
            type="primary"
            size="medium"
            style="width: 200px; height: 50px"
            :loading=load
            @click="fnLogin"
          >
            确认开始验证</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import * as faceapi from "face-api.js";
import catalog from '@/components/catalog'
import User from '@/components/user.vue';
export default {
  name: "login",
  components:{
    catalog,
    User
  },
  data() {
    return {
      nets: "tinyFaceDetector", // 模型
      options: null, // 模型参数
      detectFace: "detectSingleFace", // 单or多人脸
      videoEl: null,
      canvasEl: null,
      upload: true,
      canvasBoxEl: null,
      title: "提示",
      type: "info",
      detail: "请启动摄像头然后点击人脸识别按钮进行人脸识别",
      urlpng: "",
      load: false,
      timeout: 0,
      // 视频媒体参数配置
      constraints: {
        audio: false,
        video: {
          // ideal（应用最理想的）
          
           frameRate: {
            min: 15,
            ideal: 30,
            max: 60,
          },
          // frameRate受限带宽传输时，低帧率可能更适宜
          // 显示模式前置后置
          facingMode: "environment",
        },
      },
    };
  },
  watch: {
    nets(val) {
      this.nets = val;
      this.fnInit();
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.fnInit();
    });
  },
  methods: {
    // 初始化模型加载
    async fnInit() {
      await faceapi.nets[this.nets].loadFromUri("/models");
      // 根据模型参数识别调整结果
      switch (this.nets) {
        case "ssdMobilenetv1":
          this.options = new faceapi.SsdMobilenetv1Options({
            minConfidence: 0.5, // 0.1 ~ 0.9
          });
          break;
        case "tinyFaceDetector":
          this.options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 512, // 160 224 320 416 512 608
            scoreThreshold: 0.5, // 0.1 ~ 0.9
          });
          break;
        case "mtcnn":
          this.options = new faceapi.MtcnnOptions({
            minFaceSize: 20, // 0.1 ~ 0.9
            scaleFactor: 0.709, // 0.1 ~ 0.9
          });
          break;
      }
      // 节点属性化
      this.videoEl = document.getElementById("myVideo");
      this.canvasEl = document.getElementById("myCanvas");
      this.canvasBoxEl = document.getElementById("myCanvasBox");
    },
    // 节点对象执行递归识别绘制
    async fnLogin() {
      if (this.videoEl.paused) {
        this.$message({
          showClose: true,
          message: "请先打开摄像头",
          type: "warning",
        });
      }
      while (this.upload) {
        const result = await faceapi[this.detectFace](
          this.videoEl,
          this.options
        );
        if (result && !this.videoEl.paused) {
          this.load = true
         
          const dims = faceapi.matchDimensions(
            this.canvasEl,
            this.videoEl,
            true
          );
          const resizeResults = faceapi.resizeResults(result, dims);
          if (resizeResults._score > 0.82) {
            this.upload = false;
            let canvas = this.canvasEl;
            let video = this.videoEl;
            let ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, 400, 400);
            ctx.drawImage(video, 0, 0, 400, 400);
            let base64Img = canvas.toDataURL("image/png");
            let that = this;
            this.axios
              .post("face/user/login", {
                base64: base64Img,
              })
              .then((res) => {
                console.log(res);
               
                if(res.data.statusCode === 0){
                   if(res.data.msg === null){
                  that.title = "警告";
                that.type = "error";
                that.detail = "未能核实身份，请重试";
                that.load = false
                that.upload = true;
                } else{
                that.title = "成功";
                that.type = "success";
                that.detail = "识别成功，核实身份为"+res.data.msg;
                that.load = false
                that.upload = true;
                }
                }
                 if(res.data.statusCode === -1){
                that.title = "警告";
                that.type = "error";
                that.detail = "检测到异常的人脸识别行为";
                that.load = false
                that.upload = true;
                }   
              }).catch(function (error) {
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
            that.load = false
          } else {
            // 发送请求时出了点问题
            console.log("Error", error.message);
          }
          // console.log(error.config);
        });
          }
        }
      }
    },

    // 启动摄像头视频媒体
    fnOpen() {
      navigator.mediaDevices.getUserMedia({
                    video: true
                }).then(success => {
                    // 摄像头开启成功
                    this.$refs['video'].srcObject = success
                    // 实时拍照效果
                    this.$refs['video'].play()
                }).catch(error => {
                    console.error('摄像头开启失败，请检查摄像头是否可用！')
                })

    },
    // 成功启动视频媒体流
    fnSuccess(stream) {
      window.stream = stream; // 使流对浏览器控制台可用
      this.videoEl.srcObject = stream;
      this.videoEl.play();
      this.$message({
        showClose: true,
        message: "摄像头启动成功",
        type: "success",
      });
    },
    // 失败启动视频媒体流
    fnError(error) {
      console.log(error);
      this.$message({
        showClose: true,
        message: "摄像头启动失败，请刷新页面，或者检测摄像头是否被占用",
        type: "warning",
      });
    },
    // 结束摄像头视频媒体
    fnClose() {
       if (!this.$refs['video'].srcObject) return
                let stream = this.$refs['video'].srcObject
                let tracks = stream.getTracks()
                tracks.forEach(track => {
                    track.stop()
                })
                this.$refs['video'].srcObject = null

    },
  },
  beforeDestroy() {
    this.fnClose();
  },
};
</script>

<style scoped>
.login {
  display: flex;
  height: 100%;
}

#screenshotCanvas {
  display: none;
}
button {
  padding: 0 10px 0;
  cursor: pointer;
  height: 4vh;
  margin: 10px;
}
#myVideo{
  border-radius: 50%;
  background-color: #aadafe;
  object-fit: cover;
  width: 30vw;
  height: 54vh;
  overflow-clip-margin: content-box;
}
.back {
  position: absolute;
  z-index: -1;
  width: 20vw;
  height: 20vh;
  border: 1px solid rgb(155, 155, 155);
  background-color: #aadafe;
  border-radius: 50%;
}
.see {
  position: relative;
  display: flex;
 height: 60vh;
  padding-top: 2vh;
  align-items: flex-start;
  justify-content: center;
  border: 1px solid #cccccc;
  border-radius: 3px;
  transition: 0.2s; 
}
.see canvas {
  position: absolute;
  top: 1.5px;
  left: 1.5px;
   width: 20vw;
  height: 20vh;
}
.btn {
  position: absolute;
  bottom: 0vh;
}
</style>