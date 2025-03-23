<template>
  <CommonPage>
    <!-- 顶部统计卡片 -->
    <div class="dashboard-cards">
      <n-card class="dashboard-card" :segmented="false">
        <div class="card-content">
          <div class="card-icon menu-icon">
            <i class="i-fe:menu"></i>
          </div>
          <div class="card-data">
            <h3>菜单总数</h3>
            <div class="data-value">{{ menuCount }}</div>
          </div>
        </div>
      </n-card>

      <n-card class="dashboard-card" :segmented="false">
        <div class="card-content">
          <div class="card-icon button-icon">
            <i class="i-fe:command"></i>
          </div>
          <div class="card-data">
            <h3>按钮总数</h3>
            <div class="data-value">{{ buttonCount }}</div>
          </div>
        </div>
      </n-card>

      <n-card class="dashboard-card" :segmented="false">
        <div class="card-content">
          <div class="card-icon active-icon">
            <i class="i-fe:check-circle"></i>
          </div>
          <div class="card-data">
            <h3>启用资源</h3>
            <div class="data-value">{{ enabledCount }}</div>
          </div>
        </div>
      </n-card>

      <n-card class="dashboard-card" :segmented="false">
        <div class="card-content">
          <div class="card-icon inactive-icon">
            <i class="i-fe:x-circle"></i>
          </div>
          <div class="card-data">
            <h3>禁用资源</h3>
            <div class="data-value">{{ disabledCount }}</div>
          </div>
        </div>
      </n-card>
    </div>

    <!-- 主要内容区域 -->
    <div class="resource-container">
      <!-- 左侧菜单树 -->
      <div class="resource-sidebar">
        <div class="sidebar-header">
          <h3>资源菜单</h3>
          <n-button size="small" type="primary" @click="handleAddMenu">
            <i class="i-fe:plus mr-2"></i>新增菜单
          </n-button>
        </div>
        <n-spin size="small" :show="treeLoading">
          <div class="menu-tree-container">
            <MenuTree
              v-model:current-menu="currentMenu"
              :tree-data="treeData"
              @refresh="initData"
            />
          </div>
        </n-spin>
      </div>

      <!-- 右侧详情区域 -->
      <div class="resource-content">
        <template v-if="currentMenu">
          <div class="content-header">
            <div class="header-info">
              <h2>{{ currentMenu.name }}</h2>
              <n-tag :type="currentMenu.enable ? 'success' : 'error'" size="small">
                {{ currentMenu.enable ? '已启用' : '已禁用' }}
              </n-tag>
            </div>
            <div class="header-actions">
              <n-button size="small" type="primary" @click="handleEdit(currentMenu)">
                <i class="i-material-symbols:edit-outline mr-2"></i>编辑
              </n-button>
            </div>
          </div>

          <n-tabs type="line" animated>
            <n-tab-pane name="details" tab="基本信息">
              <div class="details-container">
                <n-descriptions label-placement="left" bordered :column="2">
                  <n-descriptions-item label="编码">
                    {{ currentMenu.code }}
                  </n-descriptions-item>
                  <n-descriptions-item label="名称">
                    {{ currentMenu.name }}
                  </n-descriptions-item>
                  <n-descriptions-item label="路由地址">
                    {{ currentMenu.path ?? '--' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="组件路径">
                    {{ currentMenu.component ?? '--' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="菜单图标">
                    <span v-if="currentMenu.icon" class="flex items-center">
                      <i :class="`${currentMenu.icon}?mask text-22 mr-8`" />
                      <span class="opacity-50">{{ currentMenu.icon }}</span>
                    </span>
                    <span v-else>无</span>
                  </n-descriptions-item>
                  <n-descriptions-item label="layout">
                    {{ currentMenu.layout || '跟随系统' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="是否显示">
                    {{ currentMenu.show ? '是' : '否' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="是否启用">
                    {{ currentMenu.enable ? '是' : '否' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="KeepAlive">
                    {{ currentMenu.keepAlive ? '是' : '否' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="排序">
                    {{ currentMenu.order ?? '--' }}
                  </n-descriptions-item>
                </n-descriptions>
              </div>
            </n-tab-pane>

            <n-tab-pane name="buttons" tab="按钮管理">
              <div class="buttons-container">
                <div class="buttons-header">
                  <h3>按钮列表</h3>
                  <n-button size="small" type="primary" @click="handleAddBtn">
                    <i class="i-fe:plus mr-2"></i>新增按钮
                  </n-button>
                </div>
                <MeCrud
                  ref="$table"
                  :columns="btnsColumns"
                  :scroll-x="-1"
                  :get-data="api.getButtons"
                  :query-items="{ parentId: currentMenu.id }"
                />
              </div>
            </n-tab-pane>

            <n-tab-pane name="preview" tab="菜单预览">
              <div class="preview-container">
                <div class="preview-card">
                  <div class="preview-header">
                    <i v-if="currentMenu.icon" :class="`${currentMenu.icon} mr-2 text-18`"></i>
                    <span>{{ currentMenu.name }}</span>
                  </div>
                  <div class="preview-content">
                    <p class="preview-path">
                      <span class="label">路由路径:</span>
                      <span class="value">{{ currentMenu.path || '未设置' }}</span>
                    </p>
                    <p class="preview-component">
                      <span class="label">组件路径:</span>
                      <span class="value">{{ currentMenu.component || '未设置' }}</span>
                    </p>
                    <div class="preview-buttons" v-if="buttonList.length > 0">
                      <p class="buttons-title">包含按钮:</p>
                      <div class="button-tags">
                        <n-tag
                          v-for="btn in buttonList"
                          :key="btn.id"
                          size="small"
                          :type="btn.enable ? 'info' : 'default'"
                          class="button-tag"
                        >
                          {{ btn.name }}
                        </n-tag>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </n-tab-pane>
          </n-tabs>
        </template>
        <n-empty v-else class="h-450 f-c-c" size="large" description="请选择菜单查看详情" />
      </div>
    </div>
    <ResAddOrEdit ref="modalRef" :menus="treeData" @refresh="initData" />

    <!-- 页脚版权信息 -->
    <TheFooter />
  </CommonPage>
</template>

<script setup>
import { MeCrud } from '@/components'
import { NButton, NSwitch, NTag, NTabs, NTabPane } from 'naive-ui'
import api from './api'
import MenuTree from './components/MenuTree.vue'
import ResAddOrEdit from './components/ResAddOrEdit.vue'
import { TheFooter } from '@/components/common'

const treeData = ref([])
const treeLoading = ref(false)
const $table = ref(null)
const currentMenu = ref(null)
const buttonList = ref([])

// 统计数据
const menuCount = ref(0)
const buttonCount = ref(0)
const enabledCount = ref(0)
const disabledCount = ref(0)

// 计算统计数据
function calculateCounts(data) {
  let menus = 0
  let buttons = 0
  let enabled = 0
  let disabled = 0

  function traverse(items) {
    if (!items || !items.length) return

    items.forEach(item => {
      if (item.type === 'MENU') {
        menus++
      } else if (item.type === 'BUTTON') {
        buttons++
      }

      if (item.enable) {
        enabled++
      } else {
        disabled++
      }

      if (item.children && item.children.length) {
        traverse(item.children)
      }
    })
  }

  traverse(data)

  // 直接从API获取更准确的统计数据
  api.getResourceStats().then(res => {
    if (res && res.data) {
      menuCount.value = res.data.menuCount || menus
      buttonCount.value = res.data.buttonCount || buttons
      enabledCount.value = res.data.enabledCount || enabled
      disabledCount.value = res.data.disabledCount || disabled
    } else {
      menuCount.value = menus
      buttonCount.value = buttons
      enabledCount.value = enabled
      disabledCount.value = disabled
    }
  }).catch(() => {
    // 如果API调用失败，使用本地计算的数据
    menuCount.value = menus
    buttonCount.value = buttons
    enabledCount.value = enabled
    disabledCount.value = disabled
  })
}

async function initData(data) {
  if (data?.type === 'BUTTON') {
    $table.value.handleSearch()
    return
  }
  treeLoading.value = true
  try {
    // 尝试使用新API获取资源菜单树
    const res = await api.getResourceMenuTree()
    treeData.value = res?.data || []
  } catch (error) {
    console.error('获取资源菜单树失败', error)
    // 如果新API失败，回退到使用原来的API
    try {
      const res = await api.getMenuTree()
      treeData.value = res?.data || []
    } catch (fallbackError) {
      console.error('获取菜单树失败', fallbackError)
      treeData.value = []
      $message.error('获取菜单树失败')
    }
  }

  // 确保启用状态正确显示
  treeData.value.forEach(item => {
    if (item.enable === undefined) {
      item.enable = true // 默认为启用状态
    }
    if (item.children && item.children.length) {
      setDefaultEnable(item.children)
    }
  })

  calculateCounts(treeData.value)
  treeLoading.value = false

  if (data)
    currentMenu.value = data
}

// 递归设置默认启用状态
function setDefaultEnable(items) {
  if (!items || !items.length) return

  items.forEach(item => {
    if (item.enable === undefined) {
      item.enable = true // 默认为启用状态
    }
    if (item.children && item.children.length) {
      setDefaultEnable(item.children)
    }
  })
}

// 获取当前菜单的按钮列表
async function getButtonList() {
  if (!currentMenu.value) return

  try {
    const res = await api.getButtons({ parentId: currentMenu.value.id })
    buttonList.value = res?.data?.items || []
  } catch (error) {
    console.error('获取按钮列表失败', error)
    buttonList.value = []
  }
}

// 初始化数据
initData()

// 监听当前菜单变化
watch(
  () => currentMenu.value,
  async (v) => {
    await nextTick()
    if (v) {
      $table.value.handleSearch()
      getButtonList()
    }
  },
)

const modalRef = ref(null)

function handleAddMenu() {
  modalRef.value?.handleOpen({
    action: 'add',
    title: '新增菜单',
    row: { type: 'MENU' },
    okText: '保存',
  })
}

function handleEdit(item = {}) {
  modalRef.value?.handleOpen({
    action: 'edit',
    title: `编辑${item.type === 'MENU' ? '菜单' : '按钮'} - ${item.name}`,
    row: item,
    okText: '保存',
  })
}

function handleAddBtn() {
  modalRef.value?.handleOpen({
    action: 'add',
    title: '新增按钮',
    row: { type: 'BUTTON', parentId: currentMenu.value.id },
    okText: '保存',
  })
}

function handleEditBtn(row) {
  modalRef.value?.handleOpen({
    action: 'edit',
    title: `编辑按钮 - ${row.name}`,
    row,
    okText: '保存',
  })
}

function handleDeleteBtn(id) {
  const d = $dialog.warning({
    content: '确定删除？',
    title: '提示',
    positiveText: '确定',
    negativeText: '取消',
    async onPositiveClick() {
      try {
        d.loading = true
        await api.deletePermission(id)
        $message.success('删除成功')
        $table.value.handleSearch()
        getButtonList()
        d.loading = false
      }
      catch (error) {
        console.error(error)
        d.loading = false
      }
    },
  })
}

async function handleEnable(item) {
  try {
    item.enableLoading = true
    await api.savePermission(item.id, {
      enable: !item.enable,
    })
    $message.success('操作成功')
    $table.value?.handleSearch()
    getButtonList()
    item.enableLoading = false
  }
  catch (error) {
    console.error(error)
    item.enableLoading = false
  }
}

const btnsColumns = [
  { title: '名称', key: 'name' },
  { title: '编码', key: 'code' },
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
            style: 'margin-left: 12px;',
            onClick: () => handleEditBtn(row),
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
            onClick: () => handleDeleteBtn(row.id),
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

.menu-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
}

.button-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
}

.active-icon {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.inactive-icon {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
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

/* 主要内容区域样式 */
.resource-container {
  display: flex;
  gap: 24px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.resource-sidebar {
  width: 280px;
  border-right: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.menu-tree-container {
  padding: 16px;
  overflow-y: auto;
  height: 600px;
}

.resource-content {
  flex: 1;
  padding: 20px;
  min-height: 650px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-info h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

/* 详情容器样式 */
.details-container {
  margin-top: 16px;
}

/* 按钮管理样式 */
.buttons-container {
  margin-top: 16px;
}

.buttons-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.buttons-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

/* 预览样式 */
.preview-container {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.preview-card {
  width: 100%;
  max-width: 600px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 500;
}

.preview-content {
  padding: 16px;
}

.preview-path, .preview-component {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.label {
  font-weight: 500;
  color: #6b7280;
  width: 100px;
}

.value {
  color: #111827;
}

.preview-buttons {
  margin-top: 20px;
}

.buttons-title {
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
}

.button-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.button-tag {
  cursor: default;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .dashboard-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .resource-container {
    flex-direction: column;
  }

  .resource-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #f3f4f6;
  }

  .menu-tree-container {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .dashboard-cards {
    grid-template-columns: 1fr;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-actions {
    align-self: flex-end;
  }
}
</style>
