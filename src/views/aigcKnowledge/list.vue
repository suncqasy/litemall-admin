<template>
  <div class="app-container">

    <!-- 查询和其他操作 --> 
    <div class="filter-container">
      <el-form :model="listQuery" size="small" :inline="true">
        <el-form-item label="关键字">
          <el-input v-model="listQuery.promot" clearable class="filter-item" style="width: 200px;" placeholder="请输入promot"/>
        </el-form-item>
         <el-form-item label="问题">
          <el-input v-model="listQuery.question" clearable class="filter-item" style="width: 200px;" placeholder="请输入问题"/>
        </el-form-item>

        <el-form-item label="答案">
          <el-input v-model="listQuery.answer" clearable class="filter-item" style="width: 200px;" placeholder="请输入答案"/>
        </el-form-item>

        <el-form-item label="问答类型">
          <el-select v-model="listQuery.mode" clearable style="width: 200px" class="filter-item" placeholder="请选择问答类型">
            <el-option v-for="item in modeOptions" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>

        <el-form-item label="查询数量">
          <el-input v-model="listQuery.limit" clearable class="filter-item" style="width: 200px;" placeholder="输入0查询全部" />
        </el-form-item>

        <el-form-item>
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
          <el-button type="primary" class="filter-item" icon="el-icon-plus"
            @click="handleCreate"
            v-permission="['POST /admin/knowledge/create']"
          >新增</el-button>
          <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      
      <el-table-column align="center" width="100px" label="ID" prop="id" sortable/>
      <el-table-column align="center" width="100px" label="知识库ID" prop="kdId" />
      <el-table-column align="center" label="类型" prop="mode">
        <template slot-scope="scope">
           <el-tag :type="scope.row.mode == 0 ? 'success' : 'danger'">{{ statusDic[scope.row.mode] }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="promot" prop="promot"/>
      <el-table-column align="center" label="问题" prop="question"/>
      <el-table-column align="center" label="答案" prop="answer"/>
      <el-table-column align="center" label="提交时间" prop="addTime"/>
      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <!-- <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">查看</el-button> -->
          <el-button type="primary" size="mini" @click="handleDetail(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 知识库新增对话框 -->
    <el-dialog :visible.sync="knowledgeVisible" title="知识库信息详情">
      <el-form ref="knowledgeDetail" :model="knowledgeDetail"  disabled status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">

      <el-form-item label="问答类型" prop="mode">
          <el-select v-model="knowledgeDetail.mode" placeholder="请选择">
            <el-option v-for="(item, index) in statusDic" :key="index" :label="item" :value="index" />
          </el-select>
      </el-form-item>
       <el-form-item label="引导提示词" prop="promot">
          <el-input v-model="knowledgeDetail.promot"  />
        </el-form-item>

        <el-form-item label="问题" prop="question">
          <el-input v-model="knowledgeDetail.question"  type="textarea"  />
        </el-form-item>

        <el-form-item label="答案" prop="answer">
          <el-input v-model="knowledgeDetail.answer"  type="textarea"  />
        </el-form-item>
      </el-form>
    
      <div slot="footer" class="dialog-footer">
        <el-button @click="knowledgeVisible = false">取消</el-button>
        <!-- <el-button type="primary" @click="handleAigcUpdate">确定</el-button> -->
      </div>
    </el-dialog>

    <!--aigc 新增 对话框-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
     <el-form ref="dataForm"  :rules="rules" :model="dataForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">

        <el-form-item label="类型" prop="mode">
          <el-select v-model="dataForm.mode" placeholder="请选择">
            <el-option v-for="(item, index) in statusDic" :key="index" :label="item" :value="index" />
          </el-select>
        </el-form-item>

         <el-form-item label="引导词" prop="promot">
          <el-input v-model="dataForm.promot" />
        </el-form-item>
 
        <el-form-item label="问题" prop="question">
          <el-input v-model="dataForm.question" type="textarea" />
        </el-form-item>

         <el-form-item label="答案" prop="answer">
          <el-input v-model="dataForm.answer" type="textarea" />
        </el-form-item>
       </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确定</el-button>
      </div>
      </el-dialog>



  </div>
</template>

<script>
import {listAigcKnowledge ,deleteKnowledge ,publishKnowledge} from '@/api/aigcKnowledge'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination



export default {
  name: 'knowledge-list',
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
      modeOptions: [
     {
        label: 'index',
        value: 0
    },
    {
        label: 'qa',
        value: 1
    },
    ],
      statusDic: ['index', 'qa'],
      knowledgeVisible :false,
      knowledgeDetail:{},
      // 新增相关
       dataForm: {
        mode: undefined,
        promot: undefined,
        question: undefined,
        answer:  undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        q: [
          { required: true, message: '问题不能为空', trigger: 'blur' }
        ],
      },
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      if(this.listQuery.id){
        knowledgeDetail(this.listQuery.id).then(response => {
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
        listAigcKnowledge(this.listQuery).then(response => {
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
        const tHeader = ['类型', '引导词', '问题', '答案','提交时间']
        const filterVal = ['mode', 'promot', 'question','answer', 'add_time']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '知识库数据')
        this.downloadLoading = false
      })
    },

    handleDetail(row) {
     
      this.knowledgeDetail = row
      this.knowledgeVisible = true

    },



    // handleAigcUpdate(){
    //   editAigc(this.knowledgeDetail).then((response) => {
    //     this.knowledgeVisible = false
    //     this.$notify.success({
    //       title: '成功',
    //       message: '更新付费用户成功'
    //     })
    //     this.getList()
    //   })
    // },

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
          publishKnowledge(this.dataForm).then(response => {
            this.dialogFormVisible = false
            this.$notify.success({
              title: '成功',
              message: '调用成功'
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

