<template>
  <div class="division">
    <catalog></catalog>
    <user></user>
    <div class="main">
      <div class="option">
        <div>
          <label>面板操作：</label>
          <el-button type="success" @click="fnOpen">启动摄像头</el-button>
          <el-button type="success" @click="fnClose">结束摄像头</el-button>
          <el-button type="success" @click="fnDivision" :loading=load>人像分割</el-button>
          <el-button type="message" @click="white">白底证件照</el-button>
          <el-button type="message" @click="blue">蓝底证件照</el-button>
          <el-button type="message" @click="red">红底证件照</el-button>
        </div>
      </div>
      <div class="alert">
        <el-alert :title="title" :type="type" :description="detail" show-icon>
        </el-alert>
      </div>
      <div class="see">
        <div class="title">
          原图
          <div class="video">
            <video
              id="myVideo"
              poster="../assets/img/renlian.svg"
              muted
              loop
              playsinline
            ></video>
            <canvas id="myCanvas" />
          </div>
        </div>
        <div class="bord"></div>
        <div class="title">
          效果图
          <div id="back">
            <img src="../assets/img/img.svg" id="myface"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as faceapi from "face-api.js";
import catalog from "../components/catalog.vue";
import User from '@/components/user.vue';
export default {
  name: "WebRTCFaceDetector",
  components: { catalog , User},
  data() {
    return {
      nets: "tinyFaceDetector", // 模型
      options: null, // 模型参数
      detectFace: "detectSingleFace", // 单or多人脸
      videoEl: null,
      canvasEl: null,
      upload: true,
      upimg: true,
      urlpng: "",
      load: false,
      myface: "",
      timeout: 0,
      title: "提示",
      type: "info",
      detail: "请打开摄像头，然后点击人像分割按钮进行人像分割",
      // 视频媒体参数配置
      constraints: {
        audio: false,
        video: {
          // ideal（应用最理想的）
          width: {
            min: 320,
            ideal: 400,
            max: 500,
          },
          height: {
            min: 240,
            ideal: 400,
            max: 502,
          },
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
      this.myface = document.getElementById('myface')
      var bg = document.getElementById('back')
    },
    red(){
      var bg = document.getElementById('back')
    bg.style.backgroundColor='#FF0100'
    },
    blue(){
      var bg = document.getElementById('back')
    bg.style.backgroundColor='#0085FE'
    },
    white(){
      var bg = document.getElementById('back')
    bg.style.backgroundColor='white'
    },
    // 节点对象执行递归识别绘制
    async fnDivision() {
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
           this.title = "提示";
          this.type = "warning";
          this.detail =
            "正在人像分割，请正面平视摄像头、保证光线充足，请勿遮挡面部";
          const dims = faceapi.matchDimensions(
            this.canvasEl,
            this.videoEl,
            true
          );
          const resizeResults = faceapi.resizeResults(result, dims);
          if (resizeResults._score > 0.81) {
            this.upload = false;
            console.log(resizeResults._score);
            let canvas = this.canvasEl;
            let video = this.videoEl;
            let ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            let base64Img = canvas.toDataURL("image/png");
            const request = require("request");
            var requestFunc = {
              get(url) {
                return new Promise(function (resolve, reject) {
                  request(url, function (err, response, body) {
                    //err 当前接口请求错误信息
                    //response 一般使用statusCode来获取接口的http的执行状态
                    //body 当前接口response返回的具体数据 返回的是一个jsonString类型的数据
                    //需要通过JSON.parse(body)来转换
                    if (!err && response.statusCode == 200) {
                      resolve(body);
                    } else {
                      reject(body);
                    }
                  });
                });
              },
              post(url, params) {
                return new Promise(function (resolve, reject) {
                  var requestData = params;
                  request(
                    {
                      url: url,
                      method: "POST",
                      json: true,
                      headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Accept: "application/json",
                      },
                      form: {
                        image: base64Img,
                      },
                      body: requestData,
                    },
                    function (error, response, body) {
                      if (!error && response.statusCode == 200) {
                        resolve(body);
                      } else {
                        reject(body);
                      }
                    }
                  );
                });
              },
            };
            const url =
              "https://aip.baidubce.com/rest/2.0/image-classify/v1/body_seg?access_token=24.269b3d055877169b9b7750c5c773c764.2592000.1683541202.282335-29780577";
            const params = {
              text: "",
            };
            requestFunc.post(url, params).then((res) => {
              console.log(res);
              this.urlpng = res.foreground;
              this.upimg = false;
              this.load = false
              this.upload = true;
              this.myface.src= 'data:image/png;base64,' +  this.urlpng
               console.log(this.urlpng);
              this.title = "成功";
              this.type = "success";
              this.detail = "人像精细分割成功，右图为效果图";
            });
           
          }
        }
      }
    },
    async fnRun() {
      console.log("Run");
      // 识别绘制人脸信息
      const result = await faceapi[this.detectFace](this.videoEl, this.options);
      if (result && !this.videoEl.paused) {
        const dims = faceapi.matchDimensions(this.canvasEl, this.videoEl, true);
        const resizeResults = faceapi.resizeResults(result, dims);
        faceapi.draw.drawDetections(this.canvasEl, resizeResults);
      } else {
        this.canvasEl
          .getContext("2d")
          .clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
      }
      this.timeout = setTimeout(() => this.fnRun());
    },
    // 启动摄像头视频媒体
    fnOpen() {
      if (typeof window.stream === "object") return;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        clearTimeout(this.timeout);
        navigator.mediaDevices
          .getUserMedia(this.constraints)
          .then(this.fnSuccess)
          .catch(this.fnError);
      }, 300);
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
      alert("视频媒体流获取错误" + error);
      this.$message({
        showClose: true,
        message: "摄像头启动失败，请刷新页面，或者检测摄像头是否被占用",
        type: "warning",
      });
    },
    // 结束摄像头视频媒体
    fnClose() {
      this.canvasEl
        .getContext("2d")
        .clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
      this.videoEl.pause();
      clearTimeout(this.timeout);
      if (typeof window.stream === "object") {
        window.stream.getTracks().forEach((track) => track.stop());
        window.stream = "";
        this.videoEl.srcObject = null;
      }
    },
  },
  beforeDestroy() {
    this.fnClose();
  },
};
</script>

<style scoped>
.division {
  height: 100%;
  display: flex;
}
button {
  padding: 0 10px 0;
  cursor: pointer;
  height: 4vh;
  margin: 10px;
}
.see{
  padding: 30px;
}
.see canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 400px;
  height: 400px;
}
.video {
  top: 5%;
  position: relative;
  width: 400px;
  height: 400px;
  border: 1px solid rgb(155, 155, 155);
  background-color: #aadafe;
}
#back {
  position: relative;
  top: 5%;
  width: 400px;
  height: 400px;
  background-color: #fdfdfd;
}
/* .see img {
  width: 100%;
} */
.bord {
  margin-top: 40px;
  width: 1px;
  height: 400px;
  background-color: rgb(92, 87, 87);
}
</style>
