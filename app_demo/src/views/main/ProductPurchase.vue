<template>
  <div class="product-purchase-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <button class="back-button" @click="goBack">返回</button>
      您当前位置：
      <router-link to="/" class="breadcrumb-link">首页</router-link>
      <span class="breadcrumb-separator"> > </span>
      <router-link to="/cultural" class="breadcrumb-link">文创商城</router-link>
      <span class="breadcrumb-separator"> > </span>
      <router-link v-if="product.name" class="breadcrumb-link" :to="`/product/${product.id}`">
        {{ product.name.slice(0, 15) }}...
      </router-link>
      <span v-else class="breadcrumb-current">商品信息加载中...</span>
      <span class="breadcrumb-separator"> > </span>
      <span class="breadcrumb-current">订单提交</span>
    </div>

    <!-- 地址信息 -->
    <div class="address-info card">
      <div class="address-select-wrapper">
        <div class="address-select">
          <select v-model="selectedAddressId" class="address-dropdown">
            <option v-for="address in addresses" :key="address.id" :value="address.id">
              {{ address.receiver }} - {{ address.phone }} - {{ address.region }} -
              {{ address.detail }}
            </option>
          </select>
          <button class="add-address-btn" @click="openAddAddressModal">
            <i class="fa fa-plus"></i> 添加新地址
          </button>
        </div>
      </div>
    </div>

    <!-- 添加新地址模态框 -->
    <teleport to="body">
      <div v-if="showAddAddressModal" class="modal">
        <div class="modal-overlay" @click="showAddAddressModal = false"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>添加新地址</h3>
            <button class="modal-close-btn" @click="showAddAddressModal = false">
              <i class="fa fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="input-group">
              <label>收件人姓名：</label>
              <input v-model="newAddress.receiver" placeholder="例如：张三" />
            </div>
            <div class="input-group">
              <label>手机号：</label>
              <input v-model="newAddress.phone" placeholder="例如：13800138000" />
            </div>
            <div class="input-group">
              <label>地区：</label>
              <input v-model="newAddress.region" placeholder="例如：北京市朝阳区" />
            </div>
            <div class="input-group">
              <label>详细地址：</label>
              <input v-model="newAddress.detail" placeholder="例如：xxx 街 xxx 号" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-cancel" @click="showAddAddressModal = false">取消</button>
            <button class="btn btn-confirm" @click="addNewAddress">确定</button>
          </div>
        </div>
      </div>
    </teleport>

    <div class="main-content">
      <!-- 商品信息和服务信息 -->
      <div class="left-content">
        <div v-if="product.name" class="product-info card">
          <div class="product-main">
            <img :src="product.image" alt="商品图片" class="product-image" />
            <div class="service-info">
              <div class="service-list">
                <p class="service-item"><i class="fa fa-check-circle"></i> 支持 7 天无理由退货</p>
                <p class="service-item"><i class="fa fa-check-circle"></i> 免费配送</p>
              </div>
            </div>
          </div>
          <div class="product-info-wrapper">
            <div class="product-info-header">
              <h2>{{ product.name }}</h2>
              <p class="product-price">
                <span class="price-symbol">¥</span>
                {{ product.price ? product.price.toFixed(2) : '0.00' }}
              </p>
            </div>
            <div class="product-info-details">
              <p class="info-item">
                <span>数量：</span>
                <button @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
                <input type="number" v-model="quantity" min="1" />
                <button @click="increaseQuantity">+</button>
                <span class="total-price-in-item">
                  总价：¥{{ (product.price * quantity).toFixed(2) }}
                </span>
              </p>
              <p class="info-item"><i class="fa fa-user"></i>&nbsp;&nbsp;{{ product.merchant }}</p>
              <p class="info-item"><i class="fa fa-truck"></i> {{ product.delivery }}</p>
              <p class="info-item">
                <span>留言：</span>
                <textarea
                  v-model="orderMessage"
                  placeholder="请输入您的留言（选填）"
                  class="message-input"
                ></textarea>
              </p>
            </div>
          </div>
        </div>
        <p v-else class="loading-text"><i class="fa fa-spinner fa-spin"></i> 商品信息加载中...</p>
      </div>

      <!-- 价格明细和提交订单 -->
      <div class="right-content">
        <div class="price-detail card">
          <h3>价格明细</h3>
          <div class="price-item">
            <span>商品单价：</span>
            <span>¥{{ product.price ? product.price.toFixed(2) : '0.00' }}</span>
          </div>
          <div class="price-item">
            <span>商品数量：</span>
            <span>{{ quantity }}</span>
          </div>
          <div class="price-item">
            <span>商品总价：</span>
            <span>¥{{ (product.price * quantity).toFixed(2) }}</span>
          </div>
          <div class="price-item">
            <span>运费：</span>
            <span>¥0.00</span>
          </div>
          <div class="price-item total">
            <span>总计：</span>
            <span>¥{{ (product.price * quantity).toFixed(2) }}</span>
          </div>
          <button v-if="product.name" class="confirm-purchase" @click="showPaymentModal = true">
            <i class="fa fa-shopping-bag"></i> 提交订单
          </button>
        </div>
      </div>
    </div>

    <!-- 支付模态框 -->
    <teleport to="body">
      <div v-if="showPaymentModal" class="modal">
        <div class="modal-overlay" @click="showPaymentModal = false"></div>
        <div class="modal-content payment-modal">
          <div class="modal-header">
            <h3>订单支付</h3>
            <button class="modal-close-btn" @click="showPaymentModal = false">
              <i class="fa fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <img
              v-if="selectedPaymentMethod === 'alipay'"
              src="@/assets/payment/支付宝到账一百亿元.png"
              alt="支付宝支付"
              class="payment-image"
            />
            <img
              v-if="selectedPaymentMethod === 'wechat'"
              src="@/assets/payment/微信到账一百亿元.png"
              alt="微信支付"
              class="payment-image"
            />
            <p class="payment-amount">应付金额：¥{{ (product.price * quantity).toFixed(2) }}</p>
            <div class="payment-methods">
              <label>
                <input type="radio" v-model="selectedPaymentMethod" value="alipay" /> 支付宝支付
              </label>
              <label>
                <input type="radio" v-model="selectedPaymentMethod" value="wechat" /> 微信支付
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-cancel" @click="handlePaymentCancel">取消支付</button>
            <button class="btn btn-confirm" @click="handlePaymentConfirm">确认支付</button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 支付结果提示 -->
    <teleport to="body">
      <div v-if="showPaymentResult" class="modal">
        <div class="modal-overlay" @click="closePaymentResult"></div>
        <div class="modal-content payment-result-modal">
          <div class="modal-header">
            <h3>{{ paymentResult.title }}</h3>
            <button class="modal-close-btn" @click="closePaymentResult">
              <i class="fa fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="payment-result-icon" :class="paymentResult.status">
              <i :class="paymentResult.icon"></i>
            </div>
            <p class="payment-result-message">{{ paymentResult.message }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-confirm" @click="closePaymentResult">确定</button>
          </div>
        </div>
      </div>
    </teleport>
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
const quantity = ref(1)
const orderMessage = ref('')
const showPaymentModal = ref(false)
const showPaymentResult = ref(false)
const selectedPaymentMethod = ref('alipay')

const paymentResult = ref({
  status: 'success', // 'success' or 'fail'
  title: '',
  message: '',
  icon: '',
})

// 使用 Vuex 中的地址数据
const addresses = computed(() => store.state.addresses)
const selectedAddressId = computed({
  get: () => store.state.selectedAddressId,
  set: (value) => store.commit('selectAddress', value),
})
const selectedAddress = computed(() => store.getters.selectedAddress)

onMounted(() => {
  const defaultAddress = store.getters.defaultAddress
  if (defaultAddress?.id) {
    store.commit('selectAddress', defaultAddress.id)
  }

  try {
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
      }
    })
    const foundProduct = processedProducts.find((p) => p.id === productId)
    product.value = foundProduct || {}
  } catch (error) {
    console.error('加载商品信息出错:', error)
  }
})

const goBack = () => {
  router.go(-1)
}

const showAddAddressModal = ref(false)
const newAddress = ref({
  receiver: '',
  phone: '',
  region: '',
  detail: '',
})

const openAddAddressModal = () => {
  newAddress.value = { receiver: '', phone: '', region: '', detail: '' }
  showAddAddressModal.value = true
}

const addNewAddress = () => {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (
    !newAddress.value.receiver ||
    !newAddress.value.phone ||
    !newAddress.value.region ||
    !newAddress.value.detail
  ) {
    alert('请填写完整的地址信息')
    return
  }
  if (!phoneRegex.test(newAddress.value.phone)) {
    alert('请输入有效的手机号')
    return
  }

  // 提交到 Vuex
  store.commit('addAddress', newAddress.value)
  newAddress.value = { receiver: '', phone: '', region: '', detail: '' }
  showAddAddressModal.value = false
}

// 生成订单号
const generateOrderNo = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')

  return `${year}${month}${day}${hours}${minutes}${seconds}${random}`
}

// 创建订单
const createOrder = (paymentStatus) => {
  const orderId = Date.now() // 使用时间戳作为订单ID
  const orderNo = generateOrderNo()
  const now = new Date().toISOString()

  return {
    id: orderId,
    orderNo: orderNo,
    status: paymentStatus === 'success' ? 1 : 0, // 1:待发货, 0:待付款
    createTime: now,
    payTime: paymentStatus === 'success' ? now : '',
    deliverTime: '',
    receiveTime: '',
    totalAmount: product.value.price * quantity.value,
    shippingAddress: { ...selectedAddress.value },
    paymentMethod: selectedPaymentMethod.value,
    orderMessage: orderMessage.value,
    products: [
      {
        id: product.value.id,
        name: product.value.name,
        price: product.value.price,
        quantity: quantity.value,
        image: product.value.image,
        spec: product.value.spec || '默认规格',
      },
    ],
  }
}

// 处理支付确认
const handlePaymentConfirm = async () => {
  if (!selectedAddress.value) {
    showPaymentResult.value = true
    paymentResult.value = {
      status: 'fail',
      title: '支付失败',
      message: '请选择收货地址',
      icon: 'fa fa-times-circle',
    }
    showPaymentModal.value = false
    return
  }
  if (!selectedPaymentMethod.value) {
    showPaymentResult.value = true
    paymentResult.value = {
      status: 'fail',
      title: '支付失败',
      message: '请选择支付方式',
      icon: 'fa fa-times-circle',
    }
    showPaymentModal.value = false
    return
  }
  try {
    // 创建订单（成功支付状态）
    const order = createOrder('success')
    store.commit('addOrder', order)

    showPaymentModal.value = false

    // 直接跳转到支付结果页面
    router.push(`/order/${order.id}/payment-result`)
  } catch (error) {
    console.error('支付失败:', error)
    // 创建失败状态的订单
    const order = createOrder('fail')
    store.commit('addOrder', order)
    router.push(`/order/${order.id}/payment-result`)
  }
}

// 修改 handlePaymentCancel 方法
const handlePaymentCancel = () => {
  // 创建订单（取消支付，状态为待付款）
  const order = createOrder('cancel')
  store.commit('addOrder', order)
  showPaymentModal.value = false

  // 直接跳转到支付结果页面
  router.push(`/order/${order.id}/payment-result`)
}

const decreaseQuantity = () => {
  if (quantity.value > 1) quantity.value--
}

const increaseQuantity = () => {
  quantity.value++
}
</script>

<style scoped lang="scss">
@use 'sass:color';

// 颜色变量
$primary-color: #28a745;
$secondary-color: #007bff;
$background-color: #f5f7fa;
$card-background: #ffffff;
$text-color: #333333;
$sub-text-color: #6c757d;
$border-color: #e0e0e0;
$shadow-color: rgba(0, 0, 0, 0.1);
$error-color: #dc3545;
$success-color: #28a745;

// 基础样式
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.product-purchase-container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: $background-color;
  border-radius: 8px;
}

// 面包屑导航
.breadcrumb {
  color: $sub-text-color;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;

  .back-button {
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    background-color: $secondary-color;
    color: white;
    margin-right: 1rem;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: color.adjust($secondary-color, $lightness: -10%);
    }
  }

  .breadcrumb-link {
    color: $secondary-color;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      text-decoration: underline;
    }
  }

  .breadcrumb-separator {
    color: #ccc;
  }

  .breadcrumb-current {
    font-weight: 500;
    color: $text-color;
  }
}

// 卡片样式
.card {
  background-color: $card-background;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

// 地址信息
.address-info {
  .address-select {
    display: flex;
    gap: 1rem;
    align-items: center;

    .address-dropdown {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid $border-color;
      border-radius: 4px;
      font-size: 0.875rem;
      background-color: #fff;
      transition: border-color 0.2s ease;

      &:focus {
        outline: none;
        border-color: $secondary-color;
      }
    }

    .add-address-btn {
      border: none;
      border-radius: 4px;
      padding: 0.75rem 1rem;
      cursor: pointer;
      background-color: $secondary-color;
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;

      i {
        margin-right: 0.5rem;
      }

      &:hover {
        background-color: color.adjust($secondary-color, $lightness: -10%);
      }
    }
  }
}

// 主要布局
.main-content {
  display: flex;
  gap: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.left-content {
  flex: 2;
}

.right-content {
  flex: 1;
}

// 商品信息
.product-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .product-main {
    display: flex;
    gap: 1rem;

    .product-image {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: 4px;
    }

    .service-info {
      flex: 1;

      .service-list {
        .service-item {
          margin-bottom: 0.5rem;
          color: $sub-text-color;
          font-size: 0.875rem;

          i {
            color: $success-color;
            margin-right: 0.5rem;
          }
        }
      }
    }
  }

  .product-info-wrapper {
    .product-info-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;

      h2 {
        font-size: 1.25rem;
        color: $text-color;
        margin: 0;
      }

      .product-price {
        font-size: 1.5rem;
        font-weight: bold;
        color: $primary-color;
        margin: 0;

        .price-symbol {
          font-size: 1rem;
        }
      }
    }

    .product-info-details {
      .info-item {
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        flex-wrap: wrap;

        span:first-child {
          font-weight: 500;
          margin-right: 0.5rem;
          min-width: 60px;
        }

        button {
          width: 30px;
          height: 30px;
          border: 1px solid $border-color;
          background-color: #fff;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }

        input[type='number'] {
          width: 50px;
          height: 30px;
          text-align: center;
          border: 1px solid $border-color;
          border-radius: 4px;
          margin: 0 0.5rem;
        }

        .total-price-in-item {
          margin-left: 1rem;
          font-weight: bold;
          color: $primary-color;
        }

        i {
          color: $sub-text-color;
          margin-right: 0.5rem;
        }

        .message-input {
          flex: 1;
          min-height: 80px;
          padding: 0.5rem;
          border: 1px solid $border-color;
          border-radius: 4px;
          resize: vertical;
          font-family: inherit;
        }
      }
    }
  }
}

.loading-text {
  text-align: center;
  padding: 2rem;
  color: $sub-text-color;

  i {
    margin-right: 0.5rem;
  }
}

// 价格明细
.price-detail {
  h3 {
    font-size: 1.125rem;
    margin-bottom: 1rem;
    color: $text-color;
  }

  .price-item {
    display: flex;
    justify-content: space-between;
    margin: 0.75rem 0;
    font-size: 0.875rem;
    color: $text-color;

    &.total {
      font-weight: bold;
      font-size: 1rem;
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid $border-color;
      color: $primary-color;
    }
  }

  .confirm-purchase {
    border: none;
    border-radius: 4px;
    padding: 0.75rem;
    width: 100%;
    margin-top: 1.5rem;
    background-color: $primary-color;
    color: white;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;

    i {
      margin-right: 0.5rem;
    }

    &:hover {
      background-color: color.adjust($primary-color, $lightness: -10%);
    }

    &:disabled {
      background-color: color.adjust($primary-color, $lightness: +30%);
      cursor: not-allowed;
    }
  }
}

// 模态框样式
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background-color: $card-background;
  border-radius: 8px;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: modalFadeIn 0.3s ease-out;
}

.modal-header {
  padding: 1.25rem;
  border-bottom: 1px solid $border-color;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1.125rem;
    color: $text-color;
  }
}

.modal-close-btn {
  border: none;
  background-color: transparent;
  color: $sub-text-color;
  padding: 0.25rem;
  cursor: pointer;
  font-size: 1.2rem;
  transition: color 0.2s;

  &:hover {
    color: $text-color;
  }
}

.modal-body {
  padding: 1.25rem;
}

.input-group {
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    color: $text-color;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid $border-color;
    border-radius: 4px;
    font-size: 0.875rem;
    color: $text-color;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: $secondary-color;
      box-shadow: 0 0 0 2px rgba($secondary-color, 0.2);
    }

    &::placeholder {
      color: #aaa;
    }
  }
}

.modal-footer {
  padding: 1.25rem;
  border-top: 1px solid $border-color;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.25rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &-cancel {
    background-color: #f8f9fa;
    color: $text-color;
    border: 1px solid $border-color;

    &:hover {
      background-color: color.adjust(#f8f9fa, $lightness: -5%);
    }
  }

  &-confirm {
    background-color: $primary-color;
    color: white;

    &:hover {
      background-color: color.adjust($primary-color, $lightness: -10%);
    }
  }
}

// 支付模态框特定样式
.payment-modal {
  .payment-image {
    width: 60%;
    max-height: 200px;
    object-fit: contain;
    margin: 0 auto 1rem;
    display: block;
    border-radius: 4px;
    border: 1px solid $border-color;
  }

  .payment-amount {
    text-align: center;
    font-size: 1.125rem;
    font-weight: bold;
    color: $primary-color;
    margin: 1rem 0;
  }

  .payment-methods {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 1.5rem;

    label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 0.875rem;
      color: $text-color;

      input[type='radio'] {
        margin-right: 0.5rem;
      }
    }
  }
}

// 支付结果模态框样式
.payment-result-modal {
  text-align: center;

  .payment-result-icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;

    &.success {
      color: $success-color;
    }

    &.fail {
      color: $error-color;
    }
  }

  .payment-result-message {
    font-size: 1.125rem;
    margin-bottom: 1.5rem;
    color: $text-color;
  }
}

// 动画
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式调整
@media (max-width: 768px) {
  .product-purchase-container {
    width: 95%;
    padding: 1rem;
  }

  .main-content {
    flex-direction: column;
  }

  .product-info {
    .product-main {
      flex-direction: column;
    }
  }

  .modal-content {
    width: 95%;
  }
}
</style>
