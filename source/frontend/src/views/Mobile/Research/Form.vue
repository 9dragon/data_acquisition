<template>
  <div class="research-form">
    <!-- 步骤指示器 -->
    <div class="steps-container">
      <van-steps :active="currentStep" direction="horizontal" active-color="#1989fa">
        <van-step>基础信息</van-step>
        <van-step>控制器</van-step>
        <van-step>采集信息</van-step>
      </van-steps>
    </div>

    <!-- 步骤内容 -->
    <div class="step-content">
      <BasicInfoStep
        v-if="currentStep === 0"
        v-model="basicData"
        ref="basicStepRef"
      />
      <ControllerInfoStep
        v-if="currentStep === 1"
        v-model="controllerData"
        ref="controllerStepRef"
      />
      <CollectionInfoStep
        v-if="currentStep === 2"
        v-model="collectionData"
        ref="collectionStepRef"
      />
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar">
      <van-button
        v-if="currentStep > 0"
        size="large"
        @click="prevStep"
      >
        上一步
      </van-button>
      <van-button
        v-if="currentStep < 2"
        type="primary"
        size="large"
        @click="nextStep"
      >
        下一步
      </van-button>
      <van-button
        v-if="currentStep === 2"
        type="primary"
        size="large"
        :loading="submitting"
        @click="handleSubmit"
      >
        提交
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast, showSuccessToast } from 'vant'
import { deviceResearchApi } from '@/api/deviceResearch'
import { useMobileProjectStore } from '@/stores/mobileProject'
import type { DeviceResearch, DeviceResearchBasic, DeviceResearchController, DeviceResearchCollection } from '@/types/device'
import BasicInfoStep from './components/BasicInfoStep.vue'
import ControllerInfoStep from './components/ControllerInfoStep.vue'
import CollectionInfoStep from './components/CollectionInfoStep.vue'

const router = useRouter()
const route = useRoute()
const projectStore = useMobileProjectStore()

// 步骤引用
const basicStepRef = ref()
const controllerStepRef = ref()
const collectionStepRef = ref()

// 当前步骤
const currentStep = ref(0)

// 表单数据
const basicData = reactive<DeviceResearchBasic>({
  projectId: undefined,
  projectName: '',
  deviceTypeId: '',
  deviceTypeName: '',
  workshopId: '',
  workshopName: '',
  quantity: 1,
  deviceManufacturer: '',
  remarks: ''
})

const controllerData = reactive<DeviceResearchController>({
  isInterfaceOccupied: false,
  interfaceType: undefined,
  hasTouchScreen: false,
  controllerBrand: '',
  controllerModel: '',
  touchScreenBrand: '',
  hasPointTable: false,
  hasPlcSource: false,
  hasTouchScreenSource: false,
  controllerPhotos: '',
  controllerVideos: '',
  touchscreenPhotos: '',
  touchscreenVideos: '',
  cabinetPhotos: '',
  cabinetVideos: ''
})

const collectionData = reactive<DeviceResearchCollection>({
  collectDeviceStatus: false,
  collectProcessParams: false,
  dataItems: '',
  dataItemsDetail: '',
  collectProduction: false,
  collectEnergy: false
})

// 提交状态
const submitting = ref(false)

// 调研ID（编辑模式）
const researchId = ref<number>()

// 上一步
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 下一步
const nextStep = async () => {
  // 验证当前步骤
  const valid = await validateCurrentStep()
  if (!valid) return

  // 如果是第一步，需要先创建或更新调研
  if (currentStep.value === 0 && !researchId.value) {
    await createResearch()
  } else if (currentStep.value === 0 && researchId.value) {
    await updateBasicInfo()
  } else if (currentStep.value === 1 && researchId.value) {
    await updateControllerInfo()
  }

  if (currentStep.value < 2) {
    currentStep.value++
  }
}

// 验证当前步骤
const validateCurrentStep = async () => {
  if (currentStep.value === 0 && basicStepRef.value) {
    return basicStepRef.value.validate?.()
  }
  if (currentStep.value === 1 && controllerStepRef.value) {
    return controllerStepRef.value.validate?.()
  }
  if (currentStep.value === 2 && collectionStepRef.value) {
    return collectionStepRef.value.validate?.()
  }
  return true
}

// 创建调研
const createResearch = async () => {
  showLoadingToast({
    message: '保存中...',
    forbidClick: true,
    duration: 0
  })

  try {
    const result = await deviceResearchApi.create({
      ...basicData,
      basicCompleted: true,
      controllerCompleted: false,
      collectionCompleted: false,
      researchProgress: 33
    })
    researchId.value = result.id
    closeToast()
    showSuccessToast('基础信息已保存')
  } catch (error: any) {
    closeToast()
    showToast(error.message || '保存失败')
    throw error
  }
}

// 更新基础信息
const updateBasicInfo = async () => {
  if (!researchId.value) return

  try {
    await deviceResearchApi.updateBasic(researchId.value, basicData)
  } catch (error: any) {
    showToast(error.message || '更新失败')
    throw error
  }
}

// 更新控制器信息
const updateControllerInfo = async () => {
  if (!researchId.value) return

  try {
    await deviceResearchApi.updateController(researchId.value, controllerData)
  } catch (error: any) {
    showToast(error.message || '更新失败')
    throw error
  }
}

// 提交全部
const handleSubmit = async () => {
  // 验证
  const valid = await validateCurrentStep()
  if (!valid) return

  submitting.value = true
  showLoadingToast({
    message: '提交中...',
    forbidClick: true,
    duration: 0
  })

  try {
    if (researchId.value) {
      // 更新控制器信息
      await deviceResearchApi.updateController(researchId.value, controllerData)
      // 更新采集信息
      await deviceResearchApi.updateCollection(researchId.value, collectionData)
      // 更新进度为完成
      // TODO: 可能需要一个接口来更新整体进度
    }

    closeToast()
    showSuccessToast('提交成功')

    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error: any) {
    closeToast()
    showToast(error.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

// 加载调研详情（编辑模式）
const loadResearchDetail = async (id: number) => {
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0
  })

  try {
    const detail = await deviceResearchApi.getById(id)
    researchId.value = detail.id

    // 加载基础信息
    Object.assign(basicData, {
      projectId: detail.projectId,
      projectName: detail.projectName,
      deviceTypeId: detail.deviceTypeId,
      deviceTypeName: detail.deviceTypeName,
      workshopId: detail.workshopId,
      workshopName: detail.workshopName,
      quantity: detail.quantity,
      deviceManufacturer: detail.deviceManufacturer,
      remarks: detail.remarks
    })

    // 加载控制器信息
    Object.assign(controllerData, {
      isInterfaceOccupied: detail.isInterfaceOccupied,
      interfaceType: detail.interfaceType,
      hasTouchScreen: detail.hasTouchScreen,
      controllerBrand: detail.controllerBrand,
      controllerModel: detail.controllerModel,
      touchScreenBrand: detail.touchScreenBrand,
      hasPointTable: detail.hasPointTable,
      hasPlcSource: detail.hasPlcSource,
      hasTouchScreenSource: detail.hasTouchScreenSource,
      controllerPhotos: detail.controllerPhotos,
      controllerVideos: detail.controllerVideos,
      touchscreenPhotos: detail.touchscreenPhotos,
      touchscreenVideos: detail.touchscreenVideos,
      cabinetPhotos: detail.cabinetPhotos,
      cabinetVideos: detail.cabinetVideos
    })

    // 加载采集信息
    Object.assign(collectionData, {
      collectDeviceStatus: detail.collectDeviceStatus,
      collectProcessParams: detail.collectProcessParams,
      dataItems: detail.dataItems,
      dataItemsDetail: detail.dataItemsDetail,
      collectProduction: detail.collectProduction,
      collectEnergy: detail.collectEnergy
    })

    // 根据进度设置当前步骤
    const progress = detail.researchProgress || 0
    if (progress < 33) {
      currentStep.value = 0
    } else if (progress < 66) {
      currentStep.value = 1
    } else {
      currentStep.value = 2
    }

    closeToast()
  } catch (error: any) {
    closeToast()
    showToast(error.message || '加载失败')
    router.back()
  }
}

// 初始化
onMounted(async () => {
  // 获取当前项目信息
  await projectStore.fetchCurrentProject()

  const id = route.params.id || route.query.id
  if (id) {
    loadResearchDetail(Number(id))
  }
})
</script>

<style scoped>
.research-form {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.steps-container {
  background: #fff;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.step-content {
  flex: 1;
  overflow-y: auto;
}

.action-bar {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.action-bar .van-button {
  flex: 1;
}
</style>
