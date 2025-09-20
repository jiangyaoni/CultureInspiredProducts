<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'UserForgotPassword',
})

const router = useRouter()

const passwordVisible = ref(false)
const confirmPasswordVisible = ref(false)
const countdown = ref(0)
const timer = ref(null)
const smsCode = ref('')

// 切换密码可见性
const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
}

// 切换确认密码可见性
const toggleConfirmPasswordVisibility = () => {
  confirmPasswordVisible.value = !confirmPasswordVisible.value
}

// 发送验证码
const sendSMSCode = () => {
  // 这里应添加实际发送验证码的API调用
  console.log('发送验证码到手机号')

  // 模拟倒计时
  countdown.value = 60
  timer.value = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(timer.value)
    }
  }, 1000)
}

// 组件卸载前清除定时器
onBeforeUnmount(() => {
  if (timer.value) clearInterval(timer.value)
})

const handleRegister = () => {
  // 验证码非空验证
  if (!smsCode.value.trim()) {
    alert('请输入验证码')
    return
  }

  console.log('执行重置密码操作')
  router.push('/login')
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1 class="login-title">重置密码</h1>
      </div>

      <div class="login-form">
        <div class="form-group">
          <div class="input-wrapper">
            <i class="fa fa-user"></i>
            <input type="text" placeholder="请输入手机号" />
          </div>
        </div>

        <!-- 新增验证码输入 -->
        <div class="form-group">
          <div class="input-wrapper code-wrapper">
            <i class="fa fa-commenting"></i>
            <input v-model="smsCode" type="text" placeholder="请输入验证码" maxlength="6" />
            <button class="send-code-btn" :disabled="countdown > 0" @click="sendSMSCode">
              {{ countdown > 0 ? `${countdown}s后重新获取` : '获取验证码' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <div class="input-wrapper password-wrapper">
            <i class="fa fa-lock"></i>
            <input :type="passwordVisible ? 'text' : 'password'" placeholder="请输入您的密码" />
            <i class="fa fa-eye" @click="togglePasswordVisibility"></i>
          </div>
        </div>

        <div class="form-group">
          <div class="input-wrapper password-wrapper">
            <i class="fa fa-lock"></i>
            <input
              :type="confirmPasswordVisible ? 'text' : 'password'"
              placeholder="请再次输入您的密码"
            />
            <i class="fa fa-eye" @click="toggleConfirmPasswordVisibility"></i>
          </div>
        </div>

        <div class="button-group">
          <button class="login-button" @click="handleRegister">确认重置</button>
        </div>

        <div class="other-login">
          <router-link to="/login" class="forgot-password">立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 新增验证码相关样式 */
.code-wrapper {
  padding-right: 8px;
}

.send-code-btn {
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-code-btn:disabled {
  background: #f8f8f8;
  color: #ccc;
  cursor: not-allowed;
}

.send-code-btn:not(:disabled):hover {
  background: #eee;
}

/* 调整原有样式 */
.input-wrapper {
  padding: 12px 15px;
}

.input-wrapper i {
  font-size: 14px;
}

.login-button {
  margin-top: 10px;
}

/* 全局样式 */
body {
  font-family: 'PingFang SC', 'Helvetica Neue', 'Arial', sans-serif;
}

.login-container {
  display: flex;
  justify-content: center;
  /* 调整顶部对齐，让容器上移 */
  align-items: flex-start;
  min-height: 100vh;
  padding: 20px;
  position: relative;
  overflow: hidden;
  /* 可添加顶部内边距进一步控制上移距离 */
  padding-top: 40px;
}

/* 添加半透明遮罩层 */
.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  z-index: -1; /* 置于内容下方 */
  opacity: 0.7; /* 设置透明度，数值越小越淡，范围 0 - 1 */
}

.login-box {
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.login-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  /* 增大 margin-bottom 的正值，使标题区域与下方内容距离变大 */
  margin-bottom: 40px;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 0px;
}

.form-group {
  margin-bottom: 20px;
}

.input-wrapper {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 12px 15px;
  display: flex;
  align-items: center;
  transition: border-color 0.3s ease;
}

.input-wrapper:hover {
  border-color: #ff4444;
}

.input-wrapper i {
  color: #999;
  margin-right: 10px;
  width: 16px;
  text-align: center;
}

.input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  font-family: 'PingFang SC', 'Helvetica Neue', 'Arial', sans-serif;
}

.input-wrapper input::placeholder {
  color: #aaa;
}

.password-wrapper i:last-child {
  cursor: pointer;
  transition: color 0.3s ease;
}

.password-wrapper i:last-child:hover {
  color: #ff4444;
}

.button-group {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
}

.login-button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'PingFang SC', 'Helvetica Neue', 'Arial', sans-serif;
  background-color: #ff4444;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 68, 68, 0.2);
}

.login-button:hover {
  background-color: #e63939;
  box-shadow: 0 6px 20px rgba(255, 68, 68, 0.3);
}

.other-login {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.forgot-password {
  color: #ff4444;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #e63939;
  text-decoration: underline;
}
</style>
