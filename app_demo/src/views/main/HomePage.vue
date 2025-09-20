<template>
  <div class="home-container">
    <main class="main-content">
      <div class="search-box">
        <div class="search-wrapper">
          <input
            type="text"
            placeholder="搜索非遗/文创商品"
            class="search-input"
            @keyup.enter="$router.push('/search')"
          />
          <!-- 只保留图标 -->
          <router-link to="/search" class="search-btn">
            <i class="fas fa-search"></i>
          </router-link>
        </div>
      </div>

      <!-- 轮播图部分 -->
      <div class="carousel-container">
        <button class="carousel-control prev" @click="prevSlide" aria-label="Previous slide">
          <i class="fas fa-chevron-left"></i>
        </button>

        <div class="carousel-wrapper">
          <div class="carousel" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div
              v-for="(slide, index) in slides"
              :key="index"
              class="slide heritage-slide"
              :class="{ active: index === currentSlide }"
              :style="{ backgroundImage: `url(${slide.image})` }"
              @click="handleSlideClick(slide)"
            >
              <div class="slide-content">
                <h2>{{ slide.title }}</h2>
                <p>{{ slide.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <button class="carousel-control next" @click="nextSlide" aria-label="Next slide">
          <i class="fas fa-chevron-right"></i>
        </button>

        <div class="carousel-dots">
          <div
            v-for="(_, index) in slides"
            :key="index"
            class="dot"
            :class="{ active: index === currentSlide }"
            @click="goToSlide(index)"
            @keydown.enter="goToSlide(index)"
            @keydown.space="goToSlide(index)"
            role="button"
            tabindex="0"
          ></div>
        </div>
      </div>

      <section class="featured-section">
        <div class="section-header">
          <h2 class="section-title">精选文创商品</h2>
          <router-link to="/cultural" class="more-heritage-link" @click="scrollToTop">
            <svg
              class="arrow"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 10H17M17 10L12 5M17 10L12 15"
                stroke="#000"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            更多商品
          </router-link>
        </div>
        <div class="card-grid">
          <div
            v-for="item in heritageItems"
            :key="item.id"
            class="heritage-card"
            @click="viewProductDetail(item)"
          >
            <img :src="item.image" :alt="item.name" class="card-image" />
            <div class="card-content">
              <!-- 交换商品名字和价格的位置 -->
              <span class="price">¥{{ item.price }}</span>
              <h3 class="card-title">{{ item.name }}</h3>
              <p class="card-desc">{{ item.introduce }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()
const currentSlide = ref(0)

// 新增滚动到顶部函数
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const slides = ref([
  {
    id: 2835,
    image: 'src/assets/cultural_imgs/白茶制作技艺（福鼎白茶制作技艺）.jpg',
    title: '传承千年技艺',
    description: '发现传统技艺的魅力',
  },
  {
    id: 1741,
    image: 'src/assets/cultural_imgs/沧州武术（劈挂拳）.jpg',
    title: '探索非遗文化',
    description: '支持非遗传承人的匠心之作',
  },
  {
    id: 1039,
    image: 'src/assets/cultural_imgs/昆曲.jpg',
    title: '探索非遗文化',
    description: '支持非遗传承人的匠心之作',
  },
])

const handleSlideClick = (slide) => {
  scrollToTop() // 轮播图点击也滚动到顶部
  router.push(`/heritage/${slide.id}`)
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length
  resetInterval()
}

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
  resetInterval()
}

const goToSlide = (index) => {
  currentSlide.value = index
  resetInterval()
}

// 查看商品详情
const viewProductDetail = (item) => {
  // 添加浏览历史记录
  store.commit('addToHistory', {
    id: item.id,
    name: item.name,
    image: item.image,
    time: new Date().toISOString(),
    type: 'cultural', // 首页展示的都是文创商品
    price: item.price,
    shop: item.shop || '未知商家', // 如果没有shop字段，可以给一个默认值
  })

  // 添加滚动到顶部逻辑
  scrollToTop()

  // 添加短暂延迟确保滚动完成后再跳转
  setTimeout(() => {
    router.push(`/cultural/${item.id}`)
  }, 100)
}

let intervalId = null
const resetInterval = () => {
  clearInterval(intervalId)
  intervalId = setInterval(nextSlide, 5000)
}

onMounted(() => {
  intervalId = setInterval(nextSlide, 5000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})

const heritageItems = ref([
  {
    id: 1,
    image: 'src/assets/images/故宫花神口红彩妆礼盒文创生日毕业520送女朋友礼物1.jpg',
    name: '故宫花神口红彩妆礼盒',
    price: 79.2,
    introduce:
      '以故宫藏画为灵感，复刻传统花神造型，含6色口红与1支唇釉，色号源自古籍记载的「杏花春」「荷花夏」等，搭配雕花口红管，礼盒含花神主题明信片，适合节日赠礼或收藏。',
    shop: '故宫文创旗舰店',
  },
  {
    id: 2,
    image: 'src/assets/images/苏州博物馆 百卉含英旋转灯创意卧室充电伴睡小夜灯520礼物送女友1.jpg',
    name: '苏州博物馆百卉含英旋转灯',
    price: 92.0,
    introduce:
      '3D镂空雕刻工艺，灯体可360°旋转投射花卉图案，内置暖光LED与充电电池，续航达10小时，既是卧室伴睡灯也是氛围装饰，附苏州博物馆典藏花卉图鉴。',
    shop: '苏州博物馆旗舰店',
  },
  {
    id: 3,
    image: 'src/assets/images/敦煌莲花小佛钥匙扣挂件可爱博物馆文创祈福公仔包挂送朋友伴手礼1.jpg',
    name: '敦煌莲花小佛钥匙扣',
    price: 49.0,
    introduce:
      '敦煌壁画元素提炼，PVC软胶材质，莲花座可360°旋转，小佛像表情生动，搭配「平安」「如意」珐琅吊牌，可作包挂、钥匙扣或祈福摆件。',
    shop: '敦煌研究院旗舰店',
  },
  {
    id: 4,
    image: 'src/assets/images/陕西历史博物馆文创萌宠觥仔毛绒包包挂饰钥匙扣挂件玩偶生日礼物1.jpg',
    name: '陕博萌宠觥仔毛绒挂件',
    price: 45.0,
    introduce:
      '以陕西历史博物馆藏「兽首玛瑙杯」为原型，Q版设计毛绒材质，内置发声装置（轻捏可发出萌音），搭配青铜纹饰挂绳，适合作为包包挂饰或生日礼物。',
    shop: '陕西历史博物馆旗舰店',
  },
  {
    id: 5,
    image:
      'src/assets/images/中国风笔记本礼盒套装国潮本子教师节礼物送老师奖励企业定制高颜值开学伴手创意手账文具故宫文创1.jpg',
    name: '故宫文创中国风笔记本礼盒',
    price: 15.9,
    introduce:
      '封面采用故宫红墙纹理烫金工艺，内页含200张米黄道林纸，附故宫藏品贴纸与书签，礼盒含钢笔1支，适合作为教师节礼物或企业定制伴手礼。',
    shop: '故宫文创旗舰店',
  },
  {
    id: 6,
    image: 'src/assets/images/Max观无界梵高鸢尾花胸针徽章礼盒套装送女友生日礼物闺蜜情人节1.jpg',
    name: '梵高鸢尾花胸针礼盒',
    price: 52.6,
    introduce:
      '珐琅工艺复刻梵高《鸢尾花》油画，胸针尺寸3.5cm，搭配金丝檀木礼盒，内含鸢尾花种子卡与艺术家明信片，适合作为情人节或闺蜜礼物。',
    shop: '艺术博物馆旗舰店',
  },
  {
    id: 7,
    image: 'src/assets/images/敦煌绮梦·青岚玉髓金丝檀木手链新中式国风博物馆文创送朋友闺蜜1.jpg',
    name: '敦煌青岚玉髓手链',
    price: 58.6,
    introduce:
      '天然玉髓雕刻敦煌飞天纹样，搭配金丝檀木珠与藏式银饰，弹力绳设计适配多种腕围，附敦煌研究院授权证书，适合新中式穿搭或闺蜜互赠。',
    shop: '敦煌研究院旗舰店',
  },
  {
    id: 8,
    image: 'src/assets/images/国家宝藏你好历史富贵狸猫手机支架复古可爱摆件女生文创生日礼物1.jpg',
    name: '国家宝藏富贵狸猫手机支架',
    price: 67.1,
    introduce:
      '树脂材质复刻唐代「三彩狸猫」造型，支架角度可调（0-90°），底部防滑设计，搭配「招财进宝」刺绣贴，既是手机支架也是桌面复古摆件。',
    shop: '国家宝藏旗舰店',
  },
  {
    id: 9,
    image: 'src/assets/images/大英博物馆文创蝴蝶香薰蜡烛伴手礼盒新婚礼物送闺蜜生日礼物女生1.jpg',
    name: '大英博物馆蝴蝶香薰礼盒',
    price: 49.0,
    introduce:
      '大豆蜡基底含薰衣草与柑橘精油，蜡烛表面浮雕大英博物馆藏「玻璃蝴蝶」标本图案，燃烧时间约25小时，礼盒含火柴与金属盖，适合新婚或闺蜜生日礼物。',
    shop: '大英博物馆旗舰店',
  },
])
</script>

<style scoped lang="scss">
$primary-color: #689f38;
$secondary-color: #d2f3af;
$background-color: #f1f8e9;
$text-color: #000;
$link-hover-color: #9ccc65;
$transition-timing: cubic-bezier(0.25, 0.46, 0.45, 0.94);
$hover-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);

.home-container {
  width: 90%;
  max-width: 1300px;
  min-height: 150vh;
  margin: 0 auto;
  background-color: $background-color;
}

.search-box {
  width: 90%;
  max-width: 800px;
  margin: 3rem auto;

  .search-wrapper {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 3rem;
    padding: 0.8rem 1rem 0.8rem 1.5rem;
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.08),
      0 1px 2px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;
    transition: all 0.3s ease;
    gap: 1.5em;

    &:hover {
      box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.1),
        0 3px 6px rgba(0, 0, 0, 0.08);
    }

    .search-input {
      flex-grow: 1;
      padding: 0.5rem 1rem;
      border: none;
      background: transparent;
      font-size: 1rem;
      color: $text-color;

      &::placeholder {
        color: #a0aec0;
      }

      &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(174, 213, 129, 0.2);
      }
    }

    .search-btn {
      margin: 0;
      padding: 0.5rem 2rem;
      color: rgb(77, 66, 66);
      background: $secondary-color;
      border-radius: 3rem;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.05);
        color: #000;
        box-shadow: 0 4px 10px rgba(156, 204, 101, 0.3);
        background: $link-hover-color;
      }

      &:active {
        transform: scale(0.98);
      }
    }
  }
}

.carousel-container {
  position: relative;
  width: 90%;
  max-width: 1200px;
  height: 400px;
  margin: 2rem auto;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.carousel-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel {
  display: flex;
  height: 100%;
  transition: transform 0.5s $transition-timing;
}

.slide {
  flex: 0 0 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
}

.heritage-slide {
  cursor: pointer;
  transition:
    transform 0.3s $transition-timing,
    box-shadow 0.3s $transition-timing;

  &:hover {
    transform: translateY(-5px);
    box-shadow: $hover-shadow;

    .slide-content {
      transform: translateY(-3px);
    }
  }

  &:active {
    transform: translateY(-2px) scale(0.98);
  }
}

.slide-content {
  position: absolute;
  bottom: 20%;
  left: 10%;
  color: white;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s $transition-timing;

  h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    transition: transform 0.3s $transition-timing;
  }

  p {
    font-size: 1.2rem;
    max-width: 400px;
    transition: transform 0.3s $transition-timing;
  }
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background: white;
    transform: translateY(-50%) scale(1.1);
    box-shadow: $hover-shadow;
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  &.prev {
    left: 1.5rem;
  }

  &.next {
    right: 1.5rem;
  }

  i {
    color: #333;
    font-size: 1.5rem;
  }
}

.carousel-dots {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.8rem;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s $transition-timing;

  &:hover {
    transform: scale(1.2);
  }

  &.active {
    background: white;
    transform: scale(1.2);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }
}

.featured-section {
  margin: 4rem 5%;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2.5rem;
  }

  .more-heritage-link {
    color: $primary-color;
    font-size: 1.2rem;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;

    &:hover {
      color: $link-hover-color;
      transform: translateX(5px);
    }

    &:active {
      transform: scale(0.95);
    }

    .arrow {
      margin-right: 0.5rem;
      fill: #000 !important;
      transition: transform 0.3s ease;
      width: 20px;
      height: 20px;
    }

    &:hover .arrow {
      transform: translateX(3px);
    }
  }

  .section-title {
    font-size: 2.2rem;
    font-weight: 700;
    color: $primary-color;
    margin-bottom: 0;
    text-align: center;
    position: relative;

    &::after {
      content: '';
      display: block;
      width: 80px;
      height: 3px;
      background: #000;
      margin: 0.8rem auto 0;
    }
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    justify-content: center;
  }

  .heritage-card {
    display: flex;
    flex-direction: column;
    border-radius: 1rem;
    overflow: hidden;
    background: white;
    transition: all 0.3s $transition-timing;
    text-decoration: none;
    position: relative;
    min-height: 350px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    cursor: pointer;

    &:hover {
      transform: translateY(-8px) rotateX(2deg) rotateY(2deg);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);

      .card-image {
        transform: scale(1.05);
      }
    }

    &:active {
      transform: translateY(-4px) scale(0.98);
    }

    .card-image {
      width: 100%;
      height: 240px;
      object-fit: cover;
      transition: transform 0.8s $transition-timing;
      background: #f5f5f5;
      border-bottom: 3px solid $primary-color;
    }

    .card-content {
      padding: 1rem;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      // 新增，让内容居中对齐
      align-items: center;
    }

    .card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: $text-color;
      // 减小底部外边距，可按需调整数值
      margin: 0 0 0.5rem;
      line-height: 1.4;
      letter-spacing: 0.5px;
      text-align: center;
    }

    .price {
      display: block;
      color: #e53935;
      font-weight: 800;
      font-size: 1.3rem;
      // 减小底部外边距，可按需调整数值
      margin: 0 0 0.5rem;
      letter-spacing: 0.5px;
      text-shadow: 0 2px 4px rgba(229, 57, 53, 0.1);
      text-align: center;
    }

    .card-desc {
      font-size: 0.95rem;
      color: #666;
      line-height: 1.6;
      margin: 1rem 0 0;
      flex-grow: 1;
      display: -webkit-box;
      display: box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      -webkit-box-orient: vertical;
      box-orient: vertical;
      overflow: hidden;
      text-align: center; // 可选，让描述也居中
    }

    // 移动端响应式调整
    @media (max-width: 768px) {
      .card-content {
        padding: 1rem;
      }

      .card-title {
        font-size: 1rem;
        margin: 0 0 0.3rem;
      }

      .price {
        font-size: 1.1rem;
        margin: 0.3rem 0;
      }

      .card-desc {
        font-size: 0.85rem;
        margin: 0.3rem 0 0;
      }
    }
  }
}
</style>
