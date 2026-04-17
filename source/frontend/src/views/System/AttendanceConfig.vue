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
            <div class="card-title clickable" @click="toggleCollapse('attendance_shifts')">
              <el-icon><Clock /></el-icon>
              <span>打卡时段配置</span>
              <el-icon class="collapse-icon"><component :is="collapseIcon('attendance_shifts')" /></el-icon>
            </div>
          </template>
          <div v-show="!collapsed['attendance_shifts']">
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
          </div>
        </el-card>

        <!-- 水印配置 -->
        <el-card class="config-card">
          <template #header>
            <div class="card-title clickable" @click="toggleCollapse('attendance_watermark')">
              <el-icon><Picture /></el-icon>
              <span>水印配置</span>
              <el-icon class="collapse-icon"><component :is="collapseIcon('attendance_watermark')" /></el-icon>
            </div>
          </template>
          <div v-show="!collapsed['attendance_watermark']">
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
          </div>
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
            <div class="card-title clickable" @click="toggleCollapse('issue_types')">
              <el-icon><Warning /></el-icon>
              <span>问题类型配置</span>
              <el-icon class="collapse-icon"><component :is="collapseIcon('issue_types')" /></el-icon>
            </div>
          </template>
          <div v-show="!collapsed['issue_types']">
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
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 设备调研配置 -->
      <el-tab-pane label="设备调研" name="deviceResearch">
        <div class="tab-toolbar">
          <el-button type="primary" @click="saveDeviceResearchConfig" :loading="drSaving">
            保存配置
          </el-button>
        </div>

        <el-card class="config-card">
          <template #header>
            <div class="card-title clickable" @click="toggleCollapse('dr_manufacturer')">
              <el-icon><SetUp /></el-icon>
              <span>设备厂商选项</span>
              <el-icon class="collapse-icon"><component :is="collapseIcon('dr_manufacturer')" /></el-icon>
            </div>
          </template>
          <div v-show="!collapsed['dr_manufacturer']">
            <div class="option-list">
              <div v-for="(item, index) in drOptions.manufacturer" :key="index" class="option-item">
                <el-input v-if="drEditing.key === 'manufacturer' && drEditing.index === index"
                  v-model="drEditing.value" size="small" style="flex:1" />
                <span v-else class="option-text">{{ item }}</span>
                <div class="option-actions">
                  <template v-if="drEditing.key === 'manufacturer' && drEditing.index === index">
                    <el-button link type="primary" size="small" @click="drSaveEdit('manufacturer', index)">保存</el-button>
                    <el-button link size="small" @click="drCancelEdit">取消</el-button>
                  </template>
                  <template v-else>
                    <el-button link type="primary" size="small" @click="drStartEdit('manufacturer', index, item)">编辑</el-button>
                    <el-button link type="danger" size="small" @click="drDeleteOption('manufacturer', index)">删除</el-button>
                  </template>
                </div>
              </div>
              <el-button type="primary" plain size="small" @click="drAddOption('manufacturer')">+ 新增</el-button>
            </div>
          </div>
        </el-card>

        <el-card class="config-card">
          <template #header>
            <div class="card-title clickable" @click="toggleCollapse('dr_interfaceType')">
              <el-icon><Connection /></el-icon>
              <span>接口类型选项</span>
              <el-icon class="collapse-icon"><component :is="collapseIcon('dr_interfaceType')" /></el-icon>
            </div>
          </template>
          <div v-show="!collapsed['dr_interfaceType']">
            <div class="option-list">
              <div v-for="(item, index) in drOptions.interfaceType" :key="index" class="option-item">
                <el-input v-if="drEditing.key === 'interfaceType' && drEditing.index === index"
                  v-model="drEditing.value" size="small" style="flex:1" />
                <span v-else class="option-text">{{ item }}</span>
                <div class="option-actions">
                  <template v-if="drEditing.key === 'interfaceType' && drEditing.index === index">
                    <el-button link type="primary" size="small" @click="drSaveEdit('interfaceType', index)">保存</el-button>
                    <el-button link size="small" @click="drCancelEdit">取消</el-button>
                  </template>
                  <template v-else>
                    <el-button link type="primary" size="small" @click="drStartEdit('interfaceType', index, item)">编辑</el-button>
                    <el-button link type="danger" size="small" @click="drDeleteOption('interfaceType', index)">删除</el-button>
                  </template>
                </div>
              </div>
              <el-button type="primary" plain size="small" @click="drAddOption('interfaceType')">+ 新增</el-button>
            </div>
          </div>
        </el-card>

        <el-card class="config-card">
          <template #header>
            <div class="card-title clickable" @click="toggleCollapse('dr_controllerBrand')">
              <el-icon><Cpu /></el-icon>
              <span>控制器品牌选项</span>
              <el-icon class="collapse-icon"><component :is="collapseIcon('dr_controllerBrand')" /></el-icon>
            </div>
          </template>
          <div v-show="!collapsed['dr_controllerBrand']">
            <div class="option-list">
              <div v-for="(item, index) in drOptions.controllerBrand" :key="index" class="option-item">
                <el-input v-if="drEditing.key === 'controllerBrand' && drEditing.index === index"
                  v-model="drEditing.value" size="small" style="flex:1" />
                <span v-else class="option-text">{{ item }}</span>
                <div class="option-actions">
                  <template v-if="drEditing.key === 'controllerBrand' && drEditing.index === index">
                    <el-button link type="primary" size="small" @click="drSaveEdit('controllerBrand', index)">保存</el-button>
                    <el-button link size="small" @click="drCancelEdit">取消</el-button>
                  </template>
                  <template v-else>
                    <el-button link type="primary" size="small" @click="drStartEdit('controllerBrand', index, item)">编辑</el-button>
                    <el-button link type="danger" size="small" @click="drDeleteOption('controllerBrand', index)">删除</el-button>
                  </template>
                </div>
              </div>
              <el-button type="primary" plain size="small" @click="drAddOption('controllerBrand')">+ 新增</el-button>
            </div>
          </div>
        </el-card>

        <el-card class="config-card">
          <template #header>
            <div class="card-title clickable" @click="toggleCollapse('dr_dataItems')">
              <el-icon><DataLine /></el-icon>
              <span>采集数据项选项</span>
              <el-icon class="collapse-icon"><component :is="collapseIcon('dr_dataItems')" /></el-icon>
            </div>
          </template>
          <div v-show="!collapsed['dr_dataItems']">
            <div class="option-list">
              <div v-for="(item, index) in drOptions.dataItems" :key="index" class="option-item">
                <el-input v-if="drEditing.key === 'dataItems' && drEditing.index === index"
                  v-model="drEditing.value" size="small" style="flex:1" />
                <span v-else class="option-text">{{ item }}</span>
                <div class="option-actions">
                  <template v-if="drEditing.key === 'dataItems' && drEditing.index === index">
                    <el-button link type="primary" size="small" @click="drSaveEdit('dataItems', index)">保存</el-button>
                    <el-button link size="small" @click="drCancelEdit">取消</el-button>
                  </template>
                  <template v-else>
                    <el-button link type="primary" size="small" @click="drStartEdit('dataItems', index, item)">编辑</el-button>
                    <el-button link type="danger" size="small" @click="drDeleteOption('dataItems', index)">删除</el-button>
                  </template>
                </div>
              </div>
              <el-button type="primary" plain size="small" @click="drAddOption('dataItems')">+ 新增</el-button>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 设备调研新增选项弹窗 -->
    <el-dialog v-model="drAddVisible" title="新增选项" width="400px">
      <el-form>
        <el-form-item label="选项值">
          <el-input v-model="drAddValue" placeholder="请输入选项值" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="drAddVisible = false">取消</el-button>
        <el-button type="primary" @click="drConfirmAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting, Clock, Picture, Warning, SetUp, Connection, Cpu, DataLine, ArrowRight, ArrowDown } from '@element-plus/icons-vue'
import { systemConfigApi } from '@/api/systemConfig'
import { deviceResearchApi } from '@/api/deviceResearch'

// ==================== 卡片折叠状态 ====================
const allCardKeys = [
  'attendance_shifts', 'attendance_watermark',
  'issue_types',
  'dr_manufacturer', 'dr_interfaceType', 'dr_controllerBrand', 'dr_dataItems'
]
const collapsed = reactive<Record<string, boolean>>({})
const toggleCollapse = (key: string) => { collapsed[key] = !collapsed[key] }
const collapseIcon = (key: string) => collapsed[key] ? ArrowRight : ArrowDown

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

// ==================== 设备调研配置 ====================
type DROptionKey = 'manufacturer' | 'interfaceType' | 'controllerBrand' | 'dataItems'

const drSaving = ref(false)
const drOptions = reactive<Record<DROptionKey, string[]>>({
  manufacturer: [],
  interfaceType: [],
  controllerBrand: [],
  dataItems: []
})
const drEditing = reactive<{ key: DROptionKey | '', index: number, value: string }>({
  key: '', index: -1, value: ''
})
const drAddVisible = ref(false)
const drAddValue = ref('')
const drAddKey = ref<DROptionKey>('manufacturer')

const drStartEdit = (key: DROptionKey, index: number, value: string) => {
  drEditing.key = key
  drEditing.index = index
  drEditing.value = value
}

const drCancelEdit = () => {
  drEditing.key = ''
  drEditing.index = -1
  drEditing.value = ''
}

const drSaveEdit = async (key: DROptionKey, index: number) => {
  if (!drEditing.value.trim()) {
    ElMessage.warning('选项值不能为空')
    return
  }
  drOptions[key][index] = drEditing.value.trim()
  drEditing.key = ''
  try {
    await deviceResearchApi.updateOptions(key, drOptions[key])
    ElMessage.success('保存成功')
  } catch {
    ElMessage.error('保存失败')
    await loadDROptions()
  }
}

const drAddOption = (key: DROptionKey) => {
  drAddKey.value = key
  drAddValue.value = ''
  drAddVisible.value = true
}

const drConfirmAdd = async () => {
  if (!drAddValue.value.trim()) {
    ElMessage.warning('选项值不能为空')
    return
  }
  drOptions[drAddKey.value].push(drAddValue.value.trim())
  drAddVisible.value = false
  try {
    await deviceResearchApi.updateOptions(drAddKey.value, drOptions[drAddKey.value])
    ElMessage.success('添加成功')
  } catch {
    ElMessage.error('添加失败')
    await loadDROptions()
  }
}

const drDeleteOption = async (key: DROptionKey, index: number) => {
  drOptions[key].splice(index, 1)
  try {
    await deviceResearchApi.updateOptions(key, drOptions[key])
    ElMessage.success('删除成功')
  } catch {
    ElMessage.error('删除失败')
    await loadDROptions()
  }
}

const saveDeviceResearchConfig = async () => {
  drSaving.value = true
  try {
    await Promise.all([
      deviceResearchApi.updateOptions('manufacturer', drOptions.manufacturer),
      deviceResearchApi.updateOptions('interfaceType', drOptions.interfaceType),
      deviceResearchApi.updateOptions('controllerBrand', drOptions.controllerBrand),
      deviceResearchApi.updateOptions('dataItems', drOptions.dataItems)
    ])
    ElMessage.success('保存成功')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    drSaving.value = false
  }
}

const loadDROptions = async () => {
  try {
    const result = await deviceResearchApi.getOptions()
    drOptions.manufacturer = result.manufacturer || []
    drOptions.interfaceType = result.interfaceType || []
    drOptions.controllerBrand = result.controllerBrand || []
    drOptions.dataItems = result.dataItems || []
  } catch (error) {
    console.error('加载设备调研选项失败:', error)
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

onMounted(async () => {
  await Promise.all([loadConfigs(), loadDROptions()])
  // 检测是否有纵向滚动条，有则默认收缩所有卡片
  await nextTick()
  if (document.documentElement.scrollHeight > document.documentElement.clientHeight) {
    allCardKeys.forEach(key => { collapsed[key] = true })
  }
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

.card-title.clickable {
  cursor: pointer;
  user-select: none;
}

.collapse-icon {
  transition: transform 0.2s;
  color: #909399;
  margin-left: auto;
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

.option-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.option-text {
  flex: 1;
  font-size: 14px;
}

.option-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
</style>
