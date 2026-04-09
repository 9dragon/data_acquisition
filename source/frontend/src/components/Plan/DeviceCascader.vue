<template>
  <div class="device-cascader">
    <div class="select-actions">
      <el-checkbox
        v-model="allSelected"
        :indeterminate="isIndeterminate"
        @change="handleSelectAll"
      >
        全选
      </el-checkbox>
      <el-button size="small" @click="handleExpandAll">
        展开全部
      </el-button>
      <el-button size="small" @click="handleCollapseAll">
        收起全部
      </el-button>
      <span class="selected-count">
        已选 {{ modelValue?.length || 0 }} / {{ totalDeviceCount }} 台
      </span>
    </div>

    <div v-if="loading" class="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载设备中...</span>
    </div>

    <div v-else-if="workshopGroups.length === 0" class="empty">
      暂无设备，请先选择项目
    </div>

    <el-collapse v-else v-model="expandedWorkshops">
      <el-collapse-item
        v-for="group in workshopGroups"
        :key="group.workshopId"
        :name="group.workshopId"
      >
        <template #title>
          <div class="workshop-title" @click.stop>
            <el-checkbox
              :model-value="isWorkshopAllSelected(group)"
              :indeterminate="isWorkshopPartiallySelected(group)"
              @update:model-value="() => handleSelectWorkshop(group)"
              @click.stop
            >
              {{ group.workshopName || '未分组' }} ({{ group.devices.length }}台)
            </el-checkbox>
          </div>
        </template>

        <div class="device-list">
          <el-checkbox-group v-model="localSelectedIds" @change="handleChange">
            <el-checkbox
              v-for="device in group.devices"
              :key="device.id"
              :label="device.id"
              class="device-checkbox"
            >
              <span class="device-name">{{ device.name }}</span>
              <span class="device-code">({{ device.code }})</span>
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { http } from '@/api/request'
import { deviceApi } from '@/api/device'
import type { Device } from '@/types/device'

interface Props {
  projectId?: number
  modelValue?: number[]
}

interface Emits {
  'update:modelValue': [value: number[]]
}

interface WorkshopGroup {
  workshopId: number
  workshopName: string
  devices: Device[]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const devices = ref<Device[]>([])
const expandedWorkshops = ref<number[]>([])

const localSelectedIds = ref<number[]>([...(props.modelValue || [])])

// 按车间分组
const workshopGroups = computed<WorkshopGroup[]>(() => {
  const groups = new Map<number, WorkshopGroup>()

  devices.value.forEach(device => {
    const workshopId = device.workshopId || 0
    const workshopName = device.workshopName || '未分组'

    if (!groups.has(workshopId)) {
      groups.set(workshopId, {
        workshopId,
        workshopName,
        devices: []
      })
    }

    groups.get(workshopId)!.devices.push(device)
  })

  return Array.from(groups.values()).sort((a, b) => {
    if (a.workshopId === 0) return 1
    if (b.workshopId === 0) return -1
    return a.workshopName.localeCompare(b.workshopName)
  })
})

// 总设备数量
const totalDeviceCount = computed(() => devices.value.length)

// 全选状态
const allSelected = computed(() => {
  return totalDeviceCount.value > 0 &&
    localSelectedIds.value.length === totalDeviceCount.value
})

// 部分选中状态
const isIndeterminate = computed(() => {
  return localSelectedIds.value.length > 0 &&
    localSelectedIds.value.length < totalDeviceCount.value
})

// 加载项目设备
async function loadProjectDevices(projectId: number) {
  if (!projectId) {
    devices.value = []
    return
  }

  try {
    loading.value = true
    const response = await deviceApi.getOptions({ projectId })
    // 需要完整的设备信息（包含车间信息）来分组
    // 如果选项接口不够，这里可能需要调整
    const fullResponse = await http.get<any>('/devices', {
      params: { projectId, pageSize: 1000 }
    })
    devices.value = fullResponse.records || []

    // 默认全选
    if (props.modelValue === undefined || props.modelValue.length === 0) {
      localSelectedIds.value = devices.value.map(d => d.id)
      emit('update:modelValue', localSelectedIds.value)
    }
  } catch (error) {
    console.error('加载设备失败:', error)
    devices.value = []
  } finally {
    loading.value = false
  }
}

// 判断车间是否全选
function isWorkshopAllSelected(group: WorkshopGroup): boolean {
  const workshopDeviceIds = group.devices.map(d => d.id)
  return workshopDeviceIds.length > 0 &&
    workshopDeviceIds.every(id => localSelectedIds.value.includes(id))
}

// 判断车间是否部分选中
function isWorkshopPartiallySelected(group: WorkshopGroup): boolean {
  const workshopDeviceIds = group.devices.map(d => d.id)
  const selectedCount = workshopDeviceIds.filter(id =>
    localSelectedIds.value.includes(id)
  ).length
  return selectedCount > 0 && selectedCount < workshopDeviceIds.length
}

// 选择车间
function handleSelectWorkshop(group: WorkshopGroup) {
  const workshopDeviceIds = group.devices.map(d => d.id)
  const allSelected = isWorkshopAllSelected(group)

  if (allSelected) {
    // 取消选中该车间的所有设备
    localSelectedIds.value = localSelectedIds.value.filter(
      id => !workshopDeviceIds.includes(id)
    )
  } else {
    // 选中该车间的所有设备
    const newIds = workshopDeviceIds.filter(id =>
      !localSelectedIds.value.includes(id)
    )
    localSelectedIds.value = [...localSelectedIds.value, ...newIds]
  }

  emit('update:modelValue', localSelectedIds.value)
}

// 全选/取消全选
function handleSelectAll(checked: boolean) {
  if (checked) {
    localSelectedIds.value = devices.value.map(d => d.id)
  } else {
    localSelectedIds.value = []
  }
  emit('update:modelValue', localSelectedIds.value)
}

// 展开全部
function handleExpandAll() {
  expandedWorkshops.value = workshopGroups.value.map(g => g.workshopId)
}

// 收起全部
function handleCollapseAll() {
  expandedWorkshops.value = []
}

// 处理选择变化
function handleChange() {
  emit('update:modelValue', localSelectedIds.value)
}

// 监听项目ID变化
watch(() => props.projectId, (newProjectId) => {
  if (newProjectId) {
    loadProjectDevices(newProjectId)
  } else {
    devices.value = []
    localSelectedIds.value = []
  }
}, { immediate: true })

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    localSelectedIds.value = [...newValue]
  }
})
</script>

<style scoped>
.device-cascader {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
}

.select-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.selected-count {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: #909399;
}

.empty {
  padding: 24px;
  text-align: center;
  color: #999;
  background: #fafafa;
  border-radius: 4px;
}

.workshop-title {
  width: 100%;
  padding-right: 12px;
}

.device-list {
  padding: 8px 0;
}

.device-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.device-checkbox:hover {
  background-color: #f5f7fa;
}

.device-name {
  font-size: 14px;
  color: #303133;
}

.device-code {
  margin-left: 4px;
  font-size: 12px;
  color: #909399;
}
</style>
