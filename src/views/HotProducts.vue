<!-- 热门推荐页 -->
<template>
  <div class="hot-products-page">
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
              <li class="nav-item"><a href="/hot" class="active">热门推荐</a></li>
              <li class="nav-item"><a href="/sale">优惠活动</a></li>
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
        <h2 class="page-title">热门推荐</h2>
        <p class="page-desc">销量领先，好评如潮</p>
      </div>

      <!-- 热门榜单 -->
      <div class="hot-ranking">
        <h3 class="ranking-title">热销榜</h3>
        <div class="ranking-list">
          <div 
            class="ranking-item" 
            v-for="(product, index) in top3Products" 
            :key="index"
            @click="$router.push(`/product/${product.id}`)"
          >
            <div class="ranking-num">{{ index + 1 }}</div>
            <div class="ranking-img">
              <img :src="product.imgUrl" :alt="product.name">
            </div>
            <div class="ranking-info">
              <h4 class="ranking-name">{{ product.name }}</h4>
              <div class="ranking-price">¥{{ product.price }}</div>
              <div class="ranking-sales">销量：{{ product.sales }}件</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-options">
          <span class="filter-label">分类：</span>
          <button 
            class="filter-btn" 
            :class="{ active: selectedCategory === 'all' }"
            @click="selectedCategory = 'all'"
          >
            全部
          </button>
          <button 
            class="filter-btn" 
            v-for="category in categories" 
            :key="category.id"
            :class="{ active: selectedCategory === category.id }"
            @click="selectedCategory = category.id"
          >
            {{ category.name }}
          </button>
        </div>

        <div class="sort-options">
          <span class="filter-label">排序：</span>
          <button 
            class="sort-btn" 
            :class="{ active: sortType === 'sales' }"
            @click="sortType = 'sales'"
          >
            销量优先
          </button>
          <button 
            class="sort-btn" 
            :class="{ active: sortType === 'rating' }"
            @click="sortType = 'rating'"
          >
            好评优先
          </button>
          <button 
            class="sort-btn" 
            :class="{ active: sortType === 'price-asc' }"
            @click="sortType = 'price-asc'"
          >
            价格从低到高
          </button>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="product-grid">
        <div 
          class="product-card" 
          v-for="(product, index) in filteredProducts" 
          :key="index"
          @click="$router.push(`/product/${product.id}`)"
        >
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
              <span class="price-original" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
            </div>
            <div class="product-rating">
              <i class="icon-star" v-for="n in 5" :key="n" :class="{ active: n <= product.rating }"></i>
              <span class="rating-count">({{ product.reviews }})</span>
            </div>
            <div class="product-sales">销量：{{ product.sales }}件</div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="filteredProducts.length > 0">
        <button class="page-btn prev" @click="prevPage" :disabled="currentPage === 1">上一页</button>
        <button 
          class="page-num" 
          v-for="page in totalPages" 
          :key="page"
          :class="{ active: currentPage === page }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <button class="page-btn next" @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

// 分类数据
const categories = reactive([
  { id: 1, name: '服饰鞋包' },
  { id: 2, name: '电子产品' },
  { id: 3, name: '家居用品' },
  { id: 4, name: '美妆个护' },
  { id: 5, name: '食品饮料' }
]);

// 热门商品数据（按销量排序）
const hotProducts = reactive([
  {
    id: 501,
    name: '无线蓝牙耳机 主动降噪',
    imgUrl: 'https://picsum.photos/id/97/300/300',
    price: 299,
    originalPrice: 399,
    categoryId: 2,
    sales: 1256,
    rating: 4.8,
    reviews: 356
  },
  {
    id: 502,
    name: '夏季纯棉短袖T恤 宽松百搭',
    imgUrl: 'https://picsum.photos/id/96/300/300',
    price: 59.9,
    originalPrice: 99,
    categoryId: 1,
    sales: 3254,
    rating: 4.5,
    reviews: 1280
  },
  {
    id: 503,
    name: '全自动咖啡机 家用小型',
    imgUrl: 'https://picsum.photos/id/98/300/300',
    price: 899,
    originalPrice: 1299,
    categoryId: 3,
    sales: 896,
    rating: 4.7,
    reviews: 523
  },
  {
    id: 504,
    name: '夏季透气运动鞋 轻便舒适',
    imgUrl: 'https://picsum.photos/id/99/300/300',
    price: 349,
    originalPrice: 499,
    categoryId: 1,
    sales: 2156,
    rating: 4.6,
    reviews: 987
  },
  {
    id: 505,
    name: '天然植物面膜 补水保湿',
    imgUrl: 'https://picsum.photos/id/106/300/300',
    price: 89,
    originalPrice: 129,
    categoryId: 4,
    sales: 1856,
    rating: 4.9,
    reviews: 1254
  },
  {
    id: 506,
    name: '有机水果礼盒 进口新鲜',
    imgUrl: 'https://picsum.photos/id/107/300/300',
    price: 199,
    originalPrice: 259,
    categoryId: 5,
    sales: 987,
    rating: 4.7,
    reviews: 654
  }
]);

// 状态管理
const selectedCategory = ref('all');
const sortType = ref('sales'); // 默认为销量排序
const currentPage = ref(1);
const pageSize = ref(4);

// 筛选商品
const filteredProducts = computed(() => {
  let result = [...hotProducts];
  
  // 排除前三名（已在热销榜展示）
  result = result.slice(3);
  
  // 分类筛选
  if (selectedCategory.value !== 'all') {
    result = result.filter(item => item.categoryId === Number(selectedCategory.value));
  }
  
  // 排序
  switch (sortType.value) {
    case 'rating':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'price-asc':
      result.sort((a, b) => a.price - b.price);
      break;
    default:
      // 销量排序
      result.sort((a, b) => b.sales - a.sales);
  }
  
  // 分页
  const startIndex = (currentPage.value - 1) * pageSize.value;
  return result.slice(startIndex, startIndex + pageSize.value);
});

// 前三名商品（热销榜）
const top3Products = computed(() => {
  return [...hotProducts].slice(0, 3);
});

// 总页数
const totalPages = computed(() => {
  const total = filteredProducts.value.length;
  return Math.ceil(total / pageSize.value) || 1;
});

// 分页控制
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const goToPage = (page: number) => {
  currentPage.value = page;
};

// 加入购物车
const addToCart = (product: any) => {
  alert(`${product.name} 已加入购物车`);
};
</script>

<style lang="scss" scoped>
// 基础样式变量（复用）
$primary: #ff4400;
$gray-light: #f5f5f5;
$gray: #999;
$gray-dark: #333;
$white: #fff;
$red: #f43f5e;

.hot-products-page {
  background-color: #fafafa;
  min-height: 100vh;
}

main {
  padding: 30px 0;
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

// 热门榜单
.hot-ranking {
  background-color: $white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;

  .ranking-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid $gray-light;
  }

  .ranking-list {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    padding-bottom: 10px;

    @media (max-width: 768px) {
      flex-direction: column;
    }

    .ranking-item {
      display: flex;
      align-items: center;
      min-width: 300px;
      padding: 10px;
      border-radius: 8px;
      transition: background-color 0.3s;
      cursor: pointer;

      &:hover {
        background-color: $gray-light;
      }

      .ranking-num {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: $primary;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        margin-right: 16px;

        &:nth-child(2) {
          background-color: #ff7d00;
        }

        &:nth-child(3) {
          background-color: #ffb400;
        }
      }

      .ranking-img {
        width: 80px;
        height: 80px;
        border-radius: 8px;
        overflow: hidden;
        margin-right: 16px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .ranking-info {
        flex: 1;

        .ranking-name {
          font-size: 14px;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ranking-price {
          color: $primary;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .ranking-sales {
          font-size: 12px;
          color: $gray;
        }
      }
    }
  }
}

// 筛选栏（复用新品页样式）
.filter-bar {
  background-color: $white;
  border-radius: 8px;
  padding: 12px 20px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  .filter-options, .sort-options {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .filter-label {
    font-size: 14px;
    color: $gray;
  }

  .filter-btn, .sort-btn {
    padding: 6px 12px;
    background: none;
    border: 1px solid $gray-light;
    border-radius: 4px;
    font-size: 14px;
    color: $gray-dark;
    cursor: pointer;

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

// 商品列表（复用新品页样式）
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
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
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
        background-color: #e63900;
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

    .product-rating {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      font-size: 12px;

      .icon-star {
        color: #ddd;
        margin-right: 2px;

        &.active {
          color: #ffcc00;
        }
      }

      .rating-count {
        color: $gray;
        margin-left: 4px;
      }
    }

    .product-sales {
      font-size: 12px;
      color: $gray;
    }
  }
}

// 分页样式复用
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 30px;
  padding: 16px;

  .page-btn, .page-num {
    padding: 6px 12px;
    border: 1px solid $gray-light;
    border-radius: 4px;
    background-color: $white;
    color: $gray-dark;
    cursor: pointer;
    font-size: 14px;

    &:hover:not(.active):not(:disabled) {
      border-color: $primary;
      color: $primary;
    }

    &.active {
      background-color: $primary;
      color: white;
      border-color: $primary;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>