/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/05 21:28:53
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { request } from '@/utils'

export default {
  create: data => request.post('/role', data),
  read: params => request.get('/role/page', { params }),
  update: data => request.patch(`/role/${data.id}`, data),
  delete: id => request.delete(`/role/${id}`),
  getAllRoles: () => request.get('/role'),

  getAllPermissionTree: () => request.get('/permission/tree'),
  getAllUsers: (params = {}) => request.get('/user', { params }),
  addRoleUsers: (roleId, data) => request.patch(`/role/users/add/${roleId}`, data),
  removeRoleUsers: (roleId, data) => request.patch(`/role/users/remove/${roleId}`, data),

  // 设置角色权限
  setRolePermissions: (roleId, permissionIds) =>
    request.put(`/role/${roleId}/permissions`, { permission_ids: permissionIds }),

  // 获取角色统计数据
  getRoleStats: () => request.get('/role/stats'),

  // 获取角色用户列表
  getRoleUsers: roleId => request.get(`/role/users/${roleId}`),
}
