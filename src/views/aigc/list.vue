<template>
  <div class="app-container">

    <!-- 查询和其他操作 --> 
    <div class="filter-container">
      <el-form :model="listQuery" size="small" :inline="true">
        <el-form-item label="用户序号">
          <el-input v-model="listQuery.userId" clearable class="filter-item" style="width: 200px;" placeholder="请输入用户Id"/>
        </el-form-item>
         <el-form-item label="用户手机号">
          <el-input v-model="listQuery.mobile" clearable class="filter-item" style="width: 200px;" placeholder="请输入用户手机号"/>
        </el-form-item>

        <el-form-item label="查询数量">
          <el-input v-model="listQuery.limit" clearable class="filter-item" style="width: 200px;" placeholder="输入0查询全部" />
        </el-form-item>

        <el-form-item>
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
          <el-button type="primary" class="filter-item" icon="el-icon-plus"
            @click="handleCreate"
            v-permission="['POST /admin/aigc/create']"
          >新增</el-button>
          <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" width="100px" label="用户序号" prop="userId" sortable/>
      <el-table-column align="center" label="用户昵称" prop="nickName"/>
      <el-table-column align="center" label="状态" prop="isAvailable">
        <template slot-scope="scope">
           <el-tag :type="scope.row.isAvailable == 0 ? 'success' : 'danger'">{{ statusDic[scope.row.isAvailable] }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">查看</el-button>
          <el-button type="primary" size="mini" @click="handleDetail(scope.row)">编辑</el-button>

        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <!-- aigc编辑对话框 -->
    <el-dialog :visible.sync="aigcVisible" title="用户聊天咨询记录详情">
      <el-form ref="aigcDetail" :model="aigcDetail" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">

        <el-form-item label="用户昵称" prop="nickName">
          <el-input v-model="aigcDetail.nickName"  readonly/>
        </el-form-item>

        <el-form-item label="账号状态" prop="status">
          <el-select v-model="aigcDetail.isAvailable" placeholder="请选择">
            <el-option v-for="(item, index) in statusDic" :key="index" :label="item" :value="index" />
            </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="aigcVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAigcUpdate">确定</el-button>
      </div>
    </el-dialog>

    <!--aigc 新增 对话框-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
     <el-form ref="dataForm"  :rules="rules" :model="dataForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="用户手机" prop="mobile">
          <el-input v-model="dataForm.mobile" />
        </el-form-item>
        <!--下拉框选择ID-->
        <el-form-item label="商品" prop="goodsId">
          <el-input v-model="dataForm.goodsId" />
        </el-form-item>

        <el-form-item label="来源" prop="source">
          <el-select v-model="dataForm.source" placeholder="请选择">
            <el-option v-for="(item, index) in sourceDic" :key="index" :label="item" :value="index" />
          </el-select>
        </el-form-item>
       </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确定</el-button>
      </div>
      </el-dialog>

      <!-- aigc 详情 对话框 -->
      <el-card class="box-card" v-if="showDetail">
      <h3>咨询订单详情</h3>
      <div class="table-layout">
        <el-row>
          <el-col :span="4" class="table-cell-title">商品名称</el-col>
          <el-col :span="4" class="table-cell-title">状态</el-col>
          <el-col :span="4" class="table-cell-title">开始时间</el-col>
          <el-col :span="4" class="table-cell-title">结束时间</el-col>
          <el-col :span="4" class="table-cell-title">使用次数</el-col>
          <el-col :span="4" class="table-cell-title">剩余次数</el-col>
        </el-row>
        <el-row  v-for="item in litemallAigcOrderList">
          <el-col :span="4" class="table-cell">{{ item.goodsName }}</el-col>
          <el-col :span="4" class="table-cell">
          {{ isAvailableFormat(item.isAvailable) }}
          </el-col>
          <el-col :span="4" class="table-cell">{{ item.availableTime }}</el-col>
          <el-col :span="4" class="table-cell">{{ item.expirationTime }}</el-col>
          <el-col :span="4" class="table-cell">{{ item.usedCount }}</el-col>
          <el-col :span="4" class="table-cell">{{ item.usageCount }}</el-col>
        </el-row>
      </div>
    </el-card>

  </div>
</template>

<script>
import { listAigcs ,detailAigc ,editAigc,publishAigc } from '@/api/aigc'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination



export default {
  name: 'aigc',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        sort: 'add_time',
        order: 'desc'
      },
      downloadLoading: false,
      statusDic: ['Enable', 'Disable'],
      aigcVisible :false,
      aigcDetail:{},
      // 新增相关
       dataForm: {
        mobile: undefined,
        goodsId: undefined,
        source: undefined,
       
      },
      sourceDic: ['抖音', '微信','百度'],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        userId: [
          { required: true, message: '用户手机号不能为空', trigger: 'blur' }
        ],
        goodsId: [
          { required: true, message: '商品ID不能为空', trigger: 'blur' }
        ],
        source: [{ required: true, message: '来源不能为空', trigger: 'blur' }]
      },

      // 子表详情
       litemallAigcOrderList: {
      
      },
      showDetail: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      if(this.listQuery.userId){
        aigcDetail(this.listQuery.userId).then(response => {
          this.list = [];
          if(response.data){
            this.list.push(response.data)
            this.total = 1
            this.listLoading = false
          }else{
            this.list = []
            this.total = 0
            this.listLoading = false
          }
        }).catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })
      }else{
        listAigcs(this.listQuery).then(response => {
          this.list = response.data.list
          this.total = response.data.total
          this.listLoading = false
        }).catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/utils/vendor/Export2Excel').then(excel => {
        const tHeader = ['用户名', '商品类别', '商品名称', '使用次数','剩余次数','状态','生效时间','过期时间']
        const filterVal = ['nickName', 'legalCategoryName', 'goodsName','usedCount', 'usageCount', 'isAvailable','availableTime','expirationTime']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '咨询信息详情')
        this.downloadLoading = false
      })
    },

    handleDetail(row) {
      this.aigcDetail = row
      this.aigcVisible = true
      this.showDetail = false
    },

     handleUpdate(row) {
      // 调用接口赋值
      detailAigc(row.id).then((response) => {
        if(response.data.litemallAigcOrderList){
          this.showDetail = true
          this.litemallAigcOrderList = response.data.litemallAigcOrderList
        }
      })
    },


    handleDeal(row){
      this.$router.push({ path: 'aigcDeal', query: { id: row.id }})
    },

    handleAigcUpdate(){
      editAigc(this.aigcDetail).then((response) => {
        this.aigcVisible = false
        this.$notify.success({
          title: '成功',
          message: '更新付费用户成功'
        })
        this.getList()
      })
    },

    handleCreate() {
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.showDetail = false
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          publishAigc(this.dataForm).then(response => {
            this.dialogFormVisible = false
            this.$notify.success({
              title: '成功',
              message: '创建成功'
            })
            this.getList()
          })
        }
      })
    },

    // 判断状态
    isAvailableFormat(val){
      console.log(val)
      let name = ''
      if(val==0){
        name = 'Enable'
      }else if(val==1){
        name = 'Disable'
      }
      return name
  }
  }
}
</script>

<style scoped>
  .filter-container {
    margin-top: 20px;
  }

  .table-layout {
    margin-top: 20px;
    border-left: 1px solid #DCDFE6;
    border-top: 1px solid #DCDFE6;
  }
  .table-cell {
    height: 60px;
    line-height: 40px;
    border-right: 1px solid #DCDFE6;
    border-bottom: 1px solid #DCDFE6;
    padding: 10px;
    font-size: 14px;
    color: #606266;
    text-align: center;
    overflow: hidden;
  }
  .table-cell-title {
    border-right: 1px solid #DCDFE6;
    border-bottom: 1px solid #DCDFE6;
    padding: 10px;
    background: #F2F6FC;
    text-align: center;
    font-size: 14px;
    color: #303133;
  }

</style>


<style>
.el-card {
  margin-bottom: 10px;
  margin-top: 20px;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
.input-new-keyword {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #20a0ff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 145px;
  height: 145px;
  display: block;
}
.op-container {
  display: flex;
  justify-content: center;
}
.el-form-item--medium .el-form-item__content {
      line-height: 0px;
  }
</style>

