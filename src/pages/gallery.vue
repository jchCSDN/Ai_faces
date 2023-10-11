<template>
  <div class="gallery">
    <catalog></catalog>
    <user></user>
    <div class="main">
      <div class="option">
        <div style="padding: 15px">
          <img
            src="../assets/img/table.svg"
            style="
              margin-left: 30px;
              vertical-align: middle;
              margin-right: 10px;
            "
          />
          <span>人脸表格数据</span>
        </div>
      </div>
      <el-table
        :data="
          tableData.filter(
            (data) =>
              !search || data.name.toLowerCase().includes(search.toLowerCase())
          )
        "
        style="width: 80%; margin: 0 auto"
      >
        <el-table-column label="ID" prop="id"></el-table-column>
        <el-table-column label="Name" prop="name"></el-table-column>
        <el-table-column align="right">
          <template slot="header" slot-scope="scope">
            <el-input
              v-model="search"
              size="mini"
              placeholder="输入关键字搜索"
            />
          </template>
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleEdit(scope.$index, scope.row)"
              style="margin-right: 30px"
              >预览</el-button
            >
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)"
              >Delete</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog title="预览" :visible.sync="dialogVisible" width="30%">
      <img
        :src="myface"
        style="width: 400px; height: 400px; padding: 0 20px 0"
      />
      <span slot="footer" class="dialog-footer"> </span>
    </el-dialog>
  </div>
</template>
<script>
import catalog from "@/components/catalog";
import User from '@/components/user.vue';
export default {
  name: "gallery",
  components: {
    catalog,
    User
  },
  data() {
    return {
      tableData: [{}],
      search: "",
      dialogVisible: false,
      myface: "",
    };
  },
  mounted() {
    this.getFace();
  },
  methods: {
    handleDelete(index, row) {
      this.$confirm("确认删除？")
        .then((_) => {
          // done();
          this.axios.delete(`/face/deleteface?id=${row.id}`).then((res) => {
            this.getFace();
            this.$message({
              showClose: true,
              message: "删除成功",
              type: "success",
            });
          });
        })
        .catch((_) => {});
    },
    handleEdit(index, row) {
      this.dialogVisible = true;
      this.myface = document.getElementById("myface");
      this.myface = "http://" + row.image;
    },
    getFace() {
      this.axios.get("/face/userface").then((res) => {
        this.tableData = res.data;
      });
    },
  },
};
</script>

<style>
.gallery {
  display: flex;
  height: 100%;
}
</style>