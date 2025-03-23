<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/05 21:29:56
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <CommonPage>
    <div class="dashboard-container">
      <!-- 搜索栏 -->
      <n-card class="search-card" :segmented="false">
        <div class="search-form">
          <n-form inline :label-width="80">
            <n-form-item label="日期范围">
              <n-date-picker
                v-model:value="dateRange"
                type="daterange"
                clearable
                :default-value="getDefaultDateRange()"
                :shortcuts="dateShortcuts"
                @update:value="handleDateChange"
              />
            </n-form-item>
            <n-form-item label="测试团队">
              <n-select
                v-model:value="selectedTeam"
                :options="teamOptions"
                placeholder="请选择测试团队"
                clearable
                @update:value="handleTeamChange"
              />
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

      <!-- 开发测试周期比图表 -->
      <n-card title="开发测试周期比" class="chart-card" :segmented="false">
        <template #header-extra>
          <n-tag type="info">{{ getDateRangeText() }}</n-tag>
        </template>
        <div class="chart-container">
          <div ref="cycleRatioChartRef" class="chart"></div>
          <n-empty v-if="!cycleRatioData.length" description="暂无数据" />
        </div>
      </n-card>

      <!-- 团队开发测试周期比表格 -->
      <n-card title="团队开发测试周期比详情" class="table-card" :segmented="false">
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

defineOptions({ name: 'DevTestCycleRatio' })

// 图表引用
const cycleRatioChartRef = ref(null)
let cycleRatioChart = null

// 搜索条件
const dateRange = ref(null)
const selectedTeam = ref(null)

// 数据
const loading = ref(false)
const cycleRatioData = ref([])
const tableData = ref([])

// 团队选项
const teamOptions = [
  { label: 'OTD测试团队', value: 'otd' },
  { label: 'LTC测试团队', value: 'ltc' },
  { label: '平台开发测试团队', value: 'platform' },
  { label: '职能测试团队', value: 'function' },
]

// 日期快捷选项
const dateShortcuts = {
  上周: () => {
    const now = new Date()
    const currentDay = now.getDay() || 7
    const monday = new Date(now)
    monday.setDate(now.getDate() - currentDay - 6)
    monday.setHours(0, 0, 0, 0)

    const sunday = new Date(now)
    sunday.setDate(now.getDate() - currentDay)
    sunday.setHours(23, 59, 59, 999)

    return [monday, sunday]
  },
  本周: () => {
    const now = new Date()
    const currentDay = now.getDay() || 7
    const monday = new Date(now)
    monday.setDate(now.getDate() - currentDay + 1)
    monday.setHours(0, 0, 0, 0)

    const sunday = new Date(now)
    sunday.setDate(now.getDate() + (7 - currentDay))
    sunday.setHours(23, 59, 59, 999)

    return [monday, sunday]
  },
  上月: () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
    lastDay.setHours(23, 59, 59, 999)

    return [firstDay, lastDay]
  },
  本月: () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    lastDay.setHours(23, 59, 59, 999)

    return [firstDay, lastDay]
  },
}

// 获取默认日期范围（上一周）
function getDefaultDateRange() {
  return dateShortcuts.上周()
}

// 初始化默认日期
dateRange.value = getDefaultDateRange()

// 表格列定义
const columns = [
  { title: '团队名称', key: 'teamName', width: 150 },
  { title: '平均开发周期(天)', key: 'devCycle', width: 150 },
  { title: '平均测试周期(天)', key: 'testCycle', width: 150 },
  { title: '开发测试周期比', key: 'ratio', width: 150 },
  { title: '测试人员数量', key: 'memberCount', width: 150 },
  {
    title: '周期计算方式',
    key: 'excludeWeekend',
    width: 150,
    render: (row) => row.excludeWeekend ? '不含周末' : '含周末'
  }
]

// 分页配置
const pagination = {
  pageSize: 10
}

// 获取日期范围文本
function getDateRangeText() {
  if (!dateRange.value || !dateRange.value[0] || !dateRange.value[1]) {
    return '全部'
  }
  return `${formatDateTime(dateRange.value[0], 'YYYY.MM.DD')} - ${formatDateTime(dateRange.value[1], 'YYYY.MM.DD')}`
}

// 处理日期变化
function handleDateChange() {
  fetchData()
}

// 处理团队变化
function handleTeamChange() {
  fetchData()
}

// 重置筛选条件
function resetFilters() {
  dateRange.value = getDefaultDateRange()
  selectedTeam.value = null
  fetchData()
}

// 获取数据
function fetchData() {
  loading.value = true

  // 尝试从API获取数据
  try {
    // 这里应该调用实际的API
    // 例如: const response = await api.getCycleRatioData(dateRange.value, selectedTeam.value)
    
    // 由于API可能未实现，使用模拟数据
    setTimeout(() => {
      // 生成模拟数据
      const mockData = generateMockData()
      cycleRatioData.value = mockData
      tableData.value = mockData

      loading.value = false

      // 更新图表
      nextTick(() => {
        initChart()
      })
    }, 500)
  } catch (error) {
    console.error('获取数据失败:', error)
    loading.value = false
    // 使用模拟数据作为备份
    const mockData = generateMockData()
    cycleRatioData.value = mockData
    tableData.value = mockData
    
    // 更新图表
    nextTick(() => {
      initChart()
    })
  }
}

// 生成模拟数据
function generateMockData() {
  const teams = [
    { id: 'otd', name: 'OTD测试团队' },
    { id: 'ltc', name: 'LTC测试团队' },
    { id: 'platform', name: '平台开发测试团队' },
    { id: 'function', name: '职能测试团队' }
  ]

  // 如果选择了特定团队，只返回该团队数据
  const filteredTeams = selectedTeam.value
    ? teams.filter(team => team.id === selectedTeam.value)
    : teams

  return filteredTeams.map(team => {
    const devCycle = parseFloat((Math.random() * 5 + 3).toFixed(1))
    const testCycle = parseFloat((Math.random() * 3 + 2).toFixed(1))
    const ratio = parseFloat((devCycle / testCycle).toFixed(2))
    const memberCount = Math.floor(Math.random() * 10) + 5

    return {
      teamId: team.id,
      teamName: team.name,
      devCycle,
      testCycle,
      ratio,
      memberCount,
      excludeWeekend: true
    }
  })
}

// 初始化图表
function initChart() {
  if (!cycleRatioChartRef.value) return

  if (cycleRatioChart) {
    cycleRatioChart.dispose()
  }

  cycleRatioChart = echarts.init(cycleRatioChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        const data = params[0].data
        return `${params[0].name}<br/>
                开发周期: ${data.devCycle}天<br/>
                测试周期: ${data.testCycle}天<br/>
                周期比: ${data.ratio}`
      }
    },
    legend: {
      data: ['开发周期', '测试周期', '周期比']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: cycleRatioData.value.map(item => item.teamName)
    },
    yAxis: [
      {
        type: 'value',
        name: '天数',
        position: 'left',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#5470C6'
          }
        },
        axisLabel: {
          formatter: '{value} 天'
        }
      },
      {
        type: 'value',
        name: '比值',
        position: 'right',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#91CC75'
          }
        },
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: '开发周期',
        type: 'bar',
        data: cycleRatioData.value.map(item => ({
          value: item.devCycle,
          devCycle: item.devCycle,
          testCycle: item.testCycle,
          ratio: item.ratio
        }))
      },
      {
        name: '测试周期',
        type: 'bar',
        data: cycleRatioData.value.map(item => ({
          value: item.testCycle,
          devCycle: item.devCycle,
          testCycle: item.testCycle,
          ratio: item.ratio
        }))
      },
      {
        name: '周期比',
        type: 'line',
        yAxisIndex: 1,
        data: cycleRatioData.value.map(item => ({
          value: item.ratio,
          devCycle: item.devCycle,
          testCycle: item.testCycle,
          ratio: item.ratio
        }))
      }
    ]
  }

  cycleRatioChart.setOption(option)

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    cycleRatioChart && cycleRatioChart.resize()
  })
}

// 监听窗口大小变化
watch(
  () => cycleRatioData.value,
  () => {
    nextTick(() => {
      cycleRatioChart && cycleRatioChart.resize()
    })
  }
)

// 组件挂载时初始化
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.dashboard-container {
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
</style>