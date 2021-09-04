<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表数据 -->
      <el-table :data="orderlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template v-slot:default="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send">
          <template v-slot:default="scope">
            {{scope.row.is_send}}
          </template>
        </el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template v-slot:default="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="scope">
            <el-button size="mini"
                       type="primary"
                       icon="el-icon-edit"
                       @click="showBox"></el-button>
            <el-button size="mini"
                       type="success"
                       icon="el-icon-location"
                       @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%"
      @close="addressDialogClosed">
      <el-form :model="addressForm"
               :rules="addressFormRules"
               ref="addressFormRef"
               label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityData"
                       v-model="addressForm.address1"
                       :props="cityProps">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addressVisible = false">取 消</el-button>
    <el-button type="primary" @click="addressVisible = false">确 定</el-button>
  </span>
    </el-dialog>

    <!-- 展示物流进度的对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%">
      <el-timeline>
        <!-- timestamp指定时间线上的时间，{{}}指定时间上的内容 -->
        <el-timeline-item
          v-for="(item, index) in progressInfo"
          :key="index"
          :timestamp="item.time">
          {{item.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
  import citydata from "./citydata"
  import progress from "./progress"

  export default {
    name: "Order",
    data() {
      return {
        //请求查询对象
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10
        },
        //订单总条数
        total: 0,
        //获取的订单列表
        orderlist: [],
        addressVisible: false,
        addressForm: {
          address1: [],
          address2: ''
        },
        addressFormRules: {
          address1: [
            { required: true, message: '请选择省市区县', trigger: 'blur' }
          ],
          address2: [
            { required: true, message: '请填写详细地址', trigger: 'blur' }
          ]
        },
        cityData: citydata,
        cityProps: {
          expandTrigger: 'hover',
          value: 'value',
          label: 'label',
          children: 'children'
        },
        progressVisible: false,
        //物流信息
        progressInfo: []
      }
    },
    created() {
      this.getOrderList()
    },
    methods: {
      //获取订单列表
      async getOrderList() {
        const {data: res} = await this.$http.get('orders', {
          params: this.queryInfo
        })
        if (res.meta.status !== 200) {
          return this.$message.error("获取订单列表失败！")
        }
        this.total = res.data.total
        this.orderlist = res.data.goods
      },
      //pagesize发生改变
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getOrderList()
      },
      //pagenum发生改变
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getOrderList()
      },
      //展示修改地址的对话框
      showBox() {
        this.addressVisible = true
      },
      //监听修改地址对话框的关闭
      addressDialogClosed() {
        this.$refs.addressFormRef.resetFields()
      },
      //展示物流进度的对话框
      async showProgressBox() {
        /*const {data:res} = await this.$http.get('/kuaidi/1106975712662')
        if (res.meta.status !== 200) {
          return this.$message.error("获取物流进度失败！")
        }*/
        this.progressInfo = progress.data
        this.progressVisible = true
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-cascader {
    width: 100%;
  }
</style>