<template>
  <div class="user-favorites-page">
    <!-- 复用头部组件 -->
    <Header>
      <template #nav>
        <nav class="main-nav hidden md:flex">
          <ul class="nav-list">
            <li class="nav-item"><a href="/">首页</a></li>
            <li class="nav-item"><a href="/category">商品分类</a></li>
            <li class="nav-item"><a href="/cart">购物车</a></li>
          </ul>
        </nav>
      </template>

      <template #icon>
        <div class="nav-actions">
          <button class="action-btn cart-btn" @click="$router.push('/cart')">
            <i class="icon-cart"></i>
            <span class="cart-count">3</span>
          </button>
        </div>
      </template>
    </Header>

    <!-- 主体内容 -->
    <main class="container">

      <!-- 收藏商品列表 -->
      <el-card class="favorites-list-card" style="margin-top: 20px">
        <!-- 空状态 -->
        <el-empty 
          v-if="favoritesList.length === 0" 
          description="暂无收藏商品"
        ></el-empty>

        <!-- 商品列表 -->
        <div class="favorites-grid" v-else>
          <el-card 
            class="favorite-item-card" 
            v-for="(item, idx) in favoritesList" 
            :key="idx"
            hover
          >
            <div class="favorite-item">
              <!-- 商品图片 -->
              <div class="product-img">
                <img :src="item.imgUrl" alt="商品图片" @click="goToProductDetail(item.id)" />
              </div>

              <!-- 商品信息 -->
              <div class="product-info">
                <h3 class="product-name" @click="goToProductDetail(item.id)">
                  {{ item.name }}
                </h3>
                <p class="product-price">¥{{ item.price }}</p>
                <p class="product-desc">{{ item.desc }}</p>
              </div>

              <!-- 操作按钮 -->
              <div class="product-actions">
                <el-button 
                  type="primary" 
                  size="small"
                  @click="addToCart(item)"
                >
                  加入购物车
                </el-button>
                <el-button 
                  type="danger" 
                  size="small"
                  @click="removeFavorite(item.id)"
                >
                  取消收藏
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </el-card>
    </main>

    <!-- 复用页脚组件 -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import Header from "@/components/Layouts/_header.vue";
import Footer from "@/components/Layouts/_footer.vue";

const router = useRouter();

// 收藏商品模拟数据
const favoritesList = ref([
  {
    id: 1,
    name: "夏季纯棉短袖T恤 宽松百搭",
    imgUrl: "https://picsum.photos/id/96/120/120",
    price: 59.9,
    desc: "100%纯棉 | 多色可选 | 宽松版型",
    addTime: "2025-07-10"
  },
  {
    id: 2,
    name: "无线蓝牙耳机 主动降噪",
    imgUrl: "https://picsum.photos/id/97/120/120",
    price: 299,
    desc: "主动降噪 | 超长续航 | 蓝牙5.3",
    addTime: "2025-07-15"
  },
  {
    id: 3,
    name: "智能手表 心率监测 运动计步",
    imgUrl: "https://picsum.photos/id/98/120/120",
    price: 199,
    desc: "多运动模式 | 心率监测 | 防水",
    addTime: "2025-07-18"
  },
  {
    id: 4,
    name: "便携充电宝 20000mAh 快充",
    imgUrl: "https://picsum.photos/id/99/120/120",
    price: 89,
    desc: "22.5W快充 | 大容量 | 多接口",
    addTime: "2025-07-20"
  }
]);

// 跳转到商品详情页
const goToProductDetail = (productId: number) => {
  router.push(`/product/${productId}`);
};

// 加入购物车
const addToCart = (product: any) => {
  ElMessage.success(`${product.name} 已加入购物车`);
  // 实际项目中调用加入购物车接口
};

// 取消收藏（带确认弹窗）
const removeFavorite = async (productId: number) => {
  try {
    await ElMessageBox.confirm(
      "确定要取消收藏该商品吗？",
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );

    // 过滤掉取消收藏的商品
    favoritesList.value = favoritesList.value.filter(item => item.id !== productId);
    ElMessage.success("取消收藏成功");
  } catch (error) {
    ElMessage.info("已取消操作");
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/css/common/common.scss';

.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 30px 16px;
  box-sizing: border-box; // 新增：盒模型统一
}

// 页面标题
.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

// 收藏商品列表
.favorites-grid {
  // 核心修改：优化 Grid 布局
  display: grid;
  // grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); // 最小宽度280px
  gap: 20px; // 增大间距
  padding: 10px 0;
}

.favorite-item-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  min-height: 180px; // 新增：最小高度，避免塌陷
  box-sizing: border-box;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .favorite-item {
    display: flex;
    align-items: center;
    padding: 16px;
    box-sizing: border-box;
    gap: 12px; // 新增：元素间距
    width: 100%; // 确保父容器占满宽度

    // 电脑端默认横向排列
    @media (min-width: 769px) {
      flex-direction: row;
    }

    // 手机端强制纵向排列
    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
      padding: 12px;
    }

    .product-img {
      flex: 0 0 100px; // 调整宽度
      min-width: 100px; // 新增：最小宽度
      height: 100px;
      overflow: hidden;
      border-radius: 4px;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.05);
        }
      }
    }

    .product-info {
      flex: 1;
      min-width: 140px; // 新增：最小宽度，避免挤压
      padding: 0 8px; // 调整内边距

      .product-name {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        margin: 0 0 8px 0;
        cursor: pointer;
        word-break: break-all; // 新增：文字换行
        line-height: 1.4; // 调整行高

        &:hover {
          color: #409eff;
        }
      }

      .product-price {
        font-size: 18px;
        font-weight: 700;
        color: #f56c6c;
        margin: 0 0 4px 0;
      }

      .product-desc {
        font-size: 12px;
        color: #909399;
        margin: 0;
        word-break: break-all; // 新增：文字换行
      }
    }

    .product-actions {
      // 基础配置：电脑端宽度200px（适配两个横向按钮），最小宽度保证不挤压
      flex: 0 0 200px; 
      min-width: 120px; // 手机端最小宽度
      display: flex;
      gap: 8px; // 按钮间距（横向/纵向都生效）
      justify-content: center; // 水平居中
      align-items: center; // 垂直居中
      box-sizing: border-box; // 盒模型统一，避免padding撑宽

      // 电脑端：按钮横向并排（左右分布）
  @media (min-width: 769px) {
    flex-direction: row; // 明确横向
    .el-button {
      flex: 1; // 两个按钮平分宽度（最灵活）
      min-width: 80px; // 按钮最小宽度，避免太窄
      padding: 6px 0; // 优化按钮内边距
      font-size: 12px; // 适配宽度
    }
  }

  // 手机端：按钮上下对齐（纵向堆叠）
  @media (max-width: 768px) {
    flex-direction: column; // 强制纵向
    width: 100%; // 手机端占满父容器宽度
    flex: none; // 取消固定宽度，适配手机端
    .el-button {
      width: 100%; // 按钮占满宽度
      padding: 8px 0; // 手机端按钮稍高，更易点击
      font-size: 14px;
    }
  }
    }
  }
}

// 媒体查询：适配移动端（768px以下）
@media (max-width: 768px) {
  .favorites-grid {
    grid-template-columns: 1fr; // 移动端1列
    gap: 16px;
  }

  .favorite-item {
    flex-direction: column; // 移动端纵向排列
    text-align: center;

    .product-img {
      width: 120px;
      height: 120px;
      flex: none;
      margin: 0 auto;
    }

    .product-info {
      width: 100%;
      padding: 8px 0;
      flex: none;
    }

    .product-actions {
      width: 100%;
      flex: none;
    }
  }
}

Header {
  margin-bottom: 10px;
}

Footer {
  margin-top: 50px;
}
</style>