<!-- 优惠活动页  -->
<template>
  <div class="discount-page">
    <!-- 导航栏（复用） -->
    <header class="navbar">
      <div class="container">
        <div class="navbar-content">
          <div class="logo">
            <a href="/">
              <h1 class="text-2xl font-bold text-primary">MallShop</h1>
            </a>
          </div>
          <nav class="main-nav hidden md:flex">
            <ul class="nav-list">
              <li class="nav-item"><a href="/">首页</a></li>
              <li class="nav-item"><a href="/category">商品分类</a></li>
              <li class="nav-item"><a href="/new">新品上市</a></li>
              <li class="nav-item"><a href="/hot">热门推荐</a></li>
              <li class="nav-item"><a href="/sale" class="active">优惠活动</a></li>
            </ul>
          </nav>
          <div class="nav-actions">
            <button class="action-btn search-btn">
              <i class="icon-search"></i>
            </button>
            <button class="action-btn cart-btn" @click="$router.push('/cart')">
              <i class="icon-cart"></i>
              <span class="cart-count">3</span>
            </button>
            <button class="action-btn user-btn" @click="$router.push('/user')">
              <i class="icon-user"></i>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="container">
      <div class="page-header">
        <h2 class="page-title">优惠活动</h2>
        <p class="page-desc">限时折扣，超值优惠</p>
      </div>

      <!-- 活动横幅 -->
      <div class="discount-banner">
        <a href="#flash-sale">
          <img src="https://picsum.photos/id/26/1200/300" alt="限时折扣活动">
        </a>
      </div>

      <!-- 活动分类 -->
      <div class="activity-types">
        <button 
          class="activity-btn" 
          :class="{ active: currentActivity === 'flash-sale' }"
          @click="currentActivity = 'flash-sale'"
        >
          限时折扣
        </button>
        <button 
          class="activity-btn" 
          :class="{ active: currentActivity === 'group-buy' }"
          @click="currentActivity = 'group-buy'"
        >
          团购活动
        </button>
        <button 
          class="activity-btn" 
          :class="{ active: currentActivity === 'coupon' }"
          @click="currentActivity = 'coupon'"
        >
          优惠券
        </button>
      </div>

      <!-- 限时折扣 -->
      <div id="flash-sale" class="activity-content" v-if="currentActivity === 'flash-sale'">
        <div class="activity-header">
          <h3 class="activity-title">限时折扣</h3>
          <div class="countdown">
            <span class="countdown-label">剩余时间：</span>
            <div class="countdown-time">
              <span class="time-item">{{ hours }}</span>
              <span class="time-colon">:</span>
              <span class="time-item">{{ minutes }}</span>
              <span class="time-colon">:</span>
              <span class="time-item">{{ seconds }}</span>
            </div>
          </div>
        </div>

        <div class="product-grid">
          <div 
            class="product-card" 
            v-for="(product, index) in flashSaleProducts" 
            :key="index"
            @click="$router.push(`/product/${product.id}`)"
          >
            <div class="product-tag">限时</div>
            <div class="discount-badge">{{ product.discount }}折</div>
            <div class="product-img">
              <img :src="product.imgUrl" :alt="product.name">
              <button class="product-add" @click.stop="addToCart(product)">
                <i class="icon-cart"></i>
              </button>
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <div class="product-price">
                <span class="price-current">¥{{ product.price }}</span>
                <span class="price-original">¥{{ product.originalPrice }}</span>
              </div>
              <div class="product-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: product.saleRate + '%' }"></div>
                </div>
                <span class="progress-text">{{ product.saleRate }}% 已售</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 团购活动 -->
      <div id="group-buy" class="activity-content" v-if="currentActivity === 'group-buy'">
        <div class="activity-header">
          <h3 class="activity-title">团购活动</h3>
          <p class="activity-desc">多人成团，享受更低价格</p>
        </div>

        <div class="product-grid">
          <div 
            class="product-card" 
            v-for="(product, index) in groupBuyProducts" 
            :key="index"
            @click="$router.push(`/product/${product.id}`)"
          >
            <div class="product-tag">团购</div>
            <div class="group-info">
              <span class="group-price">团购价 ¥{{ product.groupPrice }}</span>
              <span class="group-people">{{ product.joined }}人已团</span>
            </div>
            <div class="product-img">
              <img :src="product.imgUrl" :alt="product.name">
              <div class="group-countdown">
                <span class="countdown-text">剩余{{ product.remainingTime }}结束</span>
              </div>
              <button class="product-add" @click.stop="joinGroup(product)">
                立即参团
              </button>
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <div class="product-price">
                <span class="price-current">¥{{ product.groupPrice }}</span>
                <span class="price-original">原价 ¥{{ product.originalPrice }}</span>
              </div>
              <div class="group-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: (product.joined / product.required) * 100 + '%' }"></div>
                </div>
                <span class="progress-text">{{ product.joined }}/{{ product.required }}人成团</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 优惠券 -->
      <div id="coupon" class="activity-content" v-if="currentActivity === 'coupon'">
        <div class="activity-header">
          <h3 class="activity-title">优惠券</h3>
          <p class="activity-desc">领取优惠券，下单立减</p>
        </div>

        <div class="coupon-list">
          <div 
            class="coupon-card" 
            v-for="(coupon, index) in coupons" 
            :key="index"
            :class="coupon.type"
          >
            <div class="coupon-left">
              <div class="coupon-amount">
                <span class="symbol">¥</span>
                <span class="number">{{ coupon.amount }}</span>
              </div>
              <div class="coupon-desc">满{{ coupon.minSpend }}元可用</div>
            </div>
            <div class="coupon-right">
              <div class="coupon-title">{{ coupon.title }}</div>
              <div class="coupon-time">有效期至 {{ coupon.expireDate }}</div>
              <button 
                class="coupon-btn" 
                :class="{ used: coupon.used }"
                @click="receiveCoupon(coupon)"
                :disabled="coupon.used"
              >
                {{ coupon.used ? '已领取' : '立即领取' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 活动类型
const currentActivity = ref('flash-sale');

// 限时折扣商品
const flashSaleProducts = reactive([
  {
    id: 601,
    name: '夏季纯棉短袖T恤 宽松百搭',
    imgUrl: 'https://picsum.photos/id/96/300/300',
    price: 59.9,
    originalPrice: 99,
    discount: 6,
    saleRate: 75,
    sales: 3254
  },
  {
    id: 602,
    name: '无线蓝牙耳机 主动降噪',
    imgUrl: 'https://picsum.photos/id/97/300/300',
    price: 239,
    originalPrice: 399,
    discount: 6,
    saleRate: 62,
    sales: 1256
  },
  {
    id: 603,
    name: '全自动咖啡机 家用小型',
    imgUrl: 'https://picsum.photos/id/98/300/300',
    price: 719,
    originalPrice: 1299,
    discount: 5.5,
    saleRate: 45,
    sales: 896
  },
  {
    id: 604,
    name: '夏季透气运动鞋 轻便舒适',
    imgUrl: 'https://picsum.photos/id/99/300/300',
    price: 279,
    originalPrice: 499,
    discount: 5.6,
    saleRate: 88,
    sales: 2156
  }
]);

// 团购商品
const groupBuyProducts = reactive([
  {
    id: 701,
    name: '天然植物面膜 补水保湿',
    imgUrl: 'https://picsum.photos/id/106/300/300',
    originalPrice: 129,
    groupPrice: 89,
    joined: 18,
    required: 20,
    remainingTime: '2小时30分'
  },
  {
    id: 702,
    name: '有机水果礼盒 进口新鲜',
    imgUrl: 'https://picsum.photos/id/107/300/300',
    originalPrice: 259,
    groupPrice: 169,
    joined: 35,
    required: 50,
    remainingTime: '5小时12分'
  },
  {
    id: 703,
    name: '北欧风沙发 三人位',
    imgUrl: 'https://picsum.photos/id/93/300/300',
    originalPrice: 3699,
    groupPrice: 2499,
    joined: 8,
    required: 10,
    remainingTime: '1天2小时'
  }
]);

// 优惠券数据
const coupons = reactive([
  {
    id: 801,
    title: '通用满减券',
    amount: 50,
    minSpend: 500,
    expireDate: '2024-12-31',
    type: 'cash',
    used: false
  },
  {
    id: 802,
    title: '服饰类专用券',
    amount: 30,
    minSpend: 300,
    expireDate: '2024-11-30',
    type: 'clothes',
    used: true
  },
  {
    id: 803,
    title: '电子产品券',
    amount: 100,
    minSpend: 1000,
    expireDate: '2024-10-31',
    type: 'electronics',
    used: false
  }
]);

// 倒计时逻辑
const targetTime = ref(new Date().getTime() + 24 * 60 * 60 * 1000); // 24小时后结束
const hours = ref('00');
const minutes = ref('00');
const seconds = ref('00');

const updateCountdown = () => {
  const now = new Date().getTime();
  const diff = targetTime.value - now;

  if (diff <= 0) {
    hours.value = '00';
    minutes.value = '00';
    seconds.value = '00';
    return;
  }

  // 计算时分秒
  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);

  // 补零
  hours.value = h.toString().padStart(2, '0');
  minutes.value = m.toString().padStart(2, '0');
  seconds.value = s.toString().padStart(2, '0');
};

// 初始化倒计时
onMounted(() => {
  updateCountdown();
  const timer = setInterval(updateCountdown, 1000);
  
  // 组件卸载时清除定时器
  return () => clearInterval(timer);
});

// 加入购物车
const addToCart = (product: any) => {
  alert(`${product.name} 已加入购物车`);
};

// 参团
const joinGroup = (product: any) => {
  if (product.joined < product.required) {
    product.joined++;
    alert(`已成功参与${product.name}的团购`);
  } else {
    alert('该商品团购已完成，即将跳转至商品详情页');
    router.push(`/product/${product.id}`);
  }
};

// 领取优惠券
const receiveCoupon = (coupon: any) => {
  coupon.used = true;
  alert(`成功领取【${coupon.title}】，下单满${coupon.minSpend}元可使用`);
};
</script>

<style lang="scss" scoped>
// 基础样式变量
$primary: #ff4400;
$primary-light: #ff6733;
$gray-light: #f5f5f5;
$gray: #999;
$gray-dark: #333;
$white: #fff;
$red: #f43f5e;
$green: #00b42a;

.discount-page {
  background-color: #fafafa;
  min-height: 100vh;
}

main {
  padding: 30px 0;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;

  .page-title {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 8px;
    color: $gray-dark;
  }

  .page-desc {
    color: $gray;
    font-size: 16px;
  }
}

// 活动横幅
.discount-banner {
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;

  img {
    width: 100%;
    height: auto;
    display: block;
  }
}

// 活动分类
.activity-types {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 10px;

  .activity-btn {
    padding: 10px 20px;
    background-color: $white;
    border: 1px solid $gray-light;
    border-radius: 30px;
    font-size: 16px;
    color: $gray-dark;
    cursor: pointer;
    white-space: nowrap;

    &.active {
      background-color: $primary;
      color: white;
      border-color: $primary;
    }

    &:hover:not(.active) {
      border-color: $primary;
      color: $primary;
    }
  }
}

// 活动内容通用样式
.activity-content {
  background-color: $white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;

  .activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid $gray-light;

    .activity-title {
      font-size: 18px;
      font-weight: 600;
    }

    .activity-desc {
      color: $gray;
      font-size: 14px;
    }
  }
}

// 限时折扣
.countdown {
  display: flex;
  align-items: center;

  .countdown-label {
    font-size: 14px;
    color: $gray;
    margin-right: 10px;
  }

  .countdown-time {
    display: flex;
    align-items: center;

    .time-item {
      width: 36px;
      height: 36px;
      background-color: $primary;
      color: white;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .time-colon {
      margin: 0 8px;
      font-size: 18px;
      color: $gray-dark;
    }
  }
}

// 商品网格通用样式
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.product-card {
  background-color: $white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  .product-tag {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 4px 8px;
    background-color: $primary;
    color: white;
    font-size: 12px;
    border-radius: 4px;
    z-index: 10;
  }

  .discount-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    background-color: $red;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    z-index: 10;
  }

  .product-img {
    position: relative;
    padding-top: 100%;
    overflow: hidden;

    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }

    &:hover img {
      transform: scale(1.05);
    }

    .product-add {
      position: absolute;
      bottom: 12px;
      right: 12px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: $primary;
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 10;

      &:hover {
        background-color: $primary-light;
      }
    }

    &:hover .product-add {
      opacity: 1;
    }
  }

  .product-info {
    padding: 16px;

    .product-name {
      font-size: 14px;
      color: $gray-dark;
      margin: 0 0 8px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      height: 36px;
    }

    .product-price {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      .price-current {
        color: $primary;
        font-size: 16px;
        font-weight: 600;
      }

      .price-original {
        color: $gray;
        font-size: 12px;
        text-decoration: line-through;
        margin-left: 8px;
      }
    }
  }
}

// 限时折扣特有样式
.product-progress {
  margin-top: 8px;

  .progress-bar {
    height: 6px;
    background-color: $gray-light;
    border-radius: 3px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background-color: $primary;
      transition: width 0.3s;
    }
  }

  .progress-text {
    display: block;
    font-size: 12px;
    color: $gray;
    margin-top: 4px;
    text-align: right;
  }
}

// 团购活动特有样式
.group-info {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 2px;

  .group-price {
    font-weight: 600;
  }

  .group-people {
    font-size: 11px;
  }
}

.group-countdown {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10;
}

.product-add {
  position: absolute;
  bottom: 12px;
  right: 12px;
  padding: 6px 12px;
  background-color: $primary;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  z-index: 10;

  &:hover {
    background-color: $primary-light;
  }
}

.group-progress {
  margin-top: 8px;

  .progress-bar {
    height: 6px;
    background-color: $gray-light;
    border-radius: 3px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background-color: $green;
      transition: width 0.3s;
    }
  }

  .progress-text {
    display: block;
    font-size: 12px;
    color: $gray;
    margin-top: 4px;
    text-align: right;
  }
}

// 优惠券样式
.coupon-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 10px 0;
}

.coupon-card {
  display: flex;
  background-color: #fff4e5;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    height: 100%;
    background-color: $primary;
  }

  &.clothes {
    background-color: #e5f3ff;

    &::before {
      background-color: #1677ff;
    }
  }

  &.electronics {
    background-color: #e5ffe7;

    &::before {
      background-color: $green;
    }
  }

  .coupon-left {
    flex: 1;
    padding: 16px;
    text-align: center;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      height: 100%;
      width: 1px;
      background-image: linear-gradient(to bottom, transparent 0%, #ddd 50%, transparent 100%);
    }

    .coupon-amount {
      display: inline-flex;
      align-items: flex-end;
      margin-bottom: 8px;

      .symbol {
        font-size: 18px;
        color: $primary;
        margin-right: 2px;
      }

      .number {
        font-size: 36px;
        font-weight: 700;
        color: $primary;
      }
    }

    .coupon-desc {
      font-size: 14px;
      color: $gray-dark;
    }
  }

  .coupon-right {
    flex: 2;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .coupon-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .coupon-time {
      font-size: 12px;
      color: $gray;
      margin-bottom: 16px;
    }

    .coupon-btn {
      align-self: flex-end;
      padding: 6px 16px;
      background-color: $primary;
      color: white;
      border: 1px solid $primary;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;

      &.used {
        background-color: $gray-light;
        color: $gray;
        border-color: $gray-light;
        cursor: not-allowed;
      }

      &:not(.used):hover {
        background-color: $primary-light;
      }
    }
  }
}
</style>