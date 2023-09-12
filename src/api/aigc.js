import request from '@/utils/request'

export function listAigcs(query) {
  return request({
    url: '/aigc/list',
    method: 'get',
    params: query
  })
}

export function deleteAigc(id) {
  return request({
    url: '/aigc/delete',
    method: 'post',
    params: { id }
  })
}

export function publishAigc(data) {
  return request({
    url: '/aigc/adminCreate',
    method: 'post',
    data
  })
}

export function detailAigc(id) {
  return request({
    url: '/aigc/read',
    method: 'get',
    params: { id }
  })
}

export function editAigc(data) {
  return request({
    url: '/aigc/update',
    method: 'post',
    data
  })
}




