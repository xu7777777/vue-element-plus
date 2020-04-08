// import { getToken } from '@/utils/auth' // get token from cookie
import request from '@/utils/request'
import qs from 'qs'

// product
export function addPro2Goods(data) {
  data.ownSpec = JSON.stringify(data.ownSpec)
  data = qs.stringify(data)
  return request({
    url: '/dev-api/product/add',
    method: 'post',
    data
  })
}

export function delProduct(pid) {
  return request({
    url: '/dev-api/product/del?pid=' + pid,
    method: 'get'
  })
}

export function modPro2Goods(data) {
  data.ownSpec = JSON.stringify(data.ownSpec)
  data = qs.stringify(data)
  return request({
    url: '/dev-api/product/mod',
    method: 'post',
    data
  })
}

export function getProducts(goodsId) {
  return request({
    url: '/dev-api/product/list?goodsId=' + goodsId,
    method: 'get'
  })
}

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
export function getParams(cid, isGeneric) {
  return request({
    url: `/dev-api/category/params?cid=` + cid + '&isGeneric=' + isGeneric,
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

// function for goods
export function getGoods(pageParams) {
  pageParams = qs.stringify(pageParams)
  return request({
    url: '/dev-api/goods/list?' + pageParams,
    method: 'get'
  })
}
