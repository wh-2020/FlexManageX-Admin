/**********************************
 * @FilePath: interceptors.js
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/04 22:46:40
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { useAuthStore } from '@/store'
import { resolveResError } from './helpers'

export function setupInterceptors(axiosInstance) {
  const SUCCESS_CODES = [0, 200]
  function resResolve(response) {
    const { data, status, config, statusText, headers } = response
    
    // 测试指标API的特殊处理
    if (config.url.includes('/test-metrics') || config.url.includes('/api/test-metrics')) {
      console.log('测试指标API响应:', config.url, data)
      // 确保测试指标API返回的数据即使没有code字段也能正常处理
      return Promise.resolve(data || { data: null })
    }
    
    if (headers['content-type']?.includes('json')) {
      if (SUCCESS_CODES.includes(data?.code)) {
        return Promise.resolve(data)
      }
      const code = data?.code ?? status

      const needTip = config?.needTip !== false

      // 根据code处理对应的操作，并返回处理后的message
      const message = resolveResError(code, data?.message ?? statusText, needTip)

      return Promise.reject({ code, message, error: data ?? response })
    }
    return Promise.resolve(data ?? response)
  }

  axiosInstance.interceptors.request.use(reqResolve, reqReject)
  axiosInstance.interceptors.response.use(resResolve, resReject)
}

function reqResolve(config) {
  // 测试指标API的特殊处理
  if (config.url && (config.url.includes('/test-metrics') || config.url.includes('/api/test-metrics'))) {
    console.log('发送测试指标API请求:', config.url, config.params)
  }
  
  // 处理不需要token的请求
  if (config.needToken === false) {
    return config
  }

  const { accessToken } = useAuthStore()
  if (accessToken) {
    // token: Bearer + xxx
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
}

function reqReject(error) {
  return Promise.reject(error)
}

async function resReject(error) {
  if (!error || !error.response) {
    const code = error?.code
    /** 根据code处理对应的操作，并返回处理后的message */
    const message = resolveResError(code, error.message)
    return Promise.reject({ code, message, error })
  }

  const { data, status, config } = error.response
  
  // 测试指标API的特殊处理 - 即使出错也返回空数据而不是报错
  if (config.url && (config.url.includes('/test-metrics') || config.url.includes('/api/test-metrics'))) {
    console.error('测试指标API请求失败:', config.url, error)
    return Promise.resolve({ data: null, success: false, message: data?.message || error.message })
  }
  
  const code = data?.code ?? status

  const needTip = config?.needTip !== false
  const message = resolveResError(code, data?.message ?? error.message, needTip)
  return Promise.reject({ code, message, error: error.response?.data || error.response })
}
