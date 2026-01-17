<template>
  <div class="address-page">
    <!-- 顶部导航栏（复用全局Header组件） -->
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

    <main class="container">
      <!-- 新增地址按钮（优化样式） -->
      <el-button 
        type="primary" 
        plain
        class="add-address-btn"
        @click="openAddressModal(null)"
      >
        <i class="el-icon-plus"></i> 新增收货地址
      </el-button>

      <!-- 地址列表（优化布局和样式） -->
      <div class="address-list" v-loading="loading">
        <el-card 
          class="address-item" 
          v-for="(address) in addresses" 
          :key="address.id"
          shadow="hover"
        >
          <div class="address-info">
            <div class="address-header">
              <span class="recipient">{{ address.contact_name }} {{ address.contact_phone }}</span>
              <el-tag 
                v-if="address.is_default == 1" 
                type="primary" 
                size="small"
                class="default-tag"
              >
                默认地址
              </el-tag>
            </div>
            
            <div class="address-detail">
              {{ address.province }} {{ address.city }} {{ address.district }} {{ address.address  }}
            </div>
            
            <div class="address-actions">
              <!-- 修复：删除重复的 text 属性，只保留 type="text" -->
              <el-button size="small" type="text" @click="openAddressModal(address)">编辑</el-button>
              <el-button size="small" type="text" @click="deleteAddress(address.id)">删除</el-button>
              <el-button size="small" type="text" v-if="!address.is_default" @click="setDefaultAddress(address.id)">设为默认</el-button>
            </div>
          </div>
        </el-card>

        <!-- 空状态（优化样式，统一风格） -->
        <div v-if="addresses.length === 0" class="empty-address">
          <el-empty 
            image="https://picsum.photos/id/20/120/120" 
            image-size="120"
            description="还没有保存的收货地址"
          >
            <el-button type="primary" @click="openAddressModal(null)">立即添加</el-button>
          </el-empty>
        </div>
      </div>
    </main>

    <!-- 添加/编辑地址弹窗（优化表单布局） -->
    <el-dialog 
      :title="currentId ? '编辑地址' : '新增地址'" 
      v-model="isModalShow"
      width="600px"
      class="address-dialog"
    >
      <div v-if="loadingDialog" class="text-center py-10">
        <el-loading v-model="loadingDialog" text="加载中..."></el-loading>
      </div>
      <el-form 
        :model="form" 
        ref="formRef"
        label-width="80px"
        :rules="formRules"
        v-else
        class="address-form"
      >
        <el-form-item label="收件人" prop="contact_name">
          <el-input v-model="form.contact_name" placeholder="请输入收件人姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="contact_phone">
          <el-input v-model="form.contact_phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="地区" prop="province">
          <div class="district-selector">
            <el-select
              v-model="form.province"
              placeholder="请选择省份"
              @change="handleProvinceChange"
              style="width: 180px;margin-right: 12px;"
            >
              <el-option
               v-for="(name, code) in provinces"
               :key="code"
               :label="name"
               :value="name"
               />
            </el-select>
            <el-select
              v-model="form.city"
              placeholder="请选择城市"
              @change="handleCityChange"
              style="width: 180px; margin-right: 12px"
              :disabled="!form.province"
            >
              <el-option
                v-for="(name, code) in cities"
                :key="code"
                :label="name"
                :value="name"
              />
            </el-select>
            
            <el-select
              v-model="form.district"
              placeholder="请选择区县"
              style="width: 180px"
              :disabled="!form.city"
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
          <el-input v-model="form.zip" placeholder="请输入邮政编码"></el-input>
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="form.address" type="textarea" rows="3" placeholder="街道、门牌号等"></el-input>
        </el-form-item>
        <el-form-item class="default-checkbox">
          <el-checkbox v-model="form.is_default">设为默认地址</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isModalShow = false">取消</el-button>
        <el-button type="primary" @click="handleSaveAddress">保存</el-button>
      </template>
    </el-dialog>

    <!-- 底部页脚 -->
    <Footer></Footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import addressData from 'china-area-data/v5/data'
import _ from 'lodash'
import {
  apiGetAddresses,
  apiCreateAddresses,
  apiIsDefaultAddress,
  apiUpdateAddresses,
  apiDeleteAddress
} from '../../services/addressService.ts'
// 引入全局导航和页脚组件
import Header from '@/components/Layouts/_header.vue';
import Footer from '@/components/Layouts/_footer.vue';


onMounted(() => {
  getAddress()
})

const loading = ref(false)
const loadingDialog = ref(false)

const currentId = ref()


// 假地址数据
const addresses = ref([]);
const getAddress = async() => {
  try {
    loading.value = true
    const { data } = await apiGetAddresses()
    addresses.value = data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}


// 地区选择数据
const provinces = ref(addressData['86']) //省份数据
const cities = ref({}) // 城市数据
const districts = ref({}) // 区县数据

// 表单和弹窗状态
const isModalShow = ref(false);
const currentAddress = ref(null);
const formRef = ref(null);
const form = reactive({
  province: '', // 省份名称
  city: '', // 城市名称
  district: '', // 区县名称
  address: '', // 详细地址（对应后端address字段）
  zip: '', // 邮政编码
  contact_name: '', // 收件人
  contact_phone: '', // 手机号
  is_default: false // 是否默认
});

// 验证规则：验证名称字段（核心修改）
const formRules = {
  contact_name: [
    { required: true, message: '请输入收件人', trigger: 'blur' }
  ],
  contact_phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ],
  province: [ // 验证省份名称不为空
    { required: true, message: '请选择省份', trigger: 'change' }
  ],
  city: [ // 验证城市名称不为空
    { required: true, message: '请选择城市', trigger: 'change' }
  ],
  district: [ // 验证区县名称不为空
    { required: true, message: '请选择区县', trigger: 'change' }
  ],
  address: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, message: '详细地址至少5个字符', trigger: 'blur' }
  ],
  zip: [
    { pattern: /^\d{6}$/, message: '邮编格式错误（6位数字）', trigger: 'blur' }
  ]
};

// 处理省份变更
const handleProvinceChange = (provinceName: string) => {
  form.city = ''
  form.district = ''
  districts.value = {}
  
  if (!provinceName) {
    cities.value = {}
    return
  }
  // 找到选中难道省份的code (通过名称反向查code)
  const provinceCode = Object.keys(provinces.value).find(
    code => provinces.value[code] === provinceName
  )
  
  // 更加省份code 加载城市数据
  cities.value = provinceCode ? addressData[provinceCode] : {}
}

// 处理城市变更
const handleCityChange = (cityName: string) => {
  form.district = '';
  
  if (!cityName) {
    districts.value = {};
    return;
  }
  
  // 找到选中的城市的code （通过名称反向查找code）
  const cityCode = Object.keys(cities.value).find(
    code => cities.value[code] === cityName
  )
  
  // 根据城市code加载区县数据
  districts.value = cityCode ? addressData[cityCode] : {}
};


// 打开弹窗
const openAddressModal = (address: any) => {
  formRef.value?.resetFields();
  // 重置地区数据
  cities.value = {};
  districts.value = {};
  
  loadingDialog.value = true


  if (address) {
    form.contact_name = address.contact_name;
    form.contact_phone = address.contact_phone;
    form.province = address.province;
    form.city = address.city;
    form.district = address.district;
    form.address = address.address;
    form.zip = address.zip;
    form.is_default = address.is_default ? true : false;
    
    currentAddress.value = address
    currentId.value = address.id
    
    // 分布初始化地区数据
    const initRegionData = async () => {
      // 1. 初始化省份
      if (address.province) {
        // 先触发省份变更，加载城市数据
        handleProvinceChange(address.province);
        
        setTimeout(() => {
          if (address.city) {
            form.city = address.city
            // 触发城市变更，加载区县数据
            handleCityChange(address.city);
            
            setTimeout(() => {
              if (address.district) {
                form.district = address.district
              }
            },100)
          }
        },100)
      }
    }
    initRegionData()
  } else {
    // 新增地址：清空表单（只保留名称字段）
    Object.assign(form, {
      id: null,
      province: '',
      city: '',
      district: '',
      address: '',
      zip: '',
      contact_name: '啊实打实',
      contact_phone: '13712345678',
      is_default: false
    });
    currentAddress.value = null;
    currentId.value = null
  }
  loadingDialog.value = false
  isModalShow.value = true;
};



// 保存地址
const handleSaveAddress = async () => {
  await formRef.value.validate();
  // 提交给后端的数据
  const addressData = {
    contact_name: form.contact_name,
    contact_phone: form.contact_phone,
    province: form.province,
    city: form.city,
    district: form.district,
    address: form.address,
    zip: form.zip,
    is_default: form.is_default
  }
  // 如果有id就是编辑，没有就是添加
  if(currentId.value) {
    try {
      const { data } = await apiUpdateAddresses(currentId.value, addressData)
      console.log(data)
      if (data.code === 200) {
        ElMessage.success('修改成功')
        getAddress()
      }
    } catch (error) {
      ElMessage.error('修改失败，请您重试')
    }
  } else {
    try {
      const { data } = await apiCreateAddresses(addressData)
      console.log(data)
      if (data.code === 201) {
        ElMessage.success('添加成功')
        getAddress()
      }
    } catch (error) {
      ElMessage.error('添加失败，请您重试')
    }
  }
  
  isModalShow.value = false;
};

// 删除地址
const deleteAddress = async (id: number) => {
  try {
     // 显示确认对话框
     await ElMessageBox.confirm(
    '确定删除？', 
    '提示', 
    { 
      confirmButtonText:'确定',
      cancelButtonText: '取消',
      type: 'warning' ,
    },
    )
     // 用户点击确认后执行删除
    await apiDeleteAddress(id); // 修正函数名拼写
     
     // 检查状态码（假设后端使用200或204表示成功）
       ElMessage.success('删除成功');
       getAddress(); // 刷新地址列表
   } catch (error: any) {
    // 处理用户取消
    if (error?.code === undefined) { // Element Plus 取消操作没有code属性
      return; // 静默处理取消
    }
     // 处理删除失败
     ElMessage.error(error.message || '删除失败，请您重试');
   }
};

// 设置默认地址（模拟）
const setDefaultAddress = async(id: number) => {
  try {
    const { data } = await apiIsDefaultAddress(id)
    console.log(data)
    if (data.code === 201) {
      ElMessage.success('已设为默认地址');
      getAddress()
    }
  } catch {
    ElMessage.error('设置失败，请您重试')
  }
};
</script>

<style lang="scss" scoped>
// 全局样式重置和基础变量
@import '@/assets/css/common/common.scss';

// 容器样式（统一规范）
.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 30px 16px;
  box-sizing: border-box;
}

// 新增地址按钮（优化样式）
.add-address-btn {
  width: 100%;
  margin-bottom: 24px;
  height: 48px;
  font-size: 16px;
  border-radius: 8px;
}

// 地址列表样式（核心优化）
.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  
  .address-item {
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
    transition: all 0.2s ease;
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .address-info {
      padding: 20px 16px;
      box-sizing: border-box;
    }

    .address-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .recipient {
        font-size: 16px;
        font-weight: 500;
        color: #1f2937;
      }
      
      .default-tag {
        background: #409eff;
        color: #fff;
        border: none;
      }
    }

    .address-detail {
      color: #6b7280;
      margin-bottom: 16px;
      line-height: 1.6;
      font-size: 14px;
      word-break: break-all;
    }

    .address-actions {
      display: flex;
      gap: 16px;
      
      :deep(.el-button) {
        padding: 0;
        font-size: 14px;
        
        &.el-button--text {
          color: #409eff;
          
          &.el-button--danger {
            color: #f56c6c;
          }
        }
      }
    }
  }

  // 空状态样式（统一Element Plus风格）
  .empty-address {
    grid-column: 1 / -1;
    padding: 60px 0;
    text-align: center;
    
    :deep(.el-empty) {
      :deep(.el-empty__description) {
        color: #9ca3af;
        font-size: 14px;
        margin-top: 8px;
      }
      
      :deep(.el-button) {
        margin-top: 16px;
        border-radius: 8px;
      }
    }
  }
}

// 弹窗表单样式
.address-dialog {
  :deep(.el-dialog__body) {
    padding: 24px;
  }
  
  :deep(.el-dialog__header) {
    padding: 20px 24px;
    border-bottom: 1px solid #f0f2f5;
  }
  
  :deep(.el-dialog__footer) {
    padding: 16px 24px;
    border-top: 1px solid #f0f2f5;
  }
}

.address-form {
  .district-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    
    :deep(.el-select) {
      margin-right: 0 !important;
    }
  }
  
  .default-checkbox {
    padding-left: 0;
    margin-top: 8px;
    
    :deep(.el-checkbox) {
      font-size: 14px;
      color: #4b5563;
    }
  }
  
  :deep(.el-form-item) {
    margin-bottom: 20px;
    
    &:last-of-type {
      margin-bottom: 0;
    }
  }
  
  :deep(.el-input) {
    border-radius: 6px;
  }
  
  :deep(.el-textarea) {
    border-radius: 6px;
  }
}

// 页脚样式（统一风格）
Footer {
  margin-top: 60px;
  background-color: #fff;
  padding: 30px 0;
  border-top: 1px solid #f3f4f6;
  
  :deep(.footer-links) {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-bottom: 16px;
    
    a {
      color: #6b7280;
      text-decoration: none;
      font-size: 14px;
      
      &:hover {
        color: #409eff;
      }
    }
  }
  
  :deep(.copyright) {
    text-align: center;
    color: #9ca3af;
    font-size: 12px;
    margin: 0;
  }
}

// 响应式适配（移动端优化）
@media (max-width: 768px) {
  .container {
    padding: 20px 12px;
  }
  
  .address-list {
    grid-template-columns: 1fr;
    gap: 16px;
    
    .address-item {
      .address-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  }
  
  .address-dialog {
    :deep(.el-dialog) {
      width: 90% !important;
      margin: 0 auto;
    }
  }
  
  .district-selector {
    flex-direction: column;
    
    :deep(.el-select) {
      width: 100% !important;
    }
  }
}
</style>