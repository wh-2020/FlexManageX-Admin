
<template>
  <div class="login-container">
    <!-- 左侧栏 -->
    <div class="login-left">
      <div class="site-title">{{ title }}</div>
      <div class="logo-container">
        <div class="dynamic-logo">
          <n-spin size="large" :show="true">
            <template #icon>
              <div class="custom-spin">
                <img src="@/assets/images/logo.png" class="logo-image" alt="logo">
              </div>
            </template>
          </n-spin>
        </div>
      </div>
      <div class="slogan-container">
        <h1 class="main-slogan">创新科技，智慧未来</h1>
        <p class="sub-slogan">打造高效、安全、智能的管理平台</p>
      </div>
    </div>

    <!-- 右侧栏 -->
    <div class="login-right">
      <div class="login-form-container">
        <h2 class="login-title">用户登录</h2>

        <div class="login-form">
          <n-input
            v-model:value="loginInfo.username"
            autofocus
            class="login-input"
            placeholder="请输入用户名"
            :maxlength="20"
          >
            <template #prefix>
              <i class="i-fe:user input-icon" />
            </template>
          </n-input>

          <n-input
            v-model:value="loginInfo.password"
            class="login-input"
            type="password"
            show-password-on="mousedown"
            placeholder="请输入密码"
            :maxlength="20"
            @keydown.enter="handleLogin()"
          >
            <template #prefix>
              <i class="i-fe:lock input-icon" />
            </template>
          </n-input>

          <div class="remember-me">
            <n-checkbox
              :checked="isRemember"
              label="记住我"
              :on-update:checked="(val) => (isRemember = val)"
            />
          </div>

          <div class="login-buttons">
            <n-button
              class="login-button"
              type="primary"
              :loading="loading"
              @click="handleLogin()"
            >
              账号登录
            </n-button>

            <n-button
              class="feishu-button"
              type="info"
              ghost
              @click="quickLogin()"
            >
              <i class="i-fe:send mr-2"></i> 飞书快捷登录
            </n-button>
          </div>
        </div>
      </div>

      <div class="copyright">
        Copyright © {{ new Date().getFullYear() }} {{ title }}. All Rights Reserved.
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/store'
import { lStorage } from '@/utils'
import { useStorage } from '@vueuse/core'
import api from './api'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const title = import.meta.env.VITE_TITLE

const loginInfo = ref({
  username: '',
  password: '',
})

const localLoginInfo = lStorage.get('loginInfo')
if (localLoginInfo) {
  loginInfo.value.username = localLoginInfo.username || ''
  loginInfo.value.password = localLoginInfo.password || ''
}

function quickLogin() {
  loginInfo.value.username = 'admin'
  loginInfo.value.password = '123456'
  handleLogin(true)
}

const isRemember = useStorage('isRemember', true)
const loading = ref(false)
async function handleLogin(isQuick) {
  const { username, password } = loginInfo.value
  if (!username || !password)
    return $message.warning('请输入用户名和密码')
  try {
    loading.value = true
    $message.loading('正在验证，请稍后...', { key: 'login' })
    const { data } = await api.login({ username, password: password.toString(), is_quick: !!isQuick })
    if (isRemember.value) {
      lStorage.set('loginInfo', { username, password })
    }
    else {
      lStorage.remove('loginInfo')
    }
    onLoginSuccess(data)
  }
  catch (error) {
    $message.destroy('login')
    console.error(error)
  }
  loading.value = false
}

async function onLoginSuccess(data = {}) {
  authStore.setToken(data)
  $message.loading('登录中...', { key: 'login' })
  try {
    $message.success('登录成功', { key: 'login' })
    if (route.query.redirect) {
      const path = route.query.redirect
      delete route.query.redirect
      router.push({ path, query: route.query })
    }
    else {
      router.push('/')
    }
  }
  catch (error) {
    console.error(error)
    $message.destroy('login')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.login-left {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 55%;
  background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%);
  color: white;
  padding: 40px;
}

.site-title {
  position: absolute;
  top: 40px;
  left: 40px;
  font-size: 28px;
  font-weight: bold;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 60px;
}

.dynamic-logo {
  position: relative;
}

.custom-spin {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.logo-image {
  width: 180px;
  height: 180px;
  object-fit: contain;
}

.slogan-container {
  text-align: center;
}

.main-slogan {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
}

.sub-slogan {
  font-size: 20px;
  opacity: 0.8;
}

.login-right {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 45%;
  background-color: #f5f5f5;
  padding: 40px;
}

.login-form-container {
  width: 380px;
  background-color: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.login-title {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40px;
  color: #333;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.login-input {
  margin-bottom: 20px;
  height: 50px;
}

.input-icon {
  font-size: 18px;
  margin-right: 10px;
}

.remember-me {
  margin-bottom: 30px;
}

.login-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-button,
.feishu-button {
  height: 50px;
  font-size: 16px;
  border-radius: 8px;
}

.copyright {
  position: absolute;
  bottom: 20px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .login-container {
    flex-direction: column;
  }

  .login-left,
  .login-right {
    width: 100%;
  }

  .login-left {
    height: 45vh;
    padding: 20px;
  }

  .site-title {
    position: static;
    margin-bottom: 20px;
    text-align: center;
  }

  .logo-container {
    margin: 10px 0 20px;
  }

  .logo-image {
    width: 120px;
    height: 120px;
  }

  .main-slogan {
    font-size: 28px;
  }

  .sub-slogan {
    font-size: 18px;
  }

  .login-right {
    height: 55vh;
    padding: 20px;
  }

  .login-form-container {
    width: 90%;
    max-width: 380px;
    padding: 30px;
  }

  :deep(.n-input__wrapper) {
  min-height: 40px !important;
  display: flex;
  align-items: center;
}



}
</style>
