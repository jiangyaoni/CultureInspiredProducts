import { createStore } from 'vuex'

// 从localStorage加载状态
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('vuex_state')
    if (serializedState === null) {
      return undefined
    }
    return JSON.parse(serializedState)
  } catch (err) {
    console.warn('Failed to load state from localStorage:', err)
    return undefined
  }
}

// 保存状态到localStorage
const saveState = (state) => {
  try {
    const stateToPersist = {
      favorites: state.favorites,
      cartItems: state.cartItems,
      addresses: state.addresses,
      selectedAddressId: state.selectedAddressId,
      browseHistory: state.browseHistory,
      orders: state.orders, // 添加订单数据持久化
    }
    const serializedState = JSON.stringify(stateToPersist)
    localStorage.setItem('vuex_state', serializedState)
  } catch (err) {
    console.warn('Failed to save state to localStorage:', err)
  }
}

const initialState = {
  favorites: [],
  cartItems: [],
  addresses: [],
  selectedAddressId: null,
  browseHistory: [],
  orders: [], // 添加订单状态
}

const store = createStore({
  state() {
    // 只覆盖需要持久化的字段，其他字段使用初始值
    const storedState = loadState() || {}
    return {
      ...initialState,
      ...storedState,
    }
  },
  mutations: {
    addFavorite(state, heritage) {
      if (!state.favorites.some((item) => item.id === heritage.id)) {
        state.favorites.push(heritage)
      }
    },
    removeFavorite(state, id) {
      state.favorites = state.favorites.filter((item) => item.id !== id)
    },
    addToCart(state, product) {
      const existingItem = state.cartItems.find((item) => item.id === product.id)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.cartItems.push({
          ...product,
          quantity: 1,
          selected: true, // 默认选中新添加的商品
        })
      }
    },
    updateCartItemQuantity(state, { id, quantity }) {
      const item = state.cartItems.find((item) => item.id === id)
      if (item) {
        item.quantity = quantity
      }
    },
    removeCartItem(state, id) {
      state.cartItems = state.cartItems.filter((item) => item.id !== id)
    },
    clearCart(state) {
      state.cartItems = []
    },
    // 新增：更新商品选中状态
    updateCartItemSelected(state, { id, selected }) {
      const item = state.cartItems.find((item) => item.id === id)
      if (item) {
        item.selected = selected
      }
    },
    // 新增：全选/取消全选
    toggleAllCartItemsSelected(state, selected) {
      state.cartItems.forEach((item) => {
        item.selected = selected
      })
    },
    // 新增：删除选中的商品
    removeSelectedCartItems(state) {
      state.cartItems = state.cartItems.filter((item) => !item.selected)
    },
    // 添加地址
    addAddress(state, address) {
      const newId =
        state.addresses.length > 0 ? Math.max(...state.addresses.map((a) => a.id)) + 1 : 1

      // 新地址设为默认时，清除其他默认状态
      if (address.isDefault) {
        state.addresses.forEach((addr) => (addr.isDefault = false))
      }

      state.addresses.push({ ...address, id: newId })

      // 如果新地址是默认地址，则设置为选中地址
      if (address.isDefault) {
        state.selectedAddressId = newId
      }
    },

    // 更新地址
    updateAddress(state, { id, address }) {
      const index = state.addresses.findIndex((addr) => addr.id === id)
      if (index !== -1) {
        // 如果设置为默认地址，则更新其他地址为非默认
        if (address.isDefault) {
          state.addresses.forEach((addr) => {
            if (addr.id !== id) {
              addr.isDefault = false
            }
          })
        }
        state.addresses[index] = { ...address, id }

        // 如果更新为默认地址，则设置为选中地址
        if (address.isDefault) {
          state.selectedAddressId = id
        }
      }
    },
    // 删除地址
    deleteAddress(state, id) {
      // 过滤掉要删除的地址
      state.addresses = state.addresses.filter((addr) => addr.id !== id)

      // 如果删除的是当前选中的地址，重置选中状态
      if (state.selectedAddressId === id) {
        // 尝试找到默认地址
        const defaultAddr = state.addresses.find((addr) => addr.isDefault)

        if (defaultAddr) {
          state.selectedAddressId = defaultAddr.id
        } else if (state.addresses.length > 0) {
          // 没有默认地址则选择第一个
          state.selectedAddressId = state.addresses[0].id
        } else {
          state.selectedAddressId = null
        }
      }
    },

    // 设置默认地址
    setDefaultAddress(state, id) {
      // 设置所有地址的默认状态
      state.addresses.forEach((addr) => {
        addr.isDefault = addr.id === id
      })

      // 始终将选中的地址更新为默认地址
      state.selectedAddressId = id
    },

    // 选择地址
    selectAddress(state, id) {
      state.selectedAddressId = id
    },

    // 新增浏览历史相关mutation
    addToHistory(state, item) {
      // 统一数据结构
      const historyItem = {
        id: item.id,
        name: item.name,
        image: item.image,
        time: new Date().toISOString(),
        type: item.type || 'cultural', // 默认为文创类型
        price: item.price,
        // 非遗特有字段
        category: item.category,
        region: item.region,
        year: item.year,
        // 文创特有字段
        shop: item.shop,
      }

      // 检查是否已存在相同ID的记录，如果存在则移除旧的
      const existingIndex = state.browseHistory.findIndex(
        (historyItem) => historyItem.id === item.id,
      )
      if (existingIndex !== -1) {
        state.browseHistory.splice(existingIndex, 1)
      }

      // 添加到数组开头
      state.browseHistory.unshift(historyItem)

      // 限制最多保存50条记录
      if (state.browseHistory.length > 50) {
        state.browseHistory = state.browseHistory.slice(0, 50)
      }
    },
    removeFromHistory(state, id) {
      state.browseHistory = state.browseHistory.filter((item) => item.id !== id)
    },
    clearHistory(state) {
      state.browseHistory = []
    },

    // 添加订单相关mutations
    addOrder(state, order) {
      state.orders.unshift(order)
    },
    updateOrderStatus(state, { orderId, status, timeField, timeValue }) {
      const order = state.orders.find((order) => order.id === orderId)
      if (order) {
        order.status = status
        if (timeField && timeValue) {
          order[timeField] = timeValue
        }
      }
    },
    cancelOrder(state, { orderId, reason }) {
      const order = state.orders.find((order) => order.id === orderId)
      if (order) {
        order.status = 4 // 已取消
        order.cancelReason = reason
      }
    },
    deleteOrder(state, orderId) {
      state.orders = state.orders.filter((order) => order.id !== orderId)
    },
  },

  getters: {
    allFavorites: (state) => state.favorites,
    intangibleFavorites: (state) => state.favorites.filter((item) => item.type === 'intangible'),
    culturalFavorites: (state) => state.favorites.filter((item) => item.type === 'cultural'),
    cartItems: (state) => state.cartItems,
    // 新增：选中的购物车商品
    selectedCartItems: (state) => state.cartItems.filter((item) => item.selected),
    cartTotalPrice: (state) => {
      return state.cartItems.reduce((total, item) => {
        return total + item.price * item.quantity
      }, 0)
    },
    // 新增：选中商品的总价
    selectedCartTotalPrice: (state) => {
      return state.cartItems.reduce((total, item) => {
        return item.selected ? total + item.price * item.quantity : total
      }, 0)
    },
    cartTotalItems: (state) => {
      return state.cartItems.reduce((total, item) => {
        return total + item.quantity
      }, 0)
    },
    // 新增：选中商品的数量
    selectedCartTotalItems: (state) => {
      return state.cartItems.reduce((total, item) => {
        return item.selected ? total + item.quantity : total
      }, 0)
    },
    // 新增：是否全选
    isAllCartItemsSelected: (state) => {
      if (state.cartItems.length === 0) return false
      return state.cartItems.every((item) => item.selected)
    },
    // 获取所有地址
    allAddresses: (state) => state.addresses,
    // 获取选中的地址（优先默认地址）
    selectedAddress: (state) => {
      // 1. 优先选择默认地址
      const defaultAddress = state.addresses.find((addr) => addr.isDefault)
      if (defaultAddress) return defaultAddress

      // 2. 如果没有默认地址，但已选中地址，则返回选中地址
      if (state.selectedAddressId) {
        return state.addresses.find((addr) => addr.id === state.selectedAddressId)
      }

      // 3. 返回第一个地址
      return state.addresses[0] || null
    },

    // 获取默认地址
    defaultAddress: (state) => {
      return state.addresses.find((addr) => addr.isDefault) || null
    },

    // 获取浏览历史（按时间倒序）
    browseHistory: (state) => {
      return state.browseHistory.sort((a, b) => new Date(b.time) - new Date(a.time))
    },

    // 获取所有订单
    allOrders: (state) => state.orders,
  },
})

// 订阅store变化，自动保存到localStorage
store.subscribe((mutation, state) => {
  saveState(state)
})

export default store
