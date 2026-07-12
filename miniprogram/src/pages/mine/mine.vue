<template>
<view class="page">
  <view class="profile">
    <view class="avatar">{{ (user?.nickname || '?').charAt(0) }}</view>
    <view>
      <text class="p-name">{{ user?.nickname || '未登录' }}</text>
      <text class="p-role" @click="switchRole">{{ user?.roleName || '' }} 切换 ›</text>
    </view>
  </view>

  <view class="menu">
    <view class="menu-item" @click="goNotif">
      <view class="mi-dot blue"></view>
      <text class="mi-lbl">通知消息</text><text class="mi-arr">›</text>
    </view>
    <view class="menu-item" @click="goSelect">
      <view class="mi-dot green"></view>
      <text class="mi-lbl">选户操作</text><text class="mi-arr">›</text>
    </view>
    <view class="menu-item" @click="goBatch">
      <view class="mi-dot orange"></view>
      <text class="mi-lbl">批量上报</text><text class="mi-arr">›</text>
    </view>
    <view class="menu-item" @click="goSwitch('task-list')" style="border:none;">
      <view class="mi-dot purple"></view>
      <text class="mi-lbl">我的任务</text><text class="mi-arr">›</text>
    </view>
  </view>

  <view class="ver">
    <text>分户验收 v1.0.0</text>
    <text>数据模式：Mock</text>
  </view>
</view>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/user'
const mockUsers = [
  { id: 'u_001', nickname: '张查验', role: 'inspector', roleName: '查验员' },
  { id: 'u_002', nickname: '李整改', role: 'rectifier', roleName: '整改员' },
  { id: 'u_003', nickname: '王监理', role: 'supervisor', roleName: '监理' },
  { id: 'u_004', nickname: '赵管理', role: 'admin', roleName: '管理员' }
]

const store = useUserStore()
const user = computed(() => store.user)

function switchRole() {
  const curRole = store.user?.role || 'inspector'
  const idx = mockUsers.findIndex(u => u.role === curRole)
  const next = mockUsers[(idx + 1) % mockUsers.length]
  store.setLogin(next, 'mock_token_' + next.id)
  uni.showToast({ title: '已切换为' + next.roleName, icon: 'none' })
}

function goNotif() { uni.navigateTo({ url: '/pages/notifications/notifications' }) }
function goSelect() { uni.navigateTo({ url: '/pages/household-center/household-center?select=1' }) }
function goBatch() { uni.navigateTo({ url: '/pages/batch-report/batch-report' }) }
function goSwitch(p) { uni.switchTab({ url: '/pages/task-list/task-list' }) }
</script>

<style scoped>
.page { padding: 0 16px 20px; }
.profile { display: flex; align-items: center; gap: 14px; padding: 20px 16px; margin: 16px 0; background: #fff; border: 1px solid #E8E9F1; border-radius: 14px; }
.avatar { width: 48px; height: 48px; border-radius: 14px; background: #006FFD; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; }
.p-name { font-size: 16px; font-weight: 600; color: #1F2024; display: block; }
.p-role { font-size: 12px; color: #006FFD; margin-top: 4px; display: inline-block; padding: 2px 8px; border: 1px dashed #006FFD; border-radius: 4px; }
.menu { background: #fff; border: 1px solid #E8E9F1; border-radius: 14px; overflow: hidden; }
.menu-item { display: flex; align-items: center; padding: 14px 16px; border-bottom: 1px solid #F0F1F5; }
.mi-dot { width: 10px; height: 10px; border-radius: 50%; margin-right: 12px; flex-shrink: 0; }
.mi-dot.blue { background: #006FFD; }
.mi-dot.green { background: #00A86B; }
.mi-dot.orange { background: #E65100; }
.mi-dot.purple { background: #7C3AED; }
.mi-lbl { flex: 1; font-size: 14px; color: #1F2024; }
.mi-arr { color: #C5C6CC; font-size: 18px; }
.ver { text-align: center; padding: 24px 0; font-size: 11px; color: #C5C6CC; display: flex; flex-direction: column; gap: 4px; }
</style>
