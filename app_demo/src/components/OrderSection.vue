<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { message } from 'ant-design-vue'

const store = useStore()
const router = useRouter()
const orders = computed(() => store.state.orders) // 从 Vuex 获取订单数据
const orderFilter = ref('all')
const loading = ref(false)
const selectedOrder = ref(null)
const showOrderDetail = ref(false)
const cancelReason = ref('')
const showCancelModal = ref(false)
const cancelingOrderId = ref(null)

// 添加滑动窗口相关状态
const scrollContainer = ref(null)
const scrollPosition = ref(0)
const maxScroll = ref(0)

onMounted(() => {
  loading.value = true
  // 不再需要模拟数据，直接从 Vuex 获取
  setTimeout(() => {
    loading.value = false
    // 初始化滑动窗口
    setTimeout(initScroll, 100)
  }, 500)
})

// 初始化滑动窗口
function initScroll() {
  if (scrollContainer.value) {
    maxScroll.value = scrollContainer.value.scrollHeight - scrollContainer.value.clientHeight
  }
}

// 处理滑动事件
function handleScroll(event) {
  scrollPosition.value = event.target.scrollTop
}

// 日期格式化工具函数
function formatDate(dateString) {
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

const filteredOrders = computed(() => {
  if (orderFilter.value === 'all') return orders.value
  const statusMap = {
    pending: 0,
    shipping: 1,
    delivered: 2,
    completed: 3,
    canceled: 4,
    refunding: 5,
    refunded: 6,
  }
  return orders.value.filter((order) => order.status === statusMap[orderFilter.value])
})

const closeOrderDetail = () => {
  showOrderDetail.value = false
  selectedOrder.value = null
}

const handlePayment = (order) => {
  // 使用订单 ID 而不是订单号
  router.push(`/order/${order.id}/payment-result`)
}

const cancelOrder = (orderId) => {
  cancelingOrderId.value = orderId
  showCancelModal.value = true
}

const confirmCancel = () => {
  if (!cancelReason.value) {
    message.error('请填写取消原因')
    return
  }

  // 更新 Vuex 中的订单状态
  store.commit('cancelOrder', {
    orderId: cancelingOrderId.value,
    reason: cancelReason.value,
  })

  message.success('订单已取消')
  cancelReason.value = ''
  showCancelModal.value = false
  cancelingOrderId.value = null
}

const confirmReceipt = (orderId) => {
  // 更新 Vuex 中的订单状态
  store.commit('updateOrderStatus', {
    orderId: orderId,
    status: 3, // 已完成
    timeField: 'receiveTime',
    timeValue: new Date().toISOString(),
  })

  message.success('确认收货成功')
}

const deleteOrder = (orderId) => {
  // 从 Vuex 中删除订单
  store.commit('deleteOrder', orderId)
  message.success('订单删除成功')
}

const buyAgain = (order) => {
  order.products.forEach((product) => {
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
}

const applyRefund = (order) => {
  // 更新 Vuex 中的订单状态
  store.commit('updateOrderStatus', {
    orderId: order.id,
    status: 5, // 退款中
  })

  message.success('退款申请已提交，等待审核')
}

const viewOrderDetail = (order) => {
  // 使用订单 ID 而不是订单号
  router.push(`/order/${order.id}/payment-result`)
}
</script>

<template>
  <section class="order-section">
    <div class="order-header">
      <h2>我的订单</h2>
      <a-radio-group v-model:value="orderFilter" button-style="solid" class="order-filter">
        <a-radio-button value="all">全部订单</a-radio-button>
        <a-radio-button value="pending">待付款</a-radio-button>
        <a-radio-button value="shipping">待发货</a-radio-button>
        <a-radio-button value="delivered">已发货</a-radio-button>
        <a-radio-button value="completed">已完成</a-radio-button>
        <a-radio-button value="canceled">已取消</a-radio-button>
      </a-radio-group>
    </div>

    <a-spin :spinning="loading">
      <a-empty v-if="!loading && filteredOrders.length === 0" description="暂无订单数据" />

      <div v-else class="order-list-container" ref="scrollContainer" @scroll="handleScroll">
        <div v-for="order in filteredOrders" :key="order.id" class="order-item">
          <div class="order-summary">
            <div class="order-info">
              <span class="order-number">订单号: {{ order.orderNo }}</span>
              <span class="order-date">{{ formatDate(order.createTime) }}</span>
            </div>
            <a-tag :color="statusColors[order.status]" class="order-status">
              {{ statusMap[order.status] }}
            </a-tag>
          </div>

          <div class="order-details">
            <div class="order-products">
              <div
                v-for="(product, index) in order.products"
                :key="product.id"
                class="product-item"
                :class="{ 'has-border': index < order.products.length - 1 }"
              >
                <img :src="product.image" :alt="product.name" class="product-image" />
                <div class="product-info">
                  <h4 class="product-name" :title="product.name">{{ product.name }}</h4>
                  <p class="product-spec" :title="product.spec">{{ product.spec }}</p>
                </div>
                <div class="product-price">
                  <span class="price">¥{{ product.price.toFixed(2) }}</span>
                  <span class="quantity">x{{ product.quantity }}</span>
                </div>
              </div>
            </div>

            <div class="order-actions">
              <div class="order-total">
                <span>实付金额:</span>
                <span class="total-amount">¥{{ order.totalAmount.toFixed(2) }}</span>
              </div>
              <div class="action-buttons">
                <a-button type="link" size="small" @click="viewOrderDetail(order)">
                  查看详情
                </a-button>
                <a-button
                  v-if="order.status === 0"
                  type="primary"
                  size="small"
                  @click="handlePayment(order)"
                >
                  立即付款
                </a-button>
                <a-button
                  v-if="order.status === 0 || order.status === 1"
                  type="default"
                  size="small"
                  @click="cancelOrder(order.id)"
                >
                  取消订单
                </a-button>
                <a-button
                  v-if="order.status === 2"
                  type="primary"
                  size="small"
                  @click="confirmReceipt(order.id)"
                >
                  确认收货
                </a-button>
                <a-button
                  v-if="order.status === 3"
                  type="dashed"
                  size="small"
                  @click="buyAgain(order)"
                >
                  再次购买
                </a-button>
                <a-button
                  v-if="order.status === 3"
                  type="link"
                  size="small"
                  @click="applyRefund(order)"
                >
                  申请退款
                </a-button>
                <a-button
                  v-if="order.status === 4 || order.status === 6"
                  type="link"
                  size="small"
                  danger
                  @click="deleteOrder(order.id)"
                >
                  删除订单
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-spin>

    <!-- 订单详情模态框 -->
    <a-modal
      v-model:visible="showOrderDetail"
      :title="selectedOrder ? `订单详情 - ${selectedOrder.orderNo}` : '订单详情'"
      width="800px"
      :footer="null"
      @cancel="closeOrderDetail"
    >
      <div v-if="selectedOrder" class="order-detail-modal">
        <div class="detail-section">
          <h3>订单信息</h3>
          <div class="detail-row">
            <span class="label">订单状态：</span>
            <a-tag :color="statusColors[selectedOrder.status]">
              {{ statusMap[selectedOrder.status] }}
            </a-tag>
          </div>
          <div class="detail-row">
            <span class="label">订单编号：</span>
            <span>{{ selectedOrder.orderNo }}</span>
          </div>
          <div class="detail-row">
            <span class="label">下单时间：</span>
            <span>{{ formatDate(selectedOrder.createTime) }}</span>
          </div>
          <div v-if="selectedOrder.payTime" class="detail-row">
            <span class="label">付款时间：</span>
            <span>{{ formatDate(selectedOrder.payTime) }}</span>
          </div>
          <div v-if="selectedOrder.deliverTime" class="detail-row">
            <span class="label">发货时间：</span>
            <span>{{ formatDate(selectedOrder.deliverTime) }}</span>
          </div>
          <div v-if="selectedOrder.receiveTime" class="detail-row">
            <span class="label">收货时间：</span>
            <span>{{ formatDate(selectedOrder.receiveTime) }}</span>
          </div>
          <div v-if="selectedOrder.cancelReason" class="detail-row">
            <span class="label">取消原因：</span>
            <span>{{ selectedOrder.cancelReason }}</span>
          </div>
          <div v-if="selectedOrder.orderMessage" class="detail-row">
            <span class="label">订单留言：</span>
            <span>{{ selectedOrder.orderMessage }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h3>收货信息</h3>
          <div class="detail-row">
            <span class="label">收货人：</span>
            <span>{{ selectedOrder.shippingAddress.receiver }}</span>
          </div>
          <div class="detail-row">
            <span class="label">联系电话：</span>
            <span>{{ selectedOrder.shippingAddress.phone }}</span>
          </div>
          <div class="detail-row">
            <span class="label">收货地址：</span>
            <span
              >{{ selectedOrder.shippingAddress.region }}
              {{ selectedOrder.shippingAddress.detail }}</span
            >
          </div>
        </div>

        <div class="detail-section">
          <h3>支付信息</h3>
          <div class="detail-row">
            <span class="label">支付方式：</span>
            <span>{{ selectedOrder.paymentMethod === 'alipay' ? '支付宝' : '微信支付' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">订单金额：</span>
            <span class="price">¥{{ selectedOrder.totalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h3>商品信息</h3>
          <div v-for="product in selectedOrder.products" :key="product.id" class="product-detail">
            <img :src="product.image" :alt="product.name" class="product-image" />
            <div class="product-info">
              <h4 :title="product.name">{{ product.name }}</h4>
              <p :title="product.spec">{{ product.spec }}</p>
            </div>
            <div class="product-price">
              <span>¥{{ product.price.toFixed(2) }}</span>
              <span class="quantity">x{{ product.quantity }}</span>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

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
  </section>
</template>

<style scoped>
.order-section {
  min-height: 500px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  position: relative;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.order-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: #333;
}

.order-filter {
  margin-bottom: 0;
}

.order-list-container {
  margin-top: 16px;
  max-height: 70vh; /* 限制最大高度 */
  overflow-y: auto; /* 启用垂直滚动 */
  padding-right: 8px; /* 为滚动条留出空间 */
  scroll-behavior: smooth; /* 平滑滚动 */
}

/* 自定义滚动条样式 */
.order-list-container::-webkit-scrollbar {
  width: 8px;
}

.order-list-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.order-list-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.order-list-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.order-item {
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  background: #fff;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.order-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.order-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}

.order-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.order-number {
  font-weight: 500;
  color: #333;
}

.order-date {
  color: #999;
  font-size: 13px;
}

.order-status {
  font-weight: 500;
}

.order-details {
  display: flex;
  padding: 16px;
}

.order-products {
  flex: 1;
  min-width: 0;
}

.product-item {
  display: flex;
  padding: 12px 0;
  align-items: center;
}

.product-item.has-border {
  border-bottom: 1px solid #f0f0f0;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
  margin-right: 16px;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
  margin-right: 16px;
}

.product-name {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px; /* 限制商品名称最大宽度 */
}

.product-spec {
  margin: 0;
  color: #999;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px; /* 限制规格最大宽度 */
}

.product-price {
  width: 120px;
  text-align: right;
  flex-shrink: 0;
}

.price {
  display: block;
  color: #ff4d4f;
  font-weight: 500;
  margin-bottom: 4px;
}

.quantity {
  color: #999;
  font-size: 12px;
}

.order-actions {
  width: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  padding-left: 16px;
  border-left: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.order-total {
  text-align: right;
  margin-bottom: 16px;
}

.order-total span {
  color: #666;
  font-size: 13px;
}

.total-amount {
  display: block;
  font-size: 18px;
  font-weight: 500;
  color: #ff4d4f;
  margin-top: 4px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

/* 订单详情模态框样式 */
.order-detail-modal {
  max-height: 60vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.detail-row {
  display: flex;
  margin-bottom: 8px;
}

.detail-row .label {
  width: 80px;
  color: #999;
  flex-shrink: 0;
}

.product-detail {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.product-detail:last-child {
  border-bottom: none;
}

.product-detail .product-image {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.product-detail .product-info {
  flex: 1;
  margin: 0 16px;
  min-width: 0;
}

.product-detail .product-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px; /* 限制详情页商品名称最大宽度 */
}

.product-detail .product-info p {
  margin: 0;
  color: #999;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px; /* 限制详情页规格最大宽度 */
}

.product-detail .product-price {
  text-align: right;
  flex-shrink: 0;
}

.product-detail .product-price .quantity {
  display: block;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .order-details {
    flex-direction: column;
  }

  .product-name,
  .product-spec {
    max-width: 150px; /* 移动端调整最大宽度 */
  }

  .order-actions {
    width: 100%;
    padding-left: 0;
    border-left: none;
    margin-top: 16px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .action-buttons {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
  }

  /* 移动端调整滑动窗口高度 */
  .order-list-container {
    max-height: 60vh;
  }

  .product-detail .product-info h4,
  .product-detail .product-info p {
    max-width: 200px; /* 移动端详情页调整最大宽度 */
  }
}

@media (max-width: 576px) {
  .product-name,
  .product-spec {
    max-width: 100px; /* 更小屏幕调整最大宽度 */
  }

  .product-detail .product-info h4,
  .product-detail .product-info p {
    max-width: 120px; /* 更小屏幕详情页调整最大宽度 */
  }
}
</style>
