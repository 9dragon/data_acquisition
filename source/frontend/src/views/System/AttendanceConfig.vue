<template>
  <div class="attendance-config">
    <!-- 页面头部 -->
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon><Clock /></el-icon>
            <span>签到配置管理</span>
          </div>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存配置
          </el-button>
        </div>
      </template>
      <p class="header-desc">
        配置每日打卡时段、水印样式和导出选项
      </p>
    </el-card>

    <!-- 打卡时段配置 -->
    <el-card class="config-card">
      <template #header>
        <div class="card-title">
          <el-icon><Clock /></el-icon>
          <span>打卡时段配置</span>
        </div>
      </template>

      <el-form :model="checkTimesConfig" label-width="120px">
        <el-form-item label="每日打卡次数">
          <el-input-number v-model="checkTimesConfig.dailyTimes" :min="1" :max="10" />
        </el-form-item>

        <el-divider>时段详情</el-divider>

        <div
          v-for="(shift, index) in checkTimesConfig.shifts"
          :key="index"
          class="shift-config-item"
        >
          <div class="shift-header">
            <span class="shift-title">时段 {{ index + 1 }}</span>
            <el-button
              v-if="checkTimesConfig.shifts.length > 1"
              type="danger"
              text
              @click="removeShift(index)"
            >
              删除
            </el-button>
          </div>

          <el-form-item :label="`时段${index + 1}名称`">
            <el-input v-model="shift.name" placeholder="如: 上班打卡" />
          </el-form-item>

          <el-form-item label="打卡时间段">
            <el-time-picker
              v-model="shift.startTime"
              placeholder="开始时间"
              format="HH:mm"
              value-format="HH:mm"
            />
            <span class="time-separator">至</span>
            <el-time-picker
              v-model="shift.endTime"
              placeholder="结束时间"
              format="HH:mm"
              value-format="HH:mm"
            />
          </el-form-item>

          <el-form-item label="迟到时间点">
            <el-time-picker
              v-model="shift.lateTime"
              placeholder="迟到判定时间"
              format="HH:mm"
              value-format="HH:mm"
            />
            <span class="hint">超过此时间打卡将被标记为迟到</span>
          </el-form-item>
        </div>

        <el-button type="primary" plain @click="addShift" :disabled="checkTimesConfig.shifts.length >= 10">
          + 添加时段
        </el-button>
      </el-form>
    </el-card>

    <!-- 水印配置 -->
    <el-card class="config-card">
      <template #header>
        <div class="card-title">
          <el-icon><Picture /></el-icon>
          <span>水印配置</span>
        </div>
      </template>

      <el-form :model="watermarkConfig" label-width="120px">
        <el-form-item label="启用水印">
          <el-switch v-model="watermarkConfig.enabled" />
        </el-form-item>

        <template v-if="watermarkConfig.enabled">
          <el-form-item label="水印位置">
            <el-select v-model="watermarkConfig.position">
              <el-option label="左上角" value="top_left" />
              <el-option label="右上角" value="top_right" />
              <el-option label="左下角" value="bottom_left" />
              <el-option label="右下角" value="bottom_right" />
              <el-option label="居中" value="center" />
            </el-select>
          </el-form-item>

          <el-form-item label="字体大小">
            <el-input-number v-model="watermarkConfig.fontSize" :min="10" :max="40" />
          </el-form-item>

          <el-form-item label="字体颜色">
            <el-color-picker v-model="watermarkConfig.color" />
          </el-form-item>

          <el-form-item label="透明度">
            <el-slider v-model="watermarkConfig.alpha" :min="0" :max="1" :step="0.1" />
          </el-form-item>

          <el-form-item label="背景颜色">
            <el-color-picker v-model="watermarkConfig.backgroundColor" />
          </el-form-item>

          <el-divider>图标配置</el-divider>

          <el-form-item label="时间图标">
            <el-input v-model="watermarkConfig.timeIcon" placeholder="🕐" maxlength="2" style="width: 120px" />
          </el-form-item>

          <el-form-item label="位置图标">
            <el-input v-model="watermarkConfig.locationIcon" placeholder="📍" maxlength="2" style="width: 120px" />
          </el-form-item>

          <el-form-item label="用户图标">
            <el-input v-model="watermarkConfig.userIcon" placeholder="👤" maxlength="2" style="width: 120px" />
          </el-form-item>

          <el-divider>显示内容</el-divider>

          <el-form-item label="显示内容">
            <el-checkbox-group v-model="watermarkContent">
              <el-checkbox label="showTime">时间</el-checkbox>
              <el-checkbox label="showLocation">位置</el-checkbox>
              <el-checkbox label="showUser">用户信息</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </template>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Clock, Picture } from '@element-plus/icons-vue'
import { systemConfigApi } from '@/api/systemConfig'

const saving = ref(false)

// 打卡时段配置
const checkTimesConfig = reactive({
  dailyTimes: 3,
  shifts: [
    { name: '上班打卡', startTime: '08:00', endTime: '09:30', lateTime: '09:00' },
    { name: '午间打卡', startTime: '12:00', endTime: '13:30', lateTime: '13:00' },
    { name: '下班打卡', startTime: '17:30', endTime: '19:00', lateTime: '18:00' }
  ]
})

// 水印配置
const watermarkConfig = reactive({
  enabled: true,
  position: 'bottom_right',
  fontSize: 16,
  color: '#FFFFFF',
  alpha: 0.8,
  backgroundColor: '#000000',
  showTime: true,
  showLocation: true,
  showUser: true,
  timeIcon: '🕐',
  locationIcon: '📍',
  userIcon: '👤'
})

const watermarkContent = computed({
  get: () => {
    const items: string[] = []
    if (watermarkConfig.showTime) items.push('showTime')
    if (watermarkConfig.showLocation) items.push('showLocation')
    if (watermarkConfig.showUser) items.push('showUser')
    return items
  },
  set: (val: string[]) => {
    watermarkConfig.showTime = val.includes('showTime')
    watermarkConfig.showLocation = val.includes('showLocation')
    watermarkConfig.showUser = val.includes('showUser')
  }
})

// 添加时段
const addShift = () => {
  checkTimesConfig.shifts.push({
    name: `时段${checkTimesConfig.shifts.length + 1}`,
    startTime: '00:00',
    endTime: '23:59',
    lateTime: '09:00'
  })
  checkTimesConfig.dailyTimes = checkTimesConfig.shifts.length
}

// 删除时段
const removeShift = (index: number) => {
  checkTimesConfig.shifts.splice(index, 1)
  checkTimesConfig.dailyTimes = checkTimesConfig.shifts.length
}

// 保存配置
const handleSave = async () => {
  saving.value = true
  try {
    await systemConfigApi.updateConfig('attendance.check_times', checkTimesConfig)
    await systemConfigApi.updateConfig('attendance.watermark', watermarkConfig)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 加载配置
const loadConfigs = async () => {
  try {
    const checkTimes = await systemConfigApi.getConfigJson('attendance.check_times')
    const watermark = await systemConfigApi.getConfigJson('attendance.watermark')

    if (checkTimes) {
      Object.assign(checkTimesConfig, checkTimes)
    }
    if (watermark) {
      Object.assign(watermarkConfig, watermark)
    }
  } catch (error) {
    console.error('加载配置失败:', error)
    ElMessage.error('加载配置失败')
  }
}

onMounted(() => {
  loadConfigs()
})
</script>

<style scoped>
.attendance-config {
  padding: 8px;
}

.header-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.header-desc {
  margin: 0;
  padding: 0;
  color: #666;
  font-size: 14px;
}

.config-card {
  margin-bottom: 16px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.shift-config-item {
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.shift-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.shift-title {
  font-weight: 600;
  color: #333;
}

.time-separator {
  margin: 0 8px;
  color: #999;
}

.hint {
  margin-left: 8px;
  font-size: 12px;
  color: #999;
}
</style>
