<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 步骤二：为ECharts准备一个具备大小（宽高）的Dom -->
      <div id="main" style="width: 900px; height: 400px"></div>
    </el-card>
  </div>
</template>

<script>
// 步骤一：导入echarts,按需引入
// import echarts from 'echarts'
import * as echarts from "echarts";

import _ from 'lodash'

export default {
  data() {
    return {
      // 需要合并的数据
       options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
       }
    };
  },
  created() {},
  async mounted() {
    // 步骤三：
    var myChart = echarts.init(document.getElementById("main"));

    const { data: result } = await this.$http.get("reports/type/1");

    if (result.meta.status !== 200) {
      this.$message.error("获取折线图数据失败！");
    }

    //  步骤四：准备数据和配置项
    const newResult = _.merge(result.data,this.options)

    // 步骤五：展示数据，使用刚指定的配置项和数据显示图表。
    myChart.setOption(newResult);
  },
  methods: {},
};
</script>

<style>
</style>