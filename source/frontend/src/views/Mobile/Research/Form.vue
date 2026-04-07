<template>
  <div class="research-form">
    <van-form @submit="handleSubmit">
      <!-- 基本信息 -->
      <van-cell-group inset title="基本信息">
        <van-field
          v-model="formData.deviceName"
          name="deviceName"
          label="设备名称"
          placeholder="请输入设备名称"
          :rules="[{ required: true, message: '请输入设备名称' }]"
        />
        <van-field
          v-model="formData.deviceModel"
          name="deviceModel"
          label="设备型号"
          placeholder="请输入设备型号"
        />
        <van-field
          v-model="formData.manufacturer"
          name="manufacturer"
          label="制造厂家"
          placeholder="请输入制造厂家"
        />
      </van-cell-group>

      <!-- 位置信息 -->
      <van-cell-group inset title="位置信息">
        <van-field
          v-model="formData.workshop"
          name="workshop"
          label="所属车间"
          placeholder="请选择车间"
          is-link
          readonly
          @click="showWorkshopPicker = true"
        />
        <van-field
          v-model="formData.location"
          name="location"
          label="安装位置"
          placeholder="请输入安装位置"
        />
      </van-cell-group>

      <!-- 设备参数 -->
      <van-cell-group inset title="设备参数">
        <van-field
          v-model="formData.power"
          name="power"
          label="功率(kW)"
          type="number"
          placeholder="请输入功率"
        />
        <van-field
          v-model="formData.voltage"
          name="voltage"
          label="电压(V)"
          type="number"
          placeholder="请输入电压"
        />
        <van-field
          v-model="formData.current"
          name="current"
          label="电流(A)"
          type="number"
          placeholder="请输入电流"
        />
      </van-cell-group>

      <!-- 现场照片 -->
      <van-cell-group inset title="现场照片">
        <van-field name="photos" label="设备照片">
          <template #input>
            <van-uploader
              v-model="fileList"
              multiple
              :max-count="6"
              :after-read="handleAfterRead"
            />
          </template>
        </van-field>
      </van-cell-group>

      <!-- 备注 -->
      <van-cell-group inset title="备注">
        <van-field
          v-model="formData.remark"
          name="remark"
          label="备注"
          type="textarea"
          rows="3"
          placeholder="请输入备注信息"
        />
      </van-cell-group>

      <!-- 提交按钮 -->
      <div class="submit-bar">
        <van-button round block type="primary" native-type="submit" :loading="submitting">
          提交
        </van-button>
      </div>
    </van-form>

    <!-- 车间选择器 -->
    <van-popup v-model:show="showWorkshopPicker" position="bottom">
      <van-picker
        :columns="workshopOptions"
        @confirm="onWorkshopConfirm"
        @cancel="showWorkshopPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'

const router = useRouter()
const route = useRoute()

// 表单数据
const formData = reactive({
  deviceName: '',
  deviceModel: '',
  manufacturer: '',
  workshop: '',
  location: '',
  power: '',
  voltage: '',
  current: '',
  remark: ''
})

// 文件列表
const fileList = ref<any[]>([])

// 提交状态
const submitting = ref(false)

// 车间选择器
const showWorkshopPicker = ref(false)
const workshopOptions = [
  { text: '一号车间', value: 'workshop_1' },
  { text: '二号车间', value: 'workshop_2' },
  { text: '三号车间', value: 'workshop_3' },
  { text: '装配车间', value: 'assembly' }
]

// 车间确认
const onWorkshopConfirm = ({ selectedOptions }: any) => {
  formData.workshop = selectedOptions[0].text
  showWorkshopPicker.value = false
}

// 图片上传后处理
const handleAfterRead = (file: any) => {
  // TODO: 上传图片到服务器
  console.log('上传图片:', file)
}

// 提交表单
const handleSubmit = async () => {
  submitting.value = true
  try {
    // TODO: 调用API提交数据
    // await researchApi.create(formData)

    showSuccessToast('提交成功')
    setTimeout(() => {
      router.back()
    }, 500)
  } catch (error) {
    showToast('提交失败')
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  // 如果是编辑模式，加载数据
  const id = route.params.id
  if (id) {
    // TODO: 加载调研详情
    console.log('编辑调研:', id)
  }
})
</script>

<style scoped>
.research-form {
  padding: 16px 0;
  background-color: #f5f5f5;
  min-height: 100vh;
}

:deep(.van-cell-group) {
  margin-bottom: 12px;
}

.submit-bar {
  padding: 16px;
}
</style>
