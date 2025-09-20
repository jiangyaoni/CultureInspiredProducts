<template>
  <div class="favorites-page">
    <div class="page-header">
      <h1 class="page-title">
        <HeartOutlined style="color: #ff4d4f; margin-right: 8px" />
        我的收藏
      </h1>
    </div>

    <div class="favorites-content">
      <a-tabs
        v-model:activeKey="activeTab"
        class="favorites-tabs"
        :animated="true"
        :tabBarGutter="0"
      >
        <a-tab-pane key="all" tab="所有收藏">
          <a-empty
            v-if="filteredFavorites.all.length === 0"
            description="暂无收藏商品"
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
          />
          <template v-else>
            <div class="favorites-grid">
              <transition-group name="fade">
                <a-card
                  v-for="item in paginatedFavorites.all"
                  :key="item.id"
                  hoverable
                  class="favorite-card"
                  @click="viewProductDetail(item.id)"
                >
                  <!-- 卡片内容保持不变 -->
                  <template #cover>
                    <div class="image-container">
                      <img :src="item.image" :alt="item.name" class="favorite-image" />
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
                    <span class="favorite-price"
                      >{{ item.type === 'intangible' ? '' : '¥' + item.price }}
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
            </div>
            <div class="pagination-container">
              <a-button
                :disabled="currentPage.all === 1"
                @click="goToPage('all', currentPage.all - 1)"
              >
                上一页
              </a-button>

              <div class="page-input">
                <a-input-number
                  v-model:value="currentPage.all"
                  :min="1"
                  :max="totalPages.all"
                  :controls="false"
                  @pressEnter="goToPage('all', currentPage.all)"
                />
                <span class="page-info">/ {{ totalPages.all }}</span>
              </div>

              <a-button
                :disabled="currentPage.all >= totalPages.all"
                @click="goToPage('all', currentPage.all + 1)"
              >
                下一页
              </a-button>
            </div>
          </template>
        </a-tab-pane>

        <a-tab-pane key="intangible" tab="非遗收藏">
          <a-empty
            v-if="filteredFavorites.intangible.length === 0"
            description="暂无非遗收藏"
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
          />
          <template v-else>
            <div class="favorites-grid">
              <transition-group name="fade">
                <a-card
                  v-for="item in paginatedFavorites.intangible"
                  :key="item.id"
                  hoverable
                  class="favorite-card"
                  @click="viewProductDetail(item.id)"
                >
                  <!-- 卡片内容保持不变 -->
                  <template #cover>
                    <div class="image-container">
                      <img :src="item.image" :alt="item.name" class="favorite-image" />
                    </div>
                  </template>
                  <a-card-meta :title="item.name" :description="item.category">
                    <template #avatar>
                      <a-tag color="#ff4d4f" class="favorite-type-tag">非遗</a-tag>
                    </template>
                  </a-card-meta>
                  <div class="favorite-footer">
                    <span class="favorite-price"></span>
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
            </div>
            <div class="pagination-container">
              <a-button
                :disabled="currentPage.intangible === 1"
                @click="goToPage('intangible', currentPage.intangible - 1)"
              >
                上一页
              </a-button>

              <div class="page-input">
                <a-input-number
                  v-model:value="currentPage.intangible"
                  :min="1"
                  :max="totalPages.intangible"
                  :controls="false"
                  @pressEnter="goToPage('intangible', currentPage.intangible)"
                />
                <span class="page-info">/ {{ totalPages.intangible }}</span>
              </div>

              <a-button
                :disabled="currentPage.intangible >= totalPages.intangible"
                @click="goToPage('intangible', currentPage.intangible + 1)"
              >
                下一页
              </a-button>
            </div>
          </template>
        </a-tab-pane>

        <a-tab-pane key="cultural" tab="文创收藏">
          <a-empty
            v-if="filteredFavorites.cultural.length === 0"
            description="暂无文创收藏"
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
          />
          <template v-else>
            <div class="favorites-grid">
              <transition-group name="fade">
                <a-card
                  v-for="item in paginatedFavorites.cultural"
                  :key="item.id"
                  hoverable
                  class="favorite-card"
                  @click="viewProductDetail(item.id)"
                >
                  <!-- 卡片内容保持不变 -->
                  <template #cover>
                    <div class="image-container">
                      <img :src="item.image" :alt="item.name" class="favorite-image" />
                    </div>
                  </template>
                  <a-card-meta :title="item.name" description="文化创意产品">
                    <template #avatar>
                      <a-tag color="#722ed1" class="favorite-type-tag">文创</a-tag>
                    </template>
                  </a-card-meta>
                  <div class="favorite-footer">
                    <span class="favorite-price">¥{{ item.price }}</span>
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
            </div>
            <div class="pagination-container">
              <a-button
                :disabled="currentPage.cultural === 1"
                @click="goToPage('cultural', currentPage.cultural - 1)"
              >
                上一页
              </a-button>

              <div class="page-input">
                <a-input-number
                  v-model:value="currentPage.cultural"
                  :min="1"
                  :max="totalPages.cultural"
                  :controls="false"
                  @pressEnter="goToPage('cultural', currentPage.cultural)"
                />
                <span class="page-info">/ {{ totalPages.cultural }}</span>
              </div>

              <a-button
                :disabled="currentPage.cultural >= totalPages.cultural"
                @click="goToPage('cultural', currentPage.cultural + 1)"
              >
                下一页
              </a-button>
            </div>
          </template>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { DeleteOutlined, HeartOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()

const activeTab = ref('all')
const itemsPerPage = 8 // 每页显示数量

// 当前页码（使用响应式对象存储不同分类的页码）
const currentPage = ref({
  all: 1,
  intangible: 1,
  cultural: 1,
})

// 计算属性：过滤后的收藏数据（保持不变）
const filteredFavorites = computed(() => ({
  all: store.getters.allFavorites,
  intangible: store.getters.intangibleFavorites,
  cultural: store.getters.culturalFavorites,
}))

// 计算属性：分页后的收藏数据
const paginatedFavorites = computed(() => ({
  all: getPaginatedItems(filteredFavorites.value.all, currentPage.value.all),
  intangible: getPaginatedItems(filteredFavorites.value.intangible, currentPage.value.intangible),
  cultural: getPaginatedItems(filteredFavorites.value.cultural, currentPage.value.cultural),
}))

// 计算属性：总页数
const totalPages = computed(() => ({
  all: Math.ceil(filteredFavorites.value.all.length / itemsPerPage),
  intangible: Math.ceil(filteredFavorites.value.intangible.length / itemsPerPage),
  cultural: Math.ceil(filteredFavorites.value.cultural.length / itemsPerPage),
}))

// 分页函数
function getPaginatedItems(items, page) {
  const start = (page - 1) * itemsPerPage
  const end = start + itemsPerPage
  return items.slice(start, end)
}

// 跳转到指定页码
function goToPage(tab, page) {
  // 确保页码在有效范围内
  if (page < 1) page = 1
  if (page > totalPages.value[tab]) page = totalPages.value[tab]

  currentPage.value[tab] = page
}

// 移除收藏（保持不变）
const removeFromFavorites = (id) => {
  Modal.confirm({
    title: '确认移除',
    content: '确定要将该商品移出收藏夹吗？',
    okText: '确认',
    cancelText: '取消',
    centered: true,
    okButtonProps: { danger: true },
    onOk: () => {
      store.commit('removeFavorite', id)
      message.success('已移出收藏夹')

      // 如果删除后当前页没有数据了，返回上一页
      if (
        filteredFavorites.value[activeTab.value].length > 0 &&
        paginatedFavorites.value[activeTab.value].length === 0
      ) {
        currentPage.value[activeTab.value] = Math.max(1, currentPage.value[activeTab.value] - 1)
      }
    },
  })
}

// 查看详情（保持不变）
const viewProductDetail = (id) => {
  const item = store.state.favorites.find((item) => item.id === id)
  if (item) {
    // 添加浏览历史记录
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

    if (item.type === 'intangible') {
      router.push(`/heritage/${id}`)
    } else {
      router.push(`/cultural/${id}`)
    }
  }
}
</script>

<style scoped>
/* 原有样式保持不变，新增以下样式 */

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
}

/* 移除输入框的上下箭头（针对所有浏览器） */
.pagination-container :deep(.ant-input-number-handler-wrap) {
  display: none;
}

.pagination-container :deep(.ant-input-number) {
  width: 60px;
}

.pagination-container :deep(.ant-input-number-input) {
  text-align: center;
}

.favorites-page {
  max-width: 1200px;
  margin: 24px auto;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
}

.favorites-content {
  margin-top: 24px;
}

/* 移除tabs的下划线指示器 */
.favorites-tabs :deep(.ant-tabs-ink-bar) {
  display: none !important;
}

.favorites-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 24px;
}

.favorites-tabs :deep(.ant-tabs-tab) {
  padding: 12px 24px;
  font-size: 16px;
  border: none !important;
  background: transparent !important;
}

.favorites-tabs :deep(.ant-tabs-tab-active) {
  color: #ff4d4f !important;
}

.favorites-tabs :deep(.ant-tabs-tab:hover) {
  color: #ff4d4f !important;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  margin-top: 20px;
}

.favorite-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.favorite-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
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
  transition: transform 0.5s ease;
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
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.favorite-price {
  font-weight: 600;
  color: #ff4d4f;
  font-size: 18px;
}

.remove-btn {
  color: #ff4d4f;
  padding: 0 4px;
}

.remove-btn:hover {
  color: #ff7875;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .favorites-page {
    padding: 16px;
    margin: 12px auto;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
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
