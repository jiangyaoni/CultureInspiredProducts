<script setup>
import {
  UserOutlined,
  EnvironmentOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons-vue'

defineProps(['activeMenu'])
defineEmits(['update:activeMenu'])

const menus = [
  { key: 'profile', label: '个人信息', icon: UserOutlined },
  { key: 'address', label: '地址管理', icon: EnvironmentOutlined },
  { key: 'order', label: '订单管理', icon: ShoppingCartOutlined },
  { key: 'favorites', label: '收藏列表', icon: HeartOutlined },
  { key: 'history', label: '历史记录', icon: ClockCircleOutlined },
]
</script>

<template>
  <aside class="sidebar">
    <nav>
      <button
        v-for="item in menus"
        :key="item.key"
        @click="$emit('update:activeMenu', item.key)"
        :class="{ active: activeMenu === item.key }"
        class="menu-item"
        :aria-current="activeMenu === item.key ? 'page' : null"
      >
        <component :is="item.icon" class="menu-icon" />
        <span class="menu-label">{{ item.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  background: #f8f9fa;
  border-right: 1px solid #eee;
  flex-shrink: 0; /* 防止侧边栏收缩 */
}

.menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 16px 24px;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
  border-left: 3px solid transparent;
  white-space: nowrap; /* 防止文本换行 */
  overflow: hidden;
}

.menu-item:hover,
.menu-item.active {
  background: #e9ecef;
  color: #1890ff;
  font-weight: 500;
  border-left-color: #1890ff;
}

.menu-icon {
  margin-right: 12px;
  font-size: 16px;
  flex-shrink: 0;
}

.menu-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #eee;
  }

  .menu-item {
    border-left: none;
    border-bottom: 3px solid transparent;
    padding: 12px 16px;
  }

  .menu-item.active {
    border-left-color: transparent;
    border-bottom-color: #1890ff;
  }
}
</style>
