<template>
  <div class="payment-result-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <button class="back-button" @click="goBack">返回</button>
      您当前位置：
      <router-link to="/" class="breadcrumb-link">首页</router-link>
      <span class="breadcrumb-separator"> &gt; </span>
      <router-link to="/personal" class="breadcrumb-link">个人中心</router-link>
      <span class="breadcrumb-separator"> &gt; </span>
      <span class="breadcrumb-current">支付详情</span>
    </div>

    <div v-if="orderDetail.id" class="payment-result-content">
      <!-- 支付状态提示 -->
      <div class="payment-status card">
        <div class="status-icon" :class="orderDetail.statusClass">
          <i :class="orderDetail.statusIcon"></i>
        </div>
        <h2 class="status-title">{{ orderDetail.statusTitle }}</h2>
        <p class="status-message">{{ orderDetail.statusMessage }}</p>
        <div class="order-no">订单号：{{ orderDetail.orderNo }}</div>
      </div>

      <!-- 订单信息 -->
      <div class="order-info card">
        <h3>订单信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">订单状态：</span>
            <a-tag :color="statusColors[orderDetail.status]">
              {{ statusMap[orderDetail.status] }}
            </a-tag>
          </div>
          <div class="info-item">
            <span class="label">订单编号：</span>
            <span>{{ orderDetail.orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">下单时间：</span>
            <span>{{ formatDate(orderDetail.createTime) }}</span>
          </div>
          <div v-if="orderDetail.payTime" class="info-item">
            <span class="label">付款时间：</span>
            <span>{{ formatDate(orderDetail.payTime) }}</span>
          </div>
          <div v-if="orderDetail.deliverTime" class="info-item">
            <span class="label">发货时间：</span>
            <span>{{ formatDate(orderDetail.deliverTime) }}</span>
          </div>
          <div v-if="orderDetail.receiveTime" class="info-item">
            <span class="label">收货时间：</span>
            <span>{{ formatDate(orderDetail.receiveTime) }}</span>
          </div>
          <div v-if="orderDetail.cancelReason" class="info-item">
            <span class="label">取消原因：</span>
            <span>{{ orderDetail.cancelReason }}</span>
          </div>
          <div v-if="orderDetail.orderMessage" class="info-item">
            <span class="label">订单留言：</span>
            <span>{{ orderDetail.orderMessage }}</span>
          </div>
        </div>
      </div>

      <!-- 收货信息 -->
      <div class="shipping-info card">
        <h3>收货信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">收货人：</span>
            <span>{{ orderDetail.shippingAddress.receiver }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话：</span>
            <span>{{ orderDetail.shippingAddress.phone }}</span>
          </div>
          <div class="info-item full-width">
            <span class="label">收货地址：</span>
            <span
              >{{ orderDetail.shippingAddress.region }}
              {{ orderDetail.shippingAddress.detail }}</span
            >
          </div>
        </div>
      </div>

      <!-- 支付信息 -->
      <div class="payment-info card">
        <h3>支付信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">支付方式：</span>
            <span>{{ orderDetail.paymentMethod === 'alipay' ? '支付宝' : '微信支付' }}</span>
          </div>
          <div class="info-item">
            <span class="label">订单金额：</span>
            <span class="price">¥{{ orderDetail.totalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- 商品信息 -->
      <div class="products-info card">
        <h3>商品信息</h3>
        <div v-for="product in orderDetail.products" :key="product.id" class="product-item">
          <img :src="product.image" :alt="product.name" class="product-image" />
          <div class="product-details">
            <h4 class="product-name">{{ product.name }}</h4>
            <p class="product-spec">{{ product.spec }}</p>
          </div>
          <div class="product-price">
            <span class="price">¥{{ product.price.toFixed(2) }}</span>
            <span class="quantity">x{{ product.quantity }}</span>
          </div>
        </div>
        <div class="order-total">
          <span>实付金额：</span>
          <span class="total-price">¥{{ orderDetail.totalAmount.toFixed(2) }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-button
          v-if="orderDetail.status === 0"
          type="primary"
          size="large"
          @click="showPaymentModal = true"
          class="action-btn"
        >
          立即支付
        </a-button>
        <a-button
          v-if="orderDetail.status === 0 || orderDetail.status === 1"
          type="default"
          size="large"
          @click="cancelOrder"
          class="action-btn"
        >
          取消订单
        </a-button>
        <a-button
          v-if="orderDetail.status === 2"
          type="primary"
          size="large"
          @click="confirmReceipt"
          class="action-btn"
        >
          确认收货
        </a-button>
        <a-button
          v-if="orderDetail.status === 3"
          type="dashed"
          size="large"
          @click="buyAgain"
          class="action-btn"
        >
          再次购买
        </a-button>
        <a-button type="default" size="large" @click="goToOrders" class="action-btn">
          返回订单列表
        </a-button>
      </div>
    </div>

    <div v-else class="loading-container">
      <a-spin size="large" />
      <p>加载订单详情中...</p>
    </div>

    <!-- 取消订单模态框 -->
    <a-modal
      v-model:visible="showCancelModal"
      title="取消订单"
      ok-text="确认取消"
      cancel-text="再想想"
      @ok="confirmCancel"
      @cancel="showCancelModal = false"
      :maskClosable="false"
    >
      <p>请选择取消原因：</p>
      <a-textarea
        v-model:value="cancelReason"
        placeholder="请输入取消原因"
        :rows="4"
        style="margin-top: 10px"
      />
    </a-modal>

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
            <p class="payment-amount">应付金额：¥{{ orderDetail.totalAmount.toFixed(2) }}</p>
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
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { message } from 'ant-design-vue'

const route = useRoute()
const router = useRouter()
const store = useStore()

const orderId = ref(null)
const orderDetail = ref({})
const showCancelModal = ref(false)
const cancelReason = ref('')

// 支付相关状态
const showPaymentModal = ref(false)
const showPaymentResult = ref(false)
const selectedPaymentMethod = ref('alipay')

const paymentResult = ref({
  status: 'success', // 'success' or 'fail'
  title: '',
  message: '',
  icon: '',
})

const statusMap = {
  0: '待付款',
  1: '待发货',
  2: '已发货',
  3: '已完成',
  4: '已取消',
  5: '退款中',
  6: '已退款',
}

const statusColors = {
  0: 'orange',
  1: 'blue',
  2: 'cyan',
  3: 'green',
  4: 'red',
  5: 'gold',
  6: 'purple',
}

// 使用计算属性获取订单列表
const orders = computed(() => store.state.orders || [])

onMounted(() => {
  const routeId = route.params.id
  // 尝试解析为数字(ID)或保持为字符串(订单号)
  orderId.value = isNaN(routeId) ? routeId : parseInt(routeId)
  loadOrderDetail()
})

const loadOrderDetail = () => {
  let order = null

  // 直接使用 ID 查找
  if (typeof orderId.value === 'number') {
    order = orders.value.find((o) => o.id === orderId.value)
  }

  // 如果参数是字符串，尝试转换为数字
  if (!order && typeof orderId.value === 'string' && !isNaN(orderId.value)) {
    const numericId = parseInt(orderId.value)
    order = orders.value.find((o) => o.id === numericId)
  }

  // 如果还没找到，尝试使用订单号查找
  if (!order) {
    order = orders.value.find((o) => o.orderNo === orderId.value.toString())
  }

  if (order) {
    orderDetail.value = order

    // 设置状态相关的显示内容
    if (order.status === 0) {
      orderDetail.value.statusClass = 'pending'
      orderDetail.value.statusIcon = 'fa fa-clock-o'
      orderDetail.value.statusTitle = '等待付款'
      orderDetail.value.statusMessage = '订单尚未支付，请尽快完成支付'
    } else if (order.status === 1) {
      orderDetail.value.statusClass = 'processing'
      orderDetail.value.statusIcon = 'fa fa-truck'
      orderDetail.value.statusTitle = '支付成功'
      orderDetail.value.statusMessage = '商家正在准备商品，请耐心等待'
    } else if (order.status === 2) {
      orderDetail.value.statusClass = 'shipping'
      orderDetail.value.statusIcon = 'fa fa-shipping-fast'
      orderDetail.value.statusTitle = '商品已发货'
      orderDetail.value.statusMessage = '商品已在途中，请注意查收'
    } else if (order.status === 3) {
      orderDetail.value.statusClass = 'success'
      orderDetail.value.statusIcon = 'fa fa-check-circle'
      orderDetail.value.statusTitle = '交易成功'
      orderDetail.value.statusMessage = '订单已完成，感谢您的购买'
    } else if (order.status === 4) {
      orderDetail.value.statusClass = 'canceled'
      orderDetail.value.statusIcon = 'fa fa-times-circle'
      orderDetail.value.statusTitle = '订单已取消'
      orderDetail.value.statusMessage = order.cancelReason || '订单已取消'
    } else if (order.status === 5 || order.status === 6) {
      orderDetail.value.statusClass = 'refund'
      orderDetail.value.statusIcon = 'fa fa-exchange-alt'
      orderDetail.value.statusTitle = order.status === 5 ? '退款中' : '已退款'
      orderDetail.value.statusMessage =
        order.status === 5 ? '退款申请已提交，等待审核' : '退款已完成'
    }
  } else {
    console.error('Order not found. orders:', orders.value, 'orderId:', orderId.value)
    message.error('订单不存在')
    setTimeout(() => {
      router.push('/personal')
    }, 1500)
  }
}

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return '无效日期'
    }
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    return '无效日期'
  }
}

const goBack = () => {
  router.go(-1)
}

const goToOrders = () => {
  // 跳转到个人中心并传递menu参数激活订单管理页面
  router.push({
    path: '/personal',
    query: { menu: 'order' },
  })
}

const closePaymentModal = () => {
  showPaymentModal.value = false
}

const closePaymentResult = () => {
  showPaymentResult.value = false
  // 如果支付成功，重新加载订单详情
  if (paymentResult.value.status === 'success') {
    loadOrderDetail()
  }
}

const handlePaymentConfirm = () => {
  // 模拟支付成功
  store.commit('updateOrderStatus', {
    orderId: orderId.value,
    status: 1, // 待发货
    timeField: 'payTime',
    timeValue: new Date().toISOString(),
  })

  showPaymentModal.value = false

  // 显示支付成功提示
  showPaymentResult.value = true
  paymentResult.value = {
    status: 'success',
    title: '支付成功',
    message: '订单支付成功，商家正在准备商品',
    icon: 'fa fa-check-circle',
  }
}

const handlePaymentCancel = () => {
  showPaymentModal.value = false
  message.info('已取消支付')
}

const cancelOrder = () => {
  showCancelModal.value = true
}

const confirmCancel = () => {
  if (!cancelReason.value) {
    message.error('请填写取消原因')
    return
  }

  // 更新Vuex中的订单状态
  store.commit('cancelOrder', {
    orderId: orderId.value,
    reason: cancelReason.value,
  })

  message.success('订单已取消')
  showCancelModal.value = false
  cancelReason.value = ''

  // 重新加载订单详情
  loadOrderDetail()
}

const confirmReceipt = () => {
  // 更新Vuex中的订单状态
  store.commit('updateOrderStatus', {
    orderId: orderId.value,
    status: 3, // 已完成
    timeField: 'receiveTime',
    timeValue: new Date().toISOString(),
  })

  message.success('确认收货成功')
  loadOrderDetail()
}

const buyAgain = () => {
  orderDetail.value.products.forEach((product) => {
    for (let i = 0; i < product.quantity; i++) {
      store.commit('addToCart', {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      })
    }
  })
  message.success('商品已加入购物车')
  router.push('/shopping')
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
$processing-color: #1890ff;

.payment-result-container {
  width: 90%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: $background-color;
  border-radius: 8px;
  min-height: 80vh;
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
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px $shadow-color;
}

.payment-result-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;

  p {
    margin-top: 1rem;
    color: $sub-text-color;
  }
}

// 支付状态
.payment-status {
  text-align: center;
  padding: 2rem;

  .status-icon {
    font-size: 4rem;
    margin-bottom: 1rem;

    &.pending {
      color: $warning-color;
    }

    &.processing {
      color: $processing-color;
    }

    &.shipping {
      color: $secondary-color;
    }

    &.success {
      color: $success-color;
    }

    &.canceled {
      color: $error-color;
    }

    &.refund {
      color: $sub-text-color;
    }
  }

  .status-title {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: $text-color;
  }

  .status-message {
    color: $sub-text-color;
    margin-bottom: 1rem;
  }

  .order-no {
    font-size: 0.875rem;
    color: $sub-text-color;
    background-color: #f8f9fa;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    display: inline-block;
  }
}

// 信息网格
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;

  .info-item {
    display: flex;
    align-items: flex-start;

    &.full-width {
      grid-column: 1 / -1;
    }

    .label {
      color: $sub-text-color;
      min-width: 80px;
      font-weight: 500;
    }
  }
}

// 商品信息
.products-info {
  .product-item {
    display: flex;
    padding: 1rem 0;
    border-bottom: 1px solid $border-color;
    align-items: center;

    &:last-child {
      border-bottom: none;
    }

    .product-image {
      width: 80px;
      height: 80px;
      border-radius: 4px;
      object-fit: cover;
      margin-right: 1rem;
    }

    .product-details {
      flex: 1;

      .product-name {
        font-size: 1rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: $text-color;
      }

      .product-spec {
        color: $sub-text-color;
        font-size: 0.875rem;
      }
    }

    .product-price {
      text-align: right;

      .price {
        display: block;
        font-weight: 500;
        color: $text-color;
        margin-bottom: 0.25rem;
      }

      .quantity {
        color: $sub-text-color;
        font-size: 0.875rem;
      }
    }
  }

  .order-total {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-top: 1rem;
    margin-top: 1rem;
    border-top: 1px solid $border-color;
    font-size: 1.125rem;
    font-weight: 500;

    .total-price {
      color: $error-color;
      font-size: 1.5rem;
      margin-left: 1rem;
    }
  }
}

// 操作按钮
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;

  .action-btn {
    min-width: 120px;
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
  .payment-result-container {
    width: 95%;
    padding: 1rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;

    .action-btn {
      width: 100%;
      max-width: 300px;
    }
  }

  .product-item {
    flex-direction: column;
    align-items: flex-start !important;

    .product-image {
      margin-bottom: 1rem;
      margin-right: 0;
    }

    .product-price {
      margin-top: 1rem;
      text-align: left !important;
      width: 100%;
    }
  }
}
</style>
