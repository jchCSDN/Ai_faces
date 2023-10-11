<template>
  <div class="detection">
    <catalog></catalog>
    <user></user>
    <div class="main">
      <div class="option">
        <div>
          <label  style="margin-left:2px">面板操作：</label>
          <el-button type="success" @click="fnOpen">启动摄像头</el-button>
          <el-button type="success" @click="fnClose">关闭摄像头</el-button>
          <label style="margin-left:1vw"> 人脸关键点检测:</label>
          <el-switch
            v-model="withBoxes"
            active-color="#409eff"
            inactive-color="#dcdfe6"
          >
          </el-switch>
          <label style="margin-left:2vw">检测识别类型：</label>
          <el-select
            style="width: 10vw"
            v-model="detection"
            placeholder="请选择"
          >
            <el-option
              v-for="item in option2"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <label style="margin-left: 3vw">检测人脸：</label>
          <el-radio-group v-model="detectFace" size="middle">
            <el-radio
              label="detectSingleFace"
              style="margin-left:0vw; margin-right: 0vw"
              >单张人脸</el-radio
            >
            <el-radio label="detectAllFaces" style="margin-right: 2vw"
              >多张人脸</el-radio
            >
          </el-radio-group>
        </div>
      </div>
        <div class="alert">
        <el-alert :title=title type="info" description="人脸不要离摄像头太近，容易检测不到人脸" show-icon>
        </el-alert>
      </div>
      <div class="see">
        <div class="video">
          <video
            id="myVideo"
            muted
            loop
            playsinline
            @loadedmetadata="fnRun"
            class="page-record-video-obj"
          ></video>
          <canvas id="myCanvas" />
          <div class="img-corner">
            <span class="img-corner-co img-0"></span>
            <span class="img-corner-co img-1"></span>
            <span class="img-corner-co img-2"></span>
            <span class="img-corner-co img-3"></span>
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
  components: { catalog, User },
  name: "WebRTCFaceRecognition",
  data() {
    return {
      option2: [
        {
          value: "landmark",
          label: "普通检测",
        },
        {
          value: "expression",
          label: "表情检测",
        },
        {
          value: "age_gender",
          label: "年龄检测",
        },
      ],
      title: "提示",
      nets: "tinyFaceDetector", // 模型
      options: null, // 模型参数
      withBoxes: false, // 框or轮廓
      detectFace: "detectSingleFace", // 单or多人脸
      detection: "landmark",
      videoEl: null,
      canvasEl: null,
      timeout: 0,
      face: 0,
      // 视频媒体参数配置
      constraints: {
        audio: false,
        video: {
          // ideal（应用最理想的）
          // width: {
          //   min: 320,
          //   ideal: 680,
          //   max: 700,
          // },
          // height: {
          //    min: 240,
          //   ideal: 480,
          //   max: 580,
          // },
            frameRate: {
            min: 15,
            ideal: 30,
            max: 60,
          },
          // frameRate受限带宽传输时，低帧率可能更适
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
    detection(val) {
      this.detection = val;
      this.videoEl.pause();
      setTimeout(() => {
        this.videoEl.play();
        setTimeout(() => this.fnRun(), 100);
      }, 1000);
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
      await faceapi.nets[this.nets].loadFromUri("/models"); // 算法模型
      await faceapi.loadFaceLandmarkModel("/models"); // 轮廓模型
      await faceapi.loadFaceExpressionModel("/models"); // 表情模型
      await faceapi.loadAgeGenderModel("/models"); // 年龄模型
      // 根据算法模型参数识别调整结果
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
    },
    // 人脸面部勘探轮廓识别绘制
    async fnRunFaceLandmark() {
      if (this.videoEl.paused) return clearTimeout(this.timeout);
      // 识别绘制人脸信息
      const result = await faceapi[this.detectFace](
        this.videoEl,
        this.options
      ).withFaceLandmarks();
      if (result && !this.videoEl.paused) { 
        const dims = faceapi.matchDimensions(this.canvasEl, this.videoEl, true);
         const resizeResult = faceapi.resizeResults(result, dims);
        this.withBoxes
          ? faceapi.draw.drawFaceLandmarks(this.canvasEl, resizeResult)
          : faceapi.draw.drawDetections(this.canvasEl, resizeResult);
         
      } else {
        this.canvasEl
          .getContext("2d")
          .clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
      }
      this.timeout = setTimeout(() => this.fnRunFaceLandmark());
    },
    // 人脸表情识别绘制
    async fnRunFaceExpression() {
      if (this.videoEl.paused) return clearTimeout(this.timeout);
      // 识别绘制人脸信息
      const result = await faceapi[this.detectFace](this.videoEl, this.options)
        .withFaceLandmarks()
        .withFaceExpressions();
      if (result && !this.videoEl.paused) {
        const dims = faceapi.matchDimensions(this.canvasEl, this.videoEl, true);
        const resizeResult = faceapi.resizeResults(result, dims);
        this.withBoxes
          ? faceapi.draw.drawFaceLandmarks(this.canvasEl, resizeResult)
          : faceapi.draw.drawDetections(this.canvasEl, resizeResult);
        faceapi.draw.drawFaceExpressions(this.canvasEl, resizeResult, 0.05);
      } else {
        this.canvasEl
          .getContext("2d")
          .clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
      }
      this.timeout = setTimeout(() => this.fnRunFaceExpression());
    },
    // 年龄性别识别绘制
    async fnRunFaceAgeAndGender() {
      if (this.videoEl.paused) return clearTimeout(this.timeout);
      // 识别绘制人脸信息
      const result = await faceapi[this.detectFace](this.videoEl, this.options)
        .withFaceLandmarks()
        .withAgeAndGender();
      if (result && !this.videoEl.paused) {
        const dims = faceapi.matchDimensions(this.canvasEl, this.videoEl, true);
        const resizeResults = faceapi.resizeResults(result, dims);
        this.withBoxes
          ? faceapi.draw.drawFaceLandmarks(this.canvasEl, resizeResults)
          : faceapi.draw.drawDetections(this.canvasEl, resizeResults);
        if (Array.isArray(resizeResults)) {
          resizeResults.forEach((result) => {
            const { age, gender, genderProbability } = result;
            new faceapi.draw.DrawTextField(
              [
                `${Math.round(age, 0)} years`,
                `${gender} (${Math.round(genderProbability)})`,
              ],
              result.detection.box.bottomLeft
            ).draw(this.canvasEl);
          });
        } else {
          const { age, gender, genderProbability } = resizeResults;
          new faceapi.draw.DrawTextField(
            [
              `${Math.round(age, 0)} years`,
              `${gender} (${Math.round(genderProbability)})`,
            ],
            resizeResults.detection.box.bottomLeft
          ).draw(this.canvasEl);
        }
      } else {
        this.canvasEl
          .getContext("2d")
          .clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
      }
      this.timeout = setTimeout(() => this.fnRunFaceAgeAndGender());
    },
    // 执行检测识别类型
    fnRun() {
      if (this.detection === "landmark") {
        this.fnRunFaceLandmark();
        return;
      }
      if (this.detection === "expression") {
        this.fnRunFaceExpression();
        return;
      }
      if (this.detection === "age_gender") {
        this.fnRunFaceAgeAndGender();
        return;
      }
    },
    // 启动摄像头视频媒体
    fnOpen() {
    
        navigator.mediaDevices
          .getUserMedia(this.constraints)
          .then(this.fnSuccess)
          .catch(this.fnError);
    
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
.detection {
  display: flex;
  height: 100%;
}
button {
  cursor: pointer;
  height: 4vh;
  padding: 5px;
  color: white;
 
}
.see {
  position: relative;
  display: flex;
  margin: 0 auto;
   width: 70vw;
   margin-top: 2vh;
  align-items: center;
  justify-content: center;
  border: 1px solid #cccccc;
  border-radius: 3px;
  transition: 0.2s;
  background-color: #e0e0e0;
}
.see canvas {
  position: absolute;
  top: 0;
  left: 0;
   width: 46vw;
  height: 65vh;
}
.option div {
  padding: 3px;
  margin-top: 0px;
}
.img-corner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
}
.img-0 {
  left: 20px;
  top: 20px;
  -webkit-transform: rotate(-90deg);
  -moz-transform: rotate(-90deg);
  -ms-transform: rotate(-90deg);
  transform: rotate(-90deg);
}
.img-1 {
  right: 20px;
  top: 20px;
}
.img-2 {
  left: 20px;
  bottom: 20px;
  -webkit-transform: rotate(180deg);
  -moz-transform: rotate(180deg);
  -ms-transform: rotate(180deg);
  transform: rotate(180deg);
}
.img-3 {
  right: 20px;
  bottom: 20px;
  -webkit-transform: rotate(90deg);
  -moz-transform: rotate(90deg);
  -ms-transform: rotate(90deg);
  transform: rotate(90deg);
}
.img-corner-co {
  display: block;
  position: absolute;
  z-index: 2;
  width: 20px;
  height: 20px;
  background: url(../assets/img/icon2.png) no-repeat;
  -moz-background-size: cover;
  background-size: cover;
}
.video {
  width: 46vw;
  height: 65vh;
  position: relative;
  overflow: hidden;
  background-color: #fff;
}
.page-record-video-obj {
   width: 46vw;
  height: 65vh;
  object-fit: cover;
}
</style>
