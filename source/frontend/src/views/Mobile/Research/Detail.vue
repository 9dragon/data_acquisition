<template>
  <div class="research-detail">
    <!-- 基本信息 -->
    <van-cell-group inset title="基本信息">
      <van-cell title="设备名称" :value="detail.deviceName" />
      <van-cell title="设备型号" :value="detail.deviceModel" />
      <van-cell title="制造厂家" :value="detail.manufacturer" />
      <van-cell title="所属车间" :value="detail.workshop" />
      <van-cell title="安装位置" :value="detail.location" />
    </van-cell-group>

    <!-- 设备参数 -->
    <van-cell-group inset title="设备参数">
      <van-cell title="功率" :value="detail.power ? `${detail.power} kW` : '-'" />
      <van-cell title="电压" :value="detail.voltage ? `${detail.voltage} V` : '-'" />
      <van-cell title="电流" :value="detail.current ? `${detail.current} A` : '-'" />
    </van-cell-group>

    <!-- 现场照片 -->
    <van-cell-group inset title="现场照片" v-if="detail.photos && detail.photos.length > 0">
      <van-cell>
        <template #title>
          <van-image-preview-group>
            <van-image
              v-for="(photo, index) in detail.photos"
              :key="index"
              :src="photo"
              width="100"
              height="100"
              fit="cover"
              @click="previewImage(index)"
            />
          </van-image-preview-group>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 备注 -->
    <van-cell-group inset title="备注" v-if="detail.remark">
      <van-cell>
        <template #title>
          <div class="remark-content">{{ detail.remark }}</div>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 状态信息 -->
    <van-cell-group inset title="状态信息">
      <van-cell title="状态">
        <template #value>
          <van-tag :type="detail.status === 'completed' ? 'success' : 'warning'">
            {{ getStatusText(detail.status) }}
          </van-tag>
        </template>
      </van-cell>
      <van-cell title="创建人" :value="detail.creatorName" />
      <van-cell title="创建时间" :value="detail.createdAt" />
      <van-cell title="更新时间" :value="detail.updatedAt" v-if="detail.updatedAt" />
    </van-cell-group>

    <!-- 操作按钮 -->
    <div class="action-bar" v-if="detail.status === 'pending'">
      <van-button type="primary" block @click="goToEdit">
        编辑调研
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showLoadingToast, closeToast } from 'vant'

const router = useRouter()
const route = useRoute()

// 详情数据
const detail = ref<any>({
  id: '',
  deviceName: '',
  deviceModel: '',
  manufacturer: '',
  workshop: '',
  location: '',
  power: '',
  voltage: '',
  current: '',
  remark: '',
  photos: [],
  status: 'pending',
  creatorName: '',
  createdAt: '',
  updatedAt: ''
})

// 获取详情
const fetchDetail = async () => {
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0
  })

  try {
    const id = route.params.id
    // TODO: 调用API获取详情
    // const result = await researchApi.detail(id)

    // 模拟数据
    detail.value = {
      id: id,
      deviceName: '数控机床-001',
      deviceModel: 'CK6140',
      manufacturer: '沈阳机床',
      workshop: '一号车间',
      location: 'A区3号位',
      power: '15',
      voltage: '380',
      current: '32',
      remark: '设备运行正常，需要定期维护',
      photos: [
        'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg',
        'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg'
      ],
      status: 'pending',
      creatorName: '张三',
      createdAt: '2026-04-07 10:00:00',
      updatedAt: '2026-04-07 14:30:00'
    }
  } catch (error) {
    console.error('加载详情失败:', error)
  } finally {
    closeToast()
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待填报',
    completed: '已完成'
  }
  return statusMap[status] || status
}

// 预览图片
const previewImage = (index: number) => {
  // van-image-preview-group 会自动处理预览
}

// 跳转编辑
const goToEdit = () => {
  router.push(`/mobile/research/create?id=${detail.value.id}`)
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

:deep(.van-cell-group) {
  margin-bottom: 12px;
}

:deep(.van-image) {
  margin-right: 8px;
  margin-bottom: 8px;
  border-radius: 8px;
}

.remark-content {
  white-space: pre-wrap;
  word-break: break-word;
  color: #646566;
  font-size: 14px;
}

.action-bar {
  padding: 16px;
}
</style>
