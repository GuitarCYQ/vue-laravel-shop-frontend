<!-- 结算页（完整版本） -->
<template>
  <div class="checkout-page">
    <Header></Header>

    <main class="container">
      <h2 class="page-title">确认订单</h2>

      <!-- 步骤指示器 -->
      <div class="checkout-steps">
        <div class="step active">
          <div class="step-icon">1</div>
          <div class="step-text">确认订单</div>
        </div>
        <div class="step-line active"></div>
        <div class="step">
          <div class="step-icon">2</div>
          <div class="step-text">支付</div>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <div class="step-icon">3</div>
          <div class="step-text">完成</div>
        </div>
      </div>

      <div class="checkout-content">
        <!-- 收货地址 -->
        <div class="checkout-section address-section">
          <h3 class="section-title">收货地址</h3>
          <div class="address-card" v-if="selectedAddress.id">
            <div class="address-info">
              <div class="address-header">
                <span class="recipient">{{ selectedAddress.contact_name }} {{ selectedAddress.contact_phone }}</span>
                <div class="edit-address">
                  <button class="edit-btn" @click="openSelectAddress">选择</button>
                </div>
              </div>
              <div class="address-detail">
                {{ selectedAddress.province }} {{ selectedAddress.city }} {{ selectedAddress.district }} {{ selectedAddress.address }}
                <el-tag v-if="selectedAddress.is_default === 1" type="primary" size="small" class="default-tag">默认地址</el-tag>
              </div>
            </div>
          </div>
          <div class="empty-address" v-else>
            <p>请添加或选择收货地址</p>
            <button class="add-btn" @click="openAddressModal()">立即添加</button>
          </div>
          <button class="add-address-btn" @click="openAddressModal()">
            <i class="icon-add"></i> 添加收货地址
          </button>
        </div>

        <!-- 商品列表 -->
        <div class="checkout-section products-section">
          <h3 class="section-title">商品清单</h3>
          <div class="products-list">
            <div class="product-item" v-for="(item) in checkoutItems" :key="item.id">
              <div class="product-img">
                <img :src="item.product_sku?.product?.image" :alt="item.product_sku?.product?.title">
              </div>
              <div class="product-info">
                <h4 class="product-name">{{ item.product_sku?.product?.title }}</h4>
                <p class="product-sku" v-if="item.product_sku">规格：{{ item.product_sku.title }}</p>
                <div class="product-price-count">
                  <span class="price">¥{{ item.product_sku.price }}</span>
                  <span class="count">x{{ item.amount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 订单信息 -->
        <div class="checkout-section order-info-section">
          <h3 class="section-title">订单信息</h3>
          <div class="order-info">
            <div class="info-item">
              <span class="label">支付方式</span>
              <div class="payment-methods">
                <label class="payment-method">
                  <input type="radio" name="payment" value="alipay" checked>
                  <span class="method-icon alipay"></span>
                  <span class="method-name">支付宝</span>
                </label>
                <label class="payment-method">
                  <input type="radio" name="payment" value="wechat">
                  <span class="method-icon wechat"></span>
                  <span class="method-name">微信支付</span>
                </label>
              </div>
            </div>
            <div class="info-item">
              <span class="label">备注</span>
              <input type="text" v-model="remark" placeholder="请输入订单备注（选填）">
            </div>
          </div>
        </div>

        <!-- 订单总结 -->
        <div class="order-summary">
          <div class="summary-item">
            <span class="label">商品总价</span>
            <span class="value">¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">运费</span>
            <span class="value">¥0.00</span>
          </div>
          <div class="summary-item discount">
            <span class="label">优惠</span>
            <span class="value">-¥0.00</span>
          </div>
          <div class="summary-item total">
            <span class="label">实付款</span>
            <span class="value">¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <button class="btn-pay" @click="submitOrder" :disabled="!selectedAddress.id">
            提交订单
          </button>
        </div>
      </div>

      <!-- 地址选择对话框 -->
      <el-dialog v-model="selectAddressVisible" title="选择收货地址" width="800px">
        <el-table :data="addresses" border :loading="loadingAddresses">
          <el-table-column property="contact_name" label="联系人" width="120" />
          <el-table-column property="contact_phone" label="联系电话" width="150" />
          <el-table-column label="地址信息">
            <template #default="scope">
              {{ scope.row.province }} {{ scope.row.city }} {{ scope.row.district }} {{ scope.row.address }}
            </template>
          </el-table-column>
          <el-table-column label="是否默认" width="100">
            <template #default="scope">
              <el-tag v-if="scope.row.is_default === 1" type="success" size="small">是</el-tag>
              <span v-else>否</span>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="240">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleSelectAddress(scope.row)">选择</el-button>
              <el-button size="small" @click="openAddressModal(scope.row)">编辑</el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDeleteAddress(scope.row.id)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <template #footer>
          <el-button @click="selectAddressVisible = false">取消</el-button>
          <el-button type="primary" @click="openAddressModal()">新增地址</el-button>
        </template>
      </el-dialog>

      <!-- 地址添加/编辑弹窗 -->
      <el-dialog 
        :title="addressModalTitle" 
        v-model="addressModalVisible"
        width="600px"
      >
        <div v-if="loadingAddressForm" class="text-center py-10">
          <el-loading v-model="loadingAddressForm"></el-loading>
        </div>
        <el-form 
          :model="addressForm" 
          ref="addressFormRef"
          label-width="80px"
          :rules="addressRules"
          v-else
        >
          <el-form-item label="收件人" prop="contact_name">
            <el-input v-model="addressForm.contact_name" placeholder="请输入收件人姓名"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="contact_phone">
            <el-input v-model="addressForm.contact_phone" placeholder="请输入手机号"></el-input>
          </el-form-item>
          <el-form-item label="地区" prop="province">
            <div class="district-selector">
              <el-select
                v-model="addressForm.province"
                placeholder="请选择省份"
                @change="handleProvinceChange"
                style="width: 150px; margin-right: 10px"
              >
                <el-option
                  v-for="(name, code) in provinces"
                  :key="code"
                  :label="name"
                  :value="name"
                />
              </el-select>
              <el-select
                v-model="addressForm.city"
                placeholder="请选择城市"
                @change="handleCityChange"
                style="width: 150px; margin-right: 10px"
                :disabled="!addressForm.province"
              >
                <el-option
                  v-for="(name, code) in cities"
                  :key="code"
                  :label="name"
                  :value="name"
                />
              </el-select>
              <el-select
                v-model="addressForm.district"
                placeholder="请选择区县"
                style="width: 150px"
                :disabled="!addressForm.city"
              >
                <el-option
                  v-for="(name, code) in districts"
                  :key="code"
                  :label="name"
                  :value="name"
                />
              </el-select>
            </div>
          </el-form-item>
          <el-form-item label="邮政编码" prop="zip">
            <el-input v-model="addressForm.zip" placeholder="请输入邮政编码"></el-input>
          </el-form-item>
          <el-form-item label="详细地址" prop="address">
            <el-input v-model="addressForm.address" type="textarea" :rows="3" placeholder="街道、门牌号等"></el-input>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="addressForm.is_default">设为默认地址</el-checkbox>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="addressModalVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveAddress">保存</el-button>
        </template>
      </el-dialog>
    </main>

    <Footer></Footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import addressData from 'china-area-data/v5/data';
import Header from '@/components/Layouts/_header.vue';
import Footer from '@/components/Layouts/_footer.vue';
import { 
  apiGetAddresses, 
  apiCreateAddresses, 
  apiUpdateAddresses, 
  apiDeleteAddress, 
  apiIsDefaultAddress 
} from '@/services/addressService';

import {apiCreateOrders} from '@/services/orderService'

// 路由与基础状态
const router = useRouter();
const remark = ref('');
const loadingAddresses = ref(false);
const loadingAddressForm = ref(false);

// 结算商品数据
const checkoutItems = ref([]);
onMounted(() => {
  // 从本地存储获取结算商品（实际项目建议从接口获取）
  const storedItems = localStorage.getItem('checkoutItems');
  if (storedItems) {
    checkoutItems.value = JSON.parse(storedItems);
  }
  
  getAddressList();
});

// 地址管理相关状态
const addresses = ref([]);
const selectedAddress = ref({});
const selectAddressVisible = ref(false);
const addressModalVisible = ref(false);
const addressModalTitle = ref('新增地址');
const currentAddressId = ref<number | null>(null);

// 加载地址列表
const getAddressList = async () => {
  try {
    loadingAddresses.value = true;
    const { data } = await apiGetAddresses();
    addresses.value = data;
    // 自动选择默认地址
    if (data.length > 0 && !selectedAddress.value.id) {
      const defaultAddr = data.find((item: any) => item.is_default === 1);
      selectedAddress.value = defaultAddr || data[0];
    }
  } catch (error) {
    ElMessage.error('获取地址失败，请重试');
    console.error(error);
  } finally {
    loadingAddresses.value = false;
  }
};


// 地址选择对话框
const openSelectAddress = () => {
  selectAddressVisible.value = true;
};

const handleSelectAddress = (address: any) => {
  selectedAddress.value = address;
  selectAddressVisible.value = false;
};

// 地址表单相关
const addressForm = reactive({
  contact_name: '',
  contact_phone: '',
  province: '',
  city: '',
  district: '',
  address: '',
  zip: '',
  is_default: false
});

const addressRules = {
  contact_name: [
    { required: true, message: '请输入收件人姓名', trigger: 'blur' }
  ],
  contact_phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  province: [
    { required: true, message: '请选择省份', trigger: 'change' }
  ],
  city: [
    { required: true, message: '请选择城市', trigger: 'change' }
  ],
  district: [
    { required: true, message: '请选择区县', trigger: 'change' }
  ],
  address: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, message: '详细地址至少5个字符', trigger: 'blur' }
  ],
  zip: [
    { pattern: /^\d{6}$/, message: '请输入6位邮政编码', trigger: 'blur' }
  ]
};

const addressFormRef = ref(null);
const provinces = ref(addressData['86']);
const cities = ref({});
const districts = ref({});

// 地区选择逻辑
const handleProvinceChange = (province: string) => {
  addressForm.city = '';
  addressForm.district = '';
  districts.value = {};
  if (!province) {
    cities.value = {};
    return;
  }
  const provinceCode = Object.keys(provinces.value).find(
    code => provinces.value[code] === province
  );
  cities.value = provinceCode ? addressData[provinceCode] : {};
};

const handleCityChange = (city: string) => {
  addressForm.district = '';
  if (!city) {
    districts.value = {};
    return;
  }
  const cityCode = Object.keys(cities.value).find(
    code => cities.value[code] === city
  );
  districts.value = cityCode ? addressData[cityCode] : {};
};

// 打开地址表单弹窗
const openAddressModal = (address: any = null) => {
  // 重置表单
  addressFormRef.value?.resetFields();
  cities.value = {};
  districts.value = {};
  loadingAddressForm.value = true;
  if (address) {
    // 编辑地址
    addressModalTitle.value  = '编辑地址';
    currentAddressId.value = address.id;
    addressForm.contact_name = address.contact_name;
    addressForm.contact_phone = address.contact_phone;
    addressForm.province = address.province;
    addressForm.city = address.city;
    addressForm.district = address.district;
    addressForm.address = address.address;
    addressForm.zip = address.zip;
    addressForm.is_default = address.is_default === 1;

    // 初始化地区数据
	const loadProvince = () => {
		const provinceName = address.province
		addressForm.province = provinceName
		
		const provinceCode = Object.keys(provinces.value).find(
			code => provinces.value[code] === provinceName
		)
		cities.value = provinceCode ? addressData[provinceCode] : {},
		
		// 延迟加载城市
		setTimeout(loadCity, 50);
	}
	
	const loadCity = () => {
		// 加载城市对应的区县数据
		const cityName = address.city;
		addressForm.city = cityName
		
		const cityCode = Object.keys(cities.value).find(
			code => cities.value[code] === cityName
		)
		districts.value = cityCode ? addressData[cityCode] : {},
		
		setTimeout(loadDistrict, 50)
	}
	
	const loadDistrict = () => {
		// 设置区县值
		addressForm.district = address.district
		loadingAddressForm.value = false
	}
	
	// 启动加载流程
	loadProvince()
	
  } else {
    // 新增地址
    addressModalTitle.value = '新增地址';
    currentAddressId.value = null;
    Object.assign(addressForm, {
      contact_name: '',
      contact_phone: '',
      province: '',
      city: '',
      district: '',
      address: '',
      zip: '',
      is_default: false
    });
    loadingAddressForm.value = false;
  }
  addressModalVisible.value = true;
};

// 保存地址
const handleSaveAddress = async () => {
  try {
    await addressFormRef.value.validate();
    const formData = {
      ...addressForm,
      is_default: addressForm.is_default ? 1 : 0
    };

    if (currentAddressId.value) {
      // 编辑地址
      await apiUpdateAddresses(currentAddressId.value, formData);
      ElMessage.success('地址更新成功');
    } else {
      // 新增地址
      await apiCreateAddresses(formData);
      ElMessage.success('地址添加成功');
    }

    // 刷新地址列表并关闭弹窗
    addressModalVisible.value = false;
    getAddressList();
  } catch (error) {
    console.error(error);
    ElMessage.error('操作失败，请重试');
  }
};

// 删除地址
const handleDeleteAddress = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该地址吗？', '确认删除', {
      type: 'warning'
    });
    await apiDeleteAddress(id);
    ElMessage.success('地址已删除');
    // 重新加载地址列表
    getAddressList();
    // 如果删除的是当前选中地址，重置选中状态
    if (selectedAddress.value.id === id) {
      selectedAddress.value = {};
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请重试');
    }
  }
};

// 设为默认地址（通过编辑接口实现，实际项目可单独实现接口）
const setDefaultAddress = async (id: number) => {
  try {
    await apiIsDefaultAddress(id);
    ElMessage.success('已设为默认地址');
    getAddressList();
  } catch (error) {
    ElMessage.error('设置失败，请重试');
  }
};

// 订单金额计算
const totalPrice = computed(() => {
  return checkoutItems.value.reduce((sum: number, item: any) => {
    return sum + (item.product_sku.price * item.amount);
  }, 0);
});

// 提交订单
const submitOrder = async () => {
  if (!selectedAddress.value.id) {
    ElMessage.warning('请选择收货地址');
    return;
  }

  if (checkoutItems.value.length === 0) {
    ElMessage.warning('请选择商品');
    router.push('/cart');
    return;
  }

  // 模拟订单提交（实际项目调用接口）
  const loading = ElLoading.service({ text: '提交订单中...' });
  try {
    // 这里应调用创建订单接口
    console.log('提交订单数据：', {
      addressId: selectedAddress.value.id,
      items: checkoutItems.value.map((item: any) => ({
        skuId: item.product_sku_id,
        amount: item.amount
      })),
      remark: remark.value,
      paymentMethod: 'alipay'
    });
	console.log(selectedAddress.value.id,'aaa')
	
	const {data} = await apiCreateOrders({
		address_id: selectedAddress.value.id,
		remark: remark.value,
		items: checkoutItems.value.map((item: any) => ({
			sku_id: item.product_sku.id,
			amount: item.amount
		})),
	})
	
	console.log(data,'mmm');

    setTimeout(() => {
      loading.close();
      ElMessage.success('订单创建成功');
      // 清除本地结算数据
      localStorage.removeItem('checkoutItems');
      router.push({
		  name: 'Pay',
		  params: {
			  id: data.id
		  }
	  });
    }, 3500);
  } catch (error) {
    loading.close();
    ElMessage.error('订单创建失败，请重试');
  }
};

onUnmounted(() => {
	localStorage.removeItem('checkoutItems')
})
</script>

<style lang="scss" scoped>
@import '@/assets/css/common/common.scss';

.checkout-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 30px 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: $gray-dark;
}

// 步骤指示器
.checkout-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  gap: 20px;

  .step {
    display: flex;
    flex-direction: column;
    align-items: center;

    .step-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #ddd;
      color: $gray;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .step-text {
      font-size: 14px;
      color: $gray;
    }

    &.active {
      .step-icon {
        background-color: $primary;
        color: white;
      }
      .step-text {
        color: $primary;
      }
    }
  }

  .step-line {
    flex: 1;
    height: 2px;
    background-color: #ddd;
    max-width: 100px;

    &.active {
      background-color: $primary;
    }
  }
}

// 结算内容布局
.checkout-content {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 20px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }

  .checkout-section {
    background-color: $white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid $gray-light;
    }
  }

  // 地址区域
  .address-section {
    grid-column: 1 / 2;

    .address-card {
      border: 1px solid $gray-light;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;

      .address-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        .recipient {
          font-size: 16px;
          color: $gray-dark;
        }

        .edit-btn {
          background: none;
          border: none;
          color: $primary;
          cursor: pointer;
          font-size: 14px;
          padding: 4px 8px;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .address-detail {
        color: $gray-dark;
        font-size: 14px;
        line-height: 1.5;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .default-tag {
        margin-left: 8px;
      }
    }

    .empty-address {
      text-align: center;
      padding: 30px 0;
      border: 1px dashed $gray-light;
      border-radius: 8px;
      margin-bottom: 16px;

      p {
        color: $gray;
        margin-bottom: 16px;
      }

      .add-btn {
        padding: 8px 16px;
        background-color: $primary;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          background-color: $primary-light;
        }
      }
    }

    .add-address-btn {
      width: 100%;
      padding: 12px;
      border: 1px dashed $gray;
      border-radius: 8px;
      background: none;
      color: $gray;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 14px;

      &:hover {
        border-color: $primary;
        color: $primary;
      }
    }
  }

  // 商品列表
  .products-section {
    grid-column: 1 / 2;

    .products-list {
      .product-item {
        display: flex;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid $gray-light;
          align-items: center; /* 核心：垂直居中 */
    
        &:last-child {
          border-bottom: none;
        }
    
        .product-img {
			width: 80px;
			height: 80px;
			border-radius: 4px;
			overflow: hidden;
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: #f9f9f9;
			padding: 0;
			margin: 0;
			vertical-align: middle;
    
          img {
            max-width: 90%;
              max-height: 90%;
              object-fit: contain;
              margin: 0;
              padding: 0;
              display: block;
          }
        }
    
        .product-info {
         flex: 1;
           display: flex;
           flex-direction: column;
           padding: 0;
           margin: 0;
    
          .product-name {
             font-size: 14px;
              margin: 0 0 8px 0;
              line-height: 1.5;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
          }
    
          .product-sku {
            font-size: 12px;
			 color: $gray;
			 margin: 0 0 8px 0;
			 padding: 0;
          }
    
          .product-price-count {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: auto; /* 将价格推到底部 */
    
            .price {
              color: $primary;
              font-size: 16px;
              font-weight: 600;
            }
    
            .count {
              font-size: 14px;
              color: $gray;
            }
          }
        }
      }
    }
  }

  // 订单信息
  .order-info-section {
    grid-column: 1 / 2;

    .order-info {
      .info-item {
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          display: inline-block;
          width: 80px;
          font-size: 14px;
          color: $gray;
        }
      }

      .payment-methods {
        display: inline-flex;
        gap: 16px;

        .payment-method {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;

          input {
            display: none;
          }

          .method-icon {
            width: 24px;
            height: 24px;
            border-radius: 4px;
            display: inline-block;

            &.alipay {
              background: #1677ff url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzE2NzdmZiIgZD0iTTEyIDJBMTAgMTAgMCAwIDEgMjIgMTJDMjIgMTcuNTIgMTcuNTIgMjIgMTIgMjJDMi40OCAyMiAtMiAxNy41MiAtMiAxMkMyLjQ4IDYuNDggNi45MiAyIDEyIDJBMTAgMTAgMCAwIDEgMjIgMTJaIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDE1QzE0LjIxIDUgMTkgOC43OSAxOSAxMkMxOSAxNS4yMSAxNS43OSAxOSAxMiAxOUMyLjIgMTkgMiAxNS4yMSAyIDEyQzIgOC43OSA2Ljc5IDUgMTIgMTVaIi8+PC9zdmc+') center no-repeat;
            }

            &.wechat {
              background: #07c160 url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzA3YzE2MCIgZD0iTTEyIDJBMTAgMTAgMCAwIDEgMjIgMTJDMjIgMTcuNTIgMTcuNTIgMjIgMTIgMjJDMi40OCAyMiAtMiAxNy41MiAtMiAxMkMyLjQ4IDYuNDggNi45MiAyIDEyIDJBMTAgMTAgMCAwIDEgMjIgMTJaIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDE1QzE0LjIxIDUgMTkgOC43OSAxOSAxMkMxOSAxNS4yMSAxNS43OSAxOSAxMiAxOUMyLjIgMTkgMiAxNS4yMSAyIDEyQzIgOC43OSA2Ljc5IDUgMTIgMTVaIi8+PC9zdmc+') center no-repeat;
            }
          }

          input:checked + .method-icon {
            box-shadow: 0 0 0 2px $primary;
          }
        }
      }

      input[type="text"] {
        width: calc(100% - 80px);
        padding: 8px 12px;
        border: 1px solid $gray-light;
        border-radius: 4px;
        font-size: 14px;
        outline: none;

        &:focus {
          border-color: $primary;
        }
      }
    }
  }

  // 订单总结
  .order-summary {
    background-color: $white;
    border-radius: 8px;
    padding: 20px;
    grid-column: 2 / 3;
    grid-row: 1 / 4;
    align-self: start;

    @media (max-width: 992px) {
      grid-column: 1 / 2;
      grid-row: auto;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
       margin-bottom: 12px;
      font-size: 14px;

      .label {
        color: $gray;
      }

      .value {
        color: $gray-dark;
      }

      &.discount {
        .value {
          color: #00b42a;
        }
      }

      &.total {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid $gray-light;

        .label {
          font-size: 16px;
          font-weight: 600;
          color: $gray-dark;
        }

        .value {
          font-size: 18px;
          font-weight: 600;
          color: $primary;
        }
      }
    }

    .btn-pay {
      width: 100%;
      height: 48px;
      background-color: $primary;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 20px;

      &:hover {
        background-color: $primary-light;
      }

      &:disabled {
        background-color: #ffb399;
        cursor: not-allowed;
      }
    }
  }
}

// 地址选择器样式
.district-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

// 空状态样式补充
.empty-img {
  width: 120px;
  height: 120px;
  margin-bottom: 16px;
  opacity: 0.5;
}
</style>