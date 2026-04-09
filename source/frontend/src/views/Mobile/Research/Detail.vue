<template>
  <div class="research-detail">
    <div v-if="detail.id">
      <!-- 进度卡片 -->
      <div class="progress-card">
        <div class="progress-circle">
          <van-circle
            v-model:current-rate="currentRate"
            :rate="detail.researchProgress || 0"
            :speed="100"
            :text="`${detail.researchProgress || 0}%`"
            size="80px"
            color="#1989fa"
            layer-color="#ebedf0"
          />
        </div>
        <div class="progress-info">
          <div class="progress-title">调研进度</div>
          <div class="progress-status">{{ getProgressStatusText(detail.researchProgress) }}</div>
        </div>
      </div>

      <!-- 基本信息 -->
      <van-cell-group inset title="基本信息">
        <van-cell title="项目名称" :value="detail.projectName || '-'" />
        <van-cell title="所属车间" :value="detail.workshopName || '-'" />
        <van-cell title="设备类型" :value="detail.deviceTypeName || '-'" />
        <van-cell title="数量" :value="detail.quantity?.toString() || '-'" />
        <van-cell title="设备厂商" :value="detail.deviceManufacturer || '-'" />
        <van-cell title="备注" :value="detail.remarks || '-'">
          <template #value>
            <span class="remark-text">{{ detail.remarks || '-' }}</span>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 控制器信息 -->
      <van-collapse v-model="activeCollapse" accordion>
        <van-collapse-item title="控制器信息" name="controller">
          <van-cell-group inset>
            <van-cell title="接口被占用">
              <template #value>
                <van-tag :type="detail.isInterfaceOccupied ? 'danger' : 'success'">
                  {{ detail.isInterfaceOccupied ? '是' : '否' }}
                </van-tag>
              </template>
            </van-cell>
            <van-cell title="接口类型" :value="detail.interfaceType || '-'" />
            <van-cell title="连接触摸屏">
              <template #value>
                <van-tag :type="detail.hasTouchScreen ? 'success' : 'default'">
                  {{ detail.hasTouchScreen ? '是' : '否' }}
                </van-tag>
              </template>
            </van-cell>
            <van-cell title="触摸屏品牌" :value="detail.touchScreenBrand || '-'" />
            <van-cell title="控制器品牌" :value="detail.controllerBrand || '-'" />
            <van-cell title="控制器型号" :value="detail.controllerModel || '-'" />
            <van-cell title="提供的资料">
              <template #value>
                <div class="material-tags">
                  <van-tag v-if="detail.hasPointTable" type="primary" size="small">点位表</van-tag>
                  <van-tag v-if="detail.hasPlcSource" type="primary" size="small">PLC源程序</van-tag>
                  <van-tag v-if="detail.hasTouchScreenSource" type="primary" size="small">触摸屏源程序</van-tag>
                  <span v-if="!detail.hasPointTable && !detail.hasPlcSource && !detail.hasTouchScreenSource">-</span>
                </div>
              </template>
            </van-cell>

            <!-- 控制器照片 -->
            <van-cell v-if="hasControllerPhotos" title="控制器照片">
              <template #value>
                <div class="photo-grid">
                  <van-image
                    v-for="(photo, index) in getMediaFiles(detail.controllerPhotos)"
                    :key="index"
                    :src="photo.url"
                    width="80"
                    height="80"
                    fit="cover"
                    @click="previewImages(getMediaFiles(detail.controllerPhotos), index)"
                  />
                </div>
              </template>
            </van-cell>

            <!-- 触摸屏照片 -->
            <van-cell v-if="hasTouchscreenPhotos" title="触摸屏照片">
              <template #value>
                <div class="photo-grid">
                  <van-image
                    v-for="(photo, index) in getMediaFiles(detail.touchscreenPhotos)"
                    :key="index"
                    :src="photo.url"
                    width="80"
                    height="80"
                    fit="cover"
                    @click="previewImages(getMediaFiles(detail.touchscreenPhotos), index)"
                  />
                </div>
              </template>
            </van-cell>

            <!-- 控制柜照片 -->
            <van-cell v-if="hasCabinetPhotos" title="控制柜照片">
              <template #value>
                <div class="photo-grid">
                  <van-image
                    v-for="(photo, index) in getMediaFiles(detail.cabinetPhotos)"
                    :key="index"
                    :src="photo.url"
                    width="80"
                    height="80"
                    fit="cover"
                    @click="previewImages(getMediaFiles(detail.cabinetPhotos), index)"
                  />
                </div>
              </template>
            </van-cell>
          </van-cell-group>
        </van-collapse-item>

        <!-- 采集信息 -->
        <van-collapse-item title="采集信息" name="collection">
          <van-cell-group inset>
            <van-cell title="采集设备状态">
              <template #value>
                <van-tag :type="detail.collectDeviceStatus ? 'success' : 'default'">
                  {{ detail.collectDeviceStatus ? '是' : '否' }}
                </van-tag>
              </template>
            </van-cell>
            <van-cell title="采集工艺参数">
              <template #value>
                <van-tag :type="detail.collectProcessParams ? 'success' : 'default'">
                  {{ detail.collectProcessParams ? '是' : '否' }}
                </van-tag>
              </template>
            </van-cell>
            <van-cell v-if="detail.collectProcessParams && hasDataItems" title="需采集数据项">
              <template #value>
                <div class="data-item-tags">
                  <van-tag
                    v-for="(item, index) in getDataItems()"
                    :key="index"
                    type="primary"
                    size="small"
                  >
                    {{ item }}
                  </van-tag>
                </div>
              </template>
            </van-cell>
            <van-cell v-if="detail.dataItemsDetail" title="数据项明细">
              <template #value>
                <span class="detail-text">{{ detail.dataItemsDetail }}</span>
              </template>
            </van-cell>
            <van-cell title="采集产量/节拍">
              <template #value>
                <van-tag :type="detail.collectProduction ? 'success' : 'default'">
                  {{ detail.collectProduction ? '是' : '否' }}
                </van-tag>
              </template>
            </van-cell>
            <van-cell title="采集能耗">
              <template #value>
                <van-tag :type="detail.collectEnergy ? 'success' : 'default'">
                  {{ detail.collectEnergy ? '是' : '否' }}
                </van-tag>
              </template>
            </van-cell>
          </van-cell-group>
        </van-collapse-item>
      </van-collapse>

      <!-- 调研信息 -->
      <van-cell-group inset title="调研信息">
        <van-cell title="调研人员" :value="detail.researcherName || '-'" />
        <van-cell title="调研日期" :value="detail.researchDate || '-'" />
        <van-cell title="创建时间" :value="formatDateTime(detail.createdAt)" />
        <van-cell v-if="detail.updatedAt" title="更新时间" :value="formatDateTime(detail.updatedAt)" />
      </van-cell-group>

      <!-- 操作按钮 -->
      <div class="action-bar">
        <van-button
          type="primary"
          block
          @click="goToEdit"
        >
          {{ isCompleted ? '查看详情' : '继续填报' }}
        </van-button>
      </div>
    </div>

    <!-- 加载中 -->
    <van-loading v-else type="spinner" size="24" vertical>
      加载中...
    </van-loading>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showLoadingToast, closeToast, showToast, showImagePreview } from 'vant'
import { deviceResearchApi } from '@/api/deviceResearch'
import type { DeviceResearch } from '@/types/device'
import type { MediaAttachment } from '@/types/device'

const router = useRouter()
const route = useRoute()

// 详情数据
const detail = reactive<Partial<DeviceResearch>>({
  id: undefined
})

// 进度
const currentRate = ref(0)

// 折叠面板
const activeCollapse = ref('')

// 是否已完成
const isCompleted = computed(() => {
  return (detail.researchProgress || 0) >= 100
})

// 是否有控制器照片
const hasControllerPhotos = computed(() => {
  return getMediaFiles(detail.controllerPhotos || '').length > 0
})

// 是否有触摸屏照片
const hasTouchscreenPhotos = computed(() => {
  return getMediaFiles(detail.touchscreenPhotos || '').length > 0
})

// 是否有控制柜照片
const hasCabinetPhotos = computed(() => {
  return getMediaFiles(detail.cabinetPhotos || '').length > 0
})

// 是否有数据项
const hasDataItems = computed(() => {
  return getDataItems().length > 0
})

// 获取进度状态文本
const getProgressStatusText = (progress?: number) => {
  if (!progress) return '进行中'
  if (progress >= 100) return '已完成'
  return '进行中'
}

// 获取媒体文件列表
const getMediaFiles = (jsonStr: string): MediaAttachment[] => {
  if (!jsonStr) return []
  try {
    return JSON.parse(jsonStr)
  } catch (e) {
    return []
  }
}

// 获取数据项列表
const getDataItems = (): string[] => {
  if (!detail.dataItems) return []
  try {
    return JSON.parse(detail.dataItems)
  } catch (e) {
    return []
  }
}

// 预览图片
const previewImages = (files: MediaAttachment[], index: number) => {
  const images = files.filter(f => f.type === 'image').map(f => f.url)
  if (images.length > 0) {
    showImagePreview({
      images,
      startPosition: index
    })
  }
}

// 格式化日期时间
const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '-'
  return dateStr
}

// 跳转编辑
const goToEdit = () => {
  router.push(`/mobile/research/create?id=${detail.id}`)
}

// 加载详情
const fetchDetail = async () => {
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0
  })

  try {
    const id = Number(route.params.id)
    const result = await deviceResearchApi.getById(id)

    Object.assign(detail, result)

    // 动画显示进度
    setTimeout(() => {
      currentRate.value = result.researchProgress || 0
    }, 100)

    closeToast()
  } catch (error: any) {
    closeToast()
    showToast(error.message || '加载失败')
    router.back()
  }
}

// 初始化
onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.research-detail {
  padding: 16px 0;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.progress-card {
  background: linear-gradient(135deg, #1989fa 0%, #40a9ff 100%);
  margin: 16px;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: #fff;
}

.progress-circle {
  flex-shrink: 0;
}

.progress-info {
  flex: 1;
}

.progress-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}

.progress-status {
  font-size: 14px;
  opacity: 0.9;
}

:deep(.van-cell-group) {
  margin-bottom: 12px;
}

:deep(.van-collapse-item__content) {
  padding: 0;
}

.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.van-image) {
  border-radius: 8px;
  cursor: pointer;
}

.material-tags,
.data-item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.remark-text,
.detail-text {
  white-space: pre-wrap;
  word-break: break-word;
  color: #646566;
  font-size: 14px;
}

.action-bar {
  padding: 16px;
}
</style>
