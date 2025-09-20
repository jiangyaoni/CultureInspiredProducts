<template>
  <div class="product-detail-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <button class="back-button" @click="goBack"><i class="fas fa-arrow-left"></i> 返回</button>
      您当前位置：
      <router-link to="/" class="breadcrumb-link">首页</router-link>
      <span class="breadcrumb-separator">></span>
      <router-link to="/cultural" class="breadcrumb-link">文创商城</router-link>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-current">{{ product.name || '商品详情' }}</span>
    </div>

    <!-- 商品信息 -->
    <template v-if="product.name">
      <div class="product-content">
        <div class="image-container">
          <img :src="product.image" :alt="product.name" class="product-detail-image" />
        </div>
        <div class="product-info">
          <h1 class="product-name">{{ product.name }}</h1>
          <div class="product-price-section">
            <p class="product-detail-price">
              ¥{{ product.price.toFixed(2) }}
              <span class="product-original-price"
                >原价：¥{{ product.originalPrice.toFixed(2) }}</span
              >
            </p>
            <span class="product-sales">销量：{{ product.sales || 0 }}</span>
          </div>
          <p class="product-detail-description">{{ product.merchant }}</p>
          <p class="product-detail-description">{{ product.delivery }}</p>

          <!-- 操作按钮 -->
          <div class="product-actions">
            <button class="add-to-cart" @click="addToCart">
              <i class="fas fa-shopping-cart"></i> 加入购物车
            </button>
            <button class="buy-now" @click="buyNow"><i class="fas fa-bolt"></i> 立即购买</button>
            <button class="favorite" @click="addToFavorites">
              <i class="fas fa-heart" :class="{ favorited: isFavorited }"></i>
              {{ isFavorited ? '已收藏' : '收藏' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 商品详情和评论选项卡 -->
      <div class="product-tabs">
        <div class="tabs-header">
          <button
            class="tab-button"
            :class="{ active: activeTab === 'details' }"
            @click="activeTab = 'details'"
          >
            商品详情
          </button>
          <button
            class="tab-button"
            :class="{ active: activeTab === 'comments' }"
            @click="activeTab = 'comments'"
          >
            用户评论 ({{ comments.length }})
          </button>
        </div>

        <!-- 商品详情内容 -->
        <div class="tab-content" v-show="activeTab === 'details'">
          <div class="product-description">
            <h2>商品详情</h2>
            <p>{{ product.description || '暂无详细描述' }}</p>
            <!-- 这里可以添加更多商品详情内容 -->
          </div>
        </div>

        <!-- 评论内容 -->
        <div class="tab-content" v-show="activeTab === 'comments'">
          <div class="comments-section">
            <h2>用户评论</h2>

            <!-- 评论表单 -->
            <div class="comment-form">
              <h3>发表评论</h3>
              <div class="rating-input">
                <span>评分：</span>
                <div class="stars">
                  <i
                    v-for="star in 5"
                    :key="star"
                    class="fas fa-star"
                    :class="{ rated: star <= newComment.rating }"
                    @click="setRating(star)"
                  ></i>
                </div>
              </div>
              <textarea
                v-model="newComment.content"
                placeholder="分享您的使用体验..."
                class="comment-textarea"
              ></textarea>
              <button class="submit-comment" @click="submitComment">提交评论</button>
            </div>

            <!-- 评论列表 -->
            <div class="comment-list">
              <div v-if="comments.length === 0" class="no-comments">
                暂无评论，快来发表第一条评论吧！
              </div>

              <div v-for="(comment, index) in comments" :key="index" class="comment-item">
                <div class="comment-header">
                  <div class="comment-user">
                    <i class="fas fa-user-circle"></i>
                    <span>{{ comment.username || '匿名用户' }}</span>
                  </div>
                  <div class="comment-rating">
                    <i
                      v-for="star in 5"
                      :key="star"
                      class="fas fa-star"
                      :class="{ rated: star <= comment.rating }"
                    ></i>
                  </div>
                  <div class="comment-date">{{ formatDate(comment.date) }}</div>
                </div>
                <div class="comment-content">{{ comment.content }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <p v-else class="loading-message">商品信息加载中...</p>

    <!-- 成功提示弹窗 -->
    <div v-if="showSuccessModal" class="success-modal">
      <div class="modal-content">
        <div class="modal-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <p>成功加入购物车</p>
        <div class="modal-actions">
          <button class="modal-button primary" @click="goToCart">前往购物车</button>
          <button class="modal-button secondary" @click="showSuccessModal = false">继续购物</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import productData from '@/assets/商品信息.json'

const route = useRoute()
const router = useRouter()
const store = useStore()
const product = ref({})
const showSuccessModal = ref(false)
const activeTab = ref('details')

// 获取与当前商品关联的存储键
const getStorageKey = () => {
  return `product-comments-${route.params.id}`
}

// 评论相关数据
const comments = ref([])
const newComment = ref({
  rating: 0,
  content: '',
})

// 加载评论
const loadComments = () => {
  const savedComments = localStorage.getItem(getStorageKey())
  if (savedComments) {
    comments.value = JSON.parse(savedComments)
  } else {
    // 如果没有保存的评论，使用空数组而不是默认评论
    comments.value = []
  }
}

// 保存评论
const saveComments = () => {
  localStorage.setItem(getStorageKey(), JSON.stringify(comments.value))
}

// 模拟加入购物车方法
const addToCart = () => {
  if (product.value.id) {
    // 调用Vuex的addToCart mutation
    store.commit('addToCart', {
      id: product.value.id,
      name: product.value.name,
      price: product.value.price,
      image: product.value.image,
    })

    showSuccessModal.value = true
  }
}

// 模拟立即购买方法
const buyNow = () => {
  if (product.value.id) {
    router.push(`/cultural/${product.value.id}/purchase`)
  }
}

// 计算是否已收藏
const isFavorited = computed(() => {
  return store.state.favorites.some((item) => item.id === product.value.id)
})

// 添加/移除收藏
const addToFavorites = () => {
  if (!product.value.id) return

  if (isFavorited.value) {
    store.commit('removeFavorite', product.value.id)
  } else {
    // 添加文创商品信息到收藏
    store.commit('addFavorite', {
      ...product.value,
      type: 'cultural', // 标记为文创类型
      category: '文创商品', // 添加类别信息
    })
  }
}

// 跳转到购物车页面
const goToCart = () => {
  showSuccessModal.value = false
  router.push('/shopping')
}

// 返回上一个页面
const goBack = () => {
  router.go(-1)
}

// 设置评分
const setRating = (star) => {
  newComment.value.rating = star
}

// 提交评论
const submitComment = () => {
  if (!newComment.value.rating) {
    alert('请给商品评分')
    return
  }

  if (!newComment.value.content.trim()) {
    alert('请输入评论内容')
    return
  }

  comments.value.unshift({
    username: '当前用户',
    rating: newComment.value.rating,
    content: newComment.value.content,
    date: new Date(),
  })

  // 保存到本地存储
  saveComments()

  // 重置表单
  newComment.value = {
    rating: 0,
    content: '',
  }
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

onMounted(() => {
  const productId = parseInt(route.params.id)

  const processedProducts = productData.map((item, index) => {
    const sanitizedName = item.名字.replace(/[\\/*?:"<>|]/g, '').toLowerCase()
    const imageName = `${sanitizedName}1.jpg`
    const imagePath = `/src/assets/images/${imageName}`
    return {
      id: index + 1,
      name: item.名字,
      merchant: `商家：${item.商家}`,
      delivery: `配送：${item.配送}`,
      price: item.卷后价格,
      originalPrice: item.优惠前价格,
      image: imagePath,
      sales: Math.floor(Math.random() * 1000) + 500, // 随机销量
      description: `这款${item.名字}是${item.商家}精心打造的文创产品，融合了传统与现代设计元素，具有很高的收藏价值和使用价值。`,
    }
  })

  const foundProduct = processedProducts.find((p) => p.id === productId)
  product.value = foundProduct || {}

  // 加载评论
  loadComments()
})
</script>

<style scoped lang="scss">
.product-detail-container {
  width: 90%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 2rem 0;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.breadcrumb {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  flex-wrap: wrap;
}

.breadcrumb-link {
  color: #333;
  text-decoration: none;
  transition: color 0.3s;

  &:hover {
    color: #c62f2f;
  }
}

.breadcrumb-separator {
  margin: 0 0.5rem;
  color: #999;
}

.breadcrumb-current {
  font-weight: 500;
  color: #333;
}

.back-button {
  background-color: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  transition: all 0.3s;

  i {
    margin-right: 0.3rem;
    font-size: 0.8rem;
  }

  &:hover {
    background-color: #eee;
    color: #333;
  }
}

.product-content {
  display: flex;
  align-items: flex-start;
  gap: 2.5rem;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
}

.image-container {
  flex: 1;
  max-width: 500px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.product-detail-image {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.4s ease;

  &:hover {
    transform: scale(1.03);
  }
}

.product-info {
  flex: 1;
  min-width: 0; // 防止flex项目溢出
}

.product-name {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1.2rem;
  line-height: 1.4;
  word-break: break-word;
}

.product-price-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f8f8f8;
  border-radius: 6px;
}

.product-detail-price {
  color: #c62f2f;
  font-weight: bold;
  font-size: 2.2rem;
  margin: 0;

  .product-original-price {
    color: #999;
    text-decoration: line-through;
    font-size: 1.1rem;
    margin-left: 1rem;
    font-weight: normal;
  }
}

.product-sales {
  color: #666;
  font-size: 0.95rem;
}

.product-detail-description {
  color: #666;
  font-size: 1rem;
  margin: 0.8rem 0;
  line-height: 1.6;
}

.product-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.add-to-cart,
.buy-now,
.favorite {
  padding: 0.8rem 1.8rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 120px;

  i {
    font-size: 1.1rem;
  }
}

.add-to-cart {
  background-color: #ff9500;
  color: white;

  &:hover {
    background-color: #e68600;
    transform: translateY(-2px);
  }
}

.buy-now {
  background-color: #c62f2f;
  color: white;

  &:hover {
    background-color: #b32a2a;
    transform: translateY(-2px);
  }
}

.favorite {
  background-color: #f5f5f5;
  color: #666;

  &:hover {
    background-color: #eee;
    transform: translateY(-2px);
  }

  i.favorited {
    color: #ff4757;
  }
}

/* 选项卡样式 */
.product-tabs {
  margin-top: 3rem;
  border-top: 1px solid #eee;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 1.5rem;
}

.tab-button {
  padding: 1rem 2rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #666;
  position: relative;
  transition: color 0.3s;

  &:hover {
    color: #c62f2f;
  }

  &.active {
    color: #c62f2f;
    font-weight: 500;

    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: #c62f2f;
    }
  }
}

.tab-content {
  padding: 0 1.5rem;
}

.product-description {
  line-height: 1.8;
  color: #444;

  h2 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 1.5rem;
    padding-bottom: 0.8rem;
    border-bottom: 1px solid #eee;
  }

  p {
    margin-bottom: 1rem;
  }
}

/* 评论区域样式 */
.comments-section {
  h2 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 1.5rem;
    padding-bottom: 0.8rem;
    border-bottom: 1px solid #eee;
  }
}

.comment-form {
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;

  h3 {
    margin-top: 0;
    margin-bottom: 1.2rem;
    font-size: 1.2rem;
    color: #333;
  }
}

.rating-input {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;

  .stars {
    margin-left: 0.5rem;

    i {
      color: #ccc;
      cursor: pointer;
      font-size: 1.2rem;
      transition: color 0.2s;

      &:hover,
      &.rated {
        color: #ffc107;
      }
    }
  }
}

.comment-textarea {
  width: 100%;
  min-height: 100px;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 1rem;
  transition: border-color 0.3s;

  &:focus {
    border-color: #c62f2f;
    outline: none;
  }
}

.submit-comment {
  background-color: #c62f2f;
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 50px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.3s;

  &:hover {
    background-color: #b32a2a;
  }
}

.comment-list {
  border-top: 1px solid #eee;
}

.no-comments {
  padding: 2rem;
  text-align: center;
  color: #999;
  font-size: 1rem;
}

.comment-item {
  padding: 1.5rem 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;
  flex-wrap: wrap;
}

.comment-user {
  display: flex;
  align-items: center;
  margin-right: 1.5rem;
  font-weight: 500;
  color: #333;

  i {
    margin-right: 0.5rem;
    color: #666;
    font-size: 1.2rem;
  }
}

.comment-rating {
  display: flex;
  margin-right: 1rem;

  i {
    color: #ffc107;
    font-size: 0.9rem;
  }
}

.comment-date {
  color: #999;
  font-size: 0.85rem;
}

.comment-content {
  color: #444;
  line-height: 1.6;
  padding-left: 2.2rem;
}

/* 成功提示弹窗样式 */
.success-modal {
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
  animation: fadeIn 0.3s;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s;
}

.modal-icon {
  font-size: 3rem;
  color: #c62f2f;
  margin-bottom: 1rem;
}

.modal-content p {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.modal-button {
  padding: 0.6rem 1.5rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s;
  flex: 1;
  max-width: 150px;

  &.primary {
    background-color: #c62f2f;
    color: white;

    &:hover {
      background-color: #b32a2a;
    }
  }

  &.secondary {
    background-color: #f5f5f5;
    color: #666;

    &:hover {
      background-color: #eee;
    }
  }
}

.loading-message {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
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
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-content {
    flex-direction: column;
    padding: 1rem;
    gap: 1.5rem;
  }

  .image-container {
    max-width: 100%;
  }

  .product-name {
    font-size: 1.5rem;
  }

  .product-detail-price {
    font-size: 1.8rem;
  }

  .product-actions {
    flex-direction: column;
  }

  .add-to-cart,
  .buy-now,
  .favorite {
    width: 100%;
  }

  .tabs-header {
    justify-content: space-around;
  }

  .tab-button {
    padding: 0.8rem 1rem;
    font-size: 1rem;
  }

  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .comment-content {
    padding-left: 0;
  }
}
</style>
