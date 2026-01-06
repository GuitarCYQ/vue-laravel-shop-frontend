<template>
  <div class="order-detail-page">
    <!-- 公共头部 -->
    <Header></Header>

    <main class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2 class="page-title">订单详情</h2>
        <button class="btn-back" @click="goBack">← 返回订单列表</button>
      </div>

      <!-- 加载状态 -->
      <div class="loading-container" v-if="loading">
        <div class="loading-spinner"></div>
      </div>

      <!-- 订单不存在提示 -->
      <div class="empty-container" v-else-if="!order.id">
        <div class="empty-icon">❌</div>
        <div class="empty-text">订单不存在或已被删除</div>
        <button class="btn-go-list" @click="goToOrderList">返回订单列表</button>
      </div>

      <!-- 订单详情内容 -->
      <div class="order-detail" v-else>
        <!-- 1. 订单基本信息卡片 -->
        <div class="detail-card">
          <div class="card-header">
            <h3 class="card-title">订单基本信息</h3>
          </div>
          <div class="card-body">
            <div class="info-row">
              <span class="info-label">订单编号：</span>
              <span class="info-value">{{ order.no }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">下单时间：</span>
              <span class="info-value">{{ order.created_at }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">订单状态：</span>
              <span class="info-value status-tag" :class="getOrderStatusClass(order)">
                {{ getOrderStatusText(order) }}
              </span>
            </div>
            <div class="info-row" v-if="isPaid(order) && !isCancelled(order)">
              <span class="info-label">物流状态：</span>
              <span class="info-value status-tag" :class="getShipStatusClass(order.ship_status)">
                {{ getShipStatusText(order.ship_status) }}
              </span>
            </div>
            <div class="info-row" v-if="order.refund_status && order.refund_status !== 'pending'">
              <span class="info-label">退款状态：</span>
              <span class="info-value status-tag" :class="getRefundStatusClass(order.refund_status)">
                {{ getRefundStatusText(order.refund_status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 2. 收货地址卡片 -->
        <div class="detail-card">
          <div class="card-header">
            <h3 class="card-title">收货地址</h3>
          </div>
          <div class="card-body">
            <div class="address-info" v-if="order.address">
              <div class="address-row">
                <span class="address-label">收货人：</span>
                <span class="address-value">{{ order.address.contact_name }} {{ order.address.contact_phone }}</span>
              </div>
              <div class="address-row">
                <span class="address-label">收货地址：</span>
                <span class="address-value">
                  {{ order.address.address}}
                </span>
              </div>
            </div>
            <div class="empty-tip" v-else>
              暂无收货地址信息
            </div>
          </div>
        </div>

        <!-- 3. 支付信息卡片 -->
        <div class="detail-card">
          <div class="card-header">
            <h3 class="card-title">支付信息</h3>
          </div>
          <div class="card-body">
            <div class="info-row" v-if="isPaid(order)">
              <span class="info-label">支付时间：</span>
              <span class="info-value">{{ formatTime(order.paid_at) }}</span>
            </div>
            <div class="info-row" v-if="order.payment_method">
              <span class="info-label">支付方式：</span>
              <span class="info-value">{{ getPaymentMethodText(order.payment_method) }}</span>
            </div>
            <div class="info-row" v-if="order.payment_no">
              <span class="info-label">支付单号：</span>
              <span class="info-value">{{ order.payment_no }}</span>
            </div>
            <div class="info-row" v-if="order.refund_no">
              <span class="info-label">退款单号：</span>
              <span class="info-value">{{ order.refund_no }}</span>
            </div>
            <div class="info-row" v-else-if="order.paid_at === null">
              <span class="info-value text-warning">
                该订单尚未支付，请注意支付时效
              </span>
            </div>
          </div>
        </div>

        <!-- 4. 物流信息卡片（已支付且未取消时显示） -->
        <div class="detail-card" v-if="isPaid(order) && !isCancelled(order)">
          <div class="card-header">
            <h3 class="card-title">物流信息</h3>
          </div>
          <div class="card-body">
            <div class="logistics-info" v-if="order.ship_data">
              <div class="info-row">
                <span class="info-label">快递公司：</span>
                <span class="info-value">{{ parsedShipData.express_name || '未知' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">快递单号：</span>
                <span class="info-value">{{ parsedShipData.express_no || '暂无' }}</span>
              </div>
              <!-- 物流进度（优先用接口数据，无则用模拟数据） -->
              <div class="logistics-timeline" v-if="logisticsRecords.length > 0">
                <h4 class="timeline-title">物流进度</h4>
                <div class="timeline-list">
                  <div class="timeline-item" v-for="(record, index) in logisticsRecords" :key="index">
                    <div class="timeline-dot" :class="{ active: index === 0 }"></div>
                    <div class="timeline-content">
                      <div class="timeline-text">{{ record.content }}</div>
                      <div class="timeline-time">{{ formatTime(record.time) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="empty-tip" v-else>
              暂无物流信息，订单尚未发货
            </div>
          </div>
        </div>

        <!-- 5. 商品清单卡片 -->
        <div class="detail-card">
          <div class="card-header">
            <h3 class="card-title">商品清单（共{{ order.items.length }}件）</h3>
          </div>
          <div class="card-body">
            <div class="product-table">
              <div class="table-header">
                <div class="table-col col-img">商品图片</div>
                <div class="table-col col-info">商品信息</div>
                <div class="table-col col-price">单价</div>
                <div class="table-col col-quantity">数量</div>
                <div class="table-col col-total">小计</div>
              </div>
              <div class="table-body">
                <div class="table-row" v-for="item in order.items" :key="item.sku_id">
                  <div class="table-col col-img">
                    <img :src="item.product_img || require('@/assets/images/default-product.png')" :alt="item.product_name" class="product-thumb">
                  </div>
                  <div class="table-col col-info">
                    <div class="product-name">{{ item.product_name }}</div>
                    <div class="product-sku">{{ item.sku_name || '无规格信息' }}</div>
                  </div>
                  <div class="table-col col-price">¥{{ item.price }}</div>
                  <div class="table-col col-quantity">{{ item.amount }}</div>
                  <div class="table-col col-total">¥{{ (item.price * item.amount) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 6. 订单金额卡片 -->
        <div class="detail-card">
          <div class="card-header">
            <h3 class="card-title">订单金额</h3>
          </div>
          <div class="card-body">
            <div class="amount-list">
              <div class="amount-item">
                <span class="amount-label">商品总价：</span>
                <span class="amount-value">¥{{ order.total_amount }}</span>
              </div>
              <div class="amount-item">
                <span class="amount-label">运费：</span>
                <span class="amount-value">¥{{ order.freight ? order.freight: '0.00' }}</span>
              </div>
             <!-- <div class="amount-item">
                <span class="amount-label">优惠金额：</span>
                <span class="amount-value text-red">-¥{{ calculateDiscount().toFixed(2) }}</span>
              </div> -->
              <div class="amount-item total-amount">
                <span class="amount-label">实付金额：</span>
                <span class="amount-value">¥{{ order.total_amount }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 7. 操作按钮区（底部固定） -->
        <div class="action-bar">
          <div class="action-buttons">
            <!-- 待支付：去支付/取消订单 -->
            <template v-if="!isPaid(order) && !isCancelled(order)">
              <button class="btn-action btn-cancel" @click="cancelOrder(order.id)">取消订单</button>
              <button class="btn-action btn-pay" @click="goToPay(order.id)">去支付</button>
            </template>

            <!-- 已支付+未发货：催发货/申请售后 -->
            <template v-else-if="isPaid(order) && !isCancelled(order) && order.ship_status === 'pending'">
              <button class="btn-action btn-refund" @click="applyRefund(order.id)">申请售后</button>
              <button class="btn-action btn-remind" @click="remindShip(order.id)">催发货</button>
            </template>

            <!-- 已支付+已发货+未收货：确认收货/查看物流/申请售后 -->
            <template v-else-if="isPaid(order) && !isCancelled(order) && ['waiting_pickup', 'in_transit', 'out_for_delivery'].includes(order.ship_status)">
              <button class="btn-action btn-refund" @click="applyRefund(order.id)">申请售后</button>
              <button class="btn-action btn-logistics" @click="viewLogistics(order.id)">查看物流</button>
              <button class="btn-action btn-confirm" @click="confirmReceive(order.id)">确认收货</button>
            </template>

            <!-- 已支付+已发货+已收货：确认收货/查看物流/申请售后 -->
            <!-- <template v-else-if="isPaid(order) && !isCancelled(order) && ['received'].includes(order.ship_status)">
              <button class="btn-action btn-refund" @click="applyRefund(order.id)">评价</button>
            </template> -->

            <!-- 已支付+已收货/已取消：查看售后/返回列表 -->
            <template v-else>
              <button class="btn-action btn-back-list" @click="goToOrderList">返回订单列表</button>
              <button class="btn-action btn-refund" @click="applyRefund(order.id)" v-if="isPaid(order) && !isCancelled(order)">
                申请售后
              </button>
               <button class="btn-action btn-refund" @click="goToOrderReview(order.id)" v-if="isPaid(order) && !isCancelled(order) && ['received'].includes(order.ship_status)">
                评价
              </button>
            </template>
          </div>
        </div>
      </div>
    </main>

    <!-- 公共底部 -->
    <Footer></Footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

// 公共组件
import Header from '@/components/Layouts/_header.vue';
import Footer from '@/components/Layouts/_footer.vue';
// API请求（需根据项目实际路径调整，暂保留，后续对接真实API用）
import { apiGetOrderDetail, apiReceivedOrders } from '@/services/orderService';
// 物流接口
import { apiGetLogistics } from '@/services/logisticsService'; 


const router = useRouter();
const route = useRoute();

// 订单id
const orderDetailId = ref(null);

// 状态定义（原有逻辑，不改动）
const loading = ref(true);
const order = ref<Order>({
  id: 0,
  no: '',
  created_at: '',
  paid_at: '',
  payment_method: '',
  payment_no: '',
  refund_status: 'pending',
  refund_no: '',
  closed: false,
  reviewed: false,
  ship_status: 'pending',
  ship_data: '',
  address: '',
  total_amount: 0,
  freight: 0,
  remark: '',
  extra: '',
  items: []
});

// 解析地址和物流信息（原有逻辑，不改动）
const parsedAddress = ref<Address>({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: ''
});
const parsedShipData = ref<ShipData>({
  express_name: '',
  express_no: '',
  logistics_records: []
});
const logisticsRecords = ref<LogisticsRecord[]>([]);

// 类型定义（原有逻辑，不改动）
interface OrderItem {
  sku_id: number;
  product_id: number;
  product_name: string;
  product_img?: string;
  sku_name?: string;
  price: number; // 元（与数据库decimal一致）
  amount: number;
}

interface Order {
  id: number;
  no: string;
  created_at: string;
  paid_at?: string;
  payment_method?: string;
  payment_no?: string;
  refund_status: string;
  refund_no?: string;
  closed: boolean;
  reviewed: boolean;
  ship_status: string;
  ship_data?: string;
  address: string; // JSON字符串
  total_amount: number; // 元
  freight?: number; // 运费（元）
  remark?: string;
  extra?: string;
  items: OrderItem[];
}

interface Address {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
}

interface ShipData {
  express_name: string;
  express_no: string;
  logistics_records?: LogisticsRecord[];
}

interface LogisticsRecord {
  content: string;
  time: string;
}

// ======================== 原有工具函数（不改动） ========================
// JSON解析（兼容空值和格式错误）
const parseJson = (str?: string, defaultValue: Object)=> {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str) ;
  } catch (e) {
    console.error('JSON解析失败：', e);
    return defaultValue;
  }
};

// 时间格式化（YYYY-MM-DD HH:mm:ss）
const formatTime = (timeStr?: string) => {
  if (!timeStr) return '未知时间';
  try {
    const date = new Date(timeStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  } catch (e) {
    return timeStr; // 解析失败时返回原始字符串
  }
};

// 手机号脱敏（138****8888）
const formatPhone = (phone?: string) => {
  if (!phone || phone.length < 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

// ======================== 原有状态判断与映射（不改动） ========================
// 订单状态判断
const isPaid = (order: Order) => !!order.paid_at;
const isCancelled = (order: Order) => order.closed;

// 订单状态文本
const getOrderStatusText = (order: Order) => {
  if (isCancelled(order)) return '已取消';
  if (isPaid(order)) return '已支付';
  return '待支付';
};

// 订单状态样式样式
const getOrderStatusClass = (order: Order) => {
  if (isCancelled(order)) return 'status-cancelled';
  if (isPaid(order)) return 'status-success';
  return 'status-processing';
};

// 物流状态文本
const getShipStatusText = (status: string) => {
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
  return map[status as keyof typeof map] || '未知物流状态';
};

// 物流状态样式
const getShipStatusClass = (status: string) => {
  const map = {
    pending: 'status-pending',
    waiting_pickup: 'status-processing',
    in_transit: 'status-processing',
    out_for_delivery: 'status-processing',
    received: 'status-success',
    return_pending: 'status-processing',
    return_waiting_pickup: 'status-processing',
    return_in_transit: 'status-processing',
    return_received: 'status-success',
    exception: 'status-error'
  };
  return map[status as keyof typeof map] || '';
};

// 退款状态文本
const getRefundStatusText = (status: string) => {
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
  return map[status as keyof typeof map] || '未知退款状态';
};

// 退款状态样式
const getRefundStatusClass = (status: string) => {
  const map = {
    pending: 'status-pending',
    applied: 'status-processing',
    reviewing: 'status-processing',
    processing: 'status-processing',
    success: 'status-success',
    part_success: 'status-success',
    failed: 'status-error',
    rejected: 'status-error',
    cancelled: 'status-cancelled'
  };
  return map[status as keyof typeof map] || '';
};

// 支付方式文本
const getPaymentMethodText = (method: string) => {
  const map = {
    wechat: '微信支付',
    alipay: '支付宝支付',
    unionpay: '银联支付',
    cod: '货到付款'
  };
  return map[method as keyof typeof map] || '未知支付方式';
};


const getOrderDetail = async () => {
	loading.value = true;
	try {
		const {data} = await apiGetOrderDetail(orderDetailId.value)
		order.value = data
		console.log(data,'xxx');
	} catch (err) {
		console.log(err);
	} finally {
		loading.value = false;
	}
}
// ======================== 新增：假数据模拟（核心补充） ========================
// 1. 假数据：已支付+已发货（默认展示）
const mockPaidShippedOrder: Order = {
  id: 10086,
  no: 'OD2024052012345678',
  created_at: '2024-05-20T14:30:45',
  paid_at: '2024-05-20T14:35:12',
  payment_method: 'wechat',
  payment_no: 'WX2024052014351288888888',
  refund_status: 'pending',
  refund_no: '',
  closed: false,
  reviewed: false,
  ship_status: 'out_for_delivery', // 派件中
  ship_data: JSON.stringify({
    express_name: '顺丰速运',
    express_no: 'SF1234567890123',
    logistics_records: [
      { content: '快递员正在为您派件（快递员：李师傅，电话：13987654321）', time: '2024-05-22T09:15:30' },
      { content: '快递已到达【深圳市南山派送点】', time: '2024-05-22T08:00:10' },
      { content: '快递从【广州转运中心】发往【深圳转运中心】', time: '2024-05-21T18:45:22' },
      { content: '商家已发货，等待快递揽收', time: '2024-05-20T16:00:33' }
    ]
  }),
  address: JSON.stringify({
    name: '张三',
    phone: '13812345678',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园路123号创新大厦A座1501室'
  }),
  total_amount: 8148.00,
  freight: 12.00,
  remark: '请尽快发货，急用',
  extra: '',
  items: [
    {
      sku_id: 1001,
      product_id: 2001,
      product_name: 'Apple iPhone 15 256GB 黑色 5G手机',
      product_img: 'https://picsum.photos/200/200?random=1', // 随机图片占位
      sku_name: '256GB|黑色|官方标配',
      price: 7999.00,
      quantity: 1
    },
    {
      sku_id: 1002,
      product_id: 2002,
      product_name: 'Apple 20W USB-C 电源适配器',
      product_img: 'https://picsum.photos/200/200?random=2',
      sku_name: '白色|官方标配',
      price: 149.00,
      quantity: 1
    }
  ]
};

// 2. 假数据：未支付（测试未支付场景时切换）
const mockUnpaidOrder: Order = {
  ...mockPaidShippedOrder,
  id: 10087,
  no: 'OD2024052109876543',
  paid_at: '', // 未支付
  payment_method: '',
  payment_no: '',
  ship_status: 'pending', // 未发货
  ship_data: '',
  total_amount: 5999.00,
  freight: 0.00, // 免运费
  items: [
    {
      sku_id: 1003,
      product_id: 2003,
      product_name: '华为 Mate 60 Pro 256GB 雅川青',
      product_img: 'https://picsum.photos/200/200?random=3',
      sku_name: '256GB|雅川青|官方标配',
      price: 5999.00,
      quantity: 1
    }
  ]
};

// 3. 假数据：已取消（测试取消场景时切换）
const mockCancelledOrder: Order = {
  ...mockUnpaidOrder,
  id: 10088,
  no: 'OD2024051911223344',
  closed: true, // 已取消
  remark: '不想买了'
};

// ======================== 新增：页面初始化（用假数据替换API请求） ========================
onMounted(async () => {
	// console.log(route,'aaa');
  orderDetailId.value = route.params.id
  try {
    loading.value = true;
    // 模拟API请求延迟（1秒，贴近真实加载体验）
    await new Promise(resolve => setTimeout(resolve, 1000));
	
	getOrderDetail()
    // 选择要展示的假数据（根据测试场景切换注释）
    // order.value = mockPaidShippedOrder; // 已支付+已发货（默认）
    // order.value = mockUnpaidOrder; // 未支付
    // order.value = mockCancelledOrder; // 已取消

    // 解析地址和物流（原有逻辑复用，无需改动）
    parsedAddress.value = parseJson(order.value.address, {} as Address);
    parsedShipData.value = parseJson(order.value.ship_data, {} as ShipData);

    // 处理物流记录（优先用假数据中的物流，无则补默认提示）
    if (parsedShipData.value.logistics_records?.length) {
      logisticsRecords.value = parsedShipData.value.logistics_records;
    } else {
      logisticsRecords.value = [
        { content: '暂无物流信息，订单尚未发货', time: new Date().toISOString() }
      ];
    }

  } catch (error) {
    console.error('获取订单失败：', error);
    ElMessage.error('订单加载失败，请稍后重试');
    order.value.id = 0; // 触发「订单不存在」提示
  } finally {
    loading.value = false;
  }
});

// ======================== 新增：操作按钮假交互（后续替换为真实API） ========================
// 返回上一页
const goBack = () => {
  router.back();
};

// 返回订单列表
const goToOrderList = () => {
  router.push('/order/list'); // 替换为你的订单列表路由
};

// 取消订单
const cancelOrder = async (orderId: number) => {
  try {
    await ElMessageBox.confirm(
      '确定取消订单吗？取消后无法恢复，未支付订单取消后将关闭支付通道',
      '确认取消',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    );

    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    // 假数据更新：标记订单为已取消
    order.value.closed = true;
    order.value.paid_at = '';
    order.value.ship_status = 'pending';
    ElMessage.success('订单取消成功');

  } catch (err) {
    ElMessage.info('已取消订单操作');
  }
};

// 去支付
const goToPay = (orderId: number) => {
  // 模拟跳转支付页（真实场景替换为路由）
  ElMessage.info(`即将前往支付订单 ${orderId}（假跳转）`);
  // 真实路由示例：router.push({ path: '/pay', query: { orderId } });
};

// 确认收货
const confirmReceive = async (orderId: number) => {
  try {
    await ElMessageBox.confirm(
      '确定已收到商品吗？确认后订单将完成，如需售后请在确认后申请',
      '确认收货',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'info' }
    );

    const {data} = await apiReceivedOrders(orderId);
    if(data.success === true) {
      ElMessage.success('确认收货成功');
      order.value.ship_status = 'received';
      order.value.reviewed = false;
    }

  } catch (err) {
    ElMessage.info('已取消确认收货操作');
  }
};

// 催发货
const remindShip = async (orderId: number) => {
  await new Promise(resolve => setTimeout(resolve, 600));
  ElMessage.success('催发货通知已发送，商家将在24小时内处理');
};

// 去评价
const goToOrderReview = (orderId: number) => {
  router.push({
    name: 'orderReview',
    params: {
      orderId
    }
  });
}


// 1. 申请售后
const applyRefund = (orderId: number) => {
  // 业务校验：仅已支付、未取消、未完成的订单可申请售后
  if (!isPaid(order.value)) {
    ElMessage.warning('未支付订单无需申请售后');
    return;
  }
  if (isCancelled(order.value)) {
    ElMessage.warning('已取消订单无法申请售后');
    return;
  }
  if (order.value.ship_status === 'received' && order.value.reviewed) {
    ElMessage.warning('已评价的订单请联系客服处理售后');
    return;
  }

  // 模拟跳转售后申请页（真实场景替换路由）
  ElMessage.info(`前往申请订单 ${orderId} 的售后（假跳转）`);
  // 真实路由示例：
  // router.push({
  //   path: '/order/refund/apply',
  //   query: {
  //     orderId,
  //     orderNo: order.value.no,
  //     items: JSON.stringify(order.value.items.map(item => ({ skuId: item.sku_id, quantity: item.quantity })))
  //   }
  // });
};

// 2. 查看物流（对应 apiGetLogistics 接口，补充假数据逻辑）
const viewLogistics = async (orderId: number) => {
  // 业务校验：仅已发货的订单可查看物流详情
  if (!order.value.ship_data || ['pending', 'waiting_pickup'].includes(order.value.ship_status)) {
    ElMessage.warning('订单尚未发货，暂无物流详情');
    return;
  }

  try {
    loading.value = true;
    // 模拟调用物流接口（假数据逻辑）
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // 模拟物流详情页跳转（携带物流单号等参数）
    ElMessage.info(`查看订单 ${orderId} 的物流详情（快递单号：${parsedShipData.value.express_no}）`);
    // 真实路由示例：
    // router.push({
    //   path: '/logistics/detail',
    //   query: {
    //     orderId,
    //     expressName: parsedShipData.value.express_name,
    //     expressNo: parsedShipData.value.express_no
    //   }
    // });
  } catch (error) {
    ElMessage.error('获取物流详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 3. 查看支付凭证（常见功能，补充假逻辑）
const viewPaymentProof = (orderId: number) => {
  // 业务校验：仅已支付订单可查看凭证
  if (!isPaid(order.value)) {
    ElMessage.warning('未支付订单暂无支付凭证');
    return;
  }

  // 模拟查看凭证（可弹窗展示假凭证或跳转页面）
  ElMessageBox({
    title: '支付凭证',
    message: `
      <div style="text-align: left; padding: 10px 0;">
        <p>订单号：${order.value.no}</p>
        <p>支付方式：${getPaymentMethodText(order.value.payment_method || '')}</p>
        <p>支付时间：${formatTime(order.value.paid_at)}</p>
        <p>支付单号：${order.value.payment_no || '无'}</p>
        <div style="margin-top: 10px; color: #86909c;">
          （注：真实场景此处展示支付凭证图片）
        </div>
      </div>
    `,
    dangerouslyUseHTMLString: true,
    confirmButtonText: '确定',
    type: 'info'
  });
};

// 4. 修改收货地址（未发货订单可用，补充假逻辑）
const editAddress = async (orderId: number) => {
  // 业务校验：仅未发货、未取消、未支付的订单可修改地址
  if (order.value.ship_status !== 'pending') {
    ElMessage.warning('订单已发货，无法修改收货地址');
    return;
  }
  if (isCancelled(order.value)) {
    ElMessage.warning('已取消订单无法修改地址');
    return;
  }

  // 模拟修改地址：弹窗输入新地址（真实场景用地址选择组件）
  try {
    await ElMessageBox.prompt(
      '请输入新的收货地址（格式：姓名-电话-省市区-详细地址）',
      '修改收货地址',
      {
        inputPlaceholder: '例如：李四-13987654321-广东省广州市天河区-XX路XX号',
        confirmButtonText: '确认修改',
        cancelButtonText: '取消',
        type: 'info'
      }
    ).then(async ({ value }) => {
      // 模拟接口请求延迟
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // 解析新地址（真实场景用地址解析逻辑）
      const [name, phone, area, detail] = value.split('-');
      if (name && phone && area && detail) {
        const [province, city, district] = area.split('省');
        // 更新假数据地址
        parsedAddress.value = {
          name,
          phone,
          province: province || area,
          city: city?.split('市')[0] || '',
          district: district?.split('区')[0] || '',
          detail
        };
        // 同步更新order的address字段（保持数据一致性）
        order.value.address = JSON.stringify(parsedAddress.value);
        ElMessage.success('收货地址修改成功');
      } else {
        ElMessage.error('地址格式错误，请重新输入');
      }
    });
  } catch (error) {
    ElMessage.info('已取消修改地址操作');
  }
};

// 5. 确认评价（订单完成后可用，补充假逻辑）
const confirmReview = (orderId: number) => {
  // 业务校验：仅已收货、未评价的订单可评价
  if (order.value.ship_status !== 'received') {
    ElMessage.warning('请先确认收货，再进行评价');
    return;
  }
  if (order.value.reviewed) {
    ElMessage.warning('您已评价过该订单');
    return;
  }

  // 模拟跳转评价页
  ElMessage.info(`前往评价订单 ${orderId}（假跳转）`);
  // 真实路由示例：
  // router.push({
  //   path: '/order/review',
  //   query: {
  //     orderId,
  //     items: JSON.stringify(order.value.items.map(item => ({ 
  //       skuId: item.sku_id, 
  //       productName: item.product_name,
  //       productImg: item.product_img 
  //     })))
  //   }
  // });
};


// 优惠金额
const calculateDiscount = () => {
	return 111;
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/common/common.scss'; // 引入项目公共样式变量（如颜色、间距）

// 容器样式
.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 16px;
}

// 页面头部（标题+返回按钮）
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .page-title {
    font-size: 22px;
    font-weight: 600;
    color: $gray-dark;
  }

  .btn-back {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background-color: $white;
    border: 1px solid $gray-border;
    border-radius: 6px;
    color: $gray-dark;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: $gray-hover;
    }
  }
}

// 加载状态
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid $gray-light;
    border-top: 4px solid $primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

// 订单不存在空状态
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background-color: $white;
  border-radius: 8px;
  padding: 40px 20px;

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

  .btn-go-list {
    padding: 10px 24px;
    background-color: $primary;
    color: $white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: $primary-dark;
    }
  }
}

// 详情卡片通用样式
.detail-card {
  background-color: $white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
  overflow: hidden;

  .card-header {
    padding: 16px 20px;
    border-bottom: 1px solid $gray-border;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: $gray-dark;
    }
  }

  .card-body {
    padding: 20px;
  }
}

// 信息行通用样式（基本信息、支付信息）
.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 14px;

  &:last-child {
    margin-bottom: 0;
  }

  .info-label {
    width: 100px;
    color: $gray;
  }

  .info-value {
    color: $gray-dark;
    flex: 1;
  }

  // 状态标签样式
  .status-tag {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  // 状态标签配色（与逻辑对应）
  .status-pending {
    background-color: rgba(156, 163, 175, 0.1);
    color: $gray;
  }

  .status-processing {
    background-color: rgba(59, 130, 246, 0.1);
    color: $primary;
  }

  .status-success {
    background-color: rgba(72, 187, 120, 0.1);
    color: $success;
  }

  .status-error {
    background-color: rgba(245, 108, 108, 0.1);
    color: $danger;
  }

  .status-cancelled {
    background-color: rgba(156, 163, 175, 0.1);
    color: $gray;
  }

  .text-warning {
    color: $warning;
  }
}

// 收货地址样式
.address-info {
  font-size: 14px;

  .address-row {
    display: flex;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .address-label {
      width: 80px;
      color: $gray;
    }

    .address-value {
      color: $gray-dark;
      flex: 1;
    }
  }
}

// 空提示样式（地址、物流）
.empty-tip {
  font-size: 14px;
  color: $gray;
  padding: 8px 0;
}

// 物流进度时间线样式
.logistics-timeline {
  margin-top: 20px;
  padding-left: 12px;
  border-left: 2px solid $gray-border;

  .timeline-title {
    font-size: 14px;
    font-weight: 600;
    color: $gray-dark;
    margin-bottom: 16px;
  }

  .timeline-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .timeline-item {
    display: flex;
    position: relative;

    // 时间线节点
    .timeline-dot {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: $gray-light;
      margin-left: -23px;
      margin-right: 12px;
      flex-shrink: 0;
      border: 2px solid $white;

      // 最新节点高亮
      &.active {
        background-color: $primary;
      }
    }

    .timeline-content {
      flex: 1;

      .timeline-text {
        font-size: 14px;
        color: $gray-dark;
        margin-bottom: 4px;
      }

      .timeline-time {
        font-size: 12px;
        color: $gray;
      }
    }
  }
}

// 商品清单表格样式
.product-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  // 表格头部
  .table-header {
    display: flex;
    background-color: $gray-light;
    border-radius: 4px 4px 0 0;
    overflow: hidden;
  }

  // 表格列通用样式
  .table-col {
    padding: 12px 8px;
    text-align: left;
  }

  // 列宽度分配
  .col-img {
    width: 80px;
    text-align: center;
  }

  .col-info {
    flex: 1;
  }

  .col-price,
  .col-quantity,
  .col-total {
    width: 120px;
    text-align: center;
  }

  // 表格内容
  .table-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }

  .table-row {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid $gray-border;

    &:last-child {
      border-bottom: none;
    }
  }

  // 商品图片
  .product-thumb {
    width: 60px;
    height: 60px;
    object-fit: contain;
    border-radius: 4px;
    background-color: $gray-light;
  }

  // 商品信息
  .product-name {
    color: $gray-dark;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .product-sku {
    font-size: 12px;
    color: $gray;
  }
}

// 订单金额列表样式
.amount-list {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  font-size: 14px;

  .amount-item {
    display: flex;
    align-items: center;
    gap: 16px;

    .amount-label {
      color: $gray;
    }

    .amount-value {
      color: $gray-dark;
    }

    // 实付金额高亮
    &.total-amount {
      margin-top: 8px;
      padding-top: 12px;
      border-top: 1px solid $gray-border;

      .amount-label {
        font-weight: 600;
        color: $gray-dark;
      }

      .amount-value {
        font-size: 16px;
        font-weight: 600;
        color: $danger;
      }
    }

    .text-red {
      color: $danger;
    }
  }
}

// 底部固定操作栏
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: $white;
  border-top: 1px solid $gray-border;
  padding: 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);

  .action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    max-width: 1200px;
    margin: 0 auto;
  }

  // 操作按钮通用样式
  .btn-action {
    padding: 10px 24px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;

    // 取消订单（灰色边框）
    &.btn-cancel {
      background-color: $white;
      color: $gray-dark;
      border-color: $gray-border;

      &:hover {
        background-color: $gray-hover;
      }
    }

    // 去支付（主色）
    &.btn-pay {
      background-color: $primary;
      color: $white;
      border-color: $primary;

      &:hover {
        background-color: $primary-dark;
      }
    }

    // 申请售后（绿色边框）
    &.btn-refund {
      background-color: $white;
      color: $success;
      border-color: $success;

      &:hover {
        background-color: rgba(72, 187, 120, 0.05);
      }
    }

    // 催发货（橙色边框）
    &.btn-remind {
      background-color: $white;
      color: $warning;
      border-color: $warning;

      &:hover {
        background-color: rgba(249, 115, 22, 0.05);
      }
    }

    // 查看物流（主色边框）
    &.btn-logistics {
      background-color: $white;
      color: $primary;
      border-color: $primary;

      &:hover {
        background-color: rgba(59, 130, 246, 0.05);
      }
    }

    // 确认收货（绿色）
    &.btn-confirm {
      background-color: $success;
      color: $white;
      border-color: $success;

      &:hover {
        background-color: $success-dark;
      }
    }

    // 返回列表（灰色）
    &.btn-back-list {
      background-color: $white;
      color: $gray-dark;
      border-color: $gray-border;

      &:hover {
        background-color: $gray-hover;
      }
    }
  }
}

// 动画：加载旋转
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

// 响应式适配（移动端）
@media (max-width: 768px) {
  // 页面头部
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .btn-back {
      align-self: flex-start;
    }
  }

  // 信息行：移动端换行
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;

    .info-label {
      width: auto;
      margin-bottom: 4px;
    }
  }

  // 收货地址：移动端换行
  .address-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;

    .address-label {
      width: auto;
      margin-bottom: 4px;
    }
  }

  // 商品表格：移动端简化
  .product-table {
    .col-price,
    .col-quantity,
    .col-total {
      width: 80px;
    }

    .product-thumb {
      width: 50px;
      height: 50px;
    }
  }

  // 物流时间线：简化间距
  .logistics-timeline {
    padding-left: 8px;

    .timeline-list {
      gap: 16px;
    }

    .timeline-dot {
      width: 18px;
      height: 18px;
      margin-left: -19px;
    }
  }

  // 底部操作栏：按钮自适应宽度
  .action-bar {
    padding: 12px 8px;

    .action-buttons {
      flex-wrap: wrap;
      justify-content: space-between;
    }

    .btn-action {
      flex: 1;
      min-width: 120px;
      padding: 10px 12px;
      text-align: center;
    }
  }
}

</style>