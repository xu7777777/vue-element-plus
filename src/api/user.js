import request from '@/utils/request'
import qs from 'qs'

export function login(data) {
  data = qs.stringify(data)
  return request({
    url: '/dev-api/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/dev-api/user/info/' + token,
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/dev-api/user/logout',
    method: 'post'
  })
}
