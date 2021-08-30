<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 渲染的表格 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column
          label="订单价格"
          prop="order_price"
          width="100px"
        ></el-table-column>
        <el-table-column label="是否付款" prop="pay_status" width="140px">
          <template v-slot="scope">
            <el-tag type="success" v-if="scope.row.pay_status === 0"
              >已付款</el-tag
            >
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="是否发货"
          prop="is_send"
          width="80px"
        ></el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="170px">
          <template v-slot="scope">
            {{ scope.row.create_time | dateFormate }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template v-slot="">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              title="点击编辑"
              @click="showEditDiag"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showProgressBox"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total - 0"
      >
      </el-pagination>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="70%" @close="editDialogClose">
      <el-form
        ref="addressFormRef"
        :model="addressForm"
        label-width="100px"
        :rules="addressFormRules"
      >
        <el-form-item label="省市区/县" prop="address1">
        <el-cascader :options="cityData" v-model="addressForm.address1" :props="{ expandTrigger: 'hover' }"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 展示物流进度的对话框 -->
    <el-dialog
  title="物流进度"
  :visible.sync="progressDialogVisible"
  width="70%"
>
   <el-timeline>
    <el-timeline-item
      v-for="(activity, index) in progressList"
      :key="index"
      :timestamp="activity.timestamp">
      {{activity.context}}
    </el-timeline-item>
   </el-timeline>
</el-dialog>
  </div>
</template>

<script>
    import cityData from './citydata.js'

export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      total: "",
      orderList: [],
      editDialogVisible: false,
      addressForm: {
        address1: [],
        address2: "",
      },
      addressFormRules: {
        address1: [
          {
            required: true,
            message: "请选择省市区/县",
            trigger: "blur",
          },
        ],
        address2: [
          {
            required: true,
            message: "请输入详细地址",
            trigger: "blur",
          },
        ],
      },
      cityData,
      progressDialogVisible:false,
      progressList:[],
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    async getOrderList() {
      const { data: result } = await this.$http.get("orders", {
        params: this.queryInfo,
      });

      if (result.meta.status !== 200) {
        return this.$message.error("获取订单列表失败");
      }

      //   console.log(result);

      this.total = result.data.total;
      this.orderList = result.data.goods;
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum;
      this.getOrderList();
    },
    showEditDiag() {
      this.editDialogVisible = true;
    },
    editDialogClose(){
        this.$refs.addressFormRef.resetFields()
    },
    async showProgressBox(){
        this.progressDialogVisible = true

        // const {data:result}  = await this.$http.get('/kuaidi/:id/1106975712662')

        const { data: result } = await this.$http.get('/kuaidi/1106975712662')

        if(result.meta.status !== 200){
            return this.$message.error('获取快递进度数据失败')
        }

        this.progressList = result.data

        // console.log(result);
    }
  },
};
</script>

<style lang="less" scoped>
.el-input {
  margin-bottom: 20px;
}
</style>