<template>
  <div>
      <el-button type="info" @click="outCilck">退出</el-button>
  </div>
</template>

<script>
export default {
    methods:{
        outCilck(){
            window.sessionStorage.clear()
            this.$router.push('/login')
        }
    }
}
</script>

<style >

</style>