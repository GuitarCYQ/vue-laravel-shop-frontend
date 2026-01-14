<template>
  <div class="user-coupons-page">
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
  

      <!-- 优惠券标签筛选 -->
      <el-card class="coupons-tabs-card" style="margin-top: 20px">
        <el-tabs v-model="activeTab" type="card" @tab-change="handleTabChange">
          <el-tab-pane label="可用优惠券" name="available"></el-tab-pane>
          <el-tab-pane label="已使用" name="used"></el-tab-pane>
          <el-tab-pane label="已过期" name="expired"></el-tab-pane>
        </el-tabs>
      </el-card>

      <!-- 优惠券列表 -->
      <div class="coupons-list" style="margin-top: 20px">
        <!-- 空状态 -->
        <el-empty 
          v-if="filteredCoupons.length === 0" 
          description="暂无优惠券"
        ></el-empty>

        <!-- 优惠券卡片 -->
        <el-card 
          class="coupon-card" 
          v-for="(coupon, idx) in filteredCoupons" 
          :key="idx"
          :class="{
            'coupon-used': coupon.status === 'used',
            'coupon-expired': coupon.status === 'expired'
          }"
        >
          <div class="coupon-content">
            <!-- 优惠券金额/折扣 -->
            <div class="coupon-value">
              <span v-if="coupon.type === 'cash'">
                ¥{{ coupon.value }}
              </span>
              <span v-else-if="coupon.type === 'discount'">
                {{ coupon.value }}折
              </span>
              <span class="coupon-desc">{{ coupon.title }}</span>
            </div>

            <!-- 优惠券条件 -->
            <div class="coupon-rule">
              <p>使用条件：{{ coupon.condition }}</p>
              <p>有效期：{{ coupon.startTime }} - {{ coupon.endTime }}</p>
            </div>

            <!-- 状态/操作按钮 -->
            <div class="coupon-action">
              <el-tag 
                v-if="coupon.status === 'available'" 
                type="success"
              >
                可使用
              </el-tag>
              <el-tag 
                v-else-if="coupon.status === 'used'" 
                type="info"
              >
                已使用
              </el-tag>
              <el-tag 
                v-else-if="coupon.status === 'expired'" 
                type="danger"
              >
                已过期
              </el-tag>

              <el-button 
                v-if="coupon.status === 'available'"
                type="primary" 
                size="small"
                @click="goToUse(coupon.id)"
              >
                立即使用
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </main>

    <!-- 复用页脚组件 -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import Header from "@/components/Layouts/_header.vue";
import Footer from "@/components/Layouts/_footer.vue";

const router = useRouter();

// 激活的标签页
const activeTab = ref("available");

// 优惠券模拟数据
const coupons = ref([
  {
    id: 1,
    title: "满100减20元通用券",
    type: "cash", // cash:现金券, discount:折扣券
    value: 20,
    condition: "订单满100元可用",
    startTime: "2025-07-01",
    endTime: "2025-08-31",
    status: "available" // available:可用, used:已使用, expired:已过期
  },
  {
    id: 2,
    title: "全场8折折扣券",
    type: "discount",
    value: 8,
    condition: "无门槛使用",
    startTime: "2025-07-10",
    endTime: "2025-07-20",
    status: "used"
  },
  {
    id: 3,
    title: "满200减50元家电券",
    type: "cash",
    value: 50,
    condition: "订单满200元可用（限家电类）",
    startTime: "2025-06-01",
    endTime: "2025-06-30",
    status: "expired"
  },
  {
    id: 4,
    title: "满50减10元零食券",
    type: "cash",
    value: 10,
    condition: "订单满50元可用（限零食类）",
    startTime: "2025-07-15",
    endTime: "2025-08-15",
    status: "available"
  }
]);

// 根据标签筛选优惠券
const filteredCoupons = computed(() => {
  return coupons.value.filter(item => {
    if (activeTab.value === "available") return item.status === "available";
    if (activeTab.value === "used") return item.status === "used";
    if (activeTab.value === "expired") return item.status === "expired";
    return true;
  });
});

// 标签切换事件
const handleTabChange = (tab: string) => {
  console.log(`切换到${tab}标签`);
};

// 立即使用优惠券
const goToUse = (couponId: number) => {
  ElMessage.success(`使用优惠券ID：${couponId}`);
  // 跳转到购物车/商品列表页
  router.push("/cart");
};
</script>

<style lang="scss" scoped>
@import '@/assets/css/common/common.scss';

.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 30px 16px;
  box-sizing: border-box; // 新增：确保 padding 不超出容器宽度
}

// 页面标题
.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

// 优惠券卡片样式
.coupons-list {
  // 核心修改：优化 Grid 布局，设置合理的最小宽度和自适应
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); // 最小宽度320px，自动适配列数
  gap: 20px; // 增大间距，避免挤在一起
  padding: 10px 0; // 增加上下内边距
}

.coupon-card {
  border-radius: 12px;
  transition: all 0.2s ease;
  min-height: 140px; // 新增：设置最小高度，避免卡片高度塌陷
  box-sizing: border-box; // 新增：盒模型统一

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  // 已使用/已过期样式置灰
  &.coupon-used,
  &.coupon-expired {
    opacity: 0.7;
    .coupon-action button {
      display: none;
    }
  }

  .coupon-content {
    display: flex;
    align-items: center;
    padding: 20px 16px; // 增大内边距
    box-sizing: border-box;
    // 核心修改：小屏幕下改为纵向排列
    flex-wrap: wrap; 
    gap: 12px; // 新增：元素间距，避免挤在一起

    .coupon-value {
      flex: 0 0 100px; // 调整宽度，适配小屏幕
      min-width: 100px; // 新增：最小宽度，避免挤压
      text-align: center;

      span:first-child {
        font-size: 32px;
        font-weight: 700;
        color: #409eff;
        display: block;
      }

      .coupon-desc {
        font-size: 14px;
        color: #606266;
        margin-top: 4px;
        word-break: break-all; // 新增：文字换行，避免溢出
      }
    }

    .coupon-rule {
      flex: 1;
      min-width: 160px; // 新增：最小宽度，避免挤压
      padding: 0 16px;
      border-left: 1px dashed #ebeef5;
      border-right: 1px dashed #ebeef5;
      box-sizing: border-box;

      p {
        font-size: 14px;
        color: #606266;
        line-height: 1.6;
        margin: 0 0 4px 0; // 调整间距
        word-break: break-all; // 新增：文字换行
      }
    }

    .coupon-action {
       flex: 0 0 100px;
        min-width: 100px;
        // 核心修改：用 Flex 布局实现内部元素水平+垂直居中
        display: flex;
        flex-direction: column; // 纵向排列（tag在上，按钮在下）
        justify-content: center; // 垂直居中（关键！解决顶部对齐问题）
        align-items: center; // 水平居中（替代原来的text-align）
        gap: 8px; // 用gap控制tag和按钮的间距（替代原来的margin-bottom）

       .el-tag {
          // 移除原来的 margin-bottom: 8px;
          // 新增：确保tag本身的文字也垂直居中（针对高一点的tag）
          display: flex;
          align-items: center;
          justify-content: center;
        }
      
        .el-button {
          width: 80%;
        }
    }
  }
}

// 媒体查询：适配移动端（768px以下）
@media (max-width: 768px) {
  .coupons-list {
    grid-template-columns: 1fr; // 移动端只显示1列
    gap: 16px;
  }

  .coupon-content {
    flex-direction: column; // 移动端卡片内容纵向排列
    text-align: center;

    .coupon-rule {
      border-left: none;
      border-right: none;
      border-top: 1px dashed #ebeef5;
      border-bottom: 1px dashed #ebeef5;
      padding: 8px 0;
      margin: 8px 0;
      width: 100%;
    }

    .coupon-value, .coupon-action {
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