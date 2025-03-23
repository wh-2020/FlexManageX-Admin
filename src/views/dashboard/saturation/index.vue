<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/05 21:29:56
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <CommonPage>
    <div class="saturation-container">
      <n-card title="团队饱和度趋势" :bordered="false">
        <!-- 筛选条件 -->
        <n-space vertical :size="16">
          <n-form inline :label-width="80">
            <n-form-item label="时间范围">
              <n-select
                v-model:value="timeRange"
                :options="timeRangeOptions"
                style="width: 120px"
              />
            </n-form-item>
            <n-form-item label="团队">
              <n-select
                v-model:value="selectedTeam"
                :options="teamOptions"
                clearable
                style="width: 200px"
              />
            </n-form-item>
            <n-form-item label="日期">
              <n-date-picker
                v-model:value="selectedDate"
                type="date"
                clearable
                :disabled-date="disabledDate"
              />
            </n-form-item>
          </n-form>

          <!-- 图表区域 -->
          <div class="chart-container">
            <n-spin :show="loading">
              <div ref="chartRef" style="width: 100%; height: 400px"></div>
            </n-spin>
          </div>

          <!-- 数据表格 -->
          <n-data-table
            :columns="columns"
            :data="tableData"
            :pagination="pagination"
            :bordered="false"
            striped
          />
        </n-space>
      </n-card>
    </div>
  </CommonPage>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { testMetricsApi } from '@/api/testMetrics'
import * as echarts from 'echarts'

const message = useMessage()
const loading = ref(false)
const chartRef = ref(null)
const chart = ref(null)

// 时间范围选项
const timeRange = ref('week')
const timeRangeOptions = [
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '季度', value: 'quarter' }
]

// 团队选项
const selectedTeam = ref(null)
const teamOptions = ref([])

// 日期选择
const selectedDate = ref(getDefaultDate())

// 表格数据
const tableData = ref([])

// 表格列定义
const columns = [
  { title: '团队名称', key: 'name', width: 150 },
  { title: '饱和度(%)', key: 'value', width: 150 },
  { title: '工作量(小时)', key: 'workHours', width: 150 },
  { title: '考勤工时(小时)', key: 'attendanceHours', width: 150 },
  { title: '故事卡数量', key: 'storyCount', width: 150 },
  { title: '测试人员数量', key: 'testerCount', width: 150 }
]

// 分页配置
const pagination = {
  pageSize: 10
}

// 初始化
onMounted(async () => {
  await loadTeamOptions()
  await loadData()
  initChart()
})

// 监听筛选条件变化
watch([timeRange, selectedTeam, selectedDate], async () => {
  await loadData()
})

// 加载团队选项
async function loadTeamOptions() {
  try {
    const res = await testMetricsApi.getTestTeams()
    if (res.code === 0 && res.data) {
      teamOptions.value = res.data.map(team => ({
        label: team.name,
        value: team.id
      }))
    }
  } catch (error) {
    console.error('加载团队选项失败:', error)
    message.error('加载团队选项失败')
  }
}

// 加载数据
async function loadData() {
  try {
    loading.value = true
    
    const params = {
      period_type: timeRange.value,
      team_id: selectedTeam.value,
      start_date: formatDate(selectedDate.value)
    }
    
    const res = await testMetricsApi.getTeamSaturationTrend(params)
    if (res.code === 0 && res.data) {
      console.log('获取到的饱和度数据:', res.data)
      tableData.value = res.data
      updateChart(res.data)
    }
  } catch (error) {
    console.error('加载饱和度数据失败:', error)
    message.error('加载饱和度数据失败')
  } finally {
    loading.value = false
  }
}

// 初始化图表
function initChart() {
  if (chartRef.value) {
    chart.value = echarts.init(chartRef.value)
  }
}

// 更新图表数据
function updateChart(data) {
  if (!chart.value) return
  
  const xData = []
  const seriesData = {}
  
  // 处理数据
  data.forEach(item => {
    if (!xData.includes(item.period)) {
      xData.push(item.period)
    }
    
    if (!seriesData[item.name]) {
      seriesData[item.name] = []
    }
    
    seriesData[item.name].push(item.value)
  })
  
  // 构建图表配置
  const option = {
    title: {
      text: getChartTitle()
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: Object.keys(seriesData)
    },
    xAxis: {
      type: 'category',
      data: xData
    },
    yAxis: {
      type: 'value',
      name: '饱和度(%)'
    },
    series: Object.entries(seriesData).map(([name, values]) => ({
      name,
      type: 'line',
      data: values
    }))
  }
  
  chart.value.setOption(option)
}

// 获取默认日期
function getDefaultDate() {
  const now = new Date()
  
  if (timeRange.value === 'week') {
    const day = now.getDay() || 7
    const date = new Date(now)
    date.setDate(now.getDate() - day - 6)
    return date
  }
  
  if (timeRange.value === 'month') {
    const date = new Date(now)
    date.setMonth(now.getMonth() - 1)
    date.setDate(1)
    return date
  }
  
  const currentQuarter = Math.floor(now.getMonth() / 3)
  const date = new Date(now)
  date.setMonth(currentQuarter * 3)
  date.setDate(1)
  return date
}

// 格式化日期
function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 获取图表标题
function getChartTitle() {
  return `团队饱和度趋势 - ${timeRangeOptions.find(item => item.value === timeRange.value)?.label || '周'}`
}
</script>

<style scoped>
.saturation-container {
  padding: 16px;
}

.chart-container {
  width: 100%;
  height: 400px;
  margin: 16px 0;
}
</style>