import request from '@/utils/request'

export function listAigcKnowledge(query) {
  return request({
    url: '/knowledge/list', 
    method: 'get',
    params: query
  })
}

export function deleteKnowledge(id) {
  return request({
    url: '/knowledge/delete',
    method: 'post',
    params: { id }
  })
}

export function publishKnowledge(data) {
  return request({
    url: '/knowledge/adminCreate',
    method: 'post',
    data
  })
}





