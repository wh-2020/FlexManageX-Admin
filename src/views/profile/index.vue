<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/05 21:30:11
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <CommonPage>
    <!-- 个人信息卡片 -->
    <div class="profile-container">
      <n-card class="profile-card" :segmented="false">
        <div class="profile-header">
          <div class="avatar-container">
            <n-avatar round :size="120" :src="userStore.avatar" />
            <div class="avatar-edit-btn">
              <n-button circle type="primary" @click="avatarModalRef.open()">
                <i class="i-fe:edit"></i>
              </n-button>
            </div>
          </div>
          <div class="user-info">
            <h1 class="username">{{ userStore.username }}</h1>
            <div class="nickname">{{ userStore.nickName || '未设置昵称' }}</div>
            <div class="user-meta">
              <n-tag v-if="userStore.roleNames?.includes('超级管理员')" class="vip-tag" type="warning" size="small">
                <i class="i-fe:crown mr-2"></i>超级管理员
              </n-tag>
              <n-tag v-else-if="userStore.roleNames?.length" type="info" size="small">
                <i class="i-fe:user mr-2"></i>{{ userStore.roleNames?.join(', ') || '普通用户' }}
              </n-tag>
              <n-tag type="success" size="small" class="ml-8 certified-tag">
                <i class="i-fe:check-circle mr-2"></i>已认证
              </n-tag>
            </div>
          </div>
          <div class="action-buttons">
            <n-button type="primary" @click="profileModalRef.open()">
              <i class="i-fe:edit mr-2"></i>编辑资料
            </n-button>
            <n-button type="info" class="ml-12" @click="pwdModalRef.open()">
              <i class="i-fe:key mr-2"></i>修改密码
            </n-button>
          </div>
        </div>
      </n-card>
    </div>

    <!-- 详细信息卡片 -->
    <div class="info-cards">
      <n-card class="info-card" title="基本信息" :segmented="false">
        <div class="info-content">
          <div class="info-item">
            <div class="info-label">
              <i class="i-fe:user mr-2"></i>用户名
            </div>
            <div class="info-value">{{ userStore.username }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">
              <i class="i-fe:smile mr-2"></i>昵称
            </div>
            <div class="info-value">{{ userStore.nickName || '未设置' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">
              <i class="i-fe:users mr-2"></i>性别
            </div>
            <div class="info-value">
              {{ genders.find((item) => item.value === userStore.userInfo?.gender)?.label ?? '未知' }}
            </div>
          </div>
        </div>
      </n-card>

      <n-card class="info-card" title="联系方式" :segmented="false">
        <div class="info-content">
          <div class="info-item">
            <div class="info-label">
              <i class="i-fe:mail mr-2"></i>邮箱
            </div>
            <div class="info-value">{{ userStore.userInfo?.email || '未设置' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">
              <i class="i-fe:phone mr-2"></i>手机号
            </div>
            <div class="info-value">{{ userStore.userInfo?.phone || '未设置' }}</div>
          </div>


        </div>
      </n-card>

      <n-card class="info-card" title="账号安全" :segmented="false">
        <div class="info-content">
          <div class="info-item">
            <div class="info-label">
              <i class="i-fe:lock mr-2"></i>密码
            </div>
            <div class="info-value">
              <span>********</span>
              <n-button text type="primary" class="ml-12" @click="pwdModalRef.open()">
                修改
              </n-button>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">
              <i class="i-fe:shield mr-2"></i>账号状态
            </div>
            <div class="info-value">
              <n-tag type="success">安全</n-tag>
            </div>
          </div>
        </div>
      </n-card>
    </div>

    <!-- 模态框 -->
    <MeModal ref="avatarModalRef" width="420px" title="更改头像" @ok="handleAvatarSave()">
      <div class="avatar-preview">
        <n-avatar round :size="100" :src="newAvatar || userStore.avatar" />
      </div>
      <n-input v-model:value="newAvatar" placeholder="请输入头像URL地址" />
      <div class="avatar-tip">
        <n-alert type="info" :show-icon="false">
          修改头像只支持在线链接
        </n-alert>
      </div>
    </MeModal>

    <MeModal ref="pwdModalRef" title="修改密码" width="420px" @ok="handlePwdSave()">
      <n-form
        ref="pwdFormRef"
        :model="pwdForm"
        label-placement="left"
        require-mark-placement="left"
      >
        <n-form-item label="原密码" path="oldPassword" :rule="required">
          <n-input v-model:value="pwdForm.oldPassword" type="password" placeholder="请输入原密码" />
        </n-form-item>
        <n-form-item label="新密码" path="newPassword" :rule="required">
          <n-input v-model:value="pwdForm.newPassword" type="password" placeholder="请输入新密码" />
        </n-form-item>
      </n-form>
    </MeModal>

    <MeModal ref="profileModalRef" title="修改资料" width="420px" @ok="handleProfileSave()">
      <n-form ref="profileFormRef" :model="profileForm" label-placement="left">
        <n-form-item label="昵称" path="nick_name">
          <n-input v-model:value="profileForm.nick_name" placeholder="请输入昵称" />
        </n-form-item>
        <n-form-item label="性别" path="gender">
          <n-select
            v-model:value="profileForm.gender"
            :options="genders"
            placeholder="请选择性别"
          />
        </n-form-item>
        <n-form-item label="邮箱" path="email">
          <n-input v-model:value="profileForm.email" placeholder="请输入邮箱" />
        </n-form-item>
        <n-form-item label="手机号" path="phone">
          <n-input v-model:value="profileForm.phone" placeholder="请输入手机号" />
        </n-form-item>

      </n-form>
    </MeModal>

    <!-- 页脚版权信息 -->
    <TheFooter />
  </CommonPage>
</template>

<script setup>
import { MeModal } from '@/components'
import { useForm, useModal } from '@/composables'
import { useUserStore } from '@/store'
import { getUserInfo } from '@/store/helper'
import { TheFooter } from '@/components/common'
import api from './api'

const userStore = useUserStore()
const required = {
  required: true,
  message: '此为必填项',
  trigger: ['blur', 'change'],
}

const [pwdModalRef] = useModal()
const [pwdFormRef, pwdForm, pwdValidation] = useForm()

async function handlePwdSave() {
  await pwdValidation()
  await api.changePassword(pwdForm.value)
  $message.success('密码修改成功')
  refreshUserInfo()
}

const newAvatar = ref(userStore.avatar)
const [avatarModalRef] = useModal()
async function handleAvatarSave() {
  if (!newAvatar.value) {
    $message.error('请输入头像地址')
    return false
  }
  await api.updateProfile({ id: userStore.userId, avatar: newAvatar.value })
  $message.success('头像修改成功')
  refreshUserInfo()
}

const genders = [
  { label: '保密', value: 0 },
  { label: '男', value: 1 },
  { label: '女', value: 2 },
]
const [profileModalRef] = useModal()
const [profileFormRef, profileForm, profileValidation] = useForm({
  id: userStore.userId,
  nick_name: userStore.nickName,
  gender: userStore.userInfo?.gender ?? 0,
  email: userStore.userInfo?.email,
  phone: userStore.userInfo?.phone,
  feishu_id: userStore.userInfo?.feishuId,
  project_id: userStore.userInfo?.projectId,
})
async function handleProfileSave() {
  await profileValidation()
  await api.updateProfile(profileForm.value)
  $message.success('资料修改成功')
  refreshUserInfo()
}

async function refreshUserInfo() {
  const user = await getUserInfo()
  userStore.setUser(user)
}
</script>

<style scoped>
.profile-container {
  margin-bottom: 24px;
}

.profile-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 16px;
}

.avatar-container {
  position: relative;
  margin-right: 32px;
}

.avatar-edit-btn {
  position: absolute;
  right: 0;
  bottom: 0;
  transform: translate(25%, 25%);
}

.user-info {
  flex: 1;
}

.username {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #111827;
}

.nickname {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 12px;
}

.user-meta {
  display: flex;
  align-items: center;
}

.action-buttons {
  margin-left: auto;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.info-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  width: 100px;
  font-weight: 500;
  color: #4b5563;
  display: flex;
  align-items: center;
}

.info-value {
  flex: 1;
  display: flex;
  align-items: center;
}

.avatar-preview {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.avatar-tip {
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .info-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .avatar-container {
    margin-right: 0;
    margin-bottom: 16px;
  }

  .action-buttons {
    margin-left: 0;
    margin-top: 16px;
  }

  .info-cards {
    grid-template-columns: 1fr;
  }
}

.vip-tag {
  background: linear-gradient(135deg, #1a1a1a 0%, #5c5c5c 100%);
  color: #ffd700;
  border: 1px solid #ffd700;
  font-weight: 600;
}

.certified-tag {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: white;
  font-weight: 500;
}
</style>
