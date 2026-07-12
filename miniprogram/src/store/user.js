import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref('')
  const isLoggedIn = computed(() => !!token.value)

  function setLogin(userInfo, authToken) {
    user.value = userInfo
    token.value = authToken
    uni.setStorageSync('token', authToken)
    uni.setStorageSync('user', JSON.stringify(userInfo))
  }

  function initFromStorage() {
    const savedToken = uni.getStorageSync('token')
    const savedUser = uni.getStorageSync('user')
    if (savedToken) token.value = savedToken
    if (savedUser) {
      user.value = JSON.parse(savedUser)
    } else {
      // Mock 模式下默认给一个角色，避免权限门禁全拦住
      const mockDefault = { id: 'u_001', nickname: '张查验', role: 'inspector', roleName: '查验员' }
      user.value = mockDefault
      uni.setStorageSync('user', JSON.stringify(mockDefault))
    }
  }

  function logout() {
    user.value = null
    token.value = ''
    uni.removeStorageSync('token')
    uni.removeStorageSync('user')
  }

  return { user, token, isLoggedIn, setLogin, initFromStorage, logout }
})
