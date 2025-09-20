<template>
  <div class="heritage-info-container">
    <!-- 返回按钮 -->
    <button @click="goBack" class="back-button" aria-label="返回">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
      <span>返回</span>
    </button>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载非遗信息...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <h3>加载出错</h3>
      <p class="error-message">{{ error.message }}</p>
      <button @click="retry" class="retry-button">重新加载</button>
    </div>

    <!-- 正常内容 -->
    <div v-else-if="heritageItem.name" class="heritage-content">
      <header class="heritage-header">
        <h1 class="heritage-title">{{ heritageItem.name }}</h1>
        <div class="meta-group">
          <div class="meta-tags">
            <span class="meta-tag">{{ heritageItem.category }}</span>
            <span class="meta-tag">{{ heritageItem.region }}</span>
            <span class="meta-tag">{{ heritageItem.year }}</span>
          </div>
          <div class="protector-info">
            <h3 class="info-label">保护单位</h3>
            <p class="info-content">{{ heritageItem.protector }}</p>
          </div>
        </div>
      </header>

      <div class="content-layout">
        <article class="text-content">
          <section class="info-section">
            <h3 class="section-title">项目内容</h3>
            <div
              class="formatted-content"
              v-html="formattedContent"
              :class="{ 'content-empty': !heritageItem.content }"
            ></div>
          </section>
        </article>

        <aside class="media-container">
          <div class="image-wrapper">
            <img
              :src="imagePath"
              :alt="heritageItem.name"
              class="heritage-image"
              @error="handleImageError"
            />
            <button @click="toggleFavorite" class="favorite-button">
              {{ isFavorite ? '取消收藏' : '收藏' }}
            </button>
            <button @click="handleShare" class="share-button">分享</button>
          </div>
        </aside>
      </div>

      <!-- 评论区 -->
      <div class="comment-section">
        <h3 class="comment-title">评论区</h3>
        <div class="comment-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <p class="comment-author">{{ comment.author }}</p>
              <div class="comment-meta">
                <span class="comment-time">{{ formattedTime(comment.time) }}</span>
                <button
                  @click="toggleLike(comment.id)"
                  class="like-button"
                  :class="{ liked: comment.isLiked }"
                  aria-label="点赞"
                >
                  <span class="like-icon">{{ comment.isLiked ? '❤️' : '♡' }}</span>
                  <span class="like-count">{{ comment.likes }}</span>
                </button>
              </div>
            </div>
            <p class="comment-content">{{ comment.content }}</p>
          </div>
        </div>
        <div class="comment-input">
          <textarea
            v-model="newComment"
            placeholder="请输入评论内容"
            class="comment-textarea"
            @keydown.ctrl.enter="submitComment"
          ></textarea>
          <button @click="submitComment" class="comment-submit">提交评论 (Ctrl+Enter)</button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <h2>未找到对应的非遗信息</h2>
      <p>请检查ID是否正确或返回列表重新选择</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import heritageData from '@/assets/非遗数据.json'

const route = useRoute()
const router = useRouter()
const store = useStore()
const heritageItem = ref({})
const isLoading = ref(false)
const error = ref()
const comments = ref([])
const newComment = ref('')

// 获取与当前非遗项目关联的存储键
const getStorageKey = () => {
  return `heritage-comments-${route.params.id}`
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 计算属性
const formattedContent = computed(() => {
  return heritageItem.value.content?.replace(/\n/g, '<br>') || '暂无详细内容'
})

const imagePath = computed(() => {
  return `/src/assets/cultural_imgs/${heritageItem.value.name}.jpg?t=${Date.now()}`
})

// 时间格式化
const formattedTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 数据加载方法
const loadData = async () => {
  try {
    isLoading.value = true
    error.value = null

    const heritageId = Number(route.params.id)
    if (isNaN(heritageId)) throw new Error('无效的非遗ID格式')

    const foundItem = heritageData.find((item) => item.id === heritageId)
    if (!foundItem) throw new Error('未找到对应的非遗信息')

    heritageItem.value = foundItem
    loadFavoriteStatus()
    loadCommentsFromLocalStorage()
  } catch (err) {
    error.value = err
    heritageItem.value = {}
  } finally {
    isLoading.value = false
    nextTick(() => {
      // 确保页面加载完成后滚动到指定位置
      window.scrollTo({ top: 15, behavior: 'smooth' })
    })
  }
}

// 本地存储操作
const saveCommentsToLocalStorage = () => {
  localStorage.setItem(getStorageKey(), JSON.stringify(comments.value))
}

const loadCommentsFromLocalStorage = () => {
  const savedComments = localStorage.getItem(getStorageKey())
  if (savedComments) {
    comments.value = JSON.parse(savedComments)
  } else {
    // 如果没有保存的评论，使用空数组而不是默认评论
    comments.value = []
  }
}

// 收藏功能
// 计算是否已收藏
const isFavorite = computed(() => {
  return store.state.favorites.some((item) => item.id === heritageItem.value.id)
})

// 切换收藏状态
const toggleFavorite = () => {
  if (isFavorite.value) {
    store.commit('removeFavorite', heritageItem.value.id)
  } else {
    // 添加完整非遗信息到收藏
    store.commit('addFavorite', {
      ...heritageItem.value,
      type: 'intangible', // 标记为非遗类型
      image: `/src/assets/cultural_imgs/${heritageItem.value.name}.jpg`, // 添加图片路径
    })
  }
}

const loadFavoriteStatus = () => {
  if (!heritageItem.value || !heritageItem.value.id) {
    return false
  }
  return store.state.favorites.some((item) => item.id === heritageItem.value.id)
}

// 分享功能
const handleShare = async () => {
  const shareData = {
    title: heritageItem.value.name,
    text: `探索非遗文化：${heritageItem.value.name}`,
    url: window.location.href,
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(shareData.url)
      alert('链接已复制到剪贴板')
    }
  } catch (error) {
    console.error('分享失败:', error)
    alert('分享失败，请稍后重试')
  }
}

// 评论功能
const toggleLike = (commentId) => {
  const comment = comments.value.find((c) => c.id === commentId)
  if (comment) {
    comment.isLiked = !comment.isLiked
    comment.likes += comment.isLiked ? 1 : -1
    saveCommentsToLocalStorage()
  }
}

const submitComment = () => {
  if (newComment.value.trim()) {
    const newCommentObj = {
      id: Date.now(),
      author: '匿名用户',
      content: newComment.value.trim(),
      time: Date.now(),
      likes: 0,
      isLiked: false,
    }
    comments.value.unshift(newCommentObj)
    newComment.value = ''
    saveCommentsToLocalStorage()
  }
}

// 生命周期
onMounted(loadData)
watch(() => route.params.id, loadData)
</script>

<style scoped>
/* 基础容器样式 */
.heritage-info-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 2rem 2rem 2rem; /* 增加右侧内边距 */
  background: linear-gradient(145deg, #f9f5f0 0%, #f0e6d9 100%);
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', '微软雅黑', system-ui;
  min-height: 80vh;
  position: relative;
}

/* 返回按钮样式 - 右上角定位 */
.back-button {
  position: absolute;
  top: 2rem;
  right: 2rem; /* 改为右对齐 */
  left: auto; /* 清除左对齐 */
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.7);
  color: #8b5a2b;
  border: 1px solid #d4c4b5;
  padding: 0.6rem 1rem 0.6rem 0.8rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  font-size: 0.95rem;
}

.back-button:hover {
  background: #8b5a2b;
  color: white;
  transform: translateX(-3px);
}

.back-button svg {
  width: 18px;
  height: 18px;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #8b5a2b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #8b5a2b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 235, 235, 0.8);
  border-radius: 12px;
  color: #dc3545;
}

.error-message {
  margin: 1rem 0;
  font-size: 1.1rem;
}

.retry-button {
  background: #8b5a2b;
  color: white;
  padding: 0.6rem 1.5rem;
  border-radius: 25px;
  border: none;
  cursor: pointer;
  transition: opacity 0.3s;
}

/* 内容为空状态 */
.content-empty::before {
  content: '暂无详细内容';
  color: #999;
  font-style: italic;
}

/* 头部样式 */
.heritage-header {
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #d4c4b5;
}

.heritage-title {
  font:
    2.8rem '华文行楷',
    cursive;
  color: #2c3e50;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  margin: 0 1.5rem 0;
}

/* 元信息布局 */
.meta-group {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-top: 1.5rem;
}

.meta-tags {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-tag {
  background: linear-gradient(45deg, #e0d0c1, #d4c4b5);
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  font: 500 0.95rem/1 'Segoe UI';
  color: #5d4a37;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 保护单位信息 */
.protector-info {
  min-width: 200px;
  text-align: right;
}

.info-label {
  color: #666;
  font-size: 1.1rem;
  margin: 0 0 0.5rem;
}

.info-content {
  color: #8b5a2b;
  font-weight: 500;
  margin: 0;
}

/* 内容布局 */
.content-layout {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 3rem;
  margin-top: 2rem;
}

.text-content {
  background: rgba(255, 255, 255, 0.7);
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #d4c4b5;
}

.section-title {
  color: #8b5a2b;
  font: 600 1.3rem/1 'Segoe UI';
  margin-bottom: 1rem;
  padding-left: 0.8rem;
  border-left: 3px solid currentColor;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.formatted-content {
  line-height: 1.8;
  color: #4a4a4a;
  min-height: 200px;
}

/* 图片容器 */
.media-container {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.image-wrapper {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  background: white;
  padding: 8px;
}

.heritage-image {
  width: 100%;
  height: 60vh;
  object-fit: cover;
  border-radius: 8px;
}

/* 按钮样式 */
.favorite-button,
.share-button {
  width: 100%;
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.favorite-button {
  background-color: #8b5a2b;
  color: white;
}

.share-button {
  background-color: #007bff;
  color: white;
}

/* 评论区样式 */
.comment-section {
  margin-top: 2rem;
}

.comment-title {
  color: #8b5a2b;
  font: 600 1.3rem/1 'Segoe UI';
  margin-bottom: 1rem;
  padding-left: 0.8rem;
  border-left: 3px solid currentColor;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.comment-list {
  margin-bottom: 1rem;
}

.comment-item {
  background: rgba(255, 255, 255, 0.7);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: transform 0.2s;
}

.comment-item:hover {
  transform: translateX(4px);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.comment-author {
  font-weight: bold;
  margin: 0;
}

.comment-time {
  font-size: 0.9rem;
  color: #999;
}

.comment-content {
  color: #4a4a4a;
  margin: 0.5rem 0;
}

.comment-input {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-textarea {
  padding: 0.8rem;
  border: 1px solid #d4c4b5;
  border-radius: 8px;
  resize: vertical;
  min-height: 100px;
}

.comment-submit {
  width: 100%;
  padding: 0.8rem 1.5rem;
  background-color: #8b5a2b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

/* 点赞按钮样式 */
.like-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #666;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.like-button:hover {
  background-color: #f8f9fa;
  color: #ff4757;
}

.like-button.liked {
  color: #ff4757;
  font-weight: bold;
}

.like-icon {
  font-size: 1.2em;
  transition: transform 0.2s;
}

.like-button:hover .like-icon {
  transform: scale(1.2);
}

.like-count {
  font-size: 0.9em;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .media-container {
    position: static;
  }

  .heritage-title {
    font-size: 2.2rem;
  }

  .meta-group {
    flex-direction: column;
    gap: 1rem;
  }

  .protector-info {
    text-align: left;
    width: 100%;
  }

  .heritage-image {
    height: 50vh;
  }

  .favorite-button,
  .share-button {
    font-size: 0.9rem;
    padding: 0.6rem 1.2rem;
  }

  .back-button {
    position: static;
    margin-bottom: 1rem;
    width: fit-content;
  }
}
</style>
