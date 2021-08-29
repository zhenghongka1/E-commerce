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
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialogVisible"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :expandType="false"
        :selectionType="false"
        showIndex
        index-text="#"
        border
      >
        <template v-slot:isok="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>

        <template v-slot:order="scope">
          <el-tag size="mnin" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" v-else>三级</el-tag>
        </template>

        <template v-slot:operation="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditDialog(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeDialog(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="70%"
      @close="addCateDialogClose"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            v-model="selectkeys"
            :options="ParentCateList"
            :props="{
              expandTrigger: 'hover',
              ...cascaderProps,
              checkStrictly: 'true'
            }"
            @change="ParentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类的对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editEditDialog"
      width="50%"
      @close="editCateDialogClose"
    >
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editEditDialog = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 商品分类的数据列表，默认为空
      cateList: [],
      //总数据条数
      total: 0,
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
          width: "400px",
        },
        {
          label: "是否有效",
          // 将当前列指定为模板列
          type: "template",
          template: "isok",
          minWidth: "50px",
        },
        {
          label: "排序",
          // 将当前列指定为模板列
          type: "template",
          template: "order",
          minWidth: "50px",
        },
        {
          label: "操作",
          // 将当前列指定为模板列
          type: "template",
          template: "operation",
          minWidth: "50px",
        },
      ],
      addCateDialogVisible: false,
      //添加分类的表单数据对象
      addCateForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0,
      },
      //   添加表单验证规则的对象
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: "请输入分类名称",
            trigger: "blur",
          },
        ],
      },
      // 父级分类列表
      ParentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 选中的父级分类的ID数组
      selectkeys: [],
      editEditDialog: false,
      editCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      // 编辑表单 绑定对象
      editCateForm: {},
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: result } = await this.$http.get("categories", {
        params: this.queryInfo,
      });

      if (result.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }

        // console.log(result.data);

      this.cateList = result.data.result;

      this.total = result.data.total;
    },
    // 监听pagesize的变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听pagenum的改变
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum;
      this.getCateList();
    },
    // 弹出添加的对话框
    showAddCateDialogVisible() {
      //  先获取父级分类的数据列表
      this.getParentCateList();

      this.addCateDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: result } = await this.$http.get("categories", {
        params: { type: 2 },
      });

      if (result.meta.status !== 200) {
        return this.$message.error("获取父级分类数据失败");
      }

      // console.log(result.data);
      this.ParentCateList = result.data;
    },
    // 选择项发生变化触发这个函数
    ParentCateChange() {
      // console.log(this.selectkeys);

      // 如果 selectkeys 数组中的 length 大于0，证明选中父级分类
      // 反之，说明没有选中任何父级分类
      if (this.selectkeys.length > 0) {
        // 父级分类的ID
        this.addCateForm.cat_pid = this.selectkeys[this.selectkeys.length - 1];

        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectkeys.length;
        return;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    // 点击确定，添加新的分类
    addCate() {
      // console.log(this.addCateForm);

      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return;

        const { data: result } = await this.$http.post(
          "categories",
          this.addCateForm
        );

        if (result.meta.status !== 201) {
          return this.$message.error("添加分类失败");
        }

        this.$message.success("添加分类成功！");
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    // 监听对话框的关闭事件，进而重置表单
    addCateDialogClose() {
      this.$refs.addCateFormRef.resetFields();
      this.selectkeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    async showEditDialog(id) {
      this.editEditDialog = true;

      // console.log(id);

      const { data: result } = await this.$http.get("categories/" + id);
      if (result.meta.status !== 200)
        return this.$message.error("获取分类失败！");
      this.editCateForm = result.data;
    },
    editCate() {
      this.$refs.editCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "categories/" + this.editCateForm.cat_id,
          {
            cat_name: this.editCateForm.cat_name,
          }
        );
        if (res.meta.status !== 200)
          return this.$message.error("更新分类名失败！");
        this.$message.success("更新分类名成功！");
        this.getCateList();
        this.editEditDialog = false;
      });
    },
    editCateDialogClose() {
      this.$refs.editCateFormRef.resetFields();
    },
    async removeDialog(id){
      // console.log(id);

      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') { return this.$message.info('已取消删除！') }
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) { return this.$message.error('删除商品分类失败！') }
      this.$message.success('删除商品分类成功！')
      this.getCateList()
    }
  },
};
</script>

<style lang="less" scoped>
.el-breadcrumb {
  margin-bottom: 20px;
}

.el-col {
  margin-bottom: 20px;
}

.el-cascader {
  width: 100%;
}
</style>