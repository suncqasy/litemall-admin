<template>
  <div class="app-container">

    <!-- 查询和其他操作 --> 
    <div class="filter-container">
      <el-form :model="listQuery" size="small" :inline="true">
        <el-form-item label="发送方昵称">
          <el-input v-model="listQuery.nickName" clearable class="filter-item" style="width: 200px;" placeholder="请输入发送方昵称"/>
        </el-form-item>
        
        <!-- <el-form-item label="起始日期">
          <el-date-picker v-model="listQuery.timeArray" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss" class="filter-item" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" />
        </el-form-item> -->

        <el-form-item label="查询数量">
          <el-input v-model="listQuery.limit" clearable class="filter-item" style="width: 200px;" placeholder="输入0查询全部" />
        </el-form-item>

        <el-form-item>
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
          <!-- <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button> -->
        <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="success"
            plain
            icon="el-icon-edit"
            size="mini"
            :disabled="single"
            @click="handleBatchDownLoad"
          >批量导出</el-button>
        </el-col>
       </el-row>
        </el-form-item>
      </el-form>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row   @selection-change="handleSelectionChange">
    <el-table-column type="selection" width="55" />
    <el-table-column align="center" width="100px" label="发送方昵称" prop="nickName" sortable/>
    <el-table-column align="center" label="接收方昵称" prop="receiveName"/>
  
    <!-- <el-table-column align="center" label="发送内容" prop="content"/>  -->
   
      <!-- <el-table-column align="center" label="图片" width="80">
        <template slot-scope="scope">
         <el-image :src="scope.row.picUrls" :preview-src-list="[scope.row.picUrls]" style="width: 40px; height: 40px" />
        </template>
      </el-table-column> -->
    <el-table-column align="center" label="发送时间" prop="addTime"/>
    <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleDetail(scope.row)">查看</el-button>
            <el-button type="success" size="mini"  icon="el-icon-download" @click="getExcel(scope.row)">导出</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <!-- message查看对话框 -->
    <el-dialog :visible.sync="messageVisible" title="用户聊天详情">
      <el-form ref="messageDetail" :model="messageDetail" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">

        <el-form-item label="发送方昵称" prop="nickName">
          <el-input v-model="messageDetail.nickName"  readonly/>
        </el-form-item>

        <el-form-item label="发送内容" prop="content">
          <el-input  type ='textarea' v-model="messageDetail.content"  readonly/>
        </el-form-item>

          <el-form-item label="接收方昵称" prop="receiveName">
          <el-input v-model="messageDetail.receiveName"  readonly/>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="messageVisible = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import {readByReceive,listMessage,batchDownloadMessage} from '@/api/message'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import _ from 'lodash'


export default {
  name: 'message',
  components: { Pagination },
  data() {
    return {
      list: null,
      // 一个个的聊天记录
      messageList:null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        timeArray: [],
        sort: 'add_time',
        order: 'desc'
      },
 
      downloadLoading: false,
      messageVisible :false,
      messageDetail:{},

      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      multipleSelection: [],
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
       //
      if (this.listQuery.timeArray && this.listQuery.timeArray.length === 2) {
        this.listQuery.start = this.listQuery.timeArray[0]
        this.listQuery.end = this.listQuery.timeArray[1]
      }else {
        this.listQuery.start = null
        this.listQuery.end = null
      }
        let obj = JSON.parse(JSON.stringify(this.listQuery))
        this.$set(obj,'timeArray','')
        console.log(12222+"调用")
        listMessage(obj).then(response => {
          this.list = response.data.list
          this.total = response.data.total
          this.listLoading = false
  
        }).catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })
      //}
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

    handleDetail(row) {
      this.messageDetail = row
      this.messageVisible = true
      // 调用方法
      let params = {
        receiveUserId:row.receiveUserId,
        sendUserId:row.sendUserId
      }
      readByReceive(params).then(response => {
        console.log(response.data+"调用")
      }).catch(() => {
       
      })
    },

  // 单条用户的聊天信息导出
  getExcel(row) {
      this.downloadLoading = true
       // 调用方法
      let params = {
        receiveUserId:row.receiveUserId,
        sendUserId:row.sendUserId
      }
      readByReceive(params).then(response => {
       this.messageList = response.data.list
       import('@/utils/vendor/Export2Excel').then(excel => {
        const tHeader = ['发送人昵称', '咨询详情', '接收人昵称','发送时间']
        const filterVal = ['nickName', 'content', 'receiveName','addTime']
        excel.export_json_to_excel2(tHeader, this.messageList, filterVal, this.messageList[0].nickName+'与'+this.messageList[0].receiveName+'的咨询记录')
        this.downloadLoading = false
        this.messageList = null;
      })
      }).catch(() => {
       
      })
    },

    // 多选
     handleSelectionChange(val) {
      this.multipleSelection = val
    },
     handleBatchDownLoad() {
      if (this.multipleSelection.length === 0) {
        this.$message.error('请选择至少一条记录')
        return
      }
      const ids = []
      console.log(this.multipleSelection)
      _.forEach(this.multipleSelection, function(item) {
        ids.push(item.id)
      })
      this.$confirm('确定批量导出?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        batchDownloadMessage({ ids: ids }).then(response => {
            this.messageList = response.data.list
            import('@/utils/vendor/Export2Excel').then(excel => {
            const tHeader = ['发送人昵称', '咨询详情', '接收人昵称','发送时间']
            const filterVal = ['nickName', 'content', 'receiveName','addTime']
            excel.export_json_to_excel2(tHeader, this.messageList, filterVal, '咨询记录')
            this.downloadLoading = false
            this.messageList = null;
          })
          this.getList()
        })
      }).catch(() => {})
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
