<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'UserLogin',
})

const router = useRouter()

const activeTab = ref('account')
const autoLogin = ref(false)
const passwordVisible = ref(false)
const phoneNumber = ref('')
const smsCode = ref('')
const countdown = ref(0)
let timer = null

// 二维码相关状态
const showQRCode = ref(false)
const qrCodeType = ref('wechat') // 'wechat' 或 'qq'
const qrCodeImage = ref('')
const isLoadingQRCode = ref(false)
const qrCodeError = ref(false)

// 模拟从后端获取二维码（实际项目中替换为真实API调用）
const fetchQRCode = async (type) => {
  try {
    isLoadingQRCode.value = true
    qrCodeError.value = false

    // 模拟API延迟
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 实际项目中这里应该是调用后端API获取二维码
    // 例如: const response = await api.getQRCode({ type })
    // qrCodeImage.value = response.data.qrCodeUrl

    // 这里使用本地生成的base64二维码作为示例
    if (type === 'wechat') {
      qrCodeImage.value = generateLocalQRCode('wechat-login-example')
    } else {
      qrCodeImage.value = generateLocalQRCode('qq-login-example')
    }
  } catch (error) {
    console.error('获取二维码失败:', error)
    qrCodeError.value = true
    qrCodeImage.value = ''
  } finally {
    isLoadingQRCode.value = false
  }
}

// 本地生成简单的二维码（实际项目中应该使用后端生成）
const generateLocalQRCode = (text) => {
  // 创建一个简单的canvas二维码生成器
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const size = 200
  canvas.width = size
  canvas.height = size

  // 简单的二维码样式
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = '#000000'

  // 绘制简单的定位图案
  ctx.fillRect(10, 10, 20, 20)
  ctx.fillRect(size - 30, 10, 20, 20)
  ctx.fillRect(10, size - 30, 20, 20)

  // 绘制二维码内容（简化版）
  ctx.font = '14px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(text, size / 2, size / 2)

  // 返回data URL
  return canvas.toDataURL('image/png')
}

// 打开二维码弹窗
const openQRCode = async (type) => {
  qrCodeType.value = type
  await fetchQRCode(type)

  if (!qrCodeError.value) {
    showQRCode.value = true

    // 模拟轮询检查登录状态
    const checkLoginStatus = setInterval(() => {
      // 实际项目中这里应该调用API检查用户是否已扫码登录
      const isLoggedIn = false // 模拟未登录
      if (isLoggedIn) {
        clearInterval(checkLoginStatus)
        showQRCode.value = false
        // 登录成功后的处理逻辑
      }
    }, 2000)

    // 关闭弹窗时清除定时器
    const cleanup = () => {
      clearInterval(checkLoginStatus)
      document.removeEventListener('keydown', escapeListener)
    }

    // 按ESC键关闭弹窗
    const escapeListener = (e) => {
      if (e.key === 'Escape') {
        cleanup()
        showQRCode.value = false
      }
    }

    document.addEventListener('keydown', escapeListener)
  }
}

// 处理图片加载错误
const handleImageError = () => {
  qrCodeError.value = true
  qrCodeImage.value = ''
}

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
}

const sendSMSCode = () => {
  if (!validatePhone(phoneNumber.value)) {
    alert('请输入有效的手机号码')
    return
  }

  countdown.value = 60
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

const validatePhone = (phone) => {
  return /^1[3-9]\d{9}$/.test(phone)
}

const handleLogin = () => {
  if (activeTab.value === 'account') {
    // 处理账号登录逻辑
  } else {
    // 处理短信登录逻辑
  }
}

const goToRegister = () => {
  router.push('/login/register')
}

const goToForgotPassword = () => {
  router.push('/login/forgotPassword')
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1 class="login-title">欢迎登录</h1>
      </div>

      <div class="login-tabs">
        <span
          class="tab-item"
          :class="{ active: activeTab === 'account' }"
          @click="activeTab = 'account'"
        >
          账号登录
        </span>
        <span class="tab-item" :class="{ active: activeTab === 'sms' }" @click="activeTab = 'sms'">
          短信登录
        </span>
      </div>

      <div class="login-form">
        <!-- 账号登录表单 -->
        <div v-show="activeTab === 'account'" class="form-content">
          <div class="form-group">
            <div class="input-wrapper">
              <i class="fa fa-user"></i>
              <input type="text" placeholder="请输入账号" />
            </div>
          </div>

          <div class="form-group">
            <div class="input-wrapper password-wrapper">
              <i class="fa fa-lock"></i>
              <input :type="passwordVisible ? 'text' : 'password'" placeholder="请输入您的密码" />
              <i
                class="fa"
                :class="passwordVisible ? 'fa-eye-slash' : 'fa-eye'"
                @click="togglePasswordVisibility"
              ></i>
            </div>
          </div>
        </div>

        <!-- 短信登录表单 -->
        <div v-show="activeTab === 'sms'" class="form-content">
          <div class="form-group">
            <div class="input-wrapper">
              <i class="fa fa-mobile-phone"></i>
              <input type="tel" v-model="phoneNumber" placeholder="请输入手机号码" maxlength="11" />
            </div>
          </div>

          <div class="form-group">
            <div class="input-wrapper sms-wrapper">
              <i class="fa fa-commenting"></i>
              <input type="text" v-model="smsCode" placeholder="请输入验证码" maxlength="6" />
              <button class="sms-button" :disabled="countdown > 0" @click="sendSMSCode">
                {{ countdown > 0 ? `${countdown}s后重新获取` : '获取验证码' }}
              </button>
            </div>
          </div>
        </div>

        <div class="form-extra">
          <div class="remember-me">
            <div class="switch">
              <input type="checkbox" id="autoLogin" v-model="autoLogin" />
              <label for="autoLogin"></label>
            </div>
            <span>下次自动登录</span>
            <a href="#" class="forgot-password" @click.prevent="goToForgotPassword">忘记密码？</a>
          </div>
        </div>

        <button class="login-button" @click="handleLogin">立即登录</button>

        <div class="register-tip">
          还没有账号？<a href="#" class="register-link" @click.prevent="goToRegister">立即注册</a>
        </div>

        <div class="other-login">
          <div class="divider">
            <span>其他登录方式</span>
          </div>
          <div class="icon-group">
            <!-- 微信登录按钮 -->
            <button class="social-icon wechat" @click="openQRCode('wechat')">
              <i class="fab fa-weixin"></i>
            </button>
            <!-- QQ登录按钮 -->
            <button class="social-icon qq" @click="openQRCode('qq')">
              <i class="fab fa-qq"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 二维码弹窗 -->
    <div v-if="showQRCode" class="qrcode-modal">
      <div class="qrcode-content">
        <div class="qrcode-header">
          <h3>{{ qrCodeType === 'wechat' ? '微信登录' : 'QQ登录' }}</h3>
          <button class="close-btn" @click="showQRCode = false">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="qrcode-body">
          <div v-if="isLoadingQRCode" class="qrcode-loading">
            <div class="loading-spinner"></div>
            <p>正在生成二维码...</p>
          </div>
          <div v-else-if="qrCodeError" class="qrcode-error">
            <i class="fa fa-exclamation-circle"></i>
            <p>二维码生成失败</p>
            <button class="retry-btn" @click="fetchQRCode(qrCodeType)">重试</button>
          </div>
          <template v-else>
            <img
              :src="qrCodeImage"
              :alt="qrCodeType === 'wechat' ? '微信二维码' : 'QQ二维码'"
              @error="handleImageError"
            />
            <p class="qrcode-tip">
              请使用{{ qrCodeType === 'wechat' ? '微信' : 'QQ' }}扫描二维码登录
            </p>
            <p class="qrcode-refresh">
              二维码已过期？<a href="#" @click.prevent="fetchQRCode(qrCodeType)">点击刷新</a>
            </p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 原有样式保持不变 */
:root {
  --primary-color: #ff4444;
  --hover-color: #e63939;
  --text-color: #333;
  --secondary-text: #666;
  --border-color: #ddd;
  --background: #f8f8f8;
}

body {
  background-color: var(--background);
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
  position: relative;
}

.login-box {
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 20px;
  width: 100%;
  max-width: 420px;
  transition: all 0.3s ease;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-color);
  letter-spacing: 1px;
}

.login-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #f5f5f5;
}

.tab-item {
  padding: 12px 25px;
  cursor: pointer;
  font-size: 16px;
  color: var(--secondary-text);
  position: relative;
  transition: all 0.3s ease;
}

.tab-item.active {
  color: rgb(249, 4, 4);
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background-color: rgb(248, 3, 3);
  border-radius: 2px;
}

.form-group {
  margin-bottom: 20px;
}

.input-wrapper {
  position: relative;
  border: 1px solid black;
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  width: 80%;
  margin: 0 auto;
}

.sms-wrapper {
  padding-right: 12px;
}

.input-wrapper:hover {
  border-color: #000;
}

.input-wrapper:focus-within {
  border-color: #000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  color: #000;
  font-family: inherit;
}

.input-wrapper i {
  color: #999;
  margin-right: 8px;
  width: 12px;
  text-align: center;
}

.input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: var(--text-color);
  font-family: inherit;
}

.input-wrapper input::placeholder {
  color: #bbb;
}

.sms-wrapper {
  padding-right: 8px;
}

.sms-button {
  background: #f8f8f8;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  color: var(--primary-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.sms-button:disabled {
  color: #999;
  cursor: not-allowed;
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  margin-right: 8px;
  margin-left: 25px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #eee;
  transition: 0.4s;
  border-radius: 34px;
}

.switch label:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.switch input:checked + label {
  background-color: rgb(251, 61, 61);
}

.switch input:checked + label:before {
  transform: translateX(18px);
}

.login-button {
  margin-left: 7%;
  width: 86%;
  padding: 14px;
  background-color: #fc4848;
  color: rgb(10, 10, 10);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.login-button:hover {
  background-color: #f13c3c;
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(246, 48, 48, 0.3);
}

.other-login {
  margin-top: 30px;
  text-align: center;
}

.divider {
  position: relative;
  margin: 20px 0;
  color: #999;
  font-size: 14px;
}

.divider span {
  background: white;
  padding: 0 12px;
  position: relative;
  z-index: 1;
}

.divider::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: #f0f0f0;
  transform: translateY(-50%);
}

.icon-group {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.social-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.social-icon i {
  font-size: 20px;
  color: white;
}

.wechat {
  background: #07c160;
}

.qq {
  background: #12b7f5;
}

.social-icon:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.register-tip {
  text-align: center;
  margin-top: 20px;
  color: var(--secondary-text);
  font-size: 14px;
}

.register-link {
  color: #ff4444;
  text-decoration: none;
  margin-left: 5px;
}

.register-link:hover {
  text-decoration: underline;
}

.form-extra {
  margin-bottom: 20px;
}

.remember-me {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.remember-me .forgot-password {
  color: #ff4444;
  text-decoration: none;
  margin-left: auto;
  transform: translateX(-25px);
}

.remember-me .forgot-password:hover {
  text-decoration: underline;
}

/* 二维码弹窗样式 */
.qrcode-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.qrcode-content {
  background: white;
  border-radius: 12px;
  width: 320px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

.qrcode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #eee;
}

.qrcode-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text-color);
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: #f0f0f0;
  color: #666;
}

.qrcode-body {
  padding: 30px 20px;
  text-align: center;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.qrcode-body img {
  width: 200px;
  height: 200px;
  margin-bottom: 20px;
  border: 1px solid #f0f0f0;
  padding: 10px;
  background: white;
}

.qrcode-tip {
  font-size: 14px;
  color: var(--secondary-text);
  margin-bottom: 15px;
}

.qrcode-refresh {
  font-size: 13px;
  color: #999;
}

.qrcode-refresh a {
  color: var(--primary-color);
  text-decoration: none;
}

.qrcode-refresh a:hover {
  text-decoration: underline;
}

/* 加载状态 */
.qrcode-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}

.qrcode-loading p {
  color: var(--secondary-text);
  font-size: 14px;
}

/* 错误状态 */
.qrcode-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.qrcode-error i {
  font-size: 40px;
  color: #ff4444;
  margin-bottom: 15px;
}

.qrcode-error p {
  color: var(--secondary-text);
  font-size: 14px;
  margin-bottom: 15px;
}

.retry-btn {
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background-color: var(--hover-color);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<style scoped lang="scss">
.forgot-password {
  color: #666;
  text-decoration: none;
  transition: color 0.3s ease;
  display: inline-block;
  transform: translateX(-25px);
}

.forgot-password:hover {
  text-decoration: underline;
}
</style>
