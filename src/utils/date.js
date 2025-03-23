/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2024/04/01 15:52:04
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

/**
 * 格式化日期时间
 * @param {string|number|Date} date 日期时间
 * @param {string} format 格式化模式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期时间字符串
 */
export function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) {
    return '--'
  }

  let dt = date

  if (typeof date === 'string') {
    // 处理ISO格式的日期字符串，包括带有时区信息的格式
    // 例如: "2023-11-18T16:18:59.150632+00:00Z"
    dt = new Date(date)
  }
  else if (typeof date === 'number') {
    // 处理时间戳
    dt = new Date(date)
  }

  if (!(dt instanceof Date) || Number.isNaN(dt.getTime())) {
    return '--'
  }

  const year = dt.getFullYear()
  const month = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  const hours = String(dt.getHours()).padStart(2, '0')
  const minutes = String(dt.getMinutes()).padStart(2, '0')
  const seconds = String(dt.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 获取相对时间描述
 * @param {string|number|Date} date 日期时间
 * @returns {string} 相对时间描述，如"刚刚"、"5分钟前"、"2小时前"等
 */
export function getRelativeTime(date) {
  if (!date) {
    return '--'
  }

  let dt = date

  if (typeof date === 'string') {
    // 处理ISO格式的日期字符串，包括带有时区信息的格式
    dt = new Date(date)
  }
  else if (typeof date === 'number') {
    dt = new Date(date)
  }

  if (!(dt instanceof Date) || Number.isNaN(dt.getTime())) {
    return '--'
  }

  const now = new Date()
  const diff = now.getTime() - dt.getTime()

  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚'
  }

  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  }

  // 小于1天
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  }

  // 小于30天
  if (diff < 30 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
  }

  // 大于30天，返回具体日期
  return formatDateTime(dt, 'YYYY-MM-DD')
}
