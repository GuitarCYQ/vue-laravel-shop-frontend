<template>
  <div class="orders-page">
    <!-- 复用公共头部 -->
    <div>
      <Header />
    </div>

    <main class="container">
      <!-- 页面标题 -->

      <!-- 订单状态筛选栏 -->
      <div class="order-filter">
        <div
          class="filter-item"
          :class="{ active: activeFilter === 'all' }"
          @click="activeFilter = 'all'"
        >
          全部订单
        </div>
        <div
          class="filter-item"
          :class="{ active: activeFilter === 'pending' }"
          @click="activeFilter = 'pending'"
        >
          待支付
        </div>
        <div
          class="filter-item"
          :class="{ active: activeFilter === 'paid' }"
          @click="activeFilter = 'paid'"
        >
          待发货
        </div>
        <div
          class="filter-item"
          :class="{ active: activeFilter === 'shipped' }"
          @click="activeFilter = 'shipped'"
        >
          待收货
        </div>
        <div
          class="filter-item"
          :class="{ active: activeFilter === 'completed' }"
          @click="activeFilter = 'completed'"
        >
          已完成
        </div>
        <div
          class="filter-item"
          :class="{ active: activeFilter === 'refunding' }"
          @click="activeFilter = 'refunding'"
        >
          售后中
        </div>
        <div
          class="filter-item"
          :class="{ active: activeFilter === 'cancelled' }"
          @click="activeFilter = 'cancelled'"
        >
          已取消
        </div>
      </div>

      <!-- 订单列表容器 -->
      <div class="order-list">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-icon size="40" color="#1989fa"><Loading /></el-icon>
          <p>正在加载订单列表...</p>
        </div>

        <!-- 订单卡片 -->
        <div v-else-if="filteredOrders.length > 0">
          <div
            class="order-card"
            v-for="order in filteredOrders"
            :key="order.id"
          >
            <!-- 订单头部 -->
            <div class="order-header">
              <div class="order-info">
                <div class="order-no">
                  订单编号：<span class="no-text">{{ order.no }}</span>
                </div>
                <div class="order-time">{{ order.created_at }}</div>
              </div>
              <div class="order-status">
                <span class="status-badge" :class="getStatusClass(order)">
                  {{ getStatusText(order) }}
                </span>
              </div>
            </div>

            <!-- 商品列表 -->
            <div class="order-products">
              <div
                class="product-item"
                v-for="item in order.items"
                :key="item.id"
              >
                <div class="product-img">
                  <img :src="item.product_img" :alt="item.product_name" />
                </div>
                <div class="product-info">
                  <div class="product-name">{{ item.product_name }}</div>
                  <div class="product-sku">{{ item.sku_name }}</div>
                  <div class="product-price-count">
                    <span class="price">¥{{ item.price }}</span>
                    <span class="count">x{{ item.amount }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 订单底部 -->
            <div class="order-footer">
              <div class="order-total">
                共
                <span class="total-count">{{ getTotalQuantity(order) }}</span>
                件商品 合计：<span class="total-amount"
                  >¥{{ order.total_amount }}</span
                >
              </div>
              <div class="order-actions">
                <button
                  v-if="!order.paid_at && !order.closed"
                  class="btn-primary"
                  @click="goToPay(order.id)"
                >
                  去支付
                </button>
                <button
                  v-if="!order.paid_at && !order.closed"
                  class="btn-secondary"
                  @click="cancelOrder(order.id)"
                >
                  取消订单
                </button>
                <button
                  v-if="
                    order.paid_at &&
                    !order.closed &&
                    order.ship_status === 'received'
                  "
                  class="btn-secondary"
                  @click="confirmReceive(order.id)"
                >
                  确认收货
                </button>
                <button
                  class="btn-secondary"
                  @click="viewOrderDetail(order.id)"
                >
                  查看详情
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态提示 -->
        <div v-else class="empty-container">
          <div class="empty-icon">📦</div>
          <div class="empty-text">暂无相关订单</div>
          <button class="btn-go-shopping" @click="goToShopping">去购物</button>
        </div>
      </div>
    </main>

    <!-- 复用公共底部 -->
    <div>
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Loading } from "@element-plus/icons-vue";

// 复用公共组件
import Header from "@/components/Layouts/_header.vue";
import Footer from "@/components/Layouts/_footer.vue";
import {
  apiGetOrders,
  apiCancelOrder,
  apiReceivedOrders,
} from "@/services/orderService";

const router = useRouter();
const loading = ref(false);
const activeFilter = ref("all");

// 订单商品项
interface OrderItem {
  id: number;
  product_name: string;
  product_img: string;
  sku_name: string;
  price: number;
  amount: number;
}

// 订单接口
interface Order {
  id: number;
  no: string;
  status: string;
  ship_status?: string;
  refund_status?: string;
  paid_at?: string;
  closed: boolean;
  created_at: string;
  total_amount: number;
  items: OrderItem[];
}

// 订单列表
const orderList = ref<Order[]>([]);

// 获取订单列表
const getOrderList = async () => {
  loading.value = true;
  try {
    const { data } = await apiGetOrders();
    orderList.value = data.data || [];
  } catch (error) {
    console.error("获取订单列表失败:", error);
    ElMessage.error("获取订单列表失败");
  } finally {
    loading.value = false;
  }
};

// 根据筛选条件过滤订单
const filteredOrders = computed(() => {
  if (activeFilter.value === "all") {
    return orderList.value;
  }

  return orderList.value.filter((order) => {
    switch (activeFilter.value) {
      case "pending":
        // 待支付：未支付且未取消
        return !order.paid_at && !order.closed;
      case "paid":
        // 待发货：已支付+未取消+未发货
        return (
          order.paid_at && !order.closed && order.ship_status === "pending"
        );
      case "shipped":
        // 待收货：已支付+未取消+已发货（待揽件、运输中、派件中）
        return (
          order.paid_at &&
          !order.closed &&
          ["waiting_pickup", "in_transit", "out_for_delivery"].includes(
            order.ship_status || ""
          )
        );
      case "completed":
        // 已完成：已支付+已收货
        return (
          order.paid_at && !order.closed && order.ship_status === "received"
        );
      case "refunding":
        // 售后中：有退款状态且非初始状态
        return order.refund_status && order.refund_status !== "pending";
      case "cancelled":
        // 已取消：closed为true
        return order.closed;
      default:
        return true;
    }
  });
});

// 获取订单状态文本
const getStatusText = (order: Order) => {
  // 已取消
  if (order.closed) return "已取消";

  // 已支付
  if (order.paid_at) {
    switch (order.ship_status) {
      case "pending":
        return "待发货";
      case "waiting_pickup":
        return "待揽件";
      case "in_transit":
        return "运输中";
      case "out_for_delivery":
        return "派件中";
      case "received":
        return "已收货";
      default:
        return "已支付";
    }
  }

  // 未支付
  return "待支付";
};

// 获取订单状态样式类
const getStatusClass = (order: Order) => {
  // 已取消
  if (order.closed) return "status-cancelled";

  // 已支付
  if (order.paid_at) {
    switch (order.ship_status) {
      case "pending":
        return "status-paid";
      case "waiting_pickup":
        return "status-processing";
      case "in_transit":
        return "status-processing";
      case "out_for_delivery":
        return "status-warning";
      case "received":
        return "status-completed";
      default:
        return "status-paid";
    }
  }

  // 未支付
  return "status-unpaid";
};

// 计算订单商品总数量
const getTotalQuantity = (order: Order) => {
  return order.items.reduce((total, item) => total + item.amount, 0);
};

// 跳转到支付页
const goToPay = (orderId: number) => {
  router.push(`/pay/${orderId}`);
};

// 跳转到订单详情页
const viewOrderDetail = (orderId: number) => {
  router.push(`/order/${orderId}`);
};

// 取消订单
const cancelOrder = async (orderId: number) => {
  try {
    await ElMessageBox.confirm("确定要取消该订单吗？", "确认取消", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    });

    await apiCancelOrder(orderId);
    ElMessage.success("订单已取消");

    // 更新本地订单状态
    const orderIndex = orderList.value.findIndex(
      (order) => order.id === orderId
    );
    if (orderIndex !== -1) {
      orderList.value[orderIndex].closed = true;
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("取消订单失败:", error);
      ElMessage.error("取消订单失败");
    }
  }
};

// 确认收货
const confirmReceive = async (orderId: number) => {
  try {
    await ElMessageBox.confirm("确定已收到商品吗？", "确认收货", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    });

    await apiReceivedOrders(orderId);
    ElMessage.success("确认收货成功");

    // 更新本地订单状态
    const orderIndex = orderList.value.findIndex(
      (order) => order.id === orderId
    );
    if (orderIndex !== -1) {
      orderList.value[orderIndex].ship_status = "received";
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("确认收货失败:", error);
      ElMessage.error("确认收货失败");
    }
  }
};

// 去购物
const goToShopping = () => {
  router.push("/");
};

// 页面挂载时获取订单列表
onMounted(() => {
  // 设置页面标题
  document.title = "我的订单 - 商城";
  getOrderList();
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/common/common.scss";

// 页面整体样式
.orders-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 30px 16px;
}

// 页面标题
.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: $gray-dark;
}

// 订单筛选栏
.order-filter {
  display: flex;
  background-color: $white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  overflow: hidden;

  .filter-item {
    flex: 1;
    text-align: center;
    padding: 16px 0;
    font-size: 14px;
    color: $gray-dark;
    cursor: pointer;
    transition: all 0.2s;

    &.active {
      background-color: $primary;
      color: white;
    }

    &:hover:not(.active) {
      background-color: rgba($primary, 0.05);
    }
  }
}

// 订单列表
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// 加载状态
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  .el-icon {
    margin-bottom: 16px;
    animation: rotate 2s linear infinite;
  }

  p {
    font-size: 16px;
    color: $gray-dark;
    margin: 0;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 订单卡片
.order-card {
  background-color: $white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 20px;

  // 订单头部
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid $gray-light;

    .order-info {
      .order-no {
        font-size: 14px;
        color: $gray;
        margin-bottom: 4px;

        .no-text {
          color: $gray-dark;
          margin-left: 4px;
        }
      }

      .order-time {
        font-size: 12px;
        color: $gray;
      }
    }

    .order-status {
      .status-badge {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;

        &.status-unpaid {
          background-color: rgba(245, 108, 108, 0.1);
          color: #f56c6c;
        }

        &.status-paid {
          background-color: rgba(103, 194, 58, 0.1);
          color: #67c23a;
        }

        &.status-processing {
          background-color: rgba(64, 158, 255, 0.1);
          color: #409eff;
        }

        &.status-warning {
          background-color: rgba(230, 162, 60, 0.1);
          color: #e6a23c;
        }

        &.status-completed {
          background-color: rgba(103, 194, 58, 0.1);
          color: #67c23a;
        }

        &.status-cancelled {
          background-color: rgba(144, 147, 153, 0.1);
          color: #909399;
        }
      }
    }
  }

  // 商品列表
  .order-products {
    padding: 20px;

    .product-item {
      display: flex;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid $gray-light;

      &:last-child {
        border-bottom: none;
      }

      .product-img {
        width: 80px;
        height: 80px;
        border-radius: 4px;
        overflow: hidden;
        background-color: #f9f9f9;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .product-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .product-name {
          font-size: 14px;
          color: $gray-dark;
          line-height: 1.5;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .product-sku {
          font-size: 12px;
          color: $gray;
          margin-bottom: 8px;
        }

        .product-price-count {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .price {
            font-size: 14px;
            color: #f56c6c;
            font-weight: 500;
          }

          .count {
            font-size: 12px;
            color: $gray;
          }
        }
      }
    }
  }

  // 订单底部
  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-top: 1px solid $gray-light;

    .order-total {
      font-size: 14px;
      color: $gray-dark;

      .total-count {
        font-weight: 500;
        margin: 0 4px;
      }

      .total-amount {
        font-size: 16px;
        font-weight: 600;
        color: #f56c6c;
        margin-left: 8px;
      }
    }

    .order-actions {
      display: flex;
      gap: 10px;

      .btn-primary {
        padding: 8px 16px;
        background-color: $primary;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background-color: darken($primary, 10%);
        }
      }

      .btn-secondary {
        padding: 8px 16px;
        background-color: transparent;
        color: $gray-dark;
        border: 1px solid $gray-light;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border-color: $primary;
          color: $primary;
        }
      }
    }
  }
}

// 空状态
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background-color: $white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .empty-text {
    font-size: 16px;
    color: $gray-dark;
    margin-bottom: 24px;
  }

  .btn-go-shopping {
    padding: 10px 24px;
    background-color: $primary;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: darken($primary, 10%);
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .order-filter {
    .filter-item {
      padding: 12px 0;
      font-size: 12px;
    }
  }

  .order-card {
    .order-header {
      flex-direction: column;
      align-items: flex-start;
      padding: 12px 16px;
      gap: 8px;
    }

    .order-products {
      padding: 16px;

      .product-item {
        gap: 12px;

        .product-img {
          width: 60px;
          height: 60px;
        }
      }
    }

    .order-footer {
      flex-direction: column;
      align-items: flex-end;
      padding: 12px 16px;
      gap: 12px;

      .order-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
  }
}
</style>
