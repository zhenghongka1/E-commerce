<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserLIst"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserLIst"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <el-table :data="userlist" border stripe>
        <el-table-column type="index" width="50"> </el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <template v-slot="scope">
            <!-- {{scope.row}} -->
            <el-switch
              v-model="scope.row.mg_state"
              @change="stateChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <!-- {{scope.row}} -->
            <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              circle
              @click="showDialog(scope.row.id)"
            ></el-button>
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <!-- 设置 -->
              <el-button
                type="warning"
                icon="el-icon-setting"
                circle
              ></el-button>
            </el-tooltip>
            <!-- 删除 -->
            <el-button type="danger" icon="el-icon-delete" circle @click="removeUserByID(scope.row.id)"></el-button>          
          </template>
        </el-table-column>
      </el-table>
      <div class="block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog
      title="请输入添加的用户信息"
      :visible.sync="addDialogVisible"
      width="30%"
      @close="closeDialog"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        label-width="70px"
        :rules="FormRules"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="80%"
      center
      @close="editcloseDialog"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="FormRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;

      if (regEmail.test(value)) {
        return callback();
      }

      callback(new Error("请输入合法的邮箱"));
    };

    var checkMoblie = (rule, value, callback) => {
      const regMoblie = /0?(13|14|15|18)[0-9]{9}/;

      if (regMoblie.test(value)) {
        return callback();
      }

      callback(new Error("请输入合法的手机号"));
    };

    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5,
      },
      userlist: [],
      total: 0,
      addDialogVisible: false,

      //   添加用户表单
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      //   添加表单的验证规则对象
      FormRules: {
        username: [
          {
            required: true,
            message: "请输入用户名",
            trigger: "blur",
          },
          {
            min: 3,
            max: 10,
            message: "用户名的长度在3到10个字之间",
            trigger: "blur",
          },
        ],
        password: [
          {
            required: true,
            message: "请输入密码",
            trigger: "blur",
          },
          {
            min: 6,
            max: 16,
            message: "用户名的长度在6到16个字之间",
            trigger: "blur",
          },
        ],
        email: [
          {
            required: true,
            message: "请输入用邮箱",
            trigger: "blur",
          },
          {
            validator: checkEmail,
            trigger: "blur",
          },
        ],
        mobile: [
          {
            required: true,
            message: "请输入用手机号码",
            trigger: "blur",
          },
          {
            validator: checkMoblie,
            trigger: "blur",
          },
        ],
      },
      editDialogVisible: false,
      editForm: {},
    };
  },
  created() {
    this.getUserLIst();
  },
  methods: {
    async getUserLIst() {
      const { data: result } = await this.$http.get("users", {
        params: this.queryInfo,
      });

      if (result.meta.status !== 200) {
        return this.$message.error("获取数据失败");
      }

      this.userlist = result.data.users;
      this.total = result.data.total;

      // console.log(result);
    },
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getUserLIst();
    },
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryInfo.pagenum = newPage;
      this.getUserLIst();
    },
    async stateChange(userState) {
      // console.log(userState);
      const { data: result } = await this.$http.put(
        `users/${userState.id}/state/${userState.mg_state}`
      );
      if (result.meta.status !== 200) {
        userState.mg_state = !userState.mg_state;
        return this.$message.error("更改用户状态失败!!");
      }
      this.$message.success("更改用户状态成功");
    },
    closeDialog() {
      this.$refs.addFormRef.resetFields();
    },
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        // console.log(valid);
        // 添加失败
        if (!valid) return;

        // 发起添加用户的网络请求
        const { data: result } = await this.$http.post("users", this.addForm);

        if (result.meta.status !== 201) {
          this.$message.error("添加用户失败");
        }
        this.$message.success("用户添加成功");
        // 隐藏对话框
        this.addDialogVisible = false;

        // 重新获取用户的列表
        this.getUserLIst();
      });
    },
    // 修改
    async showDialog(id) {
      // console.log(id);
      this.editDialogVisible = true;

      const { data: result } = await this.$http.get("users/" + id);
      if (result.meta.status !== 200)
        return this.$message.error("查询用户失败");

      this.editForm = result.data;
    },
    editcloseDialog() {
      this.$refs.editFormRef.resetFields();
    },
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        // console.log(valid);
        if (!valid) return;
        const { data: result } = await this.$http.put(  
          "users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        );

        if(result.meta.status !== 200) return this.$message.error('更新用户数据失败')
        
        // 关闭对话框
        this.editDialogVisible= false
        // 刷新用户列表数据
        this.getUserLIst()
        // 提示提交数据的更新状态成功
        this.$message.success('用户更新成功')
      });
    },
    async removeUserByID(id){
      // console.log(id);
     const confirmResult = await this.$confirm('是否永久删除该用户', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        // 注：1.如果用户删除了则返回字符串conFirm
        //    2.如果用户删除了则返回字符串cancel
          // console.log(confirmResult);

          if(confirmResult !== 'confirm'){
            return this.$message.info('已取消该操作')
          }
            
          const {data:result} = await this.$http.delete('users/' + id)
            
            if(result.meta.status !== 200){
              return this.$message.error('删除用户数据失败')
            }

            this.$message.success('用户删除成功')
            this.getUserLIst()
          }
    }
  
};
</script>

<style lang="less" scoped>
.el-breadcrumb {
  margin-bottom: 15px;
}

.el-card {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
}

.el-input {
  margin-bottom: 15px;
}
</style>