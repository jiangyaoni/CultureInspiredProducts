<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()
const router = useRouter()

// 定义组件名称
defineOptions({
  name: 'ShoppingCart',
})

// 使用Vuex中的购物车数据
const cartItems = computed(() => store.state.cartItems)
// 修改：只计算选中商品的总价和数量
const totalPrice = computed(() => {
  return cartItems.value
    .filter((item) => item.selected)
    .reduce((total, item) => total + item.price * item.quantity, 0)
})
const totalItems = computed(() => {
  return cartItems.value
    .filter((item) => item.selected)
    .reduce((total, item) => total + item.quantity, 0)
})

// 增加商品数量
const increaseQuantity = (item) => {
  store.commit('updateCartItemQuantity', {
    id: item.id,
    quantity: item.quantity + 1,
  })
}

// 减少商品数量
const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    store.commit('updateCartItemQuantity', {
      id: item.id,
      quantity: item.quantity - 1,
    })
  }
}

// 删除商品
const removeItem = (id) => {
  store.commit('removeCartItem', id)
}

// 清空购物车
const clearCart = () => {
  store.commit('clearCart')
}

// 跳转到商品详情页
const goToProductDetail = (id) => {
  const item = cartItems.value.find((item) => item.id === id)
  if (item) {
    // 添加浏览历史记录
    store.commit('addToHistory', {
      id: item.id,
      name: item.name,
      image: item.image,
      time: new Date().toISOString(),
      type: 'cultural', // 购物车中的都是文创商品
      price: item.price,
      shop: item.shop || '未知商家',
    })
  }

  router.push(`/cultural/${id}`)
}

// 跳转到结算页
const goToCheckout = () => {
  const selectedItems = cartItems.value.filter((item) => item.selected)
  if (selectedItems.length === 0) {
    alert('请选择要结算的商品')
    return
  }
  router.push('/shopping/checkout')
}

const isAllSelected = computed(() => {
  if (cartItems.value.length === 0) return false
  return cartItems.value.every((item) => item.selected)
})

// 更新商品选择状态
const updateItemSelection = (item) => {
  store.commit('updateCartItemSelected', {
    id: item.id,
    selected: item.selected,
  })
}

// 全选/取消全选
const toggleSelectAll = () => {
  store.commit('toggleAllCartItemsSelected', !isAllSelected.value)
}

// 删除选中商品
const deleteSelectedItems = () => {
  store.commit('removeSelectedCartItems')
}
</script>

<template>
  <div class="shopping-cart">
    <div class="cart-header">
      <h1 class="cart-title">🛒 我的购物车</h1>
      <p class="cart-subtitle">共 {{ totalItems }} 件商品</p>
    </div>

    <div class="cart-container">
      <!-- 购物车为空时显示 -->

      <!-- 全选功能 -->
      <div class="cart-select-all" v-if="cartItems.length > 0">
        <label class="select-all-label">
          <input
            type="checkbox"
            :checked="isAllSelected"
            @change="toggleSelectAll"
            data-test="select-all-checkbox"
          />
          全选
        </label>
        <button
          class="delete-selected-btn"
          @click="deleteSelectedItems"
          data-test="delete-selected-btn"
        >
          删除选中
        </button>
      </div>
      <div v-if="cartItems.length === 0" class="empty-cart">
        <p class="empty-cart-text">您的购物车还没有商品</p>
        <router-link to="/cultural" class="go-shopping-btn">去逛逛</router-link>
      </div>

      <!-- 购物车有商品时显示 -->
      <div v-else class="cart-content">
        <!-- 可滚动的商品列表区域 -->
        <div class="cart-items-scrollable">
          <div class="cart-items">
            <div v-for="item in cartItems" :key="item.id" class="cart-item">
              <!-- 添加勾选框 -->
              <div class="item-checkbox">
                <input
                  type="checkbox"
                  v-model="item.selected"
                  @change="updateItemSelection(item)"
                  :data-test="`item-checkbox-${item.id}`"
                />
              </div>
              <div class="item-image" @click="goToProductDetail(item.id)">
                <img :src="item.image" :alt="item.name" />
              </div>
              <div class="item-details" @click="goToProductDetail(item.id)">
                <h3 class="item-name">{{ item.name }}</h3>
                <p class="item-price">¥{{ item.price.toFixed(2) }}</p>
              </div>
              <div class="item-quantity">
                <button
                  class="quantity-btn minus"
                  @click.stop="decreaseQuantity(item)"
                  :disabled="item.quantity <= 1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z" />
                  </svg>
                </button>
                <input
                  type="number"
                  class="quantity-input"
                  v-model.number="item.quantity"
                  min="1"
                  readonly
                />
                <button class="quantity-btn plus" @click.stop="increaseQuantity(item)">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
                    />
                  </svg>
                </button>
              </div>
              <div class="item-subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
              <button class="delete-btn" @click.stop="removeItem(item.id)" title="删除商品">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 极 0 0 0 1 0V6z"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0  1-2-2V4h-.5a1 1 极 0 0 1-1-1V2a1 1 0 0 极 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059极13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-header">
            <h3>订单摘要</h3>
          </div>
          <div class="summary-body">
            <div class="summary-row">
              <span class="summary-label">商品总数:</span>
              <span class="summary-value">{{ totalItems }} 件</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">商品总价:</span>
              <span class="summary-value">¥{{ totalPrice.toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">运费:</span>
              <span class="summary-value">¥0.00</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">优惠减免:</span>
              <span class="summary-value">-¥0.00</span>
            </div>
            <div class="summary-row total">
              <span class="summary-label">应付总额:</span>
              <span class="summary-value">¥{{ totalPrice.toFixed(2) }}</span>
            </div>
          </div>
          <div class="summary-actions">
            <button class="checkout-btn" @click="goToCheckout">去结算</button>
            <button class="clear-cart-btn" @click="clearCart">清空购物车</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 基础样式 */
:root {
  --primary-color: #3a86ff;
  --primary-hover: #2a6bd9;
  --danger-color: #ff4d4f;
  --danger-hover: #e04244;
  --success-color: #52c41a;
  --success-hover: #3e9b15;
  --text-color: #333;
  --text-secondary: #666;
  --text-light: #999;
  --border-color: #e8e8e8;
  --bg-color: #f8f9fa;
  --bg-light: #f5f7fa;
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  --transition: all 0.3s ease;
  --radius: 8px;
  --radius-lg: 12px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.shopping-cart {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  color: var(--text-color);
  min-height: 80vh;
}

/* 头部样式 */
.cart-header {
  margin-bottom: 2rem;
  text-align: center;
}

.cart-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.cart-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
}

/* 购物车容器 */
.cart-container {
  background-color: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
}

/* 空购物车样式 */
.empty-cart {
  padding: 3rem 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-cart-text {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.go-shopping-btn {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #3a86ff, #2a6bd9);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 500;
  transition: var(--transition);
  box-shadow: 0 4px 6px rgba(58, 134, 255, 0.2);
}

.go-shopping-btn:hover {
  background: linear-gradient(135deg, #2a6bd9, #1d56b8);
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(58, 134, 255, 0.3);
}

/* 有商品的购物车样式 */
.cart-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

@media (min-width: 992px) {
  .cart-content {
    flex-direction: row;
    min-height: 500px;
  }

  /* 可滚动商品列表区域 - 增强样式 */
  .cart-items-scrollable {
    flex: 2;
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 500px; /* 固定高度 */
  }

  .cart-items {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    scrollbar-width: thin;
    scrollbar-color: var(--primary-color) var(--border-color);
    max-height: 100%; /* 确保不会超出父容器 */
  }

  /* 自定义滚动条样式 - Webkit浏览器 */
  .cart-items::-webkit-scrollbar {
    width: 8px;
  }
  .cart-items::-webkit-scrollbar-track {
    background: var(--border-color);
    border-radius: 4px;
  }
  .cart-items::-webkit-scrollbar-thumb {
    background-color: var(--primary-color);
    border-radius: 4px;
    border: 2px solid var(--border-color);
  }

  .cart-summary {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

/* 移动设备样式 - 商品列表单独滚动 */
@media (max-width: 991px) {
  .cart-items-scrollable {
    max-height: 60vh;
    overflow-y: auto;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    scrollbar-width: thin;
    scrollbar-color: var(--primary-color) var(--border-color);
  }

  .cart-items-scrollable::-webkit-scrollbar {
    width: 6px;
  }
  .cart-items-scrollable::-webkit-scrollbar-track {
    background: var(--border-color);
    border-radius: 3px;
  }
  .cart-items-scrollable::-webkit-scrollbar-thumb {
    background-color: var(--primary-color);
    border-radius: 3px;
    border: 1px solid var(--border-color);
  }

  .cart-items {
    padding: 0 1.5rem 1.5rem;
  }

  .cart-summary {
    padding: 0 1.5rem;
  }
}

/* 商品列表样式 */
.cart-item {
  display: flex;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
  transition: var(--transition);
  position: relative;
}

.cart-item:first-child {
  padding-top: 0;
}

.cart-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.cart-item:hover {
  background-color: rgba(58, 134, 255, 0.05);
}

.item-image {
  width: 80px;
  height: 80px;
  margin-right: 1rem;
  flex-shrink: 0;
  cursor: pointer;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius);
  transition: var(--transition);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cart-item:hover .item-image img {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(58, 134, 255, 0.2);
}

.item-details {
  flex: 2;
  margin-right: 1rem;
  cursor: pointer;
  min-width: 0; /* 允许文本溢出时省略 */
}

.item-name {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  transition: var(--transition);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item:hover .item-name {
  color: var(--primary-color);
}

.item-price {
  font-size: 0.9rem;
  color: var(--primary-color);
  font-weight: 600;
}

.item-quantity {
  display: flex;
  align-items: center;
  margin-right: 1rem;
}

.quantity-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-color);
  background-color: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  color: var(--text-color);
}

.quantity-btn:hover:not(:disabled) {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input {
  width: 40px;
  height: 28px;
  text-align: center;
  border: 1px solid var(--border-color);
  margin: 0 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: #fff;
}

.item-subtotal {
  flex: 1;
  text-align: center;
  font-weight: 600;
  color: var(--primary-color);
  font-size: 1.1rem;
  min-width: 80px;
}

.delete-btn {
  border: none;
  background: none;
  color: var(--text-light);
  cursor: pointer;
  transition: var(--transition);
  padding: 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
}

.delete-btn:hover {
  color: var(--danger-color);
  background-color: rgba(255, 77, 79, 0.1);
}

/* 勾选框及全选样式 */
.item-checkbox {
  margin-right: 1rem;
  display: flex;
  align-items: center;
}

.item-checkbox input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* 全选区域样式 */
.cart-select-all {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f9f9f9;
  border-bottom: 1px solid var(--border-color);
}

.select-all-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.95rem;
}

.select-all-label input[type='checkbox'] {
  margin-right: 0.5rem;
  width: 18px;
  height: 18px;
}

.delete-selected-btn {
  padding: 0.5rem 1rem;
  background-color: var(--danger-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: var(--transition);
}

.delete-selected-btn:hover {
  background-color: var(--danger-hover);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .item-checkbox {
    position: absolute;
    left: 0;
    top: 1rem;
  }

  .cart-select-all {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}

/* 购物车汇总区域 */
.cart-summary {
  padding: 1.5rem;
  background-color: var(--bg-light);
  display: flex;
  flex-direction: column;
}

.summary-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.summary-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
}

.summary-body {
  flex: 1;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  font-size: 0.95rem;
}

.summary-row.total {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  font-size: 1.1rem;
  font-weight: 600;
}

.summary-label {
  color: var(--text-secondary);
}

.summary-value {
  color: var(--text-color);
  font-weight: 500;
}

.total .summary-label {
  color: var(--text-color);
  font-weight: 600;
}

.total .summary-value {
  color: var(--primary-color);
  font-size: 1.5rem;
  font-weight: 700;
}

.summary-actions {
  margin-top: 1.5rem;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #3a86ff, #2a6bd9);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 4px 6px rgba(58, 134, 255, 0.2);
  margin-bottom: 0.8rem;
}

.checkout-btn:hover {
  background: linear-gradient(135deg, #2a6bd9, #1d56b8);
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(58, 134, 255, 0.3);
}

.clear-cart-btn {
  width: 100%;
  padding: 0.8rem;
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 50px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
}

.clear-cart-btn:hover {
  background-color: rgba(255, 77, 79, 0.05);
  color: var(--danger-color);
  border-color: var(--danger-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .shopping-cart {
    padding: 1rem;
  }

  .cart-header {
    text-align: left;
  }

  .cart-title {
    font-size: 1.5rem;
    justify-content: flex-start;
  }

  .cart-item {
    flex-wrap: wrap;
    position: relative;
    padding: 1rem 0;
  }

  .item-image {
    width: 60px;
    height: 60px;
  }

  .item-details {
    flex: 1;
    margin-right: 0.5rem;
  }

  .item-name {
    font-size: 0.95rem;
  }

  .item-quantity {
    order: 3;
    width: 100%;
    margin-top: 1rem;
    justify-content: center;
  }

  .item-subtotal {
    order: 2;
    flex: none;
    width: auto;
    margin-right: 0.5rem;
    font-size: 1rem;
    min-width: auto;
  }

  .delete-btn {
    position: absolute;
    right: 0;
    top: 1rem;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cart-item {
  animation: fadeIn 0.4s ease-out forwards;
}

.cart-item:nth-child(1) {
  animation-delay: 0.1s;
}
.cart-item:nth-child(2) {
  animation-delay: 0.2s;
}
.cart-item:nth-child(3) {
  animation-delay: 0.3s;
}
</style>
