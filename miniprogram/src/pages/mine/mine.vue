<template>
<view class="page">
  <view class="profile-card">
    <view class="profile-left">
      <view class="avatar">{{ (user?.nickname || '?').charAt(0) }}</view>
      <view>
        <text class="p-name">{{ user?.nickname || '未登录' }}</text>
        <text class="p-role" @click="switchRole">角色：{{ user?.roleName || '' }} 点此切换</text>
      </view>
    </view>
  </view>

  <view class="menu-card">
    <view class="menu-item" @click="goNotif">
      <view class="mi-icon"><view class="mi-dot blue"></view></view>
      <text class="mi-lbl">通知消息</text>
      <text class="mi-arr">›</text>
    </view>
    <view class="menu-item" @click="goSelect">
      <view class="mi-icon"><view class="mi-dot green"></view></view>
      <text class="mi-lbl">选户操作</text>
      <text class="mi-arr">›</text>
    </view>
    <view class="menu-item" @click="goBatch">
      <view class="mi-icon"><view class="mi-dot orange"></view></view>
      <text class="mi-lbl">批量上报</text>
      <text class="mi-arr">›</text>
    </view>
    <view class="menu-item" @click="goSwitch('task-list')" style="border:none;">
      <view class="mi-icon"><view class="mi-dot purple"></view></view>
      <text class="mi-lbl">我的任务</text>
      <text class="mi-arr">›</text>
    </view>
  </view>

  <view class="version">
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
.page { padding: 0 16px 20px; background: #f5f6f8; min-height: 100vh; }

.profile-card { display: flex; justify-content: space-between; align-items: center; padding: 18px 16px; margin: 16px 0; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; }
.profile-left { display: flex; align-items: center; gap: 14px; }
.avatar { width: 48px; height: 48px; border-radius: 8px; background: #0D3B66; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; }
.p-name { font-size: 16px; font-weight: 600; color: #333; display: block; }
.p-role { font-size: 12px; color: #0D3B66; margin-top: 4px; display: inline-block; padding: 2px 8px; border: 1px dashed #0D3B66; border-radius: 4px; }

.menu-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
.menu-item { display: flex; align-items: center; padding: 14px 16px; border-bottom: 1px solid #f0f0f0; }
.menu-item:active { background: #f5f7fa; }
.mi-icon { width: 24px; flex-shrink: 0; display: flex; align-items: center; }
.mi-dot { width: 8px; height: 8px; border-radius: 50%; }
.mi-dot.blue { background: #0D3B66; }
.mi-dot.green { background: #2E7D32; }
.mi-dot.orange { background: #CC7B00; }
.mi-dot.purple { background: #7C3AED; }
.mi-lbl { flex: 1; font-size: 14px; color: #333; margin-left: 8px; }
.mi-arr { color: #ccc; font-size: 16px; }

.version { text-align: center; padding: 24px 0; display: flex; flex-direction: column; gap: 4px; }
.version text { font-size: 11px; color: #bbb; }
</style>
