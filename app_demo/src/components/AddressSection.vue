<!-- AddressSection.vue -->
<script setup>
import { ref, reactive, onMounted, defineProps, defineEmits, watch, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  PlusOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons-vue'
import { useStore } from 'vuex'

const store = useStore()
const props = defineProps({
  selectable: {
    type: Boolean,
    default: false,
  },
  selectedAddressIndex: {
    type: Number,
    default: -1,
  },
})

const emits = defineEmits(['select', 'update'])

// 从 Vuex 获取地址数据
const addresses = computed(() => store.state.addresses)
const selectedAddressId = computed({
  get: () => store.state.selectedAddressId,
  set: (value) => store.commit('selectAddress', value),
})

const showAddressDialog = ref(false)
const showEditAddressDialog = ref(false)
const submitting = ref(false)
const addressForm = ref(null)
const editAddressForm = ref(null)

// 使用函数初始化地址对象，避免重复代码
const initAddressData = () => ({
  receiver: '',
  phone: '',
  region: '',
  detail: '',
  isDefault: false,
})

const newAddress = reactive(initAddressData())
const editAddressData = reactive(initAddressData())

// 监听选中地址索引变化
watch(
  () => props.selectedAddressIndex,
  (newIndex) => {
    if (newIndex >= 0 && newIndex < addresses.value.length) {
      selectedAddressId.value = addresses.value[newIndex].id
    }
  },
  { immediate: true },
)

// 电话号码格式化工具函数
const formatPhone = (phone) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

const handleSelectChange = (value) => {
  const index = addresses.value.findIndex((addr) => addr.id === value)
  if (index !== -1) {
    emits('select', index)
  }
}

// 设置默认地址时自动选中
const setDefaultAddress = (id) => {
  store.commit('setDefaultAddress', id)
  store.commit('selectAddress', id) // 确保选中状态同步更新
  const index = addresses.value.findIndex((addr) => addr.id === id)
  emits('select', index)
  emits('update', addresses.value)
}

const deleteAddress = (id) => {
  store.commit('deleteAddress', id)
  emits('update', addresses.value)
}

const showDeleteConfirm = (id) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这个地址吗？',
    okText: '确认',
    cancelText: '取消',
    centered: true,
    onOk: () => deleteAddress(id),
  })
}

const editAddress = (address) => {
  Object.assign(editAddressData, { ...address })
  showEditAddressDialog.value = true
}

// 表单验证规则
const formRules = {
  receiver: [{ required: true, message: '请输入收货人姓名' }],
  phone: [
    { required: true, message: '请输入联系电话' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
  ],
  region: [{ required: true, message: '请输入地区' }],
  detail: [{ required: true, message: '请输入详细地址' }],
}

const submitForm = async (formRef, isEdit = false) => {
  try {
    await formRef.validate()
    submitting.value = true

    if (isEdit) {
      // 更新地址
      store.commit('updateAddress', {
        id: editAddressData.id,
        address: {
          receiver: editAddressData.receiver,
          phone: editAddressData.phone,
          region: editAddressData.region,
          detail: editAddressData.detail,
          isDefault: editAddressData.isDefault,
        },
      })
      message.success('地址修改成功')
      showEditAddressDialog.value = false
    } else {
      // 新增地址
      store.commit('addAddress', {
        receiver: newAddress.receiver,
        phone: newAddress.phone,
        region: newAddress.region,
        detail: newAddress.detail,
        isDefault: newAddress.isDefault,
      })
      message.success('地址添加成功')
      showAddressDialog.value = false
      Object.assign(newAddress, initAddressData())
    }

    emits('update', addresses.value)
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    const action = isEdit ? '修改' : '添加'
    message.error(`${action}失败，请检查表单信息`)
  } finally {
    submitting.value = false
  }
}

const submitAddress = () => submitForm(addressForm.value, false)
const updateAddress = () => submitForm(editAddressForm.value, true)

const selectAddress = (id) => {
  if (props.selectable) {
    selectedAddressId.value = id
    const index = addresses.value.findIndex((addr) => addr.id === id)
    emits('select', index)
  }
}

// 在组件挂载时设置默认地址
onMounted(() => {
  const defaultAddress = store.getters.defaultAddress
  if (defaultAddress) {
    store.commit('selectAddress', defaultAddress.id)
    emits(
      'select',
      addresses.value.findIndex((addr) => addr.id === defaultAddress.id),
    )
  }
})
</script>

<template>
  <section class="address-section">
    <!-- 地址选择下拉框 -->
    <div class="address-select-wrapper" v-if="selectable">
      <a-select
        v-model:value="selectedAddressId"
        style="width: 100%"
        @change="handleSelectChange"
        placeholder="请选择收货地址"
        option-label-prop="label"
      >
        <a-select-option
          v-for="address in addresses"
          :key="address.id"
          :value="address.id"
          :label="`${address.receiver} - ${formatPhone(address.phone)} - ${address.region} ${address.detail}`"
        >
          <div class="select-option">
            <span class="option-name">{{ address.receiver }}</span>
            <span class="option-phone">{{ formatPhone(address.phone) }}</span>
            <span class="option-address">{{ address.region }} {{ address.detail }}</span>
          </div>
        </a-select-option>
      </a-select>
    </div>

    <!-- 地址列表 - 添加可滚动容器 -->
    <div class="address-scroll-container">
      <a-list item-layout="vertical" :data-source="addresses" class="address-list">
        <template #renderItem="{ item }">
          <a-list-item
            :class="{
              'default-address': item.isDefault,
              'selected-address': selectable && selectedAddressId === item.id,
            }"
            @click="selectAddress(item.id)"
          >
            <template #actions>
              <a-button
                type="text"
                @click.stop="setDefaultAddress(item.id)"
                :disabled="item.isDefault"
                class="action-button"
              >
                <template #icon><CheckCircleOutlined /></template>
                {{ item.isDefault ? '默认地址' : '设为默认' }}
              </a-button>
              <a-button type="text" @click.stop="editAddress(item)" class="action-button">
                <template #icon><EditOutlined /></template>
                修改
              </a-button>
              <a-button
                type="text"
                danger
                @click.stop="showDeleteConfirm(item.id)"
                class="action-button"
              >
                <template #icon><DeleteOutlined /></template>
                删除
              </a-button>
            </template>

            <a-list-item-meta :description="item.region + ' ' + item.detail">
              <template #title>
                <div class="address-title">
                  <h4 class="text-ellipsis">{{ item.receiver }}</h4>
                  <a-tag color="blue" v-if="item.isDefault">默认</a-tag>
                </div>
              </template>
            </a-list-item-meta>
            <div class="phone-number">{{ formatPhone(item.phone) }}</div>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <!-- 新增地址按钮 -->
    <a-button type="primary" class="add-btn" @click="showAddressDialog = true" v-if="!selectable">
      <PlusOutlined /> 新增收货地址
    </a-button>

    <!-- 新增地址弹窗 -->
    <a-modal
      v-model:visible="showAddressDialog"
      title="新增收货地址"
      @ok="submitAddress"
      :confirm-loading="submitting"
      width="600px"
      centered
      :ok-text="'确认添加'"
      :cancel-text="'取消'"
    >
      <a-form layout="vertical" :model="newAddress" ref="addressForm">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="收货人" name="receiver" :rules="formRules.receiver">
              <a-input v-model:value="newAddress.receiver" placeholder="请输入真实姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系电话" name="phone" :rules="formRules.phone">
              <a-input v-model:value="newAddress.phone" placeholder="请输入11位手机号" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="地区" name="region" :rules="formRules.region">
          <a-input v-model:value="newAddress.region" placeholder="例如：北京市朝阳区" />
        </a-form-item>

        <a-form-item label="详细地址" name="detail" :rules="formRules.detail">
          <a-input v-model:value="newAddress.detail" placeholder="例如：xxx街道xxx号" />
        </a-form-item>

        <a-form-item name="isDefault">
          <a-checkbox v-model:checked="newAddress.isDefault"> 设为默认地址 </a-checkbox>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 修改地址弹窗 -->
    <a-modal
      v-model:visible="showEditAddressDialog"
      title="修改收货地址"
      @ok="updateAddress"
      :confirm-loading="submitting"
      width="600px"
      centered
      :ok-text="'确认修改'"
      :cancel-text="'取消'"
    >
      <a-form layout="vertical" :model="editAddressData" ref="editAddressForm">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="收货人" name="receiver" :rules="formRules.receiver">
              <a-input v-model:value="editAddressData.receiver" placeholder="请输入真实姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系电话" name="phone" :rules="formRules.phone">
              <a-input v-model:value="editAddressData.phone" placeholder="请输入11位手机号" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="地区" name="region" :rules="formRules.region">
          <a-input v-model:value="editAddressData.region" placeholder="例如：北京市朝阳区" />
        </a-form-item>

        <a-form-item label="详细地址" name="detail" :rules="formRules.detail">
          <a-input v-model:value="editAddressData.detail" placeholder="例如：xxx街道xxx号" />
        </a-form-item>

        <a-form-item name="isDefault">
          <a-checkbox v-model:checked="editAddressData.isDefault"> 设为默认地址 </a-checkbox>
        </a-form-item>
      </a-form>
    </a-modal>
  </section>
</template>

<style scoped>
.address-section {
  max-width: 800px;
  margin: 0 auto;
}

.address-select-wrapper {
  margin-bottom: 16px;
}

.select-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-name {
  font-weight: 500;
}

.option-phone {
  color: #666;
  font-size: 12px;
}

.option-address {
  color: #999;
  font-size: 12px;
}

/* 添加地址滚动容器样式 */
.address-scroll-container {
  max-height: 400px; /* 设置最大高度 */
  overflow-y: auto; /* 启用垂直滚动 */
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 8px;
}

/* 添加自定义滚动条样式 */
.address-scroll-container::-webkit-scrollbar {
  width: 8px;
}
.address-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.address-scroll-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
.address-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.address-list :deep(.ant-list-item) {
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: all 0.3s;
  cursor: default;
}

.address-list :deep(.ant-list-item:hover) {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.default-address {
  border-color: #1890ff;
  background: #f0f7ff;
}

.selected-address {
  border: 2px solid #52c41a;
  background: #f6ffed;
}

.address-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.address-title h4 {
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.phone-number {
  color: #666;
  margin-top: 8px;
}

.add-btn {
  width: 100%;
  margin-top: 16px;
  height: 40px;
}

.action-button {
  padding: 0 8px;
}

/* 文本截断样式 */
.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
