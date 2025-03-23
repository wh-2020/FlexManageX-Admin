<template>
  <CommonPage>
    <!-- 顶部统计卡片 -->
    <div class="dashboard-cards">
      <n-card class="dashboard-card" :segmented="false">
        <div class="card-content">
          <div class="card-icon total-icon">
            <i class="i-fe:users"></i>
          </div>
          <div class="card-data">
            <h3>用户总数</h3>
            <div class="data-value">{{ userStats.total }}</div>
          </div>
        </div>
      </n-card>

      <n-card class="dashboard-card" :segmented="false">
        <div class="card-content">
          <div class="card-icon active-icon">
            <i class="i-fe:check-circle"></i>
          </div>
          <div class="card-data">
            <h3>启用用户</h3>
            <div class="data-value">{{ userStats.active }}</div>
          </div>
        </div>
      </n-card>

      <n-card class="dashboard-card" :segmented="false">
        <div class="card-content">
          <div class="card-icon male-icon">
            <i class="i-fe:user"></i>
          </div>
          <div class="card-data">
            <h3>男性用户</h3>
            <div class="data-value">{{ userStats.male }}</div>
          </div>
        </div>
      </n-card>

      <n-card class="dashboard-card" :segmented="false">
        <div class="card-content">
          <div class="card-icon female-icon">
            <i class="i-fe:user"></i>
          </div>
          <div class="card-data">
            <h3>女性用户</h3>
            <div class="data-value">{{ userStats.female }}</div>
          </div>
        </div>
      </n-card>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="action-container">
      <div class="search-area">
        <n-input-group>
          <n-input v-model:value="queryItems.username" placeholder="请输入用户名" clearable>
            <template #prefix>
              <i class="i-fe:search"></i>
            </template>
          </n-input>
          <n-select
            v-model:value="queryItems.gender"
            placeholder="性别"
            style="width: 100px"
            clearable
            :options="genders"
          />
          <n-select
            v-model:value="queryItems.enable"
            placeholder="状态"
            style="width: 100px"
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
        <n-button v-permission="'AddUser'" type="primary" @click="handleAdd()">
          <i class="i-fe:user-plus mr-2"></i>创建用户
        </n-button>
        <n-button type="info" @click="refreshUserData">
          <i class="i-fe:refresh-cw mr-2"></i>刷新
        </n-button>
      </div>
    </div>

    <!-- 用户列表 -->
    <n-card title="用户列表" :segmented="false" class="user-list-container">
      <template #header-extra>
        <n-tag type="info">共 {{ userStats.total }} 个用户</n-tag>
      </template>

      <!-- 用户列表表格 -->
      <n-data-table
        ref="dataTable"
        :loading="tableLoading"
        :columns="columns"
        :data="userList"
        :pagination="pagination"
        :row-key="row => row.id"
        @update:page="handlePageChange"
      />
    </n-card>

    <!-- 用户详情抽屉 -->
    <n-drawer v-model:show="showUserDetail" :width="500" placement="right">
      <n-drawer-content v-if="currentUser" :title="`用户详情: ${currentUser.username}`" closable>
        <n-tabs type="line" animated>
          <n-tab-pane name="basic" tab="基本信息">
            <div class="user-profile">
              <div class="user-avatar">
                <n-avatar round :size="80" :src="currentUser.avatar" />
              </div>
              <div class="user-info">
                <n-descriptions label-placement="left" bordered :column="1">
                  <n-descriptions-item label="用户名">
                    {{ currentUser.username }}
                  </n-descriptions-item>
                  <n-descriptions-item label="性别">
                    {{ genders.find(g => g.value === currentUser.gender)?.label || '未设置' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="邮箱">
                    {{ currentUser.email || '未设置' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="状态">
                    <n-tag :type="currentUser.enable ? 'success' : 'error'">
                      {{ currentUser.enable ? '启用' : '禁用' }}
                    </n-tag>
                  </n-descriptions-item>
                  <n-descriptions-item label="创建时间">
                    {{ formatDateTime(currentUser.createTime) }}
                  </n-descriptions-item>
                </n-descriptions>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="roles" tab="角色信息">
            <div class="user-roles">
              <div v-if="currentUser.roles && currentUser.roles.length > 0" class="role-list">
                <div v-for="role in currentUser.roles" :key="role.id" class="role-item">
                  <div class="role-badge" :class="role.enable ? 'enabled' : 'disabled'"></div>
                  <div class="role-info">
                    <div class="role-name">{{ role.name }}</div>
                    <div class="role-code">{{ role.code }}</div>
                  </div>
                </div>
              </div>
              <n-empty v-else description="该用户暂无角色" />
            </div>
          </n-tab-pane>

          <n-tab-pane name="activity" tab="活动记录">
            <div class="user-activity">
              <n-timeline>
                <n-timeline-item
                  v-for="(activity, index) in userActivities"
                  :key="index"
                  :type="activity.type"
                  :title="activity.title"
                  :time="activity.time"
                  :content="activity.content"
                />
              </n-timeline>
            </div>
          </n-tab-pane>
        </n-tabs>

        <template #footer>
          <div class="drawer-footer">
            <n-button @click="showUserDetail = false">关闭</n-button>
            <n-button type="primary" @click="handleOpenRolesSet(currentUser)">
              分配角色
            </n-button>
            <n-button type="warning" @click="handleOpen({ action: 'reset', title: '重置密码', row: currentUser, onOk: onSave })">
              重置密码
            </n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>

    <!-- 用户编辑模态框 -->
    <MeModal ref="modalRef" width="520px">
      <n-form
        ref="modalFormRef"
        label-placement="left"
        label-align="left"
        :label-width="80"
        :model="modalForm"
        :disabled="modalAction === 'view'"
      >
        <n-form-item
          label="用户名"
          path="username"
          :rule="{
            required: true,
            message: '请输入用户名',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.username" :disabled="modalAction !== 'add'" />
        </n-form-item>
        <n-form-item
          v-if="['add', 'reset'].includes(modalAction)"
          :label="modalAction === 'reset' ? '重置密码' : '初始密码'"
          path="password"
          :rule="{
            required: true,
            message: '请输入密码',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.password" type="password" show-password-on="click" />
        </n-form-item>

        <n-form-item v-if="['add', 'setRole'].includes(modalAction)" label="角色" path="roleIds">
          <n-select
            v-model:value="modalForm.roleIds"
            :options="roles"
            label-field="name"
            value-field="id"
            clearable
            filterable
            multiple
          />
        </n-form-item>

        <n-form-item v-if="modalAction === 'add'" label="性别" path="gender">
          <n-select
            v-model:value="modalForm.gender"
            :options="genders"
            clearable
          />
        </n-form-item>

        <n-form-item v-if="modalAction === 'add'" label="邮箱" path="email">
          <n-input v-model:value="modalForm.email" placeholder="请输入邮箱" />
        </n-form-item>

        <n-form-item v-if="modalAction === 'add'" label="手机号" path="phone">
          <n-input v-model:value="modalForm.phone" placeholder="请输入手机号" />
        </n-form-item>

        <n-form-item v-if="modalAction === 'add'" label="状态" path="enable">
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
      <n-alert v-if="modalAction === 'add'" type="warning" closable>
        详细信息需由用户本人补充修改
      </n-alert>
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
  NAvatar,
  NButton,
  NSwitch,
  NTag,
  NCard,
  NDataTable,
  NDrawer,
  NDrawerContent,
  NTabs,
  NTabPane,
  NDescriptions,
  NDescriptionsItem,
  NEmpty,
  NTimeline,
  NTimelineItem,
  NInputGroup,
  NInput,
  NSelect
} from 'naive-ui'
import api from './api'

defineOptions({ name: 'UserMgt' })

// 用户统计数据
const userStats = ref({
  total: 0,
  active: 0,
  male: 0,
  female: 0
})

// 表格数据和加载状态
const tableLoading = ref(false)
const userList = ref([])
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [10, 20, 30, 40],
  showSizePicker: true,
  onChange: (page) => {
    pagination.value.page = page
    loadUserData()
  },
  onUpdatePageSize: (pageSize) => {
    pagination.value.pageSize = pageSize
    pagination.value.page = 1
    loadUserData()
  }
})

// 查询参数
const queryItems = ref({})

// 用户详情相关
const showUserDetail = ref(false)
const currentUser = ref(null)

// 性别选项
const genders = [
  { label: '男', value: 1 },
  { label: '女', value: 2 },
]

// 角色列表
const roles = ref([])

// 用户活动记录
const userActivities = ref([
  { type: 'success', title: '登录系统', time: '2023-01-15 08:30:45', content: '用户成功登录系统' },
  { type: 'info', title: '更新资料', time: '2023-01-20 14:25:10', content: '用户更新了个人资料' },
  { type: 'warning', title: '修改密码', time: '2023-02-05 09:15:30', content: '用户修改了登录密码' },
  { type: 'error', title: '登录失败', time: '2023-02-10 18:45:12', content: '用户登录失败，密码错误' },
  { type: 'success', title: '更新资料', time: '2023-03-01 11:20:35', content: '用户更新了个人资料' }
])

// 加载角色列表
async function loadRoles() {
  try {
    const { data = [] } = await api.getAllRoles()
    roles.value = data
  } catch (error) {
    console.error('加载角色列表失败', error)
    $message.error('加载角色列表失败')
  }
}

// 加载用户数据
async function loadUserData() {
  tableLoading.value = true
  try {
    const params = {
      pageNo: pagination.value.page,
      pageSize: pagination.value.pageSize,
      ...queryItems.value
    }
    const res = await api.read(params)
    userList.value = res?.data?.pageData || []
    pagination.value.itemCount = res?.data?.total || 0

    // 更新统计数据
    updateUserStats()
  } catch (error) {
    console.error('加载用户数据失败', error)
    $message.error('加载用户数据失败')
  } finally {
    tableLoading.value = false
  }
}

// 更新用户统计数据
function updateUserStats() {
  // 获取总数
  userStats.value.total = pagination.value.itemCount

  // 获取启用用户数
  userStats.value.active = userList.value.filter(user => user.enable).length

  // 获取男性和女性用户数
  userStats.value.male = userList.value.filter(user => user.gender === 1).length
  userStats.value.female = userList.value.filter(user => user.gender === 2).length
}

// 搜索
function handleSearch() {
  pagination.value.page = 1
  loadUserData()
}

// 刷新
function refreshUserData() {
  loadUserData()
  loadRoles()
}

// 页面变化
function handlePageChange(page) {
  pagination.value.page = page
  loadUserData()
}

// 查看用户详情
function viewUserDetail(user) {
  currentUser.value = { ...user }
  showUserDetail.value = true

  // 这里可以加载用户的更多详细信息
  // 例如：loadUserRoles(user.id)
}

// 初始化
onMounted(() => {
  loadUserData()
  loadRoles()
})

// 使用 useCrud 钩子
const {
  modalRef,
  modalFormRef,
  modalForm,
  modalAction,
  handleAdd,
  handleDelete,
  handleOpen,
  handleSave,
} = useCrud({
  name: '用户',
  initForm: { enable: true, gender: null, email: '' },
  doCreate: api.create,
  doDelete: api.delete,
  doUpdate: api.update,
  refresh: () => loadUserData(),
})

// 启用/禁用用户
async function handleEnable(row) {
  row.enableLoading = true
  try {
    await api.update({ id: row.id, enable: !row.enable })
    row.enableLoading = false
    $message.success('操作成功')
    loadUserData()
  }
  catch (error) {
    console.error(error)
    row.enableLoading = false
  }
}

// 打开角色设置
function handleOpenRolesSet(row) {
  const roleIds = row.roles?.map(item => item.id) || []
  handleOpen({
    action: 'setRole',
    title: '分配角色',
    row: { id: row.id, username: row.username, roleIds },
    onOk: onSave,
  })
}

// 保存操作
function onSave() {
  if (modalAction.value === 'setRole') {
    return handleSave({
      api: () => api.addUserRoles(modalForm.value.id, { role_ids: modalForm.value.roleIds }),
      cb: () => {
        $message.success('分配成功')
        loadUserData()
        if (currentUser.value && currentUser.value.id === modalForm.value.id) {
          // 更新当前查看的用户信息
          const updatedRoles = roles.value.filter(role => modalForm.value.roleIds.includes(role.id))
          currentUser.value.roles = updatedRoles
        }
      },
    })
  }
  else if (modalAction.value === 'reset') {
    return handleSave({
      api: () => api.resetPwd(modalForm.value.id, modalForm.value),
      cb: () => $message.success('密码重置成功'),
    })
  }
  handleSave()
}

// 表格列定义
const columns = [
  {
    title: '用户信息',
    key: 'userInfo',
    width: 200,
    render: (row) => {
      return h('div', {
        class: 'user-info-cell',
        onClick: () => viewUserDetail(row)
      }, [
        h(NAvatar, {
          size: 'small',
          round: true,
          src: row.avatar,
          style: 'margin-right: 8px;'
        }),
        h('div', { class: 'user-info-content' }, [
          h('div', { class: 'username' }, row.username),
          h('div', { class: 'view-detail' }, '')
        ])
      ])
    }
  },
  {
    title: '角色',
    key: 'roles',
    width: 200,
    ellipsis: { tooltip: true },
    render: ({ roles }) => {
      if (roles?.length) {
        if (roles.length <= 2) {
          return roles.map((item, index) =>
            h(
              NTag,
              { type: 'success', style: index > 0 ? 'margin-left: 8px;' : '' },
              { default: () => item.name },
            ),
          )
        } else {
          // 如果角色数量超过2个，只显示前2个，其余显示为数字
          const visibleRoles = roles.slice(0, 2);
          const remainingCount = roles.length - 2;

          return [
            ...visibleRoles.map((item, index) =>
              h(
                NTag,
                { type: 'success', style: index > 0 ? 'margin-left: 8px;' : '' },
                { default: () => item.name },
              ),
            ),
            h(
              NTag,
              { type: 'info', style: 'margin-left: 8px;' },
              { default: () => `+${remainingCount}` },
            ),
          ]
        }
      }
      return '暂无角色'
    },
  },
  {
    title: '性别',
    key: 'gender',
    width: 80,
    render: ({ gender }) => genders.find(item => gender === item.value)?.label ?? '',
  },
  { title: '邮箱', key: 'email', width: 150, ellipsis: { tooltip: true } },
  {
    title: '创建时间',
    key: 'createTime',
    width: 180,
    render(row) {
      console.log('创建时间原始值:', row.createTime, typeof row.createTime);
      return h('span', formatDateTime(row.createTime))
    },
  },
  {
    title: '状态',
    key: 'enable',
    width: 120,
    render: row =>
      h(
        NSwitch,
        {
          size: 'small',
          rubberBand: false,
          value: row.enable,
          loading: !!row.enableLoading,
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
    hideInExcel: true,
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            secondary: true,
            onClick: () => handleOpenRolesSet(row),
          },
          {
            default: () => '分配角色',
            icon: () => h('i', { class: 'i-carbon:user-role text-14' }),
          },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            style: 'margin-left: 12px;',
            onClick: () => handleOpen({ action: 'reset', title: '重置密码', row, onOk: onSave }),
          },
          {
            default: () => '重置密码',
            icon: () => h('i', { class: 'i-radix-icons:reset text-14' }),
          },
        ),

        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            style: 'margin-left: 12px;',
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

.total-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
}

.active-icon {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.male-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
}

.female-icon {
  background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
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

/* 用户列表样式 */
.user-list-container {
  margin-bottom: 24px;
}

/* 用户信息单元格样式 */
.user-info-cell {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-info-content {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 500;
  color: #1a202c;
}

.view-detail {
  font-size: 12px;
  color: #3b82f6;
  margin-top: 2px;
}

.view-detail:hover {
  text-decoration: underline;
}

/* 用户详情抽屉样式 */
.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  margin-bottom: 16px;
}

.user-info {
  width: 100%;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 角色列表样式 */
.role-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.role-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background-color: #f9fafb;
}

.role-badge {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 12px;
}

.role-badge.enabled {
  background-color: #10b981;
}

.role-badge.disabled {
  background-color: #ef4444;
}

.role-info {
  display: flex;
  flex-direction: column;
}

.role-name {
  font-weight: 500;
  color: #1a202c;
}

.role-code {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

/* 用户活动记录样式 */
.user-activity {
  padding: 8px;
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
