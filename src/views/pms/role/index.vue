<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2024/04/01 15:52:40
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <CommonPage>
    <!-- 顶部统计卡片 -->
    <div class="dashboard-cards">
      <n-card class="dashboard-card" :segmented="false">
        <div class="card-content">
          <div class="card-icon role-icon">
            <i class="i-fe:users"></i>
          </div>
          <div class="card-data">
            <h3>角色总数</h3>
            <div class="data-value">{{ roleStats.total }}</div>
          </div>
        </div>
      </n-card>

      <n-card class="dashboard-card" :segmented="false">
        <div class="card-content">
          <div class="card-icon active-icon">
            <i class="i-fe:check-circle"></i>
          </div>
          <div class="card-data">
            <h3>启用角色</h3>
            <div class="data-value">{{ roleStats.active }}</div>
          </div>
        </div>
      </n-card>

      <n-card class="dashboard-card" :segmented="false">
        <div class="card-content">
          <div class="card-icon user-icon">
            <i class="i-fe:user"></i>
          </div>
          <div class="card-data">
            <h3>用户总数</h3>
            <div class="data-value">{{ roleStats.users }}</div>
          </div>
        </div>
      </n-card>

      <n-card class="dashboard-card" :segmented="false">
        <div class="card-content">
          <div class="card-icon permission-icon">
            <i class="i-fe:shield"></i>
          </div>
          <div class="card-data">
            <h3>权限总数</h3>
            <div class="data-value">{{ roleStats.permissions }}</div>
          </div>
        </div>
      </n-card>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="action-container">
      <div class="search-area">
        <n-input-group>
          <n-input v-model:value="queryItems.name" placeholder="请输入角色名称" clearable>
            <template #prefix>
              <i class="i-fe:search"></i>
            </template>
          </n-input>
          <n-select
            v-model:value="queryItems.enable"
            placeholder="角色状态"
            style="width: 120px"
            clearable
            :options="[
              { label: '启用', value: 1 },
              { label: '停用', value: 0 },
            ]"
          />
          <n-button type="primary" @click="handleSearch">
            <i class="i-fe:search mr-2"></i>搜索
          </n-button>
        </n-input-group>
      </div>
      <div class="action-buttons">
        <n-button type="primary" @click="handleAdd()">
          <i class="i-fe:plus mr-2"></i>新增角色
        </n-button>
        <n-button type="info" @click="refreshRoleData">
          <i class="i-fe:refresh-cw mr-2"></i>刷新
        </n-button>
      </div>
    </div>

    <!-- 角色列表 -->
    <div class="role-list-container">
      <n-card title="角色列表" :segmented="false">
        <template #header-extra>
          <n-tag type="info">共 {{ roleStats.total }} 个角色</n-tag>
        </template>
        <n-data-table
          ref="dataTable"
          :loading="tableLoading"
          :columns="columns"
          :data="roleList"
          :pagination="pagination"
          :row-key="row => row.id"
          @update:page="handlePageChange"
        />
      </n-card>
    </div>

    <!-- 角色详情抽屉 -->
    <n-drawer v-model:show="showRoleDetail" :width="500" placement="right">
      <n-drawer-content v-if="currentRole" :title="`角色详情: ${currentRole.name}`" closable>
        <n-tabs type="line" animated>
          <n-tab-pane name="basic" tab="基本信息">
            <div class="role-profile">
              <div class="role-icon-container">
                <div class="role-icon-large">
                  <i class="i-fe:users"></i>
                </div>
                <div class="role-status">
                  <n-tag :type="currentRole.enable ? 'success' : 'error'" size="large">
                    {{ currentRole.enable ? '启用' : '禁用' }}
                  </n-tag>
                </div>
              </div>
              <div class="role-info">
                <n-descriptions label-placement="left" bordered :column="1">
                  <n-descriptions-item label="角色名称">
                    {{ currentRole.name }}
                  </n-descriptions-item>
                  <n-descriptions-item label="角色编码">
                    {{ currentRole.code }}
                  </n-descriptions-item>
                  <n-descriptions-item label="用户数量">
                    <n-badge :value="currentRole.userCount || 0" type="info">
                      <n-button text type="primary" @click="() => $tabs.value = 'users'">
                        查看用户列表
                      </n-button>
                    </n-badge>
                  </n-descriptions-item>
                  <n-descriptions-item label="权限数量">
                    <n-badge :value="currentRole.permissionCount || 0" type="success">
                      <n-button text type="primary" @click="() => $tabs.value = 'permissions'">
                        查看权限列表
                      </n-button>
                    </n-badge>
                  </n-descriptions-item>
                  <n-descriptions-item label="创建时间">
                    {{ formatDateTime(currentRole.createTime) }}
                  </n-descriptions-item>
                </n-descriptions>
              </div>
            </div>
          </n-tab-pane>
          <n-tab-pane name="permissions" tab="权限列表">
            <div class="permission-tree-container">
              <n-spin :show="permissionLoading">
                <n-tree
                  v-if="currentRolePermissions.length > 0"
                  :data="currentRolePermissions"
                  key-field="id"
                  label-field="name"
                  :selectable="false"
                  :expand-on-click="true"
                  default-expand-all
                />
                <n-empty v-else description="该角色暂无权限" />
              </n-spin>
            </div>
          </n-tab-pane>
          <n-tab-pane name="users" tab="用户列表">
            <div class="role-users-container">
              <n-spin :show="usersLoading">
                <div v-if="currentRoleUsers.length > 0" class="user-list">
                  <div v-for="user in currentRoleUsers" :key="user.id" class="user-item">
                    <n-avatar round :size="40" :src="user.avatar" />
                    <div class="user-info">
                      <div class="user-name">{{ user.username }}</div>
                      <div class="user-email">{{ user.email || '未设置邮箱' }}</div>
                    </div>
                  </div>
                </div>
                <n-empty v-else description="该角色暂无用户" />
              </n-spin>
            </div>
          </n-tab-pane>
        </n-tabs>
        <template #footer>
          <div class="drawer-footer">
            <n-button @click="showRoleDetail = false">关闭</n-button>
            <n-button type="primary" @click="handleEditWithPermissions(currentRole)">
              编辑角色
            </n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>

    <!-- 角色编辑模态框 -->
    <MeModal ref="modalRef" width="520px">
      <n-form
        ref="modalFormRef"
        label-placement="left"
        label-align="left"
        :label-width="80"
        :model="modalForm"
      >
        <n-form-item
          label="角色名"
          path="name"
          :rule="{
            required: true,
            message: '请输入角色名',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.name" />
        </n-form-item>
        <n-form-item
          label="角色编码"
          path="code"
          :rule="{
            required: true,
            message: '请输入角色编码',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.code" :disabled="modalAction !== 'add'" />
        </n-form-item>
        <n-form-item label="权限" path="permissionIds">
          <n-tree
            key-field="id"
            label-field="name"
            :selectable="false"
            :data="permissionTree"
            :checked-keys="modalForm.permissionIds"
            :on-update:checked-keys="(keys) => (modalForm.permissionIds = keys)"
            default-expand-all
            checkable
            check-on-click
            class="cus-scroll max-h-200 w-full"
          />
        </n-form-item>
        <n-form-item label="状态" path="enable">
          <n-switch v-model:value="modalForm.enable">
            <template #checked>
              启用
            </template>
            <template #unchecked>
              停用
            </template>
          </n-switch>
        </n-form-item>
      </n-form>
    </MeModal>

    <!-- 页脚版权信息 -->
    <TheFooter />
  </CommonPage>
</template>

<script setup>
import { MeCrud, MeModal, MeQueryItem } from '@/components'
import { useCrud } from '@/composables'
import { request } from '@/utils'
import { formatDateTime } from '@/utils/date'
import { TheFooter } from '@/components/common'
import {
  NButton,
  NSwitch,
  NCard,
  NDataTable,
  NDrawer,
  NDrawerContent,
  NTabs,
  NTabPane,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NEmpty,
  NSpin,
  NAvatar,
  NInputGroup,
  NInput,
  NSelect,
  NBadge
} from 'naive-ui'
import api from './api'

defineOptions({ name: 'RoleMgt' })

const router = useRouter()

// 角色统计数据
const roleStats = ref({
  total: 0,
  active: 0,
  users: 0,
  permissions: 0
})

// 表格数据和加载状态
const tableLoading = ref(false)
const roleList = ref([])
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [10, 20, 30, 40],
  showSizePicker: true,
  onChange: (page) => {
    pagination.value.page = page
    loadRoleData()
  },
  onUpdatePageSize: (pageSize) => {
    pagination.value.pageSize = pageSize
    pagination.value.page = 1
    loadRoleData()
  }
})

// 查询参数
const queryItems = ref({})

// 角色详情相关
const showRoleDetail = ref(false)
const currentRole = ref(null)
const currentRolePermissions = ref([])
const currentRoleUsers = ref([])
const permissionLoading = ref(false)
const usersLoading = ref(false)

// 权限树
const permissionTree = ref([])

// 加载权限树
async function loadPermissionTree() {
  try {
    const res = await api.getAllPermissionTree()
    permissionTree.value = res?.data || []
  } catch (error) {
    console.error('加载权限树失败', error)
    $message.error('加载权限树失败')
  }
}

// 加载角色数据
async function loadRoleData() {
  tableLoading.value = true
  try {
    const params = {
      pageNo: pagination.value.page,
      pageSize: pagination.value.pageSize,
      ...queryItems.value
    }
    const res = await api.read(params)

    // 检查响应格式，适配不同的API返回格式
    if (res?.data?.pageData) {
      // 分页格式
      roleList.value = res.data.pageData
      pagination.value.itemCount = res.data.total || 0
    } else if (Array.isArray(res?.data)) {
      // 数组格式
      roleList.value = res.data
      pagination.value.itemCount = res.data.length
    } else {
      // 默认空数组
      roleList.value = []
      pagination.value.itemCount = 0
    }

    // 获取真实的统计数据
    await loadRoleStats()
  } catch (error) {
    console.error('加载角色数据失败', error)
    $message.error('加载角色数据失败')
    roleList.value = []
    pagination.value.itemCount = 0
  } finally {
    tableLoading.value = false
  }
}

// 获取角色统计数据
async function loadRoleStats() {
  try {
    const res = await api.getRoleStats()
    if (res && res.data) {
      roleStats.value = res.data
    } else {
      // 如果API调用失败，使用本地计算的数据
      updateRoleStats()
    }
  } catch (error) {
    console.error('获取角色统计数据失败', error)
    // 使用本地计算的数据
    updateRoleStats()
  }
}

// 本地计算角色统计数据（作为备用）
function updateRoleStats() {
  // 获取总数
  roleStats.value.total = pagination.value.itemCount

  // 获取启用角色数
  roleStats.value.active = roleList.value.filter(role => role.enable).length

  // 获取用户总数和权限总数（这里使用模拟数据，实际应该从后端获取）
  roleStats.value.users = 128
  roleStats.value.permissions = 56
}

// 搜索
function handleSearch() {
  pagination.value.page = 1
  loadRoleData()
}

// 刷新
function refreshRoleData() {
  loadRoleData()
  loadPermissionTree()
}

// 页面变化
function handlePageChange(page) {
  pagination.value.page = page
  loadRoleData()
}

// 查看角色详情
async function viewRoleDetail(role) {
  currentRole.value = { ...role }
  showRoleDetail.value = true

  // 加载角色权限
  await loadRolePermissions(role.id)

  // 加载角色用户
  await loadRoleUsers(role.id)
}

// 加载角色权限
async function loadRolePermissions(roleId) {
  permissionLoading.value = true
  try {
    // 使用新的API路径
    const { data: permissions } = await request.get(`/role/permissions/by-role?id=${roleId}`)
    currentRolePermissions.value = permissions || []

    // 更新当前角色的权限数量
    if (currentRole.value) {
      currentRole.value.permissionCount = countPermissions(currentRolePermissions.value)
    }
  } catch (error) {
    console.error('加载角色权限失败', error)
    currentRolePermissions.value = []
  } finally {
    permissionLoading.value = false
  }
}

// 计算权限总数（包括子权限）
function countPermissions(permissions) {
  let count = 0

  function traverse(items) {
    if (!items || !items.length) return

    count += items.length

    items.forEach(item => {
      if (item.children && item.children.length) {
        traverse(item.children)
      }
    })
  }

  traverse(permissions)
  return count
}

// 加载角色用户
async function loadRoleUsers(roleId) {
  usersLoading.value = true
  try {
    // 调用获取角色用户的API
    const res = await api.getRoleUsers(roleId)
    currentRoleUsers.value = res?.data || []

    // 更新当前角色的用户数量
    if (currentRole.value) {
      currentRole.value.userCount = currentRoleUsers.value.length
    }
  } catch (error) {
    console.error('加载角色用户失败', error)
    currentRoleUsers.value = []
  } finally {
    usersLoading.value = false
  }
}

// 初始化
onMounted(() => {
  loadRoleData()
  loadPermissionTree()
})

// 使用 useCrud 钩子
const { modalRef, modalFormRef, modalAction, modalForm, handleAdd, handleDelete, handleEdit }
  = useCrud({
    name: '角色',
    doCreate: async (data) => {
      // 创建角色
      const result = await api.create(data)
      // 如果有权限，设置角色权限
      if (data.permissionIds && data.permissionIds.length > 0) {
        try {
          await api.setRolePermissions(result.data.id, data.permissionIds)
        }
        catch (error) {
          console.error('设置角色权限失败:', error)
          $message.warning('角色创建成功，但设置权限失败')
        }
      }
      loadRoleData()
      return result
    },
    doDelete: api.delete,
    doUpdate: async (data) => {
      // 更新角色基本信息
      const result = await api.update(data)
      // 设置角色权限
      if (data.permissionIds) {
        try {
          await api.setRolePermissions(data.id, data.permissionIds)
        }
        catch (error) {
          console.error('设置角色权限失败:', error)
          $message.warning('角色更新成功，但设置权限失败')
        }
      }
      loadRoleData()
      return result
    },
    initForm: { enable: true, permissionIds: [] },
    refresh: () => loadRoleData(),
  })

// 重写编辑方法，获取角色权限
async function handleEditWithPermissions(row) {
  try {
    // 获取角色权限
    const { data: permissions } = await request.get(`/role/permissions/by-role?id=${row.id}`)
    // 提取权限ID
    const permissionIds = permissions ? permissions.map(item => item.id) : []
    // 调用原有的编辑方法，并添加权限ID
    handleEdit({ ...row, permissionIds })
  }
  catch (error) {
    console.error(error)
    $message.error('获取角色权限失败')
  }
}

async function handleEnable(row) {
  row.enableLoading = true
  try {
    await api.update({ id: row.id, enable: !row.enable })
    row.enableLoading = false
    $message.success('操作成功')
    loadRoleData()
  }
  catch (error) {
    console.error(error)
    row.enableLoading = false
  }
}

// 表格列定义
const columns = [
  {
    title: '角色名称',
    key: 'name',
    render: (row) => {
      return h(
        'div',
        {
          class: 'role-name-cell',
          onClick: () => viewRoleDetail(row)
        },
        [
          h('span', { class: 'role-name' }, row.name),
          h('span', { class: 'view-detail' }, '')
        ]
      )
    }
  },
  { title: '角色编码', key: 'code' },
  {
    title: '状态',
    key: 'enable',
    render: row =>
      h(
        NSwitch,
        {
          size: 'small',
          rubberBand: false,
          value: row.enable,
          loading: !!row.enableLoading,
          disabled: row.code === 'SUPER_ADMIN',
          onUpdateValue: () => handleEnable(row),
        },
        {
          checked: () => '启用',
          unchecked: () => '停用',
        },
      ),
  },
  {
    title: '操作',
    key: 'actions',
    width: 320,
    align: 'right',
    fixed: 'right',
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            secondary: true,
            onClick: () =>
              router.push({ path: `/pms/role/user/${row.id}`, query: { roleName: row.name } }),
          },
          {
            default: () => '分配用户',
            icon: () => h('i', { class: 'i-fe:user-plus text-14' }),
          },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            style: 'margin-left: 12px;',
            // disabled: row.code === 'SUPER_ADMIN',
            onClick: () => handleEditWithPermissions(row),
          },
          {
            default: () => '编辑',
            icon: () => h('i', { class: 'i-material-symbols:edit-outline text-14' }),
          },
        ),

        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            style: 'margin-left: 12px;',
            disabled: row.code === 'SUPER_ADMIN',
            onClick: () => handleDelete(row.id),
          },
          {
            default: () => '删除',
            icon: () => h('i', { class: 'i-material-symbols:delete-outline text-14' }),
          },
        ),
      ]
    },
  },
]
</script>

<style scoped>
/* 顶部统计卡片样式 */
.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.dashboard-card {
  border-radius: 12px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  align-items: center;
}

.card-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.role-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
}

.active-icon {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.user-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
}

.permission-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.card-data h3 {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 4px 0;
}

.data-value {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

/* 搜索和操作区域样式 */
.action-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.search-area {
  flex: 1;
  max-width: 600px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

/* 角色列表样式 */
.role-list-container {
  margin-bottom: 24px;
}

/* 角色名称单元格样式 */
.role-name-cell {
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.role-name {
  font-weight: 500;
  color: #1a202c;
}

.view-detail {
  font-size: 12px;
  color: #3b82f6;
  margin-top: 4px;
}

.view-detail:hover {
  text-decoration: underline;
}

/* 角色详情抽屉样式 */
.permission-tree-container, .role-users-container {
  height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 用户列表样式 */
.user-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background-color: #f9fafb;
}

.user-info {
  margin-left: 12px;
}

.user-name {
  font-weight: 500;
  color: #1a202c;
}

.user-email {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .dashboard-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .action-container {
    flex-direction: column;
    gap: 16px;
  }

  .search-area {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .dashboard-cards {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
