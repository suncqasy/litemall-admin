import request from '@/utils/request'

export function listAigcSearch(query) {
  return request({
    url: '/aigcSearch/list', 
    method: 'get',
    params: query
  })
}






