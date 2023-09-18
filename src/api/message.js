import request from '@/utils/request'

export function listMessage(query) {
  return request({
    url: '/message/listByReceive',
    method: 'get',
    params: query
  })
}




export function detailMessage(id) {
  return request({
    url: '/message/detail',
    method: 'get',
    params: { id }
  })
}



// 查询历史聊天记录
export function readByReceive(data) {
  return request({
    url: '/message/readByReceive',
    method: 'post',
    data
  })
}

// 批量导出message
export function batchDownloadMessage(data) {
  return request({
    url: '/message/batchDownloadMessage',
    method: 'post',
    data
  })
}

