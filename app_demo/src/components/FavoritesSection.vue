<!-- FavoritesSection.vue -->
<script setup>
import { reactive, computed, watch, onMounted, onDeactivated } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { DeleteOutlined } from '@ant-design/icons-vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'

// 常量定义
const FAVORITE_TYPES = {
  ALL: 'all',
  INTANGIBLE: 'intangible',
  CULTURAL: 'cultural',
}

const PAGE_SIZE = 6

// 组合式API导入
const store = useStore()
const route = useRoute()
const router = useRouter()

// 响应式状态
const state = reactive({
  activeTab: FAVORITE_TYPES.ALL,
  pageLeft: false,
  currentPages: {
    [FAVORITE_TYPES.ALL]: 1,
    [FAVORITE_TYPES.INTANGIBLE]: 1,
    [FAVORITE_TYPES.CULTURAL]: 1,
  },
})

// 计算属性
const filteredFavorites = computed(() => ({
  [FAVORITE_TYPES.ALL]: store.getters.allFavorites,
  [FAVORITE_TYPES.INTANGIBLE]: store.getters.intangibleFavorites,
  [FAVORITE_TYPES.CULTURAL]: store.getters.culturalFavorites,
}))

const paginatedFavorites = computed(() => {
  const list = filteredFavorites.value[state.activeTab]
  const start = (state.currentPages[state.activeTab] - 1) * PAGE_SIZE
  return list.slice(start, start + PAGE_SIZE)
})

const totalPages = computed(() => {
  const list = filteredFavorites.value[state.activeTab]
  return Math.max(1, Math.ceil(list.length / PAGE_SIZE))
})

// 方法
const resetAllPages = () => {
  state.currentPages = {
    [FAVORITE_TYPES.ALL]: 1,
    [FAVORITE_TYPES.INTANGIBLE]: 1,
    [FAVORITE_TYPES.CULTURAL]: 1,
  }
}

const handleTabChange = (tab) => {
  state.activeTab = tab
  // 确保页码不会超出范围
  const currentTotal = totalPages.value
  if (state.currentPages[state.activeTab] > currentTotal) {
    state.currentPages[state.activeTab] = currentTotal
  }
}

const goToPage = (page) => {
  const clampedPage = Math.max(1, Math.min(page, totalPages.value))
  state.currentPages[state.activeTab] = clampedPage
}

const removeFromFavorites = (id) => {
  Modal.confirm({
    title: '确认移除',
    content: '确定要将该商品移出收藏夹吗？',
    okText: '确认',
    cancelText: '取消',
    centered: true,
    onOk: () => {
      store.commit('removeFavorite', id)
      message.success('已移出收藏夹')

      // 处理删除后页码可能超出范围的情况
      const currentTotal = totalPages.value
      if (state.currentPages[state.activeTab] > currentTotal && currentTotal > 0) {
        state.currentPages[state.activeTab] = currentTotal
      }
    },
  })
}

const viewProductDetail = (id) => {
  const item = store.state.favorites.find((item) => item.id === id)
  if (!item) return

  // 添加到历史记录
  store.commit('addToHistory', {
    id: item.id,
    name: item.name,
    image: item.image,
    time: new Date().toISOString(),
    type: item.type,
    price: item.price,
    category: item.category,
    region: item.region,
    year: item.year,
    shop: item.shop,
  })

  // 路由跳转
  router.push(item.type === 'intangible' ? `/heritage/${id}` : `/cultural/${id}`)
}

// 生命周期钩子
onDeactivated(() => {
  state.pageLeft = true
})

onMounted(() => {
  if (state.pageLeft) {
    resetAllPages()
  }

  // 从路由参数恢复标签页
  if (route.query.tab && Object.values(FAVORITE_TYPES).includes(route.query.tab)) {
    state.activeTab = route.query.tab
  }
})

// 监听器
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && Object.values(FAVORITE_TYPES).includes(newTab)) {
      handleTabChange(newTab)
    }
  },
)
</script>

<template>
  <section class="favorites-section">
    <!-- 导航栏 -->
    <div class="favorites-nav">
      <div
        v-for="tab in Object.values(FAVORITE_TYPES)"
        :key="tab"
        :class="['nav-item', { active: state.activeTab === tab }]"
        @click="handleTabChange(tab)"
      >
        {{
          tab === FAVORITE_TYPES.ALL
            ? '所有收藏'
            : tab === FAVORITE_TYPES.INTANGIBLE
              ? '非遗收藏'
              : '文创收藏'
        }}
        ({{ filteredFavorites[tab].length }})
      </div>
    </div>

    <!-- 收藏内容区域 -->
    <div class="favorites-container">
      <transition-group name="fade-slide" tag="div" class="favorites-grid">
        <a-card
          v-for="item in paginatedFavorites"
          :key="item.id"
          hoverable
          class="favorite-card"
          @click="viewProductDetail(item.id)"
        >
          <template #cover>
            <div class="image-container">
              <img :src="item.image" :alt="item.name" class="favorite-image" loading="lazy" />
            </div>
          </template>
          <a-card-meta :title="item.name" :description="item.category">
            <template #avatar>
              <a-tag
                :color="item.type === 'intangible' ? '#ff4d4f' : '#722ed1'"
                class="favorite-type-tag"
              >
                {{ item.type === 'intangible' ? '非遗' : '文创' }}
              </a-tag>
            </template>
          </a-card-meta>
          <div class="favorite-footer">
            <span class="favorite-price">
              {{ item.type === 'intangible' ? '' : '¥' + item.price }}
            </span>
            <a-button
              type="text"
              danger
              @click.stop="removeFromFavorites(item.id)"
              class="remove-btn"
            >
              <template #icon><DeleteOutlined /></template>
              移除
            </a-button>
          </div>
        </a-card>
      </transition-group>

      <!-- 分页控件 -->
      <div v-if="totalPages > 1" class="pagination-container">
        <a-button
          :disabled="state.currentPages[state.activeTab] <= 1"
          @click="goToPage(state.currentPages[state.activeTab] - 1)"
        >
          上一页
        </a-button>

        <div class="page-input">
          <a-input-number
            v-model:value="state.currentPages[state.activeTab]"
            :min="1"
            :max="totalPages"
            :controls="false"
            @pressEnter="goToPage(state.currentPages[state.activeTab])"
          />
          <span class="page-info">/ {{ totalPages }}</span>
        </div>

        <a-button
          :disabled="state.currentPages[state.activeTab] >= totalPages"
          @click="goToPage(state.currentPages[state.activeTab] + 1)"
        >
          下一页
        </a-button>
      </div>

      <a-empty
        v-else-if="paginatedFavorites.length === 0"
        :description="`暂无${
          state.activeTab === FAVORITE_TYPES.ALL
            ? '收藏'
            : state.activeTab === FAVORITE_TYPES.INTANGIBLE
              ? '非遗收藏'
              : '文创收藏'
        }`"
      />
    </div>
  </section>
</template>

<style scoped>
.favorites-section {
  min-height: 500px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}

/* 导航栏样式 */
.favorites-nav {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
  gap: 8px;
}

.nav-item {
  padding: 12px 24px;
  cursor: pointer;
  font-size: 14px;
  position: relative;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  white-space: nowrap;
}

.nav-item:hover {
  color: #1890ff;
}

.nav-item.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
  font-weight: 500;
}

.favorites-container {
  min-height: 400px;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  margin-top: 20px;
}

.favorite-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  height: 100%; /* 确保卡片高度一致 */
}

.favorite-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.image-container {
  position: relative;
  padding-top: 75%;
  overflow: hidden;
  background: #f5f5f5;
}

.favorite-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.favorite-card:hover .favorite-image {
  transform: scale(1.05);
}

.favorite-type-tag {
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
}

.favorite-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.favorite-price {
  font-weight: 600;
  color: #ff4d4f;
  font-size: 16px;
  white-space: nowrap;
}

.remove-btn {
  color: #ff4d4f;
  padding: 0 4px;
}

/* 分页控件样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.page-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-info {
  color: #666;
  min-width: 24px;
  text-align: center;
}

/* 移除输入框的上下箭头 */
:deep(.ant-input-number-handler-wrap) {
  display: none;
}

:deep(.ant-input-number) {
  width: 60px;
}

:deep(.ant-input-number-input) {
  text-align: center;
}

/* 文本截断样式 */
:deep(.ant-card-meta-title) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.ant-card-meta-description) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 动画效果 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .favorites-nav {
    flex-wrap: wrap;
    border-bottom: none;
  }

  .nav-item {
    padding: 8px 12px;
    border-bottom: 1px solid #eee;
    font-size: 13px;
  }

  .nav-item.active {
    border-bottom-color: #1890ff;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .pagination-container {
    flex-direction: column;
    gap: 12px;
  }

  .page-input {
    order: -1;
  }
}
</style>
