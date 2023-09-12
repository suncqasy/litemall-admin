import request from '@/utils/request'

export function listMessage(query) {
  return request({
    url: '/message/list',
    method: 'get',
    params: query
  })
}

export function deleteMessage(id) {
  return request({
    url: '/message/delete',
    method: 'post',
    params: { id }
  })
}

export function publishMessage(data) {
  return request({
    url: '/message/create',
    method: 'post',
    data
  })
}

export function detailMessage(id) {
  return request({
    url: '/message/detail',
    method: 'get',
    params: { id }
  })
}

export function editMessage(data) {
  return request({
    url: '/message/update',
    method: 'post',
    data
  })
}

