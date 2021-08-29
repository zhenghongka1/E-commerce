<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像 -->
      <div class="User_avatar">
        <img src="../assets/img/logo.png" alt="" />
      </div>
      <!-- 表单 -->
      <el-form
        ref="loginFormRef"
        :model="infoForm"
        label-width="0px"
        class="login_from"
        :rules="rules"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="infoForm.username"
            prefix-icon="el-icon-s-custom"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <!-- 密码 -->
          <el-input
            v-model="infoForm.password"
            prefix-icon="el-icon-lock"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item class="loginButton">
          <!-- 登录框 -->
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      // 登录表单的双向数据绑定对象
      infoForm: {
        username: "admin",
        password: "123456",
      },
      rules: {
        username: [
          { required: true, message: "请输入正确的用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入正确的密码", trigger: "blur" },
          {
            min: 3,
            max: 16,
            message: "长度在 3 到 16 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    resetLoginForm() {
      // console.log(this);
      this.$refs.loginFormRef.resetFields()  

      (this.infoForm.username = ""), (this.infoForm.password = "");
    },
    login() {
      // validate对整个表单进行校验的方法，参数为一个回调函数。该回调函数会在校验结束后被调用，并传入两个参数：
      // 是否校验成功和未通过校验的字段。若不传入回调函数，则会返回一个 promise
      this.$refs.loginFormRef.validate(async (valid) => {
        // console.log(valid);
        if (!valid) return;
        const result = await this.$http.post("login", this.infoForm);
        // console.log(result.data);
        if (result.data.meta.status !== 200) {
          // console.log('登陆失败');
          this.$message.error("登录失败");
        } else {
          // console.log('登录成功');
          this.$message.success("登录成功");
          // 1.将登录成功后的登录信息保存到本地的sessionStorage中
          //  1.1 项目中除了登录之外的其他API接口，必须在登录之后才能访问
          //  1.2 token只应用在当前网站打开期间生效，所以将token保存在sessionStorage中
          window.sessionStorage.setItem("token", result.data.data.token);
          // console.log(result.data.data.token);
          // 2.通过编程式导航跳转到后台的主页，路由地址是/home
          this.$router.push("/come");
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
.login_container {
  height: 100%;
  background-color: #2b4b6b;
  .login_box {
    width: 450px;
    height: 300px;
    position: absolute;
    background-color: white;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;

    .User_avatar {
      position: absolute;
      width: 130px;
      height: 130px;
      left: 50px;
      transform: translate(55%, -50%);
      border-radius: 50%;
      line-height: 220px;
      border: 15px solid white;
      background-color: rgb(231, 230, 230);
      box-shadow: 0px 0px 10px rgb(214, 212, 212);
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .login_from {
      position: relative;
      top: 30%;
      box-sizing: border-box;
      padding: 0 20px;

      .loginButton {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>

