<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <el-table :data="RolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row v-for="item1 in scope.row.children" :key="item1.id">
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag>{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[index === 0 ? '' : 'bd-top']"
                  v-for="(item2, index) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag type="success">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      closable
                      @close="removeRightByID(scope.row, item3.id)"
                      type="warning"
                      v-for="(item3, index) in item2.children"
                      :key="index"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showeditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeDialog(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色的对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="closeAddDialogVisible"
      @click="addDialogVisible = true"
    >
      <el-form
        ref="addrolesFormRef"
        :model="addrolesForm"
        label-width="80px"
        :rules="addFormRules"
      >
        <el-form-item label="角色名称" prop="roleName" :model="addrolesForm">
          <el-input v-model="addrolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addrolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="80%"
      center
    >
      <span slot="footer" class="dialog-footer">
        <el-form :model="editFrom" label-width="80px">
          <el-form-item label="角色名称">
            <el-input v-model="editFrom.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="editFrom.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editrolesInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限 -->
    <el-dialog
      title="权限分配"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="clearDefaultKeys"
    >
      <el-tree
        default-expand-all
        show-checkbox
        node-key="id"
        :data="rightsList"
        :props="treeProps"
        :default-checked-keys="defaultKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button @click="allowRights" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      RolesList: [],
      editDialogVisible: false,
      editFrom: {},
      addDialogVisible: false,
      addrolesForm: {
        roleName: "",
        roleDesc: "",
      },
      addFormRules: {
        roleName: [
          {
            required: true,
            message: "请输入角色名",
            trigger: "blur",
          },
          {
            min: 3,
            max: 10,
            message: "角色名的长度在3到10个字之间",
            trigger: "blur",
          },
        ],
        roleDesc: [
          {
            required: true,
            message: "请输入角色描述",
            trigger: "blur",
          },
          {
            min: 3,
            max: 10,
            message: "角色描述的长度在3到10个字之间",
            trigger: "blur",
          },
        ],
      },
      setRightDialogVisible: false,
      rightsList: [],
      treeProps: {
        label: "authName",
        children: "children",
      },
      defaultKeys: [],
      rolesID: "",
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    async getRolesList() {
      const { data: result } = await this.$http.get("roles");
      if (result.meta.status !== 200) {
        return this.$message.error("获取角色数据失败");
      }

      this.RolesList = result.data;

      // console.log(this.RolesList);
    },
    async showeditDialog(id) {
      this.editDialogVisible = true;
      // console.log(id);
      const { data: result } = await this.$http.get("roles/" + id);
      if (result.meta.status != 200) {
        return this.$message.error("用户信息查询失败");
      }
      this.editFrom = result.data;

      console.log(result);
    },
    async editrolesInfo() {
      const { data: result } = await this.$http.put(
        "roles/" + this.editFrom.roleId,
        {
          roleName: this.editFrom.roleName,
          roleDesc: this.editFrom.roleDesc,
        }
      );
      if (result.meta.status != 200) {
        // console.log(result);
        return this.$message.error("更新用户数据失败");
      }

      this.editDialogVisible = false;
      this.getRolesList();
      this.$message.success("用户更新数据成功");
    },
    async removeDialog(id) {
      // console.log(id);
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          // 点击取消打印出来字符串cancel
        }
      ).catch((err) => err);

      //   // 点击确定打印出来字符串confirm
      // console.log(confirmResult);

      if (confirmResult !== "confirm") {
        return this.$message.info("已取消该操作");
      }
      const { data: result } = await this.$http.delete("roles/" + id);

      if (result.meta.status !== 200) {
        return this.$message.error("角色列表删除失败");
      }

      this.$message.success("角色列表删除成功");
      this.getRolesList();
    },
    closeAddDialogVisible() {
      this.$refs.addrolesFormRef.resetFields();
      // console.log(this.$refs.addrolesFormRef);
    },
    addRoles() {
      this.$refs.addrolesFormRef.validate(async (valid) => {
        // console.log(valid);
        if (!valid) return;

        const { data: result } = await this.$http.post(
          "roles",
          this.addrolesForm
        );

        if (result.meta.status != 201) {
          this.$message.error("添加角色信息失败");
        }

        this.$message.success("添加用户信息成功");
        this.addDialogVisible = false;
        this.getRolesList();
      });
    },
    async removeRightByID(role, rightId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("取消删除操作");
      }
      // console.log('确认删除');

      const { data: result } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );

      if (result.meta.status !== 200) {
        return this.$message.error("删除权限失败");
      }

      // this.getRolesList() 会完整刷新页面不建议使用

      role.children = result.data;
    },
    async showSetRightDialog(role) {
      this.rolesID = role.id;

      const { data: result } = await this.$http.get("rights/tree");

      if (result.meta.status !== 200) {
        return this.$message.error("获取权限列表失败");
      }

      this.rightsList = result.data;
      // console.log(this.rightsList);

      this.getDefaultKeys(role, this.defaultKeys);

      this.setRightDialogVisible = true;
    },
    // 通过递归的形式，获取分配的角色下所有的三级权限的ID，并保存到defaultKeys中
    getDefaultKeys(node, arr) {
      // 如果当前的ndoe节点不包括children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }

      node.children.forEach((item) => this.getDefaultKeys(item, arr));
    },
    // 清空已经保存defaultKeys值
    clearDefaultKeys() {
      this.defaultKeys = [];
    },
    async allowRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];

      // console.log(keys);

      const idStr = keys.join(",");

      const { data: result } = await this.$http.post(
        `roles/${this.rolesID}/rights`,
        {
          rids: idStr,
        }
      );

      if (result.meta.status !== 200) {
        return this.$message.error("分配角色权限失败");
      }

      this.$message.success("更新角色权限成功");
      this.getRolesList();
      this.setRightDialogVisible = false;
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

.el-table {
  margin-top: 15px;
}

.el-tag {
  margin-bottom: 15px;
  margin-top: 15px;
  margin-right: 8px;
}

.bd-top {
  border-top: 1px solid #eee;
}

.el-row {
  display: flex;
  align-items: center;
}
</style>