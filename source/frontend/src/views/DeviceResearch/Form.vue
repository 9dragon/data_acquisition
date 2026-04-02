<template>
  <el-drawer
    v-model="visible"
    title="设备调研"
    direction="rtl"
    size="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 调研进度卡片 -->
    <el-card v-if="currentResearch" class="progress-card" shadow="never">
      <div class="progress-header">
        <span class="progress-title">调研进度</span>
        <span class="progress-percent" :style="{ color: progressColor }">
          {{ statusText }} ({{ progress }}%)
        </span>
      </div>
      <el-progress
        :percentage="progress"
        :status="progress === 100 ? 'success' : undefined"
        :stroke="progressColor"
      />
      <div class="progress-sections">
        <div class="progress-section" :class="{ completed: currentResearch.basicCompleted }">
          <el-icon v-if="currentResearch.basicCompleted" class="success-icon"><CircleCheck /></el-icon>
          <span v-else class="pending-icon">○</span>
          基础信息{{ currentResearch.basicCompleted ? '已完成' : '未完成' }}
        </div>
        <div class="progress-section" :class="{ completed: currentResearch.controllerCompleted }">
          <el-icon v-if="currentResearch.controllerCompleted" class="success-icon"><CircleCheck /></el-icon>
          <span v-else class="pending-icon">○</span>
          控制器信息{{ currentResearch.controllerCompleted ? '已完成' : '未完成' }}
        </div>
        <div class="progress-section" :class="{ completed: currentResearch.collectionCompleted }">
          <el-icon v-if="currentResearch.collectionCompleted" class="success-icon"><CircleCheck /></el-icon>
          <span v-else class="pending-icon">○</span>
          采集信息{{ currentResearch.collectionCompleted ? '已完成' : '未完成' }}
        </div>
      </div>
    </el-card>

    <!-- 调研表单 -->
    <el-card shadow="never">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane name="basic">
          <template #label>
            <span class="tab-label">
              基础信息
              <el-icon v-if="currentResearch?.basicCompleted" class="success-icon-tab"><CircleCheck /></el-icon>
            </span>
          </template>
          <BasicInfoTab
            ref="basicTabRef"
            :initial-values="basicData"
            :loading="loading"
            :disabled="isViewMode"
            :workshop-options="workshopOptions"
            :device-type-options="deviceTypeOptions"
            :projects="projects"
            :project-id="currentResearch?.projectId"
            @save="handleSaveBasic"
          />
        </el-tab-pane>

        <el-tab-pane name="controller">
          <template #label>
            <span class="tab-label">
              控制器信息
              <el-icon v-if="currentResearch?.controllerCompleted" class="success-icon-tab"><CircleCheck /></el-icon>
            </span>
          </template>
          <ControllerInfoTab
            ref="controllerTabRef"
            :initial-values="controllerData"
            :loading="loading"
            :disabled="isViewMode"
            @save="handleSaveController"
          />
        </el-tab-pane>

        <el-tab-pane name="collection">
          <template #label>
            <span class="tab-label">
              采集信息
              <el-icon v-if="currentResearch?.collectionCompleted" class="success-icon-tab"><CircleCheck /></el-icon>
            </span>
          </template>
          <CollectionInfoTab
            ref="collectionTabRef"
            :initial-values="collectionData"
            :loading="loading"
            :disabled="isViewMode"
            @save="handleSaveCollection"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="drawer-footer">
        <template v-if="!isViewMode">
          <el-button @click="handleClose">取消</el-button>
          <el-button v-if="activeTab !== 'basic'" @click="handlePreviousTab">上一步</el-button>
          <el-button type="primary" @click="handleNextOrSave">
            {{ activeTab === 'collection' ? '完成' : '下一步' }}
          </el-button>
        </template>
        <template v-else>
          <el-button @click="handleClose">关闭</el-button>
        </template>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CircleCheck } from '@element-plus/icons-vue'
import { useDeviceResearchStore } from '@/stores/deviceResearch'
import { useProjectStore } from '@/stores/project'
import { useWorkshopStore } from '@/stores/workshop'
import { useDeviceTypeStore } from '@/stores/deviceType'
import BasicInfoTab from './tabs/BasicInfo.vue'
import ControllerInfoTab from './tabs/ControllerInfo.vue'
import CollectionInfoTab from './tabs/CollectionInfo.vue'
import type { DeviceResearch, DeviceResearchBasic, DeviceResearchController, DeviceResearchCollection } from '@/types/device'
import type { Project } from '@/types/project'

interface Props {
  modelValue: boolean
  researchId?: string
  deviceId?: string
  mode?: 'view' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'edit'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

const route = useRoute()
const router = useRouter()
const deviceResearchStore = useDeviceResearchStore()
const projectStore = useProjectStore()
const workshopStore = useWorkshopStore()
const deviceTypeStore = useDeviceTypeStore()

const basicTabRef = ref()
const controllerTabRef = ref()
const collectionTabRef = ref()

const activeTab = ref('basic')
const loading = ref(false)

// 获取项目、工序、车间、设备类型选项
const projects = computed<Project[]>(() => projectStore.projectList || [])

const workshopOptions = computed(() => {
  // 如果没有选中项目，显示所有车间
  const workshops = deviceResearchStore.currentResearch?.projectId
    ? workshopStore.workshopList.filter(
        w => w.projectId === deviceResearchStore.currentResearch?.projectId
      )
    : workshopStore.workshopList
  return workshops.map(w => ({ label: w.name, value: w.name }))
})

const deviceTypeOptions = computed(() => {
  // 如果没有选中项目，显示所有设备类型
  const types = deviceResearchStore.currentResearch?.projectId
    ? deviceTypeStore.deviceTypeList.filter(
        t => t.projectId === deviceResearchStore.currentResearch?.projectId
      )
    : deviceTypeStore.deviceTypeList
  return types.map(t => ({ label: t.name, value: t.name }))
})

const currentResearch = computed(() => deviceResearchStore.currentResearch)

const isViewMode = computed(() => props.mode === 'view')

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const progress = computed(() => {
  if (!currentResearch.value) return 0
  return currentResearch.value.researchProgress || 0
})

const statusText = computed(() => {
  if (progress.value === 0) return '未开始'
  if (progress.value === 100) return '已完成'
  return '进行中'
})

const progressColor = computed(() => {
  if (progress.value === 0) return '#d9d9d9'
  if (progress.value === 100) return '#52c41a'
  return '#1890ff'
})

// 将 flat 结构转换为 nested 结构供子组件使用
const basicData = computed(() => {
  if (!currentResearch.value) return {}
  return {
    projectName: currentResearch.value.projectName,
    projectId: currentResearch.value.projectId,
    workshop: currentResearch.value.workshop,
    deviceType: currentResearch.value.deviceType,
    quantity: currentResearch.value.quantity,
    deviceManufacturer: currentResearch.value.deviceManufacturer,
    remarks: currentResearch.value.remarks
  }
})

const controllerData = computed(() => {
  if (!currentResearch.value) return {}
  return {
    isInterfaceOccupied: currentResearch.value.isInterfaceOccupied,
    interfaceType: currentResearch.value.interfaceType,
    hasTouchScreen: currentResearch.value.hasTouchScreen,
    touchScreenBrand: currentResearch.value.touchScreenBrand,
    controllerBrand: currentResearch.value.controllerBrand,
    controllerModel: currentResearch.value.controllerModel,
    hasPointTable: currentResearch.value.hasPointTable,
    hasPlcSource: currentResearch.value.hasPlcSource,
    hasTouchScreenSource: currentResearch.value.hasTouchScreenSource
  }
})

const collectionData = computed(() => {
  if (!currentResearch.value) return {}

  // 解析 dataItems JSON 字符串
  let dataItems: string[] = []
  if (currentResearch.value.dataItems) {
    try {
      dataItems = JSON.parse(currentResearch.value.dataItems)
    } catch {
      dataItems = []
    }
  }

  return {
    collectDeviceStatus: currentResearch.value.collectDeviceStatus,
    collectProcessParams: currentResearch.value.collectProcessParams,
    dataItems,
    dataItemsDetail: currentResearch.value.dataItemsDetail,
    collectProduction: currentResearch.value.collectProduction,
    collectEnergy: currentResearch.value.collectEnergy
  }
})

// 加载调研数据
const loadResearch = async () => {
  if (props.researchId) {
    await deviceResearchStore.fetchById(props.researchId)
  } else if (props.deviceId) {
    await deviceResearchStore.fetchByDeviceId(props.deviceId)
  }

  // 加载相关选项数据 - 强制刷新以确保最新数据
  await Promise.all([
    projectStore.fetchProjectList(),
    workshopStore.fetchList(),
    deviceTypeStore.fetchList()
  ])
}

// 处理项目变化
const handleProjectChange = async (projectId: string) => {
  if (currentResearch.value) {
    // 重新加载车间、设备类型选项
    await Promise.all([
      workshopStore.fetchList(),
      deviceTypeStore.fetchList()
    ])
  }
}

// 保存基础信息
const handleSaveBasic = async (data: DeviceResearchBasic) => {
  loading.value = true
  try {
    let id = currentResearch.value?.id || currentResearch.value?.deviceId

    // 新建时先创建记录
    if (!id) {
      const newResearch = await deviceResearchStore.create({
        projectId: data.projectId,
        deviceId: props.deviceId,
        basic: data
      })
      deviceResearchStore.setCurrent(newResearch)
    } else {
      await deviceResearchStore.updateBasic(id, data)
    }

    ElMessage.success('保存成功')
    emit('success')
  } finally {
    loading.value = false
  }
}

// 保存控制器信息
const handleSaveController = async (data: DeviceResearchController) => {
  loading.value = true
  try {
    const id = currentResearch.value?.id || currentResearch.value?.deviceId
    if (id) {
      await deviceResearchStore.updateController(id, data)
      ElMessage.success('保存成功')
      emit('success')
    }
  } finally {
    loading.value = false
  }
}

// 保存采集信息
const handleSaveCollection = async (data: DeviceResearchCollection) => {
  loading.value = true
  try {
    const id = currentResearch.value?.id || currentResearch.value?.deviceId
    if (id) {
      await deviceResearchStore.updateCollection(id, data)
      ElMessage.success('保存成功')
      emit('success')
      // 最后一步，关闭弹窗
      visible.value = false
    }
  } finally {
    loading.value = false
  }
}

// 处理"下一步"或"完成"按钮
const handleNextOrSave = async () => {
  if (!currentResearch.value) return

  try {
    // 根据当前标签页，保存当前及之前的所有标签页数据
    if (activeTab.value === 'basic') {
      // 保存基础信息
      await basicTabRef.value?.handleSave()
      activeTab.value = 'controller'
    } else if (activeTab.value === 'controller') {
      // 如果基础信息未完成，先保存基础信息
      if (!currentResearch.value.basicCompleted && basicTabRef.value) {
        await basicTabRef.value.handleSave()
      }
      // 保存控制器信息
      await controllerTabRef.value?.handleSave()
      activeTab.value = 'collection'
    } else if (activeTab.value === 'collection') {
      // 如果基础信息未完成，先保存基础信息
      if (!currentResearch.value.basicCompleted && basicTabRef.value) {
        await basicTabRef.value.handleSave()
      }
      // 如果控制器信息未完成，先保存控制器信息
      if (!currentResearch.value.controllerCompleted && controllerTabRef.value) {
        await controllerTabRef.value.handleSave()
      }
      // 保存采集信息（会自动关闭抽屉）
      await collectionTabRef.value?.handleSave()
    }
  } catch (error) {
    // 验证或保存失败，不做处理
  }
}

// 处理"上一步"按钮
const handlePreviousTab = () => {
  if (activeTab.value === 'controller') {
    activeTab.value = 'basic'
  } else if (activeTab.value === 'collection') {
    activeTab.value = 'controller'
  }
}

const handleClose = () => {
  visible.value = false
  activeTab.value = 'basic'
  deviceResearchStore.resetCurrent()
}

// 暴露子组件的验证方法
const validateCurrentTab = async () => {
  const tabRef = activeTab.value === 'basic' ? basicTabRef
    : activeTab.value === 'controller' ? controllerTabRef
    : collectionTabRef

  if (tabRef.value) {
    await tabRef.value.validate()
  }
}

// 暴露方法供父组件使用
defineExpose({
  validateCurrentTab
})

// 监听visible变化，加载调研数据
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    loadResearch()
  }
}, { immediate: true })
</script>

<style scoped>
.progress-card {
  margin-bottom: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-title {
  font-weight: 500;
  font-size: 14px;
}

.progress-percent {
  font-weight: 600;
  font-size: 14px;
}

.progress-sections {
  display: flex;
  gap: 24px;
  margin-top: 12px;
  font-size: 12px;
  color: #666;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 4px;
}

.progress-section.completed {
  color: #52c41a;
}

.success-icon {
  color: #52c41a;
}

.success-icon-tab {
  color: #52c41a;
  margin-left: 4px;
}

.pending-icon {
  color: #d9d9d9;
}

.tab-label {
  display: flex;
  align-items: center;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
