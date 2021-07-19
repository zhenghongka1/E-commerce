<template>
  <el-container class="container-wrapper">
    <!-- 头部信息 -->
    <el-header>
      <div>
        <img src="../assets/img/avatar.jpg" alt="" />
      </div>
      <span class="iteminfo">AllenKAI's e-commerce management platform</span>
      <el-button class="outbutton" type="info" @click="outCilck"
        >退出</el-button
      ></el-header
    >
    <!-- 主体信息 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="collapse ? '64px' : '200px'">
        <!-- 折叠 -->
        <div class="toggle-button" @click="toggleClick" title="折叠">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#ffd04b"
          :unique-opened="true"
          :collapse="collapse"
          :collapse-transition="false"
          router
          :default-active="this.$route.path"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本信息 -->
              <span>{{ item.authName }}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              ><i class="el-icon-menu"></i>{{ subItem.authName }}</el-menu-item
            >
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconsObj: {
        125: "el-icon-s-custom",
        103: "el-icon-s-flag",
        101: "el-icon-s-goods",
        102: "el-icon-s-order",
        145: "el-icon-data-line",
      },
      collapse: false,
    };
  },
  created() {
    this.getMenuList();
  },
  methods: {
    outCilck() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenuList() {
      const { data: result } = await this.$http.get("menus");
      // console.log(result);
      if (result.meta.status !== 200)
        return this, $message.error(result.meta.mag);

      this.menuList = result.data;
    },
    toggleClick() {
      this.collapse = !this.collapse;
    },
  },
};
</script>

<style lang="less" scoped>
.container-wrapper {
  height: 100%;

  .el-header {
    display: flex;
    justify-content: space-between;
    font-size: 20px;
    color: white;
    background-color: #373d41;
    padding-left: 0;
    align-items: center;

    .iteminfo {
      float: left;
    }

    img {
      width: 50px;
      height: 50px;
      margin-top: 7px;
    }
  }

  .el-aside {
    background-color: #333744;

    .el-menu {
      border-right: 0;
    }
  }

  .el-main {
    background-color: #eaedf1;
  }

  .outbutton {
    float: right;
  }

  .toggle-button {
    text-align: center;
    cursor: pointer;
    box-sizing: border-box;
    padding-bottom: 3px;
    color: white;
    background-color: #4a506b;
  }
}
</style>