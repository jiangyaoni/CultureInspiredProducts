<script setup>
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, EditOutlined } from '@ant-design/icons-vue'

const isEditing = ref(false)
const saving = ref(false)

const userInfo = reactive({
  avatar: 'https://example.com/default-avatar.jpg',
  nickname: '用户昵称',
  birthday: '1990-01-01',
  phone: '13800138000',
  email: 'user@example.com',
  signature: '这个人很懒，什么都没留下~',
})

const tempUserInfo = reactive({ ...userInfo })

const fieldLabels = {
  nickname: '昵称',
  birthday: '生日',
  phone: '手机号',
  email: '邮箱',
  signature: '个性签名',
}

// 计算是否已修改
const hasChanges = computed(() => {
  return Object.keys(userInfo).some((key) => userInfo[key] !== tempUserInfo[key])
})

const toggleEdit = () => {
  if (!isEditing.value) {
    Object.assign(tempUserInfo, userInfo)
  }
  isEditing.value = !isEditing.value
}

const cancelEdit = () => {
  isEditing.value = false
  Object.assign(tempUserInfo, userInfo)
}

const handleSave = async () => {
  try {
    saving.value = true
    await new Promise((resolve) => setTimeout(resolve, 500))
    Object.assign(userInfo, tempUserInfo)
    message.success('信息保存成功')
    isEditing.value = false
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    message.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const getInputType = (key) => {
  if (key === 'birthday') return 'date'
  if (key === 'phone') return 'tel'
  if (key === 'email') return 'email'
  return 'text'
}

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件!')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过2MB!')
    return false
  }
  return true
}

const handleAvatarChange = (info) => {
  if (info.file.status === 'done') {
    tempUserInfo.avatar = info.file.response.url
  } else if (info.file.status === 'error') {
    message.error('上传失败，请重试')
  }
}
</script>

<template>
  <section class="profile-section">
    <a-form layout="vertical" class="profile-form">
      <a-row :gutter="24">
        <!-- 左侧表单 -->
        <a-col :xs="24" :md="16">
          <a-form-item
            v-for="(value, key) in userInfo"
            :key="key"
            :label="fieldLabels[key]"
            v-show="key !== 'avatar'"
          >
            <a-input
              v-model:value="tempUserInfo[key]"
              :disabled="!isEditing"
              :type="getInputType(key)"
              :placeholder="`请输入${fieldLabels[key]}`"
              class="form-input"
              :maxlength="key === 'signature' ? 50 : key === 'nickname' ? 20 : null"
              show-count
            />
          </a-form-item>
        </a-col>

        <!-- 右侧头像 -->
        <a-col :xs="24" :md="8">
          <a-form-item label="头像" class="avatar-section">
            <div class="avatar-upload-wrapper">
              <a-upload
                name="avatar"
                list-type="picture-card"
                class="avatar-uploader"
                :show-upload-list="false"
                :before-upload="beforeAvatarUpload"
                @change="handleAvatarChange"
                action="/api/upload-avatar"
                :disabled="!isEditing"
              >
                <div class="avatar-upload-content">
                  <template v-if="tempUserInfo.avatar">
                    <img :src="tempUserInfo.avatar" alt="avatar" class="user-avatar" />
                    <div class="avatar-upload-mask" v-if="isEditing">
                      <PlusOutlined class="upload-icon" />
                      <span>更换头像</span>
                    </div>
                  </template>
                  <template v-else>
                    <PlusOutlined class="upload-icon" />
                    <span class="upload-text">点击上传头像</span>
                  </template>
                </div>
              </a-upload>
              <p class="avatar-tip" v-if="isEditing">
                建议尺寸 200x200px, 支持 JPG/PNG 格式, 大小不超过2MB
              </p>
            </div>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- 操作按钮 -->
      <a-form-item class="action-bar">
        <a-space>
          <a-button
            v-if="isEditing"
            type="primary"
            size="large"
            @click="handleSave"
            :loading="saving"
            :disabled="!hasChanges"
          >
            保存修改
          </a-button>
          <a-button v-else type="dashed" size="large" @click="toggleEdit">
            <EditOutlined /> 修改信息
          </a-button>
          <a-button v-if="isEditing" size="large" @click="cancelEdit" :disabled="saving">
            取消
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </section>
</template>

<style scoped>
.profile-section {
  max-width: 800px;
  margin: 0 auto;
}

.profile-form {
  max-width: 100%;
}

.form-input {
  max-width: 400px;
}

.avatar-section {
  margin-top: 40px;
}

.avatar-upload-wrapper {
  width: 100%;
  max-width: 200px;
  margin: 0 auto;
}

.avatar-uploader :deep(.ant-upload) {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  border: 2px dashed #d9d9d9;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.3s;
  overflow: hidden;
  position: relative;
  padding: 0;
  margin: 0;
}

.avatar-uploader :deep(.ant-upload:hover) {
  border-color: #1890ff;
}

.avatar-upload-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  transition: all 0.3s;
}

.avatar-upload-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: all 0.3s;
  border-radius: 6px;
  color: white;
}

.avatar-upload-mask:hover {
  opacity: 1;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 8px;
  color: white;
}

.upload-text {
  color: #666;
  font-size: 14px;
  text-align: center;
}

.avatar-tip {
  margin-top: 12px;
  color: #999;
  font-size: 12px;
  text-align: center;
  line-height: 1.5;
}

.action-bar {
  margin-top: 24px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .profile-form {
    padding: 0 16px;
  }

  .form-input {
    max-width: 100%;
  }

  .avatar-section {
    margin-top: 20px;
  }
}
</style>
