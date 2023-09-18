<template>
  <div class="app-container">

    <!-- 查询和其他操作 --> 
    <div class="filter-container">
      <el-form :model="listQuery" size="small" :inline="true">
        <el-form-item label="问题">
          <el-input v-model="listQuery.text" clearable class="filter-item" style="width: 200px;" placeholder="请输入问题"/>
        </el-form-item>
       

        <el-form-item label="查询数量">
          <el-input v-model="listQuery.limit" clearable class="filter-item" style="width: 200px;" placeholder="输入0查询全部" />
        </el-form-item>

        <el-form-item>
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
          <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>
     <el-table-column align="center"  label="问题" prop="q" sortable/>
    <el-table-column align="center" label="答案" prop="a" sortable/>
    <el-table-column align="center" label="来源" prop="source"/> 
    <el-table-column align="center" label="权重" prop="score"/>

    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
   
  </div>
</template>

<script>

import { listAigcSearch  } from '@/api/aigcSearch'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination



export default {
  name: 'aigcSearch',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        timeArray: [],
        sort: 'add_time',
        order: 'desc'
      },
      newListQuery:{

      },
      downloadLoading: false,
      knowledgeDetail:{},
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
        listAigcSearch(this.listQuery).then(response => {
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
        const tHeader = ['发送人昵称', '发送详情', '接收人昵称', '图片','发送时间']
        const filterVal = ['nickName', 'content', 'receiveName','pic','addTime']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '聊天信息')
        this.downloadLoading = false
      })
    },

  

  }
}
</script>


<style>
.gallery {
    width: 80px;
    margin-right: 10px;
  }
</style>
