<template>
  <div class="order-list-page">
    <!-- 复用公共头部（与支付页/结算页一致） -->
    <Header></Header>

    <main class="container">
      <!-- 页面标题（统一标题样式） -->
      <h2 class="page-title">我的订单</h2>

      <!-- 订单状态筛选栏（与结算页步骤条风格呼应） -->
      <div class="order-filter">
        <div 
          class="filter-item" 
          :class="{ active: activeFilter === 'all' }"
          @click="activeFilter = 'all'"
        >
          全部
        </div>
        <div 
          class="filter-item" 
          :class="{ active: activeFilter === 'unpaid' }"
          @click="activeFilter = 'unpaid'"
        >
          待支付
        </div>
		<div
		  class="filter-item" 
		  :class="{ active: activeFilter === 'pendingShip' }"
		  @click="activeFilter = 'pendingShip'"
		>
		  待发货
		</div>
		<div
		  class="filter-item" 
		  :class="{ active: activeFilter === 'shipping' }"
		  @click="activeFilter = 'shipping'"
		>
		  待收货
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
        <!-- 订单卡片（循环渲染，与支付页卡片风格统一） -->
        <div class="order-card" v-for="order in filteredOrders" :key="order.id">
          <!-- 订单头部：保留编号/时间，新增物流状态标签 -->
			<div class="order-header">
			  <div class="order-no">
				订单编号：<span class="no-text">{{ order.no }}</span>
			  </div>
			  <div class="order-time">创建时间：{{ order.created_at }}</div>
			  <div class="order-status-group">
				<!-- 订单状态（原status） -->
				<span class="order-status" :class="getOrderStatusClass(order)">
				  {{ getOrderStatusText(order) }}
				</span>
				<!-- 物流状态（新增，对应后端 ship_status） -->
				<span class="ship-status" :class="getShipStatusClass(order.ship_status)" v-if="isPaid(order) && !isCancelled(order)">
				  {{ getShipStatusText(order.ship_status) }}
				</span>
			  </div>
			</div>

          <!-- 商品列表：保留原结构，适配后端返回的items字段 -->
          <div class="order-products">
            <div class="product-item" v-for="item in order.items" :key="item.sku_id">
              <div class="product-img">
                <img :src="item.product_img" :alt="item.product_name">
              </div>
              <div class="product-info">
                <div class="product-name">{{ item.product_name }}</div>
                <div class="product-sku">{{ item.sku_name }}</div>
                <div class="product-price-count">
                  <span class="price">¥{{ item.price }}</span> <!-- 假设后端存分，前端转元 -->
                  <span class="count">x{{ item.amount }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 订单底部：金额+操作按钮（按状态显示不同按钮） -->
          <div class="order-footer">
			  <div class="order-total">
				合计：<span class="total-amount">¥{{ order.total_amount }}</span>
				<span class="total-desc">(共{{ order.items.length }}件商品)</span>
				<!-- 新增：退款状态提示（对应后端 refund_status） -->
				<span class="refund-status-tip" v-if="order.refund_status && order.refund_status !== 'pending'">
				  退款状态：{{ getRefundStatusText(order.refund_status) }}
				</span>
			  </div>
			  <div class="order-actions">
				<!-- 待支付：去支付/取消 -->
				<template v-if="order.paid_at === null">
				  <button class="btn-action btn-pay" @click="goToPay(order.id)">去支付</button>
				  <button class="btn-action btn-cancel" @click="cancelOrder(order.id)">取消订单</button>
				</template>

				<!-- 已支付+未发货：催发货/申请售后 -->
				<template v-else-if="order.paid_at !== null && order.ship_status === 'pending'">
				  <button class="btn-action btn-remind" @click="remindShip(order.id)">催发货</button>
				  <button class="btn-action btn-refund" @click="applyRefund(order.id)">申请售后</button>
				</template>

				<!-- 已支付+已发货+未收货：确认收货/查看物流 -->
				<template v-else-if="order.paid_at !== null && ['waiting_pickup', 'in_transit', 'out_for_delivery'].includes(order.ship_status)">
				  <button class="btn-action btn-logistics" @click="viewLogistics(order.id)">查看物流</button>
				  <button class="btn-action btn-confirm-receive" @click="confirmReceive(order.id)">确认收货</button>
				  <button class="btn-action btn-refund" @click="applyRefund(order.id)">申请售后</button>
				</template>

				<!-- 已支付+已收货：申请售后/查看详情 -->
				<template v-else-if="order.paid_at !== null && order.ship_status === 'received'">
				  <!-- <button class="btn-action btn-detail" @click="goToDetail(order.id)">查看详情</button> -->
				  <button class="btn-action btn-refund" @click="applyRefund(order.id)">申请售后</button>
				</template>

				<!-- 售后中：查看售后进度 -->
				<template v-else-if="order.refund_status && order.refund_status !== 'pending'">
				  <button class="btn-action btn-refund-progress" @click="viewRefundProgress(order.id)">查看售后</button>
				</template>

				<!-- 已取消：仅查看详情 -->
				  <button class="btn-action btn-detail" @click="goToDetail(order.id)">查看详情</button>
			  </div>
			</div>
        </div>

        <!-- 空状态提示（无订单时显示） -->
        <div class="empty-order" v-if="filteredOrders.length === 0">
          <div class="empty-icon">📦</div>
          <div class="empty-text">暂无相关订单</div>
          <button class="btn-go-shopping" @click="goToShopping">
            去购物
          </button>
        </div>
      </div>
    </main>

    <!-- 复用公共底部 -->
    <Footer></Footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

// 复用公共组件
import Header from '@/components/Layouts/_header.vue';
import Footer from '@/components/Layouts/_footer.vue';
import { apiGetOrders, apiReceivedOrders } from '@/services/orderService' 

const router = useRouter();
const loading = ref(false)

//  状态定义：与后端Order模型常量对齐
type OrderStatus = 'unpaid' | 'paid' | 'cancelled';
type ShipStatus = 'pending' | 'waiting_pickup' | 'in_transit' | 'out_for_delivery' | 'received' | 'return_pending' | 'return_waiting_pickup' | 'return_in_transit' | 'return_received' | 'exception';
type RefundStatus = 'pending' | 'applied' | 'reviewing' | 'processing' | 'success' | 'part_success' | 'failed' | 'rejected' | 'cancelled';

// 订单列表数据：适配后端返回结构
interface OrderItem {
  sku_id: number;
  product_name: string;
  product_img: string;
  sku_name: string;
  price: number;
  amount: number;
}

interface Order {
  id: number;
  no: string;
  created_at: string;
  user_id: number;
  address: string;
  total_amount: number; 
  remark: string;
  paid_at?: string;
  payment_method?: string;
  payment_no: string;
  refund_status: RefundStatus;
  refund_no?: string;
  closed: boolean;
  ship_status: ShipStatus;
  ship_data?: string; // 物流信息
  extra?: string;
  items: OrderItem[];
}


// 订单状态筛选（默认全部）
const activeFilter = ref('all');
const orderList = ref<Order[]>([])

const getOrderList =  async () => {
	loading.value = true
	try {
		const {data} = await apiGetOrders()
		orderList.value = data.data
		console.log(data);
	} catch (err) {
		console.log(err);
	} finally {
		loading.value = false
	}
}




// 判断是否已经支付
const isPaid = (order: Order) => {
	return !!order.paid_at;
}

// 判断订单是否已取消（根据closed字段）
const isCancelled = (order: Order) => {
  return order.closed;
};


// 订单状态文本映射（实际项目可从接口返回或用枚举）
const getOrderStatusText = (order: Order) => {
   if (isCancelled(order)) {
      return '已取消';
    }
    if (isPaid(order)) {
      return '已支付';
    }
    return '待支付';
};

// 根据筛选条件过滤订单
const filteredOrders = computed(() => {
   return orderList.value.filter(order => {
      switch (activeFilter.value) {
        case 'all':
          return true;
        case 'unpaid':
          // 待支付：未支付且未取消
          return !isPaid(order) && !isCancelled(order);
        case 'pendingShip':
          // 待发货：已支付+未取消+未发货
          return isPaid(order) && !isCancelled(order) && order.ship_status === 'pending';
        case 'shipping':
          // 待收货：已支付+未取消+运输中
          return isPaid(order) && !isCancelled(order) && 
                 ['waiting_pickup', 'in_transit', 'out_for_delivery'].includes(order.ship_status);
        case 'refunding':
          // 售后中：有退款状态且非初始状态
          return order.refund_status && order.refund_status !== 'pending';
        case 'cancelled':
          // 已取消：closed为true
          return isCancelled(order);
        default:
          return true;
      }
    });
});

const getShipStatusText = (status: ShipStatus) => {
  const map = {
    pending: '未发货',
    waiting_pickup: '待揽件',
    in_transit: '运输中',
    out_for_delivery: '派件中',
    received: '已收货',
    return_pending: '退货待发货',
    return_waiting_pickup: '退货待揽件',
    return_in_transit: '退货运输中',
    return_received: '退货已签收',
    exception: '物流异常'
  };
  console.log(status,'sss')
  return map[status] || '未知物流状态';
};

const getRefundStatusText = (status: RefundStatus) => {
  const map = {
    pending: '未退款',
    applied: '已提交退款申请',
    reviewing: '退款审核中',
    processing: '退款处理中',
    success: '全额退款成功',
    part_success: '部分退款成功',
    failed: '退款失败',
    rejected: '退款申请已驳回',
    cancelled: '退款申请已取消'
  };
  return map[status] || '未知退款状态';
};

// 7. 状态样式映射：统一配色风格
const getOrderStatusClass = (status: OrderStatus) => {
  const map = {
    unpaid: 'status-unpaid', // 红色
    paid: 'status-paid',     // 绿色
    cancelled: 'status-cancelled' // 灰色
  };
  return map[status] || '';
};

const getShipStatusClass = (status: ShipStatus) => {
  const map = {
    pending: 'status-pending', // 灰色
    waiting_pickup: 'status-processing', // 蓝色
    in_transit: 'status-processing',
    out_for_delivery: 'status-warning', // 橙色
    received: 'status-success', // 绿色
    return_pending: 'status-warning',
    return_waiting_pickup: 'status-warning',
    return_in_transit: 'status-warning',
    return_received: 'status-success',
    exception: 'status-error' // 红色
  };
  return map[status] || '';
};

// 8. 工具函数：时间格式化（适配后端created_at）
const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 跳转支付页（实际项目携带订单ID）
const goToPay = (orderId: number) => {
  router.push(`/pay/${orderId}`);
};

// 跳转订单详情页
const goToDetail = (orderId: number) => {
  router.push({
	  path:	`/user/orders/detail/${orderId}`,

  });
};

// 取消订单（假逻辑，实际项目调用接口）
const cancelOrder = async (orderId: number) => {
  try {
    await ElMessageBox.confirm(
      '确定取消该订单吗？取消后订单将关闭（待支付订单会返还库存）',
      '确认取消',
      { type: 'warning' }
    );
    // 实际项目：调用取消订单接口，更新列表数据
    orderList.value = orderList.value.map(order => 
      order.id === orderId ? { ...order, status: 'cancelled' } : order
    );
    ElMessage.success('订单已取消');
  } catch (error) {
    // 取消操作不提示错误
  }
};

// 确认收货
const confirmReceive = async (orderId: number) => {
  try {
    await ElMessageBox.confirm(
      '确定已收到商品吗？确认后将完成订单',
      '确认收货',
      { 
        type: 'warning',
        cancelButtonText: '取消',
        confirmButtonText: '确定'
      },
      
    );
    await apiReceivedOrders(orderId); // 调用后端确认收货接口
    ElMessage.success('确认收货成功');
    getOrderList();
  } catch (err) {
    // 取消操作不提示
  }
};

// 催发货
const remindShip = async (orderId: number) => {
  try {
    // await apiRemindShip(orderId); // 调用后端催发货接口
    ElMessage.success('催发货通知已发送');
  } catch (err: any) {
    ElMessage.error(err.message || '催发货失败');
  }
};


// 申请售后（假逻辑）
const applyRefund = (orderId: number) => {
  ElMessage.info(`订单${orderId}的售后申请功能待开发`);
};

// 跳转物流详情页
const viewLogistics = (orderId: number) => {
  router.push(`/logistics?orderId=${orderId}`); 
};

// 跳转售后进度页
const viewRefundProgress = (orderId: number) => {
  router.push(`/refund-detail?orderId=${orderId}`); 
};

// 去购物（跳转首页或商品列表）
const goToShopping = () => {
  router.push('/');
};

// 页面挂载时拉取订单列表
onMounted(() => {
  getOrderList();
});
</script>


<style lang="scss" scoped>
/* // 引入公共样式变量（与支付页、结算页共用） */
@import '@/assets/css/common/common.scss';


// /* // 页面整体样式 */
// .order-list-page {
//   background-color: $gray-light;
//   min-height: 100vh;
// }

/* // 容器样式（与其他页面保持一致的宽度和边距） */
.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 30px 16px;
}

/* // 页面标题（统一标题风格：字号、字重、颜色） */
.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: $gray-dark;
}

/* // 订单筛选栏（与结算页步骤条视觉呼应：白色背景、阴影、圆角） */
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
    padding: 14px 0;
    font-size: 14px;
    color: $gray-dark;
    cursor: pointer;
    transition: all 0.2s;

    /* // 选中状态（蓝色背景+白色文字，与支付页选中风格统一） */
    &.active {
      background-color: $primary;
      color: white;
    }

    /* // 未选中hover效果（浅灰背景，提升交互感） */
    &:hover:not(.active) {
      background-color:$gray-light;
    }
  }
}

/* // 订单列表容器（纵向间距统一） */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* // 订单卡片样式（核心样式，与支付页卡片结构一致） */
.order-card {
  background-color: $white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;

  /* // 1. 订单头部：编号+时间+状态（横向布局，底部边框分隔） */
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid $gray-light;
    font-size: 14px;

    .order-no {
      color: $gray;

      .no-text {
        color: $gray-dark;
        margin-left: 4px;
      }
    }

    .order-time {
      color: $gray;
    }

    /* // 订单状态标签（不同状态不同配色，与支付页状态提示一致） */
    .order-status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;

      /* // 待支付（红色系） */
      &.status-unpaid {
        background-color: rgba(245, 108, 108, 0.1);
        color: #f56c6c;
      }

      /* // 已支付（绿色系） */
      &.status-paid {
        background-color: rgba(72, 187, 120, 0.1);
        color: #48bb78;
      }

      /* // 已取消（灰色系） */
      &.status-cancelled {
        background-color: rgba(156, 163, 175, 0.1);
        color: #9ca3af;
      }
    }
  }

  /* // 2. 订单商品列表（与结算页商品布局结构一致） */
  .order-products {
    padding: 20px;

    .product-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px 0;

      /* // 商品图片容器（固定尺寸，圆角，居中显示） */
      .product-img {
        width: 80px;
        height: 80px;
        border-radius: 4px;
        overflow: hidden;
        background-color: #f9f9f9;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        img {
          max-width: 90%;
          max-height: 90%;
          object-fit: contain;
        }
      }

      /* // 商品信息区（纵向排列，文字溢出处理） */
      .product-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;

        /* // 商品名称（最多2行，溢出省略） */
        .product-name {
          font-size: 14px;
          color: $gray-dark;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* // 商品规格（灰色小字体） */
        .product-sku {
          font-size: 12px;
          color: $gray;
        }

        /* // 价格+数量（横向对齐，价格红色突出） */
        .product-price-count {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;

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

  /* // 3. 订单底部：金额+操作按钮（横向布局，顶部边框分隔） */
  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-top: 1px solid $gray-light;
    font-size: 14px;

    /* // 合计金额（红色突出，与支付页金额风格一致） */
    .order-total {
      .total-amount {
        font-size: 16px;
        font-weight: 600;
        color: #f56c6c;
        margin: 0 4px;
      }

      .total-desc {
        font-size: 12px;
        color: $gray;
        margin-left: 8px;
      }
    }

    /* // 操作按钮组（横向排列，间距统一） */
    .order-actions {
      display: flex;
      gap: 10px;

      .btn-action {
        padding: 6px 16px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid transparent;

        /* // 去支付（蓝色背景，与支付页确认按钮一致） */
        &.btn-pay {
          background-color: $primary;
          color: white;
          border-color: $primary;

          &:hover {
            background-color: darken($primary, 10%);
          }
        }

        /* // 取消订单（红色边框+文字） */
        &.btn-cancel {
          background-color: white;
          color: #f56c6c;
          border-color: #f56c6c;

          &:hover {
            background-color: rgba(245, 108, 108, 0.05);
          }
        }

        /* // 查看详情（灰色边框+文字） */
        &.btn-detail {
          background-color: white;
          color: $gray-dark;
          border-color: $gray-light;

          &:hover {
            background-color:$gray-light;
          }
        }

        &.btn-confirm-receive {
          background-color: white;
          color: #48bb78;
          border-color: #48bb78;

          &:hover {
            background-color: rgba(72, 187, 120, 0.05);
          }
        }

        /* // 申请售后（绿色边框+文字） */
        &.btn-refund {
          background-color: white;
          color: #f0af24;
          border-color: #f0af24;

          &:hover {
            background-color: rgba(72, 187, 120, 0.05);
          }
        }
      }
    }
  }
}

/* // 空订单状态（居中显示，引导去购物） */
.empty-order {
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
    color: $gray-light;
    margin-bottom: 16px;
  }

  .empty-text {
    font-size: 16px;
    color: $gray;
    margin-bottom: 24px;
  }

  /* // 去购物按钮（与结算页按钮风格一致） */
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

/* // 移动端响应式适配（与其他页面断点一致） */
@media (max-width: 768px) {
  /* // 订单头部：纵向排列（避免移动端拥挤） */
  .order-card .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 16px;
  }

  /* // 订单底部：纵向排列（按钮全屏宽度） */
  .order-card .order-footer {
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
    padding: 12px 16px;

    .order-actions {
      width: 100%;
      justify-content: flex-end;
    }

    .btn-action {
      padding: 8px 12px;
      font-size: 12px;
    }
  }

  /* // 商品信息：简化布局（适应小屏幕） */
  .order-products {
    padding: 12px 16px;
  }

  .product-item {
    gap: 12px;
  }

  .product-img {
    width: 60px;
    height: 60px;
  }
}
</style>