<template>
  <div class="login">
    <div class="main" id="bg">
      <div class="info">
        {{ title }}
      </div>
      <div class="video">
        <video
          id="myVideo"
          ref="video"
          muted
          loop
          playsinline
          style="margin-left: 1.5px; margin-top: 1.5px;"
        ></video>
        <canvas id="myCanvas" style="display: none"></canvas>
        <div class="kuang"></div>
      </div>
    </div>
  </div>
</template>
<script>
import * as faceapi from "face-api.js";

export default {
  name: "index",
  data() {
    return {
      nets: "tinyFaceDetector", // 模型
      options: null, // 模型参数
      detectFace: "detectSingleFace", // 单or多人脸
      videoEl: null,
      canvasEl: null,
      upload: true,
      title: "请面向屏幕,并且张开嘴",
      canvasBoxEl: null,
      urlpng: "",
      loading: false,
      timeout: 0,
      // 视频媒体参数配置
      constraints: {
        audio: true,
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
      this.fnOpen();
      await faceapi.nets[this.nets].loadFromUri("/models"); // 算法模型
      await faceapi.loadFaceLandmarkModel("/models"); // 轮廓模型
      await faceapi.loadFaceExpressionModel("/models"); // 表情模型
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
      var bg = document.getElementById("bg");
      setTimeout(() => {
        this.fnLogin();
      }, 500);
    },
    async fnRun() {
      const result = await faceapi[this.detectFace](this.videoEl, this.options)
        .withFaceLandmarks()
        .withFaceExpressions();
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

      if (result != undefined && this.upload == true) {
        if (result.expressions.surprised > 0.9) {
          this.title = "做出一个微笑表情";
        }
        if (
          result.expressions.happy > 0.97 &&
          this.title == "做出一个微笑表情"
        ) {
          this.title = "请表情自然，保持面向屏幕";
          setTimeout("bg.style.backgroundColor='#544B4B';", 100);
          setTimeout("bg.style.backgroundColor='#0451EE';", 500);
          setTimeout("bg.style.backgroundColor='#30FF04';", 900);
          setTimeout("bg.style.backgroundColor='#FF0404';", 1300);
          setTimeout("bg.style.backgroundColor='#FFFD04';", 1700);
          setTimeout("bg.style.backgroundColor='#dddddd';", 2000);

          setTimeout(() => {
            this.loading = this.$loading({
              lock: true,
              text: "识别中",
              spinner: "el-icon-loading",
              background: "rgba(0, 0, 0, 0.3)",
            });
          }, 2000);
    
         
         
          let canvas = this.canvasEl;
          let video = this.videoEl;
          let ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, 500, 500);
          ctx.drawImage(video, 0, 0, 500, 500);
          let base64Img = canvas.toDataURL("image/png");
          let that = this;
          setTimeout(
            () =>
              this.axios
                .post("face/user/login", {
                  base64: base64Img,
                })
                .then((res) => {
                  console.log(res);

                  if (res.data.statusCode === 0) {
                    if (res.data.msg === null) {
                      that.upload = false;
                      that.title = "未能核实身份，请重试";
                      that.loading.close();
                     this.$alert(
                        "未能核实身份，请重试",
                        "识别失败",
                        {
                          confirmButtonText: "确定",
                          callback: (action) => {
                            that.upload = true;
                            that.title = "请面向屏幕,并且张开嘴";
                          },
                        }
                      );
                    } else {
                      that.upload = false;
                      that.$store.commit('savePath',res.data.msg)
                      this.$alert(
                        "核实身份为" + res.data.msg + ",准备跳转到系统页面",
                        "识别成功",
                        {
                          confirmButtonText: "确定",
                          callback: (action) => {
                            this.$router.push("/contrast");
                          },
                        }
                      );
                      that.title =
                        "识别成功，核实身份为" +
                        res.data.msg +
                        ",准备跳转到系统页面";
                      that.loading.close();
                    }
                  }
                  if (res.data.statusCode === -1) {
                    that.title = "警告，检测到异常的人脸识别行为";
                    that.loading.close();
                   that.upload = false;
                    this.$alert(
                        "检测到异常的人脸识别行为",
                        "警告",
                        {
                          confirmButtonText: "确定",
                          callback: (action) => {
                            that.upload = true;
                            that.title = "请面向屏幕,并且张开嘴";
                          },
                        }
                      );
                  }
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
                     that.loading.close();
                      this.$alert(
                        "请求已经成功发起，但没有收到响应",
                        "警告",
                        {
                          confirmButtonText: "确定",
                          callback: (action) => {
                            that.upload = true;
                            that.title = "请面向屏幕,并且张开嘴";
                          },
                        }
                      );
                  } else {
                    // 发送请求时出了点问题
                    console.log("Error", error.message);
                  }
                  // console.log(error.config);
                }),
            1900
          );
          
        }
      }
    },
    // 节点对象执行递归识别绘制
    async fnLogin() {
      // while (this.upload) {
      this.fnRun();
      this.timeout = setTimeout(() => this.fnLogin(), 100);
      // }
    },

    // 启动摄像头视频媒体
    fnOpen() {
    
       navigator.mediaDevices.getUserMedia(
                   {
            video: true,
            width: {
            min: 500,
            ideal:500,
            max: 500,
          },
          height: {
            min: 500,
            ideal:500,
            max: 500,
          },
          frameRate: {
            min: 15,
            ideal: 30,
            max: 60,
          },
                   }
                ).then(success => {
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
    },
    // 失败启动视频媒体流
    fnError(error) {
      console.log(error);
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
.main {
  background-color: #dddddd;
}
.info {
  margin: 0 auto;
  width: 50vw;
  text-align: center;
  font-size: 25px;
  margin-top: 5vh;
}
.video {
  margin-top: 10px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  width: 500px;
  height: 500px;
}
#myVideo {
  position: absolute;
  border-radius: 50%;
  width: 500px;
  height: 500px;
  object-fit: cover;
  overflow-clip-margin: content-box;
}
canvas {
  position: absolute;
  top: 1.5px;
  left: 1.5px;
}
.kuang {
  position: absolute;
  top: 15%;
  left: 23%;
  width: 280px;
  height: 380px;
  border: 1px solid white;
  border-radius: 50% 50% 70% 70%;
}
</style>                                                    