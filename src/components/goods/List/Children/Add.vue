<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon> </el-alert>

      <!-- 步骤列表 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 因为el-tab-pane的子节点必须是el-tabs的子节点，所以form表单必须包裹在外部 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- Tabs标签页 -->
        <el-tabs
          v-model="activeIndex"
          :tab-position="tabPosition"
          :before-leave="beforeTabLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item
              label="商品分类（只允许选择三级分类）"
              prop="goods_cat"
              class="el-cascader-high"
            >
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cascaderProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染的item项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  :label="item"
                  v-for="(item, index) in item.attr_vals"
                  :key="index"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 上传图片 -->
            <!-- action为要上传的api接口地址 -->
            <el-upload
              :action="uploadImgURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headers"
              :on-success="handleSucess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">
                只能上传jpg/png文件，然后不要他喵的超过500kb
              </div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑区 -->
            <quill-editor v-model="addForm.goods_introduce"> </quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="btnAddStyle" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 预览图片的弹框 -->
    <el-dialog title="预览图片" :visible.sync="preImgVisible" width="70%">
      <img :src="previewPath" alt="" class="imgStyle" />
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";

export default {
  data() {
    return {
      activeIndex: "0",
      tabPosition: "left",
      //   添加商品的表单数据项
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 富文本下商品的详情描述
        goods_introduce: "",
        attrs: [],
      },
      addFormRules: {
        goods_name: [
          {
            required: true,
            message: "请输入商品名称",
            trigger: "blur",
          },
        ],
        goods_price: [
          {
            required: true,
            message: "请输入商品价格",
            trigger: "blur",
          },
        ],
        goods_weight: [
          {
            required: true,
            message: "请输入商品重量",
            trigger: "blur",
          },
        ],
        goods_number: [
          {
            required: true,
            message: "请输入商品数量",
            trigger: "blur",
          },
        ],
        goods_cat: [
          {
            required: true,
            message: "请选择商品分类",
            trigger: "blur",
          },
        ],
      },
      cateList: [],
      cascaderProps: {
        checkStrictly: false,
        expandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      manyTableData: [],
      onlyTableData: [],
      uploadImgURL: "https://lianghj.top:8888/api/private/v1/upload",
      // 设置上传图片请求头
      headers: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      previewPath: "",
      preImgVisible: false,
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: result } = await this.$http.get(`categories`);

      if (result.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }

      this.cateList = result.data;

      // console.log(this.cateList);
    },

    // 级联选择器选中项变化触发
    handleChange() {
      // console.log(this.addForm.goods_cat);

      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    // 判断tabs标签进行切换
    beforeTabLeave(activeName, oldActiveName) {
      if (
        (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) ||
        this.addForm.goods_name === ""
      ) {
        this.$message.error("请选择商品分类或商品名称");
        return false;
      }
    },
    // tab切换时触发的函数
    async tabClick() {
      // console.log(this.activeIndex);

      if (this.activeIndex === "1") {
        const { data: result } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "many",
            },
          }
        );

        if (result.meta.status !== 200) {
          return this.$message.error("获取动态参数列表失败");
        }

        // console.log(result.data);

        result.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });

        this.manyTableData = result.data;
      }

      if (this.activeIndex === "2") {
        const { data: result } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "only",
            },
          }
        );

        if (result.meta.status !== 200) {
          return this.$message.error("获取静态属性失败");
        }

        // console.log(result.data);

        this.onlyTableData = result.data;
      }
    },
    //图片的预览效果
    handlePreview(file) {
      // console.log(file);

      // this.previewPath = file.response.data.url

      this.previewPath = file.response.data.url.replace(
        "http://127.0.0.1",
        "https://lianghj.top"
      );

      this.preImgVisible = true;
    },
    // 点击关闭图片的操作
    handleRemove(file) {
      // console.log(file);

      // 1.获取将要删除的图片的临时路径temp_path
      const filePath = file.response.data.temp_path;
      // 2.从pics数组中，找到上传的图片对应的索引值
      const index = this.addForm.pics.findIndex(
        (item) => item.pic === filePath
      );
      // 3.删除对应索引位置的图片
      this.addForm.pics.splice(index, 1);

      // console.log(this.addForm);
    },
    // 监听图片上传的处理事件
    handleSucess(response) {
      // console.log(response);
      // 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.temp_path };

      this.addForm.pics.push(picInfo);
    },
    add() {
      // 在tab切换的时候已经进行判断

      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error("请填写必填的表单项");
        }

        //因为之前已经双向绑定了数组形式的this.addForm.goods_cat，
        // 所以这里不允许转成字符串，所以利用深拷贝赋值一份再赋值

        const newAddForm = _.cloneDeep(this.addForm);
        newAddForm.goods_cat = newAddForm.goods_cat.join(",");

        // 处理动态参数
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_vals: item.attr_vals,
          };
          this.addForm.attrs.push(newInfo);
        });

        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_vals: item.attr_vals,
          };
          this.addForm.attrs.push(newInfo);
        });

        newAddForm.attrs = this.addForm.attrs;

        // console.log(newAddForm);

        // 发送请求，商品名称必须是唯一的
        const { data: result } = await this.$http.post("goods", newAddForm);

        console.log(result);

        if (result.meta.status !== 201) {
          return this.$message.error("添加商品失败！");
        }

        this.$message.success("添加商品成功！");
        this.$router.push("/goods");
      });
    },
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
};
</script>

<style lang="less" scoped>
.el-breadcrumb {
  margin-bottom: 15px;
}

.el-card {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
}

.el-cascader-high {
  height: 100px;
}

.imgStyle {
  width: 100%;
}

.btnAddStyle {
  margin-top: 20px;
}
</style>