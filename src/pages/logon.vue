<template>
  <div class="logon">
    <catalog></catalog>
    <user></user>
    <div class="main">
      <div class="option">
        <div>
          <label>面板操作：</label>
          <el-button type="success" @click="fnOpen">启动摄像头</el-button>
          <el-button type="success" @click="fnClose">关闭摄像头</el-button>
          <el-button type="success" @click="fnCollect" :loading="load"
            >人脸收集</el-button
          >
        </div>
      </div>
      <div class="alert">
        <el-alert :title="title" :type="type" :description="detail" show-icon>
        </el-alert>
      </div>
      <div class="see">
        <video
          id="myVideo"
          poster="../assets/img/renlian.svg"
          muted
          loop
          playsinline
          style="margin-left: 1.5px; margin-top: 1.5px"
        ></video>
        <div class="back"></div>
        <canvas id="myCanvas" style="display: none"></canvas>
      </div>
    </div>
    <el-button
      type="text"
      @click="dialogVisible = true"
      style="display: none"
    ></el-button>
    <el-dialog
      title="截取人脸成功，是否保存到人脸库"
      :visible.sync="dialogVisible"
      width="430px"
      :before-close="handleClose"
    >
      <img
        :src="urlpng"
        style="width: 330px; hight: 280px; padding: 0 45px 0"
      />
      <div style="margin-left: 50px; margin-top: 10px">
        提交备注：
        <el-input style="width: 50%" v-model="input" placeholder="请输入内容">
        </el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button
          type="primary"
          slot="reference"
          @click="preserve"
          :disabled="disable"
          :loading="loader"
          >保 存</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import * as faceapi from "face-api.js";
import catalog from "../components/catalog.vue";
import User from '@/components/user.vue';
export default {
  name: "logon",
  components: { catalog, User },
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
      detail: "请启动摄像头然后点击人脸收集按钮进行人脸采集",
      urlpng: "",
      input: "",
      load: false,
      loader: false,
      timeout: 0,
      disable: true,
      dialogVisible: false,
      // 视频媒体参数配置
      constraints: {
        audio: false,
        video: {
          // ideal（应用最理想的）
          width: {
            min: 400,
            ideal:400,
            max: 400,
          },
          height: {
            min: 400,
            ideal:400,
            max: 400,
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
      this.canvasBoxEl = document.getElementById("myCanvasBox");
    },
    // 节点对象执行递归识别绘制
    async fnCollect() {
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
          this.load = true;
          this.title = "提示";
          this.type = "warning";
          this.detail =
            "正在人脸收集，请正面平视摄像头、保证光线充足，请勿遮挡面部";
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
            ctx.clearRect(0, 0, 400, 400);
            ctx.drawImage(video, 0, 0, 400, 400);
            let base64Img = canvas.toDataURL("image/png");
            this.urlpng = base64Img;
            this.dialogVisible = true;
            setInterval(() => {
              if (this.input != "") {
                this.disable = false;
              }
              if (this.input == "") {
                this.disable = true;
              }
            }, 1000);
          }
        }
      }
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
    handleClose() {
      this.dialogVisible = false;
      this.upload = true;
      this.input = "";
      this.load = false;
      this.loader = false;
      this.title = "提示";
      this.type = "info";
      this.detail = "请启动摄像头然后点击人脸收集按钮进行人脸采集";
    },
    preserve() {
      this.loader = true;
      this.upload = true;
      let input = this.input;
      let base64Img = this.urlpng;
      let that = this;
      that.axios
        .post("face/user/register", {
          base64: base64Img,
          name: input,
        })
        .then((res) => {
          console.log(res);
          that.title = "成功";
          that.type = "success";
          that.detail = "人脸已上传到数据库";
          that.dialogVisible = false;
          that.load = false;
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
            that.input = "";
            that.dialogVisible = false;
            that.load = false;
            that.loader = false;
          } else {
            // 发送请求时出了点问题
            console.log("Error", error.message);
          }
          // console.log(error.config);
          that.dialogVisible = false;
          that.input = "";
          that.load = false;
          that.title = "提示";
          that.type = "info";
          that.detail = "请启动摄像头然后点击人脸收集按钮进行人脸采集";
          that.loader = false;
        });
    },
  },
  beforeDestroy() {
    this.fnClose();
  },
};
</script>

<style scoped>
.logon {
  display: flex;
  height: 100%;
}
#myVideo {
  background-color: #aadafe;
  width: 400px;
  height: 400px;
}
#screenshotCanvas {
  display: none;
}
button {
  padding: 0 10px 0;
  cursor: pointer;
  height: 30px;
  margin: 10px;
}
.back {
  position: absolute;
  z-index: -1;
  width: 400px;
  height: 400px;
  border: 1px solid rgb(155, 155, 155);
  background-color: rgb(236, 236, 236);
}
.see canvas {
  position: absolute;
  top: 1.5px;
  left: 1.5px;
}
</style>