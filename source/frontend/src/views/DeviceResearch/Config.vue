<template>
  <div class="device-research-config">
    <el-card class="header-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon><Setting /></el-icon>
            <span>设备调研选项配置</span>
          </div>
        </div>
      </template>
      <p class="header-desc">
        管理设备调研表单中的下拉选项，包括设备厂商、接口类型、控制器品牌和采集数据项。
      </p>
    </el-card>

    <el-card class="config-card" shadow="never">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="设备厂商" name="manufacturer">
          <div class="option-config">
            <div class="config-header">
              <span class="config-title">设备厂商选项</span>
              <el-button type="primary" size="small" @click="handleAddOption('manufacturer')">
                <el-icon><Plus /></el-icon>
                新增
              </el-button>
            </div>
            <el-table :data="options.manufacturer" border style="width: 100%">
              <el-table-column prop="value" label="选项值">
                <template #default="{ row, $index }">
                  <el-input v-if="editingIndex.manufacturer === $index" v-model="editingValue" size="small" />
                  <span v-else>{{ row }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" align="center">
                <template #default="{ row, $index }">
                  <template v-if="editingIndex.manufacturer === $index">
                    <el-button type="success" size="small" @click="handleSaveEdit('manufacturer', $index)">保存</el-button>
                    <el-button size="small" @click="handleCancelEdit('manufacturer')">取消</el-button>
                  </template>
                  <template v-else>
                    <el-button type="primary" size="small" link @click="handleEditOption('manufacturer', $index, row)">编辑</el-button>
                    <el-button type="danger" size="small" link @click="handleDeleteOption('manufacturer', $index)">删除</el-button>
                  </template>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="接口类型" name="interfaceType">
          <div class="option-config">
            <div class="config-header">
              <span class="config-title">接口类型选项</span>
              <el-button type="primary" size="small" @click="handleAddOption('interfaceType')">
                <el-icon><Plus /></el-icon>
                新增
              </el-button>
            </div>
            <el-table :data="options.interfaceType" border style="width: 100%">
              <el-table-column prop="value" label="选项值">
                <template #default="{ row, $index }">
                  <el-input v-if="editingIndex.interfaceType === $index" v-model="editingValue" size="small" />
                  <span v-else>{{ row }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" align="center">
                <template #default="{ row, $index }">
                  <template v-if="editingIndex.interfaceType === $index">
                    <el-button type="success" size="small" @click="handleSaveEdit('interfaceType', $index)">保存</el-button>
                    <el-button size="small" @click="handleCancelEdit('interfaceType')">取消</el-button>
                  </template>
                  <template v-else>
                    <el-button type="primary" size="small" link @click="handleEditOption('interfaceType', $index, row)">编辑</el-button>
                    <el-button type="danger" size="small" link @click="handleDeleteOption('interfaceType', $index)">删除</el-button>
                  </template>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="控制器品牌" name="controllerBrand">
          <div class="option-config">
            <div class="config-header">
              <span class="config-title">控制器品牌选项</span>
              <el-button type="primary" size="small" @click="handleAddOption('controllerBrand')">
                <el-icon><Plus /></el-icon>
                新增
              </el-button>
            </div>
            <el-table :data="options.controllerBrand" border style="width: 100%">
              <el-table-column prop="value" label="选项值">
                <template #default="{ row, $index }">
                  <el-input v-if="editingIndex.controllerBrand === $index" v-model="editingValue" size="small" />
                  <span v-else>{{ row }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" align="center">
                <template #default="{ row, $index }">
                  <template v-if="editingIndex.controllerBrand === $index">
                    <el-button type="success" size="small" @click="handleSaveEdit('controllerBrand', $index)">保存</el-button>
                    <el-button size="small" @click="handleCancelEdit('controllerBrand')">取消</el-button>
                  </template>
                  <template v-else>
                    <el-button type="primary" size="small" link @click="handleEditOption('controllerBrand', $index, row)">编辑</el-button>
                    <el-button type="danger" size="small" link @click="handleDeleteOption('controllerBrand', $index)">删除</el-button>
                  </template>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="数据项" name="dataItems">
          <div class="option-config">
            <div class="config-header">
              <span class="config-title">采集数据项选项</span>
              <el-button type="primary" size="small" @click="handleAddOption('dataItems')">
                <el-icon><Plus /></el-icon>
                新增
              </el-button>
            </div>
            <el-table :data="options.dataItems" border style="width: 100%">
              <el-table-column prop="value" label="选项值">
                <template #default="{ row, $index }">
                  <el-input v-if="editingIndex.dataItems === $index" v-model="editingValue" size="small" />
                  <span v-else>{{ row }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" align="center">
                <template #default="{ row, $index }">
                  <template v-if="editingIndex.dataItems === $index">
                    <el-button type="success" size="small" @click="handleSaveEdit('dataItems', $index)">保存</el-button>
                    <el-button size="small" @click="handleCancelEdit('dataItems')">取消</el-button>
                  </template>
                  <template v-else>
                    <el-button type="primary" size="small" link @click="handleEditOption('dataItems', $index, row)">编辑</el-button>
                    <el-button type="danger" size="small" link @click="handleDeleteOption('dataItems', $index)">删除</el-button>
                  </template>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 新增弹窗 -->
    <el-dialog v-model="addDialogVisible" title="新增选项" width="400px">
      <el-form>
        <el-form-item label="选项值">
          <el-input v-model="newOptionValue" placeholder="请输入选项值" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting, Plus } from '@element-plus/icons-vue'
import { deviceResearchApi, type DeviceResearchOptions } from '@/api/deviceResearch'

type OptionKey = 'manufacturer' | 'interfaceType' | 'controllerBrand' | 'dataItems'

const activeTab = ref<OptionKey>('manufacturer')
const loading = ref(false)

const options = reactive<DeviceResearchOptions>({
  manufacturer: [],
  interfaceType: [],
  controllerBrand: [],
  dataItems: []
})

const editingIndex = reactive<Record<OptionKey, number>>({
  manufacturer: -1,
  interfaceType: -1,
  controllerBrand: -1,
  dataItems: -1
})

const editingValue = ref('')
const addDialogVisible = ref(false)
const newOptionValue = ref('')
const currentAddKey = ref<OptionKey>('manufacturer')

const loadOptions = async () => {
  loading.value = true
  try {
    const result = await deviceResearchApi.getOptions()
    options.manufacturer = result.manufacturer || []
    options.interfaceType = result.interfaceType || []
    options.controllerBrand = result.controllerBrand || []
    options.dataItems = result.dataItems || []
  } catch (error) {
    ElMessage.error('加载选项配置失败')
  } finally {
    loading.value = false
  }
}

const handleEditOption = (key: OptionKey, index: number, value: string) => {
  editingIndex[key] = index
  editingValue.value = value
}

const handleCancelEdit = (key: OptionKey) => {
  editingIndex[key] = -1
  editingValue.value = ''
}

const handleSaveEdit = async (key: OptionKey, index: number) => {
  if (!editingValue.value.trim()) {
    ElMessage.warning('选项值不能为空')
    return
  }

  options[key][index] = editingValue.value.trim()
  editingIndex[key] = -1

  try {
    await deviceResearchApi.updateOptions(key, options[key])
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
    await loadOptions()
  }
}

const handleAddOption = (key: OptionKey) => {
  currentAddKey.value = key
  newOptionValue.value = ''
  addDialogVisible.value = true
}

const handleConfirmAdd = async () => {
  if (!newOptionValue.value.trim()) {
    ElMessage.warning('选项值不能为空')
    return
  }

  options[currentAddKey.value].push(newOptionValue.value.trim())
  addDialogVisible.value = false

  try {
    await deviceResearchApi.updateOptions(currentAddKey.value, options[currentAddKey.value])
    ElMessage.success('添加成功')
  } catch (error) {
    ElMessage.error('添加失败')
    await loadOptions()
  }
}

const handleDeleteOption = async (key: OptionKey, index: number) => {
  options[key].splice(index, 1)

  try {
    await deviceResearchApi.updateOptions(key, options[key])
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.error('删除失败')
    await loadOptions()
  }
}

onMounted(() => {
  loadOptions()
})
</script>

<style scoped>
.device-research-config {
  padding: 8px;
}

.header-card,
.config-card {
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

.option-config {
  padding: 16px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.config-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}
</style>
