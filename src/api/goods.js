// import { getToken } from '@/utils/auth' // get token from cookie
import request from '@/utils/request'
import qs from 'qs'

// function for brand
export function getBrands(pageParams) {
  pageParams = qs.stringify(pageParams)
  return request({
    url: '/dev-api/brands/list?' + pageParams,
    method: 'get'
  })
}
export function getBrandsByCId(cid) {
  return request({
    url: `/dev-api/brands/getBrands/${cid}`,
    method: 'get'
  })
}

export function addBrand(data) {
  data = qs.stringify(data)
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

// function for category
export function getCategories(cid) {
  return request({
    url: `/dev-api/category/list?cid=` + cid,
    method: 'get'
  })
}

export function addCategory(data) {
  data = qs.stringify(data)
  return request({
    url: '/dev-api/category/add',
    method: 'post',
    data
  })
}

export function updateCategory(data) {
  data = qs.stringify(data)
  return request({
    url: `/dev-api/category/update/`,
    method: 'post',
    data
  })
}

export function deleteCategory(id) {
  return request({
    url: `/dev-api/category/del/${id}`,
    method: 'get'
  })
}

export function getCategory(cid) {
  return request({
    url: `/dev-api/category/get/` + cid,
    method: 'get'
  })
}

export function getCyByBid(bid) {
  return request({
    url: `/dev-api/category/categories/` + bid,
    method: 'get'
  })
}

// function for heat
export function getHeats(title) {
  if (typeof title === 'undefined') {
    title = ''
  }
  return request({
    url: `/dev-api/heat/get?title=` + title,
    method: 'get'
  })
}

