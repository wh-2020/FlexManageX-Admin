<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/05 21:28:09
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <CommonPage :show-header="false">
    <div class="error-container">
      <div class="error-content">
        <div class="error-icon">
          <i class="i-fe:lock text-120"></i>
        </div>
        <h1 class="error-title">{{ isDisabled ? '页面已禁用' : '403 禁止访问' }}</h1>
        <p class="error-description">
          {{ isDisabled
            ? `抱歉，"${menuName}"页面已被管理员禁用，暂时无法访问。`
            : '抱歉，您暂无权限访问，请联系管理员开通权限。'
          }}
        </p>
        <div class="error-actions">
          <n-button v-if="back" type="primary" ghost @click="router.replace(back)">
            返回上一页
          </n-button>
          <n-button type="primary" @click="router.replace('/')">
            返回首页
          </n-button>
        </div>
      </div>
    </div>
  </CommonPage>
</template>

<script setup>
const router = useRouter()
const route = useRoute()

const back = history.state.back
const isDisabled = ref(route.query.disabled === 'true')
const menuName = ref(route.query.menuName || '此')

if (history.state.from === 'permission-guard') {
  delete history.state.from
}
else if (route.query.path && !isDisabled.value) {
  router.replace(route.query.path)
}
</script>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
}

.error-content {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  max-width: 500px;
  width: 90%;
  animation: fadeIn 0.5s ease-out;
}

.error-icon {
  margin-bottom: 24px;
  color: #f56c6c;
}

.error-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
}

.error-description {
  font-size: 16px;
  color: #606266;
  margin-bottom: 32px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
