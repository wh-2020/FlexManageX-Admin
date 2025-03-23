import { request } from '@/utils/http';
import { 
  generateMockTeamData, 
  getDefaultWeeks, 
  generateMockSaturationData, 
  generateMockCycleRatioData,
  generateMockTesterCycleRatioData,
  generateMockCorrelationGraphData
} from '@/utils/mockData';

const API_BASE_URL = '/test-metrics';

// 检查是否使用模拟数据
const useMockData = () => {
  // 可以根据环境变量或本地存储来判断是否使用模拟数据
  const result = localStorage.getItem('use_mock_data') === 'true' || 
                import.meta.env.VITE_USE_MOCK_DATA === 'true';
  console.log('是否使用模拟数据:', result);
  return result;
}

// 处理API响应，使其符合前端组件期望的格式
// 前端组件期望 res.data 格式
const formatApiResponse = (response) => {
  console.log('API原始响应:', response);
  if (response && response.data !== undefined) {
    // 如果响应中直接包含data字段，将其封装成前端期望的格式
    return {
      data: response.data
    };
  }
  // 如果响应已经是正确格式或为空，则直接返回
  return response;
};

/**
 * 测试指标API服务
 */
export const testMetricsApi = {

  // 测试团队相关
  getTestTeams: () => {
    return request.get(`${API_BASE_URL}/test-teams`)
      .then(formatApiResponse); // 格式化响应数据
  },

  // 故事卡相关
  getStoryCards: (params) => {
    return request.get(`${API_BASE_URL}/story-cards`, { params })
      .then(formatApiResponse);
  },
}; 
