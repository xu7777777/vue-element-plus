import request from '@/utils/request'
import qs from 'qs'

export function getBrands(pageParams) {
  pageParams = qs.stringify(pageParams)
  return request({
    url: '/dev-api/brands/list?' + pageParams,
    method: 'get'
  })
}

export function addBrand(data) {
  data = qs.stringify(data)
  console.log(data)
  return request({
    url: '/dev-api/brands/add',
    method: 'post',
    data
  })
}

export function updateBrand(data) {
  data = qs.stringify(data)
  return request({
    url: `/dev-api/brands/update/`,
    method: 'post',
    data
  })
}

export function deleteBrand(id) {
  return request({
    url: `/dev-api/brands/del/${id}`,
    method: 'get'
  })
}
