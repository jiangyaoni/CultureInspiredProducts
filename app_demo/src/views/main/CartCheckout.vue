<template>
  <div class="cart-checkout-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <button class="back-button" @click="goBack">返回</button>
      您当前位置：
      <router-link to="/" class="breadcrumb-link">首页</router-link>
      <span class="breadcrumb-separator"> &gt; </span>
      <router-link to="/shopping" class="breadcrumb-link">购物车</router-link>
      <span class="breadcrumb-separator"> &gt; </span>
      <span class="breadcrumb-current">结算</span>
    </div>

    <!-- 地址信息 -->
    <div class="address-info card">
      <div class="address-select-wrapper">
        <div class="address-select">
          <select v-model="selectedAddressId" class="address-dropdown" data-test="address-select">
            <option
              v-for="address in addresses"
              :key="address.id"
              :value="address.id"
              :data-test="`address-option-${address.id}`"
            >
              {{ formatAddress(address) }}
            </option>
          </select>
          <button class="add-address-btn" @click="openAddAddressModal" data-test="add-address-btn">
            <i class="fa fa-plus"></i> 添加新地址
          </button>
        </div>
      </div>
    </div>

    <!-- 添加新地址模态框 -->
    <teleport to="body">
      <div v-if="showAddAddressModal" class="modal">
        <div class="modal-overlay" @click="closeAddAddressModal"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>添加新地址</h3>
            <button class="modal-close-btn" @click="closeAddAddressModal" aria-label="关闭">
              <i class="fa fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="input-group">
              <label for="receiver">收件人姓名：</label>
              <input
                id="receiver"
                v-model="newAddress.receiver"
                placeholder="例如：张三"
                data-test="receiver-input"
              />
            </div>
            <div class="input-group">
              <label for="phone">手机号：</label>
              <input
                id="phone"
                v-model="newAddress.phone"
                placeholder="例如：13800138000"
                data-test="phone-input"
              />
            </div>
            <div class="input-group">
              <label for="region">地区：</label>
              <input
                id="region"
                v-model="newAddress.region"
                placeholder="例如：北京市朝阳区"
                data-test="region-input"
              />
            </div>
            <div class="input-group">
              <label for="detail">详细地址：</label>
              <input
                id="detail"
                v-model="newAddress.detail"
                placeholder="例如：xxx 街 xxx 号"
                data-test="detail-input"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button
              class="btn btn-cancel"
              @click="closeAddAddressModal"
              data-test="cancel-address-btn"
            >
              取消
            </button>
            <button class="btn btn-confirm" @click="addNewAddress" data-test="confirm-address-btn">
              确定
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 商品列表 -->
    <div class="products-list card">
      <h3>购物车商品</h3>
      <div
        v-for="item in cartItems"
        :key="item.id"
        class="cart-item"
        :data-test="`cart-item-${item.id}`"
      >
        <div class="item-image">
          <img :src="item.image" :alt="item.name" loading="lazy" />
        </div>
        <div class="item-details">
          <h4 class="item-name">{{ item.name }}</h4>
          <p class="item-price">¥{{ item.price.toFixed(2) }}</p>
        </div>
        <div class="item-quantity">
          <span>数量：{{ item.quantity }}</span>
        </div>
        <div class="item-subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
      </div>
    </div>

    <!-- 留言和价格明细 -->
    <div class="main-content">
      <div class="left-content">
        <div class="message-section card">
          <h3>订单留言</h3>
          <textarea
            v-model="orderMessage"
            placeholder="请输入您的留言（选填）"
            class="message-input"
            data-test="order-message"
          ></textarea>
        </div>
      </div>

      <div class="right-content">
        <div class="price-detail card">
          <h3>价格明细</h3>
          <div class="price-item">
            <span>商品总价：</span>
            <span>¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <div class="price-item">
            <span>运费：</span>
            <span>¥0.00</span>
          </div>
          <div class="price-item total">
            <span>总计：</span>
            <span>¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <button
            class="confirm-purchase"
            @click="showPaymentModal = true"
            data-test="submit-order-btn"
          >
            <i class="fa fa-shopping-bag"></i> 提交订单
          </button>
        </div>
      </div>
    </div>

    <!-- 支付模态框 -->
    <teleport to="body">
      <div v-if="showPaymentModal" class="modal">
        <div class="modal-overlay" @click="closePaymentModal"></div>
        <div class="modal-content payment-modal">
          <div class="modal-header">
            <h3>订单支付</h3>
            <button class="modal-close-btn" @click="closePaymentModal" aria-label="关闭">
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
            <p class="payment-amount">应付金额：¥{{ totalPrice.toFixed(2) }}</p>
            <div class="payment-methods">
              <label>
                <input
                  type="radio"
                  v-model="selectedPaymentMethod"
                  value="alipay"
                  data-test="alipay-radio"
                />
                支付宝支付
              </label>
              <label>
                <input
                  type="radio"
                  v-model="selectedPaymentMethod"
                  value="wechat"
                  data-test="wechat-radio"
                />
                微信支付
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button
              class="btn btn-cancel"
              @click="handlePaymentCancel"
              data-test="cancel-payment-btn"
            >
              取消支付
            </button>
            <button
              class="btn btn-confirm"
              @click="handlePaymentConfirm"
              data-test="confirm-payment-btn"
            >
              确认支付
            </button>
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
            <button class="modal-close-btn" @click="closePaymentResult" aria-label="关闭">
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()

// 组件状态
const showAddAddressModal = ref(false)
const showPaymentModal = ref(false)
const showPaymentResult = ref(false)
const orderMessage = ref('')
const selectedPaymentMethod = ref('alipay')

const paymentResult = ref({
  status: 'success', // 'success' or 'fail'
  title: '',
  message: '',
  icon: '',
})

const newAddress = ref({
  receiver: '',
  phone: '',
  region: '',
  detail: '',
})

// 从Vuex获取数据
const cartItems = computed(() => store.getters.selectedCartItems)
const totalPrice = computed(() => store.getters.selectedCartTotalPrice)
const addresses = computed(() => store.state.addresses)
const selectedAddress = computed(() => store.getters.selectedAddress) // 添加这行

const selectedAddressId = computed({
  get: () => store.state.selectedAddressId,
  set: (value) => store.commit('selectAddress', value),
})

// 生命周期钩子
onMounted(() => {
  const defaultAddress = store.getters.defaultAddress
  if (defaultAddress?.id) {
    store.commit('selectAddress', defaultAddress.id)
  }
})

// 方法
const goBack = () => router.go(-1)

const closeAddAddressModal = () => {
  showAddAddressModal.value = false
  newAddress.value = { receiver: '', phone: '', region: '', detail: '' }
}

const openAddAddressModal = () => {
  newAddress.value = { receiver: '', phone: '', region: '', detail: '' }
  showAddAddressModal.value = true
}

const formatAddress = (address) => {
  return `${address.receiver} - ${address.phone} - ${address.region} - ${address.detail}`
}

const validateAddress = (address) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return (
    address.receiver?.trim() &&
    address.phone?.trim() &&
    phoneRegex.test(address.phone) &&
    address.region?.trim() &&
    address.detail?.trim()
  )
}

const addNewAddress = () => {
  if (!validateAddress(newAddress.value)) {
    alert('请填写完整且有效的地址信息')
    return
  }

  store.commit('addAddress', { ...newAddress.value })
  closeAddAddressModal()
}

const closePaymentModal = () => {
  showPaymentModal.value = false
}

const generateOrderNo = () => {
  const now = new Date()
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')

  const timePart = [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('')

  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')

  return `${datePart}${timePart}${randomPart}`
}

const createOrder = (paymentStatus) => {
  const now = new Date()

  return {
    id: Date.now(),
    orderNo: generateOrderNo(),
    status: paymentStatus === 'success' ? 1 : 0, // 0: 待付款, 1: 待发货
    createTime: now.toISOString(),
    payTime: paymentStatus === 'success' ? now.toISOString() : '',
    deliverTime: '',
    receiveTime: '',
    totalAmount: totalPrice.value,
    shippingAddress: { ...selectedAddress.value },
    paymentMethod: selectedPaymentMethod.value,
    orderMessage: orderMessage.value,
    products: cartItems.value.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      spec: item.spec || '默认规格',
    })),
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

    // 支付成功后清理
    store.commit('removeSelectedCartItems')
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

// 处理支付取消
const handlePaymentCancel = () => {
  // 创建订单（取消支付，状态为待付款）
  const order = createOrder('cancel')
  store.commit('addOrder', order)
  showPaymentModal.value = false

  // 直接跳转到支付结果页面
  router.push(`/order/${order.id}/payment-result`)
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
$warning-color: #ffc107;

// 基础样式
.cart-checkout-container {
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
    transition: background-color 0.2s;

    &:hover {
      background-color: color.adjust($secondary-color, $lightness: -10%);
    }
  }

  .breadcrumb-link {
    color: $secondary-color;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      text-decoration: underline;
      color: color.adjust($secondary-color, $lightness: -15%);
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
  box-shadow: 0 2px 8px $shadow-color;
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
      transition: border-color 0.2s;

      &:focus {
        outline: none;
        border-color: $secondary-color;
        box-shadow: 0 0 0 2px rgba($secondary-color, 0.2);
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
      transition: background-color 0.2s;

      i {
        margin-right: 0.5rem;
      }

      &:hover {
        background-color: color.adjust($secondary-color, $lightness: -10%);
      }
    }
  }
}

// 商品列表
.products-list {
  h3 {
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid $border-color;
  }
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid $border-color;

  &:last-child {
    border-bottom: none;
  }
}

.item-image {
  width: 80px;
  height: 80px;
  margin-right: 1rem;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }
}

.item-details {
  flex: 2;
  margin-right: 1rem;

  .item-name {
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: $text-color;
  }

  .item-price {
    color: $primary-color;
    font-weight: 600;
  }
}

.item-quantity {
  flex: 1;
  font-size: 0.875rem;
  color: $sub-text-color;
}

.item-subtotal {
  flex: 1;
  text-align: right;
  font-weight: 600;
  color: $primary-color;
  font-size: 1.1rem;
}

// 主要内容区域
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

// 留言区域
.message-section {
  h3 {
    margin-bottom: 1rem;
    color: $text-color;
  }

  .message-input {
    width: 100%;
    min-height: 120px;
    padding: 0.75rem;
    border: 1px solid $border-color;
    border-radius: 4px;
    font-size: 0.875rem;
    resize: vertical;
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

    &.error {
      border-color: $error-color;
    }
  }

  .error-message {
    color: $error-color;
    font-size: 0.75rem;
    margin-top: 0.25rem;
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

    &:disabled {
      background-color: color.adjust($primary-color, $lightness: +30%);
      cursor: not-allowed;
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
  .cart-checkout-container {
    width: 95%;
    padding: 1rem;
  }

  .main-content {
    flex-direction: column;
  }

  .cart-item {
    flex-wrap: wrap;
    position: relative;
  }

  .item-image {
    width: 60px;
    height: 60px;
  }

  .item-details {
    flex: 1;
    margin-right: 0.5rem;
  }

  .item-quantity {
    order: 3;
    width: 100%;
    margin-top: 1rem;
  }

  .item-subtotal {
    order: 2;
    flex: none;
    width: auto;
    margin-right: 0.5rem;
    font-size: 1rem;
  }

  .modal-content {
    width: 95%;
  }
}
</style>
