<template>
  <div class="home-container">
    <header class="header">
      <div class="nav-wrapper">
        <div class="logo">
          <span class="logo-text">非遗活态库</span>
        </div>

        <div class="mobile-menu">
          <button @click="isMenuOpen = !isMenuOpen">
            <i class="fa fa-bars"></i>
          </button>
        </div>

        <nav :class="['nav-links', { 'mobile-active': isMenuOpen }]">
          <router-link to="/home" class="nav-item" @click="closeMobileMenu">
            <i class="fa fa-home"></i>
            <span>首页</span>
          </router-link>
          <router-link to="/heritage" class="nav-item" @click="closeMobileMenu">
            <i class="fa fa-book"></i>
            <span>非遗库</span>
          </router-link>
          <router-link to="/cultural" class="nav-item" @click="closeMobileMenu">
            <i class="fa fa-shopping-bag"></i>
            <span>文创商城</span>
          </router-link>
          <router-link to="/shopping" class="nav-item" @click="closeMobileMenu">
            <i class="fa fa-shopping-cart"></i>
            <span>购物车</span>
          </router-link>
          <router-link to="/favorites" class="nav-item" @click="closeMobileMenu">
            <i class="fa fa-heart"></i>
            <span>我的收藏</span>
          </router-link>
          <router-link to="/personal" class="nav-item" @click="closeMobileMenu">
            <i class="fa fa-user"></i>
            <span>个人中心</span>
          </router-link>
          <router-link to="/login" class="nav-item" @click="closeMobileMenu">
            <i class="fa fa-sign-in-alt"></i>
            <span>登录</span>
          </router-link>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <router-view />
    </main>

    <div class="fixed-footer" :class="{ 'show-footer': showButtons }">
      <div class="footer-buttons">
        <button class="feedback-btn"><i class="fa fa-comment-dots"></i> 意见反馈</button>
        <button class="share-btn"><i class="fa fa-share-alt"></i> 社区分享</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isMenuOpen = ref(false)
const showButtons = ref(false) // 默认隐藏按钮

// 监听路由变化，确保每次路由切换后页面滚动到顶部
watch(
  () => router.currentRoute.value,
  () => {
    window.scrollTo(0, 0)
  },
)

const closeMobileMenu = () => {
  if (window.innerWidth <= 768) {
    isMenuOpen.value = false
  }
}

const handleResize = () => {
  if (window.innerWidth > 768) {
    isMenuOpen.value = false
  }
}

// 监听滚动事件，判断是否接近页面底部
const handleScroll = () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement
  showButtons.value = scrollTop + clientHeight >= scrollHeight - 50 // 距离底部 50px 时显示
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
$primary-color: #2c3e50; // 主文字颜色
$accent-color: #689f38; // 强调色
$hover-color: #e8f4d9; // 背景色
$active-bg: #ffffff; // 激活背景色
$breakpoint-md: 768px; // 移动端断点
$breakpoint-lg: 1200px; // 桌面端断点

.home-container {
  max-width: 1440px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: $hover-color;
}

.header {
  background: $hover-color;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 0.8rem 2%;
}

.nav-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  &-text {
    font-family: '华文彩云', cursive;
    font-size: 1.8rem;
    background: linear-gradient(135deg, #689f38 0%, #2e7d32 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  }
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  transition: all 0.3s ease;

  .nav-item {
    display: flex;
    align-items: center;
    padding: 0.8rem 1.2rem;
    border-radius: 6px;
    color: $primary-color;
    text-decoration: none;
    transition: all 0.2s ease;

    i {
      margin-right: 0.6rem;
      font-size: 1.1rem;
    }

    &:hover {
      background: $hover-color;
      transform: translateY(-1px);
    }

    &.router-link-active {
      background: $active-bg;
      color: $primary-color;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

      i {
        color: $accent-color;
      }
    }
  }
}

.mobile-menu {
  display: none;
  button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: $primary-color;
    padding: 0.5rem;
  }
}

@media (max-width: $breakpoint-md) {
  .mobile-menu {
    display: block;
  }

  .nav-links {
    position: fixed;
    top: 70px;
    left: 0;
    width: 100%;
    flex-direction: column;
    background: $active-bg;
    padding: 1rem 0;
    clip-path: circle(0px at 90% -10%);

    &.mobile-active {
      clip-path: circle(1000px at 90% -10%);
    }

    .nav-item {
      width: 90%;
      margin: 0 auto;
      &.router-link-active {
        background: $hover-color;
      }
    }
  }
}

.main-content {
  padding: 2rem 2%;
  max-width: 1200px;
  margin: 0 auto;
}
</style>

<style lang="scss">
.fixed-footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  width: 98%;
  transform: translateX(-50%);
  background-color: rgb(198, 194, 194);
  display: flex;
  justify-content: center;
  padding: 0.25rem 0;
  z-index: 100;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease;
}

.fixed-footer.show-footer {
  opacity: 1;
  visibility: visible;
}

.footer-buttons {
  display: flex;
  gap: 1rem;

  .feedback-btn,
  .share-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
    }
  }

  .feedback-btn {
    background-color: #007bff;
    color: white;
  }

  .share-btn {
    background-color: #28a745;
    color: white;
  }
}
</style>
