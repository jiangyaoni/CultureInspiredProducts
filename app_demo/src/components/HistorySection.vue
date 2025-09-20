<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { CloseOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { useStore } from 'vuex'

// 扩展dayjs功能
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const router = useRouter()
const store = useStore()
const activeHistoryTab = ref('browse')
const loading = ref(false)
const error = ref()
const currentPage = ref(1)
const pageSize = 4
const jumpPage = ref(1)

// 使用Vuex中的浏览历史数据
const browseHistory = computed(() => store.getters.browseHistory)

// 计算总页数
const totalPages = computed(() => Math.ceil(browseHistory.value.length / pageSize))

// 当前页显示的数据
const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return browseHistory.value.slice(start, end)
})

// 监听当前页码变化，更新跳转页码输入框
watch(currentPage, (newPage) => {
  jumpPage.value = newPage
})

// 监听历史记录长度变化，自动调整页码
watch(
  () => browseHistory.value.length,
  (newLength) => {
    const newTotalPages = Math.ceil(newLength / pageSize)
    if (currentPage.value > newTotalPages && newTotalPages > 0) {
      currentPage.value = newTotalPages
      jumpPage.value = newTotalPages
    }
  },
)

// 跳转到指定页码
const goToPage = (page) => {
  const pageNum = parseInt(page)
  if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages.value) {
    currentPage.value = pageNum
    jumpPage.value = pageNum
  }
}

// 处理跳转页面输入
const handlePageJump = () => {
  const page = parseInt(jumpPage.value)
  if (!isNaN(page) && page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  } else {
    message.error(`请输入 1 到 ${totalPages.value} 之间的页码`)
    jumpPage.value = currentPage.value
  }
}

// 格式化日期
function formatDate(dateString) {
  const date = dayjs(dateString)
  if (!date.isValid()) return '无效日期'
  if (dayjs().diff(date, 'day') > 7) {
    return date.format('YYYY-MM-DD HH:mm')
  }
  return date.fromNow()
}

const viewDetail = (item) => {
  if (item.type === 'intangible') {
    router.push(`/heritage/${item.id}`)
  } else {
    router.push(`/cultural/${item.id}`)
  }
}

// 删除单条历史记录
const removeHistoryItem = (id, e) => {
  e.stopPropagation() // 阻止事件冒泡
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这条浏览记录吗？',
    okText: '确认',
    cancelText: '取消',
    centered: true,
    onOk: () => {
      store.commit('removeFromHistory', id)
      message.success('已删除该浏览记录')

      // 删除后检查是否需要调整页码
      if (paginatedHistory.value.length === 0 && currentPage.value > 1) {
        currentPage.value -= 1
      }
    },
  })
}

// 清除所有历史记录
const clearHistory = () => {
  Modal.confirm({
    title: '确认清除',
    content: '确定要清除所有浏览历史吗？此操作不可恢复。',
    okText: '确认清除',
    cancelText: '取消',
    centered: true,
    onOk: () => {
      store.commit('clearHistory')
      currentPage.value = 1
      jumpPage.value = 1
      message.success('浏览历史已清除')
    },
  })
}

onMounted(() => {
  jumpPage.value = currentPage.value
})
</script>

<template>
  <section class="history-section">
    <a-card :bordered="false" :loading="loading" class="history-card">
      <template #title>
        <div class="history-header">
          <h2>浏览历史</h2>
          <!-- 修正：基于浏览历史长度显示清除按钮 -->
          <a-button
            v-if="browseHistory.length > 0"
            type="text"
            @click="clearHistory"
            :disabled="loading"
            class="clear-btn"
          >
            清除历史
          </a-button>
        </div>
      </template>

      <a-alert
        v-if="error"
        message="错误"
        :description="error"
        type="error"
        show-icon
        closable
        @close="error = ''"
      />

      <a-tabs v-model:activeKey="activeHistoryTab" class="history-tabs">
        <a-tab-pane key="browse" tab="浏览历史">
          <!-- 优化空状态显示 -->
          <a-empty
            v-if="!loading && browseHistory.length === 0"
            description="暂无浏览历史"
            class="empty-history"
          >
            <template #image>
              <div class="empty-image">
                <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                  <g transform="translate(0 1)" fill="none" fill-rule="evenodd">
                    <ellipse fill="#F5F5F5" cx="32" cy="33" rx="32" ry="7"></ellipse>
                    <g fill-rule="nonzero" stroke="#D9D9D9">
                      <path
                        d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"
                      ></path>
                      <path
                        d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
                        fill="#FAFAFA"
                      ></path>
                    </g>
                  </g>
                </svg>
              </div>
            </template>
            <div class="empty-tip">您还没有浏览任何商品哦~</div>
          </a-empty>

          <template v-else>
            <div class="history-list">
              <div
                v-for="(item, index) in paginatedHistory"
                :key="item.id + '-' + item.time"
                class="history-item"
                @click="viewDetail(item)"
              >
                <div class="history-index">
                  {{ (currentPage - 1) * pageSize + index + 1 }}
                </div>
                <div class="history-image-wrapper">
                  <a-image
                    :src="item.image"
                    :alt="item.name"
                    class="history-image"
                    :preview="false"
                    fallback="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                  />
                </div>
                <div class="history-info">
                  <h3 class="history-name" :title="item.name">{{ item.name }}</h3>

                  <!-- 显示文创店铺信息 -->
                  <p
                    v-if="item.type === 'cultural' && item.shop"
                    class="history-shop"
                    :title="item.shop"
                  >
                    {{ item.shop }}
                  </p>

                  <!-- 显示非遗信息 -->
                  <p v-if="item.type === 'intangible'" class="history-meta">
                    {{ item.category }} · {{ item.region }}
                  </p>

                  <p class="history-time">
                    <icon-clock-circle style="margin-right: 4px; font-size: 12px" />
                    {{ formatDate(item.time) }}
                  </p>
                </div>

                <!-- 文创价格显示 -->
                <div
                  v-if="item.type === 'cultural' && item.price !== undefined"
                  class="history-price"
                >
                  ¥{{ item.price.toFixed(2) }}
                </div>

                <!-- 非遗标签显示 -->
                <div v-else class="heritage-tag">非遗</div>

                <div class="history-actions">
                  <a-button
                    type="text"
                    shape="circle"
                    @click.stop="removeHistoryItem(item.id, $event)"
                    class="delete-btn"
                  >
                    <template #icon>
                      <CloseOutlined />
                    </template>
                  </a-button>
                </div>
              </div>
            </div>

            <div class="pagination-controls" v-if="browseHistory.length > pageSize">
              <div class="page-info">
                <span class="page-total"> 第 {{ currentPage }} 页 / 共 {{ totalPages }} 页 </span>
                <span class="page-total-items">共 {{ browseHistory.length }} 条记录</span>
              </div>
              <div class="pagination-buttons">
                <a-button
                  type="text"
                  @click="goToPage(currentPage - 1)"
                  :disabled="currentPage === 1 || loading"
                  class="pagination-btn"
                >
                  上一页
                </a-button>

                <div class="page-jump">
                  <span>跳至</span>
                  <a-input
                    v-model:value="jumpPage"
                    size="small"
                    @pressEnter="handlePageJump"
                    class="page-input"
                    type="number"
                    :min="1"
                    :max="totalPages"
                  />
                  <span>页</span>
                  <a-button @click="handlePageJump">跳转</a-button>
                </div>

                <a-button
                  type="text"
                  @click="goToPage(currentPage + 1)"
                  :disabled="currentPage === totalPages || loading"
                  class="pagination-btn"
                >
                  下一页
                </a-button>
              </div>
            </div>
          </template>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </section>
</template>

<style scoped>
/* 新增空状态样式 */
.empty-history {
  margin: 40px 0;
}

.empty-image {
  margin-bottom: 16px;
}

.empty-tip {
  color: #999;
  margin-top: 8px;
}

/* 基础样式 */
.history-section {
  min-height: 500px;
}

.history-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.history-card :deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
  min-height: auto;
  padding: 0 24px;
}

.history-card :deep(.ant-card-body) {
  padding: 0;
}

/* 头部样式 */
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 56px;
}

.history-header h2 {
  margin-bottom: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.clear-btn {
  color: #666;
  padding: 0;
}

.clear-btn:hover {
  color: #ff4d4f;
}

/* 标签页样式 */
.history-tabs {
  margin-top: 0;
}

.history-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 0;
  padding: 0 24px;
  background-color: #fafafa;
}

.history-tabs :deep(.ant-tabs-tab) {
  padding: 12px 0;
  margin-right: 24px;
}

/* 历史列表样式 */
.history-list {
  margin-top: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s;
  position: relative;
  cursor: pointer;
}

.history-item:hover {
  background-color: #f9f9f9;
}

.history-index {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #666;
  margin-right: 16px;
  flex-shrink: 0;
}

.history-image-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 16px;
  flex-shrink: 0;
  background-color: #f5f5f5;
}

.history-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.history-item:hover .history-image {
  transform: scale(1.05);
}

.history-info {
  flex: 1;
  min-width: 0;
  padding-right: 8px;
}

.history-name {
  margin-bottom: 4px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px; /* 限制名称最大宽度 */
}

.history-shop {
  color: #666;
  font-size: 12px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px; /* 限制店铺名称最大宽度 */
}

.history-meta {
  color: #666;
  font-size: 12px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px; /* 限制元数据最大宽度 */
}

.history-time {
  color: #999;
  font-size: 11px;
  margin: 0;
  display: flex;
  align-items: center;
}

.history-price {
  color: #ff4d4f;
  font-weight: 500;
  font-size: 14px;
  margin-left: 16px;
  flex-shrink: 0;
  width: 80px;
  text-align: right;
}

.history-actions {
  margin-left: 8px;
  flex-shrink: 0;
}

.delete-btn {
  color: #999;
  transition: all 0.3s;
}

.delete-btn:hover {
  color: #ff4d4f;
  background-color: rgba(255, 77, 79, 0.1);
}

/* 分页控件样式 */
.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}

.page-info {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: #666;
}

.page-total {
  font-weight: 500;
}

.page-total-items {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.pagination-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.pagination-btn {
  padding: 6px 16px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-btn:not([disabled]):hover {
  border-color: #1890ff;
  color: #1890ff;
}

.pagination-btn[disabled] {
  color: rgba(0, 0, 0, 0.25);
  cursor: not-allowed;
}

/* 页码跳转样式 */
.page-jump {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 15px;
}

.page-jump span {
  font-size: 14px;
  color: #666;
}

.page-input {
  width: 50px;
  height: 30px;
  padding: 0 8px;
  text-align: center;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;
}

.page-input::-webkit-outer-spin-button,
.page-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.page-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .history-card :deep(.ant-card-head) {
    padding: 0 16px;
  }

  .history-tabs :deep(.ant-tabs-nav) {
    padding: 0 16px;
  }

  .history-item {
    padding: 12px 16px;
  }

  .history-index {
    margin-right: 12px;
  }

  .history-image-wrapper {
    width: 40px;
    height: 40px;
    margin-right: 12px;
  }

  .history-name,
  .history-shop,
  .history-meta {
    max-width: 120px; /* 移动端调整最大宽度 */
  }

  .history-price {
    font-size: 13px;
    margin-left: 8px;
    width: 60px;
  }

  .pagination-controls {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .pagination-buttons {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .pagination-btn {
    flex: 1;
    text-align: center;
  }

  .page-jump {
    order: 3;
    width: 100%;
    justify-content: center;
    margin: 10px 0;
  }

  .page-total-items {
    display: none;
  }
}

@media (max-width: 576px) {
  .history-header h2 {
    font-size: 16px;
  }

  .history-time {
    display: none;
  }

  .history-shop {
    margin-bottom: 0;
  }

  .history-name,
  .history-shop,
  .history-meta {
    max-width: 100px; /* 更小屏幕调整最大宽度 */
  }

  .history-price {
    width: auto;
    min-width: 60px;
  }

  .history-actions {
    margin-left: 4px;
  }

  .page-jump {
    gap: 4px;
  }

  .page-jump span {
    font-size: 12px;
  }

  .page-input {
    width: 40px;
  }
}

.heritage-tag {
  padding: 4px 8px;
  background-color: #ff4d4f;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 16px;
  flex-shrink: 0;
}
</style>
