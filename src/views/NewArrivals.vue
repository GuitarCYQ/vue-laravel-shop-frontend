<!-- 新品上市页 -->
<template>
  <div class="category-page">
    <!-- 导航栏（复用主页导航） -->
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
              <li class="nav-item"><a href="/category" class="active">商品分类</a></li>
              <li class="nav-item"><a href="/new">新品上市</a></li>
              <li class="nav-item"><a href="/hot">热门推荐</a></li>
              <li class="nav-item"><a href="/sale">优惠活动</a></li>
            </ul>
          </nav>
          <div class="nav-actions">
            <button class="action-btn search-btn" @click="showSearch = true">
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
      <div class="category-content">
        <!-- 左侧分类导航 -->
        <aside class="category-sidebar">
          <h3 class="sidebar-title">全部分类</h3>
          <ul class="category-tree">
            <li 
              class="category-item" 
              v-for="(category, index) in categories" 
              :key="index"
              :class="{ active: currentCategoryId === category.id }"
              @click="selectCategory(category.id)"
            >
              <a href="javascript:;">
                <span class="category-name">{{ category.name }}</span>
                <i class="icon-arrow-right"></i>
              </a>
              <!-- 二级分类 -->
              <ul class="subcategory-list" v-if="category.children && currentCategoryId === category.id">
                <li 
                  class="subcategory-item" 
                  v-for="(sub, subIndex) in category.children" 
                  :key="subIndex"
                  :class="{ active: currentSubcategoryId === sub.id }"
                  @click.stop="selectSubcategory(sub.id)"
                >
                  {{ sub.name }}
                </li>
              </ul>
            </li>
          </ul>
        </aside>

        <!-- 右侧商品列表 -->
        <div class="category-products">
          <!-- 筛选栏 -->
          <div class="filter-bar">
            <div class="filter-sort">
              <span class="filter-label">排序方式：</span>
              <button 
                class="sort-btn" 
                :class="{ active: sortType === 'default' }"
                @click="sortType = 'default'"
              >
                默认排序
              </button>
              <button 
                class="sort-btn" 
                :class="{ active: sortType === 'price-asc' }"
                @click="sortType = 'price-asc'"
              >
                价格从低到高
              </button>
              <button 
                class="sort-btn" 
                :class="{ active: sortType === 'price-desc' }"
                @click="sortType = 'price-desc'"
              >
                价格从高到低
              </button>
              <button 
                class="sort-btn" 
                :class="{ active: sortType === 'sales' }"
                @click="sortType = 'sales'"
              >
                销量优先
              </button>
            </div>

            <div class="filter-price">
              <span class="filter-label">价格区间：</span>
              <div class="price-range">
                <input 
                  type="number" 
                  v-model="priceMin" 
                  placeholder="最低" 
                  class="price-input"
                >
                <span class="price-separator">-</span>
                <input 
                  type="number" 
                  v-model="priceMax" 
                  placeholder="最高" 
                  class="price-input"
                >
                <button class="btn-filter" @click="filterByPrice">筛选</button>
              </div>
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
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div class="empty-state" v-if="filteredProducts.length === 0">
            <img src="https://picsum.photos/id/20/100/100" alt="暂无商品">
            <p>该分类下暂无商品</p>
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
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';

// 分类数据
const categories = reactive([
  {
    id: 1,
    name: '服饰鞋包',
    children: [
      { id: 11, name: '男装' },
      { id: 12, name: '女装' },
      { id: 13, name: '鞋靴' },
      { id: 14, name: '箱包' }
    ]
  },
  {
    id: 2,
    name: '电子产品',
    children: [
      { id: 21, name: '手机' },
      { id: 22, name: '电脑' },
      { id: 23, name: '耳机' },
      { id: 24, name: '相机' }
    ]
  },
  {
    id: 3,
    name: '家居用品',
    children: [
      { id: 31, name: '家具' },
      { id: 32, name: '家纺' },
      { id: 33, name: '厨具' },
      { id: 34, name: '灯具' }
    ]
  },
  { id: 4, name: '美妆个护', children: [] },
  { id: 5, name: '食品饮料', children: [] },
  { id: 6, name: '运动户外', children: [] }
]);

// 商品数据
const products = reactive([
  // 服饰类
  {
    id: 101,
    name: '夏季纯棉短袖T恤 宽松百搭',
    imgUrl: 'https://picsum.photos/id/96/300/300',
    price: 59.9,
    originalPrice: 99,
    rating: 4.5,
    reviews: 128,
    categoryId: 11,
    sales: 356
  },
  {
    id: 102,
    name: '牛仔裤 修身直筒',
    imgUrl: 'https://picsum.photos/id/91/300/300',
    price: 129,
    originalPrice: 199,
    rating: 4.7,
    reviews: 215,
    categoryId: 11,
    sales: 289
  },
  // 电子产品类
  {
    id: 201,
    name: '无线蓝牙耳机 主动降噪',
    imgUrl: 'https://picsum.photos/id/97/300/300',
    price: 299,
    originalPrice: 399,
    rating: 4.8,
    reviews: 356,
    categoryId: 23,
    sales: 512
  },
  {
    id: 202,
    name: '智能手机 5G全网通',
    imgUrl: 'https://picsum.photos/id/92/300/300',
    price: 3299,
    originalPrice: 3699,
    rating: 4.9,
    reviews: 892,
    categoryId: 21,
    sales: 1254
  },
  // 家居类
  {
    id: 301,
    name: '北欧风沙发 三人位',
    imgUrl: 'https://picsum.photos/id/93/300/300',
    price: 2899,
    originalPrice: 3699,
    rating: 4.6,
    reviews: 78,
    categoryId: 31,
    sales: 96
  }
]);

// 状态管理
const currentCategoryId = ref(0); // 0表示全部分类
const currentSubcategoryId = ref(0);
const sortType = ref('default'); // 排序方式
const priceMin = ref('');
const priceMax = ref('');
const currentPage = ref(1);
const pageSize = ref(12); // 每页12条

// 筛选商品
const filteredProducts = computed(() => {
  let result = [...products];
  
  // 分类筛选
  if (currentCategoryId.value > 0) {
    // 如果有选中二级分类，按二级分类筛选
    if (currentSubcategoryId.value > 0) {
      result = result.filter(item => item.categoryId === currentSubcategoryId.value);
    } else {
      // 否则按一级分类筛选（找出所有属于该一级分类下的二级分类商品）
      const targetCategory = categories.find(c => c.id === currentCategoryId.value);
      if (targetCategory && targetCategory.children && targetCategory.children.length) {
        const subIds = targetCategory.children.map(sub => sub.id);
        result = result.filter(item => subIds.includes(item.categoryId));
      } else {
        // 一级分类无二级分类时，直接筛选一级分类ID（实际项目中需调整数据结构）
        result = result.filter(item => item.categoryId === currentCategoryId.value);
      }
    }
  }
  
  // 价格筛选
  if (priceMin.value) {
    result = result.filter(item => item.price >= Number(priceMin.value));
  }
  if (priceMax.value) {
    result = result.filter(item => item.price <= Number(priceMax.value));
  }
  
  // 排序
  switch (sortType.value) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'sales':
      result.sort((a, b) => b.sales - a.sales);
      break;
    default:
      // 默认排序（按ID）
      result.sort((a, b) => a.id - b.id);
  }
  
  // 分页处理
  const startIndex = (currentPage.value - 1) * pageSize.value;
  return result.slice(startIndex, startIndex + pageSize.value);
});

// 总页数
const totalPages = computed(() => {
  const total = filteredProducts.value.length;
  return Math.ceil(total / pageSize.value) || 1;
});

// 分类选择
const selectCategory = (id: number) => {
  currentCategoryId.value = id;
  currentSubcategoryId.value = 0; // 重置二级分类
  currentPage.value = 1; // 重置页码
};

// 二级分类选择
const selectSubcategory = (id: number) => {
  currentSubcategoryId.value = id;
  currentPage.value = 1; // 重置页码
};

// 价格筛选
const filterByPrice = () => {
  currentPage.value = 1; // 重置页码
};

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
  // 实际项目中调用购物车接口
  alert(`${product.name} 已加入购物车`);
};
</script>

<style lang="scss" scoped>
// 基础样式变量（复用主页）
$primary: #ff4400;
$primary-light: #ff6733;
$gray-light: #f5f5f5;
$gray: #999;
$gray-dark: #333;
$white: #fff;

.category-page {
  background-color: #fafafa;
  min-height: 100vh;
}

main {
  padding: 20px 0;
}

.category-content {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

// 左侧分类导航
.category-sidebar {
  background-color: $white;
  border-radius: 8px;
  overflow: hidden;

  @media (max-width: 768px) {
    display: none; // 移动端隐藏侧边栏，可通过弹窗实现
  }

  .sidebar-title {
    padding: 16px 20px;
    font-size: 16px;
    font-weight: 600;
    background-color: $gray-light;
    color: $gray-dark;
  }

  .category-tree {
    list-style: none;
    margin: 0;
    padding: 0;

    .category-item {
      border-bottom: 1px solid $gray-light;

      &:last-child {
        border-bottom: none;
      }

      &.active {
        background-color: rgba(255, 68, 0, 0.05);

        .category-name {
          color: $primary;
        }
      }

      a {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 20px;
        color: $gray-dark;
        text-decoration: none;

        .category-name {
          font-size: 14px;
        }

        .icon-arrow-right {
          font-size: 12px;
          color: $gray;
        }
      }

      .subcategory-list {
        list-style: none;
        margin: 0;
        padding: 0 0 0 30px;
        background-color: $white;

        .subcategory-item {
          padding: 10px 0;
          font-size: 13px;
          color: $gray-dark;
          cursor: pointer;

          &:hover {
            color: $primary;
          }

          &.active {
            color: $primary;
            font-weight: 500;
          }
        }
      }
    }
  }
}

// 右侧商品列表
.category-products {
  .filter-bar {
    background-color: $white;
    border-radius: 8px;
    padding: 12px 20px;
    margin-bottom: 20px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;

    .filter-label {
      font-size: 14px;
      color: $gray;
    }

    .filter-sort, .filter-price {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .sort-btn {
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

    .price-range {
      display: flex;
      align-items: center;
      gap: 8px;

      .price-input {
        width: 80px;
        padding: 6px 10px;
        border: 1px solid $gray-light;
        border-radius: 4px;
        font-size: 14px;
        outline: none;

        &:focus {
          border-color: $primary;
        }
      }

      .price-separator {
        color: $gray;
      }

      .btn-filter {
        padding: 6px 12px;
        background-color: $primary;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;

        &:hover {
          background-color: $primary-light;
        }
      }
    }
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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
          background-color: $primary-light;
        }
      }

      &:hover .product-add {
        opacity: 1;
      }
    }

    .product-info {
      padding: 12px;

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
    }
  }

  // 空状态
  .empty-state {
    text-align: center;
    padding: 60px 0;
    background-color: $white;
    border-radius: 8px;

    img {
      width: 100px;
      height: 100px;
      opacity: 0.5;
      margin-bottom: 16px;
    }

    p {
      color: $gray;
      font-size: 16px;
    }
  }

  // 分页
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
}
</style>