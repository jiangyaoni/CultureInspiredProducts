<template>
  <div class="container">
    <!-- 筛选区域 -->
    <div class="filter-container">
      <div class="filter-group">
        <select v-model="selectedCategory" class="filter-select">
          <option value="">全部类别</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <select v-model="selectedRegion" class="filter-select">
          <option value="">全部地区</option>
          <option v-for="region in regions" :key="region" :value="region">
            {{ region }}
          </option>
        </select>
      </div>

      <div class="filter-group time-filter">
        <div class="time-inputs">
          <input
            type="number"
            v-model="selectedStartYear"
            class="time-input"
            placeholder="起始年份"
            min="1900"
            :max="selectedEndYear || new Date().getFullYear()"
          />
          <span class="time-separator">至</span>
          <input
            type="number"
            v-model="selectedEndYear"
            class="time-input"
            placeholder="结束年份"
            :min="selectedStartYear || 1900"
            :max="new Date().getFullYear()"
          />
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <h1 class="page-title">非遗文化</h1>
      <p class="page-description">探索丰富多样的非遗文化，感受传统文化的魅力</p>

      <div class="heritage-grid">
        <template v-for="(item, index) in paginatedData" :key="index">
          <div v-if="item.id" class="card-link" @click="viewHeritageDetail(item)">
            <div class="heritage-card">
              <div class="image-wrapper">
                <img
                  :src="getImageUrl(item.name)"
                  :alt="item.name"
                  class="card-image"
                  loading="lazy"
                />
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ item.name }}</h3>
                <div class="card-meta">
                  <p class="meta-item">
                    <span class="meta-label">类别：</span>
                    <span class="meta-value">{{ item.category }}</span>
                  </p>
                  <p class="meta-item">
                    <span class="meta-label">地区：</span>
                    <span class="meta-value">{{ item.region }}</span>
                  </p>
                  <p class="meta-item">
                    <span class="meta-label">时间：</span>
                    <span class="meta-value">{{ item.year }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 占位元素，保持布局稳定 -->
          <div v-else class="heritage-card placeholder">
            <div class="image-wrapper placeholder">
              <div class="image-placeholder"></div>
            </div>
            <div class="card-content">
              <div class="title-placeholder"></div>
              <div class="meta-placeholder"></div>
              <div class="meta-placeholder"></div>
              <div class="meta-placeholder"></div>
            </div>
          </div>
        </template>
      </div>

      <!-- 分页控件 -->
      <div class="pagination" v-if="filteredHeritageList.length > 0">
        <button class="page-button" :disabled="currentPage === 1" @click="currentPage--">
          上一页
        </button>

        <div class="page-input-group">
          <input
            type="number"
            v-model.number="pageInput"
            class="page-input"
            min="1"
            :max="totalPages"
            @keyup.enter="goToPage"
          />
          <span class="page-total">/ {{ totalPages }}页</span>
        </div>

        <button class="page-button" :disabled="currentPage >= totalPages" @click="currentPage++">
          下一页
        </button>
      </div>

      <div v-if="showEmptyState" class="empty-state">
        <p>没有找到符合条件的非遗项目</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { debounce } from 'lodash-es'
import heritageData from '@/assets/非遗数据.json'

const store = useStore()
const router = useRouter()

// 分页配置
const currentPage = ref(1)
const pageInput = ref(1)
const pageSize = ref(12)

// 筛选条件
const selectedCategory = ref('')
const selectedRegion = ref('')
const selectedStartYear = ref('')
const selectedEndYear = ref('')

// 地区数据
const regions = ref([
  '北京市',
  '天津市',
  '河北省',
  '山西省',
  '内蒙古自治区',
  '辽宁省',
  '吉林省',
  '黑龙江省',
  '上海市',
  '江苏省',
  '浙江省',
  '安徽省',
  '福建省',
  '江西省',
  '山东省',
  '河南省',
  '湖北省',
  '湖南省',
  '广东省',
  '广西壮族自治区',
  '海南省',
  '重庆市',
  '四川省',
  '贵州省',
  '云南省',
  '西藏自治区',
  '陕西省',
  '甘肃省',
  '青海省',
  '宁夏回族自治区',
  '新疆维吾尔自治区',
  '台湾省',
  '香港特别行政区',
  '澳门特别行政区',
])

// 图片路径处理
const getImageUrl = (name) => {
  try {
    return new URL(`/src/assets/cultural_imgs/${name}.jpg`, import.meta.url).href
  } catch {
    return new URL('/src/assets/cultural_imgs/default.jpg', import.meta.url).href
  }
}

// 计算属性
const categories = computed(() => [...new Set(heritageData.map((item) => item.category))])

// 筛选逻辑
const filteredHeritageList = computed(() => {
  return heritageData.filter((item) => {
    const categoryMatch = !selectedCategory.value || item.category === selectedCategory.value
    const regionMatch = !selectedRegion.value || item.region.includes(selectedRegion.value)
    const itemYear = Number(item.year)
    const startYear = Number(selectedStartYear.value) || 0
    const endYear = Number(selectedEndYear.value) || Infinity
    return categoryMatch && regionMatch && itemYear >= startYear && itemYear <= endYear
  })
})

// 分页数据 - 确保总是返回完整页面的数据（用填充不足部分）
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  const filtered = filteredHeritageList.value

  // 创建新数组，确保长度始终为pageSize
  const result = []
  for (let i = start; i < end; i++) {
    result.push(filtered[i] || {})
  }

  return result
})

// 总页数
const totalPages = computed(() => {
  const total = filteredHeritageList.value.length
  return Math.max(1, Math.ceil(total / pageSize.value))
})

// 是否显示空状态（只有在第一页且没有数据时才显示）
const showEmptyState = computed(() => {
  return currentPage.value === 1 && filteredHeritageList.value.length === 0
})

// 查看非遗详情
const viewHeritageDetail = (item) => {
  // 添加浏览历史记录
  store.commit('addToHistory', {
    id: item.id,
    name: item.name,
    image: getImageUrl(item.name),
    time: new Date().toISOString(),
    type: 'intangible',
    category: item.category,
    region: item.region,
    year: item.year,
  })

  router.push(`/heritage/${item.id}`)
}

// 页码跳转
const goToPage = () => {
  const targetPage = Math.min(Math.max(1, pageInput.value), totalPages.value)
  currentPage.value = targetPage
  pageInput.value = targetPage
}

// 监听筛选条件变化
watch(
  [selectedCategory, selectedRegion, selectedStartYear, selectedEndYear],
  debounce(() => {
    currentPage.value = 1
    pageInput.value = 1
  }, 300),
)

// 监听当前页码变化
watch(currentPage, (newVal) => {
  if (newVal < 1) currentPage.value = 1
  if (newVal > totalPages.value) currentPage.value = totalPages.value
  pageInput.value = currentPage.value
})

// 监听页码输入变化
watch(pageInput, (newVal) => {
  if (newVal > totalPages.value) {
    pageInput.value = totalPages.value
  }
})
</script>

<style scoped lang="scss">
.container {
  --primary-color: #2c6b4a;
  --secondary-color: #f8f5f0;
  --accent-color: #d4a373;
  --text-dark: #2b2d42;
  --text-light: #6c757d;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --border-radius: 8px;
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --card-width: 280px;
  --card-height: 380px;
  --image-height: 200px;
}

.filter-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  background: #e8f4d9;
  border-radius: 12px;
  margin: 1.5rem auto;
  max-width: 1400px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-select {
  width: 100%;
  padding: 0.75rem 1.5rem 0.75rem 0.75rem;
  border: 1.5px solid var(--primary-color);
  border-radius: var(--border-radius);
  background-color: white;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232c6b4a'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.1em;
  transition: var(--transition);
  font-size: 0.9rem;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(44, 107, 74, 0.1);
  }

  &:hover {
    border-color: var(--accent-color);
  }
}

.time-inputs {
  display: grid;
  grid-template-columns: 1fr 0.4fr 1fr;
  gap: 0.3rem;
  align-items: center;
}

.time-input {
  padding: 0.75rem;
  border: 1.5px solid var(--primary-color);
  border-radius: var(--border-radius);
  transition: var(--transition);
  font-size: 0.9rem;
  appearance: textfield;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(212, 163, 115, 0.1);
  }

  &:hover {
    border-color: var(--accent-color);
  }
}

.time-input::-webkit-outer-spin-button,
.time-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.time-separator {
  color: var(--primary-color);
  font-weight: 500;
  text-align: center;
  font-size: 0.9rem;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.page-title {
  font-size: 2rem;
  color: var(--primary-color);
  text-align: center;
  margin: 1.5rem 0 0.8rem;
}

.page-description {
  color: var(--text-light);
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.heritage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--card-width), 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  min-height: calc((var(--card-height) + 1.5rem) * 2);
}

.card-link {
  text-decoration: none;
  color: inherit;
  height: var(--card-height);
  cursor: pointer;
}

.heritage-card {
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: var(--transition);
  box-shadow: var(--box-shadow);
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-0.3rem);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  &.placeholder {
    visibility: hidden;
    pointer-events: none;
  }
}

.image-wrapper {
  height: var(--image-height);
  overflow: hidden;
  background: #f5f5f5;
  flex-shrink: 0;

  &.placeholder {
    background: #eee;
  }
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;

  .heritage-card:hover & {
    transform: scale(1.03);
  }
}

.card-content {
  padding: 1.2rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-size: 1.1rem;
  flex-shrink: 0;
  height: 2.6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  // -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.title-placeholder {
  width: 70%;
  height: 1.1rem;
  background: #eee;
  border-radius: 4px;
  margin-bottom: 1rem;
  animation: shimmer 1.5s infinite linear;
}

.card-meta {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.meta-item {
  color: var(--text-light);
  font-size: 0.85rem;
  margin: 0.5rem 0;
  display: flex;
}

.meta-placeholder {
  width: 90%;
  height: 0.85rem;
  background: #eee;
  border-radius: 4px;
  margin: 0.5rem 0;
  animation: shimmer 1.5s infinite linear;

  &:nth-child(2) {
    width: 80%;
  }

  &:nth-child(3) {
    width: 60%;
  }
}

.meta-label {
  color: var(--text-dark);
  font-weight: 500;
  flex-shrink: 0;
}

.meta-value {
  flex-grow: 1;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
}

.page-button {
  padding: 0.6rem 1.2rem;
  border: 1.5px solid var(--primary-color);
  background-color: white;
  color: var(--primary-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;

  &:hover:not(:disabled) {
    background-color: var(--primary-color);
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.page-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-input {
  width: 60px;
  padding: 0.5rem;
  border: 1.5px solid var(--primary-color);
  border-radius: var(--border-radius);
  text-align: center;
  font-size: 0.9rem;
  appearance: textfield;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
}

.page-input::-webkit-outer-spin-button,
.page-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.page-total {
  color: var(--text-light);
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-light);
  font-size: 1rem;
  grid-column: 1 / -1;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 768px) {
  .filter-container {
    grid-template-columns: 1fr;
  }

  .time-inputs {
    grid-template-columns: 1fr;
  }

  .time-separator {
    display: none;
  }

  .pagination {
    flex-direction: column;
    gap: 0.8rem;
  }

  .page-input-group {
    order: -1;
  }
}
</style>
