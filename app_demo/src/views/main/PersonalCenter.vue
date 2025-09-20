<!-- PersonalCenter.vue -->
<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SidebarMenu from '@/components/SidebarMenu.vue'
import ProfileSection from '@/components/ProfileSection.vue'
import AddressSection from '@/components/AddressSection.vue'
import OrderSection from '@/components/OrderSection.vue'
import FavoritesSection from '@/components/FavoritesSection.vue'
import HistorySection from '@/components/HistorySection.vue'

const route = useRoute()
const router = useRouter()
const activeMenu = ref('profile')

// 定义有效的菜单项
const validMenuItems = ['profile', 'address', 'order', 'favorites', 'history']

// 从路由参数获取当前激活的菜单
onMounted(() => {
  if (route.query.tab && validMenuItems.includes(route.query.tab)) {
    activeMenu.value = route.query.tab
  }
})

// 监听activeMenu变化，更新路由参数
watch(activeMenu, (newVal) => {
  router.replace({
    query: { ...route.query, tab: newVal },
  })
})

// 监听路由变化，同步activeMenu
watch(
  () => route.query.menu,
  (newMenu) => {
    if (newMenu) {
      activeMenu.value = newMenu
    }
  },
  { immediate: true },
)

// 使用计算属性动态获取组件
const activeComponent = computed(() => {
  const componentMap = {
    profile: ProfileSection,
    address: AddressSection,
    order: OrderSection,
    favorites: FavoritesSection,
    history: HistorySection,
  }
  return componentMap[activeMenu.value] || ProfileSection
})
</script>

<template>
  <div class="personal-center">
    <SidebarMenu :activeMenu="activeMenu" @update:activeMenu="activeMenu = $event" />

    <main class="content">
      <keep-alive>
        <component :is="activeComponent" />
      </keep-alive>
    </main>
  </div>
</template>

<style scoped>
.personal-center {
  display: flex;
  max-width: 1200px;
  margin: 20px auto;
  min-height: 600px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.content {
  flex: 1;
  padding: 30px;
  background: #fff;
  min-width: 0; /* 防止内容溢出 */
}

@media (max-width: 768px) {
  .personal-center {
    flex-direction: column;
  }

  .content {
    padding: 20px;
  }
}
</style>
