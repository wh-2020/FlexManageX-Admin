<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/05 21:29:56
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <CommonPage>
    <div class="story-status-container">
      <!-- 搜索栏 -->
      <n-card class="search-card" :segmented="false">
        <div class="search-form">
          <n-form inline :label-width="80">
            <n-form-item label="时间范围">
              <n-select
                v-model:value="timeRange"
                :options="timeRangeOptions"
                @update:value="handleTimeRangeChange"
              />
            </n-form-item>
            <n-form-item label="具体时间">
              <n-date-picker
                v-if="timeRange === 'week'"
                v-model:value="selectedDate"
                type="week"
                clearable
                :default-value="getDefaultDate()"
                @update:value="handleDateChange"
              >
                <template #date-icon>
                  <i class="i-carbon:calendar"></i>
                </template>
              </n-date-picker>
              <n-date-picker
                v-else-if="timeRange === 'month'"
                v-model:value="selectedDate"
                type="month"
                clearable
                :default-value="getDefaultDate()"
                @update:value="handleDateChange"
              >
                <template #date-icon>
                  <i class="i-carbon:calendar"></i>
                </template>
              </n-date-picker>
              <n-date-picker
                v-else
                v-model:value="selectedDate"
                type="quarter"
                clearable
                :default-value="getDefaultDate()"
                @update:value="handleDateChange"
              >
                <template #date-icon>
                  <i class="i-carbon:calendar"></i>
                </template>
              </n-date-picker>
            </n-form-item>
            <n-form-item>
              <n-button type="primary" @click="fetchData">
                <template #icon>
                  <i class="i-carbon:search"></i>
                </template>
                搜索
              </n-button>
              <n-button class="ml-4" @click="resetFilters">
                <template #icon>
                  <i class="i-carbon:reset"></i>
                </template>
                重置
              </n-button>
            </n-form-item>
          </n-form>
        </div>
      </n-card>

      <!-- 故事状态统计卡片 -->
      <div class="status-cards">
        <n-card class="status-card" :segmented="false">
          <div class="card-content">
            <div class="card-icon dev-icon">
              <i class="i-carbon:development"></i>
            </div>
            <div class="card-data">
              <h3>开发中</h3>
              <div class="data-value">{{ storyStats.developing }}</div>
            </div>
          </div>
        </n-card>

        <n-card class="status-card" :segmented="false">
          <div class="card-content">
            <div class="card-icon test-icon">
              <i class="i-carbon:test"></i>
            </div>
            <div class="card-data">
              <h3>测试中</h3>
              <div class="data-value">{{ storyStats.testing }}</div>
            </div>
          </div>
        </n-card>

        <n-card class="status-card" :segmented="false">
          <div class="card-content">
            <div class="card-icon complete-icon">
              <i class="i-carbon:checkmark-filled"></i>
            </div>
            <div class="card-data">
              <h3>已完结</h3>
              <div class="data-value">{{ storyStats.completed }}</div>
            </div>
          </div>
        </n-card>

        <n-card class="status-card" :segmented="false">
          <div class="card-content">
            <div class="card-icon total-icon">
              <i class="i-carbon:document"></i>
            </div>
            <div class="card-data">
              <h3>总计</h3>
              <div class="data-value">{{ storyStats.total }}</div>
            </div>
          </div>
        </n-card>
      </div>

      <!-- 故事状态图表 -->
      <n-card :title="getChartTitle()" class="chart-card" :segmented="false">
        <template #header-extra>
          <n-tag type="info">{{ getDateRangeText() }}</n-tag>
        </template>
        <div class="chart-container">
          <div ref="storyStatusChartRef" class="chart"></div>
          <n-empty v-if="!storyStatusData.length" description="暂无数据" />
        </div>
      </n-card>

      <!-- 故事列表 -->
      <n-card title="故事列表" class="table-card" :segmented="false">
        <n-data-table
          :columns="columns"
          :data="tableData"
          :pagination="pagination"
          :loading="loading"
          striped
        />
      </n-card>
    </div>
  </CommonPage>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick, h } from 'vue'
import * as echarts from 'echarts'
import { formatDateTime } from '@/utils/date'

defineOptions({ name: 'StoryStatus' })

// 图表引用
const storyStatusChartRef = ref(null)
let storyStatusChart = null

// 搜索条件
const timeRange = ref('week')
const selectedDate = ref(null)

// 数据
const loading = ref(false)
const storyStatusData = ref([])
const tableData = ref([])

// 故事状态统计
const storyStats = ref({
  developing: 0,
  testing: 0,
  completed: 0,
  total: 0,
})

// 时间范围选项
const timeRangeOptions = [
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '季度', value: 'quarter' },
]

// 状态选项
const statusOptions = [
  { label: '开发中', value: 'developing' },
  { label: '测试中', value: 'testing' },
  { label: '验收中', value: 'accepting' },
  { label: '待发布', value: 'pending' },
  { label: '已上线', value: 'online' },
]

// 获取默认日期
function getDefaultDate() {
  const now = new Date()

  if (timeRange.value === 'week') {
    // 获取上周的星期一
    const day = now.getDay() || 7
    const date = new Date(now)
    date.setDate(now.getDate() - day - 6)
    return date
  }

  if (timeRange.value === 'month') {
    // 获取上个月的第一天
    const date = new Date(now)
    date.setMonth(now.getMonth() - 1)
    date.setDate(1)
    return date
  }

  // 获取当前季度的第一天
  const currentMonth = now.getMonth()
  const quarterStartMonth = Math.floor(currentMonth / 3) * 3
  const date = new Date(now)
  date.setMonth(quarterStartMonth)
  date.setDate(1)
  return date
}

// 初始化默认日期
selectedDate.value = getDefaultDate()

// 表格列定义
const columns = [
  { title: '故事ID', key: 'id', width: 100 },
  { title: '故事标题', key: 'title', width: 200, ellipsis: { tooltip: true } },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const status = statusOptions.find(item => item.value === row.status)
      let type = 'default'

      if (row.status === 'developing') {
        type = 'info'
      } else if (row.status === 'testing') {
        type = 'warning'
      } else if (['accepting', 'pending', 'online'].includes(row.status)) {
        type = 'success'
      }

      return h('n-tag', { type }, { default: () => status?.label || '未知' })
    }
  },
  { title: '测试人员', key: 'tester', width: 120 },
  { title: '开发人员', key: 'developer', width: 120 },
  {
    title: '开始时间',
    key: 'startTime',
    width: 150,
    render: (row) => formatDateTime(row.startTime)
  },
  {
    title: '结束时间',
    key: 'endTime',
    width: 150,
    render: (row) => row.endTime ? formatDateTime(row.endTime) : '-'
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row) => {
      return h('n-button', {
        size: 'small',
        onClick: () => viewStoryDetail(row)
      }, { default: () => '查看详情' })
    }
  }
]

// 分页配置
const pagination = {
  pageSize: 10
}

// 获取图表标题
function getChartTitle() {
  return `故事状态分布 - ${timeRangeOptions.find(item => item.value === timeRange.value)?.label || '周'}`
}

// 获取日期范围文本
function getDateRangeText() {
  if (!selectedDate.value) {
    return '全部'
  }

  const date = new Date(selectedDate.value)

  if (timeRange.value === 'week') {
    // 计算周的开始和结束日期
    const day = date.getDay() || 7
    const startDate = new Date(date)
    startDate.setDate(date.getDate() - day + 1)

    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)

    return `${formatDateTime(startDate, 'YYYY.MM.DD')} - ${formatDateTime(endDate, 'YYYY.MM.DD')}`
  } else if (timeRange.value === 'month') {
    // 显示月份
    return formatDateTime(date, 'YYYY.MM')
  } else {
    // 显示季度
    const month = date.getMonth()
    const quarterStartMonth = Math.floor(month / 3) * 3
    const quarterNumber = Math.floor(month / 3) + 1

    return `${formatDateTime(date, 'YYYY')} Q${quarterNumber}`
  }
}

// 处理时间范围变化
function handleTimeRangeChange() {
  selectedDate.value = getDefaultDate()
  fetchData()
}

// 处理日期变化
function handleDateChange() {
  fetchData()
}

// 重置筛选条件
function resetFilters() {
  timeRange.value = 'week'
  selectedDate.value = getDefaultDate()
  fetchData()
}

// 查看故事详情
function viewStoryDetail(story) {
  console.log(`查看故事详情: ${story.title}`)
  // 这里可以实现查看详情的逻辑，例如打开抽屉或模态框
}

// 获取数据
function fetchData() {
  loading.value = true

  // 模拟API调用
  setTimeout(() => {
    // 生成模拟数据
    const mockData = generateMockData()
    storyStatusData.value = mockData.statusData
    tableData.value = mockData.stories

    // 更新统计数据
    storyStats.value = {
      developing: mockData.stories.filter(item => item.status === 'developing').length,
      testing: mockData.stories.filter(item => item.status === 'testing').length,
      completed: mockData.stories.filter(item => ['accepting', 'pending', 'online'].includes(item.status)).length,
      total: mockData.stories.length
    }

    loading.value = false

    // 更新图表
    nextTick(() => {
      initChart()
    })
  }, 500)
}

// 生成模拟数据
function generateMockData() {
  // 生成状态数据
  const developing = Math.floor(Math.random() * 10) + 5
  const testing = Math.floor(Math.random() * 8) + 3
  const accepting = Math.floor(Math.random() * 5) + 2
  const pending = Math.floor(Math.random() * 4) + 1
  const online = Math.floor(Math.random() * 10) + 5

  const statusData = [
    { name: '开发中', value: developing },
    { name: '测试中', value: testing },
    { name: '验收中', value: accepting },
    { name: '待发布', value: pending },
    { name: '已上线', value: online }
  ]

  // 生成故事数据
  const stories = []
  const statusValues = ['developing', 'testing', 'accepting', 'pending', 'online']
  const statusCounts = [developing, testing, accepting, pending, online]

  let storyId = 1001

  statusValues.forEach((status, index) => {
    const count = statusCounts[index]

    for (let i = 0; i < count; i++) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30))

      let endDate = null
      if (status !== 'developing' && status !== 'testing') {
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 10) + 5)
      }

      stories.push({
        id: `STORY-${storyId++}`,
        title: `测试故事 ${storyId - 1001}: ${statusOptions.find(item => item.value === status)?.label}状态的故事`,
        status,
        tester: `测试员${Math.floor(Math.random() * 10) + 1}`,
        developer: `开发员${Math.floor(Math.random() * 10) + 1}`,
        startTime: startDate,
        endTime: endDate
      })
    }
  })

  return {
    statusData,
    stories
  }
}

// 初始化图表
function initChart() {
  if (!storyStatusChartRef.value) return

  if (storyStatusChart) {
    storyStatusChart.dispose()
  }

  storyStatusChart = echarts.init(storyStatusChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: storyStatusData.value.map(item => item.name)
    },
    series: [
      {
        name: '故事状态',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: storyStatusData.value.map(item => ({
          name: item.name,
          value: item.value
        }))
      }
    ]
  }

  storyStatusChart.setOption(option)

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    storyStatusChart && storyStatusChart.resize()
  })
}

// 监听窗口大小变化
watch(
  () => storyStatusData.value,
  () => {
    nextTick(() => {
      storyStatusChart && storyStatusChart.resize()
    })
  }
)

// 组件挂载时初始化
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.story-status-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-card {
  margin-bottom: 16px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.status-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.status-card {
  height: 120px;
}

.card-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 16px;
  font-size: 24px;
}

.dev-icon {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.test-icon {
  background-color: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.complete-icon {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.total-icon {
  background-color: rgba(144, 147, 153, 0.1);
  color: #909399;
}

.card-data h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #606266;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.chart-card {
  margin-bottom: 16px;
}

.chart-container {
  height: 400px;
  width: 100%;
}

.chart {
  height: 100%;
  width: 100%;
}

.table-card {
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .status-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .status-cards {
    grid-template-columns: 1fr;
  }
}
</style>