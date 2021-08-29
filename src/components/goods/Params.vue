<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 商品分类区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        show-icon
        type="warning"
      >
      </el-alert>
      <el-row>
        <el-col class="cat_top">
          <span>选择商品分类页面：</span>
          <el-cascader
            v-model="selectCateKeys"
            :options="cateList"
            :props="cateListProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab区域 -->
      <el-tabs v-model="activeName" type="card" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabale"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyList" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <!-- 循环出Tag标签 -->
              <template v-slot="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)"
                  class="el-button-rgiht"
                  >{{ item }}</el-tag
                >
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 输入的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >添加标签</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabale"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态参数表格 -->
          <el-table :data="onlyList" border stripe>
            <el-table-column type="expand">
              <!-- 循环出Tag标签 -->
              <template v-slot="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)"
                  class="el-button-rgiht"
                  >{{ item }}</el-tag
                >
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 输入的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >添加标签</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="70%"
      @close="addDialogClose"
    >
      <!-- 添加参数验证规则的表单 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="70%"
      @close="editDialogClose"
    >
      <!-- 添加参数验证规则的表单 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      cateListProps: {
        expandTrigger: "hover",
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectCateKeys: [],
      activeName: "many",
      onlyList: [],
      manyList: [],
      addDialogVisible: false,
      addForm: {
        attr_name: "",
      },
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: "请输入动态参数",
            trigger: "blur",
          },
        ],
      },
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        attr_name: [
          {
            required: true,
            message: "请输入参数名称",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //   获取分类数据信息
    async getCateList() {
      const { data: result } = await this.$http.get("categories");
      if (result.meta.status !== 200) {
        return this.$message.error("获取商品分类数据失败");
      }

      this.cateList = result.data;

      //   console.log(result.data);
    },
    handleChange() {
      this.getparams();
    },
    // tab页面点击事件函数
    handleTabClick() {
      // console.log(this.activeName);
      this.getparams();
    },
    // 发起请求，获取参数列表
    async getparams() {
      // 证明不是三级分类
      if (this.selectCateKeys.length !== 3) {
        this.selectCateKeys = [];
        this.manyList = []
        this.onlyList = []
        return;
      }
      // 选中的是三级分类
      //   console.log(this.selectCateKeys);

      // 根据所选分类的ID和当前所处的面板，获得对应的参数
      const { data: result } = await this.$http.get(
        `categories/${this.cateID}/attributes`,
        {
          params: { sel: this.activeName },
        }
      );

      if (result.meta.status !== 200) {
        return this.$message.error("获得参数列表数据失败！");
      }

      // console.log(result.data);

      result.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];

        // console.log(result.data);

        // 控制文本框的显示和隐藏
        item.inputVisible = false;
        // 输入框的显示和隐藏
        item.inputValue = "";
      });

      if (this.activeName === "many") {
        this.manyList = result.data;
      } else {
        this.onlyList = result.data;
      }
    },
    // 监听对话框关闭后清空
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    // 点击按钮，参加参数
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;

        const { data: result } = await this.$http.post(
          `categories/${this.cateID}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );

        if (result.meta.status !== 201) {
          return this.$message.error("添加参数失败");
        }

        this.$message.success("添加参数成功");
        this.addDialogVisible = false;
        this.getparams();
      });
    },
    // 点击按钮，修改对话框
    async showEditDialog(id) {
      // 查询当前参数的信息
      const { data: result } = await this.$http.get(
        `categories/${this.cateID}/attributes/${id}`,
        {
          params: { attr_sel: this.activeName },
        }
      );

      if (result.meta.status !== 200) {
        return this.$message.error("获取参数信息失败！");
      }

      this.editForm = result.data;

      this.editDialogVisible = true;
    },
    // 重置修改的表单
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    // 点击按钮修改参数信息
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;

        const { data: result } = await this.$http.put(
          `categories/${this.cateID}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        );

        if (result.meta.status !== 200) {
          return this.$message.error("修改参数失败！");
        }

        this.$message.success("修改参数成功！");
        this.getparams();
        this.editDialogVisible = false;
      });
    },
    // 根据id删除对应的参数
    async removeParams(id) {
      console.log(id);

      const conFirmResult = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      // 用户取消了删除的操作
      if (conFirmResult !== "confirm") {
        return this.$message.info("已取消删除操作！");
      }

      const { data: result } = await this.$http.delete(
        `categories/${this.cateID}/attributes/${id}`
      );
      if (result.meta.status !== 200) {
        return this.$message.error("删除参数失败！");
      }

      this.$message.success("删除数据成功！");
      this.getparams();
    },
    // 文本框失去焦点时或者按下enter触发的函数
    async handleInputConfirm(row) {
      // 判断用户输入是否为空格和为空
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }

      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;

      this.deleteData(row)
    },
    // 按钮按下弹出输入的文本框
    showInput(row) {
      row.inputVisible = true;

      // 用于自动获取焦点
      // $nextTick 方法的作用是，当页面上的元素被重新渲染之后，才能指定回调函数中的代码
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 封装修改数据保存到数据库的操作
    async deleteData(row) {
      // 发送请求，保存本次操作tag的操作
      const { data: result } = await this.$http.put(
        `categories/${this.cateID}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );

      if (result.meta.status !== 200) {
        return this.$message.error("修改参数失败！");
      }

      this.$message.success("修改参数成功！");
    },
    // 删除对应的tag标签
    handleClose(i, row) {
      row.attr_vals.splice(i, 1);

      this.deleteData(row)
    },
  },
  computed: {
    // 如果按钮需要被禁用则返回true，否则返回false
    isBtnDisabale() {
      if (this.selectCateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    // 当前选中的三级分类的ID
    cateID() {
      if (this.selectCateKeys.length === 3) {
        return this.selectCateKeys[2];
      }
      return null;
    },
    // 动态计算标题的文本
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      }

      return "静态属性";
    },
  },
};
</script>

<style lang="less" scoped>
.el-breadcrumb {
  margin-bottom: 15px;
}

.el-card {
  .cat_top {
    margin-top: 15px;
  }
  .el-tabs {
    margin-top: 15px;
  }

  .el-button {
    margin-bottom: 15px;
  }

  .el-button-rgiht {
    margin-right: 15px;
  }

  .input-new-tag {
    width: 30%;
  }

  .button-new-tag {
    margin-left: 20px;
  }
}
</style>