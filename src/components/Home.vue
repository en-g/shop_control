<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
  export default {
    name: "Home",
    methods: {
      //退出登录，清空token并跳转到登录页
      logout() {
        window.sessionStorage.clear()
        this.$router.push('/login')
      }
    }
  }
</script>

<style lang="less" scoped>

</style>