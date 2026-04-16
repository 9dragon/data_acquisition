<template>
  <div class="attendance-config">
    <!-- Tab 页 -->
    <el-tabs v-model="activeTab">
      <!-- 打卡签到配置 -->
      <el-tab-pane label="打卡签到" name="attendance">
        <div class="tab-toolbar">
          <el-button type="primary" @click="saveAttendanceConfig" :loading="attendanceSaving">
            保存配置
          </el-button>
        </div>

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
      </el-tab-pane>

      <!-- 问题管理配置 -->
      <el-tab-pane label="问题管理" name="issue">
        <div class="tab-toolbar">
          <el-button type="primary" @click="saveIssueConfig" :loading="issueSaving">
            保存配置
          </el-button>
        </div>

        <el-card class="config-card">
          <template #header>
            <div class="card-title">
              <el-icon><Warning /></el-icon>
              <span>问题类型配置</span>
            </div>
          </template>

          <p class="config-desc">配置系统中可用的问题类型，上报问题时从以下类型中选择</p>

          <el-table :data="issueTypes" border stripe style="width: 100%">
            <el-table-column label="类型编码" width="180">
              <template #default="{ row }">
                <el-input v-if="row._editing" v-model="row.value" placeholder="如: device" />
                <span v-else class="type-code">{{ row.value }}</span>
              </template>
            </el-table-column>
            <el-table-column label="类型名称" width="200">
              <template #default="{ row }">
                <el-input v-if="row._editing" v-model="row.label" placeholder="如: 设备故障" />
                <span v-else>{{ row.label }}</span>
              </template>
            </el-table-column>
            <el-table-column label="描述">
              <template #default="{ row }">
                <el-input v-if="row._editing" v-model="row.description" placeholder="类型说明（选填）" />
                <span v-else>{{ row.description || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="排序" width="100" align="center">
              <template #default="{ row }">
                <el-input-number v-if="row._editing" v-model="row.sort" :min="0" :max="99" size="small" style="width: 80px" />
                <span v-else>{{ row.sort }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" align="center">
              <template #default="{ row, $index }">
                <template v-if="row._editing">
                  <el-button link type="primary" @click="row._editing = false">完成</el-button>
                  <el-button link type="danger" @click="removeIssueType($index)">删除</el-button>
                </template>
                <template v-else>
                  <el-button link type="primary" @click="row._editing = true">编辑</el-button>
                  <el-button link type="danger" @click="removeIssueType($index)">删除</el-button>
                </template>
              </template>
            </el-table-column>
          </el-table>

          <el-button type="primary" plain style="margin-top: 12px" @click="addIssueType">
            + 添加类型
          </el-button>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting, Clock, Picture, Warning } from '@element-plus/icons-vue'
import { systemConfigApi } from '@/api/systemConfig'

const activeTab = ref('attendance')

// ==================== 签到配置 ====================
const attendanceSaving = ref(false)

const checkTimesConfig = reactive({
  dailyTimes: 3,
  shifts: [
    { name: '上班打卡', startTime: '08:00', endTime: '09:30', lateTime: '09:00' },
    { name: '午间打卡', startTime: '12:00', endTime: '13:30', lateTime: '13:00' },
    { name: '下班打卡', startTime: '17:30', endTime: '19:00', lateTime: '18:00' }
  ]
})

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

const addShift = () => {
  checkTimesConfig.shifts.push({
    name: `时段${checkTimesConfig.shifts.length + 1}`,
    startTime: '00:00',
    endTime: '23:59',
    lateTime: '09:00'
  })
  checkTimesConfig.dailyTimes = checkTimesConfig.shifts.length
}

const removeShift = (index: number) => {
  checkTimesConfig.shifts.splice(index, 1)
  checkTimesConfig.dailyTimes = checkTimesConfig.shifts.length
}

const saveAttendanceConfig = async () => {
  attendanceSaving.value = true
  try {
    await systemConfigApi.updateConfig('attendance.check_times', checkTimesConfig)
    await systemConfigApi.updateConfig('attendance.watermark', watermarkConfig)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    attendanceSaving.value = false
  }
}

// ==================== 问题管理配置 ====================
const issueSaving = ref(false)

interface IssueTypeItem {
  value: string
  label: string
  description: string
  sort: number
  _editing?: boolean
}

const issueTypes = ref<IssueTypeItem[]>([])

const addIssueType = () => {
  issueTypes.value.push({
    value: '',
    label: '',
    description: '',
    sort: issueTypes.value.length + 1,
    _editing: true
  })
}

const removeIssueType = (index: number) => {
  issueTypes.value.splice(index, 1)
}

const saveIssueConfig = async () => {
  // 校验
  for (const item of issueTypes.value) {
    if (!item.value || !item.label) {
      ElMessage.warning('类型编码和名称不能为空')
      return
    }
  }
  // 检查编码重复
  const values = issueTypes.value.map(t => t.value)
  if (new Set(values).size !== values.length) {
    ElMessage.warning('类型编码不能重复')
    return
  }

  issueSaving.value = true
  try {
    const data = issueTypes.value.map(({ _editing, ...rest }) => rest)
    await systemConfigApi.updateConfig('issue.types', data)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    issueSaving.value = false
  }
}

// ==================== 加载配置 ====================
const loadConfigs = async () => {
  try {
    const checkTimes = await systemConfigApi.getConfigJson('attendance.check_times')
    const watermark = await systemConfigApi.getConfigJson('attendance.watermark')
    const types = await systemConfigApi.getConfigJson('issue.types')

    if (checkTimes) Object.assign(checkTimesConfig, checkTimes)
    if (watermark) Object.assign(watermarkConfig, watermark)
    if (types && Array.isArray(types)) {
      issueTypes.value = types.map((t: any) => ({ ...t, _editing: false }))
    } else {
      // 默认问题类型
      issueTypes.value = [
        { value: 'device_fault', label: '设备故障', description: '设备运行异常或损坏', sort: 1, _editing: false },
        { value: 'quality', label: '质量问题', description: '产品质量不达标', sort: 2, _editing: false },
        { value: 'safety', label: '安全问题', description: '安全隐患或安全事故', sort: 3, _editing: false },
        { value: 'schedule', label: '进度问题', description: '项目进度延误', sort: 4, _editing: false },
        { value: 'other', label: '其他', description: '其他类型问题', sort: 5, _editing: false }
      ]
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

.tab-toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
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

.config-desc {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
}

.type-code {
  font-family: monospace;
  color: #409eff;
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
