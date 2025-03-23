/**
 * 模拟数据生成工具
 */

/**
 * 获取默认近8周的周数据
 * @returns {Array} 周数据数组
 */
export const getDefaultWeeks = () => {
  const weeks = [];
  const today = new Date();
  
  // 生成近8周的周数据
  for (let i = 7; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - (i * 7));
    const weekNum = getWeekNumber(date);
    weeks.push(`${date.getFullYear()}-W${weekNum < 10 ? '0' + weekNum : weekNum}`);
  }
  
  return weeks;
};

/**
 * 获取指定日期的周数
 * @param {Date} date 日期对象
 * @returns {number} 周数
 */
export const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

/**
 * 生成模拟团队数据
 * @param {number} count 需要生成的团队数量
 * @returns {Array} 团队数据数组
 */
export const generateMockTeamData = (count = 3) => {
  const teams = [];
  const teamNames = ['UI测试团队', '接口测试团队', '性能测试团队', '自动化测试团队', '安全测试团队'];
  
  for (let i = 0; i < count; i++) {
    const teamId = i + 1;
    const randomName = i < teamNames.length ? teamNames[i] : `测试团队${i+1}`;
    const createDate = new Date();
    createDate.setDate(createDate.getDate() - Math.floor(Math.random() * 500));
    
    teams.push({
      id: teamId,
      name: randomName,
      tester_count: Math.floor(Math.random() * 10) + 3,
      createTime: createDate.toISOString(),
      avgSaturation: (Math.floor(Math.random() * 30) + 70).toString()
    });
  }
  
  return teams;
};

/**
 * 生成模拟故事卡数据
 * @param {number} count 故事卡数量
 * @returns {Array} 故事卡数据数组
 */
export const generateMockStoryCards = (count = 30) => {
  const cards = [];
  const statuses = ['进行中', '已完成', '已关闭', '待开始'];
  const priorities = ['高', '中', '低'];
  const teams = generateMockTeamData(3);
  
  for (let i = 0; i < count; i++) {
    const createDate = new Date();
    createDate.setDate(createDate.getDate() - Math.floor(Math.random() * 60));
    
    const teamIndex = Math.floor(Math.random() * teams.length);
    const team = teams[teamIndex];
    
    cards.push({
      id: i + 1,
      title: `测试故事卡-${i+1}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      test_team_id: team.id,
      test_team_name: team.name,
      developer_name: `开发者${Math.floor(Math.random() * 10) + 1}`,
      tester_name: `测试者${Math.floor(Math.random() * 5) + 1}`,
      create_time: createDate.toISOString(),
      dev_days: parseFloat((Math.random() * 5 + 3).toFixed(1)),
      test_days: parseFloat((Math.random() * 3 + 2).toFixed(1)),
      cycle_ratio: parseFloat((Math.random() * 0.5 + 0.6).toFixed(2))
    });
  }
  
  return cards;
};

/**
 * 生成模拟饱和度数据
 * @param {number} teamCount 团队数量
 * @returns {Array} 饱和度数据数组
 */
export const generateMockSaturationData = (teamCount = 3) => {
  const periods = getDefaultWeeks();
  const teams = generateMockTeamData(teamCount);
  const result = [];
  
  // 兼容旧格式的数据
  const oldFormat = teams.flatMap(team => {
    return periods.map(period => ({
      team_id: team.id,
      team_name: team.name,
      period,
      saturation: Math.floor(Math.random() * 30) + 70
    }));
  });
  
  // 新格式的数据 - 按团队分组
  teams.forEach(team => {
    const seriesData = periods.map(period => ({
      period,
      saturation: Math.floor(Math.random() * 30) + 70
    }));
    
    result.push({
      name: team.name,
      id: team.id,
      data: seriesData
    });
  });
  
  console.log('生成模拟饱和度数据:', result.length > 0 ? result : oldFormat);
  return result.length > 0 ? result : oldFormat;
};

/**
 * 生成模拟周期比数据
 * @param {number} teamCount 团队数量
 * @returns {Object} 周期比数据对象
 */
export const generateMockCycleRatioData = (teamCount = 3) => {
  const weeks = getDefaultWeeks();
  const teams = generateMockTeamData(teamCount);
  const result = {
    weeks: weeks,
    ratios: [],
    devDays: [],
    testDays: []
  };
  
  // 确保生成的数据结构符合图表期望
  if (teamCount === 1) {
    // 单团队数据 - 直接数组格式
    const teamRatios = [];
    const teamDevDays = [];
    const teamTestDays = [];
    
    weeks.forEach(() => {
      const ratio = parseFloat((Math.random() * 0.5 + 0.8).toFixed(2));
      const devDays = parseFloat((Math.random() * 3 + 5).toFixed(1));
      const testDays = parseFloat((Math.random() * 2 + 3).toFixed(1));
      
      teamRatios.push(ratio);
      teamDevDays.push(devDays);
      teamTestDays.push(testDays);
    });
    
    result.ratios = teamRatios;
    result.devDays = teamDevDays;
    result.testDays = teamTestDays;
  } else {
    // 多团队数据 - 每个系列都是对象数组
    teams.forEach(team => {
      const teamRatios = [];
      const teamDevDays = [];
      const teamTestDays = [];
      
      weeks.forEach(() => {
        const ratio = parseFloat((Math.random() * 0.5 + 0.8).toFixed(2));
        const devDays = parseFloat((Math.random() * 3 + 5).toFixed(1));
        const testDays = parseFloat((Math.random() * 2 + 3).toFixed(1));
        
        teamRatios.push(ratio);
        teamDevDays.push(devDays);
        teamTestDays.push(testDays);
      });
      
      result.ratios.push({
        name: team.name,
        id: team.id,
        data: teamRatios,
        type: 'line'
      });
      
      result.devDays.push({
        name: `${team.name}-开发`,
        id: `${team.id}_dev`,
        data: teamDevDays,
        type: 'bar'
      });
      
      result.testDays.push({
        name: `${team.name}-测试`,
        id: `${team.id}_test`,
        data: teamTestDays,
        type: 'bar'
      });
    });
  }
  
  console.log('生成模拟周期比数据:', result);
  return result;
};

/**
 * 生成模拟测试人员周期比数据
 * @param {number} teamId 团队ID
 * @param {number} testerCount 测试人员数量
 * @returns {Array} 测试人员周期比数据数组
 */
export const generateMockTesterCycleRatioData = (teamId, testerCount = 5) => {
  const testers = [];
  
  for (let i = 0; i < testerCount; i++) {
    testers.push({
      id: i + 1,
      name: `测试人员${i+1}`,
      team_id: teamId,
      avgRatio: parseFloat((Math.random() * 0.5 + 0.8).toFixed(2)),
      avgDevDays: parseFloat((Math.random() * 3 + 5).toFixed(1)),
      avgTestDays: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      storyCount: Math.floor(Math.random() * 20) + 10
    });
  }
  
  return testers;
};

/**
 * 生成模拟关系图数据
 * @param {string} type 关系图类型: tester_dev, team_topic, dev_topic
 * @returns {Object} 关系图数据对象
 */
export const generateMockCorrelationGraphData = (type = 'tester_dev') => {
  let categories = [];
  const nodes = [];
  const links = [];
  
  if (type === 'tester_dev') {
    // 测试人员-开发者关系图
    categories = [
      { name: '测试人员' },
      { name: '开发人员' }
    ];
    
    // 生成测试人员节点
    for (let i = 0; i < 5; i++) {
      nodes.push({
        id: `tester_${i+1}`,
        name: `测试人员${i+1}`,
        symbolSize: Math.floor(Math.random() * 30) + 30,
        category: 0
      });
    }
    
    // 生成开发人员节点
    for (let i = 0; i < 8; i++) {
      nodes.push({
        id: `dev_${i+1}`,
        name: `开发者${i+1}`,
        symbolSize: Math.floor(Math.random() * 20) + 25,
        category: 1
      });
    }
    
    // 生成关系连接
    nodes.filter(node => node.category === 0).forEach(tester => {
      const devCount = Math.floor(Math.random() * 4) + 1;
      const devNodes = nodes.filter(node => node.category === 1);
      
      for (let i = 0; i < devCount; i++) {
        const randomDevIndex = Math.floor(Math.random() * devNodes.length);
        const dev = devNodes[randomDevIndex];
        
        links.push({
          source: tester.id,
          target: dev.id,
          value: Math.floor(Math.random() * 10) + 1
        });
      }
    });
  } else if (type === 'team_topic') {
    // 团队-专题关系图
    categories = [
      { name: '测试团队' },
      { name: '专题' }
    ];
    
    // 生成团队节点
    for (let i = 0; i < 3; i++) {
      nodes.push({
        id: `team_${i+1}`,
        name: `测试团队${i+1}`,
        symbolSize: Math.floor(Math.random() * 30) + 30,
        category: 0
      });
    }
    
    // 生成专题节点
    for (let i = 0; i < 6; i++) {
      nodes.push({
        id: `topic_${i+1}`,
        name: `专题${i+1}`,
        symbolSize: Math.floor(Math.random() * 20) + 25,
        category: 1
      });
    }
    
    // 生成关系连接
    nodes.filter(node => node.category === 0).forEach(team => {
      const topicCount = Math.floor(Math.random() * 4) + 1;
      const topicNodes = nodes.filter(node => node.category === 1);
      
      for (let i = 0; i < topicCount; i++) {
        const randomTopicIndex = Math.floor(Math.random() * topicNodes.length);
        const topic = topicNodes[randomTopicIndex];
        
        links.push({
          source: team.id,
          target: topic.id,
          value: Math.floor(Math.random() * 10) + 1
        });
      }
    });
  } else if (type === 'dev_topic') {
    // 开发者-专题关系图
    categories = [
      { name: '开发人员' },
      { name: '专题' }
    ];
    
    // 生成开发人员节点
    for (let i = 0; i < 8; i++) {
      nodes.push({
        id: `dev_${i+1}`,
        name: `开发者${i+1}`,
        symbolSize: Math.floor(Math.random() * 30) + 30,
        category: 0
      });
    }
    
    // 生成专题节点
    for (let i = 0; i < 6; i++) {
      nodes.push({
        id: `topic_${i+1}`,
        name: `专题${i+1}`,
        symbolSize: Math.floor(Math.random() * 20) + 25,
        category: 1
      });
    }
    
    // 生成关系连接
    nodes.filter(node => node.category === 0).forEach(dev => {
      const topicCount = Math.floor(Math.random() * 3) + 1;
      const topicNodes = nodes.filter(node => node.category === 1);
      
      for (let i = 0; i < topicCount; i++) {
        const randomTopicIndex = Math.floor(Math.random() * topicNodes.length);
        const topic = topicNodes[randomTopicIndex];
        
        links.push({
          source: dev.id,
          target: topic.id,
          value: Math.floor(Math.random() * 10) + 1
        });
      }
    });
  }
  
  return {
    nodes,
    links,
    categories
  };
};

/**
 * 启用模拟数据模式
 */
export const enableMockData = () => {
  localStorage.setItem('use_mock_data', 'true');
  console.log('模拟数据模式已启用');
};

/**
 * 禁用模拟数据模式
 */
export const disableMockData = () => {
  localStorage.removeItem('use_mock_data');
  console.log('模拟数据模式已禁用');
}; 