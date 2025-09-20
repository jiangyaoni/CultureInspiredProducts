<template>
  <div class="cultural-shop-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-container">
      <div class="breadcrumb">
        <router-link to="/" class="breadcrumb-link">首页</router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">文创商城</span>
      </div>

      <!-- 优化后的排序选择器 -->
      <div class="sort-selector">
        <span class="sort-label">排序方式：</span>
        <div class="custom-select">
          <select id="sort-by-price" v-model="sortOption" @change="sortProducts">
            <option value="default">默认排序</option>
            <option value="asc">价格从低到高</option>
            <option value="desc">价格从高到低</option>
          </select>
          <span class="select-icon">▼</span>
        </div>
      </div>
    </div>

    <!-- 商品网格 -->
    <div class="product-grid">
      <div
        v-for="product in paginatedProducts"
        :key="product.id"
        class="product-card-link"
        @click="viewProductDetail(product)"
      >
        <div class="product-card">
          <div class="product-image-container">
            <img :src="product.image" :alt="product.name" class="product-image" loading="lazy" />
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-price">
              <span class="product-price-current">¥{{ product.price.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页控件 -->
    <div class="pagination-container">
      <button
        class="pagination-button"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        上一页
      </button>

      <div class="page-input-container">
        <input
          type="number"
          class="page-input"
          v-model.number="pageInput"
          @keyup.enter="goToInputPage"
          min="1"
          :max="totalPages"
        />
        <span class="page-info">/ {{ totalPages }} 页</span>
      </div>

      <button
        class="pagination-button"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import productData from '@/assets/商品信息.json'

const store = useStore()
const router = useRouter()

const products = ref([])
const originalProducts = ref([])
const sortOption = ref('default')
const currentPage = ref(1)
const pageInput = ref(1)
const itemsPerPage = 24

// 计算属性
const totalPages = computed(() => Math.ceil(products.value.length / itemsPerPage))
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return products.value.slice(start, end)
})

// 新增滚动到顶部函数
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

onMounted(() => {
  const processedProducts = productData.map((item, index) => {
    const sanitizedName = item.名字.replace(/[\\/*?:"<>|]/g, '').toLowerCase()
    const imageName = `${sanitizedName}1.jpg`
    const imagePath = `/src/assets/images/${imageName}`
    return {
      id: index + 1,
      name: item.名字,
      description: `商家：${item.商家} | 配送：${item.配送}`,
      price: item.卷后价格,
      image: imagePath,
      shop: item.商家,
    }
  })
  products.value = processedProducts
  originalProducts.value = [...processedProducts]
  sortProducts()
})

const sortProducts = () => {
  if (sortOption.value === 'default') {
    products.value = [...originalProducts.value]
  } else if (sortOption.value === 'asc') {
    products.value.sort((a, b) => a.price - b.price)
  } else if (sortOption.value === 'desc') {
    products.value.sort((a, b) => b.price - a.price)
  }
  // 重置到第一页
  currentPage.value = 1
  pageInput.value = 1
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    scrollToTop() // 翻页时也滚动到顶部
  }
}

const viewProductDetail = (product) => {
  // 添加浏览历史记录
  store.commit('addToHistory', {
    id: product.id,
    name: product.name,
    image: product.image,
    time: new Date().toISOString(),
    type: 'cultural',
    price: product.price,
    shop: product.shop,
  })

  // 先滚动到顶部再跳转
  scrollToTop()

  // 使用setTimeout确保滚动完成后再跳转
  setTimeout(() => {
    router.push(`/cultural/${product.id}`)
  }, 100)
}

const goToInputPage = () => {
  const page = parseInt(pageInput.value)
  if (!isNaN(page) && page >= 1 && page <= totalPages.value) {
    goToPage(page)
  } else {
    pageInput.value = currentPage.value
  }
}
</script>

<style scoped lang="scss">
.cultural-shop-container {
  width: 94%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 0;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 面包屑导航优化 */
.breadcrumb-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.breadcrumb {
  color: #666;
  font-size: 1rem;
  display: flex;
  align-items: center;
}

.breadcrumb-link {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: #c62f2f;
  }
}

.breadcrumb-separator {
  margin: 0 0.5rem;
  color: #999;
}

.breadcrumb-current {
  color: #c62f2f;
  font-weight: 500;
}

/* 自定义排序选择器 */
.sort-selector {
  display: flex;
  align-items: center;
}

.sort-label {
  color: #666;
  margin-right: 0.5rem;
  font-size: 0.95rem;
}

.custom-select {
  position: relative;
  width: 180px;

  select {
    width: 100%;
    padding: 0.5rem 1rem;
    padding-right: 2rem;
    border: 1px solid #ddd;
    border-radius: 20px;
    background-color: #fff;
    color: #333;
    font-size: 0.95rem;
    appearance: none;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

    &:focus {
      outline: none;
      border-color: #c62f2f;
      box-shadow: 0 0 0 2px rgba(198, 47, 47, 0.2);
    }
  }

  .select-icon {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    font-size: 0.6rem;
    color: #666;
  }
}

/* 商品网格布局 */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

/* 商品卡片样式 */
.product-card-link {
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);

    .product-card {
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
  }
}

.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-image-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 100%; /* 保持1:1比例 */
  overflow: hidden;
  background-color: #f8f8f8;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;

  .product-card-link:hover & {
    transform: scale(1.05);
  }
}

.product-info {
  padding: 1.2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  // -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  min-height: 2.8rem;
}

.product-description {
  font-size: 0.85rem;
  color: #888;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  // -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
  flex-grow: 1;
}

.product-price {
  margin-top: auto;
}

.product-price-current {
  color: #c62f2f;
  font-size: 1.3rem;
  font-weight: bold;
  letter-spacing: 0.5px;

  &::before {
    content: '¥';
    font-size: 0.9em;
    margin-right: 2px;
  }
}

/* 分页控件样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin: 2rem 0;
}

.pagination-button {
  padding: 0.5rem 1.5rem;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 20px;
  color: #333;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background-color: #f8f8f8;
    border-color: #c62f2f;
    color: #c62f2f;
  }

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
    opacity: 0.7;
  }
}

.page-input-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-input {
  width: 60px;
  padding: 0.5rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  text-align: center;
  font-size: 0.95rem;
  color: #333;

  /* 移除数字输入框的上下箭头 */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: null;
    margin: 0;
  }

  &:focus {
    outline: none;
    border-color: #c62f2f;
  }
}

.page-info {
  color: #666;
  font-size: 0.95rem;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .breadcrumb-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .sort-selector {
    width: 100%;

    .custom-select {
      width: 100%;
    }
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .product-info {
    padding: 1rem;
  }

  .product-name {
    font-size: 1rem;
    min-height: 2.4rem;
  }

  .pagination-container {
    gap: 1rem;
  }

  .pagination-button {
    padding: 0.5rem 1rem;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }

  .cultural-shop-container {
    width: 96%;
  }

  .pagination-container {
    flex-direction: column;
    gap: 0.8rem;
  }

  .page-input-container {
    order: -1;
  }
}
</style>
