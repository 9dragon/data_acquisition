<template>
  <div class="manager-dashboard">
    <!-- 顶部聚合统计 -->
    <div class="aggregate-card" v-if="overview">
      <div class="header-row">
        <div class="title">
          <van-icon name="bar-chart-o" />
          <span>今日签到概览</span>
        </div>
        <div class="date-text">{{ todayText }}</div>
      </div>
      <div class="stat-grid">
        <div class="stat-item">
          <div class="stat-value">{{ overview.aggregate.totalProjects }}</div>
          <div class="stat-label">项目数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ overview.aggregate.totalMembers }}</div>
          <div class="stat-label">总人数</div>
        </div>
        <div class="stat-item success">
          <div class="stat-value">{{ overview.aggregate.checkedInMembers }}</div>
          <div class="stat-label">已签到</div>
        </div>
        <div class="stat-item warning">
          <div class="stat-value">{{ overview.aggregate.pendingMembers }}</div>
          <div class="stat-label">未签到</div>
        </div>
        <div class="stat-item danger">
          <div class="stat-value">{{ overview.aggregate.lateMembers }}</div>
          <div class="stat-label">迟到</div>
        </div>
      </div>
      <div class="current-shift" v-if="overview.currentShift">
        <van-icon name="clock-o" />
        <span>当前班次：{{ overview.currentShift.name }}（{{ overview.currentShift.startTime }} - {{ overview.currentShift.endTime }}）</span>
      </div>
    </div>

    <!-- 项目切换 -->
    <van-tabs v-model:active="activeTab" sticky @change="onTabChange">
      <van-tab title="全部项目" name="all" />
      <van-tab
        v-for="p in overview?.projects || []"
        :key="p.projectId"
        :title="p.projectName"
        :name="String(p.projectId)"
      />
    </van-tabs>

    <!-- 全部项目：按项目卡片展示 -->
    <div v-if="activeTab === 'all'" class="project-list">
      <div
        v-for="p in overview?.projects || []"
        :key="p.projectId"
        class="project-card"
        @click="enterProject(p.projectId)"
      >
        <div class="project-header">
          <div class="project-name">
            <span class="name-text">{{ p.projectName }}</span>
            <span class="project-code" v-if="p.projectCode">（{{ p.projectCode }}）</span>
          </div>
          <van-icon name="arrow" />
        </div>
        <div class="project-stats">
          <div class="progress-wrap">
            <van-progress
              :percentage="p.checkInRate"
              :color="progressColor(p.checkInRate)"
              stroke-width="8"
              :show-pivot="false"
            />
          </div>
          <div class="stat-row">
            <span class="total">共 {{ p.totalMembers }} 人</span>
            <span class="checked">已签 {{ p.checkedInMembers }}</span>
            <span class="pending" v-if="p.pendingMembers > 0">未签 {{ p.pendingMembers }}</span>
            <span class="late" v-if="p.lateMembers > 0">迟到 {{ p.lateMembers }}</span>
          </div>
        </div>
      </div>
      <van-empty v-if="!overview?.projects?.length && !loading" description="暂无负责的项目" />
    </div>

    <!-- 单项目：成员明细 -->
    <div v-else class="member-detail">
      <div class="filter-bar">
        <van-dropdown-menu>
          <van-dropdown-item v-model="filterStatus" :options="statusFilterOptions" />
        </van-dropdown-menu>
      </div>

      <van-pull-refresh v-model="refreshing" @refresh="onRefreshMembers">
        <div class="member-list">
          <div
            v-for="m in filteredMembers"
            :key="m.userId"
            class="member-item"
          >
            <div class="member-top">
              <div class="avatar">
                {{ m.userName?.charAt(0) || '?' }}
              </div>
              <div class="member-info">
                <div class="member-name">
                  {{ m.userName }}
                  <van-tag plain type="primary" v-if="m.role === 'MANAGER'">经理</van-tag>
                </div>
                <div class="member-phone" v-if="m.phone">
                  <van-icon name="phone-o" /> {{ m.phone }}
                </div>
              </div>
              <div class="member-status">
                <van-tag :type="statusTagType(m.status)">
                  {{ statusText(m.status) }}
                </van-tag>
              </div>
            </div>
            <div class="member-shifts" v-if="m.records.length > 0">
              <div v-for="rec in m.records" :key="rec.id" class="shift-tag">
                <span class="shift-name">{{ rec.shiftName || '打卡' }}</span>
                <span class="shift-time">{{ rec.checkInTime }}</span>
                <van-tag :type="rec.status === 'LATE' ? 'warning' : 'success'" size="mini">
                  {{ rec.status === 'LATE' ? '迟到' : '正常' }}
                </van-tag>
              </div>
            </div>
            <div class="member-empty" v-else>
              <van-icon name="warning-o" /> 今日尚未签到
            </div>
          </div>
        </div>
        <van-empty
          v-if="!filteredMembers.length && !loading"
          :description="emptyText"
        />
      </van-pull-refresh>
    </div>

    <!-- 最新签到流水（全部项目视图） -->
    <div v-if="activeTab === 'all' && overview?.recentCheckIns?.length" class="recent-section">
      <div class="section-title">
        <van-icon name="comment-o" /> 最新签到
      </div>
      <div class="recent-list">
        <div
          v-for="rec in overview.recentCheckIns"
          :key="rec.recordId"
          class="recent-item"
        >
          <div class="recent-avatar" @click="previewPhoto(rec.photoUrl)" v-if="rec.photoUrl">
            <van-image width="40" height="40" round :src="rec.photoUrl" fit="cover" />
          </div>
          <div class="recent-avatar text-avatar" v-else>
            {{ rec.userName?.charAt(0) || '?' }}
          </div>
          <div class="recent-info">
            <div class="recent-line1">
              <span class="recent-name">{{ rec.userName }}</span>
              <van-tag :type="rec.status === 'LATE' ? 'warning' : 'success'" size="mini">
                {{ rec.status === 'LATE' ? '迟到' : '正常' }}
              </van-tag>
            </div>
            <div class="recent-line2">
              <span class="recent-time">{{ formatTime(rec.checkInTime) }}</span>
              <span class="recent-shift" v-if="rec.shiftName">{{ rec.shiftName }}</span>
            </div>
            <div class="recent-line3" v-if="rec.projectName">
              <van-icon name="apps-o" /> {{ rec.projectName }}
            </div>
            <div class="recent-line3" v-if="rec.location">
              <van-icon name="location-o" /> {{ rec.location }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 刷新中提示 -->
    <div class="refresh-hint" v-if="loading">
      <van-loading size="16px" /> 加载中...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { showToast } from 'vant'
import { attendanceApi, type ManagerOverview, type MemberStatus } from '@/api/attendance'
import { PollingManager } from '@/utils/pollingManager'
import { previewImage } from '@/utils/dingtalk'

const overview = ref<ManagerOverview | null>(null)
const members = ref<MemberStatus[]>([])
const activeTab = ref<string>('all')
const filterStatus = ref<string>('')
const loading = ref(false)
const refreshing = ref(false)

const statusFilterOptions = [
  { text: '全部状态', value: '' },
  { text: '已签到', value: 'CHECKED' },
  { text: '未签到', value: 'PENDING' },
  { text: '迟到', value: 'LATE' }
]

const todayText = computed(() => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
  return `${yyyy}-${mm}-${dd} ${week}`
})

const filteredMembers = computed(() => {
  if (!filterStatus.value) return members.value
  return members.value.filter(m => m.status === filterStatus.value)
})

const emptyText = computed(() => {
  if (filterStatus.value === 'PENDING') return '所有人均已签到'
  if (filterStatus.value === 'CHECKED') return '暂无已签到成员'
  if (filterStatus.value === 'LATE') return '暂无迟到成员'
  return '项目暂无成员'
})

const progressColor = (rate: number) => {
  if (rate >= 80) return '#07c160'
  if (rate >= 50) return '#ff976a'
  return '#ee0a24'
}

const statusTagType = (status: string): 'success' | 'warning' | 'danger' => {
  if (status === 'CHECKED') return 'success'
  if (status === 'LATE') return 'warning'
  return 'danger'
}

const statusText = (status: string) => {
  if (status === 'CHECKED') return '已签到'
  if (status === 'LATE') return '迟到'
  return '未签到'
}

const formatTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return ''
  const d = new Date(dateTimeStr.replace(' ', 'T'))
  if (isNaN(d.getTime())) return dateTimeStr
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

const previewPhoto = (url?: string) => {
  if (url) previewImage([url], url)
}

const fetchOverview = async () => {
  try {
    overview.value = await attendanceApi.managerOverview()
  } catch (e) {
    console.error('加载经理概览失败', e)
  }
}

const fetchMembers = async () => {
  if (activeTab.value === 'all') return
  loading.value = true
  try {
    members.value = await attendanceApi.managerMembersStatus(Number(activeTab.value))
  } catch (e) {
    console.error('加载成员状态失败', e)
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

const enterProject = (projectId: number) => {
  activeTab.value = String(projectId)
  onTabChange(activeTab.value)
}

const onTabChange = (name: string | number) => {
  filterStatus.value = ''
  if (name === 'all') {
    fetchOverview()
  } else {
    fetchMembers()
  }
}

const onRefreshMembers = async () => {
  refreshing.value = true
  try {
    if (activeTab.value === 'all') {
      await fetchOverview()
    } else {
      await fetchMembers()
    }
  } finally {
    refreshing.value = false
  }
}

// 轮询：每 25 秒刷新当前视图
let polling: PollingManager | null = null

onMounted(async () => {
  await fetchOverview()
  polling = new PollingManager(async () => {
    if (activeTab.value === 'all') {
      await fetchOverview()
    } else {
      await fetchMembers()
    }
  }, { interval: 25000, immediate: false })
  polling.start()
})

onBeforeUnmount(() => {
  polling?.destroy()
})
</script>

<style scoped>
.manager-dashboard {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 24px;
}

.aggregate-card {
  margin: 12px;
  background: linear-gradient(135deg, #1989fa 0%, #4ba7f5 100%);
  border-radius: 12px;
  padding: 16px;
  color: #fff;
  box-shadow: 0 2px 8px rgba(25, 137, 250, 0.2);
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.title :deep(.van-icon) {
  margin-right: 6px;
}

.date-text {
  font-size: 12px;
  opacity: 0.9;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 22px;
  font-weight: bold;
}

.stat-item.success .stat-value { color: #fff; }
.stat-item.warning .stat-value { color: #ffe58f; }
.stat-item.danger .stat-value { color: #ffccc7; }

.stat-label {
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.9;
}

.current-shift {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 12px;
  display: flex;
  align-items: center;
}

.current-shift :deep(.van-icon) {
  margin-right: 6px;
}

.project-list {
  padding: 12px;
}

.project-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.project-name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.name-text {
  margin-right: 4px;
}

.project-code {
  font-size: 12px;
  color: #999;
  font-weight: normal;
}

.progress-wrap {
  margin-bottom: 6px;
}

.stat-row {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #666;
  flex-wrap: wrap;
}

.stat-row .checked { color: #07c160; }
.stat-row .pending { color: #ff976a; }
.stat-row .late { color: #ee0a24; }

.member-detail {
  padding-bottom: 12px;
}

.filter-bar {
  background: #fff;
}

.member-list {
  padding: 12px;
}

.member-item {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
}

.member-top {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1989fa;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  margin-right: 10px;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
}

.member-phone {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.member-status {
  margin-left: 8px;
}

.member-shifts {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
}

.shift-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 12px;
}

.shift-name {
  color: #1989fa;
  font-weight: bold;
}

.shift-time {
  color: #333;
}

.member-empty {
  margin-top: 8px;
  font-size: 12px;
  color: #ff976a;
  display: flex;
  align-items: center;
  gap: 4px;
}

.recent-section {
  margin: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.section-title :deep(.van-icon) {
  margin-right: 6px;
  color: #1989fa;
}

.recent-list {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
}

.recent-item {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.recent-item:last-child {
  border-bottom: none;
}

.recent-avatar {
  margin-right: 10px;
  flex-shrink: 0;
}

.text-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #07c160;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

.recent-info {
  flex: 1;
}

.recent-line1 {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.recent-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.recent-line2 {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.recent-time {
  font-weight: bold;
  color: #1989fa;
}

.recent-line3 {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
}

.refresh-hint {
  text-align: center;
  padding: 12px;
  color: #999;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
</style>
